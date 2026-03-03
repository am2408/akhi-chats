"use client";

import React, { useState } from "react";
import Modal from "../ui/modal";
import Input from "../ui/input";
import Button from "../ui/button";

const CreateServerModal = ({ isOpen, onClose }) => {
  const [serverName, setServerName] = useState("");

  const handleCreateServer = () => {
    // Logic to create a server goes here
    console.log("Creating server:", serverName);
    // Reset the input field
    setServerName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold">Create a New Server</h2>
      <Input
        value={serverName}
        onChange={(e) => setServerName(e.target.value)}
        placeholder="Server Name"
        className="mt-4"
      />
      <div className="mt-4 flex justify-end">
        <Button onClick={handleCreateServer} disabled={!serverName}>
          Create Server
        </Button>
      </div>
    </Modal>
  );
};

export default CreateServerModal;