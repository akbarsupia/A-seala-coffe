import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shared/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Script from 'next/script';
import { Noto_Serif, Manrope } from 'next/font/google';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-noto-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'A’seala Coffee — Seduh Kopi, Seduh Cerita',
  description: 'Ruang ketiga Anda untuk menikmati setiap tegukan kopi terbaik sambil berbagi momen hangat bersama keluarga dan teman.',
  keywords: ['coffee bogor', 'kafe bogor', 'aseala coffee', 'ngopi premium', 'tempat nongkrong bogor'],
  authors: [{ name: 'A’seala Coffee Team' }],
  openGraph: {
    title: 'A’seala Coffee — Simple, Warm, and Memorable',
    description: 'Aura hangat di setiap cangkir. Pesan menu favoritmu atau booking tempat di A’seala Coffee sekarang.',
    url: 'https://aseala-coffee.com',
    siteName: 'A’seala Coffee',
    images: [
      {
        url: 'https://aseala-coffee.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'A’seala Coffee Ambiance',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${notoSerif.variable} ${manrope.variable} font-body antialiased`}>
        <LanguageProvider>
          <NotificationProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <CartDrawer />
                <main>{children}</main>
                <Footer />
              </CartProvider>
            </AuthProvider>
          </NotificationProvider>
        </LanguageProvider>

        {/* Midtrans Snap */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
