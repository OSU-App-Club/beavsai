import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PdfRecord } from "@/lib/models";
import {
  Clock,
  Download,
  Eye,
  FileText,
  HardDrive,
  Loader2,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useState } from "react";

type PdfItemProps = {
  file: PdfRecord;
  onPreview: (id: string) => Promise<string>;
  onDelete: (fileId: string) => void;
};

const formatFileSize = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export function PdfItem({ file, onPreview, onDelete }: PdfItemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleAction = async (action: string) => {
    switch (action) {
      case "preview":
        setShowDialog(true);
        setIsLoadingPreview(true);
        setPreviewError(false);
        try {
          const url = await onPreview(file.id);
          if (!url) throw new Error("No preview URL received");
          if (url.endsWith(".pdf")) {
            setPreviewUrl(url);
          }
          setPreviewUrl(url);
        } catch (error) {
          setPreviewError(true);
          console.error("Preview error:", error);
        } finally {
          setIsLoadingPreview(false);
        }
        break;
      case "download":
        if (previewUrl) {
          window.open(previewUrl, "_blank");
        } else {
          const url = await onPreview(file.id);
          if (!url) throw new Error("No preview URL received");
          window.open(url, "_blank");
        }
        break;
      case "delete":
        onDelete(file.id);
        break;
    }
  };

  return (
    <div
      className="rounded-lg border border-input bg-background/50 
        hover:bg-accent/50 text-left transition-all duration-300 
        hover:shadow-[0_0_30px_-8px_rgba(234,88,12,0.2)] hover:border-orange-600/20
        group relative p-4"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#dc4405]/10 dark:bg-[#dc4405]/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#dc4405]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium dark:text-gray-200 truncate">
                {file.title}
              </h3>
              {file.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {file.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mr-4">
                <span className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {formatDate(file.uploadedAt)}
                </span>
                <span className="flex items-center">
                  <HardDrive className="mr-1 h-3.5 w-3.5" />
                  {formatFileSize(file.fileSize)}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => handleAction("preview")}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction("download")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("delete")}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="flex items-center space-x-2 dark:text-gray-200">
            <FileText className="h-5 w-5 text-osu" />
            <span>{file.title}</span>
          </DialogTitle>
          <div className="h-[70vh] overflow-auto rounded-lg border-osu/30 bg-muted">
            {isLoadingPreview ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-osu" />
                  <p className="text-sm text-gray-500">Loading preview...</p>
                </div>
              </div>
            ) : previewError ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-red-500">Failed to load preview</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("preview")}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            ) : previewUrl ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  previewUrl,
                )}&embedded=true`}
                className="h-full w-full"
                title="Preview"
                loading="lazy"
                onError={() => setPreviewError(true)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
