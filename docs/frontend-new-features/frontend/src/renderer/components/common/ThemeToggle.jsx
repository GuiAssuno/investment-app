import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

/**
 * Componente de Alternância de Tema
 * Permite alternar entre tema claro e escuro
 */
const ThemeToggle = ({ showLabel = true }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center space-x-2 px-3 py-2 rounded-lg
        bg-gray-100 dark:bg-gray-700
        hover:bg-gray-200 dark:hover:bg-gray-600
        text-gray-700 dark:text-gray-200
        transition-all duration-200
        border border-gray-300 dark:border-gray-600
      "
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-yellow-500" />
          {showLabel && <span className="text-sm font-medium">Tema Claro</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-blue-600" />
          {showLabel && <span className="text-sm font-medium">Tema Escuro</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

