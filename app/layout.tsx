import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/use-toast';
import './globals.css';


const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ANTIGRAVITY — Centro de Gravidade",
  description: "O que mantém tudo em pé passa por aqui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
