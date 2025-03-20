import { Card } from '@/components/ui/card';
import { IntradayData } from '@/types/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface PriceChartProps {
  data: IntradayData;
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = data.intraday_data.map((candle) => ({
    time: format(new Date(candle.timestamp), 'HH:mm'),
    price: candle.close,
    volume: candle.volume,
  }));

  return (
    <Card className="p-6 bg-card shadow-md border-none rounded-xl">
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5D5B8" 
              opacity={0.3} 
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              stroke="#4a4a4a" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E5D5B8', strokeWidth: 1 }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#4a4a4a" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E5D5B8', strokeWidth: 1 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5D5B8',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              labelStyle={{ color: '#4a4a4a' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#C8B39C"
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: '#C8B39C',
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}