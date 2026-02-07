import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Music, PlayCircle } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-20">
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <img src="/logo.png" className="h-12 w-auto" />
                    <span>
                        <span className="text-purple-400">Artists</span> <span className="text-teal-400">First</span>
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/auth', { state: { mode: 'login' } })} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</button>
                    <button
                        onClick={() => navigate('/auth')}
                        className="bg-white text-slate-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-teal-50 hover:text-teal-900 transition-all transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-20 pb-32 px-6">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium text-teal-300 mb-8 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
                            The Future of Music Streaming is Here
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                            Your Art. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Your Earnings.</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Your Future.</span>
                        </h1>

                        <div className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed space-y-4">
                            <p>
                                After having accounts shut down by malicious actors on major platforms, <br className="hidden md:block" />
                                <span className="text-white font-bold">Etao</span> created Artists First to ensure no artist ever loses their livelihood again.
                            </p>
                            <p>
                                We built this to give you actual benefit for your art.
                            </p>
                            <p className="text-2xl text-white font-bold">
                                Starting with 95% of music streaming revenue.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full md:w-auto px-8 py-4 bg-teal-500 text-slate-900 rounded-2xl font-bold text-lg hover:bg-teal-400 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20"
                            >
                                <Music size={20} />
                                Join as an Artist
                            </button>
                            <button
                                onClick={() => navigate('/etao')}
                                className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <PlayCircle size={20} />
                                Listen Now
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Comparison Section */}
            <div className="py-24 bg-slate-900/50 relative border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why we're different</h2>
                        <p className="text-slate-400">We've rebuilt the model to serve creators, not algorithms.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Others */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="text-xl font-bold text-slate-300 mb-2">Streaming Giants</div>
                            <div className="text-4xl font-bold mb-1 text-slate-500">$0.003</div>
                            <div className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-wide">artists paid per stream</div>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Ads or Expensive Subscriptions</li>
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Closes independent artist accounts</li>
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Low artist trust</li>
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Algorithm control</li>
                            </ul>
                        </div>

                        {/* Artists First */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-gradient-to-b from-slate-800 to-slate-900 border border-teal-500/30 rounded-3xl p-8 relative shadow-2xl shadow-teal-900/20 z-10"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Recommended
                            </div>
                            <div className="flex items-center gap-2 font-bold text-2xl mb-2">
                                <span className="text-purple-400">Artists</span> <span className="text-teal-400">First</span>
                            </div>
                            <div className="text-5xl font-bold mb-1 text-white">95% of 1¢</div>
                            <div className="text-xs font-bold text-teal-400 mb-6 uppercase tracking-wide">Artists paid per stream</div>
                            <ul className="space-y-4 text-sm text-slate-300 font-medium">
                                <li className="flex items-center gap-3"><div className="bg-teal-500/20 p-1 rounded-full text-teal-400"><Check size={12} /></div> Support artists you love per a listen</li>
                                <li className="flex items-center gap-3"><div className="bg-teal-500/20 p-1 rounded-full text-teal-400"><Check size={12} /></div> Direct Tipping</li>
                                <li className="flex items-center gap-3"><div className="bg-teal-500/20 p-1 rounded-full text-teal-400"><Check size={12} /></div> NO ADS</li>
                                <li className="flex items-center gap-3"><div className="bg-teal-500/20 p-1 rounded-full text-teal-400"><Check size={12} /></div> Offline / Downloadable Streaming</li>
                                <li className="flex items-center gap-3"><div className="bg-teal-500/20 p-1 rounded-full text-teal-400"><Check size={12} /></div> Lossless Audio</li>
                            </ul>
                            <button onClick={() => navigate('/auth')} className="w-full mt-8 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition-colors">
                                Start earning today
                            </button>
                        </motion.div>

                        {/* Marketplaces */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-8 opacity-75">
                            <div className="text-xl font-bold text-slate-300 mb-2">Marketplaces</div>
                            <div className="text-4xl font-bold mb-6 text-slate-400">85% of sales</div>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li className="flex items-center gap-3"><div className="bg-slate-700/50 p-1 rounded-full"><Check size={12} /></div> Decent Revenue</li>
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Clunky Interface</li>
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Expensive music</li>
                                <li className="flex items-center gap-3"><span className="text-red-500">✕</span> Limited Streaming</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
                <p>&copy; 2026 Artists First. Raising the vibration of the music industry.</p>
            </footer>
        </div>
    );
}
