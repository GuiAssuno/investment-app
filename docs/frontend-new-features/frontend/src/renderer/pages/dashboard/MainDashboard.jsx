import React from 'react';
import MarketTicker from '../../components/market/MarketTicker';
import NewsFeed from '../../components/news/NewsFeed';
import AnalysisPanel from '../../components/analysis/AnalysisPanel';
import StartInvestingButton from '../../components/trading/StartInvestingButton';
import ThemeToggle from '../../components/common/ThemeToggle';
import { Settings, User, Bell, Search } from 'lucide-react';

/**
 * Página Principal do Dashboard
 * Integra todos os componentes principais da aplicação
 */
const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Barra de Cotações no Topo */}
      <MarketTicker />

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Investment App B3
              </h1>
            </div>

            {/* Barra de Busca */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ativos..."
                  className="
                    w-full pl-10 pr-4 py-2 rounded-lg
                    bg-gray-100 dark:bg-gray-700
                    border border-gray-300 dark:border-gray-600
                    text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all
                  "
                />
              </div>
            </div>

            {/* Ações da Toolbar */}
            <div className="flex items-center space-x-3">
              {/* Botão Começar a Investir */}
              <StartInvestingButton />

              {/* Menu Tools com Theme Toggle */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Tools:</span>
                <ThemeToggle showLabel={false} />
              </div>

              {/* Notificações */}
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Perfil */}
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Coluna Esquerda - Conteúdo Principal */}
          <div className="col-span-8 space-y-6">
            {/* Card de Boas-Vindas */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao seu Dashboard!</h2>
              <p className="text-blue-100">
                Acompanhe seus investimentos, analise o mercado e tome decisões inteligentes.
              </p>
            </div>

            {/* Painel de Análise */}
            <div className="h-[500px]">
              <AnalysisPanel />
            </div>

            {/* Cards de Métricas Adicionais */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Disponível</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ 25.430,00</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+3.2% este mês</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Posições Abertas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">8 em lucro</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rendimento Hoje</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ 342,50</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+1.4%</p>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Feed de Notícias */}
          <div className="col-span-4">
            <div className="h-[calc(100vh-200px)] sticky top-6">
              <NewsFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;

