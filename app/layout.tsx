import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sata Inggil | Warehouse Management System",
  description: "Sistem manajemen gudang tembakau Sata Inggil.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body>{children}</body></html>;
}