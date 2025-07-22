
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await db.query('SELECT * FROM camera_feeds', []);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching camera feeds:', error);
    return NextResponse.json({ message: 'Error fetching camera feeds' }, { status: 500 });
  }
}
