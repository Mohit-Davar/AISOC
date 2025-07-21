import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
  const serialized = [
    serialize("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    }),
    serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1,
      path: "/",
    }),
  ];

  return new NextResponse(JSON.stringify({ message: "Logout successful" }), {
    headers: { "Set-Cookie": serialized.join(", ") },
  });
}
