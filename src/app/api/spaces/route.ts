import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        // Admins and Directors see all spaces
        if (userRole === 'ADMIN' || userRole === 'DIRECTOR') {
            const spaces = await prisma.space.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { members: true } }
                }
            });
            return NextResponse.json(spaces);
        }

        // Other users see only their assigned spaces
        const memberships = await prisma.spaceMember.findMany({
            where: { userId },
            include: {
                space: {
                    include: {
                        _count: { select: { members: true } }
                    }
                }
            }
        });

        const spaces = memberships.map(m => m.space);
        return NextResponse.json(spaces);
    } catch (error: any) {
        console.error('Error fetching spaces:', error);
        return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN' && userRole !== 'DIRECTOR') {
            return NextResponse.json({ error: 'Only admins can create spaces' }, { status: 403 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Space name is required' }, { status: 400 });
        }

        const space = await prisma.space.create({
            data: { name: name.trim() },
        });

        // Auto-add the creator as a member
        await prisma.spaceMember.create({
            data: {
                userId: (session.user as any).id,
                spaceId: space.id,
            }
        });

        return NextResponse.json(space);
    } catch (error: any) {
        console.error('Error creating space:', error);
        return NextResponse.json({ error: 'Failed to create space' }, { status: 500 });
    }
}
