"use client";

import React, { useState } from "react";
import Button from "../ui/button";
import Input from "../ui/input";
import { uploadFile } from "../../lib/uploadthing";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileUploadModal = ({ isOpen, onClose }: FileUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(file);
      setFile(null);
      onClose();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "440px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Upload File</h2>
        <input type="file" onChange={handleFileChange} style={{ marginBottom: "16px" }} />
        {error && <p style={{ color: "#da373c", fontSize: "14px", marginBottom: "12px" }}>{error}</p>}
        {file && <p style={{ fontSize: "14px", marginBottom: "12px" }}>Selected: {file.name}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;