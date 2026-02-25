import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const phases = await prisma.phase.findMany({
            include: {
                tasks: {
                    include: {
                        owner: true,
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
            }
        });
        return NextResponse.json(phase);
    } catch (error: any) {
        console.error('Error creating phase:', error);
        return NextResponse.json({ error: 'Failed to create phase' }, { status: 500 });
    }
}
