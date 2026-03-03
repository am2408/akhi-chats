import { NextResponse } from 'next/server';
import { getServers, createServer } from '@/lib/db';

export async function GET() {
    try {
        const servers = await getServers();
        return NextResponse.json(servers);
    } catch (error) {
        return NextResponse.error();
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        const newServer = await createServer(body);
        return NextResponse.json(newServer, { status: 201 });
    } catch (error) {
        return NextResponse.error();
    }
}