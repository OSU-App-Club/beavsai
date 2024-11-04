import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserStats } from "@/lib/types";
import { Clock, Files, FileText, HardDrive } from "lucide-react";

type FileStatsProps = {
  stats: UserStats;
};

export const FileStats = ({ stats }: FileStatsProps) => {
  /**
   * Format bytes to human-readable format
   * @param bytes - Number of bytes
   * @returns Human-readable string
   * @example
   * formatBytes(1024) => "1 KB"
   * formatBytes(1048576) => "1 MB"
   * formatBytes(1073741824) => "1 GB"
   * formatBytes(1099511627776) => "1 TB"
   * @see (https://stackoverflow.com/a/18650828)
   */
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <CardTitle>Average Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(stats.averageFileSize)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Files className="w-4 h-4 text-blue-500" />
          <CardTitle>Total Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFiles}</div>
          <Progress value={(stats.totalFiles / 100) * 100} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <FileText className="w-4 h-4 text-green-500" />
          <CardTitle>Total Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPages}</div>
          <Progress value={(stats.totalPages / 1000) * 100} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <HardDrive className="w-4 h-4 text-orange-500" />
          <CardTitle>Storage Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(stats.storageUsed)} / 50 MB
          </div>
          <Progress
            value={(stats.storageUsed / (50 * 1024 * 1024)) * 100}
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
};
