"use client";

import { PdfItem } from "@/components/pdf-item";
import { Button, buttonVariants } from "@/components/ui/button";
import axios from "axios";
import { Trash } from "lucide-react";
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
};

export default function FilesPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await axios.get("/api/files");
      setFiles(response.data);
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

  return (
    <div className="p-6 max-w-3xl mx-auto rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">My Uploaded Files</h2>
      {files.length > 0 ? (
        <ul className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="flex justify-between items-center">
              <PdfItem key={file.id} file={file} onPreview={handlePreview} />
              <Button variant="outline" onClick={() => handleDelete(file.id)}>
                <Trash size={24} />
              </Button>
            </div>
          ))}
        </ul>
      ) : (
        <div>
          <p className="text-gray-500">No files uploaded yet.</p>
          <Link href="/upload" className={buttonVariants({ variant: "link" })}>
            Upload a file
          </Link>
        </div>
      )}
    </div>
  );
}
