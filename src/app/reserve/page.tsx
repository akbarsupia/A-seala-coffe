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

  const generateWhatsAppLink = (data: typeof formData) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281386176205';
    const spaceNames = {
      ethereal: lang === 'id' ? 'Area Sofa Indoor' : 'Ethereal Lounge',
      ancient: lang === 'id' ? 'Pojok Tenang (Co-working)' : 'Ancient Library',
      glasshouse: lang === 'id' ? 'Teras Kaca (Semi Outdoor)' : 'The Glasshouse'
    };
    const spaceName = spaceNames[selectedSpace] || selectedSpace;
    const message = lang === 'id' 
      ? `Halo A'seala Coffee, saya ingin konfirmasi booking tempat:\n\n*Nama:* ${data.name}\n*Email:* ${data.email}\n*Area:* ${spaceName}\n*Jumlah Tamu:* ${data.guests} Orang\n*Tanggal:* ${data.date}\n*Waktu:* ${data.time}\n*Catatan:* ${data.note || '-'}\n\nMohon konfirmasi pesanan saya. Terima kasih!`
      : `Hello A'seala Coffee, I would like to confirm my table booking:\n\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Area:* ${spaceName}\n*Guests:* ${data.guests} People\n*Date:* ${data.date}\n*Time:* ${data.time}\n*Note:* ${data.note || '-'}\n\nPlease confirm my reservation. Thank you!`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-stone-100 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold font-headline text-stone-800 mb-2">
              {lang === 'id' ? 'Reservasi Berhasil! 🎉' : 'Reservation Successful! 🎉'}
            </h3>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed font-body">
              {lang === 'id'
                ? 'Terima kasih, tempat Anda telah berhasil dipesan. Silakan klik tombol di bawah untuk konfirmasi pesanan Anda langsung ke WhatsApp kami.'
                : 'Thank you, your table has been successfully booked. Please click the button below to confirm your reservation directly to our WhatsApp.'}
            </p>

            <div className="space-y-3">
              <a
                href={generateWhatsAppLink(formData)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.472.945 6.037.945 1.61 5.316 1.606 10.748c-.001 1.674.444 3.306 1.29 4.732l-.99 3.615 3.701-.97c1.39.816 2.933 1.229 4.45 1.229zm9.053-6.438c-.3-.15-1.777-.875-2.05-.974-.275-.098-.475-.148-.675.15-.2.3-.775.974-.95 1.173-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.778-1.665-2.078-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525c-.075-.15-.675-1.625-.925-2.225-.244-.582-.49-.5-.675-.51-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275 1.05-.725 2.1-.975 2.625-.25.525-.5 1.1-.075 1.575.4.45 1.3 1.45 2.825 2.1.825.35 1.5.575 2.025.75.825.26 1.575.225 2.162.138.658-.098 1.777-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
                </svg>
                {lang === 'id' ? 'Konfirmasi via WhatsApp' : 'Confirm via WhatsApp'}
              </a>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-4 px-6 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
              </button>
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
