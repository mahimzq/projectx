import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const spaceId = searchParams.get('spaceId');

        const where: any = {};
        if (spaceId) {
            where.spaceId = spaceId;
        }

        // Get session to check role for task visibility
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role || 'STAFF';
        const userId = (session?.user as any)?.id;

        const phases = await prisma.phase.findMany({
            where,
            include: {
                tasks: {
                    where: getTaskVisibilityFilter(userRole, userId),
                    include: {
                        owner: true,
                        submittedBy: { select: { id: true, name: true } },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        return NextResponse.json(phases);
    } catch (error: any) {
        console.error('Error fetching phases:', error);
        return NextResponse.json({ error: 'Failed to fetch phases' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const phase = await prisma.phase.create({
            data: {
                name: body.name,
                order: body.order || 0,
                spaceId: body.spaceId || null,
            }
        });
        return NextResponse.json(phase);
    } catch (error: any) {
        console.error('Error creating phase:', error);
        return NextResponse.json({ error: 'Failed to create phase' }, { status: 500 });
    }
}

// Helper: determine which tasks a user can see
function getTaskVisibilityFilter(role: string, userId: string) {
    // Directors, Admins, PMs, and Managers see everything in the space
    if (['DIRECTOR', 'ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'CAREHOME_MANAGER'].includes(role)) {
        return {};
    }
    // Staff see ONLY their assigned tasks or tasks they submitted
    return {
        OR: [
            { ownerId: userId },
            { submittedById: userId },
        ]
    };
}
