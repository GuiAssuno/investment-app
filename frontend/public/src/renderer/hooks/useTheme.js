import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar tema (claro/escuro)
 */
const useTheme = () => {
  const [theme, setTheme] = useState(null);
  /*const [theme, setTheme] = useState(() => {
    // Verificar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });*/

  useEffect(() => {
    // 2. Mova toda a lógica que depende do 'window' ou 'localStorage' para dentro do useEffect.
    // Este código só rodará no cliente, onde esses objetos são garantidos.
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []); // O array vazio [] garante que isso rode apenas uma vez, na montagem.

  useEffect(() => {
    // Aplicar tema ao document
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salvar tema no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => {
    setTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
  };

  if (!theme) {
    return { isReady: false };
  }
  
  return {
    isReady: true,
    theme,
    //setLightTheme,
    //setDarkTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
};

export default useTheme;

