import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

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
      `SELECT
        a.id,
        a.timestamp,
        a.alert_type,
        a.description,
        a.violation_id,
        f.name AS factory_name
      FROM alerts a
      JOIN factories f ON a.factory_id = f.id
      WHERE f.user_id = $1
      ORDER BY a.timestamp DESC`,
      [userId],
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ message: 'Error fetching alerts' }, { status: 500 });
  }
}
