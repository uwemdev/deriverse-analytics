import React from 'react';
import { formatCurrency, formatPercent, getColorClass, getArrowIcon } from '../utils/formatters';

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    format?: 'currency' | 'percent' | 'number';
    icon?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    change,
    format = 'number',
    icon
}) => {
    const formattedValue = typeof value === 'number' && format === 'currency'
        ? formatCurrency(value)
        : typeof value === 'number' && format === 'percent'
            ? formatPercent(value)
            : value;

    return (
        <div className="metric-card">
            <div className="metric-label">{label}</div>
            <div className={`metric-value ${typeof value === 'number' ? getColorClass(value) : ''}`}>
                {icon && <span className="metric-icon">{icon}</span>}
                {formattedValue}
            </div>
            {change !== undefined && (
                <div className={`metric-change ${getColorClass(change)}`}>
                    {getArrowIcon(change)} {formatPercent(Math.abs(change))}
                </div>
            )}
        </div>
    );
};
