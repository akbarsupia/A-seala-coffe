'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import dynamic from 'next/dynamic';

const Antigravity = dynamic(() => import('@/components/Antigravity'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-surface/50 animate-pulse" />
});

const SHOTS = {
  bg:     'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1600', 
  ritual: '/images/aseala_cafe_large.png', 
  beans:  '/images/house_beans.png',  
  vessel: '/images/aesthetic_glass.png',  
  rose:   '/images/rose_latte.png',  
  cold:   '/images/cold_brew.png',  
  gold:   '/images/cappuccino.png',  
};

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="pt-navbar scroll-smooth">
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Animated Antigravity Background */}
        <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply transition-opacity duration-1000">
           <Antigravity
            count={250}
            magnetRadius={8}
            ringRadius={6}
            waveSpeed={0.3}
            waveAmplitude={1.2}
            particleSize={1.5}
            lerpSpeed={0.05}
            color="#735a3e" // Matching the theme's primary brown color
            autoAnimate={true}
            particleVariance={1.5}
            rotationSpeed={0.2}
            depthFactor={1.5}
            pulseSpeed={2}
            particleShape="capsule"
            fieldStrength={12}
          />
        </div>

        {/* Subtle Image Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={SHOTS.bg}
            alt="A'seala Caffe Atmosphere"
            fill
            className="object-cover opacity-[0.08] scale-100"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface" />
        </div>

        {/* Content with no overlap */}
        <div className="relative z-10 max-w-4xl space-y-6 md:space-y-8">
          <span className="font-label tracking-[0.3em] md:tracking-[0.4em] text-primary uppercase text-xs font-bold block">
            {t('hero.label')}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl leading-[1.1] text-primary text-balance">
            {t('hero.title').split('|')[0]} 
            {t('hero.title').includes('|') && (
              <>
                <br />
                <em className="font-normal italic">
                  {t('hero.title').split('|')[1]}
                </em>
              </>
            )}
          </h1>
          <p className="font-body text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed px-4">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/menu"
              className="bg-primary text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-on-primary-container hover:text-white shadow-xl transition-all"
            >
              {t('hero.explore')}
            </Link>
            <Link
              href="/reserve"
              className="bg-white/50 backdrop-blur-md border border-stone-200 px-8 py-4 rounded-full text-sm font-semibold text-primary hover:bg-stone-50 transition-all focus:outline-none"
            >
              {t('hero.reserve')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID ───────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[450px]">
          {/* Main Card */}
          <div className="md:col-span-6 group relative overflow-hidden rounded-3xl bg-surface-container-low min-h-[300px] md:min-h-0">
            <Image
              src={SHOTS.ritual}
              alt="The Morning Ritual"
              fill
              className="object-cover object-[center_45%] transition-transform duration-1000 group-hover:scale-105 opacity-[0.85]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8 md:right-8">
              <h3 className="text-2xl md:text-3xl mb-2 font-headline">{t('bento.ritual')}</h3>
              <p className="text-sm md:text-base opacity-90 max-w-md font-body leading-relaxed">
                {t('bento.ritual_desc')}
              </p>
            </div>
          </div>

          {/* Beans Image (Portrait) */}
          <div className="md:col-span-3 relative rounded-3xl overflow-hidden min-h-[250px] md:min-h-0">
            <Image src={SHOTS.beans} alt="Coffee beans" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 25vw" />
          </div>

          {/* ROASTS Text Card (Portrait) */}
          <div className="md:col-span-3 glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-primary/5 min-h-[250px] md:min-h-0">
            <div>
              <span className="material-symbols-outlined !text-[36px] text-primary mb-4 block">local_cafe</span>
              <h3 className="text-xl md:text-2xl text-primary mb-2 font-headline leading-tight">{t('bento.roasts')}</h3>
              <p className="text-xs md:text-sm text-stone-600 font-body leading-relaxed mb-6">
                {t('bento.roasts_desc')}
              </p>
            </div>
            <Link href="/menu" className="font-bold text-[10px] md:text-xs tracking-widest uppercase text-primary flex items-center gap-2 group/link">
              {t('bento.link')}
              <span className="material-symbols-outlined !text-[12px] md:text-[14px] group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── VESSEL SECTION ─────────────────────────────── */}
      <section className="bg-primary-container/40 py-20 rounded-[3rem] mx-4 md:mx-10 mb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-video md:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl">
            <Image src={SHOTS.vessel} alt="The Vessel" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-4xl md:text-6xl text-primary leading-tight font-headline">
              {t('vessel.title')} <br />
              <span className="italic font-normal">{t('vessel.transform')}</span>
            </h2>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed font-body">
              {t('vessel.desc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: 'temp_preferences_custom', text: t('vessel.precision') },
                { icon: 'eco', text: t('vessel.sustainable') },
              ].map(({ icon, text }) => (
                <div key={icon} className="flex items-center gap-3 text-primary bg-white/50 p-3 rounded-xl border border-white">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">{text}</span>
                </div>
              ))}
            </div>
            <Link
              href="/menu"
              className="inline-block bg-primary text-white px-10 py-5 rounded-full text-sm font-semibold hover:bg-on-primary-container transition-all"
            >
              {t('vessel.discover')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEASONAL SLIDER ─────────────────────────────── */}
      <section className="pb-24">
        <div className="px-6 md:px-12 mb-10 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl text-primary font-headline">{t('seasonal.title')}</h2>
            <p className="text-sm text-stone-500 mt-1 uppercase tracking-widest">{t('seasonal.subtitle')}</p>
          </div>
          <Link href="/menu" className="text-primary text-xs font-bold border-b border-primary/30 pb-1">{t('seasonal.link')}</Link>
        </div>
        <div className="flex gap-6 overflow-x-auto px-[calc(50vw-105px)] md:px-12 no-scrollbar snap-x snap-mandatory pb-4 md:justify-center">
          {[
            { name: 'Ice Rose Latte', price: '35000', img: SHOTS.rose },
            { name: 'Cold Brew Coffee', price: '30000', img: SHOTS.cold },
            { name: 'Hot Cappuccino', price: '30000', img: SHOTS.gold },
            { name: 'Cafe Latte', price: '32000', img: '/images/cafe_latte.png' },
          ].map((item) => (
            <div key={item.name} className="snap-center w-[210px] md:w-[320px] flex-shrink-0 group">
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-surface-container-high relative">
                <Image src={item.img} alt={item.name} fill className="object-cover object-[center_75%] group-hover:scale-110 transition-transform duration-1000" sizes="210px" />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseInt(item.price))}
                </div>
              </div>
              <h4 className="text-lg text-primary font-headline">{item.name}</h4>
              <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest">{t('seasonal.limited')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 bg-surface-container-low max-w-screen-2xl mx-auto rounded-[3rem] mb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined !text-[200px]">format_quote</span>
        </div>
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl text-primary font-headline">{t('testimonials.title')}</h2>
          <p className="text-sm text-stone-500 mt-2 uppercase tracking-widest">{t('testimonials.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            {
              name: 'Sarah M.',
              role: 'Local Guide',
              text: '"Tempatnya cozy banget buat nugas. Kopinya juga otentik. Bakal jadi tempat nongkrong favorit baruku!"',
            },
            {
              name: 'Bima A.',
              role: 'Coffee Enthusiast',
              text: '"Pelayanannya ramah, suasana asri. Vibe Scandinavian-nya kerasa banget walau di tengah kota sibuk."',
            },
            {
              name: 'Nadia R.',
              role: 'Food Blogger',
              text: '"Kopi aren-nya juara! Gelasnya unik-unik bikin pengalaman ngopi rasanya makin premium dan mewah."',
            }
          ].map((review, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 hover:-translate-y-2 transition-transform duration-500">
              <div className="flex gap-1 text-amber-400 mb-6">
                {[1,2,3,4,5].map(star => <span key={star} className="material-symbols-outlined !text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>)}
              </div>
              <p className="text-stone-700 italic font-body text-sm leading-relaxed mb-8">
                {review.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline font-bold">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-primary">{review.name}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTAGRAM GRID ───────────────────────────────── */}
      <section className="pb-24 max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl text-primary font-headline">{t('instagram.title')}</h2>
            <p className="text-sm text-stone-500 mt-2 uppercase tracking-widest">{t('instagram.subtitle')}</p>
          </div>
          <a href="#" className="flex items-center justify-center w-full md:w-auto gap-2 bg-stone-900 text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-primary transition-colors">
            <span className="material-symbols-outlined !text-[18px]">photo_camera</span>
            {t('instagram.button')}
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600',
          ].map((url, i) => (
            <div key={i} className="aspect-square relative rounded-2xl overflow-hidden group">
              <Image src={url} alt={`Instagram highlight ${i+1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-white !text-[32px]">favorite</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
