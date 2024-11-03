"use client";

import { Button, buttonVariants } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { PdfUploadFormData, pdfUploadSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UploadPage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const form = useForm<PdfUploadFormData>({
    resolver: zodResolver(pdfUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
    },
  });

  const onSubmit = async (data: PdfUploadFormData) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("title", data.title);
    formData.append("description", data.description || "");

    try {
      // We're using axios because it supports progress events!
      const response = await axios.post("/api/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.lengthComputable) return;
          if (!progressEvent.total) return;
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(progress);
        },
      });

      if (response.status === 200) {
        toast.success("File uploaded successfully.");
        router.push("/files");
      }
    } catch {
      toast.error("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      form.reset();
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto rounded-lg shadow-md my-32">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Upload PDF Document</h1>
        <Link href={"/files"} className={buttonVariants({ variant: "link" })}>
          View all files
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Document Title" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a title for the document.
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
                    placeholder="Document Description (optional)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide additional details about the document.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PDF File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) field.onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload PDF"}
          </Button>
          {isUploading && (
            <div className="mt-4">
              <Label>Upload Progress</Label>
              <Slider value={[uploadProgress]} max={100} className="mt-2" />
              <p>{uploadProgress}%</p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
