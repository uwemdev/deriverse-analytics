import { useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { generateCompleteDataset } from './data/mockDataGenerator';
import './styles/theme.css';
import './styles/components.css';
import './styles/dashboard.css';

function App() {
  // Generate mock data (simulates loading from Solana/API)
  const { trades, portfolio } = useMemo(() => {
    return generateCompleteDataset();
  }, []);

  return <Dashboard trades={trades} portfolio={portfolio} />;
}

export default App;
