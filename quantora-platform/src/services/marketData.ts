// Quantora Real-Time Market Intelligence Service

export interface PriceData {
  time: number; // Use Unix timestamp for better compatibility
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  id: string;
  type: 'BREAKOUT' | 'REVERSAL' | 'VOLUME';
  asset: string;
  price: number;
  timestamp: Date;
  strength: number; // 0-1
}

// Simulated real-time data generator for demonstration
export const generateMockPrice = (lastPrice: number) => {
  const change = (Math.random() - 0.5) * 2;
  return Number((lastPrice + change).toFixed(2));
};

export const getInitialData = (count: number = 100): PriceData[] => {
  const data: PriceData[] = [];
  let basePrice = 25000;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * 60; // 1 minute intervals
    const open = basePrice + (Math.random() - 0.5) * 10;
    const high = open + Math.random() * 5;
    const low = open - Math.random() * 5;
    const close = (high + low) / 2;
    data.push({ time, open, high, low, close, volume: Math.random() * 1000 });
    basePrice = close;
  }
  return data;
};

// Breakout Detection Logic
export const detectBreakout = (data: PriceData[]): Signal | null => {
  if (data.length < 20) return null;
  
  const last = data[data.length - 1];
  const previous = data.slice(-21, -1);
  const resistance = Math.max(...previous.map(d => d.high));
  
  if (last.close > resistance) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'BREAKOUT',
      asset: 'NIFTY 50',
      price: last.close,
      timestamp: new Date(),
      strength: 0.85
    };
  }
  return null;
};
