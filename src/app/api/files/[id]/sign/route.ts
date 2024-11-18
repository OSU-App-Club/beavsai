import { getPresignedUrl } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// New, Next.js 15 way
// (https://nextjs.org/docs/app/building-your-application/upgrading/version-15#params--searchparams)
type Params = Promise<{ id: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const file = await prisma.courseMaterial.findUnique({
      where: { id: id },
      select: { fileName: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const presignedUrl = await getPresignedUrl(file.fileName);
    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error("Failed to generate presigned URL", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}
