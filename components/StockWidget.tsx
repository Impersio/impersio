import React, { useEffect, useRef } from 'react';

interface StockWidgetProps {
  data: {
    symbol: string;
  };
}

export const StockWidget: React.FC<StockWidgetProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": data.symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "allow_symbol_change": true,
      "save_image": false,
      "calendar": false,
      "hide_volume": true,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(0, 0, 0, 0)" 
    });

    containerRef.current.appendChild(script);
  }, [data.symbol]);

  return (
    <div className="w-full max-w-3xl h-[450px] bg-surface border border-border rounded-2xl overflow-hidden mb-8 animate-fade-in relative z-0">
       <div className="h-full w-full" ref={containerRef} />
    </div>
  );
};