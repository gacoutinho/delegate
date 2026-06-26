import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Forge",
  description:
    "Crie, customize e opere agentes especializados em otimização de áreas hands-on. Eles executam de verdade.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
