import type { Metadata } from "next";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LanguageProvider } from '@/i18n';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LeaderX Admin Console",
  description: "Administration console for LeaderX platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${montserrat.variable} ${playfair.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
