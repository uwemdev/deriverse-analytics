import { useState, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { SplashScreen } from './components/SplashScreen';
import { LoadingState } from './components/LoadingState';
import { ThemeProvider } from './contexts/ThemeContext';
import { generateCompleteDataset } from "./data/tradeDataService";
import './styles/theme.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/animations.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Generate data using the new service
  const { trades, portfolio } = useMemo(() => {
    return generateCompleteDataset();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ThemeProvider>
      <div className="dashboard-content">
        <Dashboard trades={trades} portfolio={portfolio} />
      </div>
    </ThemeProvider>
  );
}

export default App;
