import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Search, TrendingUp, PlusCircle, ListMusic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusic, type Track } from '../context/MusicContext';

// Helper to get top tracks
const getTopTracks = (tracks: Track[], genre: string | null = null) => {
    let filtered = [...tracks];
    if (genre && genre !== "All") {
        filtered = filtered.filter(t => t.genre === genre);
    }
    // Sort by monthly plays
    return filtered.sort((a, b) => (b.monthlyPlays || 0) - (a.monthlyPlays || 0)).slice(0, 100);
};

export default function DiscoverPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { tracks } = useMusic();
    const navigate = useNavigate();

    const [selectedGenre, setSelectedGenre] = useState<string>("All");
    const [activeTab, setActiveTab] = useState<'discover' | 'charts' | 'library'>('discover');

    console.log("DiscoverPage Render", { user, tracksLength: tracks?.length, activeTab });

    if (authLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10 text-slate-500">Loading your experience...</div>;
    }

    if (!tracks) {
        console.error("Tracks is undefined");
        return <div>Error: Tracks not loaded.</div>;
    }

    // Derived Data
    const topTracks = getTopTracks(tracks, selectedGenre);



    // "Top Trending in Genre this Month" - Just taking top 5 of current selection for demo
    const trendingInGenre = getTopTracks(tracks, selectedGenre !== "All" ? selectedGenre : null).slice(0, 5);

    // Mock Playlists
    const [playlists] = useState([
        { id: 1, name: "Morning Vibes", count: 12 },
        { id: 2, name: "Workout Energy", count: 8 },
        { id: 3, name: "Late Night Focus", count: 24 }
    ]);

    const handleAddToPlaylist = (e: React.MouseEvent, trackId: number) => {
        e.stopPropagation();
        alert(`Added track ${trackId} to playlist! (Demo)`);
    };

    const GENRES = [
        "All", "Pop", "R&B", "Hip Hop", "Lo-Fi",
        "Ambient", "Electronic", "Jazz", "Classical",
        "Rock", "Indie", "Soul", "Reggae",
        "House", "Techno", "Meditation", "Healing",
        "Drum & Bass", "Dubstep", "Trance", "Disco",
        "Funk", "Blues", "Country", "Folk",
        "Latin", "Metal", "Punk", "Gospel",
        "Afrobeat", "World", "Trap", "Synthwave"
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo.png" className="h-10 w-auto" />
                        <span className="font-bold text-xl tracking-tight hidden md:inline">
                            <span className="text-purple-600">Artists</span><span className="text-brand-teal">First</span>
                        </span>
                    </div>

                    <div className="flex-1 max-w-lg mx-6 relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search songs, artists, genres..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <img src={user?.avatar || "/profile_final.jpg"} className="w-10 h-10 rounded-full border border-slate-200" />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'discover' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        For You
                    </button>
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'charts' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Top 100 Charts
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'library' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Your Library
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* DISCOVER TAB */}
                {/* DISCOVER TAB */}
                {activeTab === 'discover' && (
                    <motion.div className="space-y-10">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-slate-900 to-purple-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2">Welcome Home, <span className="text-teal-400">{user?.name || "Listener"}</span>!</h1>
                                <p className="text-slate-300">Here's your daily dose of high-vibe frequencies.</p>
                            </div>
                        </div>

                        {/* "Made For You" - 3 Trending Songs per Selected Genre */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Made For You</h2>
                            {user?.favoriteGenres && user.favoriteGenres.length > 0 ? (
                                <div className="space-y-8">
                                    {user.favoriteGenres.map(genre => {
                                        // Get top 3 songs for this specific genre, excluding ones already in playlist (mock logic for exclusion)
                                        const genreHandler = getTopTracks(tracks, genre).slice(0, 3);

                                        if (genreHandler.length === 0) return null;

                                        return (
                                            <div key={genre}>
                                                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                                    Top Trending in {genre}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {genreHandler.map(track => (
                                                        <div key={track.id} className="group relative bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                                                            <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                                                                <img src={track.cover} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                                        <Play className="fill-slate-900 text-slate-900 ml-1" size={24} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-start">
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="font-bold text-slate-900 truncate">{track.title}</h3>
                                                                    <p className="text-sm text-slate-500">{track.artist}</p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => handleAddToPlaylist(e, track.id)}
                                                                    className="text-slate-300 hover:text-purple-600 transition-colors ml-2"
                                                                    title="Add to Playlist"
                                                                >
                                                                    <PlusCircle size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Vibe Selected Yet</h3>
                                    <p className="text-slate-500 mb-6">Select your favorite genres to get personalized recommendations.</p>
                                    <button onClick={() => navigate('/genre-selection')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Pick Your Vibe</button>
                                </div>
                            )}
                        </section>

                        {/* Top Trending In Genre */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Top 5 Trending <span className="text-purple-600">{selectedGenre === "All" ? "Overall" : `in ${selectedGenre}`}</span>
                                </h2>
                                {/* Quick Genre Filter for this section specifically if needed, but using global state is fine */}
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                {trendingInGenre.map((track, i) => (
                                    <div key={track.id} className="flex items-center p-4 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors group cursor-pointer">
                                        <div className="w-8 font-bold text-slate-400 text-center mr-4">{i + 1}</div>
                                        <div className="w-12 h-12 rounded-lg overflow-hidden relative mr-4 flex-shrink-0">
                                            <img src={track.cover} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                                                <Play size={16} className="text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="font-bold text-slate-900 truncate">{track.title}</div>
                                            <div className="text-sm text-slate-500 truncate">{track.artist}</div>
                                        </div>
                                        <div className="text-sm font-bold text-slate-500 mr-4 hidden sm:block">{track.monthlyPlays.toLocaleString()} plays</div>
                                        <button
                                            onClick={(e) => handleAddToPlaylist(e, track.id)}
                                            className="p-2 text-slate-300 hover:text-purple-600 transition-colors"
                                        >
                                            <PlusCircle size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">New Arrivals</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tracks.slice(0, 6).map(track => (
                                    <div key={track.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <img src={track.cover} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate">{track.title}</h4>
                                            <p className="text-xs text-slate-500">{track.artist}</p>
                                        </div>
                                        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-teal hover:text-white">
                                            <Play size={14} className="ml-0.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}

                {/* CHARTS TAB */}
                {activeTab === 'charts' && (
                    <motion.div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    <TrendingUp className="text-brand-teal" />
                                    Top 100 Charts
                                </h1>
                                <p className="text-slate-500">The most played tracks this month on Artists First.</p>
                            </div>

                            {/* Genre Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {GENRES.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedGenre === genre ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 w-12 text-center text-xs font-bold text-slate-400">#</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Track</th>
                                        <th className="hidden md:table-cell p-4 text-xs font-bold text-slate-500 uppercase">Artist</th>
                                        <th className="hidden md:table-cell p-4 text-xs font-bold text-slate-500 uppercase">Genre</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Monthly Plays</th>
                                        <th className="p-4 w-12">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topTracks.map((track, i) => (
                                        <tr key={track.id} className="hover:bg-slate-50 group transition-colors cursor-pointer">
                                            <td className="p-4 text-center font-bold text-slate-400 w-12">
                                                <span className="group-hover:hidden">{i + 1}</span>
                                                <Play size={16} className="hidden group-hover:block mx-auto text-slate-900 fill-slate-900" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={track.cover} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 truncate">{track.title}</div>
                                                        <div className="md:hidden text-xs text-slate-500">{track.artist}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-sm text-slate-600 font-medium">{track.artist}</td>
                                            <td className="hidden md:table-cell p-4">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{track.genre || "Unclassified"}</span>
                                            </td>
                                            <td className="p-4 text-right font-mono text-sm text-slate-600">
                                                {(track.monthlyPlays || 0).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right flex gap-2 justify-end">
                                                <button className="text-slate-300 hover:text-pink-500 transition-colors"><Heart size={18} /></button>
                                                <button onClick={(e) => handleAddToPlaylist(e, track.id)} className="text-slate-300 hover:text-purple-600 transition-colors"><PlusCircle size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {topTracks.length === 0 && (
                                <div className="p-12 text-center text-slate-400">
                                    No tracks found for this genre.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* LIBRARY / PLAYLISTS TAB */}
                {activeTab === 'library' && (
                    <motion.div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Your Library</h2>
                            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm flex items-center gap-2">
                                <PlusCircle size={16} />
                                New Playlist
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {/* Playlist Cards */}
                            {playlists.map(playlist => (
                                <div key={playlist.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg hover:scale-[1.02] transition-transform cursor-pointer group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10">
                                        <ListMusic size={32} className="mb-4 text-teal-400" />
                                        <h3 className="text-xl font-bold mb-1">{playlist.name}</h3>
                                        <p className="text-slate-400 text-sm">{playlist.count} tracks</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-6">Liked Songs</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Mock Liked Songs */}
                            <div className="p-12 text-center text-slate-400">
                                <Heart size={48} className="mx-auto mb-4 text-slate-200" />
                                <p>You haven't liked any songs yet.</p>
                                <button onClick={() => setActiveTab('discover')} className="mt-4 text-brand-teal font-bold hover:underline">Discover Music</button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
