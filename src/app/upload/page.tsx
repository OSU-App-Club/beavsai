"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PdfUploadFormData, pdfUploadSchema } from "@/lib/models";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, FileText, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UploadPage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cancelTokenSource] = useState(axios.CancelToken.source());
  const router = useRouter();

  const form = useForm<PdfUploadFormData>({
    resolver: zodResolver(pdfUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        if (file.size > 50 * 1024 * 1024) {
          toast.error("File size exceeds 50MB");
          return;
        }
        setSelectedFile(file);
        form.setValue("file", file);
      } else {
        toast.error("Please upload a PDF file");
      }
    },
    [form],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size exceeds 50MB");
        return;
      }
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue("file", null);
  };

  const cancelUpload = () => {
    cancelTokenSource.cancel("Upload canceled by user");
    setIsUploading(false);
    setUploadProgress(0);
  };

  const onSubmit = async (data: PdfUploadFormData) => {
    setIsUploading(true);
    setUploadProgress(0);

    if (!data.file) {
      toast.error("Please select a file to upload first.");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("title", data.title);
    formData.append("description", data.description || "");

    try {
      const response = await axios.post("/api/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        cancelToken: cancelTokenSource.token,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.lengthComputable || !progressEvent.total) return;
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(progress);
        },
      });

      if (response.status === 200) {
        toast.success("File uploaded successfully");
        router.push("/files");
      }
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        toast.error("Upload canceled");
      } else {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : "An error occurred while uploading the file";
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      form.reset();
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen py-4">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/files"
            className={
              buttonVariants({ variant: "ghost", size: "sm" }) + " mb-8 gap-2"
            }
          >
            <ArrowLeft className="w-4 h-4" />
            Back to files
          </Link>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Upload PDF Document</CardTitle>
              <CardDescription>
                Share your document with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a title for your document"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add some context about your document (optional)"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Help others understand what this document is about
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel>PDF File</FormLabel>
                        <FormControl>
                          <motion.div
                            animate={
                              dragActive ? { scale: 1.01 } : { scale: 1 }
                            }
                            className={`group border-2 border-dashed rounded-lg p-2 text-center 
                                     transition-colors duration-200 cursor-pointer
                                     ${
                                       dragActive
                                         ? "border-osu bg-osu/5"
                                         : "hover:border-osu/50"
                                     }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() =>
                              document.getElementById("file-upload")?.click()
                            }
                          >
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              accept="application/pdf"
                              onChange={handleFileSelect}
                            />

                            <AnimatePresence mode="wait">
                              {selectedFile ? (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="flex items-center justify-center gap-4"
                                >
                                  <FileText className="w-8 h-8 text-osu" />
                                  <div className="flex-1 text-left">
                                    <p className="font-medium">
                                      {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {(
                                        selectedFile.size /
                                        (1024 * 1024)
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFile();
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="py-4"
                                >
                                  <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                                  <p className="text-base text-muted-foreground mb-1">
                                    Drag and drop your PDF here
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    or click to browse (max 50MB)
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label>Upload Progress</Label>
                          <span className="text-sm text-muted-foreground">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelUpload}
                          className="w-full"
                        >
                          Cancel Upload
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end gap-4 pt-4">
                    <Link href="/files">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="bg-osu hover:bg-osu/90"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload PDF
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
