import { useState, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { SplashScreen } from './components/SplashScreen';
import { LoadingState } from './components/LoadingState';
import { generateCompleteDataset } from './data/mockDataGenerator';
import './styles/theme.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/animations.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock data (simulates loading from Solana/API)
  const { trades, portfolio } = useMemo(() => {
    // Simulate data loading delay
    setTimeout(() => setIsLoading(false), 1000);
    return generateCompleteDataset();
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="dashboard-content">
      <Dashboard trades={trades} portfolio={portfolio} />
    </div>
  );
}

export default App;
