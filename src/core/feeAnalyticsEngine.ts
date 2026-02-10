// Fee Analytics Engine
// Analyzes trading fees and costs

import type { Trade, FeeBreakdown } from '../models/types';

/**
 * Calculate total fees paid
 */
export function calculateTotalFees(trades: Trade[]): number {
    return trades.reduce((sum, t) => sum + t.fees, 0);
}

/**
 * Calculate total trading volume
 */
export function calculateTotalVolume(trades: Trade[]): number {
    return trades.reduce((sum, t) => sum + t.volume, 0);
}

/**
 * Analyze fee composition (maker vs taker)
 */
export function analyzeFeeComposition(trades: Trade[]): FeeBreakdown {
    let makerFees = 0;
    let takerFees = 0;

    for (const trade of trades) {
        makerFees += trade.makerFee || 0;
        takerFees += trade.takerFee || 0;
    }

    const totalFees = makerFees + takerFees;

    return {
        totalFees,
        makerFees,
        takerFees,
        makerPercentage: totalFees > 0 ? (makerFees / totalFees) * 100 : 0,
        takerPercentage: totalFees > 0 ? (takerFees / totalFees) * 100 : 0
    };
}

/**
 * Calculate fee-to-profit ratio
 */
export function calculateFeeToProfitRatio(trades: Trade[]): number {
    const totalFees = calculateTotalFees(trades);
    const wins = trades.filter(t => t.outcome === 'win');
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);

    if (grossProfit === 0) return 0;
    return (totalFees / grossProfit) * 100;
}

/**
 * Calculate cumulative fees over time
 */
export function calculateCumulativeFees(trades: Trade[]): { timestamp: number; fees: number }[] {
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

    let cumulativeFees = 0;
    const result: { timestamp: number; fees: number }[] = [];

    for (const trade of sortedTrades) {
        cumulativeFees += trade.fees;
        result.push({
            timestamp: trade.timestamp,
            fees: cumulativeFees
        });
    }

    return result;
}

/**
 * Analyze fees by symbol
 */
export function analyzeFeesBySymbol(trades: Trade[]): Map<string, number> {
    const feesBySymbol = new Map<string, number>();

    for (const trade of trades) {
        const existingFees = feesBySymbol.get(trade.symbol) || 0;
        feesBySymbol.set(trade.symbol, existingFees + trade.fees);
    }

    return feesBySymbol;
}

/**
 * Calculate average fee per trade
 */
export function calculateAverageFeePerTrade(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    return calculateTotalFees(trades) / trades.length;
}

/**
 * Estimate fee savings with maker orders
 * Assumes maker fee is 50% lower than taker fee
 */
export function estimateFeeSavings(trades: Trade[]): {
    currentFees: number;
    potentialFeesIfAllMaker: number;
    potentialSavings: number;
    savingsPercentage: number;
} {
    const composition = analyzeFeeComposition(trades);
    const currentFees = composition.totalFees;

    // Estimate potential fees if all orders were maker
    // Assume maker fee is 50% of taker fee
    const estimatedMakerFeeRate = 0.5;
    const potentialFeesIfAllMaker = currentFees * estimatedMakerFeeRate;
    const potentialSavings = currentFees - potentialFeesIfAllMaker;
    const savingsPercentage = currentFees > 0 ? (potentialSavings / currentFees) * 100 : 0;

    return {
        currentFees,
        potentialFeesIfAllMaker,
        potentialSavings,
        savingsPercentage
    };
}
