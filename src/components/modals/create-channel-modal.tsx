"use client";

import React, { useState } from "react";
import Modal from "../ui/modal";
import Input from "../ui/input";
import Button from "../ui/button";

const CreateChannelModal = ({ isOpen, onClose }) => {
  const [channelName, setChannelName] = useState("");

  const handleCreateChannel = () => {
    // Logic to create a channel
    console.log("Channel created:", channelName);
    setChannelName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold">Create Channel</h2>
      <Input
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="Channel Name"
        className="mt-4"
      />
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="secondary" className="mr-2">
          Cancel
        </Button>
        <Button onClick={handleCreateChannel} variant="primary">
          Create
        </Button>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;