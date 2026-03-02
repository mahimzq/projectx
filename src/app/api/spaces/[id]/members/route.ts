import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const members = await prisma.spaceMember.findMany({
            where: { spaceId: id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        return NextResponse.json(members);
    } catch (error: any) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(
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
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Check if already a member
        const existing = await prisma.spaceMember.findUnique({
            where: { userId_spaceId: { userId, spaceId: id } }
        });

        if (existing) {
            return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
        }

        const member = await prisma.spaceMember.create({
            data: { userId, spaceId: id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        return NextResponse.json(member);
    } catch (error: any) {
        console.error('Error adding member:', error);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
        }

        await prisma.spaceMember.delete({
            where: { userId_spaceId: { userId, spaceId: id } }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing member:', error);
        return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }
}
