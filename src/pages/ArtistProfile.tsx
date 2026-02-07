import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Star, DollarSign } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

// --- DATA ---
const ARTIST_DATA = {
    name: "Etao",
    image: "/profile_final.jpg",
    bio: "Spells to raise your vibration and heal."
};


export default function ArtistProfile() {
    const navigate = useNavigate();
    const { user, updateWallet } = useAuth();
    const { tracks } = useMusic();
    const [currentTrack, setCurrentTrack] = useState<typeof tracks[0] | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [showTipModal, setShowTipModal] = useState(false);
    const [tipAmount, setTipAmount] = useState(100); // 100 AF = $1.00

    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    const playTrack = (track: typeof tracks[0]) => {
        if (!user) {
            navigate('/auth');
            return;
        }

        // Logic: 1 cent per stream
        if (currentTrack?.id === track.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            // New Track Payment Check
            if (user.walletBalance < 0.01) {
                alert("Your wallet is empty! Please top up to keep listening.");
                return;
            }

            // Deduct 1 cent
            updateWallet(-0.01);
            console.log("Stream paid: $0.01");

            setCurrentTrack(track);
            audioRef.current.src = track.file;
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            setIsPlaying(true);
        }
    };

    const [tipFrequency, setTipFrequency] = useState<'once' | 'monthly'>('once');
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [addAmountStr, setAddAmountStr] = useState("500"); // 500 AF = $5.00

    const handleTip = () => {
        const tipUSD = tipAmount / 100;
        if (user && user.walletBalance >= tipUSD) {
            // In a real app, 'monthly' would set up a cron job or Stripe subscription
            if (tipFrequency === 'monthly') {
                alert(`You are amazing! You've started a ${tipAmount} AF/month recurring tip for ${ARTIST_DATA.name}. The first month has been sent.`);
            } else {
                alert("Thank you for feeding this artist!");
            }
            updateWallet(-tipUSD);
            setShowTipModal(false);
        } else {
            alert("Insufficient funds in wallet.");
        }
    };

    const handleAddFunds = () => {
        const amountAF = parseInt(addAmountStr);
        if (isNaN(amountAF) || amountAF < 500) {
            alert("Minimum deposit is 500 AF ($5.00)");
            return;
        }
        const amountUSD = amountAF / 100;
        updateWallet(amountUSD);
        setShowAddFunds(false);
        alert(`Successfully added ${amountAF} AF to your wallet!`);
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Top Nav */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 font-bold text-3xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
                    <span>
                        <span className="text-purple-600">Artists</span> <span className="text-brand-teal">First</span>
                    </span>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setShowAddFunds(true); setAddAmountStr("500"); }}
                                className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2 group"
                            >
                                <span>Wallet: <span className="text-teal-600 group-hover:text-teal-700">{(user.walletBalance * 100).toFixed(0)} AF</span></span>
                                <div className="bg-teal-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">+</div>
                            </button>
                            <span className="text-sm font-bold text-slate-700">Hi, {user.name}</span>
                            {user.role === 'artist' && (
                                <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors">
                                    Dashboard
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <button onClick={() => navigate('/auth')} className="text-xs font-bold text-slate-500 hover:text-brand-teal">Create Account</button>
                            <button onClick={() => navigate('/auth')} className="bg-brand-teal text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform">Login</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="text-center pt-8 pb-16 px-4">
                <div className="mx-auto w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-blue-500 mb-6 shadow-xl relative">
                    <img src={ARTIST_DATA.image} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white" />
                    <button
                        onClick={() => setShowTipModal(true)}
                        className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full shadow-lg hover:bg-pink-400 transition-colors border-4 border-white" title="Tip Artist"
                    >
                        <DollarSign size={16} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                        <span className="gradient-text">Etao</span>
                    </h1>
                </div>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                    {ARTIST_DATA.bio}
                </p>
                <button
                    onClick={() => setShowTipModal(true)}
                    className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-pink-100 transition-colors"
                >
                    <Star size={14} className="fill-pink-600" />
                    Send a Tip
                </button>
            </header>

            {/* Songs Grid */}
            <div className="max-w-6xl mx-auto px-4">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center justify-between">
                    <span>Latest Tracks</span>
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">1 AF per stream</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tracks.map(track => {
                        const isCurrent = currentTrack?.id === track.id;
                        return (
                            <motion.div
                                key={track.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4"
                            >
                                <div className="relative w-20 h-20 shrink-0 group cursor-pointer" onClick={() => playTrack(track)}>
                                    <img src={track.cover} className="w-full h-full rounded-xl object-cover shadow-sm" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors rounded-xl flex items-center justify-center">
                                        {isCurrent && isPlaying ? <Pause size={28} className="fill-white text-white" /> : <Play size={28} className="fill-white text-white opacity-90" />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-lg leading-tight truncate ${isCurrent ? 'text-brand-teal' : 'text-slate-800'}`}>{track.title}</h4>
                                    <div className="text-xs text-slate-500 mb-3">{track.artist}</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            1 AF / Play
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowTipModal(true); }}
                                            className="px-3 py-1.5 text-xs font-bold text-pink-500 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors flex items-center gap-1"
                                        >
                                            <Star size={10} className="fill-pink-500" /> Tip
                                        </button>
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
                        <button className="w-12 h-12 bg-brand-teal rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/30 hover:scale-105 transition-transform" onClick={() => playTrack(currentTrack)}>
                            {isPlaying ? <Pause size={24} className="fill-white ml-0.5" /> : <Play size={24} className="fill-white ml-0.5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Tip Modal */}
            <AnimatePresence>
                {showTipModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
                        >
                            <button onClick={() => setShowTipModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                                    <Star size={32} className="fill-pink-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">Tip {ARTIST_DATA.name}</h3>
                                <p className="text-sm text-slate-500">Support the art you love directly.</p>
                            </div>

                            {/* Frequency Toggle */}
                            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setTipFrequency('once')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipFrequency === 'once' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    One-time
                                </button>
                                <button
                                    onClick={() => setTipFrequency('monthly')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipFrequency === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Monthly
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[100, 300, 500].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setTipAmount(amount)}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all ${tipAmount === amount ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {amount} AF
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Custom Amount (AF)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">AF</span>
                                    <input
                                        type="number"
                                        value={tipAmount}
                                        onChange={(e) => setTipAmount(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                            </div>

                            <button onClick={handleTip} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-slate-800 transition-all shadow-xl">
                                {tipFrequency === 'monthly' ? `Start ${tipAmount} AF/mo` : `Send ${tipAmount} AF Tip`}
                            </button>
                            <div className="mt-4 text-[10px] text-center text-slate-400">
                                100% of tips go to the artist.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Funds Modal */}
            <AnimatePresence>
                {showAddFunds && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
                        >
                            <button onClick={() => setShowAddFunds(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-500">
                                    <DollarSign size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">Buy Artist Funds (AF)</h3>
                                <p className="text-sm text-slate-500">100 AF = $1.00 USD</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[500, 1000, 2000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setAddAmountStr(amount.toString())}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all ${addAmountStr === amount.toString() ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {amount} AF
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Amount (AF)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">AF</span>
                                    <input
                                        type="number"
                                        value={addAmountStr}
                                        onChange={(e) => setAddAmountStr(e.target.value)}
                                        onBlur={() => {
                                            const val = parseInt(addAmountStr);
                                            if (!isNaN(val) && val < 500) setAddAmountStr("500");
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                                        placeholder="500"
                                    />
                                </div>
                                {parseInt(addAmountStr) < 500 && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">Minimum purchase is 500 AF</p>
                                )}
                            </div>

                            <button
                                onClick={handleAddFunds}
                                disabled={parseInt(addAmountStr) < 500 || isNaN(parseInt(addAmountStr))}
                                className={`w-full font-bold py-4 rounded-xl text-lg transition-all shadow-xl ${parseInt(addAmountStr) < 500 || isNaN(parseInt(addAmountStr))
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                Buy for ${!isNaN(parseInt(addAmountStr)) ? (parseInt(addAmountStr) / 100).toFixed(2) : '0.00'}
                            </button>
                            <div className="mt-4 text-[10px] text-center text-slate-400">
                                Secure payment powered by Stripe (Mock).
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
