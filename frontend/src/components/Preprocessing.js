import React, { useState } from 'react';

// Componente para pré-processamento dos dados
const Preprocessing = ({ originalData, handlePreprocessing, processedData, setActiveStep }) => {
  // Estados para as opções de pré-processamento
  const [dropColumns, setDropColumns] = useState([]);
  const [fillNaMethod, setFillNaMethod] = useState('mean');
  const [fillNaValue, setFillNaValue] = useState(0);
  const [normalize, setNormalize] = useState(true);
  const [removeOutliers, setRemoveOutliers] = useState(false);
  const [outlierThreshold, setOutlierThreshold] = useState(1.5);

  // Verificar se há dados para processar
  if (!originalData || !originalData.columns) {
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

  // Função para alternar a seleção de colunas para remoção
  const toggleColumnSelection = (column) => {
    if (dropColumns.includes(column)) {
      setDropColumns(dropColumns.filter(col => col !== column));
    } else {
      setDropColumns([...dropColumns, column]);
    }
  };

  // Função para enviar as opções de pré-processamento
  const submitPreprocessing = () => {
    const options = {
      drop_columns: dropColumns,
      fill_na_method: fillNaMethod,
      fill_na_value: fillNaMethod === 'value' ? parseFloat(fillNaValue) : null,
      normalize: normalize,
      remove_outliers: removeOutliers,
      outlier_threshold: parseFloat(outlierThreshold)
    };
    
    handlePreprocessing(options);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Opções de Pré-processamento</h3>
        <p className="text-sm text-gray-600">
          Configure as opções abaixo para limpar e transformar seus dados.
        </p>
      </div>

      {/* Opções de pré-processamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seleção de colunas para remover */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Remover Colunas</h4>
          <div className="max-h-48 overflow-y-auto border rounded bg-white p-2">
            {originalData.columns.map((column, index) => (
              <div key={index} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`col-${index}`}
                  checked={dropColumns.includes(column)}
                  onChange={() => toggleColumnSelection(column)}
                  className="mr-2"
                />
                <label htmlFor={`col-${index}`} className="text-sm">{column}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Tratamento de valores ausentes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Tratamento de Valores Ausentes</h4>
          <select
            value={fillNaMethod}
            onChange={(e) => setFillNaMethod(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="mean">Preencher com média</option>
            <option value="median">Preencher com mediana</option>
            <option value="mode">Preencher com moda</option>
            <option value="value">Preencher com valor específico</option>
            <option value="drop">Remover linhas com valores ausentes</option>
          </select>
          
          {fillNaMethod === 'value' && (
            <input
              type="number"
              value={fillNaValue}
              onChange={(e) => setFillNaValue(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Valor para preenchimento"
            />
          )}
        </div>

        {/* Normalização */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Normalização</h4>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="normalize"
              checked={normalize}
              onChange={() => setNormalize(!normalize)}
              className="mr-2"
            />
            <label htmlFor="normalize">Normalizar dados numéricos (StandardScaler)</label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Transforma os dados para terem média 0 e desvio padrão 1
          </p>
        </div>

        {/* Remoção de outliers */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Tratamento de Outliers</h4>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="removeOutliers"
              checked={removeOutliers}
              onChange={() => setRemoveOutliers(!removeOutliers)}
              className="mr-2"
            />
            <label htmlFor="removeOutliers">Remover outliers (método IQR)</label>
          </div>
          
          {removeOutliers && (
            <div>
              <label className="block text-sm mb-1">Limiar IQR:</label>
              <input
                type="number"
                value={outlierThreshold}
                onChange={(e) => setOutlierThreshold(e.target.value)}
                min="0.5"
                max="3"
                step="0.1"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valores típicos: 1.5 (mais restritivo) a 3.0 (menos restritivo)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botões de ação */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setActiveStep(1)}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={submitPreprocessing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Aplicar Pré-processamento
        </button>
      </div>

      {/* Resultados do pré-processamento */}
      {processedData && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Resultados do Pré-processamento</h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-800 mb-2">Etapas Realizadas:</h4>
            <ul className="list-disc pl-5 text-sm text-green-700">
              {processedData.preprocessing_steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
          
          <p className="mb-2">
            <span className="font-medium">Dimensões após processamento:</span>{' '}
            {processedData.shape[0]} linhas × {processedData.shape[1]} colunas
          </p>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {processedData.columns.map((column, index) => (
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
                {processedData.data.slice(0, 5).map((row, rowIndex) => (
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
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Gerar Gráficos EDA
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Treinar Modelos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preprocessing;
