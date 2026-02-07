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
    const [errorMsg, setErrorMsg] = useState('');
    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (password.length < 5) {
            setErrorMsg("Password must be at least 5 characters.");
            setLoading(false);
            return;
        }

        try {
            if (view === 'login_form') {
                // Login Flow
                await login(email, password);

                if (email.toLowerCase() === 'cosmiccards777@gmail.com') {
                    navigate('/dashboard');
                } else {
                    navigate('/genre-selection');
                }

            } else {
                // Signup Flow
                if (!role || !email) return;
                await signup(email, password, role, artistName);
                navigate(role === 'artist' ? '/dashboard' : '/genre-selection');
            }
        } catch (error: any) {
            console.error("Auth failed:", error);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = "That email is already registered.";
            if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
            if (error.code === 'auth/user-not-found') msg = "No account found with that email.";
            if (error.code === 'auth/operation-not-allowed') msg = "Login method not enabled. Falling back to Dev Mode..."; // Should be handled by context now, but just in case

            setErrorMsg(msg || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/genre-selection');
        } catch (error) {
            console.error("Google Login failed:", error);
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
                                        <div className="font-bold text-slate-900 text-lg">I'm a Listener</div>
                                        <div className="text-slate-500 text-sm">Discover high-vibe music</div>
                                    </div>
                                    <ArrowRight className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors" />
                                </button>

                                <button
                                    onClick={() => { setRole('artist'); setView('signup_form'); }}
                                    className="w-full p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Music size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">I'm an Artist</div>
                                        <div className="text-slate-500 text-sm">Upload and earn 95%</div>
                                    </div>
                                    <ArrowRight className="ml-auto text-slate-300 group-hover:text-purple-500 transition-colors" />
                                </button>
                            </div>

                            <div className="text-center pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => setView('login_form')}
                                    className="text-slate-500 hover:text-slate-900 font-medium"
                                >
                                    Already have an account? Log in
                                </button>
                            </div>
                        </>
                    )}

                    {(view === 'signup_form' || view === 'login_form') && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <button
                                onClick={() => setView('role_selection')}
                                className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 text-sm font-medium"
                            >
                                ← Back
                            </button>

                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                {view === 'login_form' ? 'Welcome back' : `Join as ${role === 'artist' ? 'an Artist' : 'a Listener'}`}
                            </h2>
                            <p className="text-slate-500 mb-8">Enter your details to continue.</p>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {errorMsg && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                                        {errorMsg}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {view === 'signup_form' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{role === 'artist' ? 'Artist Name' : 'Full Name'}</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                            placeholder={role === 'artist' ? "Stage Name" : "Jane Doe"}
                                            value={artistName}
                                            onChange={(e) => setArtistName(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : (view === 'login_form' ? 'Log In' : 'Create Account')}
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-4">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-slate-400 text-sm">or</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Chrome size={18} />
                                Continue with Google
                            </button>

                            {view === 'login_form' && (
                                <p className="text-center mt-6 text-sm text-slate-500">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setView('role_selection')}
                                        className="text-teal-600 font-bold hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
