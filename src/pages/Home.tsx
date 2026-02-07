import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Check, Star, Download } from 'lucide-react';

import { useMusic } from '../context/MusicContext';

// --- DATA ---
const ARTIST_DATA = {
    name: "Etao",
    image: "/profile_final.jpg",
    bio: "Spells to raise your vibration and heal."
};


const PRICES = {
    single: 2.22,
    sub: 12.34
};

export default function Home() {
    const navigate = useNavigate();
    const { tracks } = useMusic();
    const [currentTrack, setCurrentTrack] = useState<typeof tracks[0] | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [purchased, setPurchased] = useState<number[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [paywallType, setPaywallType] = useState<'single' | 'sub'>('single');
    const [email, setEmail] = useState("");

    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            if (!currentTrack) return;
            const isOwned = purchased.includes(currentTrack.id) || isSubscribed;

            if (!isOwned && audio.currentTime >= 60) {
                audio.pause();
                setIsPlaying(false);
                setPaywallType('single');
                setShowPaywall(true);
                alert("Preview ended! Purchase to listen to the full track.");
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.onended = () => setIsPlaying(false);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [currentTrack, purchased, isSubscribed]);

    const playTrack = (track: typeof tracks[0]) => {
        if (currentTrack?.id === track.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            setCurrentTrack(track);
            audioRef.current.src = track.file;
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            setIsPlaying(true);
        }
    };

    const handleBuy = () => {
        if (!email.includes('@')) {
            alert("Please enter a valid email to receive your tracks.");
            return;
        }
        setTimeout(() => {
            if (paywallType === 'sub') {
                setIsSubscribed(true);
                alert(`Welcome to the Inner Circle, ${email}! Subscription active.`);
            } else {
                if (currentTrack) setPurchased(prev => [...prev, currentTrack.id]);
                alert(`Thank you! Track sent to ${email}.`);
            }
            setShowPaywall(false);
            setEmail("");
        }, 1000);
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Top Nav */}
            {/* Top Nav */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 font-bold text-3xl tracking-tight">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
                    <span>
                        <span className="text-purple-600">Artists</span> <span className="text-brand-teal">First</span>
                    </span>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => navigate('/auth')} className="text-xs font-bold text-slate-500 hover:text-brand-teal">Create Account</button>
                    <button onClick={() => navigate('/auth')} className="bg-brand-teal text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform">Login</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="text-center pt-8 pb-16 px-4">
                <div className="mx-auto w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-blue-500 mb-6 shadow-xl">
                    <img src={ARTIST_DATA.image} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    <span className="gradient-text">Etao</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    {ARTIST_DATA.bio}
                </p>
            </header>

            {/* Subscription Banner */}
            <div className="max-w-6xl mx-auto px-4 mb-20 relative">
                <div className="banner-gradient rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                <Star size={14} /> Premium Access
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Unlock the Full Healing<br />Experience</h2>
                            <p className="text-teal-50 mb-8 max-w-md">Get unlimited access to all high-vibrational tracks and exclusive solfeggio frequencies.</p>

                            <div className="flex flex-col gap-3 text-sm font-medium text-teal-100">
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center text-teal-900"><Check size={12} /></div> Unlimited Streaming</div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center text-teal-900"><Check size={12} /></div> High-Quality WAV Downloads</div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center text-teal-900"><Check size={12} /></div> Support the Artist</div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl w-full max-w-sm text-center shadow-lg">
                            <div className="text-sm font-medium text-teal-100 mb-1">Monthly Plan</div>
                            <div className="text-4xl font-bold mb-6">£12.34 <span className="text-lg font-normal opacity-80">/mo</span></div>
                            <button className="w-full bg-white text-teal-900 font-bold py-3 rounded-lg hover:bg-teal-50 transition-colors mb-4 shadow-xl">
                                Start Subscription
                            </button>
                            <div className="text-[10px] opacity-60">SECURE PAYMENT VIA STRIPE</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Songs Grid */}
            <div className="max-w-6xl mx-auto px-4">
                <h3 className="text-2xl font-bold text-slate-800 mb-8">Latest Tracks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tracks.map(track => {
                        const isCurrent = currentTrack?.id === track.id;
                        const trackIsOwned = purchased.includes(track.id) || isSubscribed;

                        return (
                            <motion.div
                                key={track.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4"
                            >
                                <div className="relative w-20 h-20 shrink-0 group">
                                    <img src={track.cover} className="w-full h-full rounded-xl object-cover shadow-sm" />
                                    <button
                                        onClick={() => playTrack(track)}
                                        className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                    >
                                        {isCurrent && isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="fill-white" />}
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-lg leading-tight truncate ${isCurrent ? 'text-brand-teal' : 'text-slate-800'}`}>{track.title}</h4>
                                    <div className="text-xs text-slate-500 mb-3">{track.artist}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-brand-teal">£{track.price}</span>
                                        {trackIsOwned ? (
                                            <a href={track.file} download className="flex items-center gap-1 text-brand-teal hover:text-teal-700 transition-colors" title="Download WAV">
                                                <Download size={16} />
                                                <span className="text-xs font-bold">WAV</span>
                                            </a>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentTrack(track); setPaywallType('single'); setShowPaywall(true); }}
                                                className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
                                            >
                                                Buy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Player Bar */}
            {currentTrack && (
                <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <img src={currentTrack.cover} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{currentTrack.title}</div>
                            <div className="text-xs text-slate-500">{currentTrack.artist}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/30 hover:scale-105 transition-transform" onClick={() => playTrack(currentTrack)}>
                            {isPlaying ? <Pause size={20} className="fill-white ml-0.5" /> : <Play size={20} className="fill-white ml-0.5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Paywall Modal */}
            <AnimatePresence>
                {showPaywall && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl relative"
                        >
                            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>

                            <h3 className="text-2xl font-bold text-white mb-2">
                                {paywallType === 'sub' ? "Join the Inner Circle" : "Unlock this Track"}
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">
                                {paywallType === 'sub'
                                    ? "Get unlimited access to all soundscapes and future releases."
                                    : "Purchase to listen unlimited and download high-quality .WAV."}
                            </p>

                            <div className="mb-6">
                                <div className="text-3xl font-bold text-brand-teal mb-1">
                                    £{paywallType === 'sub' ? PRICES.sub : PRICES.single}
                                    <span className="text-sm text-slate-500 font-normal">{paywallType === 'sub' && '/month'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Enter your Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@email.com"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-teal"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleBuy} className="col-span-2 bg-brand-teal text-white font-bold py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-teal-600">
                                        Pay with Card
                                    </button>
                                    <button onClick={handleBuy} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                                        Google Pay
                                    </button>
                                    <button onClick={handleBuy} className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                                        PayPal
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 text-[10px] text-center text-slate-500">
                                Secure payment processed by Stripe. <br />95% goes directly to Etao.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
