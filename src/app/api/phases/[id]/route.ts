import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete all tasks in this phase first to avoid foreign key violations
        await prisma.task.deleteMany({
            where: { phaseId: id },
        });

        // Then delete the phase
        await prisma.phase.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting phase:', error);
        return NextResponse.json({ error: 'Failed to delete phase' }, { status: 500 });
    }
}
