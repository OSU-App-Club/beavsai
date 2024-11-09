"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserStats } from "@/lib/models";
import { Clock, Files, FileText, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";

type FileStatsProps = {
  stats: UserStats;
  updatedAt: number | undefined;
};

export const FileStats = ({ stats }: FileStatsProps) => {
  const [progressValues, setProgressValues] = useState({
    files: 0,
    pages: 0,
    storage: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValues({
        files: (stats.totalFiles / 100) * 100,
        pages: (stats.totalPages / 1000) * 100,
        storage: (stats.storageUsed / (50 * 1024 * 1024)) * 100,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [stats]);

  const formatBytes = (bytes: number): string => {
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

  const stats_data = [
    {
      title: "Average Size",
      icon: <Clock className="w-4 h-4 text-purple-500" />,
      value: formatBytes(stats.averageFileSize),
      progress: null,
    },
    {
      title: "Total Files",
      icon: <Files className="w-4 h-4 text-blue-500" />,
      value: stats.totalFiles.toString(),
      progress: progressValues.files * 5,
      progressColor: "bg-neutral-800",
    },
    {
      title: "Total Pages",
      icon: <FileText className="w-4 h-4 text-green-500" />,
      value: stats.totalPages.toString(),
      progress: progressValues.pages * 15,
      progressColor: "bg-neutral-800",
    },
    {
      title: "Storage Used",
      icon: <HardDrive className="w-4 h-4 text-osu" />,
      value: `${formatBytes(stats.storageUsed)} / 50 MB`,
      progress: progressValues.storage,
      progressColor: "bg-neutral-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats_data.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
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
      ))}
    </div>
  );
};
