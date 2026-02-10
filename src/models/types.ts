// Core data models and TypeScript interfaces for Deriverse Analytics

/**
 * Represents a single trade execution
 */
export interface Trade {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  symbol: string; // e.g., "SOL/USDC", "BTC/USDC"
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage?: number;
  
  // Calculated fields
  pnl: number; // Profit and loss
  pnlPercentage: number;
  fees: number;
  netPnl: number; // PnL after fees
  
  // Trade metadata
  orderType: 'market' | 'limit' | 'stop';
  duration: number; // Duration in milliseconds
  outcome: 'win' | 'loss';
  
  // Volume and fees breakdown
  volume: number; // Notional value
  makerFee?: number;
  takerFee?: number;
  
  // Journal annotations
  notes?: string;
  tags?: string[];
  emotionalState?: string;
}

/**
 * Represents an active trading position
 */
export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage?: number;
  
  // Unrealized metrics
  unrealizedPnl: number;
  unrealizedPnlPercentage: number;
  
  // Risk metrics
  liquidationPrice?: number;
  marginUsed?: number;
  
  openTimestamp: number;
}

/**
 * Portfolio state snapshot
 */
export interface Portfolio {
  timestamp: number;
  totalEquity: number; // Total account value
  cashBalance: number;
  
  // Position metrics
  totalPositionValue: number;
  marginUsed: number;
  availableMargin: number;
  
  // Performance
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  
  // Fee tracking
  totalFeesPaid: number;
}

/**
 * Aggregated performance metrics
 */
export interface PerformanceMetrics {
  // Core metrics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // Percentage
  
  // PnL metrics
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  
  // Return metrics
  roi: number; // Return on investment percentage
  averageReturn: number;
  
  // Win/Loss analysis
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  
  // Advanced metrics
  profitFactor: number; // Gross profit / gross loss
  expectancy: number; // Expected value per trade
  sharpeRatio?: number; // Risk-adjusted return
  
  // Drawdown
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  currentDrawdown: number;
  
  // Position analysis
  longTrades: number;
  shortTrades: number;
  longShortRatio: number;
  
  // Volume and fees
  totalVolume: number;
  totalFees: number;
  feeToProfitRatio: number;
  
  // Duration metrics
  averageTradeDuration: number; // In milliseconds
  shortestTrade: number;
  longestTrade: number;
}

/**
 * Time-series data point for charts
 */
export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  label?: string;
}

/**
 * Equity curve data
 */
export interface EquityCurveData {
  equity: TimeSeriesPoint[];
  drawdown: TimeSeriesPoint[];
  peak: number;
  valley: number;
}

/**
 * Symbol-specific performance breakdown
 */
export interface SymbolPerformance {
  symbol: string;
  trades: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
  volume: number;
}

/**
 * Time-based performance breakdown
 */
export interface TimeBasedPerformance {
  daily: Map<string, number>; // Date string -> PnL
  hourly: Map<number, number>; // Hour (0-23) -> PnL
  sessionBased: {
    morning: number; // 00:00 - 12:00
    afternoon: number; // 12:00 - 18:00
    evening: number; // 18:00 - 24:00
  };
}

/**
 * Fee composition breakdown
 */
export interface FeeBreakdown {
  totalFees: number;
  makerFees: number;
  takerFees: number;
  makerPercentage: number;
  takerPercentage: number;
}

/**
 * Risk assessment metrics
 */
export interface RiskMetrics {
  riskScore: number; // 0-100, higher = riskier
  consecutiveLosses: number;
  maxConsecutiveLosses: number;
  overtradingFlag: boolean;
  performanceConsistency: number; // Standard deviation of returns
  avgDailyTrades: number;
}

/**
 * Date range filter
 */
export interface DateRange {
  start: number;
  end: number;
}

/**
 * Filter criteria for analytics
 */
export interface FilterCriteria {
  dateRange?: DateRange;
  symbols?: string[];
  outcome?: 'win' | 'loss' | 'all';
  side?: 'long' | 'short' | 'all';
  minPnl?: number;
  maxPnl?: number;
}

/**
 * Trade clustering pattern
 */
export interface TradeCluster {
  startTime: number;
  endTime: number;
  tradeCount: number;
  avgPnl: number;
  pattern: 'winning-streak' | 'losing-streak' | 'choppy' | 'normal';
}
