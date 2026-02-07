import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GENRES = [
    "Pop", "R&B", "Hip Hop", "Lo-Fi",
    "Ambient", "Electronic", "Jazz", "Classical",
    "Rock", "Indie", "Soul", "Reggae",
    "House", "Techno", "Meditation"
];

export default function GenreSelection() {
    const { user, updateGenres } = useAuth();
    const navigate = useNavigate();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        // If already selected, skip
        if (user.favoriteGenres && user.favoriteGenres.length === 4) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const toggleGenre = (genre: string) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(prev => prev.filter(g => g !== genre));
        } else {
            if (selectedGenres.length < 4) {
                setSelectedGenres(prev => [...prev, genre]);
            }
        }
    };

    const handleContinue = () => {
        if (selectedGenres.length === 4) {
            updateGenres(selectedGenres);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Pick Your Vibe 🎵</h1>
                    <p className="text-slate-500 text-lg">Select exactly 4 genres to help us curate your experience.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                    {GENRES.map((genre) => {
                        const isSelected = selectedGenres.includes(genre);
                        return (
                            <motion.button
                                key={genre}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleGenre(genre)}
                                className={`
                                    relative h-32 rounded-2xl flex items-center justify-center text-lg font-bold transition-all shadow-sm
                                    ${isSelected
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 ring-4 ring-slate-200'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                `}
                            >
                                {genre}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 bg-white text-slate-900 rounded-full p-1">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleContinue}
                        disabled={selectedGenres.length !== 4}
                        className={`
                            px-12 py-4 rounded-full font-bold text-lg transition-all
                            ${selectedGenres.length === 4
                                ? 'bg-brand-teal text-white shadow-lg shadow-teal-500/30 hover:scale-105'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {selectedGenres.length === 4 ? "Start Listening" : `Select ${4 - selectedGenres.length} more`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
