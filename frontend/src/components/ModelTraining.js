import React, { useState } from 'react';

// Componente para treinamento de modelos de machine learning
const ModelTraining = ({ processedData, handleModelTraining, setActiveStep }) => {
  // Estados para as opções de treinamento
  const [modelType, setModelType] = useState('regression');
  const [targetColumn, setTargetColumn] = useState('');
  const [featureColumns, setFeatureColumns] = useState([]);
  
  // Verificar se há dados processados disponíveis
  if (!processedData || !processedData.columns) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado processado disponível. Por favor, pré-processe seus dados primeiro.</p>
        <button 
          onClick={() => setActiveStep(2)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voltar para Pré-processamento
        </button>
      </div>
    );
  }

  // Função para alternar a seleção de colunas para features
  const toggleFeatureSelection = (column) => {
    if (featureColumns.includes(column)) {
      setFeatureColumns(featureColumns.filter(col => col !== column));
    } else {
      setFeatureColumns([...featureColumns, column]);
    }
  };

  // Função para enviar as opções de treinamento
  const submitModelTraining = () => {
    // Validar seleções
    if (!targetColumn) {
      alert('Por favor, selecione uma coluna alvo.');
      return;
    }
    
    if (featureColumns.length === 0) {
      alert('Por favor, selecione pelo menos uma feature.');
      return;
    }
    
    if (featureColumns.includes(targetColumn)) {
      alert('A coluna alvo não pode ser usada como feature.');
      return;
    }
    
    // Enviar opções para treinamento
    const modelOptions = {
      model_type: modelType,
      target_column: targetColumn,
      feature_columns: featureColumns
    };
    
    handleModelTraining(modelOptions);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Treinamento de Modelos</h3>
        <p className="text-sm text-gray-600">
          Configure as opções abaixo para treinar um modelo de machine learning com seus dados.
        </p>
      </div>

      {/* Opções de treinamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seleção do tipo de modelo */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Tipo de Modelo</h4>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="regression">Regressão Linear</option>
            <option value="classification">Classificação (Regressão Logística)</option>
            <option value="random_forest">Random Forest Classifier</option>
          </select>
          
          <div className="mt-2 text-xs text-gray-500">
            {modelType === 'regression' && (
              <p>A regressão linear é ideal para prever valores numéricos contínuos.</p>
            )}
            {modelType === 'classification' && (
              <p>A regressão logística é adequada para classificação binária (0/1).</p>
            )}
            {modelType === 'random_forest' && (
              <p>Random Forest é um modelo robusto para classificação com alta precisão.</p>
            )}
          </div>
        </div>

        {/* Seleção da coluna alvo */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Coluna Alvo (Target)</h4>
          <select
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione a coluna alvo</option>
            {processedData.columns.map((column, index) => (
              <option key={index} value={column}>{column}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Esta é a variável que o modelo tentará prever.
          </p>
        </div>

        {/* Seleção de features */}
        <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
          <h4 className="font-medium mb-2">Selecione as Features</h4>
          <div className="max-h-48 overflow-y-auto border rounded bg-white p-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {processedData.columns.map((column, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`feature-${index}`}
                    checked={featureColumns.includes(column)}
                    onChange={() => toggleFeatureSelection(column)}
                    disabled={column === targetColumn}
                    className="mr-2"
                  />
                  <label 
                    htmlFor={`feature-${index}`} 
                    className={`text-sm ${column === targetColumn ? 'text-gray-400' : ''}`}
                  >
                    {column}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Selecione as colunas que serão usadas como features para o modelo.
          </p>
        </div>
      </div>

      {/* Informações sobre o treinamento */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Informações sobre o Treinamento:</h4>
        <ul className="list-disc pl-5 text-sm text-blue-700">
          <li>Os dados serão divididos automaticamente em conjuntos de treino (70%) e teste (30%)</li>
          <li>Métricas de avaliação serão calculadas no conjunto de teste</li>
          <li>O modelo treinado será salvo para uso futuro</li>
          <li>As previsões serão feitas para todo o conjunto de dados</li>
        </ul>
      </div>

      {/* Botões de ação */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setActiveStep(3)}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={submitModelTraining}
          disabled={!targetColumn || featureColumns.length === 0}
          className={`px-4 py-2 rounded ${
            !targetColumn || featureColumns.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } transition-colors`}
        >
          Treinar Modelo
        </button>
      </div>
    </div>
  );
};

export default ModelTraining;
