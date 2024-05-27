// pages/index.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/app/globals.css';

const API_KEY = 'UC8huf3pEYUUTVWejnTzOlJBd98BlsrxSeIhDupW';
const NEWS_API_URL = `https://api.thenewsapi.com/v1/news/top?api_token=${API_KEY}&locale=us&limit=3`;

interface Article {
  title: string;
  image_url: string | null;
}

const Home: React.FC = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(NEWS_API_URL);
        setNews(response.data.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const getValidImageUrl = (url: string | null) => {
    return url ? url : 'https://via.placeholder.com/800x400?text=No+Image+Available';
  };

  if (!news || news.length === 0) {
    return <div>Cargando noticias...</div>;
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-center text-4xl font-bold mb-8">Noticias Diarias</h1>
      <div className="relative">
        {news.length > 0 && (
          <div>
            <img
              src={getValidImageUrl(news[selectedNewsIndex]?.image_url)}
              alt={news[selectedNewsIndex]?.title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center p-4 text-xl">
              {news[selectedNewsIndex]?.title}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-8 space-x-4">
        {news.map((article, index) => (
          <div
            key={index}
            onClick={() => setSelectedNewsIndex(index)}
            className={`cursor-pointer p-3 border ${
              selectedNewsIndex === index ? 'border-black' : 'border-gray-300'
            } rounded-lg mb-4 w-1/5`}
          >
            <img
              src={getValidImageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-24 object-cover"
            />
            <div className="text-center mt-2 text-sm">
              {article.title.slice(0, 40)}
              {article.title.length > 40 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
