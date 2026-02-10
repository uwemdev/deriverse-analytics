// Formatting Utilities
// Format numbers, currencies, dates, and other data for display

/**
 * Format number as currency
 */
export function formatCurrency(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '' : '-';
    const abs = Math.abs(value);

    if (abs >= 1_000_000) {
        return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    } else if (abs >= 1_000) {
        return `${sign}$${(abs / 1_000).toFixed(decimals)}K`;
    } else {
        return `${sign}$${abs.toFixed(decimals)}`;
    }
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format timestamp as readable date
 */
export function formatDate(timestamp: number, format: 'short' | 'long' | 'time' = 'short'): string {
    const date = new Date(timestamp);

    if (format === 'short') {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } else if (format === 'long') {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Format duration in milliseconds to readable string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format large numbers with commas
 */
export function formatNumber(value: number, decimals: number = 2): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Get color class based on value (positive/negative)
 */
export function getColorClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
}

/**
 * Get arrow icon based on value
 */
export function getArrowIcon(value: number): string {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
}

/**
 * Shorten wallet address
 */
export function shortenAddress(address: string, chars: number = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format volume with appropriate unit
 */
export function formatVolume(volume: number): string {
    if (volume >= 1_000_000_000) {
        return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    } else if (volume >= 1_000_000) {
        return `$${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
        return `$${(volume / 1_000).toFixed(2)}K`;
    } else {
        return `$${volume.toFixed(2)}`;
    }
}
