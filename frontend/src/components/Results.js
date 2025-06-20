import React from 'react';

const Results = ({ modelResults, handleDownloadResults, setActiveStep }) => {
  if (!modelResults) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum resultado disponível. Por favor, treine um modelo primeiro.</p>
        <button 
          onClick={() => setActiveStep(4)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voltar para Treinamento de Modelos
        </button>
      </div>
    );
  }

  const { metrics = {}, model_info = {} } = modelResults;
  const modelType = model_info.type;

  const formatNumber = (num) => typeof num === 'number' ? num.toFixed(4) : num;

  // Garantir nomes consistentes
  const mse = metrics.mse ?? metrics.average_mse;
  const rmse = metrics.rmse ?? metrics.average_rmse;
  const mae = metrics.mae ?? metrics.average_mae;
  const r2 = metrics.r2 ?? metrics.average_r2;

  return (
    <div>
      {/* Título */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Resultados do Modelo</h3>
        <p className="text-sm text-gray-600">Veja os resultados do treinamento e as métricas de desempenho do modelo.</p>
      </div>

      {/* Informações do Modelo */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-lg font-medium mb-3">Informações do Modelo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Tipo de Modelo:</span> {modelType === 'regression' ? 'Regressão Linear' : modelType === 'classification' ? 'Regressão Logística' : 'Random Forest Classifier'}</p>
            <p><span className="font-medium">Coluna Alvo:</span> {model_info.target}</p>
            <p><span className="font-medium">Features Utilizadas:</span> {model_info.features?.join(', ')}</p>
          </div>
          <div>
            {modelType === 'regression' && model_info.intercept !== undefined && (
              <p><span className="font-medium">Intercepto:</span> {formatNumber(model_info.intercept)}</p>
            )}
            {modelType !== 'regression' && model_info.classes && (
              <p><span className="font-medium">Classes:</span> {model_info.classes.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-lg font-medium mb-3">Métricas de Desempenho</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modelType === 'regression' && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">MSE</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(mse)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">RMSE</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(rmse)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">MAE</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(mae)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">R²</p>
                <p className="text-xl font-bold text-green-700">{formatNumber(r2)}</p>
              </div>
            </>
          )}
          {(modelType === 'classification' || modelType === 'random_forest') && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Acurácia</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(metrics.accuracy)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Precisão</p>
                <p className="text-xl font-bold text-green-700">{formatNumber(metrics.precision)}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Recall</p>
                <p className="text-xl font-bold text-yellow-700">{formatNumber(metrics.recall)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">F1-Score</p>
                <p className="text-xl font-bold text-purple-700">{formatNumber(metrics.f1)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Importância das features */}
      {modelType === 'random_forest' && model_info.feature_importance && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h4 className="text-lg font-medium mb-3">Importância das Features</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Importância</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Visualização</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(model_info.feature_importance)
                .sort((a, b) => b[1] - a[1])
                .map(([feature, importance], index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm">{feature}</td>
                    <td className="px-6 py-4 text-sm">{formatNumber(importance)}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${importance * 100}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botões */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setActiveStep(4)}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        >
          Voltar para Treinamento
        </button>
        <button
          onClick={handleDownloadResults}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Baixar Resultados
        </button>
      </div>
    </div>
  );
};

export default Results;
