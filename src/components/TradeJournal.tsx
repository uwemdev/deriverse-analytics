import { useState, useMemo } from 'react';
import type { Trade } from '../models';
import { formatCurrency, formatDate, formatDuration, formatPercent } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCSV';

interface TradeJournalProps {
    trades: Trade[];
}

export const TradeJournal: React.FC<TradeJournalProps> = ({ trades }) => {
    const [sortField, setSortField] = useState<keyof Trade>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filterSymbol, setFilterSymbol] = useState<string>('all');
    const [filterOutcome, setFilterOutcome] = useState<'all' | 'win' | 'loss'>('all');

    // Get unique symbols
    const symbols = useMemo(() => {
        const uniqueSymbols = Array.from(new Set(trades.map(t => t.symbol)));
        return uniqueSymbols.sort();
    }, [trades]);

    // Filter and sort trades
    const filteredTrades = useMemo(() => {
        let filtered = [...trades];

        if (filterSymbol !== 'all') {
            filtered = filtered.filter(t => t.symbol === filterSymbol);
        }

        if (filterOutcome !== 'all') {
            filtered = filtered.filter(t => t.outcome === filterOutcome);
        }

        filtered.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return 0;
        });

        return filtered;
    }, [trades, sortField, sortDirection, filterSymbol, filterOutcome]);

    const handleSort = (field: keyof Trade) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handleExportCSV = () => {
        const exportData = filteredTrades.map(trade => ({
            Date: formatDate(trade.timestamp, 'short'),
            Symbol: trade.symbol,
            Side: trade.side.toUpperCase(),
            'Entry Price': trade.entryPrice,
            'Exit Price': trade.exitPrice,
            'PnL': trade.pnl,
            'PnL %': trade.pnlPercentage,
            Duration: formatDuration(trade.duration),
            Fees: trade.fees,
            Notes: trade.notes || '',
            Tags: trade.tags?.join('; ') || ''
        }));

        const filename = `deriverse-trades-${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(exportData, filename);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Trade Journal</h2>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={filterSymbol}
                        onChange={(e) => setFilterSymbol(e.target.value)}
                    >
                        <option value="all">All Symbols</option>
                        {symbols.map(symbol => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        style={{ width: '120px' }}
                        value={filterOutcome}
                        onChange={(e) => setFilterOutcome(e.target.value as any)}
                    >
                        <option value="all">All Trades</option>
                        <option value="win">Wins Only</option>
                        <option value="loss">Losses Only</option>
                    </select>

                    <button
                        className="btn btn-primary"
                        onClick={handleExportCSV}
                        style={{ marginLeft: 'auto' }}
                    >
                        📥 Export CSV
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                                Date {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('symbol')} style={{ cursor: 'pointer' }}>
                                Symbol {sortField === 'symbol' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('side')} style={{ cursor: 'pointer' }}>
                                Side {sortField === 'side' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('entryPrice')} style={{ cursor: 'pointer' }}>
                                Entry {sortField === 'entryPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('exitPrice')} style={{ cursor: 'pointer' }}>
                                Exit {sortField === 'exitPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('pnl')} style={{ cursor: 'pointer' }}>
                                PnL {sortField === 'pnl' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('duration')} style={{ cursor: 'pointer' }}>
                                Duration {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('fees')} style={{ cursor: 'pointer' }}>
                                Fees {sortField === 'fees' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrades.map(trade => (
                            <tr key={trade.id}>
                                <td>{formatDate(trade.timestamp, 'short')}</td>
                                <td><strong>{trade.symbol}</strong></td>
                                <td>
                                    <span className={`badge ${trade.side === 'long' ? 'badge-success' : 'badge-danger'}`}>
                                        {trade.side.toUpperCase()}
                                    </span>
                                </td>
                                <td>{formatCurrency(trade.entryPrice)}</td>
                                <td>{formatCurrency(trade.exitPrice)}</td>
                                <td className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                                    <strong>{formatCurrency(trade.pnl)}</strong>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                        {formatPercent(trade.pnlPercentage)}
                                    </div>
                                </td>
                                <td>{formatDuration(trade.duration)}</td>
                                <td className="text-muted">{formatCurrency(trade.fees)}</td>
                                <td className="text-secondary" style={{ fontSize: '0.875rem', maxWidth: '150px' }}>
                                    {trade.notes || '-'}
                                    {trade.tags && (
                                        <div style={{ marginTop: 'var(--space-1)' }}>
                                            {trade.tags.map(tag => (
                                                <span key={tag} className="badge badge-neutral" style={{ marginRight: 'var(--space-1)', fontSize: '0.65rem' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Showing {filteredTrades.length} of {trades.length} trades
            </div>
        </div>
    );
};
