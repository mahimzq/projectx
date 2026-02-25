import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Logic extraction for Duration
        let durationDays = body.durationDays;

        if (body.startDate || body.dueDate) {
            const task = await prisma.task.findUnique({ where: { id } });
            const start = body.startDate ? new Date(body.startDate) : task?.startDate;
            const end = body.dueDate ? new Date(body.dueDate) : task?.dueDate;

            if (start && end) {
                durationDays = differenceInDays(new Date(end), new Date(start));
            }
        }

        if (body.ownerName !== undefined) {
            if (body.ownerName.trim() === '') {
                body.ownerId = null;
            } else {
                let user = await prisma.user.findFirst({ where: { name: body.ownerName } });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: body.ownerName,
                            email: `${body.ownerName.toLowerCase().replace(' ', '.')}@example.com`,
                            password: 'password',
                            role: 'STAFF'
                        }
                    });
                }
                body.ownerId = user.id;
            }
            delete body.ownerName;
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                ...body,
                durationDays: durationDays !== undefined ? durationDays : undefined,
            },
        });

        return NextResponse.json(updatedTask);
    } catch (error: any) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.task.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
