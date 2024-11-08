"use client";

import { PdfRecord } from "@/lib/models";
import axios from "axios";
import { createContext, ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";
import { deleteFile } from "./actions";

type FilesContextType = {
  files: PdfRecord[];
  addFile: (pdf: PdfRecord) => void;
  deleteFileById: (fileId: string) => Promise<void>;
  retrieveFileList: () => Promise<void>;
  setFiles: React.Dispatch<React.SetStateAction<PdfRecord[]>>;
};

export const FilesContext = createContext<FilesContextType | undefined>(
  undefined,
);

export default function FilesProvider({
  children,
  filesList,
}: {
  children: ReactNode;
  filesList: PdfRecord[];
}) {
  const [files, setFiles] = useState<PdfRecord[]>(filesList);

  const addFile = useCallback((pdf: PdfRecord) => {
    setFiles((prevFiles) => [pdf, ...prevFiles]);
  }, []);

  const deleteFileById = useCallback(async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      toast.success("File deleted successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete file");
      }
    }
  }, []);

  const retrieveFileList = useCallback(async () => {
    try {
      const response = await axios.get<PdfRecord[]>("/api/files");
      setFiles(response.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else toast.error("Failed to retrieve files");
    }
  }, []);

  return (
    <FilesContext.Provider
      value={{ files, addFile, deleteFileById, retrieveFileList, setFiles }}
    >
      {children}
    </FilesContext.Provider>
  );
}
