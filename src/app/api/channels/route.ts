import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const channels = await db.channel.findMany();
        return NextResponse.json(channels);
    } catch (error) {
        return NextResponse.error();
    }
}

export async function POST(request: Request) {
    const { name, serverId } = await request.json();

    try {
        const newChannel = await db.channel.create({
            data: {
                name,
                serverId,
            },
        });
        return NextResponse.json(newChannel, { status: 201 });
    } catch (error) {
        return NextResponse.error();
    }
}