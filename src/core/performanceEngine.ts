// Performance Analytics Engine
// Calculates key performance metrics, equity curves, and drawdown analysis

import type {
    Trade,
    PerformanceMetrics,
    TimeSeriesPoint,
    EquityCurveData
} from '../models/types';

/**
 * Calculate comprehensive performance metrics from trades
 */
export function calculatePerformanceMetrics(
    trades: Trade[],
    initialCapital: number = 10000
): PerformanceMetrics {
    if (trades.length === 0) {
        return getEmptyMetrics();
    }

    // Sort trades by timestamp
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    // Basic trade counts
    const totalTrades = sortedTrades.length;
    const winningTrades = sortedTrades.filter(t => t.outcome === 'win').length;
    const losingTrades = sortedTrades.filter(t => t.outcome === 'loss').length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // PnL calculations
    const totalPnl = sortedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const netProfit = sortedTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const totalFees = sortedTrades.reduce((sum, t) => sum + t.fees, 0);

    const wins = sortedTrades.filter(t => t.outcome === 'win');
    const losses = sortedTrades.filter(t => t.outcome === 'loss');

    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

    // Win/Loss analysis
    const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
    const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0;

    // Advanced metrics
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const expectancy = (winRate / 100 * averageWin) - ((1 - winRate / 100) * averageLoss);

    // ROI
    const roi = initialCapital > 0 ? (netProfit / initialCapital) * 100 : 0;
    const averageReturn = totalTrades > 0 ? (totalPnl / totalTrades) : 0;

    // Drawdown analysis
    const equityCurve = calculateEquityCurve(sortedTrades, initialCapital);
    const drawdownMetrics = calculateDrawdown(equityCurve.equity);

    // Position analysis
    const longTrades = sortedTrades.filter(t => t.side === 'long').length;
    const shortTrades = sortedTrades.filter(t => t.side === 'short').length;
    const longShortRatio = shortTrades > 0 ? longTrades / shortTrades : longTrades;

    // Volume
    const totalVolume = sortedTrades.reduce((sum, t) => sum + t.volume, 0);
    const feeToProfitRatio = grossProfit > 0 ? (totalFees / grossProfit) * 100 : 0;

    // Duration metrics
    const durations = sortedTrades.map(t => t.duration);
    const averageTradeDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const shortestTrade = Math.min(...durations);
    const longestTrade = Math.max(...durations);

    // Sharpe ratio (simplified - assumes daily returns)
    const sharpeRatio = calculateSharpeRatio(sortedTrades, initialCapital);

    return {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        totalPnl,
        realizedPnl: totalPnl,
        unrealizedPnl: 0,
        grossProfit,
        grossLoss,
        netProfit,
        roi,
        averageReturn,
        averageWin,
        averageLoss,
        largestWin,
        largestLoss,
        profitFactor,
        expectancy,
        sharpeRatio,
        maxDrawdown: drawdownMetrics.maxDrawdown,
        maxDrawdownPercentage: drawdownMetrics.maxDrawdownPercentage,
        currentDrawdown: drawdownMetrics.currentDrawdown,
        longTrades,
        shortTrades,
        longShortRatio,
        totalVolume,
        totalFees,
        feeToProfitRatio,
        averageTradeDuration,
        shortestTrade,
        longestTrade,
    };
}

/**
 * Calculate equity curve from trades
 */
export function calculateEquityCurve(
    trades: Trade[],
    initialCapital: number = 10000
): EquityCurveData {
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    let runningEquity = initialCapital;
    const equityPoints: TimeSeriesPoint[] = [
        { timestamp: sortedTrades[0]?.timestamp || Date.now(), value: initialCapital }
    ];

    for (const trade of sortedTrades) {
        runningEquity += trade.netPnl;
        equityPoints.push({
            timestamp: trade.timestamp,
            value: runningEquity
        });
    }

    // Calculate drawdown series
    const drawdownPoints: TimeSeriesPoint[] = [];
    let peak = initialCapital;

    for (const point of equityPoints) {
        if (point.value > peak) {
            peak = point.value;
        }
        const drawdown = peak > 0 ? ((peak - point.value) / peak) * 100 : 0;
        drawdownPoints.push({
            timestamp: point.timestamp,
            value: drawdown
        });
    }

    const valley = Math.min(...equityPoints.map(p => p.value));

    return {
        equity: equityPoints,
        drawdown: drawdownPoints,
        peak,
        valley
    };
}

/**
 * Calculate drawdown metrics
 */
export function calculateDrawdown(equityCurve: TimeSeriesPoint[]): {
    maxDrawdown: number;
    maxDrawdownPercentage: number;
    currentDrawdown: number;
} {
    if (equityCurve.length === 0) {
        return { maxDrawdown: 0, maxDrawdownPercentage: 0, currentDrawdown: 0 };
    }

    let peak = equityCurve[0].value;
    let maxDrawdown = 0;
    let maxDrawdownPercentage = 0;

    for (const point of equityCurve) {
        if (point.value > peak) {
            peak = point.value;
        }

        const drawdown = peak - point.value;
        const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;

        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            maxDrawdownPercentage = drawdownPct;
        }
    }

    // Current drawdown
    const currentValue = equityCurve[equityCurve.length - 1].value;
    const currentPeak = Math.max(...equityCurve.map(p => p.value));
    const currentDrawdown = currentPeak > 0 ? ((currentPeak - currentValue) / currentPeak) * 100 : 0;

    return {
        maxDrawdown,
        maxDrawdownPercentage,
        currentDrawdown
    };
}

/**
 * Calculate Sharpe Ratio (risk-adjusted return)
 * Simplified version using daily returns
 */
export function calculateSharpeRatio(
    trades: Trade[],
    initialCapital: number,
    riskFreeRate: number = 0.02
): number {
    if (trades.length === 0) return 0;

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate daily returns
    const dailyReturns = new Map<string, number>();

    for (const trade of sortedTrades) {
        const date = new Date(trade.timestamp).toISOString().split('T')[0];
        const existingReturn = dailyReturns.get(date) || 0;
        dailyReturns.set(date, existingReturn + trade.netPnl);
    }

    const returns = Array.from(dailyReturns.values()).map(r => (r / initialCapital) * 100);

    if (returns.length === 0) return 0;

    // Calculate mean and standard deviation
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualized Sharpe ratio (assuming 252 trading days)
    const dailyRiskFreeRate = riskFreeRate / 252;
    const sharpe = ((mean - dailyRiskFreeRate) / stdDev) * Math.sqrt(252);

    return sharpe;
}

/**
 * Calculate total PnL (realized + unrealized)
 */
export function calculateTotalPnL(trades: Trade[], unrealizedPnl: number = 0): number {
    const realizedPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    return realizedPnl + unrealizedPnl;
}

/**
 * Calculate ROI percentage
 */
export function calculateROI(totalPnl: number, initialCapital: number): number {
    if (initialCapital === 0) return 0;
    return (totalPnl / initialCapital) * 100;
}

/**
 * Get empty metrics object
 */
function getEmptyMetrics(): PerformanceMetrics {
    return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnl: 0,
        realizedPnl: 0,
        unrealizedPnl: 0,
        grossProfit: 0,
        grossLoss: 0,
        netProfit: 0,
        roi: 0,
        averageReturn: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
        expectancy: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        maxDrawdownPercentage: 0,
        currentDrawdown: 0,
        longTrades: 0,
        shortTrades: 0,
        longShortRatio: 0,
        totalVolume: 0,
        totalFees: 0,
        feeToProfitRatio: 0,
        averageTradeDuration: 0,
        shortestTrade: 0,
        longestTrade: 0,
    };
}
