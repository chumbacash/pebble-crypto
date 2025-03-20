import { useEffect, useState, useRef } from 'react';
import { fetchIntraday } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  prevPrice?: number;
}

const POPULAR_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAUSDT', 'AVAXUSDT', 'LINKUSDT',
  'ATOMUSDT', 'NEARUSDT', 'AAVEUSDT', 'UNIUSDT', 'LTCUSDT',
  'PEPEUSDT', 'FLOKIUSDT', 'BONKUSDT', 'SHIBUSDT'
];

const UPDATE_INTERVAL = 8000; // 8 seconds for more frequent updates

// Format price based on its magnitude and symbol
function formatPrice(value: number, symbol: string): string {
  if (value === 0) return '$0.00';
  
  // List of major coins that should use fewer decimals
  const majorCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVA', 'AVAX', 'LINK', 'ATOM', 'NEAR', 'AAVE', 'UNI', 'LTC'];
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
}

// Add helper function to format the symbol name
function formatSymbol(symbol: string): string {
  // Remove the USDT suffix and keep in capitals
  return symbol.replace('USDT', '');
}

export function PriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevPricesRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    async function fetchPrices() {
      try {
        const priceData = await Promise.all(
          POPULAR_PAIRS.map(async (symbol) => {
            try {
              const data = await fetchIntraday(symbol);
              
              if (!data?.intraday_data?.length || data.intraday_data.length < 2) {
                console.warn(`Invalid data structure for ${symbol}:`, data);
                return {
                  symbol,
                  price: 0,
                  change: 0,
                };
              }

              const currentPrice = data.intraday_data[data.intraday_data.length - 1]?.close ?? 0;
              const previousPrice = data.intraday_data[data.intraday_data.length - 2]?.close ?? currentPrice;
              const change = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
              
              return {
                symbol,
                price: currentPrice,
                change,
                prevPrice: prevPricesRef.current[symbol],
              };
            } catch (error) {
              console.warn(`Error fetching data for ${symbol}:`, error);
              return {
                symbol,
                price: 0,
                change: 0,
              };
            }
          })
        );

        const validPrices = priceData.filter(price => price.price !== 0);
        if (validPrices.length > 0) {
          // Update previous prices
          validPrices.forEach(price => {
            prevPricesRef.current[price.symbol] = price.price;
          });
          setPrices(validPrices);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Create a duplicated array for continuous scrolling
  const allPrices = [...prices, ...prices];

  if (isLoading) {
    return (
      <Card className="bg-card shadow-md border-none rounded-xl w-full overflow-hidden">
        <div className="ticker-container relative w-full">
          <div className="flex gap-8 p-6">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div 
                key={index}
                className="ticker-loading flex-shrink-0 rounded-lg"
                style={{ width: '180px', height: '80px' }}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-md border-none rounded-xl w-full overflow-hidden">
      <div className="ticker-container relative w-full">
        <div className="flex gap-8 p-6 ticker-scroll">
          {allPrices.map((price, index) => (
            <div 
              key={`${price.symbol}-${index}`} 
              className="ticker-item flex-shrink-0 text-center transition-all duration-300 hover:scale-105"
              style={{
                width: '180px'
              }}
            >
              <div className="text-sm font-medium text-muted-foreground tracking-tight mb-1">
                {formatSymbol(price.symbol)}
              </div>
              <div 
                className={`text-2xl font-bold price-display mb-1 ${
                  price.prevPrice && price.price > price.prevPrice ? 'price-flash-green' :
                  price.prevPrice && price.price < price.prevPrice ? 'price-flash-red' : ''
                }`}
              >
                {formatPrice(price.price, price.symbol)}
              </div>
              <div 
                className={`text-sm flex items-center justify-center gap-1 price-display ${
                  price.change >= 0 ? 'text-green-500' : 'text-red-500'
                } transition-colors duration-300`}
              >
                {price.change >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {Math.abs(price.change).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}