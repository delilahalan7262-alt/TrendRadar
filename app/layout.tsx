import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Task Radar MVP',
  description: 'Lightweight task manager with reminders, filters, and REST APIs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
