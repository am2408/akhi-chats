import { NextResponse } from 'next/server';
import { getMessages, sendMessage } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
        return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const messages = await getMessages(channelId);
    return NextResponse.json(messages);
}

export async function POST(request) {
    const { channelId, content, userId } = await request.json();

    if (!channelId || !content || !userId) {
        return NextResponse.json({ error: 'Channel ID, content, and user ID are required' }, { status: 400 });
    }

    const message = await sendMessage({ channelId, content, userId });
    return NextResponse.json(message, { status: 201 });
}