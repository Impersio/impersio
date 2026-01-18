import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

interface WeatherWidgetProps {
    data: {
        location: string;
    }
}

interface WeatherData {
  current: {
    temp: number;
    code: number;
  };
  daily: {
    max: number[];
    min: number[];
    codes: number[];
    dates: string[];
  };
  locationName: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data: { location } }) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            setError(true);
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. Weather Data
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`
        );
        const weatherData = await weatherRes.json();

        setData({
            current: {
                temp: Math.round(weatherData.current.temperature_2m),
                code: weatherData.current.weather_code
            },
            daily: {
                max: weatherData.daily.temperature_2m_max.map((t: number) => Math.round(t)),
                min: weatherData.daily.temperature_2m_min.map((t: number) => Math.round(t)),
                codes: weatherData.daily.weather_code,
                dates: weatherData.daily.time
            },
            locationName: `${name}, ${country}`
        });

      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const getWeatherIcon = (code: number, className?: string) => {
    // WMO Code mapping
    if (code <= 1) return <Sun className={className} />;
    if (code <= 3) return <Cloud className={className} />;
    if (code <= 48) return <Wind className={className} />; // Fog
    if (code <= 67) return <CloudRain className={className} />;
    if (code <= 77) return <CloudSnow className={className} />;
    if (code <= 82) return <CloudRain className={className} />; // Showers
    if (code <= 86) return <CloudSnow className={className} />;
    if (code <= 99) return <CloudLightning className={className} />;
    return <Sun className={className} />;
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Showers";
    if (code <= 86) return "Snow Showers";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
  };

  if (loading) return (
     <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 mb-8 animate-pulse h-64"></div>
  );

  if (error || !data) return null;

  return (
    <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 mb-8 animate-fade-in select-none">
       <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-medium text-primary mb-1">{data.locationName}</h3>
            <p className="text-sm text-muted">{getWeatherLabel(data.current.code)}</p>
          </div>
          <div className="text-primary">
            {getWeatherIcon(data.current.code, "w-10 h-10 text-amber-500")}
          </div>
       </div>

       <div className="mb-8">
         <span className="text-6xl font-medium text-primary tracking-tighter">{data.current.temp}°</span>
       </div>

       <div className="grid grid-cols-4 gap-2 border-t border-border pt-4">
          {data.daily.dates.slice(1).map((date, i) => (
             <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wide">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div className="my-1 text-primary opacity-80">
                   {getWeatherIcon(data.daily.codes[i+1], "w-5 h-5")}
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-primary">{data.daily.max[i+1]}°</span>
                    <span className="text-xs text-muted">{data.daily.min[i+1]}°</span>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};