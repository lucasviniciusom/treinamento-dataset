import React from 'react';

// Componente para exibição de gráficos de Análise Exploratória de Dados (EDA)
const EDAGraphs = ({ edaGraphs, setActiveStep }) => {
  // Verificar se há gráficos para exibir
  if (!edaGraphs) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum gráfico disponível. Por favor, gere os gráficos EDA primeiro.</p>
        <button 
          onClick={() => setActiveStep(1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voltar para Visualização de Dados
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Análise Exploratória de Dados</h3>
        <p className="text-sm text-gray-600">
          Visualize os gráficos gerados para entender melhor seus dados.
        </p>
      </div>

      {/* Exibição dos gráficos */}
      <div className="space-y-8">
        {/* Histogramas */}
        {edaGraphs.histograms && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-3">Distribuição das Variáveis</h4>
            <div className="flex justify-center">
              <img 
                src={`data:image/png;base64,${edaGraphs.histograms}`} 
                alt="Histogramas" 
                className="max-w-full h-auto"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Os histogramas mostram a distribuição de frequência de cada variável numérica, 
              ajudando a identificar a forma da distribuição, valores centrais e dispersão.
            </p>
          </div>
        )}

        {/* Matriz de Correlação */}
        {edaGraphs.correlation_matrix && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-3">Matriz de Correlação</h4>
            <div className="flex justify-center">
              <img 
                src={`data:image/png;base64,${edaGraphs.correlation_matrix}`} 
                alt="Matriz de Correlação" 
                className="max-w-full h-auto"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              A matriz de correlação mostra o relacionamento entre pares de variáveis. 
              Valores próximos a 1 ou -1 indicam forte correlação positiva ou negativa, 
              enquanto valores próximos a 0 indicam pouca ou nenhuma correlação.
            </p>
          </div>
        )}

        {/* Boxplots */}
        {edaGraphs.boxplots && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-3">Boxplots (Detecção de Outliers)</h4>
            <div className="flex justify-center">
              <img 
                src={`data:image/png;base64,${edaGraphs.boxplots}`} 
                alt="Boxplots" 
                className="max-w-full h-auto"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Os boxplots mostram a mediana, quartis e outliers de cada variável. 
              Pontos fora das "caixas" são potenciais outliers que podem afetar a análise.
            </p>
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          onClick={() => setActiveStep(2)}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Voltar para Pré-processamento
        </button>
        <button
          onClick={() => setActiveStep(4)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Treinar Modelos
        </button>
      </div>
    </div>
  );
};

export default EDAGraphs;
