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
    lavadores: [], // Changed to array
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

  // Handle multiple washers selection
  const handleWasherChange = (washerName, isChecked) => {
    setFormData(prev => ({
      ...prev,
      lavadores: isChecked 
        ? [...prev.lavadores, washerName]
        : prev.lavadores.filter(w => w !== washerName)
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
    
    // Validate at least one washer is selected
    if (formData.lavadores.length === 0) {
      alert('Por favor selecione pelo menos um lavador');
      return;
    }
    
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
        lavadores: [],
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
          </div>

          {/* Lavadores - Multiple Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Lavadores (Selecione um ou mais)
              </label>
              <button
                type="button"
                onClick={() => setShowNewWasher(true)}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                + Adicionar Lavador
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
              {allWashers.map(lavador => (
                <label key={lavador} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.lavadores.includes(lavador)}
                    onChange={(e) => handleWasherChange(lavador, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{lavador}</span>
                </label>
              ))}
            </div>
            
            {formData.lavadores.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Selecionados:</strong> {formData.lavadores.join(', ')}
                </p>
              </div>
            )}
            
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empresa */}
            <div className="md:col-span-2">
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

// Agendamentos Component 
const Agendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [lavagens, setLavagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLavagens();
  }, []);

  const fetchLavagens = async () => {
    try {
      const response = await axios.get(`${API}/lavagens`);
      setLavagens(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar lavagens:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-32">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Todas as Lavagens Registadas</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Total: {lavagens.length}
        </span>
      </div>
      
      {lavagens.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Nenhuma lavagem registada ainda.</p>
      ) : (
        <div className="table-container overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Data</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Veículo</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Área Negócio</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Lavadores</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Lavagem</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Empresa</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Matrícula</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lavagens.map((lavagem) => (
                <tr key={lavagem.id} className="table-row hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">
                    {new Date(lavagem.data).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">{lavagem.tipo_veiculo}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">{lavagem.area_negocio}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">
                    <span className="inline-flex flex-wrap gap-1">
                      {Array.isArray(lavagem.lavadores) 
                        ? lavagem.lavadores.map((lavador, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {lavador}
                            </span>
                          ))
                        : <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {lavagem.lavadores}
                          </span>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">{lavagem.tipo_lavagem}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">
                    <span className={`px-2 py-1 rounded text-xs ${
                      lavagem.empresa_tipo === 'interna' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lavagem.empresa_nome}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 border-b">
                    <div>
                      {lavagem.matricula_trator && <div>T: {lavagem.matricula_trator}</div>}
                      {lavagem.matricula_reboque && <div>R: {lavagem.matricula_reboque}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                    €{lavagem.valor.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Total de Lavagens:</strong> {lavagens.length}
              </div>
              <div>
                <strong>Valor Total:</strong> €{lavagens.reduce((sum, l) => sum + l.valor, 0).toFixed(2)}
              </div>
              <div>
                <strong>Valor Médio:</strong> €{lavagens.length > 0 ? (lavagens.reduce((sum, l) => sum + l.valor, 0) / lavagens.length).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dia Atual Component
const DiaAtual = () => {
  const [todayWashes, setTodayWashes] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const [washesResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/lavagens/today`),
        axios.get(`${API}/lavagens/stats/today`)
      ]);
      setTodayWashes(washesResponse.data);
      setTodayStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados de hoje:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-32">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Lavagens de Hoje - {new Date().toLocaleDateString('pt-PT')}
        </h2>
        
        {todayStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Lavagens</h3>
              <p className="text-2xl font-bold text-blue-600">{todayStats.total_lavagens}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Valor Total</h3>
              <p className="text-2xl font-bold text-green-600">€{todayStats.total_valor.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800">Valor Médio</h3>
              <p className="text-2xl font-bold text-yellow-600">
                €{todayStats.total_lavagens > 0 ? (todayStats.total_valor / todayStats.total_lavagens).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Lavadores Ativos</h3>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(todayStats.por_lavador).length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Detalhes das Lavagens</h3>
        
        {todayWashes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhuma lavagem registada hoje.</p>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Hora</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Veículo</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Lavadores</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Lavagem</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Empresa</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Observações</th>
                </tr>
              </thead>
              <tbody>
                {todayWashes.map((wash) => (
                  <tr key={wash.id} className="table-row hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      {new Date(wash.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{wash.tipo_veiculo}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      <span className="inline-flex flex-wrap gap-1">
                        {Array.isArray(wash.lavadores) 
                          ? wash.lavadores.map((lavador, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {lavador}
                              </span>
                            ))
                          : <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {wash.lavadores}
                            </span>
                        }
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{wash.tipo_lavagem}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${
                        wash.empresa_tipo === 'interna' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wash.empresa_nome}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                      €{wash.valor.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      {wash.observacoes && (
                        <span className="text-xs text-gray-600 italic">
                          {wash.observacoes.length > 30 ? wash.observacoes.substring(0, 30) + '...' : wash.observacoes}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Copy Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Para copiar para Excel:</strong> Selecione a tabela acima e copie (Ctrl+C), depois cole no Excel (Ctrl+V).
        </p>
      </div>
    </div>
  );
};

// Mensal Component
const Mensal = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthWashes, setMonthWashes] = useState([]);
  const [monthStats, setMonthStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthData();
  }, [currentDate]);

  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const [washesResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/lavagens/month/${year}/${month}`),
        axios.get(`${API}/lavagens/stats/month/${year}/${month}`)
      ]);
      
      setMonthWashes(washesResponse.data);
      setMonthStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error);
      setLoading(false);
    }
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-32">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const monthName = currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Month Navigation and Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Mês Anterior
          </button>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            Relatório de {monthName}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Próximo Mês →
          </button>
        </div>
        
        {monthStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Lavagens</h3>
              <p className="text-2xl font-bold text-blue-600">{monthStats.total_lavagens}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Valor Total</h3>
              <p className="text-2xl font-bold text-green-600">€{monthStats.total_valor.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800">Valor Médio</h3>
              <p className="text-2xl font-bold text-yellow-600">
                €{monthStats.total_lavagens > 0 ? (monthStats.total_valor / monthStats.total_lavagens).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Dias com Lavagens</h3>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(monthWashes.map(w => w.data)).size}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Breakdown */}
      {monthStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Por Tipo de Veículo</h3>
            <div className="space-y-2">
              {Object.entries(monthStats.por_tipo_veiculo).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between">
                  <span className="text-gray-700">{tipo}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Por Lavador</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(monthStats.por_lavador).map(([lavador, count]) => (
                <div key={lavador} className="flex justify-between">
                  <span className="text-gray-700">{lavador}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Todas as Lavagens do Mês</h3>
        
        {monthWashes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhuma lavagem registada neste mês.</p>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Data</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Veículo</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Lavadores</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Empresa</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Valor</th>
                </tr>
              </thead>
              <tbody>
                {monthWashes.map((wash) => (
                  <tr key={wash.id} className="table-row hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      {new Date(wash.data).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{wash.tipo_veiculo}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      <span className="inline-flex flex-wrap gap-1">
                        {Array.isArray(wash.lavadores) 
                          ? wash.lavadores.map((lavador, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {lavador}
                              </span>
                            ))
                          : <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {wash.lavadores}
                            </span>
                        }
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${
                        wash.empresa_tipo === 'interna' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wash.empresa_nome}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                      €{wash.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Copy Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Para copiar para Excel:</strong> Selecione qualquer tabela acima e copie (Ctrl+C), depois cole no Excel (Ctrl+V).
        </p>
      </div>
    </div>
  );
};

// Relatórios Component
const Relatorios = () => {
  const [allStats, setAllStats] = useState(null);
  const [allWashes, setAllWashes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsResponse, washesResponse] = await Promise.all([
        axios.get(`${API}/lavagens/stats`),
        axios.get(`${API}/lavagens`)
      ]);
      
      setAllStats(statsResponse.data);
      setAllWashes(washesResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-32">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios Gerais - Todos os Dados</h2>
        
        {allStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total de Lavagens</h3>
              <p className="text-3xl font-bold text-blue-600">{allStats.total_lavagens}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Valor Total</h3>
              <p className="text-3xl font-bold text-green-600">€{allStats.total_valor.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800">Valor Médio</h3>
              <p className="text-3xl font-bold text-yellow-600">
                €{allStats.total_lavagens > 0 ? (allStats.total_valor / allStats.total_lavagens).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Período</h3>
              <p className="text-lg font-bold text-purple-600">
                {allWashes.length > 0 ? (
                  <>
                    <div className="text-sm">{new Date(Math.min(...allWashes.map(w => new Date(w.data)))).toLocaleDateString('pt-PT')}</div>
                    <div className="text-xs">até</div>
                    <div className="text-sm">{new Date(Math.max(...allWashes.map(w => new Date(w.data)))).toLocaleDateString('pt-PT')}</div>
                  </>
                ) : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Statistics */}
      {allStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Vehicle Types */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Por Tipo de Veículo</h3>
            <div className="space-y-2">
              {Object.entries(allStats.por_tipo_veiculo)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{tipo}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-200 rounded-full h-2 flex-1 min-w-[40px]">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${(count / Math.max(...Object.values(allStats.por_tipo_veiculo))) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-medium text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Areas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Por Área de Negócio</h3>
            <div className="space-y-2">
              {Object.entries(allStats.por_area_negocio)
                .sort((a, b) => b[1] - a[1])
                .map(([area, count]) => (
                <div key={area} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{area}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-200 rounded-full h-2 flex-1 min-w-[40px]">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{width: `${(count / Math.max(...Object.values(allStats.por_area_negocio))) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-medium text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wash Types */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Por Tipo de Lavagem</h3>
            <div className="space-y-2">
              {Object.entries(allStats.por_tipo_lavagem)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{tipo}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-200 rounded-full h-2 flex-1 min-w-[40px]">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{width: `${(count / Math.max(...Object.values(allStats.por_tipo_lavagem))) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-medium text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Washers Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Desempenho por Lavador</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(allStats.por_lavador)
                .sort((a, b) => b[1] - a[1])
                .map(([lavador, count]) => (
                <div key={lavador} className="flex justify-between items-center">
                  <span className="text-gray-700 text-xs">{lavador}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-200 rounded-full h-2 flex-1 min-w-[30px]">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{width: `${(count / Math.max(...Object.values(allStats.por_lavador))) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-medium text-xs w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Washes Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo das Últimas 10 Lavagens</h3>
        
        {allWashes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhuma lavagem registada ainda.</p>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Data</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Veículo</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Lavadores</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Empresa</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Valor</th>
                </tr>
              </thead>
              <tbody>
                {allWashes.slice(0, 10).map((wash) => (
                  <tr key={wash.id} className="table-row hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      {new Date(wash.data).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{wash.tipo_veiculo}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      <span className="inline-flex flex-wrap gap-1">
                        {Array.isArray(wash.lavadores) 
                          ? wash.lavadores.map((lavador, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {lavador}
                              </span>
                            ))
                          : <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {wash.lavadores}
                            </span>
                        }
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${
                        wash.empresa_tipo === 'interna' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wash.empresa_nome}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                      €{wash.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Copy Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Instruções:</strong> Todas as tabelas podem ser copiadas para Excel. Os gráficos visuais mostram a distribuição dos dados de forma clara para análise.
        </p>
      </div>
    </div>
  );
};

// Configurações Component
const Configuracoes = () => {
  const [lavagens, setLavagens] = useState([]);
  const [customWashers, setCustomWashers] = useState([]);
  const [externalCompanies, setExternalCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [lavagemResponse, washersResponse, companiesResponse] = await Promise.all([
        axios.get(`${API}/lavagens`),
        axios.get(`${API}/lavadores`),
        axios.get(`${API}/empresas-externas`)
      ]);
      
      setLavagens(lavagemResponse.data);
      setCustomWashers(washersResponse.data);
      setExternalCompanies(companiesResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  const deleteLavagem = async (washId) => {
    try {
      await axios.delete(`${API}/lavagens/${washId}`);
      setLavagens(lavagens.filter(l => l.id !== washId));
      setShowDeleteConfirm(null);
      alert('Lavagem eliminada com sucesso!');
    } catch (error) {
      alert('Erro ao eliminar lavagem: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const deleteWasher = async (washerId) => {
    try {
      await axios.delete(`${API}/lavadores/${washerId}`);
      setCustomWashers(customWashers.filter(w => w.id !== washerId));
      alert('Lavador eliminado com sucesso!');
    } catch (error) {
      alert('Erro ao eliminar lavador: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const deleteCompany = async (companyId) => {
    try {
      await axios.delete(`${API}/empresas-externas/${companyId}`);
      setExternalCompanies(externalCompanies.filter(c => c.id !== companyId));
      alert('Empresa eliminada com sucesso!');
    } catch (error) {
      alert('Erro ao eliminar empresa: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-32">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações do Sistema</h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ Atenção:</strong> As operações de eliminação são permanentes e não podem ser desfeitas.
          </p>
        </div>

        {/* Delete Washes Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Gestão de Lavagens ({lavagens.length})</h3>
          {lavagens.length === 0 ? (
            <p className="text-gray-600">Nenhuma lavagem registada.</p>
          ) : (
            <div className="table-container overflow-x-auto max-h-96">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Data</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tipo Veículo</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Lavadores</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Empresa</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Valor</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lavagens.map((lavagem) => (
                    <tr key={lavagem.id} className="table-row hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900 border-b">
                        {new Date(lavagem.data).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 border-b">{lavagem.tipo_veiculo}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 border-b">
                        <span className="inline-flex flex-wrap gap-1">
                          {Array.isArray(lavagem.lavadores) 
                            ? lavagem.lavadores.map((lavador, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                  {lavador}
                                </span>
                              ))
                            : <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                {lavagem.lavadores}
                              </span>
                          }
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 border-b">
                        <span className={`px-2 py-1 rounded text-xs ${
                          lavagem.empresa_tipo === 'interna' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lavagem.empresa_nome}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                        €{lavagem.valor.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 border-b">
                        {showDeleteConfirm === lavagem.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => deleteLavagem(lavagem.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(lavagem.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Custom Washers Management */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Lavadores Personalizados ({customWashers.length})</h3>
          {customWashers.length === 0 ? (
            <p className="text-gray-600">Nenhum lavador personalizado adicionado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customWashers.map((washer) => (
                <div key={washer.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{washer.nome}</p>
                    <p className="text-sm text-gray-600">
                      Adicionado: {new Date(washer.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteWasher(washer.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* External Companies Management */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Empresas Externas ({externalCompanies.length})</h3>
          {externalCompanies.length === 0 ? (
            <p className="text-gray-600">Nenhuma empresa externa adicionada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalCompanies.map((company) => (
                <div key={company.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{company.nome}</p>
                    <p className="text-sm text-gray-600">
                      Adicionada: {new Date(company.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteCompany(company.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <strong>Password de Administrador:</strong> HPD0909
            </div>
            <div>
              <strong>Total de Lavagens:</strong> {lavagens.length}
            </div>
            <div>
              <strong>Versão:</strong> 1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;