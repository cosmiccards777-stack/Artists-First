import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
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
    login: (email: string, password?: string) => Promise<void>;
    signup: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
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

    // Signup (Real Firebase)
    const signup = async (email: string, password: string, role: UserRole, name: string) => {
        setIsLoading(true);
        try {
            // Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update Profile Name
            await updateProfile(firebaseUser, { displayName: name });

            // Create Firestore Doc
            const newUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || email,
                name: name,
                role: role,
                avatar: role === 'artist' ? '/profile_final.jpg' : `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                walletBalance: 5.00, // Bonus for new users
                favoriteGenres: []
            };

            const userRef = doc(db, "users", firebaseUser.uid);
            await setDoc(userRef, newUser);

            setUser(newUser);

        } catch (error: any) {
            console.error("Signup failed:", error);
            throw error; // Strict error throwing for production
        } finally {
            setIsLoading(false);
        }
    };

    // Login (Real Firebase)
    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            if (password) {
                // Real Auth
                await signInWithEmailAndPassword(auth, email, password);
                // State update handled by onAuthStateChanged
            } else {
                console.warn("Attempting legacy login without password - this is deprecated.");
                throw new Error("Password is required for login.");
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

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
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, loginWithGoogle, logout, isLoading, updateWallet, updateGenres }}>
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
