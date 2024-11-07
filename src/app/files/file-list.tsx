"use client";

import { PdfItem } from "@/components/pdf-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PdfRecord } from "@/lib/models";
import { AnimatePresence, motion } from "framer-motion";
import {
  Files,
  Search,
  SlidersHorizontal,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteFile } from "./actions";

type FileListProps = {
  files: PdfRecord[];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const FileList = ({ files }: FileListProps) => {
  const [fileList, setFileList] = useState<PdfRecord[]>(files);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [, startTransition] = useTransition();
  const [, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    setIsDeleting(fileId);
    startTransition(async () => {
      try {
        await deleteFile(fileId);
        setFileList((prev) => prev.filter((file) => file.id !== fileId));
        setIsDeleting(null);
        toast.success("File deleted successfully");
      } catch {
        setIsDeleting(null);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center hover:opacity-75"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
          <Input
            placeholder="Search files..."
            className="pl-10 pr-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-11">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date uploaded</SelectItem>
              <SelectItem value="name">File name</SelectItem>
              <SelectItem value="size">File size</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/upload" className="flex-shrink-0">
            <Button
              className="h-11 bg-osu hover:bg-osu/90 text-white"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sortedFiles.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 px-4"
          >
            <Files className="w-16 h-16 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">
              {searchQuery ? "No matching files" : "No files uploaded yet"}
            </h3>
            <p className="mb-8 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or clear the search to see all files"
                : "Upload an initial PDF to give contextual information our AI can understand."}
            </p>
            <Link href="/upload">
              <Button size="lg" className="bg-osu hover:bg-osu/90 text-white">
                <Upload className="w-5 h-5 mr-2" />
                Upload PDF
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {sortedFiles.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PdfItem
                  file={file}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
