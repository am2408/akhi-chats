"use client";

import React, { createContext, useContext, useState } from "react";

interface ModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);

export default ModalProvider;