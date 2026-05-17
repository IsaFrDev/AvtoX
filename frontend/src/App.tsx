import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TenantContainer from './components/TenantContainer';

function App() {
  return (
    <Router>
      <Routes>
        {/* SaaS Landing */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Tenant Sites (Original UI) */}
        <Route path="/:username/*" element={<TenantContainer />} />
      </Routes>
    </Router>
  );
}

export default App;
