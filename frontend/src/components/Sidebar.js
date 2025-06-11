import React from 'react';

// Componente de barra lateral para navegação entre etapas
const Sidebar = ({ steps, activeStep, setActiveStep }) => {
  // Função para verificar se um passo pode ser acessado
  const canAccessStep = (stepId) => {
    // Lógica para determinar se o usuário pode acessar um passo
    // Por exemplo, não permitir pular para visualização de dados sem fazer upload
    return stepId <= activeStep + 1;
  };

  return (
    <aside className="w-full md:w-64 bg-gray-800 text-white p-4">
      <nav>
        <ul>
          {steps.map((step) => (
            <li key={step.id} className="mb-2">
              <button
                onClick={() => canAccessStep(step.id) && setActiveStep(step.id)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeStep === step.id
                    ? 'bg-blue-600 text-white'
                    : canAccessStep(step.id)
                    ? 'hover:bg-gray-700'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!canAccessStep(step.id)}
              >
                <span className="inline-block w-6 h-6 rounded-full bg-gray-600 text-center mr-2">
                  {step.id + 1}
                </span>
                {step.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
