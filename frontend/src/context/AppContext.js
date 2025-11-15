import React, { createContext, useContext } from 'react';

const AppContext = createContext(null); // Ensure default value is null or an object.

const AppProvider = ({ children }) => {
  const contextValue = {
    // Add actual context values here.
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, AppContext, useAppContext };