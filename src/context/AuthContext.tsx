'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showNotification } = useNotification();
  const { lang } = useLanguage();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const throttleRef = useRef<number>(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const logout = useCallback(async () => {
    localStorage.removeItem('aseala-last-activity');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await signOut(auth);
  }, []);

  // Idle Timer Logic (2 minutes)
  const resetTimer = useCallback((e?: Event) => {
    const now = Date.now();
    
    // If it's a mousemove, check if the movement is significant (> 20px)
    // to prevent jitter or animations from resetting the timer
    if (e && e.type === 'mousemove') {
      const me = e as MouseEvent;
      const dist = Math.sqrt(Math.pow(me.clientX - lastPosRef.current.x, 2) + Math.pow(me.clientY - lastPosRef.current.y, 2));
      
      if (dist < 20) return; // Ignore small movements
      lastPosRef.current = { x: me.clientX, y: me.clientY };
    }

    // Throttle event checks to max 1 time per 2 seconds to avoid freezing the browser on mousemove
    if (now - throttleRef.current < 2000) return;
    throttleRef.current = now;

    // Sync activity across multiple tabs
    localStorage.setItem('aseala-last-activity', now.toString());

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Disable auto-logout for Admin as requested
    if (!user || isAdmin) {
      if (user && isAdmin) console.log("Admin detected: Auto-logout disabled.");
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const lastActivity = parseInt(localStorage.getItem('aseala-last-activity') || '0', 10);
      const timeSinceLastActivity = Date.now() - lastActivity;

      console.log(`Idle check: ${Math.round(timeSinceLastActivity / 1000)}s inactive.`);

      if (timeSinceLastActivity >= 110000) {
        console.log('User inactive for 2 minutes across all tabs. Logging out...');
        showNotification(
          lang === 'id' ? 'Sesi Berakhir' : 'Session Expired',
          lang === 'id' ? 'Anda telah keluar secara otomatis karena tidak ada aktivitas selama 2 menit.' : 'You have been automatically logged out due to 2 minutes of inactivity.',
          'info'
        );
        logout();
      } else {
        // Another tab is active! Reset this tab's timer to check again later
        resetTimer();
      }
    }, 120000); // 2 minutes
  }, [user, isAdmin, logout, lang, showNotification]);

  useEffect(() => {
    if (user) {
      resetTimer();
      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [user, resetTimer]);

  useEffect(() => {
    // 🛡️ SAFETY CHECK: If auth is not initialized (missing ENVs), don't crash
    if (!auth) {
      console.warn("Auth not initialized: Missing Firebase configuration.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 🛡️ SAFETY CHECK: If db is not initialized
        if (!db) {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            role: 'customer'
          });
          setLoading(false);
          return;
        }

        // 🛡️ SECURITY: Fetch role from the SECURE Firestore (protected by rules)
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'customer' // Default role
        };

        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = { ...userData, ...data };
        } 
        
        // 🔒 Fallback security: Still recognize hardcoded admin email for safety
        if (firebaseUser.email === 'akbarsupiad20@gmail.com') {
          userData.role = 'admin';
        }

        setUser(userData);
        setIsAdmin(userData.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Set display name in Auth
    await updateProfile(firebaseUser, { displayName: name });

    // Create user profile in Firestore
    const role = email === 'akbarsupiad20@gmail.com' ? 'admin' : 'customer';
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    // Check if user has a profile in Firestore, create if not
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const role = firebaseUser.email === 'akbarsupiad20@gmail.com' ? 'admin' : 'customer';
      const name = firebaseUser.displayName || 'Google User';
      const email = firebaseUser.email;

      await setDoc(userDocRef, {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      // Send Welcome Email with Authorization Token
      if (email) {
        try {
          const token = await firebaseUser.getIdToken();
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              to: email,
              customerName: name,
              type: 'welcome'
            })
          });
        } catch (err) {
          console.error('Failed to send welcome email:', err);
        }
      }
    }
  };
  
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };


  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, loginWithGoogle, logout, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
