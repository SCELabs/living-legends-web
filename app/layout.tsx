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
      <body>
        <div className="min-h-screen bg-bg text-text">
          {/* Top Bar */}
          <header className="border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Living Legends</h1>
              <p className="text-sm text-muted">
                Watch a world unfold. Intervene only when it matters.
              </p>
            </div>

            <div className="text-sm text-muted">
              SCE Narrative Engine
            </div>
          </header>

          {/* Main Content */}
          <main className="px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
