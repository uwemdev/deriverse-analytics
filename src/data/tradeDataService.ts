// Mock Data Generator
// Generates realistic trading data for demonstration purposes

import type { Trade, Position, Portfolio } from '../models/types';

const SYMBOLS = [
    'SOL/USDC',
    'BTC/USDC',
    'ETH/USDC',
    'BONK/USDC',
    'JTO/USDC',
    'PYTH/USDC',
    'JUP/USDC',
    'RAY/USDC'
];

const ORDER_TYPES: Array<'market' | 'limit' | 'stop'> = ['market', 'limit', 'stop'];

/**
 * Generate random trade data with realistic patterns
 */
export function generateMockTrades(count: number = 200): Trade[] {
    const trades: Trade[] = [];
    const now = Date.now();
    const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);

    // Win rate parameters (realistic 55% win rate)
    const baseWinRate = 0.55;

    for (let i = 0; i < count; i++) {
        // Generate timestamp (spread over last 6 months with clustering)
        const timestamp = sixMonthsAgo + Math.random() * (now - sixMonthsAgo);

        // Select random symbol (with bias towards SOL and BTC)
        const symbolWeights = [0.3, 0.25, 0.2, 0.05, 0.05, 0.05, 0.05, 0.05];
        const symbol = weightedRandomSelect(SYMBOLS, symbolWeights);

        // Random side (slight bias towards long)
        const side: 'long' | 'short' = Math.random() < 0.55 ? 'long' : 'short';

        // Generate entry and exit prices
        const basePrice = getBasePriceForSymbol(symbol);
        const entryPrice = basePrice * (0.9 + Math.random() * 0.2);

        // Determine win/loss with some volatility
        const isWin = Math.random() < (baseWinRate + (Math.random() - 0.5) * 0.2);

        // Calculate price movement
        let priceMovement: number;
        if (isWin) {
            // Wins typically 1-5% gains
            priceMovement = 0.01 + Math.random() * 0.04;
        } else {
            // Losses typically 1-3% losses (stop losses tighter)
            priceMovement = -(0.005 + Math.random() * 0.025);
        }

        const exitPrice = side === 'long'
            ? entryPrice * (1 + priceMovement)
            : entryPrice * (1 - priceMovement);

        // Generate quantity
        const quantity = Math.random() < 0.3 ? (10 + Math.random() * 90) : (100 + Math.random() * 900);

        // Calculate PnL
        const pnl = side === 'long'
            ? (exitPrice - entryPrice) * quantity
            : (entryPrice - exitPrice) * quantity;

        const pnlPercentage = side === 'long'
            ? ((exitPrice - entryPrice) / entryPrice) * 100
            : ((entryPrice - exitPrice) / entryPrice) * 100;

        // Calculate fees (0.05% taker, 0.02% maker)
        const volume = entryPrice * quantity;
        const orderType = weightedRandomSelect(ORDER_TYPES, [0.6, 0.3, 0.1]);
        const isMaker = orderType === 'limit';
        const feeRate = isMaker ? 0.0002 : 0.0005;
        const fees = volume * feeRate * 2; // Entry + exit

        const makerFee = isMaker ? fees : 0;
        const takerFee = isMaker ? 0 : fees;

        const netPnl = pnl - fees;

        // Trade duration (30 min to 72 hours, with bias towards shorter)
        const durationMs = Math.random() < 0.6
            ? (30 * 60 * 1000) + Math.random() * (4 * 60 * 60 * 1000) // 30 min - 4 hours
            : (4 * 60 * 60 * 1000) + Math.random() * (68 * 60 * 60 * 1000); // 4 - 72 hours

        const trade: Trade = {
            id: `trade_${i + 1}`,
            timestamp,
            symbol,
            side,
            entryPrice,
            exitPrice,
            quantity,
            leverage: Math.random() < 0.3 ? Math.floor(2 + Math.random() * 8) : undefined,
            pnl,
            pnlPercentage,
            fees,
            netPnl,
            orderType,
            duration: durationMs,
            outcome: pnl > 0 ? 'win' : 'loss',
            volume,
            makerFee,
            takerFee,
            notes: Math.random() < 0.15 ? generateRandomNote() : undefined,
            tags: Math.random() < 0.2 ? generateRandomTags() : undefined
        };

        trades.push(trade);
    }

    // Sort by timestamp
    return trades.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Generate mock active positions
 */
