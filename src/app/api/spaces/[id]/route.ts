import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN' && userRole !== 'DIRECTOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const space = await prisma.space.update({
            where: { id },
            data: { name: body.name },
        });

        return NextResponse.json(space);
    } catch (error: any) {
        console.error('Error updating space:', error);
        return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN' && userRole !== 'DIRECTOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        await prisma.space.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting space:', error);
        return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 });
    }
}
