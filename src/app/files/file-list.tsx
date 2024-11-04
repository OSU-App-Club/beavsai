"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PdfItem } from "@/components/pdf-item";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { deleteFile } from "./actions";
import { PdfRecord } from "@/lib/types";
import { Files, Search, SlidersHorizontal, Upload } from "lucide-react";
import Link from "next/link";

type FileListProps = {
  files: PdfRecord[];
};

export const FileList = ({ files }: FileListProps) => {
  const [fileList, setFileList] = useState<PdfRecord[]>(files);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [, startTransition] = useTransition();

  const handleDelete = async (fileId: string) => {
    startTransition(async () => {
      try {
        await deleteFile(fileId);
        setFileList((prev) => prev.filter((file) => file.id !== fileId));
        toast.success("File deleted successfully");
      } catch {
        toast.error("Failed to delete file");
      }
    });
  };

  const handlePreview = async (fileId: string): Promise<string> => {
    try {
      const response = await fetch(`/api/files/${fileId}/sign`);
      const data = await response.json();
      return data.url;
    } catch {
      toast.error("Failed to load preview");
      return "";
    }
  };

  const filteredFiles = fileList.filter(
    (file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "size":
        return (b.fileSize || 0) - (a.fileSize || 0);
      case "date":
      default:
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
    }
  });

  return (
    <div className="space-y-4">
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

      {sortedFiles.length === 0 ? (
        <div className="text-center py-12">
          <Files className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-semibold mb-2">No files found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No files match your search criteria"
              : "Upload your first PDF to get started!"}
          </p>
          <Link href="/upload">
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
          </Link>
        </div>
      ) : (
        sortedFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex-1">
              <PdfItem file={file} onPreview={handlePreview} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(file.id)}
              className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        ))
      )}
    </div>
  );
};
