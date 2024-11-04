import { auth } from "@/lib/auth";
import { calculateUserStats } from "@/lib/pdfStorage";
import { NextResponse } from "next/server";

export async function GET() {
  const authData = await auth();
  const userId = authData?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await calculateUserStats(userId);
    return NextResponse.json(stats, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to calculate user stats" },
      { status: 500 },
    );
  }
}
