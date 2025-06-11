import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Componente para upload de arquivos CSV
const FileUpload = ({ handleFileUpload, isLoading }) => {
  // Usando o hook useDropzone para gerenciar o upload de arquivos
  const onDrop = useCallback((acceptedFiles) => {
    // Verificar se há arquivos e se são do tipo CSV
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleFileUpload(file);
      } else {
        alert('Por favor, faça upload apenas de arquivos CSV.');
      }
    }
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        
        {isDragActive ? (
          <p className="text-blue-500 font-medium">Solte o arquivo aqui...</p>
        ) : (
          <div>
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Arraste e solte um arquivo CSV aqui, ou clique para selecionar
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Apenas arquivos CSV são aceitos
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium">Instruções:</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Faça upload de um arquivo CSV contendo seus dados</li>
          <li>O arquivo deve ter cabeçalhos de coluna na primeira linha</li>
          <li>Recomendado: dados numéricos para melhor análise e modelagem</li>
          <li>Tamanho máximo do arquivo: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
