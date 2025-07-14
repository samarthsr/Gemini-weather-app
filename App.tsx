import React, { useState, useCallback } from 'react';
import type { WeatherData, GroundingSource } from './types';
import { WeatherCondition } from './types';
import { getWeatherForCity } from './services/weatherService';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import SourceList from './components/SourceList';
import ContactPage from './components/ContactPage';

const App: React.FC = () => {
  const [page, setPage] = useState<'home' | 'about'>('home');
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchWeather = useCallback(async () => {
    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setSources([]);

    try {
      const result = await getWeatherForCity(city);
      if (result) {
        setWeatherData(result.weather);
        setSources(result.sources);
      } else {
         setError('Could not fetch weather data. The location might not be found or the API response was invalid.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  const getBackgroundColor = () => {
    if (page === 'about' || !weatherData) return 'from-gray-700 to-gray-900';
    switch (weatherData.icon) {
      case WeatherCondition.SUNNY:
        return 'from-blue-400 to-blue-600';
      case WeatherCondition.CLOUDY:
        return 'from-slate-500 to-slate-700';
      case WeatherCondition.RAINY:
        return 'from-blue-600 to-indigo-800';
      case WeatherCondition.SNOWY:
        return 'from-sky-300 to-gray-500';
      case WeatherCondition.THUNDERSTORM:
        return 'from-gray-800 to-black';
       case WeatherCondition.WINDY:
        return 'from-teal-400 to-cyan-600';
      default:
        return 'from-gray-700 to-gray-900';
    }
  };

  return (
    <div className={`min-h-screen w-full font-sans text-white transition-all duration-500 bg-gradient-to-br ${getBackgroundColor()}`}>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-shadow">Weather Now by Samarth</h1>
          {page === 'home' && <p className="text-lg text-gray-200 mt-2">Real-time weather powered by AI</p>}
        </header>
        
        {page === 'home' ? (
          <>
            <div className="w-full max-w-md mb-8">
              <SearchBar city={city} setCity={setCity} onSearch={handleFetchWeather} loading={loading} />
            </div>

            <div className="w-full max-w-md flex-grow flex flex-col items-center justify-center">
              {loading && <LoadingSpinner />}
              {error && !loading && <ErrorAlert message={error} />}
              {weatherData && !loading && <WeatherCard data={weatherData} />}
              {!loading && !error && !weatherData && (
                 <div className="text-center text-gray-400">
                    <p>Enter a city to get started</p>
                    <p className="text-sm mt-4">Developed by Samarth SR</p>
                 </div>
              )}
            </div>

            {sources.length > 0 && !loading && (
              <div className="w-full max-w-md mt-8">
                <SourceList sources={sources} />
              </div>
            )}
          </>
        ) : (
          <ContactPage />
        )}
        
        <footer className="py-4 mt-auto text-center text-gray-400 text-sm">
            <nav className="flex justify-center gap-6 mb-3">
                <button onClick={() => setPage('home')} className={`hover:text-white transition-colors text-base ${page === 'home' ? 'text-white font-semibold' : 'text-gray-400'}`}>Home</button>
                <button onClick={() => setPage('about')} className={`hover:text-white transition-colors text-base ${page === 'about' ? 'text-white font-semibold' : 'text-gray-400'}`}>About</button>
            </nav>
            <p>Developed by Samarth SR.</p>
            {page === 'home' && <p className="mt-1">Weather data provided by Gemini with Google Search grounding.</p>}
        </footer>
      </main>
    </div>
  );
};

export default App;