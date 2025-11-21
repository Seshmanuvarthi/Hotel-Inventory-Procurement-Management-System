import React, { createContext, useContext } from 'react';

const AppContext = createContext(null); // Ensure default value is null or an object.

const AppProvider = ({ children }) => {
  const contextValue = {
    user: JSON.parse(localStorage.getItem('user')) || null,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, AppContext, useAuth };
