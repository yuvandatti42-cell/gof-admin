import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface AdminProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  adminUser: User | null;
  adminProfile: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Root authorized admin accounts that are always permitted
const HARDENED_ADMIN_EMAILS = [
  'admin@armafarms.com',
  'api@armafarms.com',
  'yuvandatti42@gmail.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to verify if an authenticated user is permitted into the Admin Panel
  const verifyAdminAuthorization = async (user: User): Promise<AdminProfile | null> => {
    const userEmail = (user.email || '').toLowerCase().trim();

    // 1. Check primary hardcoded allowed admin identities
    const isHardened = HARDENED_ADMIN_EMAILS.includes(userEmail);

    // 2. Check the secure Firestore 'admins' collection
    let firestoreAdminData: any = null;
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);
      if (adminSnap.exists() && adminSnap.data()?.active !== false) {
        firestoreAdminData = adminSnap.data();
      }
    } catch (err) {
      console.warn('Could not read admins collection from Firestore:', err);
    }

    // If neither allowed, this is an unauthorized account (e.g. ordinary customer)
    if (!isHardened && !firestoreAdminData) {
      return null;
    }

    return {
      uid: user.uid,
      name: firestoreAdminData?.name || user.displayName || 'Yuvan Datti',
      email: user.email || 'admin@armafarms.com',
      role: firestoreAdminData?.role || 'Super Administrator',
      phone: firestoreAdminData?.phone || '+91 90100 88063',
    };
  };

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await verifyAdminAuthorization(user);
          if (profile) {
            setAdminUser(user);
            setAdminProfile(profile);
            setIsAuthenticated(true);
          } else {
            // Unauthorized user: kick out immediately
            await signOut(auth);
            setAdminUser(null);
            setAdminProfile(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Error verifying admin authorization:', err);
          setAdminUser(null);
          setAdminProfile(null);
          setIsAuthenticated(false);
        }
      } else {
        setAdminUser(null);
        setAdminProfile(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    pass: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim();
      const cleanPass = pass;

      if (!cleanEmail || !cleanPass) {
        return { success: false, error: 'Please enter both your Admin ID and password.' };
      }

      // 1. Configure session persistence based on "Keep me signed in"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // 2. Perform cryptographically secured TLS authentication with Google Identity Toolkit
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const user = userCredential.user;

      // 3. Verify administrative credentials & roles
      const profile = await verifyAdminAuthorization(user);
      if (!profile) {
        await signOut(auth);
        return {
          success: false,
          error: 'Access Denied: This account is not registered as an authorized store administrator.',
        };
      }

      setAdminUser(user);
      setAdminProfile(profile);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err: any) {
      console.error('Admin authentication failure:', err);
      let errorMsg = 'Failed to sign in. Please verify your credentials.';

      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMsg = 'Incorrect Admin ID or Password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Please enter a valid admin email address.';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Access temporarily restricted due to repeated failed attempts. Please wait 5 minutes.';
          break;
        case 'auth/network-request-failed':
          errorMsg = 'Network connection error. Please verify your internet connection.';
          break;
        case 'auth/user-disabled':
          errorMsg = 'This administrator account has been disabled. Contact store owner.';
          break;
        default:
          if (err.message) errorMsg = err.message;
      }

      return { success: false, error: errorMsg };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setAdminUser(null);
      setAdminProfile(null);
      setIsAuthenticated(false);
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        return { success: false, error: 'Please enter your registered admin email address.' };
      }
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
      };
    } catch (err: any) {
      let errorMsg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const contextValue = useMemo(
    () => ({
      adminUser,
      adminProfile,
      isAuthenticated,
      isLoading,
      login,
      logout,
      resetPassword,
    }),
    [adminUser, adminProfile, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
