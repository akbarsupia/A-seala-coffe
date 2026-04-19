'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotification } from '@/context/NotificationContext';

const AsealaMascot = ({ focused }: { focused: string }) => {
  const isPassword = focused === 'password';
  const isEmail = focused === 'email';
  const isName = focused === 'name';

  // Calculate pupil positions to 'look' at the form
  const pupilXOffset = isName ? 10 : (isEmail ? 12 : 0);
  const pupilYOffset = isName ? -2 : (isEmail ? 2 : 0); 

  return (
    <div className="relative w-64 h-64 lg:w-80 lg:h-80 mx-auto flex items-center justify-center -mt-16 mb-8">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
        {/* Soft Shadow */}
        <ellipse cx="100" cy="188" rx="50" ry="8" fill="rgba(0,0,0,0.2)" className={`transition-all duration-500 ease-out ${isPassword ? 'scale-90 opacity-60' : 'scale-100 opacity-100'}`} />
        
        <g className={`transition-transform duration-500 origin-bottom ${isPassword ? 'scale-y-[0.98] -translate-y-1' : ''}`}>
          {/* Animated Coffee Steam */}
          <g fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
            <path d="M 85 20 C 75 0 95 -20 85 -40">
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-25; 0,0" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 0.6; 0" dur="4s" repeatCount="indefinite" />
            </path>
            <path d="M 100 20 C 115 0 85 -20 100 -40">
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-30; 0,0" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 0.5; 0" dur="3.5s" repeatCount="indefinite" />
            </path>
            <path d="M 115 20 C 125 5 105 -15 115 -35">
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-20; 0,0" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 0.4; 0" dur="5s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Straw */}
          <path d="M 120 10 L 130 50 L 115 50 L 110 10 Z" fill="#A5D6A7" className="opacity-90" />
          <path d="M 110 8 Q 115 5 120 10 L 115 15 L 105 13 Z" fill="#81C784" />

          {/* Cup Body (Chubby) */}
          <path d="M 50 45 L 150 45 L 135 170 Q 133 180 120 180 L 80 180 Q 67 180 65 170 Z" fill="#FFFDF9" />
          
          {/* Logo Text on Cup Body */}
          <text x="100" y="86" textAnchor="middle" fill="#735a3e" className="font-headline font-black tracking-tight opacity-90" style={{ fontSize: '20px' }}>A'seala</text>

          {/* Coffee Sleeve */}
          <path d="M 55 100 L 145 100 L 142 145 Q 100 152 58 145 Z" fill="#8D6E63" />
          <path d="M 55 100 L 68 100 L 65 145 Q 60 144 58 145 Z" fill="#795548" className="opacity-30" />

          {/* Lid Dome */}
          <path d="M 40 45 C 40 5, 160 5, 160 45 Z" fill="#F5F5F5" />
          <path d="M 33 43 L 167 43 Q 170 47 167 52 L 33 52 Q 30 47 33 43 Z" fill="#5D4037" />

          {/* Cheeks */}
          <ellipse cx="65" cy="128" rx="9" ry="5" fill="#FF8A80" className="opacity-80" />
          <ellipse cx="135" cy="128" rx="9" ry="5" fill="#FF8A80" className="opacity-80" />

          {/* Standard Eyes (White background) */}
          <circle cx="78" cy="115" r="16" fill="white" />
          <circle cx="122" cy="115" r="16" fill="white" />

          {/* Squint / Closed Eyes (when covering eyes) */}
          <g className={`transition-opacity duration-300 ${isPassword ? 'opacity-100' : 'opacity-0'}`}>
            <path d="M 66 115 Q 78 102 90 115" stroke="#3E2723" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 110 115 Q 122 102 134 115" stroke="#3E2723" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>

          {/* Open Eyes containing Pupils & Catchlights */}
          <g className={`transition-opacity duration-300 ${isPassword ? 'opacity-0' : 'opacity-100'}`}>
            <g className="transition-all duration-300" style={{ transform: `translate(${pupilXOffset}px, ${pupilYOffset}px)` }}>
              <circle cx="78" cy="115" r="9" fill="#3E2723" />
              <circle cx="75" cy="112" r="3.5" fill="white" /> {/* Kawaii highlight */}
              
              <circle cx="122" cy="115" r="9" fill="#3E2723" />
              <circle cx="119" cy="112" r="3.5" fill="white" /> {/* Kawaii highlight */}
            </g>
          </g>

          {/* Cute Cat Mouth :3 (Always smiling now!) */}
          <g className="transition-all duration-300 origin-center" style={{ transformOrigin: '100px 135px' }}>
            <path d="M 94 133 Q 100 140 100 133 Q 100 140 106 133" stroke="#3E2723" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Hands - Animated (using direct SVG coordinate interpolation for 100% zero-bug positioning) */}
          <g>
            {/* Left Hand */}
            <g>
              <ellipse 
                cx={isPassword ? 78 : 70} 
                cy={isPassword ? 115 : 160} 
                rx={isPassword ? 16 : 14} 
                ry={isPassword ? 11 : 10} 
                fill="#EFEBE9" stroke="#8D6E63" strokeWidth="2.5" 
                className="transition-all duration-500 ease-out" 
              />
              <path 
                d={isPassword 
                  ? "M 72 111 L 72 119 M 79 109 L 79 121 M 86 111 L 86 119"
                  : "M 64 156 L 64 164 M 71 154 L 71 166 M 78 156 L 78 164"
                } 
                stroke="#A1887F" strokeWidth="1.5" strokeLinecap="round" 
                className="opacity-60 transition-all duration-500 ease-out" 
              />
            </g>
            
            {/* Right Hand */}
            <g>
              <ellipse 
                cx={isPassword ? 122 : 130} 
                cy={isPassword ? 115 : 160} 
                rx={isPassword ? 16 : 14} 
                ry={isPassword ? 11 : 10} 
                fill="#EFEBE9" stroke="#8D6E63" strokeWidth="2.5" 
                className="transition-all duration-500 ease-out" 
              />
              <path 
                d={isPassword 
                  ? "M 114 111 L 114 119 M 121 109 L 121 121 M 128 111 L 128 119"
                  : "M 122 156 L 122 164 M 129 154 L 129 166 M 136 156 L 136 164"
                } 
                stroke="#A1887F" strokeWidth="1.5" strokeLinecap="round" 
                className="opacity-60 transition-all duration-500 ease-out" 
              />
            </g>
          </g>

        </g>
      </svg>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">coffee</span></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [focusedField, setFocusedField] = useState<'none' | 'name' | 'email' | 'password'>('none');
  const [isLoginView, setIsLoginView] = useState(true);
  const [isResetView, setIsResetView] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const { login, register, loginWithGoogle, resetPassword } = useAuth();

  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isResetView) {
        await resetPassword(email);
        showNotification(
          lang === 'id' ? 'Email Terkirim' : 'Email Sent',
          lang === 'id' ? `Instruksi pemulihan telah dikirim ke ${email}. Silakan cek kotak masuk Anda.` : `Recovery instructions have been sent to ${email}. Please check your inbox.`,
          'success'
        );
        setIsResetView(false);
      } else if (isLoginView) {
        await login(email, password);
        showNotification(
          lang === 'id' ? 'Berhasil Masuk' : 'Login Successful',
          lang === 'id' ? 'Selamat datang kembali! Mari nikmati menu A\'seala hari ini. ☕' : 'Welcome back! Let\'s enjoy A\'seala\'s menu today. ☕',
          'success'
        );
      } else {
        await register(email, password, name);
        showNotification(
          lang === 'id' ? 'Akun Manifested!' : 'Account Manifested!',
          lang === 'id' ? `Selamat bergabung, ${name}! Ritual kopi Anda dimulai sekarang.` : `Welcome aboard, ${name}! Your coffee ritual begins now.`,
          'success'
        );
      }
      
      if (!isResetView) router.push(redirectTo);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found') {
        setError(lang === 'id' ? 'Email tidak ditemukan dalam sistem kami.' : 'Email not found in our system.');
      } else if (err.code === 'auth/invalid-email') {
        setError(lang === 'id' ? 'Format email tidak valid.' : 'Invalid email format.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(lang === 'id' ? 'Email atau kata sandi salah.' : 'Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError(lang === 'id' ? 'Email sudah terdaftar.' : 'Email already in use.');
      } else if (err.code === 'auth/too-many-requests') {
        setError(lang === 'id' ? 'Terlalu banyak percobaan. Silakan coba lagi nanti.' : 'Too many attempts. Please try again later.');
      } else {
        setError(lang === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await loginWithGoogle();
      
      showNotification(
        lang === 'id' ? 'Berhasil Masuk' : 'Login Successful',
        lang === 'id' ? 'Selamat datang! Ritual kopi Anda dimulai sekarang. ☕✨' : 'Welcome! Your coffee ritual begins now. ☕✨',
        'success'
      );
      
      router.push(redirectTo);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError(lang === 'id' ? 'Pop-up diblokir oleh browser. Silakan izinkan pop-up untuk lanjut.' : 'Popup blocked by browser. Please allow popups to continue.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(lang === 'id' ? 'Jendela login ditutup. Silakan coba lagi.' : 'Login window closed. Please try again.');
      } else {
        setError(lang === 'id' ? 'Gagal masuk dengan Google. Silakan coba lagi.' : 'Failed to sign in with Google. Please try again.');
        console.error('Google Auth error:', err);
      }
      setIsLoading(false);
    } 
  };

  return (
    <>

    <div className="min-h-screen pt-[80px] flex bg-surface-container-lowest">
      {/* Visual Section - Hidden on small mobile */}
      {/* Visual Section - Chocolate Aseala Theme */}
      <div className="hidden md:flex flex-col flex-1 relative bg-[#5c452b] overflow-hidden items-center justify-center md:rounded-r-[40px] lg:rounded-r-[60px] shadow-[20px_0_50px_rgba(92,69,43,0.15)] z-10 transition-all duration-500">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes aura-spin {
            0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
            50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); }
            100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
          }
          @keyframes float-particle {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.4; }
            100% { transform: translateY(-400px) translateX(40px) scale(0.5); opacity: 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.9; }
          }
        `}} />

        {/* 1. Chocolate Premium Base (Aseala Theme) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#735a3e] via-[#5c452b] to-[#3a2a18]" />

        {/* 2. Majestic Cinematic Lighting (Soft Milk/Cream Sweeps) */}
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-[#f5f1ed]/10 to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-tr from-transparent via-[#f5f1ed]/5 to-transparent rotate-[-45deg] pointer-events-none" />

        {/* 3. The "Aseala Aura" (Creamy Glowing Halo Behind Mascot) */}
        <div className="absolute top-[40%] left-1/2 pointer-events-none z-0 mix-blend-screen" style={{ animation: 'aura-spin 20s linear infinite', width: '400px', height: '400px' }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#f5f1ed]/40 via-amber-100/20 to-transparent rounded-full blur-[40px]" />
          <div className="absolute inset-4 bg-gradient-to-bl from-orange-100/20 via-transparent to-[#f5f1ed]/10 rounded-full blur-[20px]" />
          <div className="absolute inset-10 bg-black rounded-full blur-[20px]" />
        </div>

        {/* 4. Soft Ambient Floor Light (Creamy reflection where text sits) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] h-[50%] bg-gradient-to-t from-[#735a3e]/80 to-transparent pointer-events-none z-0" style={{ animation: 'pulse-glow 6s ease-in-out infinite' }} />

        {/* 5. Luxury Cream Dust Particles (Latte Foam Magic) */}
        <div className="absolute bottom-[-5%] left-[15%] w-[5px] h-[5px] rounded-full bg-[#f5f1ed] blur-[2px] pointer-events-none z-10" style={{ animation: 'float-particle 16s linear infinite', animationDelay: '1.5s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[25%] w-[4px] h-[4px] rounded-full bg-[#f5f1ed] blur-[1px] pointer-events-none z-10" style={{ animation: 'float-particle 12s linear infinite', animationDelay: '0s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[30%] w-[8px] h-[8px] rounded-full bg-white blur-[3px] pointer-events-none z-10" style={{ animation: 'float-particle 20s linear infinite', animationDelay: '6s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[35%] w-[7px] h-[7px] rounded-full bg-[#efeeeb] blur-[2px] pointer-events-none z-10" style={{ animation: 'float-particle 18s linear infinite', animationDelay: '5s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[42%] w-[3px] h-[3px] rounded-full bg-orange-50 blur-[1px] pointer-events-none z-10" style={{ animation: 'float-particle 10s linear infinite', animationDelay: '2.5s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[45%] w-[6px] h-[6px] rounded-full bg-amber-50 blur-[2px] pointer-events-none z-10" style={{ animation: 'float-particle 15s linear infinite', animationDelay: '3s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[55%] w-[4px] h-[4px] rounded-full bg-white blur-[1px] pointer-events-none z-10" style={{ animation: 'float-particle 14s linear infinite', animationDelay: '2s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[60%] w-[9px] h-[9px] rounded-full bg-[#faf9f6] blur-[4px] pointer-events-none z-10" style={{ animation: 'float-particle 22s linear infinite', animationDelay: '7s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[65%] w-[5px] h-[5px] rounded-full bg-[#faf9f6] blur-[1px] pointer-events-none z-10" style={{ animation: 'float-particle 10s linear infinite', animationDelay: '1s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[72%] w-[4px] h-[4px] rounded-full bg-[#f5f1ed] blur-[1px] pointer-events-none z-10" style={{ animation: 'float-particle 13s linear infinite', animationDelay: '4.5s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[80%] w-[6px] h-[6px] rounded-full bg-[#f5f1ed] blur-[2px] pointer-events-none z-10" style={{ animation: 'float-particle 11s linear infinite', animationDelay: '4s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[88%] w-[5px] h-[5px] rounded-full bg-amber-50 blur-[2px] pointer-events-none z-10" style={{ animation: 'float-particle 17s linear infinite', animationDelay: '0.5s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[92%] w-[3px] h-[3px] rounded-full bg-white blur-[1px] pointer-events-none z-10" style={{ animation: 'float-particle 9s linear infinite', animationDelay: '3.5s', opacity: 0 }} />
        <div className="absolute bottom-[-5%] left-[10%] w-[6px] h-[6px] rounded-full bg-[#efeeeb] blur-[3px] pointer-events-none z-10" style={{ animation: 'float-particle 19s linear infinite', animationDelay: '8s', opacity: 0 }} />

        <div className="z-10 w-full mb-12">
          <AsealaMascot focused={focusedField} />
        </div>
        
        <div className="absolute bottom-12 w-full flex flex-col items-center text-center text-white px-12 z-20">
          <h2 className="font-headline text-[2.75rem] leading-tight font-black mb-4 tracking-tighter drop-shadow-xl">
            {lang === 'id' ? 'Sudah kangen ngopi?' : 'Craving a cup?'}
          </h2>
          <p className="font-body text-lg text-[#f5f1ed] max-w-md mb-8 opacity-90 leading-relaxed font-medium">
            {lang === 'id' 
              ? 'Yuk masuk lagi! Cek pesanan favoritmu, simpan menu andalan, dan kumpulin promo-promo seru khusus buat kamu.' 
              : 'Hop back in! Track your favorite orders, save your go-to drinks, and grab exclusive rewards just for you.'}
          </p>
          <div className="flex justify-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-white/50"></span>
            <span className="w-2 h-2 rounded-full bg-white/30"></span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-[480px] lg:w-[540px] flex flex-col justify-center px-8 sm:px-16 py-12 z-0">
        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-headline text-3xl font-black text-primary mb-2">
              {isResetView 
                ? (lang === 'id' ? 'Pulihkan Sandi 🔐' : 'Reset Password 🔐') 
                : isLoginView 
                  ? (lang === 'id' ? 'Selamat Datang! ☕' : 'Welcome Back! ☕') 
                  : (lang === 'id' ? 'Mulai Ceritamu ✨' : 'Start Your Story ✨')}
            </h1>
            <p className="text-stone-500 text-sm">
              {isResetView 
                ? (lang === 'id' ? 'Masukkan email Anda untuk menerima instruksi pemulihan.' : 'Enter your email to receive recovery instructions.')
                : isLoginView 
                  ? (lang === 'id' ? 'Senang melihatmu kembali di Aseala Coffee.' : 'Glad to see you again at Aseala Coffee.') 
                  : (lang === 'id' ? 'Daftar sekarang untuk nikmati kemudahan saat ngopi.' : 'Register now to enjoy easy coffee ordering.')}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-md">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLoginView && !isResetView && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-700 tracking-wide uppercase">{lang === 'id' ? 'Nama Pengguna' : 'Full Name'}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">person</span>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('none')}
                    placeholder={lang === 'id' ? 'Siapa namamu?' : 'What should we call you?'}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-stone-400 text-stone-800"
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700 tracking-wide uppercase">Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('none')}
                  placeholder="hello@aseala.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-stone-400 text-stone-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {!isResetView && (
                <>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-stone-700 tracking-wide uppercase">Password</label>
                    {isLoginView && (
                      <button 
                        type="button"
                        onClick={() => setIsResetView(true)}
                        className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
                      >
                        {lang === 'id' ? 'Lupa Sandi?' : 'Forgot Password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">lock</span>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('none')}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-stone-400 text-stone-800 tracking-widest"
                    />
                  </div>
                </>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full py-4 bg-primary text-white rounded-2xl font-bold tracking-widest uppercase text-sm hover:bg-orange-800 transition-colors shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  {lang === 'id' ? 'Menyeduh Akun...' : 'Brewing Account...'}
                </>
              ) : (
                isResetView 
                  ? (lang === 'id' ? 'Kirim Link Reset' : 'Send Reset Link') 
                  : isLoginView 
                    ? (lang === 'id' ? 'Masuk' : 'Sign In') 
                    : (lang === 'id' ? 'Buat Akun' : 'Create Account')
              )}
            </button>
          </form>

          {isResetView && (
            <button 
              onClick={() => setIsResetView(false)}
              className="mt-4 w-full text-center text-sm font-bold text-stone-500 hover:text-primary transition-colors"
            >
              {lang === 'id' ? 'Kembali ke Login' : 'Back to Login'}
            </button>
          )}

          {!isResetView && (
            <>
              <div className="relative flex items-center gap-4 py-8">
                <div className="flex-1 border-t border-stone-200"></div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{lang === 'id' ? 'Atau' : 'Or'}</span>
                <div className="flex-1 border-t border-stone-200"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 bg-white border border-stone-200 text-stone-700 rounded-2xl font-bold text-sm hover:bg-stone-50 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {lang === 'id' ? 'Lanjutkan dengan Google' : 'Continue with Google'}
              </button>

              {/* Toggle View */}
              <div className="mt-8 pt-8 border-t border-stone-200 text-center">
                <p className="text-sm text-stone-600 font-medium">
                  {isLoginView ? (lang === 'id' ? 'Belum punya akun?' : 'New to Aseala?') : (lang === 'id' ? 'Sudah punya akun?' : 'Already have an account?')}
                  <button 
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      setIsResetView(false);
                    }} 
                    className="ml-2 font-bold text-primary hover:text-orange-900 transition-colors"
                  >
                    {isLoginView ? (lang === 'id' ? 'Daftar sekarang' : 'Sign up here') : (lang === 'id' ? 'Masuk di sini' : 'Sign in here')}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
