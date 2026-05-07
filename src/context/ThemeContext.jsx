import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('et_theme') || 'dark'
  );

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('et_theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
