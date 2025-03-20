import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PredictionData } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface MarketInsightsProps {
  data: PredictionData;
}

function formatValue(value: number, symbol: string = '', isPercentage = false): string {
  if (value === 0) return isPercentage ? '0.00%' : '$0.00';
  
  if (!isPercentage) {
    // List of major coins that should use fewer decimals
    const majorCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'MATIC', 'AVAX', 'LINK', 'ATOM', 'NEAR', 'AAVE', 'UNI', 'LTC'];
    const isMajorCoin = majorCoins.some(coin => symbol.includes(coin));
    
    // Handle scientific notation for small cap coins
    if (!isMajorCoin && value.toString().includes('e')) {
      const [mantissa, exponent] = value.toString().split('e');
      const exp = parseInt(exponent);
      
      if (exp < 0) {
        const absExp = Math.abs(exp);
        const [whole, decimal = ''] = mantissa.split('.');
        const number = (whole + decimal).replace(/^-/, '');
        const result = '0.' + '0'.repeat(absExp - 1) + number;
        return '$' + (value < 0 ? '-' : '') + result;
      }
    }

    // Format based on coin type and value
    if (isMajorCoin) {
      if (value >= 1000) {
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (value >= 1) {
        return `$${value.toFixed(2)}`;
      } else {
        return `$${value.toFixed(3)}`;
      }
    } else {
      // For small cap coins, show full precision
      const exactValue = value.toString();
      if (!exactValue.includes('.')) {
        return '$' + exactValue + '.00000000';
      }
      return '$' + exactValue;
    }
  } else {
    // For percentages, show 2 decimal places
    return `${value.toFixed(2)}%`;
  }
}

export function MarketInsights({ data }: MarketInsightsProps) {
  if (!data || !data.price_analysis || !data.ai_insights) {
    return (
      <Card className="bg-card shadow-md border-none rounded-xl h-full">
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const { price_analysis, ai_insights } = data;
  const isPredictionHigher = price_analysis.prediction > price_analysis.current;

  return (
    <Card className="bg-card shadow-md border-none rounded-xl h-full">
      <CardHeader>
        <CardTitle className="tracking-tight">Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground tracking-tight">Current Price</p>
              <p className="text-2xl font-bold price-display">
                {formatValue(price_analysis.current, data.metadata.symbol)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground tracking-tight">Prediction</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold price-display">
                  {formatValue(price_analysis.prediction, data.metadata.symbol)}
                </p>
                <Badge variant={isPredictionHigher ? "default" : "destructive"} className={isPredictionHigher ? "bg-primary" : ""}>
                  {isPredictionHigher ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Technical Indicators</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">RSI</div>
                  <div className="text-xl font-semibold">{formatValue(price_analysis.rsi, data.metadata.symbol, true)}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Volatility</div>
                  <div className="text-xl font-semibold">{formatValue(price_analysis.volatility * 100, data.metadata.symbol, true)}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Support</div>
                  <div className="text-xl font-semibold price-display">${formatValue(price_analysis.key_levels.support, data.metadata.symbol)}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Resistance</div>
                  <div className="text-xl font-semibold price-display">${formatValue(price_analysis.key_levels.resistance, data.metadata.symbol)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">AI Summary</h2>
              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  {ai_insights.market_summary}
                </p>
                <div className="mt-4 space-y-2">
                  {ai_insights.technical_observations?.map((observation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span>•</span>
                      <span>{observation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Trading Recommendations</h2>
              <div className="space-y-4">
                {ai_insights.trading_recommendations?.map((rec, index) => (
                  <div key={index} className="bg-secondary/50 rounded-xl p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{rec.action}</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Entry: {rec.entry}</p>
                        <p>Exit: {rec.exit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Risk Factors</h2>
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="space-y-2">
                  {ai_insights.risk_factors.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span>•</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}