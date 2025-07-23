
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

    const { rows } = await db.query(
      "SELECT id, name FROM factories WHERE user_id = $1 ORDER BY name",
      [userId],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching factories:', error);
    return NextResponse.json({ message: 'Error fetching factories' }, { status: 500 });
  }
}
