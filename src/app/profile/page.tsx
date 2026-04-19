'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  order_id: string;
  status: 'pending' | 'success' | 'preparing' | 'ready' | 'completed' | 'failure';
  gross_amount: number;
  items: OrderItem[];
  createdAt: any;
}

interface Reservation {
  id: string;
  space: string;
  date: string;
  time: string;
  status: string;
  guests: string;
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { t, formatPrice, lang } = useLanguage();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Real-time Orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Client-side sort: Latest first
      ordersData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setOrders(ordersData);
    });

    // Reservations
    const resQuery = query(
      collection(db, 'reservations'),
      where('userId', '==', user.uid)
    );

    const unsubRes = onSnapshot(resQuery, (snapshot) => {
      const resData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      
      // Client-side sort: Latest first
      resData.sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || 0;
        const timeB = (b as any).createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setReservations(resData);
    });

    return () => {
      unsubOrders();
      unsubRes();
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-navbar flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">coffee</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-200';
      case 'preparing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ready': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'failure': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-navbar min-h-screen bg-stone-50 pb-20">
      {/* Header Profile */}
      <div className="bg-primary pt-24 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 p-2 overflow-hidden shadow-2xl">
             <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=735a3e&color=fff&size=128`} alt={user.name} width={100} height={100} className="w-full h-full rounded-full" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-headline text-white mb-2">{user.name}</h1>
            <p className="text-white/60 font-body text-sm mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                 {orders.length} Rituals
               </div>
               <button onClick={() => logout()} className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                 <span className="material-symbols-outlined !text-[14px]">logout</span>
                 Logout
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 min-h-[500px] flex flex-col overflow-hidden border border-stone-100">
          
          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-stone-300 hover:text-stone-400'}`}
            >
              {t('profile.past_orders')}
            </button>
            <button 
              onClick={() => setActiveTab('reservations')}
              className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reservations' ? 'text-primary border-b-2 border-primary' : 'text-stone-300 hover:text-stone-400'}`}
            >
              {t('profile.upcoming')}
            </button>
          </div>

          <div className="p-6 md:p-10 flex-1">
            {activeTab === 'orders' ? (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-300">
                    <span className="material-symbols-outlined !text-[64px] mb-4 opacity-50">shopping_basket</span>
                    <p className="font-body text-sm">{t('profile.no_orders')}</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="relative group p-6 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
                            {t('profile.order_id')} {order.order_id}
                          </span>
                          <span className="text-xs font-bold text-stone-600 block">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {t(`order_status.${order.status}`)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-stone-100 shadow-sm">
                            <div className="w-6 h-6 rounded-lg overflow-hidden relative border border-stone-100">
                              <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                            </div>
                            <span className="text-xs font-medium text-primary">{item.quantity}x {item.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-stone-200/50">
                         <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t('profile.total')}</span>
                         <span className="font-headline text-lg text-primary">{formatPrice(order.gross_amount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                 {reservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-300">
                    <span className="material-symbols-outlined !text-[64px] mb-4 opacity-50">event</span>
                    <p className="font-body text-sm">{t('profile.no_reservations')}</p>
                  </div>
                ) : (
                  reservations.map((res) => (
                    <div key={res.id} className="p-6 rounded-3xl bg-stone-50 border border-stone-100 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
                         <span className="material-symbols-outlined !text-[32px]">
                           {res.space === 'glasshouse' ? 'window' : res.space === 'ancient' ? 'auto_stories' : 'weekend'}
                         </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline text-primary text-lg capitalize">{t(`reserve.spaces.${res.space}`) || res.space}</h4>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[14px]">calendar_today</span>
                            {res.date}
                          </span>
                          <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[14px]">schedule</span>
                            {res.time}
                          </span>
                          <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[14px]">group</span>
                            {res.guests} {t('reserve.guests')}
                          </span>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-green-50 text-green-600 border-green-100`}>
                        {res.status || 'Confirmed'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="p-8 bg-stone-50 border-t border-stone-100 text-center">
            <Link href="/menu" className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] hover:gap-4 transition-all">
               {t('hero.explore')}
               <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
