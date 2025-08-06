import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const App = () => {
  const [currentView, setCurrentView] = useState('registo');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth`, { password });
      setIsAuthenticated(true);
      setAuthError('');
    } catch (error) {
      setAuthError('Password incorreta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">HPD</h1>
            <p className="text-gray-600">Sistema de Gestão de Lavagens</p>
          </div>
          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Introduza a password"
                required
              />
            </div>
            {authError && (
              <div className="mb-4 text-red-600 text-sm">{authError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">HPD - Gestão de Lavagens</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'registo', label: 'Registo Lavagem' },
              { key: 'agendamentos', label: 'Agendamentos' },
              { key: 'dia-atual', label: 'Dia Atual' },
              { key: 'mensal', label: 'Mensal' },
              { key: 'relatorios', label: 'Relatórios' },
              { key: 'configuracoes', label: 'Configurações' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  currentView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'registo' && <RegistoLavagem />}
        {currentView === 'agendamentos' && <Agendamentos />}
        {currentView === 'dia-atual' && <DiaAtual />}
        {currentView === 'mensal' && <Mensal />}
        {currentView === 'relatorios' && <Relatorios />}
        {currentView === 'configuracoes' && <Configuracoes />}
      </main>
    </div>
  );
};

// Registo Lavagem Component
const RegistoLavagem = () => {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo_veiculo: '',
    area_negocio: '',
    lavador: '',
    tipo_lavagem: '',
    empresa_tipo: 'interna',
    empresa_nome: '',
    matricula_trator: '',
    matricula_reboque: '',
    valor: '',
    observacoes: ''
  });
  
  const [customWashers, setCustomWashers] = useState([]);
  const [externalCompanies, setExternalCompanies] = useState([]);
  const [showNewWasher, setShowNewWasher] = useState(false);
  const [newWasherName, setNewWasherName] = useState('');
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const defaultWashers = [
    'Anfílófio Sousa',
    'Bruno Lourenço', 
    'José Osmar',
    'Paulo Santos',
    'Emerson Antonio'
  ];

  const tiposVeiculo = [
    'Cisterna',
    'Frigorífico',
    'Lona',
    'Rígido',
    'Trator',
    'Reboque',
    'Viatura Ligeira'
  ];

  const areasNegocio = [
    'Alimentar',
    'Energia',
    'Distribuição',
    'E-Commerce'
  ];

  const tiposLavagem = [
    'Interior Cisterna + Conjunto',
    'Exterior Conjunto',
    'Rolos',
    'Outros'
  ];

  const empresasInternas = ['TPD', 'Hurtrans'];

  useEffect(() => {
    fetchCustomWashers();
    fetchExternalCompanies();
  }, []);

  const fetchCustomWashers = async () => {
    try {
      const response = await axios.get(`${API}/lavadores`);
      setCustomWashers(response.data);
    } catch (error) {
      console.error('Erro ao buscar lavadores:', error);
    }
  };

  const fetchExternalCompanies = async () => {
    try {
      const response = await axios.get(`${API}/empresas-externas`);
      setExternalCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNewWasher = async () => {
    if (!newWasherName.trim()) return;
    
    try {
      await axios.post(`${API}/lavadores`, { nome: newWasherName });
      setNewWasherName('');
      setShowNewWasher(false);
      fetchCustomWashers();
    } catch (error) {
      alert('Erro ao adicionar lavador: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const addNewCompany = async () => {
    if (!newCompanyName.trim()) return;
    
    try {
      await axios.post(`${API}/empresas-externas`, { nome: newCompanyName });
      setNewCompanyName('');
      setShowNewCompany(false);
      fetchExternalCompanies();
    } catch (error) {
      alert('Erro ao adicionar empresa: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        valor: parseFloat(formData.valor)
      };
      
      await axios.post(`${API}/lavagens`, submitData);
      
      setSuccessMessage('Lavagem registada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setFormData({
        data: new Date().toISOString().split('T')[0],
        tipo_veiculo: '',
        area_negocio: '',
        lavador: '',
        tipo_lavagem: '',
        empresa_tipo: 'interna',
        empresa_nome: '',
        matricula_trator: '',
        matricula_reboque: '',
        valor: '',
        observacoes: ''
      });
      
    } catch (error) {
      alert('Erro ao registar lavagem: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const allWashers = [...defaultWashers, ...customWashers.map(w => w.nome)];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Registo de Lavagem</h2>
        
        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Tipo de Veículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Veículo
              </label>
              <select
                name="tipo_veiculo"
                value={formData.tipo_veiculo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {tiposVeiculo.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Área de Negócio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área de Negócio
              </label>
              <select
                name="area_negocio"
                value={formData.area_negocio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {areasNegocio.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Lavadores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lavador
              </label>
              <div className="flex gap-2">
                <select
                  name="lavador"
                  value={formData.lavador}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {allWashers.map(lavador => (
                    <option key={lavador} value={lavador}>{lavador}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewWasher(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  +
                </button>
              </div>
              
              {showNewWasher && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newWasherName}
                    onChange={(e) => setNewWasherName(e.target.value)}
                    placeholder="Nome do lavador"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={addNewWasher}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                  >
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewWasher(false)}
                    className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Tipo de Lavagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lavagem
              </label>
              <select
                name="tipo_lavagem"
                value={formData.tipo_lavagem}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {tiposLavagem.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <div className="space-y-2">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="empresa_tipo"
                      value="interna"
                      checked={formData.empresa_tipo === 'interna'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Interna
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="empresa_tipo"
                      value="externa"
                      checked={formData.empresa_tipo === 'externa'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Externa
                  </label>
                </div>
                
                {formData.empresa_tipo === 'interna' ? (
                  <select
                    name="empresa_nome"
                    value={formData.empresa_nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    {empresasInternas.map(empresa => (
                      <option key={empresa} value={empresa}>{empresa}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <select
                      name="empresa_nome"
                      value={formData.empresa_nome}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione empresa externa...</option>
                      {externalCompanies.map(empresa => (
                        <option key={empresa.id} value={empresa.nome}>{empresa.nome}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCompany(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      +
                    </button>
                  </div>
                )}
                
                {showNewCompany && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="Nome da empresa"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={addNewCompany}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCompany(false)}
                      className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Matrícula Trator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matrícula Trator
              </label>
              <input
                type="text"
                name="matricula_trator"
                value={formData.matricula_trator}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Ex: 00-AA-00"
              />
            </div>

            {/* Matrícula Reboque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matrícula Reboque
              </label>
              <input
                type="text"
                name="matricula_reboque"
                value={formData.matricula_reboque}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Ex: 00-AA-00"
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (€)
              </label>
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 font-semibold text-lg"
            >
              Registar Lavagem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Placeholder components for other views
const Agendamentos = () => (
  <div className="bg-white rounded-lg shadow-md p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Agendamentos</h2>
    <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
  </div>
);

const DiaAtual = () => (
  <div className="bg-white rounded-lg shadow-md p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Lavagens do Dia Atual</h2>
    <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
  </div>
);

const Mensal = () => (
  <div className="bg-white rounded-lg shadow-md p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Relatório Mensal</h2>
    <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
  </div>
);

const Relatorios = () => (
  <div className="bg-white rounded-lg shadow-md p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Relatórios</h2>
    <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
  </div>
);

const Configuracoes = () => (
  <div className="bg-white rounded-lg shadow-md p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
    <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
  </div>
);

export default App;