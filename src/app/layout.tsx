import React from 'react';
import "./globals.css";

export const metadata = {
  title: "Akhi Chats",
  description: "A Discord-like chat application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#313338" />
      </head>
      <body>{children}</body>
    </html>
  );
}