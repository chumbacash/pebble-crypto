import { useEffect, useState } from 'react';
import { fetchIntraday, fetchPrediction, fetchSymbols } from '@/lib/api';
import { IntradayData, PredictionData } from '@/types/api';
import { PriceChart } from '@/components/price-chart';
import { MarketInsights } from '@/components/market-insights';
import { SymbolSelector } from '@/components/symbol-selector';
import { PriceTicker } from '@/components/price-ticker';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins } from 'lucide-react';

function App() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [intradayData, setIntradayData] = useState<IntradayData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSymbols().then(setSymbols);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [intraday, prediction] = await Promise.all([
          fetchIntraday(selectedSymbol),
          fetchPrediction(selectedSymbol)
        ]);
        setIntradayData(intraday);
        setPredictionData(prediction);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    }

    fetchData();
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-12 lg:px-24 py-4">
        <header className="header-gradient header-glass header-shine animate-fade-in mx-auto rounded-[2rem] max-w-[98%] sm:max-w-[96%] transition-all duration-500 hover:scale-[1.005]">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2.5 sm:gap-3.5 animate-slide-up group">
                <div className="relative">
                  <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#d4c4a7] to-[#e5d5b8] opacity-75 group-hover:opacity-100 transition duration-300 blur"></div>
                  <div className="relative">
                    <Coins className="h-7 sm:h-8 w-7 sm:w-8 text-[#4a4a4a] transform transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h1 className="hidden sm:block text-2xl font-bold logo-text tracking-tight">Pebble Crypto</h1>
              </div>
              <div className="flex-1 sm:flex-none flex items-center justify-end sm:justify-start animate-slide-up pl-2 sm:pl-0" style={{ animationDelay: '0.1s' }}>
                <div className="w-[145px] sm:w-[180px] relative mr-1.5 sm:mr-0">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4c4a7] to-[#e5d5b8] rounded-2xl opacity-50 blur"></div>
                  <div className="relative">
                    <SymbolSelector
                      symbols={symbols}
                      value={selectedSymbol}
                      onValueChange={setSelectedSymbol}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="pt-32 sm:pt-32 pb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center stagger-children">
          <div className="w-full max-w-5xl mb-6 sm:mb-10">
            <PriceTicker />
          </div>
          <div className="w-full grid gap-6 sm:gap-10 grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] xl:grid-cols-[1.2fr,0.8fr] items-start">
            <div className="space-y-6 sm:space-y-8 animate-scale-in hover-lift">
              {loading ? (
                <Skeleton className="h-[400px] sm:h-[500px] w-full rounded-xl" />
              ) : (
                intradayData && <PriceChart data={intradayData} />
              )}
            </div>
            <div className="h-full animate-scale-in hover-lift" style={{ animationDelay: '0.1s' }}>
              {loading ? (
                <Skeleton className="h-[600px] sm:h-[700px] w-full rounded-xl" />
              ) : (
                predictionData && <MarketInsights data={predictionData} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App