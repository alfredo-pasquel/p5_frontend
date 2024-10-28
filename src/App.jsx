import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SpotifyCallback from './pages/SpotifyCallback';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import RecordSearch from './pages/RecordSearch'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<RecordSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
