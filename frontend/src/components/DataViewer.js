import React, { useState } from 'react';

// Componente para visualização dos dados carregados
const DataViewer = ({ originalData, fetchEDAGraphs, setActiveStep }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Verificar se há dados para exibir
  if (!originalData || !originalData.columns || !originalData.data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado disponível. Por favor, faça upload de um arquivo CSV primeiro.</p>
        <button 
          onClick={() => setActiveStep(0)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voltar para Upload
        </button>
      </div>
    );
  }

  // Calcular o número total de páginas
  const totalPages = Math.ceil(originalData.shape[0] / rowsPerPage);
  
  // Obter os dados para a página atual
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, originalData.shape[0]);
  
  // Função para navegar entre as páginas
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-medium">Informações do Dataset:</h3>
          <p className="text-sm text-gray-600">
            Dimensões: {originalData.shape[0]} linhas × {originalData.shape[1]} colunas
          </p>
        </div>
        
        <div className="mt-2 md:mt-0 flex space-x-2">
          <button
            onClick={fetchEDAGraphs}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Gerar Gráficos EDA
          </button>
          
          <button
            onClick={() => setActiveStep(2)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Pré-processar Dados
          </button>
        </div>
      </div>

      {/* Tabela de dados */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {originalData.columns.map((column, index) => (
                <th 
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {originalData.data.slice(0, rowsPerPage).map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {cell !== null && cell !== undefined ? String(cell) : 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {endIndex} de {originalData.shape[0]} linhas
          </span>
          <select
            className="ml-2 border rounded p-1 text-sm"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(0);
            }}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-3 py-1 rounded ${
              currentPage === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Anterior
          </button>
          
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
            {currentPage + 1} / {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`px-3 py-1 rounded ${
              currentPage >= totalPages - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;
