import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PdfRecord } from "@/lib/types";
import { useState } from "react";

type PdfItemProps = {
  file: PdfRecord;
  onPreview: (id: string) => Promise<string>;
};

export function PdfItem({ file, onPreview }: PdfItemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreviewClick = async () => {
    const url = await onPreview(file.id);
    if (!url) return;
    setPreviewUrl(url);
  };

  return (
    <li className="border-b pb-2">
      <div className="flex justify-between items-center">
        <div>
          <Label className="font-semibold">{file.title}</Label>
          <p className="text-sm text-gray-500">{file.description}</p>
        </div>
        <div className="ml-12 flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handlePreviewClick}>
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Preview</DialogTitle>
              <div className="h-96 overflow-auto">
                {previewUrl && (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                      previewUrl,
                    )}&embedded=true`}
                    width="100%"
                    height="500"
                    frameBorder="0"
                    scrolling="no"
                  ></iframe>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="default"
            onClick={() => window.open(previewUrl!, "_blank")}
          >
            Download
          </Button>
        </div>
      </div>
    </li>
  );
}
