import React from 'react';
import "./globals.css";

export const metadata = {
  title: "Akhi Chats",
  description: "Chat with your friends — Discord-like app",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}