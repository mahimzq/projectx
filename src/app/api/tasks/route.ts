import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();

        // Determine the owner
        let ownerId: string | null = body.ownerId || null;

        if (!ownerId && !body.ownerName && session?.user) {
            ownerId = (session.user as any).id;
        }

        // Only include known Task model fields to avoid Prisma errors
        const taskData: any = {
            actionItem: body.actionItem ?? '',
            priority: body.priority ?? 'Medium',
            status: body.status ?? 'Not Started',
            durationDays: body.durationDays ? Number(body.durationDays) : 0,
            estimatedCost: body.estimatedCost ? Number(body.estimatedCost) : 0,
            phaseId: body.phaseId,
        };

        // Only set optional fields if they have values
        if (ownerId) taskData.ownerId = ownerId;
        if (body.startDate) taskData.startDate = new Date(body.startDate);
        if (body.dueDate) taskData.dueDate = new Date(body.dueDate);
        if (body.resources) taskData.resources = body.resources;
        if (body.notes) taskData.notes = body.notes;
        if (body.ragRating) taskData.ragRating = body.ragRating;
        if (body.actionType) taskData.actionType = body.actionType;

        const task = await prisma.task.create({
            data: taskData,
            include: {
                owner: true,
                phase: true,
            }
        });

        return NextResponse.json(task);

    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task', details: error.message }, { status: 500 });
    }
}
