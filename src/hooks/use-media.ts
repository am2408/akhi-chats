"use client";

import { useState } from "react";

const useMedia = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  return { isMuted, setIsMuted, isVideoOn, setIsVideoOn };
};

export default useMedia;