"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

type File = {
  id: string;
  filename: string;
  url: string;
  type: string;
  createdAt: string;
};

export default function PortalFilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState<"essay" | "resume" | "other">("essay");

  const fetchFiles = async () => {
    const res = await fetch("/api/portal/files");
    if (res.ok) {
      const data = await res.json();
      setFiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("type", type);
    setUploading(true);
    try {
      const res = await fetch("/api/portal/files", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchFiles();
        form.reset();
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <Link href="/portal" className="text-sm text-neutral-600 hover:text-black mb-6 inline-block">
            ← Portal
          </Link>
          <h1 className="text-2xl font-semibold mb-2">File uploads</h1>
          <p className="text-neutral-600 mb-12">
            Upload essays, resume, and supplements.
          </p>

          <form onSubmit={handleUpload} className="mb-12 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "essay" | "resume" | "other")}
                className="w-full border border-neutral-300 px-4 py-3 text-sm"
              >
                <option value="essay">Essay</option>
                <option value="resume">Resume</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">File</label>
              <input
                type="file"
                name="file"
                required
                className="w-full text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="h-10 px-6 bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          <h2 className="text-lg font-medium mb-4">Your files</h2>
          {loading ? (
            <p className="text-neutral-500">Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-neutral-500">No files yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <div>
                    <span className="font-medium">{f.filename}</span>
                    <span className="text-neutral-500 text-sm ml-2">({f.type})</span>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-600 hover:text-black"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
