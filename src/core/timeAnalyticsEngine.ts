// Time-Based Analytics Engine
// Analyzes trading performance across different time dimensions

import type { Trade, TimeBasedPerformance } from '../models/types';

/**
 * Analyze daily performance
 */
export function analyzeDailyPerformance(trades: Trade[]): Map<string, number> {
    const dailyPnl = new Map<string, number>();

    for (const trade of trades) {
        const date = new Date(trade.timestamp).toISOString().split('T')[0];
        const existingPnl = dailyPnl.get(date) || 0;
        dailyPnl.set(date, existingPnl + trade.pnl);
    }

    return dailyPnl;
}

/**
 * Analyze performance by hour of day (0-23)
 */
export function analyzeHourlyPerformance(trades: Trade[]): Map<number, number> {
    const hourlyPnl = new Map<number, number>();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
        hourlyPnl.set(i, 0);
    }

    for (const trade of trades) {
        const hour = new Date(trade.timestamp).getHours();
        const existingPnl = hourlyPnl.get(hour) || 0;
        hourlyPnl.set(hour, existingPnl + trade.pnl);
    }

    return hourlyPnl;
}

/**
 * Analyze performance by session
 */
export function analyzeSessionPerformance(trades: Trade[]): {
    morning: number;
    afternoon: number;
    evening: number;
} {
    let morning = 0; // 00:00 - 12:00
    let afternoon = 0; // 12:00 - 18:00
    let evening = 0; // 18:00 - 24:00

    for (const trade of trades) {
        const hour = new Date(trade.timestamp).getHours();

        if (hour < 12) {
            morning += trade.pnl;
        } else if (hour < 18) {
            afternoon += trade.pnl;
        } else {
            evening += trade.pnl;
        }
    }

    return { morning, afternoon, evening };
}

/**
 * Get comprehensive time-based performance
 */
export function getTimeBasedPerformance(trades: Trade[]): TimeBasedPerformance {
    return {
        daily: analyzeDailyPerformance(trades),
        hourly: analyzeHourlyPerformance(trades),
        sessionBased: analyzeSessionPerformance(trades)
    };
}

/**
 * Calculate trade duration metrics
 */
export function calculateTradeDurationMetrics(trades: Trade[]): {
    average: number;
    median: number;
    shortest: number;
    longest: number;
    averageWinDuration: number;
    averageLossDuration: number;
} {
    if (trades.length === 0) {
        return {
            average: 0,
            median: 0,
            shortest: 0,
            longest: 0,
            averageWinDuration: 0,
            averageLossDuration: 0
        };
    }

    const durations = trades.map(t => t.duration).sort((a, b) => a - b);
    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const median = durations[Math.floor(durations.length / 2)];
    const shortest = durations[0];
    const longest = durations[durations.length - 1];

    const wins = trades.filter(t => t.outcome === 'win');
    const losses = trades.filter(t => t.outcome === 'loss');

    const averageWinDuration = wins.length > 0
        ? wins.reduce((sum, t) => sum + t.duration, 0) / wins.length
        : 0;
    const averageLossDuration = losses.length > 0
        ? losses.reduce((sum, t) => sum + t.duration, 0) / losses.length
        : 0;

    return {
        average,
        median,
        shortest,
        longest,
        averageWinDuration,
        averageLossDuration
    };
}

/**
 * Analyze performance by day of week
 */
export function analyzeByDayOfWeek(trades: Trade[]): Map<string, number> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayPnl = new Map<string, number>();

    // Initialize all days
    dayNames.forEach(day => dayPnl.set(day, 0));

    for (const trade of trades) {
        const dayIndex = new Date(trade.timestamp).getDay();
        const dayName = dayNames[dayIndex];
        const existingPnl = dayPnl.get(dayName) || 0;
        dayPnl.set(dayName, existingPnl + trade.pnl);
    }

    return dayPnl;
}

/**
 * Analyze trades per day/week/month
 */
export function analyzeTradeFrequency(trades: Trade[]): {
    tradesPerDay: number;
    tradesPerWeek: number;
    tradesPerMonth: number;
    mostActiveDay: string;
    leastActiveDay: string;
} {
    if (trades.length === 0) {
        return {
            tradesPerDay: 0,
            tradesPerWeek: 0,
            tradesPerMonth: 0,
            mostActiveDay: 'N/A',
            leastActiveDay: 'N/A'
        };
    }

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    const firstTrade = sortedTrades[0].timestamp;
    const lastTrade = sortedTrades[sortedTrades.length - 1].timestamp;
    const daysSpan = (lastTrade - firstTrade) / (1000 * 60 * 60 * 24);

    const tradesPerDay = daysSpan > 0 ? trades.length / daysSpan : trades.length;
    const tradesPerWeek = tradesPerDay * 7;
    const tradesPerMonth = tradesPerDay * 30;

    // Find most/least active day
    const dayOfWeekCounts = new Map<string, number>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayNames.forEach(day => dayOfWeekCounts.set(day, 0));

    for (const trade of trades) {
        const dayIndex = new Date(trade.timestamp).getDay();
        const dayName = dayNames[dayIndex];
        dayOfWeekCounts.set(dayName, (dayOfWeekCounts.get(dayName) || 0) + 1);
    }

    let mostActiveDay = dayNames[0];
    let leastActiveDay = dayNames[0];
    let maxCount = dayOfWeekCounts.get(dayNames[0])!;
    let minCount = dayOfWeekCounts.get(dayNames[0])!;

    for (const [day, count] of dayOfWeekCounts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            mostActiveDay = day;
        }
        if (count < minCount) {
            minCount = count;
            leastActiveDay = day;
        }
    }

    return {
        tradesPerDay,
        tradesPerWeek,
        tradesPerMonth,
        mostActiveDay,
        leastActiveDay
    };
}
