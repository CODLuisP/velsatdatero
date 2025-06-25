import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppContextType = {
  velocidad: string | null;
  setVelocidad: (value: string | null) => void;
  modoVisualizacion: string | null;
  setModoVisualizacion: (value: string | null) => void;
};

const AppContext = createContext<AppContextType>({
  velocidad: null,
  setVelocidad: () => {},
  modoVisualizacion: null,
  setModoVisualizacion: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [velocidad, setVelocidad] = useState<string | null>(null);
  const [modoVisualizacion, setModoVisualizacion] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{ 
      velocidad, 
      setVelocidad,
      modoVisualizacion,
      setModoVisualizacion
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);