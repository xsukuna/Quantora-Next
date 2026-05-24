import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  data: any[];
}

export const MainChart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const emaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
        fontSize: 10,
        fontFamily: 'Inter',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 480,
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // EMA Indicator (Fast)
    const emaSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      priceLineVisible: false,
      title: 'EMA 20',
    });

    // RSI Indicator (Lower scale)
    const rsiSeries = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 1,
      priceScaleId: 'rsi',
      title: 'RSI 14',
    });

    chart.priceScale('rsi').applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });

    candlestickSeries.setData(data);
    
    // EMA Calculation (Simple simulated version)
    const emaData = data.map(d => ({
      time: d.time,
      value: d.close - (Math.random() * 2)
    }));
    emaSeries.setData(emaData);

    const rsiData = data.map(d => ({
      time: d.time,
      value: 40 + Math.random() * 20
    }));
    rsiSeries.setData(rsiData);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    emaRef.current = emaSeries;
    rsiRef.current = rsiSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const lastData = data[data.length - 1];
      seriesRef.current.update(lastData);
      
      if (emaRef.current) {
        emaRef.current.update({ time: lastData.time, value: lastData.close - 1 });
      }
      if (rsiRef.current) {
        rsiRef.current.update({ time: lastData.time, value: 50 + (Math.random() * 10) });
      }
    }
  }, [data]);

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full min-h-[480px]" />
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur px-2 py-1 border border-white/10 rounded flex items-center gap-2">
          <span className="text-[10px] font-black text-white">NIFTY 50</span>
          <span className="text-[10px] font-mono text-emerald-400">25,124.50</span>
          <span className="text-[8px] text-emerald-400/50">+0.56%</span>
        </div>
        <div className="bg-blue-500/10 backdrop-blur px-2 py-1 border border-blue-500/20 rounded">
          <span className="text-[8px] font-bold text-blue-400 uppercase">EMA(20): 25,118.2</span>
        </div>
        <div className="bg-purple-500/10 backdrop-blur px-2 py-1 border border-purple-500/20 rounded">
          <span className="text-[8px] font-bold text-purple-400 uppercase">RSI(14): 58.4</span>
        </div>
      </div>
    </div>
  );
};
