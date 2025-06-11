import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import DataViewer from './components/DataViewer';
import Preprocessing from './components/Preprocessing';
import EDAGraphs from './components/EDAGraphs';
import ModelTraining from './components/ModelTraining';
import Results from './components/Results';
import api from './services/api';

// Configuração do axios para comunicação com o backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  // Estados para gerenciar os dados e o fluxo da aplicação
  const [activeStep, setActiveStep] = useState(0);
  const [originalData, setOriginalData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [edaGraphs, setEdaGraphs] = useState(null);
  const [modelResults, setModelResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Passos do fluxo de trabalho
  const steps = [
    { id: 0, name: 'Upload de Arquivo', component: FileUpload },
    { id: 1, name: 'Visualização de Dados', component: DataViewer },
    { id: 2, name: 'Pré-processamento', component: Preprocessing },
    { id: 3, name: 'Análise Exploratória', component: EDAGraphs },
    { id: 4, name: 'Treinamento de Modelos', component: ModelTraining },
    { id: 5, name: 'Resultados', component: Results }
  ];

  // Função para lidar com o upload de arquivo CSV
  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.uploadCSV(file);
      setOriginalData(response.data);
      setActiveStep(1); // Avançar para visualização de dados
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao fazer upload do arquivo');
      console.error('Erro no upload:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter informações de EDA
  const fetchEDAGraphs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.generateEDA();
      setEdaGraphs(response.data);
      setActiveStep(3); // Avançar para visualização de gráficos EDA
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao gerar gráficos EDA');
      console.error('Erro na geração de EDA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para pré-processar os dados
  const handlePreprocessing = async (options) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.preprocessData(options);
      setProcessedData(response.data);
      setActiveStep(2); // Manter na mesma etapa para verificar os resultados
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro no pré-processamento dos dados');
      console.error('Erro no pré-processamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para treinar modelos e fazer previsões
  const handleModelTraining = async (modelOptions) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.trainAndPredict(modelOptions);
      setModelResults(response.data);
      setActiveStep(5); // Avançar para visualização de resultados
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro no treinamento do modelo');
      console.error('Erro no treinamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para baixar os resultados
  const handleDownloadResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.downloadResults();
      
      // Criar um blob com o conteúdo CSV
      const blob = new Blob([response.data.csv_content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // Criar um link para download e clicar nele automaticamente
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'ml_data_app_results.csv';
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao baixar resultados');
      console.error('Erro no download:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Objeto com todas as funções e estados para passar para os componentes
  const appContext = {
    activeStep,
    setActiveStep,
    originalData,
    processedData,
    edaGraphs,
    modelResults,
    isLoading,
    error,
    handleFileUpload,
    fetchEDAGraphs,
    handlePreprocessing,
    handleModelTraining,
    handleDownloadResults
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col md:flex-row">
        <Sidebar steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
        <main className="flex-1 p-4">
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-center">Processando...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          {/* Renderizar o componente atual com base no passo ativo */}
          {steps.map((step) => (
            step.id === activeStep && (
              <div key={step.id} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{step.name}</h2>
                <step.component {...appContext} />
              </div>
            )
          ))}
        </main>
      </div>
    </div>
  );
}

export default App;
