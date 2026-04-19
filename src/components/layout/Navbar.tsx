'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const { lang, setLang, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { showNotification } = useNotification();

  const links = [
    { href: '/', label: t('nav.gateway') },
    { href: '/menu', label: t('nav.elixir') },
    { href: '/reserve', label: t('nav.reserve') },
    { href: '/about', label: t('nav.about') },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full z-[100] glass-navbar">
      <div className="flex justify-between items-center px-6 md:px-12 h-[80px] w-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300">
            <img 
              src="/logo.png" 
              alt="A'seala Caffe Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-headline italic text-xl md:text-2xl text-primary hover:opacity-100 transition-opacity">
            A&apos;seala Caffe
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm md:text-base tracking-tight">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? 'font-headline text-primary border-b-2 border-primary/30 pb-1'
                    : 'font-headline text-stone-500 hover:text-primary transition-colors'
                }
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Action Icons & Lang Switcher */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Language Switcher */}
          <div className="flex items-center bg-surface-container-low rounded-full p-1 border border-primary/10">
            <button 
              onClick={() => setLang('id')}
              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === 'id' ? 'bg-primary text-white shadow-sm' : 'text-stone-500 hover:text-primary'}`}
            >
              ID
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-stone-500 hover:text-primary'}`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-primary-container text-primary transition-colors"
              aria-label="Open cart"
            >
              <span className="material-symbols-outlined !text-[24px] md:text-[26px]">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary text-white text-[9px] md:text-[10px] flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="hidden md:block p-2 rounded-full hover:bg-primary-container text-primary transition-colors" 
                aria-label="Account"
              >
                <span className="material-symbols-outlined !text-[26px]">account_circle</span>
              </button>
              
              {isProfileOpen && (
                <div className="hidden md:flex absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden flex-col z-[100] animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
                    <p className="text-xs font-bold text-stone-800">{user ? (lang === 'id' ? `Halo, ${user.name}!` : `Hello, ${user.name}!`) : (lang === 'id' ? 'Halo, Pengunjung!' : 'Hello, Guest!')}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5 truncate">{user ? user.email : (lang === 'id' ? 'Masuk untuk nikmati benefitnya' : 'Login for more benefits')}</p>
                  </div>
                  
                  {user ? (
                    <>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsProfileOpen(false)} 
                        className="px-4 py-3 text-left text-sm text-stone-600 hover:bg-stone-50 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        {lang === 'id' ? 'Profil & Ritual' : 'Profile & Rituals'}
                      </Link>
                      <button 
                        onClick={() => { 
                          setIsProfileOpen(false); 
                          logout(); 
                          router.push('/'); 
                          showNotification(
                            lang === 'id' ? 'Berhasil Keluar' : 'Logged Out',
                            lang === 'id' ? 'Anda telah keluar. Sampai jumpa di ritual kopi berikutnya!' : 'You have logged out. See you at the next coffee ritual!',
                            'info'
                          );
                        }} 
                        className="px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-stone-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        {lang === 'id' ? 'Keluar' : 'Logout'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setIsProfileOpen(false); router.push('/login'); }} 
                        className="px-4 py-3 text-left text-sm font-bold text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        {lang === 'id' ? 'Masuk/Daftar' : 'Login/Register'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button 
              className="block md:hidden p-2 rounded-full hover:bg-primary-container text-primary transition-colors" 
              aria-label="Mobile Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined !text-[26px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 w-full min-h-[calc(100vh-80px)] bg-surface/98 backdrop-blur-3xl border-t border-primary/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-2 w-full">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-4 rounded-2xl text-lg transition-colors ${isActive ? 'bg-primary/5 text-primary font-bold' : 'text-stone-600 hover:bg-stone-50 font-headline'}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="mt-8 pt-8 border-t border-stone-200 flex flex-col gap-3">
            {user ? (
              <>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-primary">{user.name}</p>
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{user.email}</p>
                  </div>
                </div>
                <Link 
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full p-4 rounded-xl bg-surface-container-high border border-stone-200 text-stone-600 flex items-center justify-center gap-3 font-bold hover:bg-stone-100 transition-colors mb-2"
                >
                  <span className="material-symbols-outlined">person</span>
                  {lang === 'id' ? 'Profil & Pesanan' : 'Profile & Orders'}
                </Link>
                <button 
                  className="w-full p-4 rounded-xl bg-surface-container-high border border-stone-200 text-stone-600 flex items-center justify-center gap-3 font-bold hover:bg-red-50 hover:text-red-500 transition-colors" 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    router.push('/');
                    showNotification(
                      lang === 'id' ? 'Berhasil Keluar' : 'Logged Out',
                      lang === 'id' ? 'Anda telah keluar. Sampai jumpa kembali!' : 'You have logged out. See you again!',
                      'info'
                    );
                  }}
                >
                  <span className="material-symbols-outlined">logout</span>
                  {lang === 'id' ? 'Keluar Akun' : 'Logout'}
                </button>
              </>
            ) : (
              <button 
                className="w-full p-4 rounded-xl bg-surface-container-high border border-primary/5 text-primary flex items-center justify-center gap-3 font-bold hover:bg-primary hover:text-white transition-colors" 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/login');
                }}
              >
                <span className="material-symbols-outlined">login</span>
                {lang === 'id' ? 'Masuk / Daftar' : 'Sign In / Register'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
