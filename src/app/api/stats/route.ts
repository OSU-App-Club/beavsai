import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 30;

/**
 * Fetches user upload statistics
 * @returns
 * @throws
 * - 500 if failed to fetch the data
 * - 200 with the users file statistics
 * @example
 * GET /api/stats
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User ID is required");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { CourseMaterial: true },
    });

    if (!user) throw new Error("User not found");

    const totalFiles = user.CourseMaterial.length;
    const totalPages = user.CourseMaterial.reduce(
      (acc, material) => acc + material.pages,
      0,
    );
    const averageFileSize =
      totalFiles > 0
        ? user.CourseMaterial.reduce(
            (acc, material) => acc + material.fileSize,
            0,
          ) / totalFiles
        : 0;

    const stats = {
      totalFiles,
      totalPages,
      averageFileSize,
      storageUsed: user.storageUsed,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to fetch files", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
