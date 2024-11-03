"use client";

import { PdfItem } from "@/components/pdf-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import {
  Clock,
  Files,
  FileText,
  HardDrive,
  Search,
  SlidersHorizontal,
  Trash,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PdfFile = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  uploadedAt: string;
  fileUrl: string;
  category?: string;
  size?: number;
};

type LoadingState = "loading" | "loaded" | "error";

// const ShimmerEffect = () => (
//   <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
// );

const StatCardSkeleton = () => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center space-x-2">
      <div className="w-4 h-4  rounded" />
      <div className="h-6 w-24 rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 rounded mb-2" />
      <div className="h-2  rounded" />
    </CardContent>
  </Card>
);

const FileItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-lg border">
    <div className="flex-1">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10  rounded" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/4  rounded" />
          <div className="h-3 w-1/2  rounded" />
        </div>
      </div>
    </div>
    <div className="w-8 h-8  rounded" />
  </div>
);

export default function FilesPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [stats] = useState({
    totalFiles: 0,
    totalPages: 0,
    averageFileSize: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoadingState("loading");
        const response = await axios.get("/api/files");
        setFiles(response.data);
        setLoadingState("loaded");
      } catch {
        setLoadingState("error");
        toast.error("Failed to load files");
      }
    };
    fetchFiles();
  }, []);

  const handlePreview = async (fileId: string) => {
    const response = await axios.get(`/api/files/${fileId}/sign`);
    return response.data.url;
  };

  const handleDelete = async (fileId: string) => {
    await axios.delete(`/api/files?id=${fileId}`);
    setFiles((files) => files.filter((file) => file.id !== fileId));
    toast.success("File deleted successfully");
  };

  const filteredFiles = files.filter(
    (file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "size":
        return (b.size || 0) - (a.size || 0);
      case "date":
      default:
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
    }
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingState === "loading" ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-2">
                  <Files className="w-4 h-4 text-blue-500" />
                  <CardTitle>Total Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <Progress
                    value={(stats.totalFiles / 100) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  <CardTitle>Total Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPages}</div>
                  <Progress
                    value={(stats.totalPages / 1000) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <CardTitle>Average Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageFileSize.toFixed(2)} MB
                  </div>
                  <Progress
                    value={(stats.averageFileSize / 10) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  <CardTitle>Storage Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.storageUsed / 1024).toFixed(2)} GB
                  </div>
                  <Progress
                    value={(stats.storageUsed / 10240) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date uploaded</SelectItem>
                  <SelectItem value="name">File name</SelectItem>
                  <SelectItem value="size">File size</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/upload">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </Link>
            </div>
          </div>

          {loadingState === "loading" ? (
            <div className="space-y-4">
              <FileItemSkeleton />
              <FileItemSkeleton />
              <FileItemSkeleton />
              <FileItemSkeleton />
            </div>
          ) : sortedFiles.length > 0 ? (
            <div className="space-y-4">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <PdfItem file={file} onPreview={handlePreview} />
                    {file.category && (
                      <Badge variant="secondary" className="mt-2">
                        {file.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Files className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "No files match your search criteria"
                  : "Upload your first PDF to get started"}
              </p>
              <Link href="/upload">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
