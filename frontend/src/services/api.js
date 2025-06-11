import axios from 'axios';

// Configuração do cliente axios para comunicação com o backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Cliente axios configurado com URL base e headers padrão
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funções para interagir com a API do backend

/**
 * Faz upload de um arquivo CSV para o backend
 * @param {File} file - Arquivo CSV para upload
 * @returns {Promise} - Promise com a resposta do servidor
 */
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post('/upload-csv/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Obtém informações básicas sobre os dados carregados
 * @returns {Promise} - Promise com a resposta do servidor
 */
export const getDataInfo = async () => {
  return apiClient.get('/data-info/');
};

/**
 * Gera gráficos de análise exploratória de dados (EDA)
 * @returns {Promise} - Promise com a resposta do servidor contendo os gráficos em base64
 */
export const generateEDA = async () => {
  return apiClient.get('/generate-eda/');
};

/**
 * Envia opções de pré-processamento para o backend
 * @param {Object} options - Opções de pré-processamento
 * @returns {Promise} - Promise com a resposta do servidor
 */
export const preprocessData = async (options) => {
  return apiClient.post('/preprocess/', options);
};

/**
 * Treina um modelo de machine learning e faz previsões
 * @param {Object} modelOptions - Opções do modelo (tipo, coluna alvo, features)
 * @returns {Promise} - Promise com a resposta do servidor
 */
export const trainAndPredict = async (modelOptions) => {
  return apiClient.post('/predict/', modelOptions);
};

/**
 * Obtém os resultados para download
 * @returns {Promise} - Promise com a resposta do servidor contendo o CSV
 */
export const downloadResults = async () => {
  return apiClient.get('/download-results/');
};

export default {
  uploadCSV,
  getDataInfo,
  generateEDA,
  preprocessData,
  trainAndPredict,
  downloadResults,
};
