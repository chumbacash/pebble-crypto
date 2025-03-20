// API Response Types
export interface Symbol {
  symbol: string;
  interval: string;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IntradayData {
  symbol: string;
  interval: string;
  intraday_data: CandleData[];
  time_updated: string;
  intervals_elapsed: number;
  candles_returned: number;
}

export interface TradingRecommendation {
  action: string;
  entry: string;
  exit: string;
  rationale: string;
}

export interface AIInsights {
  market_summary: string;
  technical_observations: string[];
  trading_recommendations: TradingRecommendation[];
  risk_factors: string[];
}

export interface PredictionData {
  metadata: {
    interval: string;
    last_updated: string;
    data_points: number;
    data_quality: number;
    confidence_score: number;
    symbol: string;
  };
  price_analysis: {
    current: number;
    prediction: number;
    prediction_range: {
      low: number;
      high: number;
    };
    sma_20: number;
    sma_50: number;
    rsi: number;
    macd: {
      macd_line: number[];
      signal_line: number[];
      histogram: number[];
    };
    volatility: number;
    key_levels: {
      support: number;
      resistance: number;
      trend_strength: number;
    };
  };
  ai_insights: AIInsights;
}