"use client";

import { PdfRecord, UserStats } from "@/lib/models";
import axios from "axios";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
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

type FileStatsContextType = {
  stats: UserStats;
  updatedAt: number | undefined;
  retrieveStats: () => Promise<void>;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  setUpdatedAt: React.Dispatch<React.SetStateAction<number | undefined>>;
  progressValues: Progress;
  setProgressValues: React.Dispatch<React.SetStateAction<Progress>>;
};

type Progress = {
  files: number;
  pages: number;
  storage: number;
};

export const FileStatsContext = createContext<FileStatsContextType | undefined>(
  undefined,
);

export function FileStatsProvider({
  children,
  initialStats,
  initialUpdatedAt,
}: {
  children: ReactNode;
  initialStats: UserStats;
  initialUpdatedAt: number | undefined;
}) {
  const [stats, setStats] = useState<UserStats>(initialStats);
  const [updatedAt, setUpdatedAt] = useState<number | undefined>(
    initialUpdatedAt,
  );
  const [progressValues, setProgressValues] = useState<Progress>({
    files: 0,
    pages: 0,
    storage: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!stats) return;
      setProgressValues({
        files: (stats.totalFiles / 100) * 100,
        pages: (stats.totalPages / 1000) * 100,
        storage: (stats.storageUsed / (50 * 1024 * 1024)) * 100,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [stats]);

  const retrieveStats = useCallback(async () => {
    try {
      const response = await axios.get("/api/stats");
      setStats(response.data.stats);
      setUpdatedAt(Date.now());
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to retrieve stats");
      }
    }
  }, []);

  useEffect(() => {
    retrieveStats();
  }, [retrieveStats]);

  return (
    <FileStatsContext.Provider
      value={{
        stats,
        updatedAt,
        retrieveStats,
        setStats,
        setUpdatedAt,
        progressValues,
        setProgressValues,
      }}
    >
      {children}
    </FileStatsContext.Provider>
  );
}
