'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => any;
  formatPrice: (price: number) => string;
}

const translations: Record<Language, any> = {
  en: {
    nav: {
      gateway: 'The Gateway',
      elixir: 'The Elixir',
      origin: 'The Origin',
      reserve: 'Reserve a Portal',
      about: 'About Us'
    },
    hero: {
      label: 'Ascend to Sensory Perfection',
      title: 'A Place for Coffee, Stories, | and Leaving with a Smile',
      subtitle: 'Savor every sip of our finest coffee while creating warm, lasting memories with family, friends, and all your loved ones in a beautifully cozy atmosphere.',
      explore: 'Explore the Elixir',
      reserve: 'Reserve a Portal'
    },
    bento: {
      ritual: 'The Morning Ritual',
      ritual_desc: 'Discover the blend that wakes the spirit and softens the edges of the early hour.',
      roasts: 'Ethereal Roasts',
      roasts_desc: 'Lighter than air, deeper than the sea. Our signature sand-roasted beans.',
      link: 'Learn About Our Coffee'
    },
    vessel: {
      title: 'The Vessel of',
      transform: 'Transformation',
      desc: 'Our curated glassware isn\'t just a container; it\'s a window. Watch the dance of the infusion.',
      precision: 'Precision Heat',
      sustainable: 'Sustainably Harvested',
      discover: 'Discover The Vessel'
    },
    seasonal: {
      title: 'The Seasonal Elixirs',
      subtitle: 'Curated Selections',
      link: 'View Entire Vault',
      limited: 'Limited Release'
    },
    menu: {
      title: 'The Elixir Catalog',
      subtitle: 'Our Signature Menu',
      desc: 'A collection of otherworldly brews crafted with precision and intention.',
      cat_celestial: 'Celestial Brews',
      cat_ancient: 'Ancient Blends',
      cat_noncoffee: 'Non-Coffee & Refreshers',
      cat_food: 'Bites & Meals',
      add: 'Add to Vessel'
    },
    reserve: {
      title: 'Reserve a Ritual',
      subtitle: 'Securing Your Portal',
      desc: 'Choose your sanctuary and lock in your time for a sensory ritual.',
      step1: 'Step 01: Choose Your Realm',
      step2: 'Step 02: Space & Time',
      step3: 'Step 03: Finalize Ritual',
      name: 'Name',
      email: 'Email',
      guests: 'Guests',
      date: 'Date',
      time: 'Time',
      note: 'Special Request',
      book: 'Commit Ritual',
      spaces: {
        ethereal: 'Ethereal Lounge',
        ancient: 'Ancient Library',
        glasshouse: 'The Glasshouse'
      }
    },
    about: {
      title: 'Welcome to A’seala Coffee ☕',
      p1: 'A’seala Coffee is where taste, comfort, and a warm atmosphere meet in one experience. We provide a variety of coffee options and special menus crafted with the highest quality to accompany your every moment.',
      p2: 'A’seala Coffee — Simple, Warm, and Memorable.'
    },
    checkout: {
      title: 'The Vessel Ritual',
      subtitle: 'Finalizing Your Acquisition',
      summary: 'Energy Summary',
      subtotal: 'Subtotal',
      tax: 'Tax (10%)',
      total: 'Total Acquisition',
      method: 'Payment Ritual',
      pay: 'Complete Acquisition',
      success: 'Acquisition Successful',
      empty: 'Your vessel is empty.'
    },
    rules: {
      title: 'Portal Rules',
      arrival: 'Arrival must be within 15 mins of ritual start.',
      large_groups: 'Special arrangements for rituals > 6 beings.'
    },
    testimonials: {
      title: 'What They Say',
      subtitle: 'Echoes of Experience'
    },
    instagram: {
      title: 'Closer on Instagram',
      subtitle: 'Share your moments',
      button: 'Follow @asealacoffee'
    },
    footer: {
      location: 'Find The Portal',
      address: 'Pajajaran Street, Babakan, Central Bogor, Bogor City, West Java 16128',
      hours: 'Open Daily: 08:00 AM - 11:00 PM',
      maps: 'Open in Maps'
    },
    admin: {
      role: 'Master Alchemist',
      subtitle: 'Administrative Overview',
      title: 'The Sanctum',
      desc: 'Orchestrating the essence of brew and the rhythm of exchange.',
      new_btn: 'NEW ELIXIR',
      stats_live: 'LIVE FEED',
      stats_daily: 'Daily Essence',
      stats_brews: 'Brews',
      stats_revenue: 'Revenue Flow',
      stats_rev_desc: 'Calculated from total orders',
      stats_cap: "Today's Capacity",
      stats_booked: 'Booked',
      tab_orders: 'Flow of Exchange (Orders)',
      tab_reservations: 'Ceremony Books (Reservs)',
      tab_products: 'Elixir Registry (Menu)',
      table_identity: 'Identity',
      table_status: 'Status',
      table_exchange: 'Exchange',
      table_action: 'Action',
      table_empty_orders: 'No orders recorded yet...',
      table_serve: 'Serve',
      table_guest: 'Guest',
      table_details: 'Details',
      table_datetime: 'Date/Time',
      table_empty_reservations: 'No table bookings yet...',
      table_arrived: 'Arrived',
      table_cancel: 'Cancel',
      items_count: 'Items',
      modal_edit: 'Edit Elixir',
      modal_new: 'New Elixir',
      form_name: 'Elixir Name',
      form_price: 'Price (IDR)',
      form_desc: 'Description',
      form_img: 'Image URL',
      form_cat: 'Category',
      form_feat: 'Featured Hero',
      btn_update: 'UPDATE ELIXIR',
      btn_manifest: 'MANIFEST ELIXIR',
      table_empty_products: 'No elixirs in your inventory yet.'
    },
    profile: {
      title: 'Your Ritual Collection',
      subtitle: 'Order History & Reservations',
      no_orders: 'No coffee rituals performed yet...',
      no_reservations: 'No scheduled sessions...',
      order_id: 'ID:',
      status: 'Status:',
      date: 'Date:',
      total: 'Total Flow:',
      upcoming: 'Upcoming Reservations',
      past_orders: 'Recent Coffee Orders'
    },
    order_status: {
      pending: 'Waiting for Flow',
      success: 'Paid & Verified',
      preparing: 'Artisan Preparation',
      ready: 'Ready for Collection',
      completed: 'Ritual Completed',
      failure: 'Flow Disrupted'
    }
  },
  id: {
    nav: {
      gateway: 'Beranda',
      elixir: 'Daftar Menu',
      origin: 'Kisah Kami',
      reserve: 'Booking Tempat',
      about: 'Tentang Kami'
    },
    hero: {
      label: 'Seduh Kopi, Seduh Cerita',
      title: 'Tempat Ngopi, Cerita, | dan Pulang dengan Senyum',
      subtitle: 'Nikmati setiap tegukan kopi terbaik sambil berbagi momen penuh kehangatan bersama keluarga, teman, hingga orang-orang tersayang yang tak dapat disebutkan satu per satu dalam suasana yang tenang dan nyaman.',
      explore: 'Lihat Daftar Menu',
      reserve: 'Booking Tempat'
    },
    bento: {
      ritual: 'Teman Pagi Kamu',
      ritual_desc: 'Mulai harimu dengan racikan kopi pas buat naikin semangat dan mood kamu seharian.',
      roasts: 'Biji Kopi Pilihan',
      roasts_desc: 'Biji kopi lokal terbaik yang di-roasting pas banget, ngasilin rasa dan aroma yang bikin nagih.',
      link: 'Kenali Kopi Kami'
    },
    vessel: {
      title: 'Teman Ngopi',
      transform: 'Paling Estetik',
      desc: 'Gelas kami didesain khusus buat bikin pengalaman ngopimu makin berkesan. Bukan cuma tempat minum biasa, tapi visualnya juga manjain mata lho.',
      precision: 'Suhu Paling Pas',
      sustainable: 'Ramah Lingkungan',
      discover: 'Intip Koleksi Gelas Kami'
    },
    seasonal: {
      title: 'Menu Musim Ini',
      subtitle: 'Rekomendasi Spesial',
      link: 'Lihat Semua Menu',
      limited: 'Edisi Terbatas'
    },
    menu: {
      title: 'Menu Andalan Kami',
      subtitle: 'Pilih Kopi Favoritmu',
      desc: 'Banyak pilihan minuman spesial yang diracik khusus buat naikin mood kamu hari ini. Yuk dicoba, pasti ketagihan!',
      cat_celestial: 'Signature Kekinian',
      cat_ancient: 'Klasik & Original',
      cat_noncoffee: 'Non-Kopi & Penyegar',
      cat_food: 'Makanan & Cemilan',
      add: 'Pesan Sekarang'
    },
    reserve: {
      title: 'Booking Tempat',
      subtitle: 'Amankan Meja Biar Nyaman',
      desc: 'Pilih spot nongkrong paling cozy dan tentukan waktunya biar kamu nggak usah rebutan tempat!',
      step1: 'Langkah 01: Pilih Area',
      step2: 'Langkah 02: Tentukan Waktu',
      step3: 'Langkah 03: Konfirmasi Pesanan',
      name: 'Nama',
      email: 'Email',
      guests: 'Tamu',
      date: 'Tanggal',
      time: 'Waktu',
      note: 'Permintaan Khusus',
      book: 'Selesaikan Pesanan',
      spaces: {
        ethereal: 'Area Sofa Indoor',
        ancient: 'Pojok Tenang (Co-working)',
        glasshouse: 'Teras Kaca (Semi Outdoor)'
      }
    },
    about: {
      title: 'Welcome to A’seala Coffee ☕',
      p1: 'A’seala Coffee adalah tempat di mana cita rasa, kenyamanan, dan suasana hangat bertemu dalam satu pengalaman. Kami menghadirkan berbagai pilihan kopi dan menu spesial yang dibuat dengan kualitas terbaik untuk menemani setiap momen kamu.',
      p2: 'A’seala Coffee — Simple, Warm, and Memorable.'
    },
    checkout: {
      title: 'Pesanan Kamu',
      subtitle: 'Selesaikan Pembayaran Dulu Ya',
      summary: 'Ringkasan Pesanan',
      subtotal: 'Subtotal',
      tax: 'Pajak (10%)',
      total: 'Total Bayar',
      method: 'Metode Pembayaran',
      pay: 'Bayar Sekarang',
      success: 'Pembayaran Berhasil',
      empty: 'Keranjang kamu masih kosong nih.'
    },
    rules: {
      title: 'Aturan Reservasi',
      arrival: 'Toleransi keterlambatan maksimal 15 menit ya.',
      large_groups: 'Untuk rombongan lebih dari 6 orang, harap lapor admin.'
    },
    testimonials: {
      title: 'Apa Kata Mereka?',
      subtitle: 'Cerita Pelanggan Singgah'
    },
    instagram: {
      title: 'Lebih Dekat di Instagram',
      subtitle: 'Bagikan momen nongkrongmu',
      button: 'Follow @asealacoffee'
    },
    footer: {
      location: 'Mampir Kesini',
      address: 'Jl. Raya Pajajaran, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128',
      hours: 'Buka Setiap Hari: 08.00 - 23.00',
      maps: 'Buka di Maps'
    },
    admin: {
      role: 'Admin Kafe',
      subtitle: 'Ringkasan Admin',
      title: 'Dashboard Utama',
      desc: 'Mengatur arus pesanan, menu, dan meja kafe.',
      new_btn: 'TAMBAH MENU',
      stats_live: 'STATISTIK',
      stats_daily: 'Pesanan Hari Ini',
      stats_brews: 'Pesanan',
      stats_revenue: 'Pemasukan',
      stats_rev_desc: 'Dihitung dari total pesanan',
      stats_cap: "Kapasitas Hari Ini",
      stats_booked: 'Terisi',
      tab_orders: 'Pesanan Masuk (Orders)',
      tab_reservations: 'Buku Tamu (Reservasi)',
      tab_products: 'Daftar Menu (Gudang)',
      table_identity: 'Pemesan',
      table_status: 'Status',
      table_exchange: 'Total',
      table_action: 'Aksi',
      table_empty_orders: 'Belum ada pesanan...',
      table_serve: 'Sajikan',
      table_guest: 'Tamu',
      table_details: 'Detail',
      table_datetime: 'Tanggal/Waktu',
      table_empty_reservations: 'Belum ada reservasi meja...',
      table_arrived: 'Datang',
      table_cancel: 'Batal',
      items_count: 'Menu',
      modal_edit: 'Edit Menu',
      modal_new: 'Menu Baru',
      form_name: 'Nama Menu',
      form_price: 'Harga (Rp)',
      form_desc: 'Deskripsi',
      form_img: 'Link Foto',
      form_cat: 'Kategori',
      form_feat: 'Produk Unggulan',
      btn_update: 'SIMPAN MENU',
      btn_manifest: 'BUAT MENU',
      table_empty_products: 'Belum ada menu di gudang Anda.'
    },
    profile: {
      title: 'Koleksi Ritual Anda',
      subtitle: 'Riwayat Pesanan & Reservasi',
      no_orders: 'Belum ada ritual kopi dilakukan...',
      no_reservations: 'Belum ada jadwal singgah...',
      order_id: 'ID:',
      status: 'Status:',
      date: 'Tanggal:',
      total: 'Total Transaksi:',
      upcoming: 'Reservasi Mendatang',
      past_orders: 'Pesanan Kopi Terbaru'
    },
    order_status: {
      pending: 'Menunggu Pembayaran',
      success: 'Sudah Dibayar',
      preparing: 'Sedang Disiapkan',
      ready: 'Siap Diambil',
      completed: 'Selesai',
      failure: 'Pembayaran Gagal'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('aseala-lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('aseala-lang', newLang);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
