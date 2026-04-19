'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

const SHOTS = {
  hero:    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1600',
  gold:    '/images/cappuccino.png', 
  matcha:  '/images/rose_latte.png', 
  flat:    '/images/cafe_latte.png', 
  ethiop:  '/images/kopsus_aren.png', 
  andean:  '/images/cold_brew.png', 
  sultans: '/images/house_beans.png', 
  java:    '/images/iced_americano.png', 
  croiss:  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600', 
  cake:    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600', 
  bread:   'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', 
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  desc: string;
  img: string;
  featured?: boolean;
  category: string;
};

import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const AddToCartButton = ({ item, variant = 'full' }: { item: MenuItem, variant?: 'full' | 'icon' | 'hero' }) => {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [qty, setQty] = React.useState(1);

  const handleAdd = () => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.img, description: item.desc, quantity: qty });
    setQty(1);
  };

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="flex items-center justify-between bg-white text-primary rounded-full px-1 py-1 shadow-md border border-primary/10 w-28 sm:w-32 mt-3 sm:mt-0">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors">
            <span className="material-symbols-outlined text-[16px] sm:text-[20px]">remove</span>
          </button>
          <span className="font-bold text-sm sm:text-base px-2">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-on-primary-container transition-colors">
            <span className="material-symbols-outlined text-[16px] sm:text-[20px]">add</span>
          </button>
        </div>
        <button onClick={handleAdd} className="px-6 py-2.5 sm:px-8 sm:py-4 flex items-center justify-center gap-1.5 sm:gap-2 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-on-primary-container transition-colors shadow-xl whitespace-nowrap">
          <span className="material-symbols-outlined !text-[16px]">add_shopping_cart</span>
          <span>{t('menu.add')}</span>
        </button>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex items-center justify-between bg-surface-container rounded-full px-1 py-1 w-20 sm:w-24 border border-primary/5">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-stone-500 hover:bg-surface transition-colors">
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">remove</span>
          </button>
          <span className="font-bold text-xs text-stone-700">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">add</span>
          </button>
        </div>
        <button onClick={handleAdd} className="w-full text-primary hover:bg-primary-container py-2 flex items-center justify-center rounded-xl transition-colors active:scale-90 bg-primary/5 border border-primary/10">
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 w-full flex flex-col xl:flex-row items-center gap-1.5">
      <div className="flex items-center justify-between bg-surface-container rounded-xl px-1 py-1 w-full xl:w-[75px] border border-primary/5 flex-shrink-0">
        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-6 h-6 flex items-center justify-center rounded-lg text-primary hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-[14px]">remove</span>
        </button>
        <span className="font-bold text-xs text-primary">{qty}</span>
        <button onClick={() => setQty(q => q + 1)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-primary shadow-sm hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-[14px]">add</span>
        </button>
      </div>
      <button onClick={handleAdd} className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 py-2 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95 px-1 truncate">
        <span className="material-symbols-outlined !text-[14px] flex-shrink-0">add_shopping_cart</span>
        <span className="truncate">{t('menu.add')}</span>
      </button>
    </div>
  );
};

