"use client";

import React, { useState } from "react";
import Button from "../ui/button";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChannelModal = ({ isOpen, onClose }: CreateChannelModalProps) => {
  const [channelName, setChannelName] = useState("");

  const handleCreateChannel = () => {
    if (!channelName.trim()) return;
    // TODO: API call to create channel
    setChannelName("");
    onClose();
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
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Create Channel</h2>
        <input
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="Channel name"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #e1e2e4",
            fontSize: "14px",
            outline: "none",
            background: "#f2f3f5",
            marginBottom: "16px",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreateChannel}>Create</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;