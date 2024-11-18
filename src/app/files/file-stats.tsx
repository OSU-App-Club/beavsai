"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PdfUploadDialog } from "@/components/upload-dialog";
import { Files, FileText, HardDrive, Upload } from "lucide-react";
import { useContext, useMemo } from "react";
import { FileStatsContext } from "./context";

export const FileStats = () => {
  const statsContext = useContext(FileStatsContext);
  const stats = statsContext?.stats;
  const progressValues = statsContext?.progressValues;

  const formatBytes = (bytes: number | undefined): string => {
    if (!bytes) return "0 Bytes";
    switch (true) {
      case bytes < 1024:
        return `${bytes} Bytes`;
      case bytes < 1048576:
        return `${(bytes / 1024).toFixed(2)} KB`;
      case bytes < 1073741824:
        return `${(bytes / 1048576).toFixed(2)} MB`;
      case bytes < 1099511627776:
        return `${(bytes / 1073741824).toFixed(2)} GB`;
      default:
        return `${(bytes / 1099511627776).toFixed(2)} TB`;
    }
  };

  const stats_data = useMemo(() => {
    if (!stats || !progressValues) return [];

    const values = [
      {
        type: "upload",
        title: "Upload",
        icon: <Upload className="w-4 h-4 text-osu" />,
        value: "Add PDF",
      },
      {
        type: "stat",
        title: "Total Files",
        icon: <Files className="w-4 h-4 text-blue-500" />,
        value: stats?.totalFiles.toString(),
        progress: progressValues?.files * 5,
        progressColor: "bg-neutral-800",
      },
      {
        type: "stat",
        title: "Total Pages",
        icon: <FileText className="w-4 h-4 text-green-500" />,
        value: stats?.totalPages.toString(),
        progress: progressValues?.pages * 15,
        progressColor: "bg-neutral-800",
      },
      {
        type: "stat",
        title: "Storage Used",
        icon: <HardDrive className="w-4 h-4 text-osu" />,
        value: `${formatBytes(stats?.storageUsed)} / 50 MB`,
        progress: progressValues?.storage,
        progressColor: "bg-neutral-800",
      },
    ];

    return values;
  }, [stats, progressValues]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats_data.map((item) =>
          item.type === "upload" ? (
            <PdfUploadDialog key={item.title} mainUploader />
          ) : (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-2xl font-bold mb-4">{item.value}</div>
                {item.progress !== null && (
                  <Progress
                    value={item.progress}
                    className="transition-all duration-500"
                  />
                )}
              </CardContent>
            </Card>
          ),
        )}
        {statsContext?.updatedAt && (
          <div className="text-sm text-neutral-500 text-center">
            Last updated: {new Date(statsContext.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </>
  );
};
