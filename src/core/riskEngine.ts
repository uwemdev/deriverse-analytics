// Risk Analytics Engine
// Behavioral insights, risk scoring, and trading pattern analysis

import type { Trade, RiskMetrics, TradeCluster } from '../models/types';

/**
 * Calculate comprehensive risk score (0-100, higher = riskier)
 */
export function calculateRiskScore(trades: Trade[], portfolio: { totalEquity: number }): number {
    if (trades.length === 0) return 0;

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    // Factor 1: Drawdown severity (0-30 points)
    const maxDrawdownPct = calculateMaxDrawdownPercentage(sortedTrades, portfolio.totalEquity);
    const drawdownScore = Math.min(maxDrawdownPct * 1.5, 30);

    // Factor 2: Loss streak severity (0-25 points)
    const { maxConsecutiveLosses } = analyzeConsecutiveLosses(sortedTrades);
    const streakScore = Math.min(maxConsecutiveLosses * 5, 25);

    // Factor 3: Volatility of returns (0-25 points)
    const volatility = calculateReturnVolatility(sortedTrades);
    const volatilityScore = Math.min(volatility * 2.5, 25);

    // Factor 4: Overtrading indicator (0-20 points)
    const isOvertrading = detectOvertrading(sortedTrades);
    const overtradingScore = isOvertrading ? 20 : 0;

    const totalScore = drawdownScore + streakScore + volatilityScore + overtradingScore;
    return Math.min(Math.round(totalScore), 100);
}

/**
 * Detect overtrading based on frequency and duration patterns
 */
export function detectOvertrading(trades: Trade[]): boolean {
    if (trades.length < 10) return false;

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    const recentTrades = sortedTrades.slice(-30); // Last 30 trades

    if (recentTrades.length < 10) return false;

    // Calculate average time between trades
    let totalTimeBetween = 0;
    for (let i = 1; i < recentTrades.length; i++) {
        totalTimeBetween += recentTrades[i].timestamp - recentTrades[i - 1].timestamp;
    }
    const avgTimeBetween = totalTimeBetween / (recentTrades.length - 1);

    // Flag overtrading if:
    // 1. Average time between trades < 30 minutes
    // 2. AND average trade duration < 1 hour
    const avgDuration = recentTrades.reduce((sum, t) => sum + t.duration, 0) / recentTrades.length;

    return avgTimeBetween < 30 * 60 * 1000 && avgDuration < 60 * 60 * 1000;
}

/**
 * Analyze consecutive losses
 */
export function analyzeConsecutiveLosses(trades: Trade[]): {
    currentConsecutiveLosses: number;
    maxConsecutiveLosses: number;
} {
    if (trades.length === 0) {
        return { currentConsecutiveLosses: 0, maxConsecutiveLosses: 0 };
    }

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    let currentConsecutiveLosses = 0;
    let maxConsecutiveLosses = 0;
    let tempLossStreak = 0;

    for (let i = sortedTrades.length - 1; i >= 0; i--) {
        const trade = sortedTrades[i];

        if (trade.outcome === 'loss') {
            if (i === sortedTrades.length - 1) {
                currentConsecutiveLosses++;
            }
            tempLossStreak++;
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, tempLossStreak);
        } else {
            if (i === sortedTrades.length - 1) {
                currentConsecutiveLosses = 0;
            }
            tempLossStreak = 0;
        }
    }

    return { currentConsecutiveLosses, maxConsecutiveLosses };
}

/**
 * Calculate performance consistency (lower = more consistent)
 * Returns standard deviation of returns as percentage
 */
export function scorePerformanceConsistency(trades: Trade[]): number {
    if (trades.length === 0) return 0;

    const returns = trades.map(t => t.pnlPercentage);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);
}

/**
 * Calculate return volatility
 */
function calculateReturnVolatility(trades: Trade[]): number {
    if (trades.length === 0) return 0;

    const returns = trades.map(t => t.pnlPercentage);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;

    return Math.sqrt(variance);
}

/**
 * Calculate max drawdown percentage
 */
function calculateMaxDrawdownPercentage(trades: Trade[], initialCapital: number): number {
    if (trades.length === 0) return 0;

    let peak = initialCapital;
    let maxDrawdown = 0;
    let runningEquity = initialCapital;

    for (const trade of trades) {
        runningEquity += trade.netPnl;

        if (runningEquity > peak) {
            peak = runningEquity;
        }

        const drawdown = peak > 0 ? ((peak - runningEquity) / peak) * 100 : 0;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
}

/**
 * Analyze trade clustering patterns
 */
export function analyzeTradeClusterPatterns(trades: Trade[]): TradeCluster[] {
    if (trades.length < 5) return [];

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    const clusters: TradeCluster[] = [];

    // Define cluster window (e.g., 2 hours)
    const clusterWindow = 2 * 60 * 60 * 1000;

    let currentCluster: Trade[] = [sortedTrades[0]];

    for (let i = 1; i < sortedTrades.length; i++) {
        const timeDiff = sortedTrades[i].timestamp - sortedTrades[i - 1].timestamp;

        if (timeDiff <= clusterWindow) {
            currentCluster.push(sortedTrades[i]);
        } else {
            if (currentCluster.length >= 3) {
                clusters.push(analyzeCluster(currentCluster));
            }
            currentCluster = [sortedTrades[i]];
        }
    }

    // Add final cluster
    if (currentCluster.length >= 3) {
        clusters.push(analyzeCluster(currentCluster));
    }

    return clusters;
}

/**
 * Analyze a cluster of trades
 */
function analyzeCluster(trades: Trade[]): TradeCluster {
    const startTime = trades[0].timestamp;
    const endTime = trades[trades.length - 1].timestamp;
    const avgPnl = trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length;

    const wins = trades.filter(t => t.outcome === 'win').length;
    const losses = trades.filter(t => t.outcome === 'loss').length;

    let pattern: TradeCluster['pattern'] = 'normal';

    if (wins >= trades.length * 0.7) {
        pattern = 'winning-streak';
    } else if (losses >= trades.length * 0.7) {
        pattern = 'losing-streak';
    } else if (Math.abs(avgPnl) < 10) {
        pattern = 'choppy';
    }

    return {
        startTime,
        endTime,
        tradeCount: trades.length,
        avgPnl,
        pattern
    };
}

/**
 * Get comprehensive risk metrics
 */
export function getRiskMetrics(trades: Trade[], portfolio: { totalEquity: number }): RiskMetrics {
    const lossMetrics = analyzeConsecutiveLosses(trades);
    const consistency = scorePerformanceConsistency(trades);
    const overtradingFlag = detectOvertrading(trades);
    const riskScore = calculateRiskScore(trades, portfolio);

    // Calculate average daily trades
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    const daysSpan = trades.length > 0
        ? (sortedTrades[sortedTrades.length - 1].timestamp - sortedTrades[0].timestamp) / (1000 * 60 * 60 * 24)
        : 1;
    const avgDailyTrades = daysSpan > 0 ? trades.length / daysSpan : trades.length;

    return {
        riskScore,
        consecutiveLosses: lossMetrics.currentConsecutiveLosses,
        maxConsecutiveLosses: lossMetrics.maxConsecutiveLosses,
        overtradingFlag,
        performanceConsistency: consistency,
        avgDailyTrades
    };
}
