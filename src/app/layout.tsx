import type {Metadata} from 'next';
import './globals.css';
import { Dock } from '@/components/layout/Dock';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Banjarsari Connect - RW 2 Community Portal',
  description: 'Community portal for RW 2 Banjarsari, Metro Utara. Stay connected with news, announcements, and feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
        <FirebaseClientProvider>
          {children}
          <Dock />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
