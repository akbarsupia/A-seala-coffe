'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang, formatPrice } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt descending on the client to avoid Firestore composite index requirement
        orderList.sort((a: any, b: any) => {
           const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
           const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
           return timeB - timeA;
        });

        setOrders(orderList);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-[120px] pb-24 bg-surface flex flex-col items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">refresh</span>
        <p className="font-headline text-stone-500">{lang === 'id' ? 'Memuat riwayat pesanan...' : 'Loading order history...'}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settlement':
      case 'success':
      case 'capture':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  const getStatusText = (status: string) => {
    if (lang === 'id') {
      switch (status) {
        case 'settlement': case 'success': case 'capture': return 'Berhasil';
        case 'pending': return 'Menunggu Pembayaran';
        case 'deny': case 'cancel': case 'expire': case 'failure': return 'Gagal / Batal';
        default: return status;
      }
    }
    return status.toUpperCase();
  };

  return (
    <div className="min-h-screen pt-[120px] pb-24 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-headline text-primary mb-4">
            {lang === 'id' ? 'Riwayat Pesanan' : 'Order History'}
          </h1>
          <p className="text-stone-500 font-body">
            {lang === 'id' 
              ? 'Lacak dan lihat detail minuman yang telah Anda pesan sebelumnya.' 
              : 'Track and view details of your past elixir orders.'}
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-stone-100">
            <span className="material-symbols-outlined !text-[64px] text-stone-300 mb-6 block">receipt_long</span>
            <h3 className="text-xl font-headline text-stone-800 mb-2">
              {lang === 'id' ? 'Belum Ada Pesanan' : 'No Orders Yet'}
            </h3>
            <p className="text-stone-500 mb-8 max-w-sm mx-auto flex">
              {lang === 'id' 
                ? 'Sepertinya Anda belum memesan apa-apa. Mari kita seduh sesuatu yang spesial!' 
                : 'It seems you haven\'t ordered anything yet. Let\'s brew something special!'}
            </p>
            <button 
              onClick={() => router.push('/menu')}
              className="px-8 py-3.5 bg-primary text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-orange-800 transition-colors shadow-lg shadow-primary/20 inline-block"
            >
               {lang === 'id' ? 'Lihat Menu' : 'View Menu'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100">
                  <div>
                    <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-1">
                      Order ID: <span className="text-stone-700">{order.order_id}</span>
                    </p>
                    <p className="text-sm text-stone-500">
                      {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Baru Saja'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest self-start md:self-auto ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-xs">
                          {item.quantity}x
                        </span>
                        <span className="font-headline text-stone-800 text-base">{item.name}</span>
                      </div>
                      <span className="font-bold text-stone-600">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-sm text-stone-500 font-medium">Total ({order.items?.length || 0} items)</span>
                  <span className="text-xl font-headline text-primary font-bold">{formatPrice(order.gross_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
