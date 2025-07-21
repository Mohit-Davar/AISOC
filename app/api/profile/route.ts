import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Access token not found" },
      { status: 401 },
    );
  }

  try {
    const decoded = await verify(accessToken, process.env.JWT_ACCESS_SECRET!);
    const userId = (decoded as { userId: string }).userId;

    const result = await db.query(
      "SELECT name, email FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { message: "Invalid access token" },
      { status: 401 },
    );
  }
}
