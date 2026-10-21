import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistem Penjemputan Siswa Sekolah',
  description: 'Aplikasi manajemen antrean penjemputan siswa terpadu dengan Text-to-Speech dan live counting timer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased selection:bg-blue-200">
        {children}
      </body>
    </html>
  );
}
