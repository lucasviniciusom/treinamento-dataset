import React from 'react';

// Componente de cabeçalho da aplicação
const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold">ML Data App</h1>
        <p className="text-sm md:text-base">Análise de dados e previsões com machine learning</p>
      </div>
    </header>
  );
};

export default Header;
