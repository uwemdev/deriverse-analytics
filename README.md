# Deriverse Trading Analytics Dashboard

> **A production-grade trading analytics and journaling platform for Deriverse - Solana's next-generation decentralized trading ecosystem**

<img src="https://img.shields.io/badge/Built%20for-Deriverse-blueviolet" alt="Deriverse" /> <img src="https://img.shields.io/badge/Solana-Compatible-14F195" alt="Solana" /> <img src="https://img.shields.io/badge/React-18-61DAFB" alt="React" /> <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript" />

## 🎯 Overview

This is a comprehensive trading analytics solution built for active traders on Deriverse, featuring:

- **Real-time Performance Tracking** - Total PnL, ROI, equity curves, and drawdown analysis
- **Advanced Trade Analytics** - Win rates, expectancy, profit factors, and behavioral insights
- **Professional Trade Journal** - Detailed trade history with filtering, sorting, and annotations
- **Risk Intelligence** - Automated risk scoring, overtrading detection, and consistency analysis
- **Symbol-Level Insights** - Performance breakdown by trading pairs
- **Time-Based Analysis** - Daily, hourly, and session-based performance metrics
- **Fee Intelligence** - Comprehensive fee tracking and optimization suggestions

## ✨ Features

**[🎯 Live Demo](#)** | **[📁 GitHub Repository](#)**

### Performance Metrics Engine
- ✅ Total PnL tracking (realized + unrealized)
- ✅ ROI and return percentages
- ✅ Historical equity curve with peak/valley tracking
- ✅ Maximum drawdown calculation and visualization
- ✅ Sharpe ratio (risk-adjusted returns)

### Trade Behavior Analytics
- ✅ Win rate statistics
- ✅ Average win vs average loss analysis
- ✅ Largest gain/loss tracking
- ✅ Expectancy and profit factor calculations
- ✅ Consecutive win/loss streak analysis

### Position & Symbol Analysis
- ✅ Long vs short ratio tracking
- ✅ Directional bias analysis over time
- ✅ Symbol-specific performance breakdown
- ✅ Volume and trade count by symbol

### Time-Based Analytics
- ✅ Daily performance aggregation
- ✅ Session-based analytics (morning/afternoon/evening)
- ✅ Hour-of-day performance analysis
- ✅ Trade duration metrics

### Volume & Fee Intelligence
- ✅ Total trading volume tracking
- ✅ Fee composition breakdown (maker vs taker)
- ✅ Cumulative fee tracking
- ✅ Fee-to-profit ratio analysis

### Trade Journal System
- ✅ Comprehensive trade history table
- ✅ Multi-criteria filtering (symbol, outcome, date)
- ✅ Sortable columns
- ✅ Trade annotations and tags
- ✅ Detailed PnL and duration tracking

### Innovation Features
- ✅ **Risk Scoring System** - Automated 0-100 risk score based on drawdown, volatility, and behavior
- ✅ **Overtrading Detection** - Flags excessive trading frequency patterns
- ✅ **Performance Consistency Analysis** - Measures return volatility
- ✅ **Trade Clustering** - Identifies winning/losing streaks and choppy patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd deriverse-analytics

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite (fast, modern bundling)
- **Charting**: Recharts (responsive financial charts)
- **Styling**: Vanilla CSS with CSS variables (professional dark trading theme)
- **State Management**: React hooks and Context API

### Project Structure

```
deriverse-analytics/
├── src/
│   ├── core/                    # Analytics calculation engines
│   │   ├── performanceEngine.ts # PnL, equity curves, drawdown
│   │   ├── tradeAnalyticsEngine.ts # Win/loss statistics
│   │   ├── timeAnalyticsEngine.ts  # Time-based metrics
│   │   ├── feeAnalyticsEngine.ts   # Fee analysis
│   │   └── riskEngine.ts        # Risk scoring & behavioral insights
│   ├── models/
│   │   └── types.ts             # TypeScript interfaces
│   ├── data/
│   │   └── mockDataGenerator.ts # Realistic trade data generation
│   ├── components/              # React UI components
│   │   ├── Dashboard.tsx        # Main dashboard layout
│   │   ├── MetricCard.tsx       # Metric display cards
│   │   ├── EquityCurveChart.tsx # Equity & drawdown chart
│   │   └── TradeJournal.tsx     # Trade history table
│   ├── utils/
│   │   └── formatters.ts        # Number, date, currency formatters
│   └── styles/                  # CSS stylesheets
│       ├── theme.css            # Color palette & variables
│       ├── components.css       # Reusable component styles
│       └── dashboard.css        # Layout styles
└── docs/                        # Documentation
```

### Data Flow

```
Mock Data Generator → Trade[] → Analytics Engines → Metrics → UI Components
```

**Future Solana Integration:**
The system is designed with a clean separation between data ingestion and analytics. To integrate with Deriverse on Solana:

1. Replace `mockDataGenerator.ts` with a Solana data adapter
2. Use the Deriverse TypeScript SDK (`@deriverse/kit`)
3. Fetch trades from on-chain program accounts
4. All analytics engines work with the same `Trade` interface

## 📊 Metrics Explained

### Risk Score (0-100)
A composite risk metric calculated from:
- **Drawdown Severity** (0-30 points)
- **Loss Streak Severity** (0-25 points)
- **Return Volatility** (0-25 points)
- **Overtrading Detection** (0-20 points)

Higher scores indicate riskier trading behavior.

### Sharpe Ratio
Risk-adjusted return metric. Calculated as:
```
(Average Return - Risk-Free Rate) / Standard Deviation of Returns
```
Annualized using √252 (trading days). Higher is better.

### Profit Factor
Ratio of gross profits to gross losses:
```
Gross Profit / Gross Loss
```
Values > 1 indicate profitable trading. Values > 2 are excellent.

### Expectancy
Expected value per trade:
```
(Win Rate × Avg Win) - (Loss Rate × Avg Loss)
```
Positive expectancy indicates edge in trading system.

## 🎨 Design

Professional dark trading theme with:
- Deep black backgrounds for reduced eye strain
- Green/red color coding for profit/loss
- High-contrast text for readability
- Responsive design (desktop, tablet, mobile)
- Smooth transitions and hover states

## 🔒 Security & Best Practices

- **No Private Keys**: This is a read-only analytics tool
- **Type Safety**: Full TypeScript coverage
- **Defensive Programming**: Null checks, edge case handling
- **Clean Code**: Modular architecture, single responsibility
- **Performance**: Memoized calculations, efficient React patterns

## 🚀 Deployment

This project is optimized for deployment on **Vercel**:

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)

### Manual Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting platform:
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag & drop `dist/` folder
   - **GitHub Pages**: Use `gh-pages` package

### Environment Variables

No environment variables required for the demo version. For Solana integration:

```env
VITE_DERIVERSE_RPC_URL=your_solana_rpc_url
VITE_DERIVERSE_PROGRAM_ID=deriverse_program_id
```

## 📈 Future Enhancements

- [ ] Real-time Solana integration via Deriverse SDK
- [ ] Export trade history to CSV/JSON
- [ ] Advanced charting (candlesticks, indicators)
- [ ] Custom date range filtering
- [ ] Performance comparison (vs. benchmarks)
- [ ] Portfolio optimization suggestions
- [ ] Mobile app version
- [ ] Multi-wallet support

## 🤝 Contributing

This project was built for the Deriverse bounty. Contributions, issues, and feature requests are welcome!

## 📜 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Deriverse Documentation](https://deriverse.gitbook.io/deriverse-v1)
- [Deriverse TypeScript SDK](https://npmjs.com/@deriverse/kit)
- [Deriverse Discord](https://discord.gg/gSGV5wr8)
- [Deriverse Twitter](https://x.com/@deriverse_io)

---

**Built with ❤️ for the Deriverse community**
