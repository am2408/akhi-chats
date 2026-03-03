import { NextResponse } from 'next/server';
import { getNotifications, markAsRead } from '@/lib/db';

export async function GET(request: Request) {
    const notifications = await getNotifications();
    return NextResponse.json(notifications);
}

export async function POST(request: Request) {
    const { notificationId } = await request.json();
    const result = await markAsRead(notificationId);
    return NextResponse.json(result);
}