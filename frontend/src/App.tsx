import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Game from './pages/Game';
import Results from './pages/Results';

function App() {
  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </main>
  );
}

export default App;