'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  addDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import Image from 'next/image';

// --- Types ---
type Product = {
  id: string;
  name: string;
  price: number;
  img: string;
  category: string;
  desc: string;
  featured?: boolean;
};

type Order = {
  id: string;
  order_id: string;
  gross_amount: number;
  customer_name: string;
  status: string;
  items: any[];
  createdAt: any;
};

type Reservation = {
  id: string;
  userId: string;
  name: string;
  email: string;
  guests: string | number;
  date: string;
  time: string;
  space: string;
  note: string;
  status: string;
  createdAt: any;
};

export default function AdminPage() {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const { t, formatPrice, lang } = useLanguage();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'reservations'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Drawer State
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    desc: '',
    img: '',
    category: 'celestial',
    featured: false
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, title: string, message: string, onConfirm: () => void}>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Fetch Data
  useEffect(() => {
    if (!isAdmin) return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('category')), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[]);
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders')), (snap) => {
      const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[];
      data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(data);
    });

    const unsubReservs = onSnapshot(query(collection(db, 'reservations')), (snap) => {
      const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Reservation[];
      data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReservations(data);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubReservs();
    };
  }, [isAdmin]);

  // Analytics Logic
  const analytics = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }).reverse();

    const weeklyData = last7Days.map(dateStr => {
      const dayOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt.seconds * 1000);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}` === dateStr;
      });
      return { date: dateStr, count: dayOrders.length, revenue: dayOrders.reduce((acc, current) => acc + (current.gross_amount || 0), 0) };
    });

    const productMap: Record<string, {name: string, count: number, img: string}> = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        const id = item.id || item.name;
        if (!productMap[id]) productMap[id] = { name: item.name, count: 0, img: item.img || '' };
        productMap[id].count += (item.quantity || 1);
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 3);

    const statusSummary = {
      preparing: orders.filter(o => o.status?.toLowerCase() === 'preparing').length,
      ready: orders.filter(o => o.status?.toLowerCase() === 'ready').length,
      completed: orders.filter(o => o.status?.toLowerCase() === 'completed').length
    };

    return { weeklyData, topProducts, statusSummary, last7Days };
  }, [orders]);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.gross_amount || 0), 0);
  const totalBrews = orders.length;

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, price: product.price, desc: product.desc, img: product.img, category: product.category, featured: product.featured || false });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: 0, desc: '', img: '', category: 'celestial', featured: false });
    }
    setIsModalOpen(true);
  };

  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new (window as any).Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600, MAX_HEIGHT = 600;
          let width = img.width, height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.6));
        };
        img.onerror = (err: any) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      const base64 = await compressAndConvertToBase64(file);
      setFormData({ ...formData, img: base64 });
    } catch (err) { console.error(err); alert('Gagal memproses foto.'); } finally { setIsCompressing(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) await updateDoc(doc(db, 'products', editingProduct.id), { ...formData, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, 'products'), { ...formData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setIsModalOpen(false);
    } catch (err) { console.error(err); alert('Failed to save product'); }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      show: true, title: 'Hapus Menu Permanen?', message: 'Menu ini akan dihapus selamanya. Anda yakin?',
      onConfirm: async () => { await deleteDoc(doc(db, 'products', id)); setConfirmModal(prev => ({ ...prev, show: false })); }
    });
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try { await updateDoc(doc(db, 'orders', id), { status: newStatus }); } catch(err) { console.error(err); }
  };

  const handleUpdateReservation = async (id: string, newStatus: string) => {
    try { await updateDoc(doc(db, 'reservations', id), { status: newStatus }); } catch(err) { console.error(err); }
  };

  const handleDownloadQR = () => {
    const siteUrl = window.location.origin;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(siteUrl)}`;
    fetch(qrUrl).then(response => response.blob()).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `Aseala_Coffee_Menu_QR.png`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      showNotification(lang === 'id' ? 'QR Code Diunduh' : 'QR Code Downloaded', lang === 'id' ? 'Silakan cetak QR ini.' : 'Please print this QR.', 'success');
    }).catch(err => { console.error(err); alert('Gagal mengunduh QR Code.'); });
  };

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: t('admin.title') },
    { id: 'orders', icon: 'receipt_long', label: t('admin.tab_orders') },
    { id: 'reservations', icon: 'event_seat', label: t('admin.tab_reservations') },
    { id: 'products', icon: 'category', label: t('admin.tab_products') }
  ];

  return (
    <div className="bg-stone-50 min-h-screen text-on-surface antialiased flex overflow-x-hidden">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Responsive Drawer */}
      <aside className={`fixed left-0 top-0 w-[280px] max-w-[85vw] md:w-72 h-screen bg-white border-r border-primary/5 flex flex-col z-50 shadow-2xl md:shadow-sm transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 md:p-8 border-b border-primary/5 relative">
          {/* Close Button Mobile only */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute right-4 top-6 h-8 w-8 flex items-center justify-center bg-stone-50 rounded-full text-stone-400"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          <div className="font-headline italic text-xl md:text-2xl text-primary flex items-center gap-3 mb-6 md:mb-8 cursor-pointer" onClick={() => { setIsSidebarOpen(false); router.push('/'); }}>
            <span className="material-symbols-outlined text-2xl md:text-3xl">coffee</span>A&apos;seala Caffe
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-stone-50 p-3 md:p-4 rounded-2xl border border-primary/5">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-base">{user?.name?.charAt(0)}</div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-bold text-stone-800 truncate">{user?.name}</p>
              <p className="text-[9px] md:text-[10px] text-stone-500 uppercase tracking-widest">{t('admin.role')}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 md:p-6 space-y-1 md:space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold tracking-widest text-left transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100 hover:text-primary'}`}>
              <span className="material-symbols-outlined text-lg md:text-xl">{item.icon}</span>
              <span className="uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 md:p-6 border-t border-primary/5">
          <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold tracking-widest text-red-500 hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined text-lg md:text-xl">logout</span>
            <span className="uppercase">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 min-h-screen relative">
        
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden sticky top-0 w-full z-30 bg-white/70 backdrop-blur-xl border-b border-primary/5 flex items-center justify-between p-4 px-6 shadow-sm">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="h-10 w-10 flex items-center justify-center bg-stone-50 rounded-xl text-primary"
           >
             <span className="material-symbols-outlined">menu</span>
           </button>
           <div className="font-headline italic text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">coffee</span>A&apos;seala
           </div>
           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {user?.name?.charAt(0)}
           </div>
        </div>

        <div className="px-4 py-8 md:px-12 md:py-16 max-w-7xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
                <p className="text-primary font-label tracking-[0.2em] uppercase text-[10px] font-bold mb-1">{t('admin.subtitle')}</p>
                <h1 className="text-3xl md:text-5xl font-headline font-bold text-on-surface tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h1>
             </div>
             
             {activeTab === 'products' && (
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-primary text-white px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 font-bold text-sm tracking-wide w-full md:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {t('admin.new_btn')}
                </button>
             )}
          </header>

          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* 1. Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 group hover:border-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl">payments</span>
                  <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">{lang === 'id' ? 'Pemasukan' : 'Revenue'}</p>
                  <h3 className="text-3xl font-headline mt-2">{formatPrice(totalRevenue)}</h3>
                  <p className="text-[10px] text-stone-300 mt-4 leading-relaxed">{t('admin.stats_rev_desc')}</p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-primary/5">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl">coffee</span>
                  <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Total Pesanan</p>
                  <h3 className="text-3xl font-headline mt-2">{totalBrews}</h3>
                  <div className="flex gap-2 mt-4">
                     <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[9px] font-bold">{analytics.statusSummary.preparing} {lang === 'id' ? 'Diproses' : 'Prep'}</span>
                     <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[9px] font-bold">{analytics.statusSummary.ready} {lang === 'id' ? 'Siap' : 'Ready'}</span>
                  </div>
                </div>

                <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/10 relative overflow-hidden">
                   <div className="relative z-10">
                    <span className="material-symbols-outlined mb-4 text-3xl">calendar_today</span>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Kapasitas Hari Ini</p>
                    <h3 className="text-4xl font-headline mt-2 font-bold">
                       {Math.round((reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).reduce((acc, r) => acc + Number(r.guests), 0) / 50) * 100) || 0}%
                    </h3>
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-6"><div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).reduce((acc, r) => acc + Number(r.guests), 0) / 50) * 100)}%` }}></div></div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 flex flex-col justify-center text-center">
                   <span className="material-symbols-outlined text-stone-200 text-[64px] mb-2 leading-none">qr_code_2</span>
                   <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Menu QR</p>
                   <button onClick={handleDownloadQR} className="text-primary text-xs font-bold mt-2 hover:underline active:scale-95 transition-all">Download QR Code</button>
                </div>
              </div>

              {/* 2. Advanced Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Sales Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-primary/5">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                        <h4 className="text-xl font-headline font-bold text-stone-800">Tren Penjualan Mingguan</h4>
                        <p className="text-xs text-stone-400 mt-1">Volume pesanan 7 hari terakhir</p>
                      </div>
                      <div className="flex gap-2">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-primary/20"></span> {lang === 'id' ? 'Hari' : 'Days'}</div>
                      </div>
                   </div>
                   
                   <div className="h-64 flex items-end gap-1 sm:gap-3 md:gap-6 px-2">
                       {analytics.weeklyData.map((day, i) => {
                         const maxCount = Math.max(...analytics.weeklyData.map(d => d.count), 1);
                         const height = (day.count / maxCount) * 100;
                         const dateObj = new Date(day.date);
                         const dayName = dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' });
                         
                         return (
                           <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative min-w-0">
                              {/* Tooltip */}
                              <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-[9px] px-2 py-1 rounded font-bold pointer-events-none z-10 -translate-y-2">
                                 {day.count} {lang === 'id' ? 'Pesanan' : 'Orders'}
                              </div>
                              
                              {/* Bar Container */}
                              <div className="w-full bg-stone-100 rounded-t-lg sm:rounded-t-xl overflow-hidden relative" style={{ height: '80%' }}>
                                <div 
                                  className="absolute bottom-0 w-full bg-primary rounded-t-lg sm:rounded-t-xl transition-all duration-1000 ease-out group-hover:bg-stone-800" 
                                  style={{ height: `${height}%`, transitionDelay: `${i * 100}ms` }}
                                ></div>
                                {height === 0 && <div className="absolute bottom-0 w-full bg-stone-200 h-1"></div>}
                              </div>
                              
                              <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 mt-4 uppercase tracking-tighter shrink-0">{dayName}</span>
                           </div>
                         );
                       })}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-primary/5">
                   <h4 className="text-xl font-headline font-bold text-stone-800 mb-8">Menu Terlaris</h4>
                   <div className="space-y-8">
                      {analytics.topProducts.length === 0 ? (<p className="text-center text-stone-400 text-sm italic py-10">Belum ada data.</p>) : (
                        analytics.topProducts.map((p, i) => (
                          <div key={i} className="flex items-center gap-5 group">
                             <div className="h-16 w-16 rounded-2xl overflow-hidden relative border border-primary/5 shrink-0">
                                {p.img ? <Image src={p.img} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized /> : <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300"><span className="material-symbols-outlined">coffee</span></div>}
                                <div className="absolute top-0 left-0 bg-stone-800 text-white text-[9px] font-bold w-6 h-6 flex items-center justify-center rounded-br-xl">#{i+1}</div>
                             </div>
                             <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-stone-800 text-sm truncate">{p.name}</h5>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{p.count} Terjual</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>

              {/* 3. Activity Feed */}
              <div className="bg-stone-900 text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div>
                      <div className="flex items-center gap-3 mb-10"><span className="material-symbols-outlined text-primary">history</span><h4 className="text-xl font-headline font-bold">Aktivitas Terkini</h4></div>
                      <div className="space-y-8">
                         {[...orders, ...reservations].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 4).map((act, i) => {
                             const isOrder = 'order_id' in act;
                             return (
                               <div key={i} className="flex gap-6 items-start relative pb-8 border-l border-white/10 ml-3 pl-8 last:pb-0">
                                  <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${isOrder ? 'bg-primary' : 'bg-blue-500'}`}><span className="material-symbols-outlined text-xs">{isOrder ? 'receipt' : 'event_seat'}</span></div>
                                  <div><p className="text-sm font-bold text-white/90">{isOrder ? (lang === 'id' ? `Pesanan dari ${act.customer_name || 'Tamu'}` : `Order from ${act.customer_name || 'Guest'}`) : (lang === 'id' ? `Booking oleh ${act.name}` : `Booking by ${act.name}`)}</p><p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{act.createdAt ? new Date(act.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'} &bull; {isOrder ? formatPrice(act.gross_amount) : `${act.guests} Guest`}</p></div>
                               </div>
                             );
                         })}
                      </div>
                   </div>
                   <div className="flex flex-col justify-center items-center text-center p-8 bg-white/5 rounded-3xl border border-white/10">
                      <Image src="/images/aseala_cafe.png" alt="Aseala" width={120} height={120} className="mb-6 opacity-80" />
                      <h5 className="text-lg font-headline font-bold mb-2">Semangat Barista!</h5>
                      <p className="text-sm text-white/50 leading-relaxed italic">&quot;Setiap cangkir yang Anda buat adalah alasan seseorang tersenyum.&quot;</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Tabs for Orders/Reservations/Products */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-500"><div className="overflow-hidden rounded-[2rem] bg-white shadow-sm border border-primary/5">
              <table className="w-full text-left">
                <thead><tr className="bg-stone-50 border-b border-primary/5"><th className="px-8 py-6 font-headline text-[10px] uppercase tracking-widest text-stone-400">Identity</th><th className="px-8 py-6 font-headline text-[10px] uppercase tracking-widest text-stone-400">Status</th><th className="px-8 py-6 font-headline text-[10px] uppercase tracking-widest text-stone-400 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-primary/5">{orders.map(order => (
                   <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                     <td className="px-8 py-6"><p className="text-sm font-bold text-stone-800">{order.customer_name || 'Guest'}</p></td>
                     <td className="px-8 py-6"><span className={`text-[9px] font-black px-4 py-2 rounded-full border uppercase ${order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{order.status || 'PENDING'}</span></td>
                     <td className="px-8 py-6 text-right"><select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="bg-white border p-2 rounded-lg text-[10px] font-bold uppercase"><option value="success">{t('order_status.success')}</option><option value="preparing">{t('order_status.preparing')}</option><option value="ready">{t('order_status.ready')}</option><option value="completed">{t('order_status.completed')}</option></select></td>
                   </tr>
                ))}</tbody>
              </table>
            </div></div>
          )}

          {activeTab === 'reservations' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{reservations.map(res => (
              <div key={res.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5 group"><h4 className="text-lg font-bold text-stone-800">{res.name}</h4><p className="text-xs text-stone-400 mt-1">{res.guests} Guests &bull; {res.space}</p>
                <div className="mt-6 flex items-center gap-4 text-stone-500"><div className="text-xs font-bold">{res.date}</div><div className="text-xs font-bold">{res.time}</div></div>
              </div>
            ))}</div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">{products.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-primary/5 group">
                <div className="h-48 w-full rounded-2xl overflow-hidden relative mb-4"><Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized /></div>
                <h5 className="font-bold text-stone-800">{item.name}</h5><p className="font-bold text-primary mt-4">{formatPrice(item.price)}</p>
                <div className="mt-6 flex gap-2"><button onClick={() => handleOpenModal(item)} className="p-3 bg-stone-50 rounded-xl hover:bg-stone-200"><span className="material-symbols-outlined text-sm">edit</span></button><button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button></div>
              </div>
            ))}</div>
          )}
        </div>
      </main>

      {/* Modal Tambah/Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="bg-primary p-6 md:p-8 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-headline font-bold">{editingProduct ? 'Edit Menu Kopi' : 'Tambah Menu Baru'}</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mt-1">Lengkapi Detail Produk</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="relative z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             
             <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 bg-stone-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Menu */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Nama Menu</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium text-stone-800 placeholder:text-stone-300" placeholder="Contoh: Kopi Susu Aren" />
                  </div>
                  
                  {/* Harga */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Harga (IDR)</label>
                    <input required type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium text-stone-800 placeholder:text-stone-300" placeholder="35000" />
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Deskripsi Menu</label>
                  <textarea required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium text-stone-800 placeholder:text-stone-300 min-h-[100px] resize-none" placeholder="Tuliskan cita rasa unik dari menu ini..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Kategori */}
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Kategori</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold text-primary cursor-pointer appearance-none">
                         <option value="celestial">Kopi Surgawi (Celestial)</option>
                         <option value="ancient">Menu Klasik (Ancient)</option>
                         <option value="noncoffee">Non-Kopi (Refreshers)</option>
                         <option value="food">Makanan (Bites)</option>
                      </select>
                   </div>

                   {/* Featured Switch */}
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Tampilkan di Beranda?</label>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, featured: !formData.featured})}
                        className={`w-full flex items-center justify-between px-5 py-4 border rounded-2xl transition-all ${formData.featured ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-stone-200 text-stone-400'}`}
                      >
                         <span className="text-xs font-bold uppercase tracking-wider">{formData.featured ? 'Menu Unggulan' : 'Menu Biasa'}</span>
                         <span className="material-symbols-outlined">{formData.featured ? 'check_circle' : 'circle'}</span>
                      </button>
                   </div>
                </div>

                {/* Upload Foto */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest pl-1">Foto Menu</label>
                  <div className="flex items-center gap-6 bg-white p-5 rounded-2xl border-2 border-dashed border-stone-200 group hover:border-primary transition-colors">
                    {formData.img ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden relative shadow-lg flex-shrink-0 animate-in zoom-in duration-300">
                        <Image src={formData.img} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-stone-50 flex flex-col items-center justify-center text-stone-300 flex-shrink-0 border border-stone-100">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-stone-400 font-medium mb-3">Rekomendasi ukuran: 800x800px. Maksimal 2MB (WebP).</p>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white hover:file:bg-on-primary-container cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isCompressing}
                  className="w-full py-5 bg-primary text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-stone-900 transition-all active:scale-95 disabled:opacity-50 mt-4 h-16 flex items-center justify-center gap-2"
                >
                  {isCompressing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                      Mengolah Gambar...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">{editingProduct ? 'update' : 'add_circle'}</span>
                      {editingProduct ? 'Update Menu Caffe' : 'Simpan Menu Sekarang'}
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"><div className="bg-white p-10 rounded-[2.5rem] max-w-sm text-center"><h3 className="text-2xl font-headline font-bold mb-4">{confirmModal.title}</h3><p className="text-sm text-stone-500 mb-8">{confirmModal.message}</p><div className="flex gap-4"><button onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} className="flex-1 py-4 font-bold">Batal</button><button onClick={confirmModal.onConfirm} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold">Ya, Hapus</button></div></div></div>
      )}
    </div>
  );
}
