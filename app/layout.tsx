import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Living Legends",
  description: "A world unfolds. You intervene only when it matters.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
