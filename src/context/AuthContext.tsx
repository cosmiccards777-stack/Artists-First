import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type UserRole = 'listener' | 'artist';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    walletBalance: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, role: UserRole, customName?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    updateWallet: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock persistence
    useEffect(() => {
        const stored = localStorage.getItem('etao_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, role: UserRole, customName?: string) => {
        setIsLoading(true);
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let name = customName || email.split('@')[0];
        let avatar = role === 'artist' ? '/profile_final.jpg' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email;

        // Hardcoded Artist for Demo
        if (email.toLowerCase() === 'cosmiccards777@gmail.com') {
            name = "Etao";
            role = 'artist'; // Force artist role
            avatar = "/profile_final.jpg";
        }

        const newUser: User = {
            id: 'mock-' + Date.now(),
            email,
            name,
            role,
            avatar,
            walletBalance: 5.00 // Default $5.00 credit for demo
        };

        setUser(newUser);
        localStorage.setItem('etao_user', JSON.stringify(newUser));
        setIsLoading(false);
        localStorage.setItem('etao_user', JSON.stringify(newUser));
        setIsLoading(false);
    };

    const updateWallet = (amount: number) => {
        if (!user) return;
        const updatedUser = { ...user, walletBalance: user.walletBalance + amount };
        setUser(updatedUser);
        localStorage.setItem('etao_user', JSON.stringify(updatedUser)); // Persist balance
    };



    const logout = () => {
        setUser(null);
        localStorage.removeItem('etao_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, updateWallet }}>
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
