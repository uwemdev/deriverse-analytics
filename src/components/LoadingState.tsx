export const LoadingState = () => {
    return (
        <div className="loading-container" style={{ padding: 'var(--space-6)' }}>
            {/* Header Skeleton */}
            <div className="skeleton skeleton-title" style={{ width: '300px', marginBottom: 'var(--space-6)' }}></div>

            {/* Metrics Grid Skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="skeleton skeleton-card"></div>
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="skeleton" style={{ height: '400px', marginBottom: 'var(--space-6)' }}></div>

            {/* Table Skeleton */}
            <div className="skeleton" style={{ height: '300px' }}></div>
        </div>
    );
};

export default LoadingState;
