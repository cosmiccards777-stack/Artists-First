import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

type UserRole = 'listener' | 'artist';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    walletBalance: number;
    favoriteGenres: string[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, role?: UserRole, customName?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    updateWallet: (amount: number) => void;
    updateGenres: (genres: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Watch Auth State & Persistence
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // FIREBASE USER
                // Determine Role Logic (Still mocked for now, everyone starts as listener unless forced)
                // In production, you'd check a database here.
                let role: UserRole = 'listener';

                // Hardcoded Artist Check for Demo
                if (firebaseUser.email?.toLowerCase() === 'cosmiccards777@gmail.com') {
                    role = 'artist';
                }

                const newUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || 'User',
                    role, // Dynamically set role
                    avatar: firebaseUser.photoURL || undefined,
                    walletBalance: 5.00, // Default credit still applies for demo logic
                    favoriteGenres: []
                };

                // Restore wallet from local storage if exists
                const storedUser = localStorage.getItem(`etao_user_${firebaseUser.email}`);
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.walletBalance) newUser.walletBalance = parsed.walletBalance;
                    if (parsed.favoriteGenres) newUser.favoriteGenres = parsed.favoriteGenres;
                }

                setUser(newUser);
            } else {
                // NO FIREBASE USER - CHECK MOCK STORAGE
                const stored = localStorage.getItem('etao_user');
                if (stored) {
                    setUser(JSON.parse(stored));
                } else {
                    setUser(null);
                }
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Google Login
    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Login failed:", error);
            setIsLoading(false);
        }
    };

    // Mock Login (Legacy)
    const login = async (email: string, role: UserRole = 'listener', customName?: string) => {
        setIsLoading(true);
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let name = customName || email.split('@')[0];
        let avatar = role === 'artist' ? '/profile_final.jpg' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email;

        // Hardcoded Artist for Demo
        if (email.toLowerCase() === 'cosmiccards777@gmail.com') {
            name = "Etao";
            role = 'artist';
            avatar = "/profile_final.jpg";
        }

        const newUser: User = {
            id: 'mock-' + Date.now(),
            email,
            name,
            role,
            avatar,
            walletBalance: 5.00,
            favoriteGenres: []
        };

        setUser(newUser);
        localStorage.setItem('etao_user', JSON.stringify(newUser));
        setIsLoading(false);
    };

    const updateWallet = (amount: number) => {
        if (!user) return;
        const updatedUser = { ...user, walletBalance: user.walletBalance + amount };
        setUser(updatedUser);

        // Persist based on auth type
        if (user.id.startsWith('mock-')) {
            localStorage.setItem('etao_user', JSON.stringify(updatedUser));
        } else {
            localStorage.setItem(`etao_user_${user.email}`, JSON.stringify(updatedUser));
        }
    }


    const updateGenres = (genres: string[]) => {
        if (!user) return;
        const updatedUser = { ...user, favoriteGenres: genres };
        setUser(updatedUser);

        // Persist based on auth type
        if (user.id.startsWith('mock-')) {
            localStorage.setItem('etao_user', JSON.stringify(updatedUser));
        } else {
            localStorage.setItem(`etao_user_${user.email}`, JSON.stringify(updatedUser));
        }
    };

    const logout = () => {
        signOut(auth); // Sign out of Firebase
        setUser(null);
        localStorage.removeItem('etao_user'); // Clear mock storage
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, logout, isLoading, updateWallet, updateGenres }}>
            {children}
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
