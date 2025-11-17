import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

/**
 * Componente de Feed de Notícias
 * Exibe notícias de economia, finanças e política em tempo real
 */
const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de notícias
    // TODO: Integrar com API real de notícias
    const mockNews = [
      {
        id: 1,
        title: 'Ibovespa sobe 2% com otimismo sobre reforma tributária',
        source: 'InfoMoney',
        time: '5 min atrás',
        category: 'Mercado',
        url: '#',
      },
      {
        id: 2,
        title: 'Petrobras anuncia novo dividendo extraordinário',
        source: 'Valor Econômico',
        time: '15 min atrás',
        category: 'Empresas',
        url: '#',
      },
      {
        id: 3,
        title: 'Banco Central mantém Selic em 11,75% ao ano',
        source: 'G1 Economia',
        time: '30 min atrás',
        category: 'Política Monetária',
        url: '#',
      },
      {
        id: 4,
        title: 'Dólar cai para R$ 4,95 com entrada de recursos externos',
        source: 'UOL Economia',
        time: '1h atrás',
        category: 'Câmbio',
        url: '#',
      },
      {
        id: 5,
        title: 'Vale anuncia investimento de R$ 5 bi em mineração sustentável',
        source: 'Estadão',
        time: '2h atrás',
        category: 'Sustentabilidade',
        url: '#',
      },
    ];

    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);

    // Simular atualização de notícias a cada 30 segundos
    const interval = setInterval(() => {
      // Adicionar nova notícia no topo
      const newItem = {
        id: Date.now(),
        title: 'Nova notícia: Mercado reage a dados de inflação',
        source: 'Reuters Brasil',
        time: 'Agora',
        category: 'Economia',
        url: '#',
      };
      
      setNews(prev => [newItem, ...prev].slice(0, 10)); // Manter apenas 10 notícias
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
        <div className="flex items-center mb-4">
          <Newspaper className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notícias do Mercado</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Newspaper className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notícias do Mercado</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
          Ao vivo
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {news.map((item, index) => (
          <div
            key={item.id}
            className={`
              p-3 rounded-lg border border-gray-200 dark:border-gray-700 
              hover:border-blue-500 dark:hover:border-blue-400 
              hover:shadow-md transition-all duration-200 cursor-pointer
              ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 animate-fadeIn' : 'bg-gray-50 dark:bg-gray-700/50'}
            `}
            onClick={() => window.open(item.url, '_blank')}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                {item.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {item.time}
              </span>
            </div>
            
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {item.title}
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.source}</span>
              <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NewsFeed;

