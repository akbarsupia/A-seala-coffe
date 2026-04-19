'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-primary text-white py-16 px-6 md:px-12 mt-24 rounded-t-[3rem] w-full">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-headline mb-4 text-orange-50">A&apos;seala</h2>
          <p className="text-white/70 max-w-sm mb-8 leading-relaxed font-body">
            {t('hero.subtitle')}
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
              <span className="font-bold text-xs tracking-wider">IG</span>
            </a>
            <a href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
              <span className="font-bold text-xs tracking-wider">TK</span>
            </a>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl">
          <h3 className="text-2xl font-headline mb-8 text-orange-200">{t('footer.location') || (lang === 'id' ? 'Mampir Kesini' : 'Find The Portal')}</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-orange-200 mt-1">location_on</span>
              <div>
                <p className="font-bold font-body">{t('footer.address').split(',')[0]},</p>
                <p className="text-white/70 text-sm mt-1 font-body">{t('footer.address').split(',').slice(1).join(',').trim()}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-orange-200 mt-1">schedule</span>
              <p className="font-bold mt-1 font-body">{lang === 'id' ? 'Buka Setiap Hari: 08.00 - 23.00' : 'Open Daily: 08:00 AM - 11:00 PM'}</p>
            </div>
          </div>
          <a 
            href="https://share.google/4kSPRdtNwYTLyd6Av" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-8 w-full py-4 rounded-xl bg-orange-200 text-primary font-bold text-sm flex justify-center items-center gap-2 hover:bg-white transition-colors group"
          >
            <span className="material-symbols-outlined !text-[18px] group-hover:-translate-y-1 transition-transform">map</span>
            {lang === 'id' ? 'Buka di Maps' : 'Open in Maps'}
          </a>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs tracking-widest uppercase">
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white transition-colors">{lang === 'id' ? 'Privasi' : 'Privacy'}</Link>
          <Link href="/about" className="hover:text-white transition-colors">{lang === 'id' ? 'Cerita' : 'Our Story'}</Link>
          <Link href="#" className="hover:text-white transition-colors">{lang === 'id' ? 'Kontak' : 'Contact'}</Link>
        </div>
        <div>
          © {new Date().getFullYear()} A&apos;seala Coffee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