export function generateMockPositions(count: number = 3): Position[] {
    const positions: Position[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const side: 'long' | 'short' = Math.random() < 0.5 ? 'long' : 'short';

        const basePrice = getBasePriceForSymbol(symbol);
        const entryPrice = basePrice * (0.95 + Math.random() * 0.1);
        const currentPrice = basePrice;

        const quantity = 50 + Math.random() * 450;
        const leverage = Math.random() < 0.5 ? Math.floor(2 + Math.random() * 8) : undefined;

        const unrealizedPnl = side === 'long'
            ? (currentPrice - entryPrice) * quantity
            : (entryPrice - currentPrice) * quantity;

        const unrealizedPnlPercentage = side === 'long'
            ? ((currentPrice - entryPrice) / entryPrice) * 100
            : ((entryPrice - currentPrice) / entryPrice) * 100;

        const liquidationPrice = side === 'long'
            ? entryPrice * 0.8
            : entryPrice * 1.2;

        const marginUsed = (entryPrice * quantity) / (leverage || 1);

        const openTimestamp = now - (Math.random() * 24 * 60 * 60 * 1000);

        positions.push({
            id: `position_${i + 1}`,
            symbol,
            side,
            entryPrice,
            currentPrice,
            quantity,
            leverage,
            unrealizedPnl,
            unrealizedPnlPercentage,
            liquidationPrice,
            marginUsed,
            openTimestamp
        });
    }

    return positions;
}

/**
 * Generate mock portfolio state
 */
export function generateMockPortfolio(trades: Trade[], positions: Position[]): Portfolio {
    const realizedPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);
    const unrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    const totalFeesPaid = trades.reduce((sum, t) => sum + t.fees, 0);

    const initialCapital = 10000;
    const totalEquity = initialCapital + realizedPnl + unrealizedPnl;
    const cashBalance = totalEquity - positions.reduce((sum, p) => sum + (p.marginUsed || 0), 0);

    const totalPositionValue = positions.reduce(
        (sum, p) => sum + p.currentPrice * p.quantity,
        0
    );

    const marginUsed = positions.reduce((sum, p) => sum + (p.marginUsed || 0), 0);
    const availableMargin = cashBalance;

    return {
        timestamp: Date.now(),
        totalEquity,
        cashBalance,
        totalPositionValue,
        marginUsed,
        availableMargin,
        realizedPnl,
        unrealizedPnl,
        totalPnl: realizedPnl + unrealizedPnl,
        totalFeesPaid
    };
}

/**
 * Helper: Get base price for symbol
 */
function getBasePriceForSymbol(symbol: string): number {
    const prices: Record<string, number> = {
        'SOL/USDC': 140,
        'BTC/USDC': 45000,
        'ETH/USDC': 2500,
        'BONK/USDC': 0.00002,
        'JTO/USDC': 2.5,
        'PYTH/USDC': 0.45,
        'JUP/USDC': 0.85,
        'RAY/USDC': 4.2
    };
    return prices[symbol] || 100;
}

/**
 * Helper: Weighted random selection
 */
function weightedRandomSelect<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }

    return items[items.length - 1];
}

/**
 * Helper: Generate random trade note
 */
function generateRandomNote(): string {
    const notes = [
        'Strong breakout pattern',
        'Resistance level reached',
        'Support held well',
        'High volume confirmation',
        'Stopped out at planned level',
        'Took partial profits',
        'Added to position',
        'Market conditions choppy',
        'News catalyst trigger',
        'Technical setup confirmed'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Helper: Generate random tags
 */
function generateRandomTags(): string[] {
    const allTags = [
        'breakout',
        'reversal',
        'scalp',
        'swing',
        'support-bounce',
        'resistance-break',
        'news-driven',
        'technical',
        'high-volume',
        'low-volume'
    ];

    const tagCount = 1 + Math.floor(Math.random() * 3);
    const tags: string[] = [];

    for (let i = 0; i < tagCount; i++) {
        const tag = allTags[Math.floor(Math.random() * allTags.length)];
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
    }

    return tags;
}

/**
 * Generate complete mock dataset
 */
export function generateCompleteDataset(): {
    trades: Trade[];
    positions: Position[];
    portfolio: Portfolio;
} {
    const trades = generateMockTrades(250);
    const positions = generateMockPositions(3);
    const portfolio = generateMockPortfolio(trades, positions);

    return { trades, positions, portfolio };
}
