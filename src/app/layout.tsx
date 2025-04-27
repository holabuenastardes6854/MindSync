import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MindSync - Functional Music for Your Brain',
  description: 'Music designed to help you focus, relax, and sleep better',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
