import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TimeSeriesPoint {
    timestamp: number;
    value: number;
}

interface EquityCurveChartProps {
    equityData: TimeSeriesPoint[];
    drawdownData: TimeSeriesPoint[];
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ equityData, drawdownData }) => {
    const chartData = equityData.map((point, index) => ({
        timestamp: point.timestamp,
        equity: point.value,
        drawdown: drawdownData[index]?.value || 0,
        date: formatDate(point.timestamp, 'short')
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                }}>
                    <p style={{ margin: 0, marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                        {payload[0].payload.date}
                    </p>
                    <p style={{ margin: 0, color: 'var(--color-profit)' }}>
                        Equity: {formatCurrency(payload[0].value)}
                    </p>
                    {payload[1] && (
                        <p style={{ margin: 0, color: 'var(--color-loss)' }}>
                            Drawdown: {payload[1].value.toFixed(2)}%
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Equity Curve & Drawdown</h3>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-muted)"
                            tick={{ fill: 'var(--text-secondary)' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="var(--text-muted)"
                            tick={{ fill: 'var(--text-secondary)' }}
                            tickFormatter={(value) => formatCurrency(value, 0)}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="var(--text-muted)"
                            tick={{ fill: 'var(--text-secondary)' }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="equity"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="Equity"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="drawdown"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            name="Drawdown %"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
