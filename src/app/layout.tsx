import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Delegate",
  description:
    "Create, customize and operate specialized agents that optimize hands-on areas. They actually execute.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
