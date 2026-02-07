import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Track {
    id: number;
    title: string;
    artist: string;
    price: number;
    cover: string;
    file: string;
    plays: number;
    revenue: number;
    status: 'Active' | 'Draft';
}

interface MusicContextType {
    tracks: Track[];
    addTrack: (track: Omit<Track, 'id' | 'plays' | 'revenue' | 'status'>) => void;
    deleteTrack: (id: number) => void;
    updateTrack: (id: number, updates: Partial<Omit<Track, 'id' | 'plays' | 'revenue'>>) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Initial Data (moved from Home.tsx)
const INITIAL_DATA: Track[] = [
    { id: 1, title: "She's Beautiful 639Hz", artist: "Etao", price: 2.22, cover: "/cover_shes_beautiful.png", file: "/shes_beautiful_639hz.wav", plays: 1240, revenue: 11.78, status: 'Active' },
    { id: 2, title: "Deep Healing (432Hz)", artist: "Etao", price: 2.22, cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop", file: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", plays: 890, revenue: 8.46, status: 'Active' },
    { id: 3, title: "Celestial Flow (963Hz)", artist: "Etao", price: 2.22, cover: "https://images.unsplash.com/photo-1459749411177-d4a37196040e?w=200&h=200&fit=crop", file: "https://actions.google.com/sounds/v1/science_fiction/scifi_freight_elevator.ogg", plays: 560, revenue: 5.32, status: 'Active' },
];

export function MusicProvider({ children }: { children: ReactNode }) {
    // Initialize directly from localStorage to avoid race conditions
    const [tracks, setTracks] = useState<Track[]>(() => {
        const stored = localStorage.getItem('etao_tracks_v1');
        return stored ? JSON.parse(stored) : INITIAL_DATA;
    });

    // Save to local storage on change
    useEffect(() => {
        try {
            localStorage.setItem('etao_tracks_v1', JSON.stringify(tracks));
        } catch (error) {
            console.error("Storage full:", error);
            alert("⚠️ Demo Storage Full! \n\nYour changes (images) are too large to save locally. They will work for this session but won't persist after reload. \n\nPlease use smaller images (<500KB recommended).");
        }
    }, [tracks]);

    const addTrack = (newTrackData: Omit<Track, 'id' | 'plays' | 'revenue' | 'status'>) => {
        const newTrack: Track = {
            ...newTrackData,
            id: Date.now(), // Simple ID generation
            plays: 0,
            revenue: 0,
            status: 'Active'
        };
        setTracks(prev => [newTrack, ...prev]);
    };

    const deleteTrack = (id: number) => {
        setTracks(prev => prev.filter(t => t.id !== id));
    };

    const updateTrack = (id: number, updates: Partial<Omit<Track, 'id' | 'plays' | 'revenue'>>) => {
        setTracks(prev => prev.map(track =>
            track.id === id ? { ...track, ...updates } : track
        ));
    };

    return (
        <MusicContext.Provider value={{ tracks, addTrack, deleteTrack, updateTrack }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}
