import React, { useState } from 'react';
import { TrendingUp, X, DollarSign, Target, Zap } from 'lucide-react';
import Modal from '../common/Modal';

/**
 * Componente de Botão "Começar a Investir"
 * Abre modal com opções de investimento
 */
const StartInvestingButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const investmentOptions = [
    {
      id: 'quick',
      title: 'Investimento Rápido',
      description: 'Compre ações rapidamente com preço de mercado',
      icon: Zap,
      color: 'blue',
    },
    {
      id: 'strategic',
      title: 'Investimento Estratégico',
      description: 'Configure ordens com limite de preço e stop loss',
      icon: Target,
      color: 'green',
    },
    {
      id: 'portfolio',
      title: 'Montar Carteira',
      description: 'Crie uma carteira diversificada com recomendações',
      icon: DollarSign,
      color: 'purple',
    },
  ];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    // TODO: Navegar para página de trading correspondente
    console.log('Opção selecionada:', option.id);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="
          bg-gradient-to-r from-green-500 to-green-600 
          hover:from-green-600 hover:to-green-700
          text-white font-bold px-6 py-3 rounded-lg 
          shadow-lg hover:shadow-xl 
          transform hover:scale-105 
          transition-all duration-200
          flex items-center space-x-2
          animate-pulse-slow
        "
      >
        <TrendingUp className="w-5 h-5" />
        <span>Começar a Investir</span>
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Como você quer investir?
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {investmentOptions.map((option) => {
              const Icon = option.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
              };

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    bg-gradient-to-r ${colorClasses[option.color]}
                    text-white p-6 rounded-lg 
                    shadow-md hover:shadow-xl 
                    transform hover:scale-102 
                    transition-all duration-200
                    text-left
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                      <p className="text-white/90 text-sm">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Dica:</strong> Se você é iniciante, recomendamos começar com o{' '}
              <span className="font-semibold">Investimento Rápido</span> para se familiarizar com a plataforma.
            </p>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
};

export default StartInvestingButton;

