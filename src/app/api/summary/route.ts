import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role || 'STAFF';
        const userId = (session.user as any).id;

        const { searchParams } = new URL(request.url);
        const spaceId = searchParams.get('spaceId');

        let taskWhere: any = {};
        if (spaceId) {
            taskWhere.spaceId = spaceId;
        }

        // Apply strict RBAC for STAFF
        if (!['DIRECTOR', 'ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'CAREHOME_MANAGER'].includes(userRole)) {
            taskWhere = {
                ...taskWhere,
                OR: [
                    { ownerId: userId },
                    { submittedById: userId }
                ]
            };
        }

        const totalTasks = await prisma.task.count({ where: taskWhere });
        const completedTasks = await prisma.task.count({ where: { ...taskWhere, status: 'Complete' } });
        const overdueTasks = await prisma.task.count({
            where: {
                ...taskWhere,
                status: { not: 'Complete' },
                dueDate: { lt: new Date() },
            },
        });

        const tasks = await prisma.task.findMany({
            where: taskWhere,
            select: { estimatedCost: true }
        });
        const totalEstimatedCost = tasks.reduce((sum: number, task: { estimatedCost: number }) => sum + (task.estimatedCost || 0), 0);

        const phaseWhere: any = {};
        if (spaceId) {
            phaseWhere.spaceId = spaceId;
        }

        const phases = await prisma.phase.findMany({
            where: phaseWhere,
            include: {
                _count: {
                    select: { tasks: true },
                },
                tasks: {
                    where: taskWhere,
                    select: {
                        id: true,
                        actionItem: true,
                        status: true,
                        dueDate: true,
                        owner: { select: { name: true } },
                    },
                },
            },
        });

        const phaseStats = phases.map((phase: any) => {
            const completedInPhase = phase.tasks.filter((t: any) => t.status === 'Complete').length;
            return {
                id: phase.id,
                name: phase.name,
                totalTasks: phase.tasks.length,
                completedTasks: completedInPhase,
                progress: phase.tasks.length > 0 ? (completedInPhase / phase.tasks.length) * 100 : 0,
                tasks: phase.tasks,
            };
        });

        // Recent activity - last 10 updated tasks
        const recentActivity = await prisma.task.findMany({
            where: taskWhere,
            orderBy: { updatedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                actionItem: true,
                status: true,
                updatedAt: true,
                createdAt: true,
                owner: { select: { name: true } },
                phase: { select: { name: true } },
            },
        });

        return NextResponse.json({
            overallProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            totalTasks,
            completedTasks,
            overdueTasks,
            totalEstimatedCost,
            phaseStats,
            recentActivity,
        });
    } catch (error: any) {
        console.error('Error fetching summary:', error);
        return NextResponse.json({
            error: 'Failed to fetch summary',
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}
