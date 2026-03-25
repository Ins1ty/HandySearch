import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HandySearch',
  description: 'База данных контактов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
