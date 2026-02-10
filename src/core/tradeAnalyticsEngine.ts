// Trade Analytics Engine
// Calculates trade behavior metrics, win/loss statistics, and trading patterns

import type { Trade, SymbolPerformance } from '../models/types';

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const winningTrades = trades.filter(t => t.outcome === 'win').length;
    return (winningTrades / trades.length) * 100;
}

/**
 * Calculate average win amount
 */
export function calculateAverageWin(trades: Trade[]): number {
    const wins = trades.filter(t => t.outcome === 'win');
    if (wins.length === 0) return 0;
    const totalWinPnl = wins.reduce((sum, t) => sum + t.pnl, 0);
    return totalWinPnl / wins.length;
}

/**
 * Calculate average loss amount
 */
export function calculateAverageLoss(trades: Trade[]): number {
    const losses = trades.filter(t => t.outcome === 'loss');
    if (losses.length === 0) return 0;
    const totalLossPnl = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    return totalLossPnl / losses.length;
}

/**
 * Calculate expectancy (expected value per trade)
 * Formula: (Win% × Avg Win) - (Loss% × Avg Loss)
 */
export function calculateExpectancy(trades: Trade[]): number {
    if (trades.length === 0) return 0;

    const winRate = calculateWinRate(trades) / 100;
    const lossRate = 1 - winRate;
    const avgWin = calculateAverageWin(trades);
    const avgLoss = calculateAverageLoss(trades);

    return (winRate * avgWin) - (lossRate * avgLoss);
}

/**
 * Calculate profit factor (Gross Profit / Gross Loss)
 */
export function calculateProfitFactor(trades: Trade[]): number {
    const wins = trades.filter(t => t.outcome === 'win');
    const losses = trades.filter(t => t.outcome === 'loss');

    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
    return grossProfit / grossLoss;
}

/**
 * Find the largest winning trade
 */
export function findLargestGain(trades: Trade[]): Trade | null {
    const wins = trades.filter(t => t.outcome === 'win');
    if (wins.length === 0) return null;
    return wins.reduce((max, t) => t.pnl > max.pnl ? t : max, wins[0]);
}

/**
 * Find the largest losing trade
 */
export function findLargestLoss(trades: Trade[]): Trade | null {
    const losses = trades.filter(t => t.outcome === 'loss');
    if (losses.length === 0) return null;
    return losses.reduce((min, t) => t.pnl < min.pnl ? t : min, losses[0]);
}

/**
 * Analyze performance by symbol
 */
export function analyzeBySymbol(trades: Trade[]): SymbolPerformance[] {
    const symbolMap = new Map<string, Trade[]>();

    // Group trades by symbol
    for (const trade of trades) {
        const existing = symbolMap.get(trade.symbol) || [];
        existing.push(trade);
        symbolMap.set(trade.symbol, existing);
    }

    // Calculate metrics for each symbol
    const symbolPerformance: SymbolPerformance[] = [];

    for (const [symbol, symbolTrades] of symbolMap.entries()) {
        const totalPnl = symbolTrades.reduce((sum, t) => sum + t.pnl, 0);
        const volume = symbolTrades.reduce((sum, t) => sum + t.volume, 0);

        symbolPerformance.push({
            symbol,
            trades: symbolTrades.length,
            winRate: calculateWinRate(symbolTrades),
            totalPnl,
            averagePnl: totalPnl / symbolTrades.length,
            volume
        });
    }

    // Sort by total PnL descending
    return symbolPerformance.sort((a, b) => b.totalPnl - a.totalPnl);
}

/**
 * Calculate average trade duration
 */
export function calculateAverageHoldTime(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const totalDuration = trades.reduce((sum, t) => sum + t.duration, 0);
    return totalDuration / trades.length;
}

/**
 * Calculate long vs short trade counts and ratio
 */
export function calculateLongShortRatio(trades: Trade[]): {
    longTrades: number;
    shortTrades: number;
    ratio: number;
    longWinRate: number;
    shortWinRate: number;
} {
    const longTrades = trades.filter(t => t.side === 'long');
    const shortTrades = trades.filter(t => t.side === 'short');

    return {
        longTrades: longTrades.length,
        shortTrades: shortTrades.length,
        ratio: shortTrades.length > 0 ? longTrades.length / shortTrades.length : longTrades.length,
        longWinRate: calculateWinRate(longTrades),
        shortWinRate: calculateWinRate(shortTrades)
    };
}

/**
 * Analyze directional bias over time
 * Returns percentage of long trades in different time periods
 */
export function analyzeDirectionalBias(trades: Trade[]): {
    overall: number;
    recentMonth: number;
    recentWeek: number;
} {
    if (trades.length === 0) {
        return { overall: 50, recentMonth: 50, recentWeek: 50 };
    }

    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const overallLongPct = (trades.filter(t => t.side === 'long').length / trades.length) * 100;

    const recentMonthTrades = trades.filter(t => t.timestamp >= oneMonthAgo);
    const recentMonthLongPct = recentMonthTrades.length > 0
        ? (recentMonthTrades.filter(t => t.side === 'long').length / recentMonthTrades.length) * 100
        : 50;

    const recentWeekTrades = trades.filter(t => t.timestamp >= oneWeekAgo);
    const recentWeekLongPct = recentWeekTrades.length > 0
        ? (recentWeekTrades.filter(t => t.side === 'long').length / recentWeekTrades.length) * 100
        : 50;

    return {
        overall: overallLongPct,
        recentMonth: recentMonthLongPct,
        recentWeek: recentWeekLongPct
    };
}

/**
 * Calculate consecutive wins and losses
 */
export function analyzeStreaks(trades: Trade[]): {
    currentStreak: number;
    currentStreakType: 'win' | 'loss' | 'none';
    longestWinStreak: number;
    longestLossStreak: number;
} {
    if (trades.length === 0) {
        return { currentStreak: 0, currentStreakType: 'none', longestWinStreak: 0, longestLossStreak: 0 };
    }

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    let currentStreak = 1;
    let currentStreakType: 'win' | 'loss' = sortedTrades[sortedTrades.length - 1].outcome;

    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (let i = sortedTrades.length - 1; i >= 0; i--) {
        const trade = sortedTrades[i];

        // Update current streak
        if (i < sortedTrades.length - 1) {
            if (trade.outcome === currentStreakType) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Track longest streaks
        if (trade.outcome === 'win') {
            tempWinStreak++;
            tempLossStreak = 0;
            longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
        } else {
            tempLossStreak++;
            tempWinStreak = 0;
            longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
        }
    }

    return {
        currentStreak,
        currentStreakType,
        longestWinStreak,
        longestLossStreak
    };
}
