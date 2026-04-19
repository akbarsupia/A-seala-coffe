'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

const SPACES = {
  ethereal: '/images/sofa_indoor.png',
  ancient: '/images/pojok_tenang.png',
  glasshouse: '/images/teras_kaca.png',
};

export default function ReservePage() {
  const [selectedSpace, setSelectedSpace] = useState<'ethereal' | 'ancient' | 'glasshouse'>('ethereal');
  const { t, lang } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '2',
    date: '',
    time: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlot, setIsCheckingSlot] = useState(false);
  const [isSlotFull, setIsSlotFull] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/reserve');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, email: user.email || '' }));
    }
  }, [user]);

  // Check slot availability
  React.useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.date || !formData.time || !selectedSpace) {
        setIsSlotFull(false);
        return;
      }

      try {
        setIsCheckingSlot(true);
        const q = query(
          collection(db, 'reservations'),
          where('date', '==', formData.date),
          where('space', '==', selectedSpace),
          where('status', '==', 'confirmed')
        );

        const querySnapshot = await getDocs(q);
        
        // Convert selected time to minutes for easy comparison
        const [selH, selM] = formData.time.split(':').map(Number);
        const selectedMinutes = selH * 60 + selM;

        let conflict = false;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const [h, m] = data.time.split(':').map(Number);
          const resMinutes = h * 60 + m;

          // 2-hour buffer (120 minutes)
          if (Math.abs(selectedMinutes - resMinutes) < 120) {
            conflict = true;
          }
        });

        setIsSlotFull(conflict);
      } catch (err) {
        console.error("Slot check error:", err);
      } finally {
        setIsCheckingSlot(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.date, formData.time, selectedSpace]);

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-navbar flex flex-col items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">coffee</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.date || !formData.time) return;

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'reservations'), {
        userId: user?.uid,
        ...formData,
        space: selectedSpace,
        createdAt: serverTimestamp(),
        status: 'confirmed'
      });

      // Get Token for Security
      const token = await auth.currentUser?.getIdToken();

      // Send Email with Security Token
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: formData.email,
          customerName: formData.name,
          type: 'reservation',
          space: selectedSpace,
          guests: formData.guests,
          date: formData.date,
          time: formData.time,
          note: formData.note
        })
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/');
      }, 5000);
    } catch (err) {
      console.error('Reservation error:', err);
      alert('Maaf, pesanan gagal diproses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-12 fade-in duration-500 w-[90%] max-w-[400px]">
          <div className="bg-surface border border-stone-200/50 shadow-2xl rounded-2xl p-4 flex items-start gap-4">
            <span className="material-symbols-outlined text-green-600 text-3xl mt-1">check_circle</span>
            <div>
              <h4 className="font-bold text-stone-800 text-sm mb-1">Berhasil Dipesan! 🎉</h4>
              <p className="text-stone-600 text-xs font-medium leading-relaxed">Terima kasih, tempat duduk Anda telah diamankan. Silakan cek email masuk untuk melihat detail bukti reservasi Anda.</p>
            </div>
          </div>
        </div>
      )}
    <div className="pt-navbar min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-primary pt-24 pb-32 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-70 mb-4 block">
            {t('reserve.subtitle')}
          </span>
          <h1 className="text-5xl md:text-7xl font-headline mb-4">{t('reserve.title')}</h1>
          <p className="max-w-xl mx-auto text-sm md:text-base opacity-80 font-body leading-relaxed">
            {t('reserve.desc')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-stone-100">
            {/* Step 1: Choose Realm */}
            <section className="mb-12">
              <h2 className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-6 pb-2 border-b border-stone-100">
                {t('reserve.step1')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'ethereal', title: t('reserve.spaces.ethereal'), img: SPACES.ethereal },
                  { key: 'ancient', title: t('reserve.spaces.ancient'), img: SPACES.ancient },
                  { key: 'glasshouse', title: t('reserve.spaces.glasshouse'), img: SPACES.glasshouse },
                ].map(({ key, title, img }) => {
                  const isSelected = selectedSpace === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSpace(key as any)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all text-left block ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/20'}`}
                    >
                      <Image src={img} alt={title} width={400} height={200} className="w-full h-40 object-cover opacity-90 transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                        <span className="text-white text-xs font-bold uppercase tracking-widest">{title}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full">
                          <span className="material-symbols-outlined !text-[14px]">check</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Form */}
            <section className="mb-12">
              <h2 className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-8 pb-2 border-b border-stone-100">
                {t('reserve.step2')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('reserve.name')}</label>
                  <input type="text" disabled value={formData.name} className="w-full bg-stone-100 text-stone-500 border-stone-100 border-2 rounded-2xl p-4 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('reserve.email')}</label>
                  <input type="email" disabled value={formData.email} className="w-full bg-stone-100 text-stone-500 border-stone-100 border-2 rounded-2xl p-4 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('reserve.guests')}</label>
                  <select value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className="w-full bg-stone-50 border-stone-100 border-2 rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all cursor-pointer">
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {t('reserve.guests')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('reserve.date')}</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-stone-50 border-stone-100 border-2 rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('reserve.time')}</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-stone-50 border-stone-100 border-2 rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('reserve.note')}</label>
                  <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-stone-50 border-stone-100 border-2 rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all" placeholder="..." />
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isSubmitting || isSlotFull || isCheckingSlot} 
              className={`w-full flex items-center justify-center gap-2 py-5 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${isSlotFull ? 'bg-red-500 text-white' : 'bg-primary text-white hover:bg-on-primary-container'}`}
            >
              {isCheckingSlot ? (
                 <>
                   <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                   {lang === 'id' ? 'Mengecek Kursi...' : 'Checking Availability...'}
                 </>
              ) : isSlotFull ? (
                <>
                   <span className="material-symbols-outlined text-sm">error</span>
                   {lang === 'id' ? 'Meja Sudah Terisi' : 'Slot Already Booked'}
                </>
              ) : isSubmitting ? (
                 <>
                   <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                   {lang === 'id' ? 'Memproses...' : 'Processing...'}
                 </>
              ) : t('reserve.book')}
            </button>
            {isSlotFull && (
              <p className="text-red-500 text-[10px] font-bold text-center mt-3 uppercase tracking-widest animate-pulse">
                {lang === 'id' 
                  ? '* Area ini sudah dipesan pada jam tersebut (setiap booking untuk 2 jam).' 
                  : '* This area is already booked for that time (each booking is for 2 hours).'}
              </p>
            )}
          </form>

          {/* Info Side */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
              <h3 className="text-xl font-headline text-primary mb-4">{t('rules.title')}</h3>
              <ul className="space-y-4 text-sm text-stone-600 font-body">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">timer</span>
                  <span>{t('rules.arrival')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">group</span>
                  <span>{t('rules.large_groups')}</span>
                </li>
              </ul>
            </div>
            
            <div className="relative rounded-3xl overflow-hidden aspect-square shadow-lg">
               <Image src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800" alt="Cafe details" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
