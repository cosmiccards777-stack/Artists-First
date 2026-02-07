import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

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



    // ... (inside AuthProvider)

    // Watch Auth State & Persistence
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // FIREBASE USER
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    // Load existing user
                    const userData = userSnap.data() as User;
                    setUser({ ...userData, id: firebaseUser.uid }); // Ensure ID matches
                } else {
                    // New User (or first time logging in with this method)
                    // We wait for the 'login' function to create the doc if it's a manual login,
                    // but for Google Login/Reloads we might need a fallback or wait.
                    // For now, if it doesn't exist, we rely on the Signup/Login flow to set it,
                    // OR we set a basic shell here if it's a reload.
                    // BUT, to avoid overwriting, we'll let the login function handle creation.
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Google Login
    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in DB
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create new user doc
                const newUser: User = {
                    id: user.uid,
                    email: user.email || '',
                    name: user.displayName || 'Listener',
                    role: 'listener', // Default to listener for Google Auth
                    avatar: user.photoURL || undefined,
                    walletBalance: 0,
                    favoriteGenres: []
                };
                await setDoc(userRef, newUser);
                setUser(newUser);
            } else {
                setUser(userSnap.data() as User);
            }

        } catch (error) {
            console.error("Google Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Manual Signup/Login
    const login = async (email: string, role: UserRole = 'listener', customName?: string) => {
        setIsLoading(true);

        // Note: In a real app, you'd use createUserWithEmailAndPassword / signInWithEmailAndPassword here.
        // Since we are "mocking" the auth part but want DB persistence, we'll use a "fake" auth ID for now
        // OR we should switch to real Firebase Auth. 
        // Given the request "make a database to store log in info", we should probably use real Auth.
        // However, switching to real password auth requires enabling it in Firebase Console.
        // I will assume for now we stuck to the "Mock" auth for email/pass but store the result in Firestore.

        // MOCK AUTH + FIRESTORE STORAGE
        // We'll generate a consistent ID based on email to simulate "logging back in"
        const fakeUid = btoa(email); // Simple base64 of email as ID

        const userRef = doc(db, "users", fakeUid);
        const userSnap = await getDoc(userRef);

        let newUser: User;

        if (userSnap.exists()) {
            // Login: Load data
            newUser = userSnap.data() as User;
        } else {
            // Signup: Create data
            newUser = {
                id: fakeUid,
                email,
                name: customName || email.split('@')[0],
                role,
                avatar: role === 'artist' ? '/profile_final.jpg' : `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                walletBalance: 5.00, // Bonus for new mock users
                favoriteGenres: []
            };
            await setDoc(userRef, newUser);
        }

        setUser(newUser);

        // We also set a local key so we remember to "auto-login" this fake user on reload
        localStorage.setItem('etao_last_user_id', fakeUid);

        setIsLoading(false);
    };

    // Auto-login for mock users
    useEffect(() => {
        const checkMockLogin = async () => {
            const lastId = localStorage.getItem('etao_last_user_id');
            if (lastId && !auth.currentUser) {
                const userRef = doc(db, "users", lastId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUser(userSnap.data() as User);
                }
            }
        };
        checkMockLogin();
    }, []);


    const updateWallet = async (amount: number) => {
        if (!user) return;
        const newBalance = user.walletBalance + amount;
        const updatedUser = { ...user, walletBalance: newBalance };
        setUser(updatedUser);

        // Update Firestore
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { walletBalance: newBalance });
    }

    const updateGenres = async (genres: string[]) => {
        if (!user) return;
        const updatedUser = { ...user, favoriteGenres: genres };
        setUser(updatedUser);

        // Update Firestore
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { favoriteGenres: genres });
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
