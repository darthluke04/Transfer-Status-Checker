import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/context/settings-context';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Folder File Finder',
  description: 'Validate your folder structure and file presence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SettingsProvider>
           <div className="min-h-screen bg-background text-foreground">
              <Header />
              <main>{children}</main>
            </div>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
