import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, Search, Home, Library,
    TrendingUp, Heart, MoreHorizontal, LogOut, Edit2, Trash2, Upload,
    X, Music, DollarSign, PlayCircle, Users, Bell, Plus, Info, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data Generators
const generateChartData = (period: '7d' | '30d' | '12m', baseTotal: number) => {
    const data = [];
    const count = period === '7d' ? 7 : period === '30d' ? 30 : 12;

    // Calculate a rough average to distribute the total across the points
    let average = baseTotal / count;
    // Add some realistic constraints
    if (average < 0) average = 0;

    for (let i = 0; i < count; i++) {
        // Random variance (0.5 to 1.5)
        const variance = (Math.random() * 1.0) + 0.5;
        let value = Math.floor(average * variance);

        data.push({
            name: period === '12m' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i] : `Day ${i + 1}`,
            value: value
        });
    }
    return data;
    return data;
};

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export default function ArtistDashboard() {
    const { user, logout } = useAuth();
    const { tracks, addTrack, deleteTrack, updateTrack } = useMusic();
    const navigate = useNavigate();

    const [storageUsage, setStorageUsage] = useState(0);

    useEffect(() => {
        const calculateUsage = () => {
            let total = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += (localStorage[key].length * 2) / 1024 / 1024; // MB
                }
            }
            setStorageUsage(total);
        };
        calculateUsage();
        const interval = setInterval(calculateUsage, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear all data and start fresh? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    // Dashboard State
    const [timeframe, setTimeframe] = useState<'7d' | '30d' | '12m'>('7d');
    const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);

    // Upload/Edit Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null); // Track ID if editing

    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadPrice, setUploadPrice] = useState("2.22");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Limits
    // Session-only limits (Blob URLs)
    const MAX_AUDIO_SIZE = 250 * 1024 * 1024; // 250MB

    // LocalStorage limits (Base64) - MUST be very small for demo
    const MAX_IMAGE_SIZE = 300 * 1024; // 300KB (LocalStorage is limited)

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_AUDIO_SIZE) {
                setError("Audio file exceeds 250MB limit.");
                return;
            }
            setError(null);
            setAudioFile(file);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
                setError("Image file exceeds 300KB limit (Demo Storage). Please use a smaller image.");
                return;
            }
            setError(null);
            setCoverFile(file);
        }
    };

    const openUploadModal = () => {
        setEditId(null);
        setUploadTitle("");
        setUploadPrice("2.22");
        setAudioFile(null);
        setCoverFile(null);
        setError(null);
        setIsUploadOpen(true);
    };

    const openEditModal = (track: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditId(track.id);
        setUploadTitle(track.title);
        setUploadPrice(track.price.toString());
        setAudioFile(null); // Reset files, only update if user picks new ones
        setCoverFile(null);
        setError(null);
        setIsUploadOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: New uploads need files. Edits only need title/price if files aren't changed.
        if (!editId && !audioFile) {
            setError("Please select an audio file.");
            return;
        }

        setIsUploading(true);
        setError(null);

        // Simulate upload/save delay
        // Simulate upload/save delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        let audioUrl: string | undefined;
        let coverUrl: string | undefined;

        if (editId) {
            // Update Existing Track
            const updates: any = {
                title: uploadTitle,
                price: parseFloat(uploadPrice),
            };

            if (audioFile) {
                // Use Blob URL for audio to avoid LocalStorage limits (Session only)
                audioUrl = URL.createObjectURL(audioFile);
            }
            if (coverFile) {
                // Keep Base64 for images so they persist (usually <5MB)
                coverUrl = await fileToBase64(coverFile);
            }

            if (editId) {
                // Update Existing Track
                const updates: any = {
                    title: uploadTitle,
                    price: parseFloat(uploadPrice),
                };

                if (audioUrl) updates.file = audioUrl;
                if (coverUrl) updates.cover = coverUrl;

                updateTrack(editId, updates);
            } else {
                // Create New Track
                // Fallback for cover if not provided
                const finalCoverUrl = coverUrl || "/profile_final.jpg";

                if (audioUrl) {
                    addTrack({
                        title: uploadTitle,
                        artist: user?.name || "Unknown Artist",
                        price: parseFloat(uploadPrice),
                        cover: finalCoverUrl,
                        file: audioUrl
                    });
                }
            }
        }

        setIsUploading(false);
        setIsUploadOpen(false);
        setEditId(null);
        setUploadTitle("");
        setUploadPrice("2.22");
        setAudioFile(null);
        setCoverFile(null);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteTrack(deleteId);
            setDeleteId(null);
            if (selectedTrackId === deleteId) {
                setSelectedTrackId(null);
            }
        }
    };

    // Calculate Stats
    const totalPlays = tracks.reduce((acc, t) => acc + t.plays, 0);
    const totalRevenue = tracks.reduce((acc, t) => acc + t.revenue, 0);

    const selectedTrack = tracks.find(t => t.id === selectedTrackId);

    const displayRevenue = selectedTrack ? selectedTrack.revenue : totalRevenue;
    const displayPlays = selectedTrack ? selectedTrack.plays : totalPlays;
    const displayTitle = selectedTrack ? selectedTrack.title : "All Tracks";

    const revenueData = generateChartData(timeframe, displayRevenue);
    const playsData = generateChartData(timeframe, displayPlays);

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmountStr, setWithdrawAmountStr] = useState('');
    const [totalWithdrawn, setTotalWithdrawn] = useState(() => {
        const saved = localStorage.getItem('etao_total_withdrawn');
        return saved ? parseFloat(saved) : 0;
    });

    // Calculate Available Balance
    const availableBalance = Math.max(0, displayRevenue - totalWithdrawn);
    const balanceAF = Math.floor(availableBalance * 100);

    const handleWithdraw = () => {
        const amountAF = parseFloat(withdrawAmountStr);
        if (isNaN(amountAF) || amountAF < 500) return; // 500 AF = $5

        const amountUSD = amountAF / 100;

        if (amountUSD > availableBalance) {
            alert("Insufficient funds.");
            return;
        }

        const newTotalWithdrawn = totalWithdrawn + amountAF;
        setTotalWithdrawn(newTotalWithdrawn);
        localStorage.setItem('etao_total_withdrawn', newTotalWithdrawn.toString());

        setShowWithdrawModal(false);
        setWithdrawAmountStr('');

        // Confetti effect (simple alert for now)
        alert(`🎉 Success! ${amountAF} AF has been withdrawn to your connected account.`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" className="h-10 w-auto" />
                        <span className="font-bold text-xl tracking-tight">
                            <span className="text-purple-600">Artists</span><span className="text-brand-teal">Hub</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Storage ({storageUsage.toFixed(2)} / 5.0 MB)</div>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${storageUsage > 4.5 ? 'bg-red-500' : 'bg-teal-500'}`}
                                    style={{ width: `${Math.min((storageUsage / 5) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <button
                            onClick={handleClearData}
                            className="mr-2 text-xs font-bold text-red-400 hover:text-red-500 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                        >
                            Reset Data
                        </button>
                        <button
                            onClick={() => navigate('/etao')}
                            className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] md:text-xs font-bold hover:bg-slate-200 transition-colors whitespace-nowrap"
                        >
                            View Public Page
                        </button>
                        <img src={user?.avatar || "/profile_final.jpg"} className="w-10 h-10 rounded-full border border-slate-200" />
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Card - Modified for Withdraw */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-slate-500 font-medium text-sm">
                                    Available Balance
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{balanceAF.toLocaleString()} AF</div>
                                <div className="text-xs text-slate-400 mt-1">Lifetime: {(displayRevenue * 100).toLocaleString()} AF</div>
                            </div>
                            <div className="bg-green-100 text-green-600 p-3 rounded-xl"><DollarSign size={24} /></div>
                        </div>
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            disabled={availableBalance < 5}
                            className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${availableBalance >= 5
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {availableBalance >= 5 ? 'Withdraw Funds' : 'Min. Withdraw 500 AF'}
                        </button>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-slate-500 font-medium text-sm">
                                    {selectedTrackId ? 'Track Plays' : 'Total Plays'}
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{displayPlays.toLocaleString()}</div>
                            </div>
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><PlayCircle size={24} /></div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                            <TrendingUp size={16} className="mr-1" />
                            +12.5% <span className="text-slate-400 font-normal ml-1">vs last month</span>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-slate-500 font-medium text-sm">Total Listeners</div>
                                <div className="text-3xl font-bold text-slate-900">14.2k</div>
                            </div>
                            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl"><Users size={24} /></div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                            <TrendingUp size={16} className="mr-1" />
                            +8.2% <span className="text-slate-400 font-normal ml-1">vs last month</span>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900">Revenue Analytics (9.5 AF/stream)</h3>
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value as any)}
                                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1 outline-none focus:border-teal-500"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="12m">Last 12 Months</option>
                            </select>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `${(value * 100).toLocaleString()}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        formatter={(value: number) => [`${(value * 100).toLocaleString()} AF`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900">Play Analytics</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={playsData}>
                                    <defs>
                                        <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPlays)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Tracks Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">Your Tracks</h3>
                        <button
                            onClick={openUploadModal}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Upload New Track
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cover</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Track Name</th>
                                    <th className="hidden md:table-cell p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Plays</th>
                                    <th className="hidden md:table-cell p-4 text-xs font-bold text-slate-500 uppercase">Revenue</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tracks.map(track => (
                                    <tr
                                        key={track.id}
                                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedTrackId === track.id ? 'bg-teal-50/50' : ''}`}
                                        onClick={() => setSelectedTrackId(selectedTrackId === track.id ? null : track.id)}
                                    >
                                        <td className="p-4">
                                            <div className="h-12 w-12 rounded-lg bg-slate-200 overflow-hidden relative">
                                                <img src={track.cover} className="h-full w-full object-cover" />
                                                {/* Play Overlay */}
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <PlayCircle className="text-white" size={24} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-900">
                                            {track.title}
                                            <div className="md:hidden text-xs text-slate-500 font-normal">{(track.revenue * 100).toFixed(0)} AF • {track.status}</div>
                                        </td>
                                        <td className="hidden md:table-cell p-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                {track.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">{track.plays.toLocaleString()}</td>
                                        <td className="hidden md:table-cell p-4 text-slate-600">{(track.revenue * 100).toLocaleString()} AF</td>
                                        <td className="p-4 text-right space-x-2">
                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(track, e);
                                                }}
                                                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteId(track.id);
                                                }}
                                                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            <AnimatePresence>
                {showWithdrawModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowWithdrawModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
                                <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between border border-green-100">
                                    <div className="text-green-800 font-medium">Available to Withdraw</div>
                                    <div className="text-2xl font-bold text-green-700">${availableBalance.toFixed(2)}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Amount to Withdraw ($)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                                        <input
                                            type="number"
                                            value={withdrawAmountStr}
                                            onChange={(e) => setWithdrawAmountStr(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                                        />
                                        <button
                                            onClick={() => setWithdrawAmountStr(availableBalance.toFixed(2))}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg hover:bg-teal-100 transition-colors"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                        <Info size={12} />
                                        Minimum withdrawal amount is $5.00
                                    </div>
                                </div>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={!withdrawAmountStr || parseFloat(withdrawAmountStr) < 5 || parseFloat(withdrawAmountStr) > availableBalance}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Withdraw Funds
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Upload/Edit Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editId ? 'Edit Track Details' : 'Upload New Track'}
                                </h3>
                                <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Track Title</label>
                                    <input
                                        type="text" required
                                        value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                                        placeholder="e.g. Morning Meditation"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Price ($)</label>
                                    <input
                                        type="number" step="0.01" required
                                        value={uploadPrice} onChange={e => setUploadPrice(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                            Audio File
                                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Max 250MB</span>
                                        </label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[120px]">
                                            <input
                                                key={editId ? `edit-audio-${editId}` : 'new-audio'}
                                                type="file" accept="audio/*"
                                                required={!editId} // Not required for edit
                                                onChange={handleAudioChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <div className="text-purple-600 mb-2 group-hover:scale-110 transition-transform"><Music className="mx-auto" size={24} /></div>
                                            <div className="text-xs text-slate-500 w-full flex flex-col items-center relative z-10">
                                                {audioFile ? (
                                                    <>
                                                        <span className="font-bold text-slate-900 truncate max-w-[120px] mb-1">{audioFile.name}</span>
                                                        <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-full font-bold">Click to Change</span>
                                                    </>
                                                ) : (
                                                    editId ? "Replace Audio File" : "Choose Audio File"
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                            Cover Art
                                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Max 300KB</span>
                                        </label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[120px]">
                                            <input
                                                key={editId ? `edit-cover-${editId}` : 'new-cover'}
                                                type="file" accept="image/*"
                                                onChange={handleCoverChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <div className="text-purple-600 mb-2 group-hover:scale-110 transition-transform"><Upload className="mx-auto" size={24} /></div>
                                            <div className="text-xs text-slate-500 w-full flex flex-col items-center relative z-10">
                                                {coverFile ? (
                                                    <>
                                                        <span className="font-bold text-slate-900 truncate max-w-[120px] mb-1">{coverFile.name}</span>
                                                        <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-full font-bold">Click to Change</span>
                                                    </>
                                                ) : (
                                                    editId ? "Replace Image" : "Choose Image"
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 mt-4 flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (editId ? 'Saving...' : 'Uploading...') : (editId ? 'Save Changes' : 'Publish Track')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Are you sure you want to delete this?</h3>
                            <p className="text-slate-500 mb-6">
                                it will be gone forever!
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