export default function MenuPage() {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { addItem } = useCart();
  const { t, formatPrice } = useLanguage();

  React.useEffect(() => {
    // 🛡️ SAFETY CHECK: If db is not initialized, don't crash
    if (!db) {
      console.warn("Database not initialized: Missing Firebase configuration.");
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setItems(productList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getCategoryItems = (cat: string) => items.filter(i => i.category === cat);
  const featuredItems = items.filter(i => i.featured && i.category === 'celestial');
  const normalCelestial = items.filter(i => !i.featured && i.category === 'celestial');

  return (
    <div className="pt-navbar min-h-screen bg-surface">
      {/* Header */}
      <header className="py-16 md:py-24 text-center px-6 border-b border-primary/5">
        <span className="font-label tracking-widest text-primary uppercase text-[10px] font-bold mb-4 block">
          {t('menu.subtitle')}
        </span>
        <h1 className="text-5xl md:text-7xl text-primary font-headline mb-6">
          {t('menu.title')}
        </h1>
        <p className="font-body text-stone-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          {t('menu.desc')}
        </p>
      </header>

      <div className="px-6 md:px-12 max-w-screen-2xl mx-auto space-y-12 md:space-y-16 py-8 md:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-30 animate-pulse">
            <span className="material-symbols-outlined text-6xl mb-4">coffee</span>
            <p className="font-headline italic">Brewing the menu...</p>
          </div>
        ) : (
          <>
            {/* Celestial Brews */}
            <section>
              <h2 className="text-2xl font-headline text-primary mb-6 border-l-4 border-primary pl-4 uppercase tracking-widest text-[11px] font-bold">
                {t('menu.cat_celestial')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {featuredItems.map(item => (
                  <div key={item.id} className="md:col-span-6 group relative overflow-hidden rounded-3xl bg-surface-container flex flex-col justify-end min-h-[320px] shadow-sm">
                    <Image src={item.img} alt={item.name} fill className="object-cover object-[center_75%] group-hover:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-black/15 transition-colors" />
                    <div className="relative glass-card p-4 sm:p-5 m-3 rounded-2xl border-white/20">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                        <div className="w-full sm:w-1/2">
                          <h3 className="text-xl font-headline text-stone-900 font-black mb-1 drop-shadow-md">{item.name}</h3>
                          <p className="text-xs text-stone-900 font-medium mb-3 drop-shadow-sm">{item.desc}</p>
                          <span className="text-sm font-extrabold text-stone-900 drop-shadow-md">{formatPrice(item.price)}</span>
                        </div>
                        <div className="w-full sm:w-auto">
                          <AddToCartButton item={item} variant="hero" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 gap-6">
                   {normalCelestial.map(item => (
                     <div key={item.id} className="glass-card p-6 rounded-3xl flex items-center gap-6 border border-primary/5 hover:border-primary/20 transition-all">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden relative flex-shrink-0">
                          <Image src={item.img} alt={item.name} fill className="object-cover" sizes="96px" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-headline text-primary">{item.name}</h3>
                          <p className="text-xs text-stone-500 mb-2">{item.desc}</p>
                          <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
                        </div>
                        <AddToCartButton item={item} variant="icon" />
                     </div>
                   ))}
                </div>
              </div>
            </section>

            {/* Ancient Blends */}
            <section className="pb-20">
              <h2 className="text-2xl font-headline text-primary mb-8 text-center uppercase tracking-widest text-[11px] font-bold">
                {t('menu.cat_ancient')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                {getCategoryItems('ancient').map(item => (
                  <div key={item.id} className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all group border border-primary/5">
                    <div className="aspect-square overflow-hidden rounded-2xl mb-3 relative">
                      <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
                    </div>
                    <div className="px-2 pb-4 text-center">
                      <h3 className="text-sm font-headline text-primary truncate">{item.name}</h3>
                      <p className="text-[10px] text-stone-400 mb-3 truncate">{item.desc}</p>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-primary-container/30 px-3 py-1 rounded-full">
                          {formatPrice(item.price)}
                        </span>
                        <AddToCartButton item={item} variant="full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Non-Coffee & Refreshers */}
            <section className="pb-12 pt-8">
              <h2 className="text-2xl font-headline text-primary mb-8 text-center uppercase tracking-widest text-[11px] font-bold">
                {t('menu.cat_noncoffee')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-7xl mx-auto">
                {getCategoryItems('noncoffee').map(item => (
                  <div key={item.id} className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all group border border-primary/5">
                    <div className="aspect-square overflow-hidden rounded-2xl mb-3 relative">
                      <Image src={item.img} alt={item.name} fill className="object-cover object-[center_75%] group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 16vw" />
                    </div>
                    <div className="px-2 pb-4 text-center">
                      <h3 className="text-sm font-headline text-primary truncate">{item.name}</h3>
                      <p className="text-[10px] text-stone-400 mb-3 truncate">{item.desc}</p>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-emerald-100/50 px-3 py-1 rounded-full">
                          {formatPrice(item.price)}
                        </span>
                        <AddToCartButton item={item} variant="full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bites & Meals */}
            <section className="pb-24 pt-8">
              <h2 className="text-2xl font-headline text-primary mb-8 text-center uppercase tracking-widest text-[11px] font-bold">
                {t('menu.cat_food')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
                {getCategoryItems('food').map(item => (
                  <div key={item.id} className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all group border border-primary/5">
                    <div className="aspect-square overflow-hidden rounded-2xl mb-3 relative">
                      <Image src={item.img} alt={item.name} fill className="object-cover object-[center_80%] group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 20vw" />
                    </div>
                    <div className="px-2 pb-4 text-center">
                      <h3 className="text-sm font-headline text-primary truncate">{item.name}</h3>
                      <p className="text-[10px] text-stone-400 mb-3 truncate">{item.desc}</p>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-orange-100/50 px-3 py-1 rounded-full">
                          {formatPrice(item.price)}
                        </span>
                        <AddToCartButton item={item} variant="full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
