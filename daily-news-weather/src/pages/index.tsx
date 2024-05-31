import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/app/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Importa Font Awesome

// API keys
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

// API URLs
const NEWS_API_URL = (country: string) => `https://api.thenewsapi.com/v1/news/top?api_token=${NEWS_API_KEY}&locale=${country}&limit=3`; //por defecto solo puedo pedirle 3 noticias a la api, mi cuenta es gratuita

const WEATHER_API_URL = (city: string, country: string) => `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;
const FORECAST_API_URL = (city: string, country: string) => `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric&lang=es`;

const COUNTRY_API_URL = 'https://restcountries.com/v3.1/name/';

interface Article {
  title: string;
  image_url: string | null;
}

interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  description: string;
  icon: string;
  rain_chance: number;
  air_quality: number | null;
}

interface ForecastData {
  date: string;
  temp: number;
  description: string;
  icon: string;
}





const Home: React.FC = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [country, setCountry] = useState<string>('us');
  const [city, setCity] = useState<string>('New York');
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  const getCountryCode = async (countryName: string) => {
    try {
      const response = await axios.get(`${COUNTRY_API_URL}${countryName}`);
      const countryCode = response.data[0].cca2.toLowerCase(); // Obtiene el código del país y lo convierte a minúsculas
      return countryCode;
    } catch (error) {
      console.error('Error fetching country code:', error);
      return null;
    }
  };

  // Fetch articulos de noticias de la api
  const fetchNews = async (country: string) => {
    try {
      const response = await axios.get(NEWS_API_URL(country));
      setNews(response.data.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  // Fetch datos del clima segun ciudad y pais
  const fetchWeather = async (city: string, country: string) => {
    try {
      const response = await axios.get(WEATHER_API_URL(city, country));
      const data = response.data;

      // Fetch calidad de aire
      const airQualityResponse = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${WEATHER_API_KEY}`);
      const airQualityData = airQualityResponse.data.list[0].main.aqi;

      setWeather({
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        rain_chance: data.rain ? data.rain['1h'] : 0,
        air_quality: airQualityData
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  // Fetch pronostico del clima dias proximo
  const fetchForecast = async (city: string, country: string) => {
    try {
      const response = await axios.get(FORECAST_API_URL(city, country));
      const data = response.data.list.slice(0, 5).map((item: any) => ({
        date: item.dt_txt,
        temp: item.main.temp,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        description: item.weather[0].description,
        icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`
      }));
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  // Cambiar color de fondo basado en la temperatura
  const changeBackgroundColor = (temp: number) => {
    let className = '';
    if (temp < 0) className = 'background-white';
    else if (temp >= 0 && temp < 15) className = 'background-cool';
    else if (temp >= 15 && temp < 25) className = 'background-moderate';
    else if (temp >= 25 && temp < 36) className = 'background-warm';
    else className = 'background-hot';
    document.body.className = className;
  };

  interface ForecastData {
    date: string;
    temp: number;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
  }

  // Fetch de nuevo cada vez que se cambie la ubicacion
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchNews(country);
      await fetchWeather(city, country);
      await fetchForecast(city, country);
      setLoading(false);
    };
    fetchData();
  }, [country, city]);

  useEffect(() => {
    if (weather) {
      changeBackgroundColor(weather.temp);
    }
  }, [weather]);

  // Funcion que se asegura que si no tiene imagen la noticia se use un placeholder
  const getValidImageUrl = (url: string | null) => {
    return url ? url : 'https://via.placeholder.com/800x400?text=No+Image+Available';
  };

  // control de input para pais y ciudad
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // se maneja el dato del input al hacer click buscar, se separa segun coma
  const handleSearchClick = async () => {
    const [newCity, newCountry] = inputValue.split(',').map(s => s.trim());
    const countryCode = await getCountryCode(newCountry);
    if (countryCode) {
      setCity(newCity);
      setCountry(countryCode);
    } else {
      alert('No se pudo encontrar el código del país');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <i className="fas fa-spinner fa-spin text-4xl text-teal-500"></i>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-center text-4xl font-bold mb-8 color-teal">Clima actual en {city} </h1>
      {/* seccion de clima */}
      <div className="mb-8">
        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ingresa la ciudad y país (e.g., Munich, germany)"
            className="border text-black p-2 rounded w-full md:w-1/2"
          />
          <button
            onClick={handleSearchClick}
            className="ml-2 p-2 bg-blue-400 hover:bg-blue-600 text-white rounded"
          >
            Buscar
          </button>
        </div>

        {/* seccion de clima */}
        {weather && (
          <div className="text-center flex flex-col items-center">
            <div className="flex flex-col sm:flex-row items-center mb-4 fondo-peach rounded-xl p-4">
              <img src={weather.icon} alt={weather.description} className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40" />
              <div className="ml-4">
                <div className="text-3xl sm:text-4xl md:text-5xl">{`${weather.temp}°C`}</div>
                <div className="text-xl sm:text-2xl">{weather.description}</div>
              </div>
              <div className="ml-4 text-left">
                <div className="text-sm sm:text-lg">Sensación térmica: {weather.feels_like}°C</div>
                <div className="text-sm sm:text-lg">Temp. Máxima: {weather.temp_max}°C</div>
                <div className="text-sm sm:text-lg">Temp. Mínima: {weather.temp_min}°C</div>
              </div>
            </div>
            <div className="text-sm sm:text-lg">Humedad: {weather.humidity}%</div>
            <div className="text-sm sm:text-lg">Presión: {weather.pressure} hPa</div>
            <div className="text-sm sm:text-lg">Viento: {weather.wind_speed} m/s</div>
            <div className="text-sm sm:text-lg">Chances de lluvia: {weather.rain_chance}%</div>
            <div className="text-sm sm:text-lg">Calidad del aire: {weather.air_quality ? `Índice ${weather.air_quality}` : 'No disponible'}</div>
          </div>
        )}
      </div>

      {/* seccion de pronostico de clima */}
      <div className="mb-8">
        <h2 className="text-center text-2xl mb-4">Pronóstico del clima</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="text-center bg-teal-600 p-4 rounded-xl">
              <div>{new Date(day.date).toLocaleDateString()}</div>
              <img src={day.icon} alt={day.description} className="mx-auto" />
              <div>{`${day.temp}°C`}</div>
              <div>{`Mín: ${day.temp_min}°C - Máx: ${day.temp_max}°C`}</div>
              <div>{day.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* seccion noticias */}
      <h2 className="text-center text-2xl mb-4">Últimas noticias en {city} </h2>
      <div className="relative">
        {news.length > 0 && (
          <div>
            <img
              src={getValidImageUrl(news[selectedNewsIndex]?.image_url)}
              alt={news[selectedNewsIndex]?.title}
              className="w-full h-60 sm:h-80 md:h-96 object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center p-4 text-lg sm:text-xl">
              {news[selectedNewsIndex]?.title}
            </div>
          </div>
        )}
      </div>

      {/* navegador de noticias */}
      <div className="flex flex-row flex-wrap justify-center mt-8 space-x-2 sm:space-x-4">
        {news.map((article, index) => (
          <div
            key={index}
            onClick={() => setSelectedNewsIndex(index)}
            className={`cursor-pointer p-2 sm:p-3 ${selectedNewsIndex === index ? 'border-black' : 'border-gray-300'} bg-gray-600 hover:bg-gray-800 rounded-xl mb-4 w-24 h-24 sm:w-32 sm:h-32`}
          >
            <img
              src={getValidImageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-16 sm:h-24 object-cover"
            />
            <div className="text-center mt-1 text-xs sm:text-sm text-ellipsis overflow-hidden whitespace-nowrap">
              {article.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
