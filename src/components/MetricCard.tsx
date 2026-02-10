import React from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    format?: 'currency' | 'percent' | 'number';
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
}

export const MetricCard = ({ title, value, change, format = 'number', trend, icon }: MetricCardProps) => {
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
        <div className="card metric-card glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Gradient Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: trend === 'up'
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 50%)'
                    : trend === 'down'
                        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.15), transparent 50%)'
                        : 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 50%)',
                pointerEvents: 'none',
                opacity: 0.6
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <div className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {title}
                    </div>
                    {icon && (
                        <div style={{
                            fontSize: '1.5rem',
                            opacity: 0.6,
                            transform: 'scale(1)',
                            transition: 'all 0.3s ease'
                        }}>
                            {icon}
                        </div>
                    )}
                </div>

                <div className="metric-value" style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    background: trend === 'up'
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : trend === 'down'
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : 'linear-gradient(135deg, #f8fafc, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                }}>
                    {formattedValue}
                </div>

                {changeFormatted && (
                    <div className={`text-sm ${trendClass}`} style={{
                        marginTop: 'var(--space-2)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <span>{change >= 0 ? '↑' : '↓'}</span>
                        <span>{changeFormatted}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
