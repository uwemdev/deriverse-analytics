import type { LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    format?: 'currency' | 'percent' | 'number';
    trend?: 'up' | 'down' | 'neutral';
    icon?: LucideIcon;
}

export const MetricCard = ({ title, value, change, format = 'number', trend, icon: Icon }: MetricCardProps) => {
    const formattedValue = typeof value === 'number'
        ? format === 'currency'
            ? formatCurrency(value)
            : format === 'percent'
                ? formatPercent(value)
                : value.toLocaleString()
        : value;

    const trendClass = trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : '';
    const changeFormatted = change !== undefined
        ? (change >= 0 ? '+' : '') + (format === 'percent' ? formatPercent(change / 100) : formatCurrency(change))
        : null;

    return (
        <div className="card metric-card" style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s ease'
        }}>
            {/* Subtle gradient overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: trend === 'up'
                    ? 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.08), transparent 70%)'
                    : trend === 'down'
                        ? 'radial-gradient(circle at top right, rgba(239, 68, 68, 0.08), transparent 70%)'
                        : 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.06), transparent 70%)',
                pointerEvents: 'none'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header with title and icon */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div style={{
                        fontSize: 'var(--font-scale-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        {title}
                    </div>
                    {Icon && (
                        <div style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-md)',
                            background: trend === 'up'
                                ? 'rgba(34, 197, 94, 0.1)'
                                : trend === 'down'
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : 'rgba(37, 99, 235, 0.1)',
                            color: trend === 'up'
                                ? 'var(--color-profit)'
                                : trend === 'down'
                                    ? 'var(--color-loss)'
                                    : 'var(--color-primary)'
                        }}>
                            <Icon size={20} strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                {/* Value - Large and Bold */}
                <div style={{
                    fontSize: 'var(--font-scale-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)',
                    marginBottom: changeFormatted ? 'var(--space-2)' : '0',
                    lineHeight: 1.2
                }}>
                    {formattedValue}
                </div>

                {/* Change indicator */}
                {changeFormatted && (
                    <div className={trendClass} style={{
                        fontSize: 'var(--font-scale-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <span>{change !== undefined && change >= 0 ? '↑' : '↓'}</span>
                        <span>{changeFormatted}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
