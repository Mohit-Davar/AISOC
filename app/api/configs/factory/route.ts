
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';

interface DecodedToken {
  userId: string;
}

const factorySchema = z.object({
  name: z.string().min(1, "Factory name is required"),
});

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verify(accessToken, process.env.JWT_ACCESS_SECRET!) as DecodedToken;
    const userId = decoded.userId;

    const body = await req.json();
    const { name } = factorySchema.parse(body);

    const { rows } = await db.query(
      "INSERT INTO factories (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userId],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('Error adding factory:', error);
    return NextResponse.json({ message: 'Error adding factory' }, { status: 500 });
  }
}
