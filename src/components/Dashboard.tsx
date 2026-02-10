import React, { useState, useMemo } from 'react';
import type { Trade, Portfolio, PerformanceMetrics } from '../models';
import { DollarSign, Target, TrendingUp, Scale, BarChart3, TrendingDown, Activity, Dices, LayoutDashboard, BookOpen, LineChart, Menu, X } from 'lucide-react';
import { calculatePerformanceMetrics, calculateEquityCurve } from '../core/performanceEngine';
import { analyzeBySymbol } from '../core/tradeAnalyticsEngine';
import { getRiskMetrics } from '../core/riskEngine';
import { MetricCard } from './MetricCard';
import { EquityCurveChart } from './EquityCurveChart';
import { TradeJournal } from './TradeJournal';
import { ThemeToggle } from './ThemeToggle';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface DashboardProps {
    trades: Trade[];
    portfolio: Portfolio;
}

export const Dashboard: React.FC<DashboardProps> = ({ trades, portfolio }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'analytics'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Calculate metrics
    const metrics: PerformanceMetrics = useMemo(() => {
        return calculatePerformanceMetrics(trades, 10000);
    }, [trades]);

    const equityCurveData = useMemo(() => {
        return calculateEquityCurve(trades, 10000);
    }, [trades]);

    const symbolPerformance = useMemo(() => {
        return analyzeBySymbol(trades);
    }, [trades]);

    const riskMetrics = useMemo(() => {
        return getRiskMetrics(trades, { totalEquity: portfolio.totalEquity });
    }, [trades, metrics]);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when navigating
    const handleTabChange = (tab: 'overview' | 'journal' | 'analytics') => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="dashboard">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-overlay active" onClick={toggleMobileMenu}></div>
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} `}>
                <div className="sidebar-header">
                    <div className="sidebar-logo-container">
                        <div className="sidebar-logo-icon">D</div>
                        <div className="sidebar-logo-text">
                            <div className="sidebar-logo-title">Deriverse</div>
                            <div className="sidebar-logo-subtitle">Analytics</div>
                        </div>
                    </div>
                    {isMobileMenuOpen && (
                        <button
                            onClick={toggleMobileMenu}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '0.5rem'
                            }}
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
                <nav className="sidebar-nav">
                    <div
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => handleTabChange('overview')}
                    >
                        <LayoutDashboard size={24} strokeWidth={2.5} />
                        <span>Overview</span>
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'journal' ? 'active' : ''}`}
                        onClick={() => handleTabChange('journal')}
                    >
                        <BookOpen size={24} strokeWidth={2.5} />
                        <span>Trade Journal</span>
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => handleTabChange('analytics')}
                    >
                        <LineChart size={24} strokeWidth={2.5} />
                        <span>Advanced Analytics</span>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div className="header-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                                <Menu size={24} />
                            </button>
                            <h1 className="header-title">Trading Analytics Dashboard</h1>
                        </div>
                        <div className="header-actions">
                            <span className="text-secondary">Portfolio Value: </span>
                            <span className={portfolio.totalPnl >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 700, fontSize: 'var(--font-scale-md)' }}>
                                {formatCurrency(portfolio.totalEquity)}
                            </span>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <div className="content">
                    {activeTab === 'overview' && (
                        <>
                            {/* Key Metrics Grid */}
                            <div className="metrics-grid">
                                <MetricCard
                                    title="Total PnL"
                                    value={metrics.totalPnl}
                                    format="currency"
                                    trend={metrics.totalPnl >= 0 ? 'up' : 'down'}
                                    icon={DollarSign}
                                />
                                <MetricCard
                                    title="Win Rate"
                                    value={metrics.winRate}
                                    format="percent"
                                    trend={metrics.winRate >= 0.5 ? 'up' : 'down'}
                                    icon={Target}
                                />
                                <MetricCard
                                    title="Total Trades"
                                    value={metrics.totalTrades}
                                    trend="neutral"
                                    icon={BarChart3}
                                />
                                <MetricCard
                                    title="Profit Factor"
                                    value={metrics.profitFactor.toFixed(2)}
                                    trend={metrics.profitFactor > 1 ? 'up' : 'down'}
                                    icon={Scale}
                                />
                                <MetricCard
                                    title="ROI"
                                    value={metrics.roi}
                                    format="percent"
                                    trend={metrics.roi >= 0 ? 'up' : 'down'}
                                    icon={TrendingUp}
                                />
                                <MetricCard
                                    title="Max Drawdown"
                                    value={-metrics.maxDrawdownPercentage}
                                    format="percent"
                                    trend="down"
                                    icon={TrendingDown}
                                />
                                <MetricCard
                                    title="Sharpe Ratio"
                                    value={metrics.sharpeRatio?.toFixed(2) || 'N/A'}
                                    trend={metrics.sharpeRatio && metrics.sharpeRatio > 1 ? 'up' : 'neutral'}
                                    icon={Activity}
                                />
                                <MetricCard
                                    title="Risk Score"
                                    value={riskMetrics.riskScore.toFixed(0)}
                                    trend={riskMetrics.riskScore < 50 ? 'up' : 'down'}
                                    icon={Dices}
                                />
                            </div>

                            {/* Equity Curve */}
                            <EquityCurveChart
                                equityData={equityCurveData.equity}
                                drawdownData={equityCurveData.drawdown}
                            />

                            {/* Performance Breakdown */}
                            <div className="grid grid-2">
                                <div className="card">
                                    <h3 className="card-title">Win/Loss Analysis</h3>
                                    <div style={{ marginTop: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Winning Trades:</span>
                                            <span className="positive">{metrics.winningTrades}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Losing Trades:</span>
                                            <span className="negative">{metrics.losingTrades}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Average Win:</span>
                                            <span className="positive">{formatCurrency(metrics.averageWin)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Average Loss:</span>
                                            <span className="negative">{formatCurrency(metrics.averageLoss)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Largest Win:</span>
                                            <span className="positive">{formatCurrency(metrics.largestWin)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-secondary">Largest Loss:</span>
                                            <span className="negative">{formatCurrency(metrics.largestLoss)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Risk & Position Analysis</h3>
                                    <div style={{ marginTop: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Long Trades:</span>
                                            <span>{metrics.longTrades}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Short Trades:</span>
                                            <span>{metrics.shortTrades}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Long/Short Ratio:</span>
                                            <span>{metrics.longShortRatio.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Consecutive Losses:</span>
                                            <span className={riskMetrics.consecutiveLosses > 3 ? 'negative' : ''}>{riskMetrics.consecutiveLosses}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <span className="text-secondary">Total Fees Paid:</span>
                                            <span className="text-muted">{formatCurrency(metrics.totalFees)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-secondary">Fee-to-Profit:</span>
                                            <span className="text-muted">{formatPercent(metrics.feeToProfitRatio)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Symbol Performance */}
                            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                                <h3 className="card-title">Performance by Symbol</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Symbol</th>
                                                <th>Trades</th>
                                                <th>Win Rate</th>
                                                <th>Total PnL</th>
                                                <th>Avg PnL</th>
                                                <th>Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {symbolPerformance.map(sp => (
                                                <tr key={sp.symbol}>
                                                    <td><strong>{sp.symbol}</strong></td>
                                                    <td>{sp.trades}</td>
                                                    <td>{formatPercent(sp.winRate)}</td>
                                                    <td className={sp.totalPnl >= 0 ? 'positive' : 'negative'}>
                                                        <strong>{formatCurrency(sp.totalPnl)}</strong>
                                                    </td>
                                                    <td className={sp.averagePnl >= 0 ? 'positive' : 'negative'}>
                                                        {formatCurrency(sp.averagePnl)}
                                                    </td>
                                                    <td className="text-muted">{formatCurrency(sp.volume, 0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'journal' && (
                        <TradeJournal trades={trades} />
                    )}

                    {activeTab === 'analytics' && (
                        <div className="card">
                            <h2 className="card-title">Advanced Analytics</h2>
                            <p className="text-secondary">Additional analytics features coming soon...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
