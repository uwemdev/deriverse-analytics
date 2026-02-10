# Analytics Calculations Documentation

This document provides detailed explanations of all metric calculations used in the Deriverse Trading Analytics Dashboard.

## Table of Contents
1. [Performance Metrics](#performance-metrics)
2. [Risk Metrics](#risk-metrics)
3. [Trade Behavior Metrics](#trade-behavior-metrics)
4. [Time-Based Metrics](#time-based-metrics)
5. [Fee Metrics](#fee-metrics)

---

## Performance Metrics

### Total PnL (Profit and Loss)
**Formula:**
```
Total PnL = Σ(Trade PnL) + Unrealized PnL
```

**Implementation:**
- Realized PnL: Sum of all closed trade profits/losses
- Unrealized PnL: Current value of open positions minus entry value
- Includes fees in net PnL calculations

**Edge Cases:**
- Empty trade list returns 0
- Handles both positive and negative values correctly

---

### ROI (Return on Investment)
**Formula:**
```
ROI = (Total PnL / Initial Capital) × 100
```

**Example:**
- Initial Capital: $10,000
- Total PnL: $2,500
- ROI = (2,500 / 10,000) × 100 = 25%

**Edge Cases:**
- Returns 0 if initial capital is 0 (prevents division by zero)

---

### Equity Curve
**Calculation:**
1. Start with initial capital
2. For each trade (chronologically):
   ```
   Equity[i] = Equity[i-1] + NetPnL[i]
   ```
3. Net PnL includes fees: `NetPnL = PnL - Fees`

**Output:** Array of `{timestamp, equity}` points for charting

---

### Drawdown
**Formula:**
```
Drawdown = ((Peak - Current) / Peak) × 100
```

**Maximum Drawdown:**
- Track running peak equity
- Calculate drawdown at each point
- Max drawdown is the largest percentage decline from peak

**Current Drawdown:**
```
Current DD = ((All-Time Peak - Current Equity) / All-Time Peak) × 100
```

**Example:**
- Peak Equity: $12,000
- Current Equity: $9,600
- Current Drawdown = ((12,000 - 9,600) / 12,000) × 100 = 20%

---

### Sharpe Ratio
**Formula:**
```
Sharpe = (Mean Return - Risk-Free Rate) / Std Dev of Returns × √252
```

**Implementation:**
1. Calculate daily returns from trades
2. Compute mean return and standard deviation
3. Annualize using √252 (trading days per year)
4. Risk-free rate default: 2% annually (0.008% daily)

**Interpretation:**
- < 1: Poor risk-adjusted returns
- 1-2: Good
- 2-3: Very good
- \> 3: Excellent

**Edge Cases:**
- Returns 0 if no trades
- Returns 0 if standard deviation is 0 (no volatility)

---

## Risk Metrics

### Risk Score (0-100)
**Composite Score from Four Factors:**

1. **Drawdown Severity (0-30 points)**
   ```
   Score = min(Max Drawdown % × 1.5, 30)
   ```

2. **Loss Streak Severity (0-25 points)**
   ```
   Score = min(Max Consecutive Losses × 5, 25)
   ```

3. **Volatility (0-25 points)**
   ```
   Score = min(Return Std Dev × 2.5, 25)
   ```

4. **Overtrading (0-20 points)**
   ```
   Score = 20 if overtrading detected, else 0
   ```

**Total Risk Score = Sum of all factors (max 100)**

**Interpretation:**
- 0-20: Low risk
- 21-40: Moderate risk
- 41-60: Elevated risk
- 61-80: High risk
- 81-100: Very high risk

---

### Overtrading Detection
**Criteria:**
```
Overtrading = (Avg Time Between Trades < 30 min) AND (Avg Trade Duration < 1 hour)
```

**Implementation:**
- Analyzes last 30 trades
- Calculates average time between trade entries
- Calculates average hold time
- Flags if both conditions meet thresholds

**Purpose:** Identifies excessive trading frequency that may indicate emotional trading or lack of strategy

---

### Performance Consistency
**Formula:**
```
Consistency = Standard Deviation of Trade Returns (%)
```

**Interpretation:**
- Lower values = more consistent returns
- Higher values = volatile, unpredictable returns

**Example:**
- Returns: [+5%, -3%, +4%, -2%, +6%]
- Mean: 2%
- Std Dev: ~3.6%
- Consistency Score: 3.6

---

## Trade Behavior Metrics

### Win Rate
**Formula:**
```
Win Rate = (Winning Trades / Total Trades) × 100
```

**Example:**
- 55 wins out of 100 trades = 55% win rate

**Edge Cases:**
- Returns 0 if no trades

---

### Profit Factor
**Formula:**
```
Profit Factor = Gross Profit / Gross Loss
```

**Calculation:**
1. Gross Profit = Sum of all winning trade PnLs
2. Gross Loss = Absolute sum of all losing trade PnLs
3. Divide gross profit by gross loss

**Interpretation:**
- < 1: Losing overall
- 1.0-1.5: Marginally profitable
- 1.5-2.0: Good
- \> 2.0: Excellent

**Edge Cases:**
- Returns Infinity if gross loss = 0 (all wins)
- Returns 0 if gross profit = 0 (all losses)

---

### Expectancy
**Formula:**
```
Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
```

**Example:**
- Win Rate: 60%
- Avg Win: $100
- Avg Loss: $80
- Expectancy = (0.6 × 100) - (0.4 × 80) = 60 - 32 = $28

**Interpretation:**
- Positive: Expected to make money per trade
- Negative: Expected to lose money per trade
- Zero: Break-even system

---

### Average Win / Average Loss
**Formula:**
```
Avg Win = Sum(Winning Trade PnLs) / Count(Wins)
Avg Loss = Sum(Losing Trade PnLs) / Count(Losses)
```

**Win/Loss Ratio:**
```
Ratio = Avg Win / Avg Loss
```

**Interpretation:**
- Ratio > 1: Wins are larger than losses on average
- Ratio < 1: Losses are larger than wins (requires higher win rate)

---

## Time-Based Metrics

### Daily Performance
**Calculation:**
1. Group trades by date (YYYY-MM-DD)
2. Sum PnL for each day
3. Create time series: `{date: PnL}`

**Use Case:** Identify best/worst trading days

---

### Session Performance
**Sessions:**
- Morning: 00:00 - 12:00
- Afternoon: 12:00 - 18:00
- Evening: 18:00 - 24:00

**Calculation:**
1. Extract hour from trade timestamp
2. Categorize into session
3. Sum PnL per session

**Use Case:** Determine optimal trading times

---

### Hour-of-Day Analysis
**Calculation:**
1. Group trades by hour (0-23)
2. Sum PnL for each hour
3. Create hourly performance map

**Use Case:** Find most profitable trading hours

---

### Trade Duration
**Metrics:**
- Average Duration: `Sum(Durations) / Count(Trades)`
- Median Duration: Middle value of sorted durations
- Shortest/Longest: Min/Max duration values

**Additional:**
- Average Win Duration vs. Average Loss Duration
- Identifies if holding winners/losers too long

---

## Fee Metrics

### Total Fees
**Formula:**
```
Total Fees = Σ(Trade Fees)
```

**Trade Fee:**
```
Fee = (Entry Fee) + (Exit Fee)
```

---

### Fee Composition
**Breakdown:**
- Maker Fees: Fees from limit orders
- Taker Fees: Fees from market orders

**Percentages:**
```
Maker % = (Maker Fees / Total Fees) × 100
Taker % = (Taker Fees / Total Fees) × 100
```

---

### Fee-to-Profit Ratio
**Formula:**
```
Fee-to-Profit = (Total Fees / Gross Profit) × 100
```

**Interpretation:**
- < 5%: Excellent
- 5-10%: Good
- 10-20%: Moderate
- \> 20%: High (eating into profits)

**Example:**
- Gross Profit: $5,000
- Total Fees: $250
- Ratio = (250 / 5,000) × 100 = 5%

---

## Symbol-Level Analysis

### Per-Symbol Metrics
For each trading symbol, calculate:
- Trade count
- Total PnL
- Average PnL per trade
- Win rate
- Total volume

**Use Case:** Identify best/worst performing symbols

---

## Position Analysis

### Long/Short Ratio
**Formula:**
```
Ratio = Long Trades / Short Trades
```

**Interpretation:**
- Ratio > 1: Prefer long positions
- Ratio < 1: Prefer short positions
- Ratio ≈ 1: Balanced

### Directional Bias
**Calculation:**
```
Long % = (Long Trades / Total Trades) × 100
```

**Tracked Over:**
- All time
- Recent month
- Recent week

**Use Case:** Detect changing directional preference

---

## Edge Cases & Defensive Programming

All calculations handle:
- ✅ Empty datasets (return 0 or empty structures)
- ✅ Division by zero (check denominators)
- ✅ Null/undefined values
- ✅ Extreme values (capping where appropriate)
- ✅ Sorting requirements (chronological order for time-series)
- ✅ Type safety (TypeScript interfaces)

---

## References

- **Sharpe Ratio**: Nobel Prize-winning risk-adjusted return metric
- **Expectancy**: Van Tharp's trading system analysis
- **Profit Factor**: Standard trading performance metric
- **Drawdown**: Maximum peak-to-trough decline

---

**Last Updated:** February 2026
