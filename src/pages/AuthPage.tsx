import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Music, Headphones, ArrowRight, Chrome } from 'lucide-react';

export default function AuthPage() {
    const location = useLocation();
    // Default to 'login_form' if state.mode is 'login', otherwise 'role_selection'
    const [view, setView] = useState<'role_selection' | 'signup_form' | 'login_form'>(
        (location.state as any)?.mode === 'login' ? 'login_form' : 'role_selection'
    );
    const [password, setPassword] = useState('');

    // Restore missing state
    const [role, setRole] = useState<'listener' | 'artist' | null>(null);
    const [email, setEmail] = useState('');
    const [artistName, setArtistName] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (view === 'login_form') {
                // Login Flow
                // For demo: Default to 'listener' unless it's the hardcoded artist
                // Logic is handled in AuthContext for CosmicCards777
                const loginRole = 'listener';
                await login(email, loginRole); // AuthContext will override role if email matches special artist

                // Determine redirect (Role might have changed inside login)
                // We need to check the user object, but we don't have it explicitly returned here easily without await updates
                // For now, simpler check:
                if (email.toLowerCase() === 'cosmiccards777@gmail.com') {
                    navigate('/dashboard');
                } else {
                    navigate('/'); // Default listeners to home
                }

            } else {
                // Signup Flow
                if (!role || !email) return;
                await login(email, role, artistName);
                navigate(role === 'artist' ? '/dashboard' : '/');
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row min-h-[600px]"
            >
                {/* Visual Side */}
                <div className="md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 font-bold text-4xl mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img src="/logo.png" className="h-16 w-auto" />
                            <span>
                                <span className="text-purple-400">Artists</span> <span className="text-teal-400">First</span>
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-4">Join the High Vibe Community</h1>
                        <p className="text-slate-400">Connect, listen, and heal through the power of frequency.</p>
                    </div>

                    <div className="relative z-10">
                        {/* Social Proof */}
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    {view === 'role_selection' && (
                        <>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome</h2>
                            <p className="text-slate-500 mb-8">How will you use Artists First today?</p>

                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={() => { setRole('listener'); setView('signup_form'); }}
                                    className="w-full p-6 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Headphones size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">I'm a Listener</div>
                                        <div className="text-sm text-slate-500">I want to discover and buy music</div>
                                    </div>
                                    <ArrowRight className="ml-auto text-slate-300 group-hover:text-teal-600" />
                                </button>

                                <button
                                    onClick={() => { setRole('artist'); setView('signup_form'); }}
                                    className="w-full p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Music size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">I'm an Artist</div>
                                        <div className="text-sm text-slate-500">I want to upload my tracks</div>
                                    </div>
                                    <ArrowRight className="ml-auto text-slate-300 group-hover:text-purple-600" />
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-slate-500 text-sm">
                                    Already have an account?
                                </p>
                                <button
                                    onClick={() => setView('login_form')}
                                    className="mt-2 px-6 py-2 rounded-full border border-slate-200 text-teal-600 font-bold hover:bg-teal-50 hover:border-teal-200 transition-colors"
                                >
                                    Log In to Existing Account
                                </button>
                            </div>
                        </>
                    )}

                    {view === 'signup_form' && (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleLogin}
                        >
                            <button
                                type="button"
                                onClick={() => { setView('role_selection'); setRole(null); }}
                                className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1"
                            >
                                ← Back
                            </button>

                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                            <p className="text-slate-500 mb-8">Sign up as a <span className="font-bold capitalize text-teal-600">{role}</span></p>

                            <div className="space-y-4 mb-8">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <input
                                    type="password"
                                    required
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                {role === 'artist' && (
                                    <input
                                        type="text"
                                        required
                                        placeholder="Artist Name (Public)"
                                        value={artistName}
                                        onChange={(e) => setArtistName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                            >
                                {loading ? 'Creating Account...' : 'Get Started'}
                            </button>
                        </motion.form>
                    )}

                    {view === 'login_form' && (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleLogin}
                        >
                            <button
                                type="button"
                                onClick={() => setView('role_selection')}
                                className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1"
                            >
                                ← Back
                            </button>

                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-500 mb-8">Please enter your details.</p>

                            <button type="button" className="w-full mb-6 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                                <Chrome size={20} /> Continue with Google
                            </button>
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">Or continue with email</span></div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                            <div className="text-center mt-6">
                                <p className="text-slate-500 text-sm">
                                    Don't have an account?{' '}
                                    <button type="button" onClick={() => setView('role_selection')} className="text-teal-600 font-bold hover:underline">
                                        Sign Up
                                    </button>
                                </p>
                            </div>
                        </motion.form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
