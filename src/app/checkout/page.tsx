'use client';

import React, { useState } from 'react';

declare global {
  interface Window {
    snap: any;
  }
}
import Link from 'next/link';
import Image from 'next/image';
import { useCart, CartItem } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export default function CheckoutPage() {
  const { items, totalPrice, removeItem } = useCart();
  const { t, formatPrice } = useLanguage();

  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax;
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'idle' | 'success' | 'pending' | 'error';
    title: string;
    message: string;
  }>({ status: 'idle', title: '', message: '' });

  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-navbar flex flex-col items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">coffee</span>
        <p className="font-headline text-stone-500">{t('checkout.loading') || 'Brewing order details...'}</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      const token = await auth.currentUser?.getIdToken();
     // SECURITY: Get Auth Token

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          userId: user?.uid || 'guest',
          customerDetails: {
            firstName: user?.name || 'Pelanggan',
            email: user?.email || 'guest@asealacoffee.com',
            phone: '08123456789'
          }
        })
      });
      const data = await res.json();
      
      if (data.token) {
        let firestoreDocId = '';
        // Save to Firestore here on the client side!
        try {
          const docRef = await addDoc(collection(db, 'orders'), {
            order_id: data.order_id || `ORDER-ASC-${Date.now()}`,
            userId: user?.uid || 'guest',
            customer_name: user?.name || 'Pelanggan',
            customer_email: user?.email || 'guest@asealacoffee.com',
            items: items,
            subtotal: totalPrice,
            tax: tax,
            gross_amount: finalTotal,
            status: 'pending',
            createdAt: serverTimestamp(),
            midtrans_token: data.token
          });
          firestoreDocId = docRef.id;
        } catch (dbError) {
          console.error("Failed to save order to Firebase:", dbError);
        }

        window.snap.pay(data.token, {
          onSuccess: async function(result: any) {
            console.log('success', result);
            if (firestoreDocId) {
              await updateDoc(doc(db, 'orders', firestoreDocId), { status: 'success' });
            }
            
            // Send Email Notification with Security Token
            try {
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  to: user?.email,
                  orderId: data.order_id,
                  customerName: user?.name || 'Pelanggan',
                  items: items,
                  total: finalTotal
                })
              });
            } catch (emailErr) {
              console.error("Failed to send receipt email:", emailErr);
            }

            setPaymentStatus({ status: 'success', title: 'Pembayaran Berhasil! 🎉', message: 'Terima kasih! Pembayaran Anda telah kami terima dan pesanan Anda sedang disiapkan.' });
            // Clear cart
            items.forEach((item: any) => removeItem(item.id));
          },
          onPending: function(result: any) {
            console.log('pending', result);
            setPaymentStatus({ status: 'pending', title: 'Menunggu Pembayaran ⏳', message: 'Silakan selesaikan instruksi pembayaran yang tertera sebelum batas waktu habis, ya.' });
            items.forEach((item: any) => removeItem(item.id));
          },
          onError: async function(result: any) {
            console.log('error', result);
            if (firestoreDocId) {
              await updateDoc(doc(db, 'orders', firestoreDocId), { status: 'failure' });
            }
            setPaymentStatus({ status: 'error', title: 'Pembayaran Gagal ❌', message: 'Maaf, sepertinya ada sedikit kendala. Uang Anda aman, silakan coba metode pembayaran yang lain.' });
          },
          onClose: function() {
            console.log('customer closed the popup without finishing the payment');
          }
        });
      } else {
        setPaymentStatus({ status: 'error', title: 'Gagal Memproses 🤕', message: 'Gagal mendapatkan tiket keranjang ke Midtrans.' });
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus({ status: 'error', title: 'Sistem Terganggu 🔌', message: 'Terjadi masalah dengan koneksi saat memproses pembayaran. Coba sebentar lagi ya.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-navbar min-h-screen bg-surface pb-20">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 text-center">
          <span className="font-label tracking-widest text-primary uppercase text-[10px] font-bold mb-4 block">
            {t('checkout.subtitle')}
          </span>
          <h1 className="text-4xl md:text-6xl text-primary font-headline">{t('checkout.title')}</h1>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border border-primary/5">
            <span className="material-symbols-outlined !text-[64px] text-stone-300 mb-6">shopping_basket</span>
            <p className="text-stone-500 font-body mb-8">{t('checkout.empty')}</p>
            <Link href="/menu" className="bg-primary text-white px-8 py-4 rounded-full text-sm font-bold shadow-xl hover:bg-on-primary-container transition-all">
              {t('hero.explore')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="md:col-span-12 lg:col-span-8 space-y-4">
              {items.map((item: CartItem) => (
                <div key={item.id} className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-stone-50 group transition-all hover:shadow-md">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden relative flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-headline text-primary truncate">{item.name}</h3>
                    <p className="text-xs font-bold text-primary/70">{formatPrice(item.price)}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="md:col-span-12 lg:col-span-4 bg-primary text-white rounded-3xl p-8 shadow-2xl sticky top-24">
              <h2 className="text-xl font-headline mb-6 border-b border-white/20 pb-4">{t('checkout.summary')}</h2>
              
              <div className="space-y-4 text-sm opacity-90 font-body mb-8">
                <div className="flex justify-between">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('checkout.tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="pt-4 border-t border-white/20 flex justify-between text-lg font-bold opacity-100">
                  <span>{t('checkout.total')}</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>


              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-white text-primary py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-stone-100 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  t('checkout.pay')
                )}
              </button>
            </div>
          </div>
        )}

        {/* Custom Premium Toast/Modal */}
        {paymentStatus.status !== 'idle' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
              onClick={() => setPaymentStatus({ status: 'idle', title: '', message: '' })} 
            />
            <div className="relative bg-surface rounded-[2rem] shadow-2xl p-8 md:p-10 max-w-sm w-full text-center border border-white/50">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${
                paymentStatus.status === 'success' ? 'bg-green-100 text-green-600' : 
                paymentStatus.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
              }`}>
                <span className="material-symbols-outlined !text-[40px]">
                  {paymentStatus.status === 'success' ? 'check_circle' : 
                   paymentStatus.status === 'error' ? 'error' : 'hourglass_bottom'}
                </span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-3">
                {paymentStatus.title}
              </h3>
              <p className="text-stone-500 font-body mb-8 text-sm leading-relaxed">
                {paymentStatus.message}
              </p>
              <button 
                onClick={() => setPaymentStatus({ status: 'idle', title: '', message: '' })}
                className="w-full bg-primary text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary-container hover:text-on-primary-container transition-all shadow-xl active:scale-95"
              >
                Baik, Mengerti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
