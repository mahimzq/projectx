import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const totalTasks = await prisma.task.count();
        const completedTasks = await prisma.task.count({ where: { status: 'Complete' } });
        const overdueTasks = await prisma.task.count({
            where: {
                status: { not: 'Complete' },
                dueDate: { lt: new Date() },
            },
        });

        const tasks = await prisma.task.findMany({ select: { estimatedCost: true } });
        const totalEstimatedCost = tasks.reduce((sum: number, task: { estimatedCost: number }) => sum + (task.estimatedCost || 0), 0);

        const phases = await prisma.phase.findMany({
            include: {
                _count: {
                    select: { tasks: true },
                },
                tasks: {
                    select: { status: true },
                },
            },
        });

        const phaseStats = phases.map((phase: any) => {
            const completedInPhase = phase.tasks.filter((t: any) => t.status === 'Complete').length;
            return {
                id: phase.id,
                name: phase.name,
                totalTasks: phase._count.tasks,
                completedTasks: completedInPhase,
                progress: phase._count.tasks > 0 ? (completedInPhase / phase._count.tasks) * 100 : 0,
            };
        });

        return NextResponse.json({
            overallProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            totalTasks,
            completedTasks,
            overdueTasks,
            totalEstimatedCost,
            phaseStats,
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
