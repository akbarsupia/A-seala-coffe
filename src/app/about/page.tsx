'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function AboutPage() {
  const { t, lang } = useLanguage();

  const storySteps = [
    {
      year: '2023',
      title: lang === 'id' ? 'Mimpi Pertama' : 'The First Dream',
      desc: lang === 'id' ? 'Berawal dari kecintaan silaturahmi di atas meja kopi, A\'seala lahir untuk menjadi rumah bagi setiap cerita.' : 'Born from a love of gathering over coffee, A\'seala was created to be a home for every story.'
    },
    {
      year: '2024',
      title: lang === 'id' ? 'Dedikasi Rasa' : 'Taste Dedication',
      desc: lang === 'id' ? 'Kami mulai bekerja sama dengan petani lokal untuk memastikan setiap biji kopi memiliki jiwa dan kualitas tertinggi.' : 'We began collaborating with local farmers to ensure every bean has a soul and the highest quality.'
    },
    {
      year: 'Sekarang',
      title: lang === 'id' ? 'Ruang Ketiga Anda' : 'Your Third Space',
      desc: lang === 'id' ? 'A\'seala bukan hanya kafe, tapi ruang di antara rumah dan pekerjaan tempat Anda menemukan kedamaian.' : 'A\'seala is not just a cafe, but a space between home and work where you find peace.'
    }
  ];

  return (
    <div className="pt-navbar min-h-screen bg-surface overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <Image 
          src="/about-hero.png" 
          alt="Premium Cafe Ambiance" 
          fill 
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="font-label text-white/60 tracking-[0.5em] uppercase text-[10px] font-bold mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {lang === 'id' ? 'Kisah di Balik Aroma' : 'The Story Behind The Aroma'}
          </span>
          <h1 className="text-5xl md:text-8xl text-white font-headline mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A&apos;seala Coffee
          </h1>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full animate-in zoom-in duration-1000 delay-500"></div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Container - Responsive aspect ratio */}
          <div className="relative aspect-video lg:aspect-[4/5] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl">
             <Image src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" alt="Coffee Craft" fill className="object-cover" unoptimized />
          </div>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Filosofi Kami</h2>
              <h3 className="text-3xl md:text-5xl font-headline text-primary mb-6">{t('about.title')}</h3>
              <p className="text-stone-500 font-body text-base md:text-lg leading-relaxed">
                {t('about.p1')}
              </p>
            </div>
            
            <div className="space-y-0 relative">
              {/* Vertical line - Desktop Only for precision */}
              <div className="absolute hidden md:block md:left-[170px] top-0 bottom-0 w-px bg-primary/10"></div>
              
              <div className="space-y-8 md:space-y-16">
                {storySteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col md:grid md:grid-cols-[150px_1fr] md:gap-20 items-start group relative">
                    {/* Year - Top on Mobile, Right Aligned on Desktop */}
                    <div className="md:text-right pt-1 mb-2 md:mb-0">
                      <span className="text-xl md:text-3xl font-headline text-primary md:text-stone-300 group-hover:text-primary transition-all duration-700">
                        {step.year}
                      </span>
                    </div>

                    {/* Middle Indicator - Desktop Only */}
                    <div className="hidden md:block absolute md:left-[165px] top-3 h-2.5 w-2.5 rounded-full bg-stone-200 border-2 border-white group-hover:bg-primary group-hover:scale-150 transition-all duration-500 z-10"></div>

                    {/* Content Card */}
                    <div className="w-full">
                      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-stone-100 group-hover:border-primary/10 shadow-sm hover:shadow-2xl transition-all duration-700">
                        <h4 className="font-bold text-stone-800 text-lg md:text-2xl mb-2 md:mb-4 group-hover:text-primary transition-colors">{step.title}</h4>
                        <p className="text-stone-500 font-body text-sm md:text-base leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-primary py-32 px-6 text-center text-white relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="material-symbols-outlined !text-[64px] mb-8 opacity-20">format_quote</span>
          <p className="text-2xl md:text-4xl font-headline italic mb-12 leading-tight">
            &quot;Kopi terbaik bukan hanya soal rasa, tapi tentang siapa yang ada di hadapan Anda saat meminumnya.&quot;
          </p>
          <p className="font-label tracking-widest uppercase text-xs font-bold opacity-60">— A&apos;seala Founders</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-headline text-primary mb-4">Ruang & Rasa</h2>
             <p className="text-stone-500 max-w-xl mx-auto text-sm italic font-body">Sudut-sudut hangat yang kami siapkan khusus untuk menampung setiap inspirasi Anda.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden relative group">
               <Image src="/gallery-1.png" alt="Cafe 1" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden relative mt-8 group">
               <Image src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=400" alt="Cafe 2" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
            </div>
            <div className="aspect-[3/4] rounded-3xl overflow-hidden relative group">
               <Image src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400" alt="Cafe 3" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden relative mt-12 group">
               <Image src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400" alt="Cafe 4" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-6 text-center">
        <h3 className="text-2xl md:text-3xl font-headline text-primary mb-12 max-w-2xl mx-auto leading-tight">{t('about.p2')}</h3>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Link href="/menu" className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-2xl hover:bg-stone-800 transition-all active:scale-95 text-center">
             {t('hero.explore')}
          </Link>
          <Link href="/reserve" className="w-full sm:w-auto border-2 border-primary text-primary px-10 py-5 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 text-center">
             {t('hero.reserve')}
          </Link>
        </div>
      </section>
    </div>
  );
}
