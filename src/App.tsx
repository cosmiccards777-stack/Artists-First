import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import ArtistProfile from './pages/ArtistProfile';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ArtistDashboard from './pages/ArtistDashboard';
import GenreSelection from './pages/GenreSelection';
import DiscoverPage from './pages/DiscoverPage';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>; // Could be a nice spinner

  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'artist') return <Navigate to="/" replace />; // Only artists can access dashboard

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <div className="bg-slate-50 min-h-screen">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/etao" element={<ArtistProfile />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/genre-selection" element={<GenreSelection />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ArtistDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
