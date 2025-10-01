"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

type AuthCredentials = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<User>;
  signUp: (credentials: AuthCredentials) => Promise<User>;
  signOut: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
AuthContext.displayName = "AuthContext";

function useFirebaseAuth(): Auth {
  const authRef = useRef<Auth | null>(null);

  if (!authRef.current) {
    authRef.current = getFirebaseAuth();
  }

  return authRef.current as Auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    const interval = setInterval(
      () => {
        void auth.currentUser?.getIdToken(true);
      },
      1000 * 60 * 30,
    ); // refresh every 30 minutes

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async ({ email, password }) => {
        const { user: nextUser } = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        setUser(nextUser);
        return nextUser;
      },
      signUp: async ({ email, password }) => {
        const { user: nextUser } = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        setUser(nextUser);
        return nextUser;
      },
      signOut: async () => {
        await firebaseSignOut(auth);
        setUser(null);
      },
      getIdToken: async (forceRefresh) => {
        if (!auth.currentUser) return null;
        return auth.currentUser.getIdToken(forceRefresh);
      },
    }),
    [auth, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
