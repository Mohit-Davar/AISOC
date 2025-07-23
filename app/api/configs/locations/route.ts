
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verify(accessToken, process.env.JWT_ACCESS_SECRET!) as DecodedToken;
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const factoryId = searchParams.get('factoryId');

    if (!factoryId) {
      return NextResponse.json({ message: 'factoryId is required' }, { status: 400 });
    }

    // Verify that the factory belongs to the user
    const factoryCheck = await db.query(
      "SELECT id FROM factories WHERE id = $1 AND user_id = $2",
      [parseInt(factoryId), userId],
    );

    if (factoryCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Factory not found or does not belong to user' }, { status: 404 });
    }

    const { rows } = await db.query(
      "SELECT id, name FROM locations WHERE factory_id = $1 ORDER BY name",
      [parseInt(factoryId)],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ message: 'Error fetching locations' }, { status: 500 });
  }
}
