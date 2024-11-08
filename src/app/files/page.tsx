import { auth } from "@/lib/auth";
import { PdfRecord, UserStats } from "@/lib/models";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FilesProvider from "./context";
import { FileList } from "./file-list";
import { FileStats } from "./file-stats";

export const revalidate = 30;

/**
 * Fetches user files
 * @param userId - The user ID
 * @returns User files
 * @throws Error if user ID is not provided
 */
async function fetchFiles(userId: string | undefined): Promise<PdfRecord[]> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!userId) throw new Error("User ID is required");
  const maybeFiles = await prisma.courseMaterial.findMany({
    select: {
      id: true,
      userId: true,
      title: true,
      visibility: true,
      fileName: true,
      fileUrl: true,
      description: true,
      fileSize: true,
      uploadedAt: true,
    },
    orderBy: { uploadedAt: "desc" },
  });

  if (maybeFiles) {
    return maybeFiles.map((file) => ({
      id: file.id,
      title: file.title,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      description: file.description,
      fileSize: file.fileSize,
      uploadedAt: file.uploadedAt,
      visibility: file.visibility,
      isOwner: file.userId === userId,
    }));
  } else return [];
}

/**
 * Fetches user stats
 * @param userId - The user ID
 * @returns User stats
 * @throws Error if user ID is not provided or user is not found
 */
async function fetchStats(userId: string | undefined): Promise<UserStats> {
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

  return {
    totalFiles,
    totalPages,
    averageFileSize,
    storageUsed: user.storageUsed,
  };
}

async function lastUpdatedTimeStats() {
  return prisma.courseMaterial.aggregate({
    _max: { uploadedAt: true },
  });
}

export default async function FilesPage() {
  // This is how we get the user session
  const session = await auth();
  const userId = session?.user?.id;

  // Protect the route
  if (!session || !userId) {
    redirect("/");
  }

  // We use Promise.allSettled to fetch both files and stats in parallel
  const [filesPromise, statsPromise] = await Promise.allSettled([
    fetchFiles(userId),
    fetchStats(userId),
  ]);

  // .allSettled() allows us to handle both resolved and rejected promises
  if (filesPromise.status === "rejected") {
    throw filesPromise.reason;
  }

  if (statsPromise.status === "rejected") {
    throw statsPromise.reason;
  }

  // Nice! .all() would have thrown if *any* of the promises rejected
  const files = filesPromise.value;
  const stats = statsPromise.value;
  const updatedAt = await lastUpdatedTimeStats();

  return (
    <div>
      <div className="container mx-auto p-6">
        <FilesProvider filesList={files}>
          <FileStats
            stats={stats}
            updatedAt={updatedAt._max.uploadedAt?.getDate()}
          />
          <FileList />
        </FilesProvider>
      </div>
    </div>
  );
}
