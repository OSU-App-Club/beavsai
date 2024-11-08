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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfUploadDialog } from "@/components/upload-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Files,
  Globe,
  Lock,
  Search,
  SlidersHorizontal,
  Upload,
  XCircle,
} from "lucide-react";
import { useContext, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteFile } from "./actions";
import { FilesContext } from "./context";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const FileList = () => {
  const fileContext = useContext(FilesContext);
  const files = fileContext?.files || [];
  const setFileList = fileContext?.setFiles || (() => "No files found");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // 'all' or 'private'
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
      } catch (error) {
        if (error instanceof Error) toast.error(error.message);
        else toast.error("Failed to delete file");
      }
      setIsDeleting(null);
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

  // Filter files based on visibility and ownership
  const filteredFiles = files.filter((file) => {
    if (visibilityFilter === "all") {
      // Show all public files and private files owned by the user
      return (
        file.visibility === "PUBLIC" ||
        (file.visibility === "PRIVATE" && file.isOwner)
      );
    } else {
      // "My Files" tab - only show files owned by the user
      return file.isOwner;
    }
  });

  // Then filter by search query
  const searchFilteredFiles = filteredFiles.filter(
    (file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedFiles = [...searchFilteredFiles].sort((a, b) => {
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

  // Get counts for the tabs
  const allFilesCount = files.filter(
    (file) =>
      file.visibility === "PUBLIC" ||
      (file.visibility === "PRIVATE" && file.isOwner),
  ).length;
  const myFilesCount = files.filter((file) => file.isOwner).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center w-full md:w-auto">
          <Tabs
            defaultValue="all"
            value={visibilityFilter}
            onValueChange={setVisibilityFilter}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Globe className="h-4 w-4" />
                All Files ({allFilesCount})
              </TabsTrigger>
              <TabsTrigger value="private" className="gap-2">
                <Lock className="h-4 w-4" />
                My Files ({myFilesCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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

          <PdfUploadDialog>
            <Button
              className="h-11 bg-osu hover:bg-osu/90 text-white"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
          </PdfUploadDialog>
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
              {searchQuery
                ? "No matching files"
                : visibilityFilter === "private"
                  ? "No files found in your collection"
                  : "No files uploaded yet"}
            </h3>
            <p className="mb-8 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or clear the search to see all files"
                : visibilityFilter === "private"
                  ? "Files you upload will appear here in your personal collection."
                  : "Upload a PDF to share or keep private in your collection."}
            </p>
            <PdfUploadDialog>
              <Button size="lg" className="bg-osu hover:bg-osu/90 text-white">
                <Upload className="w-5 h-5 mr-2" />
                Upload PDF
              </Button>
            </PdfUploadDialog>
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
