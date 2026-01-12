
import React, { useState, useEffect, useMemo } from 'react';
import { DocumentSeries, User, ViewState, WorkLocation, CashRegister, TaxRate, Bank, Metric, Company } from '../types';
import { generateId, formatDate, formatCurrency, generateUUID } from '../utils';
import { supabase } from '../services/supabaseClient';
import { 
  Users, FileText, Plus, Trash2, Save, Pencil, 
  X, UserPlus, Landmark, Ruler, RefreshCw, Loader2, Calculator,
  CheckCircle, FileBadge, AlertCircle, Phone, Database, Globe, CreditCard, Shield, Lock, Calendar, Mail, Info,
  Settings as SettingsIcon, ShieldCheck, UserCheck, Hash, Building2, MapPin, Layout, Box, Briefcase
} from 'lucide-react';
import TaxTable from './TaxTable';

interface SettingsProps {
  series: DocumentSeries[];
  onSaveSeries: (series: DocumentSeries) => void;
  onEditSeries?: (series: DocumentSeries) => void;
  users: User[];
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  workLocations: WorkLocation[];
  onSaveWorkLocation: (wl: WorkLocation) => void;
  onDeleteWorkLocation: (id: string) => void;
  cashRegisters: CashRegister[];
  onSaveCashRegister: (cr: CashRegister) => void;
  onDeleteCashRegister: (id: string) => void;
  onTaxRatesUpdate: (rates: TaxRate[]) => void;
  banks?: Bank[];
  onSaveBank?: (bank: Bank) => void;
  onDeleteBank?: (id: string) => void;
  metrics?: Metric[];
  onSaveMetric?: (metric: Metric) => void;
  onDeleteMetric?: (id: string) => void;
  currentCompany: Company;
  onSaveCompany: (company: Company) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  series, onSaveSeries, onEditSeries,
  users: localUsers, onSaveUser, onDeleteUser,
  workLocations, onSaveWorkLocation, onDeleteWorkLocation,
  cashRegisters, onSaveCashRegister, onDeleteCashRegister,
  onTaxRatesUpdate,
  banks = [], onSaveBank, onDeleteBank,
  metrics = [], onSaveMetric, onDeleteMetric,
  currentCompany, onSaveCompany
}) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'SERIES' | 'USERS' | 'BANCOS' | 'METRICAS' | 'TAXES'>('COMPANY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  
  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Forms
  const [newBank, setNewBank] = useState({ sigla: '', conta: '', nib: '', iban: '', swift: '' });
  const [newMetric, setNewMetric] = useState({ sigla: '', nome: '' });
  
  const [editingSeries, setEditingSeries] = useState<DocumentSeries | null>(null);
  const [newSeriesData, setNewSeriesData] = useState<Partial<DocumentSeries>>({
      name: '', code: '', type: 'NORMAL', year: new Date().getFullYear(), isActive: true, allowedUserIds: [], bankDetails: '', footerText: ''
  });

  const [newUser, setNewUser] = useState<Partial<User>>({
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      accessValidity: '',
      role: 'OPERATOR',
      permissions: ['DASHBOARD']
  });

  const [companyForm, setCompanyForm] = useState<Company>(currentCompany);

  useEffect(() => {
      setCompanyForm(currentCompany);
  }, [currentCompany]);

  // --- PERMISSIONS GROUPS ---
  const permissionGroups = [
      { 
          label: 'Módulos Base', 
          perms: [
              { id: 'DASHBOARD', label: 'Painel Principal' },
              { id: 'WORKSPACE', label: 'Gestão de Obras' },
              { id: 'SECRETARIA_LIST', label: 'Secretaria' },
              { id: 'ARCHIVES', label: 'Arquivos Digitais' }
          ] 
      },
      {
          label: 'Comercial (Vendas)',
          perms: [
              { id: 'INVOICES', label: 'Lista de Vendas' },
              { id: 'CREATE_INVOICE', label: 'Nova Fatura' },
              { id: 'CLIENTS', label: 'Gestão de Clientes' },
              { id: 'POS', label: 'Ponto de Venda' }
          ]
      },
      {
          label: 'Operacional',
          perms: [
              { id: 'STOCK', label: 'Gestão de Stock' },
              { id: 'PURCHASES', label: 'Gestão de Compras' },
              { id: 'SUPPLIERS', label: 'Fornecedores' }
          ]
      },
      {
          label: 'Finanças e Contabilidade',
          perms: [
              { id: 'FINANCE_CASH', label: 'Gestão de Caixa' },
              { id: 'ACCOUNTING_DECLARATIONS', label: 'Modelo 7 / IVA' },
              { id: 'ACCOUNTING_SAFT', label: 'Exportação SAF-T' },
              { id: 'FINANCE_REPORTS', label: 'Relatórios BI' }
          ]
      },
      {
          label: 'Recursos Humanos',
          perms: [
              { id: 'HR', label: 'Painel RH' },
              { id: 'HR_EMPLOYEES', label: 'Funcionários' }
          ]
      },
      {
          label: 'Configurações',
          perms: [
              { id: 'SETTINGS', label: 'Acesso às Definições' }
          ]
      }
  ];

  // --- SERIES ACTIONS ---

  const handleOpenSeriesModal = (s?: DocumentSeries) => {
    if (s) {
      setEditingSeries(s);
      setNewSeriesData({ ...s });
    } else {
      setEditingSeries(null);
      setNewSeriesData({
        name: '', 
        code: '', 
        type: 'NORMAL', 
        year: new Date().getFullYear(), 
        isActive: true, 
        allowedUserIds: [], 
        bankDetails: '', 
        footerText: ''
      });
    }
    setIsSeriesModalOpen(true);
  };

  const handleSaveSeries = async () => {
      if (!newSeriesData.name || !newSeriesData.code) return alert("Nome e Código são obrigatórios.");
      setIsLoading(true);
      setError(null);
      setSyncWarning(null);

      const seriesId = editingSeries?.id || generateUUID();
      const payload = {
          id: seriesId,
          nome: newSeriesData.name,
          codigo: newSeriesData.code,
          tipo: newSeriesData.type,
          ano: newSeriesData.year || new Date().getFullYear(),
          sequencia_atual: editingSeries?.currentSequence || 1,
          sequencias_por_tipo: editingSeries?.sequences || {},
          ativo: newSeriesData.isActive,
          utilizadores_autorizados: newSeriesData.allowedUserIds || [],
          detalhes_bancarios: newSeriesData.bankDetails,
          texto_rodape: newSeriesData.footerText,
          empresa_id: currentCompany.id
      };

      try {
          const { error: syncErr } = await supabase.from('series').upsert(payload);
          if (syncErr) throw syncErr;

          const savedObj: DocumentSeries = {
              id: seriesId,
              name: newSeriesData.name!,
              code: newSeriesData.code!,
              type: newSeriesData.type as any,
              year: newSeriesData.year!,
              currentSequence: payload.sequencia_atual,
              sequences: payload.sequencias_por_tipo,
              isActive: newSeriesData.isActive!,
              allowedUserIds: newSeriesData.allowedUserIds || [],
              bankDetails: newSeriesData.bankDetails,
              footerText: newSeriesData.footerText
          };

          if (editingSeries) {
            onEditSeries?.(savedObj);
          } else {
            onSaveSeries(savedObj);
          }
          
          setIsSeriesModalOpen(false);
          alert("Série fiscal guardada com sucesso na Cloud!");
      } catch (err: any) {
          console.error("Erro Series Cloud:", err.message);
          setSyncWarning("Aviso: Cloud indisponível, dados locais ativos.");
          
          const fallbackObj: DocumentSeries = {
            id: seriesId,
            name: newSeriesData.name!,
            code: newSeriesData.code!,
            type: newSeriesData.type as any,
            year: newSeriesData.year!,
            currentSequence: editingSeries?.currentSequence || 1,
            sequences: editingSeries?.sequences || {},
            isActive: newSeriesData.isActive!,
            allowedUserIds: newSeriesData.allowedUserIds || [],
            bankDetails: newSeriesData.bankDetails,
            footerText: newSeriesData.footerText
          };

          if (editingSeries) onEditSeries?.(fallbackObj);
          else onSaveSeries(fallbackObj);
          
          setIsSeriesModalOpen(false);
      } finally { setIsLoading(false); }
  };

  const handleDeleteSeries = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar esta série fiscal? Esta ação é irreversível na Cloud.")) return;
    
    setIsLoading(true);
    try {
        const { error: syncErr } = await supabase.from('series').delete().eq('id', id);
        if (syncErr) throw syncErr;
        alert("Série eliminada com sucesso da Cloud. A lista será atualizada.");
        window.location.reload(); 
    } catch (err: any) {
        console.error("Erro delete series:", err.message);
        alert("Erro ao eliminar da Cloud: " + String(err.message || err));
    } finally { setIsLoading(false); }
  };

  const toggleUserInSeries = (userId: string) => {
      const currentIds = newSeriesData.allowedUserIds || [];
      if (currentIds.includes(userId)) {
          setNewSeriesData({ ...newSeriesData, allowedUserIds: currentIds.filter(id => id !== userId) });
      } else {
          setNewSeriesData({ ...newSeriesData, allowedUserIds: [...currentIds, userId] });
      }
  };

  const handleSaveBank = async () => {
      if (!newBank.sigla || !newBank.iban) return alert("Sigla e IBAN são obrigatórios.");
      setIsLoading(true);
      try {
          const bankId = generateUUID();
          const { error: syncErr } = await supabase.from('bancos').upsert({
              id: bankId,
              sigla_banco: newBank.sigla.toUpperCase(),
              numero_conta: newBank.conta,
              nib: newBank.nib,
              iban: newBank.iban,
              swift: newBank.swift,
              empresa_id: currentCompany.id
          });
          if (syncErr) throw syncErr;
          onSaveBank?.({ id: bankId, nome: newBank.sigla, sigla: newBank.sigla, iban: newBank.iban, swift: newBank.swift, accountNumber: newBank.conta, nib: newBank.nib });
          setIsBankModalOpen(false);
          setNewBank({ sigla: '', conta: '', nib: '', iban: '', swift: '' });
          alert("Banco registado com sucesso!");
      } catch (err: any) { 
          setSyncWarning("Aviso: Cloud indisponível, dados locais ativos.");
          onSaveBank?.({ id: generateUUID(), nome: newBank.sigla, sigla: newBank.sigla, iban: newBank.iban, swift: newBank.swift, accountNumber: newBank.conta, nib: newBank.nib });
          setIsBankModalOpen(false);
      } finally { setIsLoading(false); }
  };

  const handleSaveMetric = async () => {
      if (!newMetric.sigla || !newMetric.nome) return alert("Sigla e Descrição são obrigatórios.");
      setIsLoading(true);
      const metricId = generateUUID();
      try {
          const { error: syncErr } = await supabase.from('metricas').upsert({
              id: metricId, descricao: newMetric.nome, sigla: newMetric.sigla.toLowerCase(),
              empresa_id: currentCompany.id
          });
          if (syncErr) throw syncErr;
          onSaveMetric?.({ id: metricId, nome: newMetric.nome, sigla: newMetric.sigla });
          setIsMetricModalOpen(false);
          setNewMetric({ sigla: '', nome: '' });
          alert("Métrica registada com sucesso!");
      } catch (err: any) { 
          setSyncWarning("Aviso: Cloud indisponível, dados locais ativos.");
          onSaveMetric?.({ id: metricId, nome: newMetric.nome, sigla: newMetric.sigla });
          setIsMetricModalOpen(false);
      } finally { setIsLoading(false); }
  };

  const handleSaveUser = async () => {
      if (!newUser.name || !newUser.username || !newUser.email || !newUser.password) return alert("Preencha todos os campos obrigatórios (*).");
      setIsLoading(true);
      const userId = generateUUID();
      const createdAt = new Date().toISOString();
      const companyId = currentCompany.id;
      try {
          const { error: syncError } = await supabase.from('utilizadores').insert({
              id: userId, nome: newUser.name, utilizador: newUser.username, email: newUser.email, password: newUser.password, telefone: newUser.phone,
              validade_acesso: newUser.accessValidity || null, permissoes: newUser.permissions, empresa_id: companyId, created_at: createdAt
          });
          if (syncError) {
              if (syncError.message.includes('unique constraint') || syncError.message.includes('utilizadores_email_key')) {
                  throw new Error("Email já existe. Insira um email diferente.");
              }
              throw syncError;
          }
          onSaveUser({ id: userId, name: newUser.name!, username: newUser.username!, email: newUser.email!, password: newUser.password!, phone: newUser.phone, accessValidity: newUser.accessValidity, role: newUser.role || 'OPERATOR', permissions: newUser.permissions || ['DASHBOARD'], companyId, createdAt });
          setIsUserModalOpen(false);
          alert("Utilizador registado com sucesso!");
      } catch (err: any) {
          console.error(err);
          const errorMsg = err.message || "Falha ao sincronizar com a Cloud. A atualização foi aplicada localmente para esta sessão.";
          alert(errorMsg);
          
          if (!err.message.includes("Email já existe")) {
            onSaveUser({ id: userId, name: newUser.name!, username: newUser.username!, email: newUser.email!, password: newUser.password!, phone: newUser.phone, accessValidity: newUser.accessValidity, role: newUser.role || 'OPERATOR', permissions: newUser.permissions || ['DASHBOARD'], companyId, createdAt });
            setIsUserModalOpen(false);
          }
      } finally { setIsLoading(false); }
  };

  const handleTogglePermission = (id: string) => {
      const current = newUser.permissions || [];
      if (current.includes(id as ViewState)) {
          setNewUser({ ...newUser, permissions: current.filter(p => p !== id) });
      } else {
          setNewUser({ ...newUser, permissions: [...current, id as ViewState] });
      }
  };

  const handleUpdateCompany = async () => {
      setIsLoading(true);
      try {
          onSaveCompany(companyForm);
      } finally {
          setIsLoading(false);
      }
  };

  const renderCompanySettings = () => (
    <div className="bg-white border border-slate-300 rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b-4 border-blue-600">
            <h3 className="font-black text-sm uppercase tracking-[3px] flex items-center gap-3">
                <Building2 size={24} className="text-blue-400"/> DADOS GERAIS DA EMPRESA
            </h3>
            <button onClick={handleUpdateCompany} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 transition">
                {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Guardar Alterações
            </button>
        </div>
        
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2">Identificação Fiscal (Bloqueado)</h4>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nome da Empresa</label>
                        <input className="w-full p-3 border-2 border-slate-100 bg-slate-100 rounded-xl font-black text-slate-400 outline-none" value={companyForm.name} readOnly />
                        <p className="text-[9px] text-slate-400 italic">Alterável apenas através do suporte central IMATEC.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">NIF (Contribuinte)</label>
                        <input className="w-full p-3 border-2 border-slate-100 bg-slate-100 rounded-xl font-mono font-bold text-slate-400 outline-none" value={companyForm.nif} readOnly />
                    </div>
                </div>

                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 pt-4">Informação de Contacto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Email Geral</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-600 outline-none" value={companyForm.email} onChange={e => setCompanyForm({...companyForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Telefone</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-600 outline-none" value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Endereço / Morada</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-600 outline-none" value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Localização (Cidade)</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-600 outline-none" value={companyForm.companyType || ''} onChange={e => setCompanyForm({...companyForm, companyType: e.target.value})} placeholder="Ex: Luanda" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Código Postal</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-mono focus:border-blue-600 outline-none" value={companyForm.postalCode || ''} onChange={e => setCompanyForm({...companyForm, postalCode: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2">Parâmetros Oficiais e Registro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nº de Matrícula</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-mono focus:border-blue-600 outline-none" value={companyForm.registrationNumber || ''} onChange={e => setCompanyForm({...companyForm, registrationNumber: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nº de Alvará</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-mono focus:border-blue-600 outline-none" value={companyForm.licenseNumber || ''} onChange={e => setCompanyForm({...companyForm, licenseNumber: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Número INSS</label>
                        <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-mono font-black text-blue-700 focus:border-blue-600 outline-none" value={companyForm.inssNumber || ''} onChange={e => setCompanyForm({...companyForm, inssNumber: e.target.value})} />
                    </div>
                </div>

                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 pt-4">Enquadramento Fiscal</h4>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Regime de IVA</label>
                        <select 
                            className="w-full p-3 border-2 border-slate-100 rounded-xl font-black uppercase text-xs focus:border-blue-600 outline-none cursor-pointer"
                            value={companyForm.regime}
                            onChange={e => setCompanyForm({...companyForm, regime: e.target.value as any})}
                        >
                            <option value="Regime Geral">Regime Geral</option>
                            <option value="Regime Simplificado">Regime Simplificado</option>
                            <option value="Regime de Exclusão">Regime de Exclusão</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
                            checked={companyForm.cashVAT}
                            onChange={e => setCompanyForm({...companyForm, cashVAT: e.target.checked})}
                        />
                        <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Regime de IVA de Caixa</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Aplicável conforme legislação vigente</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20 h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div>
                 <h1 className="text-xl font-bold text-slate-800">Definições Gerais</h1>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configuração do sistema e parâmetros Cloud</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                {[
                  {id:'COMPANY', icon: Building2, label: 'Dados da Empresa'},
                  {id:'SERIES', icon: FileBadge, label: 'Séries'},
                  {id:'USERS', icon: Users, label: 'Utilizadores'},
                  {id:'BANCOS', icon: Landmark, label: 'Bancos'},
                  {id:'METRICAS', icon: Ruler, label: 'Métricas'},
                  {id:'TAXES', icon: Calculator, label: 'Taxas'}
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap text-[10px] uppercase tracking-widest border transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        <tab.icon size={14}/> {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {syncWarning && (
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-800 animate-in slide-in-from-top-2 shadow-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600"/>
                <div>
                    <p className="text-xs font-black uppercase tracking-tighter">Aviso Técnico</p>
                    <p className="text-[11px] font-bold">{String(syncWarning)}</p>
                </div>
                <button onClick={() => setSyncWarning(null)} className="ml-auto p-1 hover:bg-amber-100 rounded-full transition"><X size={16}/></button>
            </div>
        )}

        {activeTab === 'COMPANY' && renderCompanySettings()}

        {activeTab === 'SERIES' && (
            <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="p-5 flex justify-between items-center bg-slate-900 text-white">
                    <h3 className="font-black text-xs uppercase tracking-[3px] flex items-center gap-3"><FileText size={18} className="text-blue-400"/> SÉRIES DE FATURAÇÃO CLOUD</h3>
                    <button onClick={() => handleOpenSeriesModal()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
                        <Plus size={16}/> Nova Série
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[9px] border-b">
                            <tr>
                                <th className="p-4">Série / Identificador</th>
                                <th className="p-4">Tipo Fiscal</th>
                                <th className="p-4">Exercício</th>
                                <th className="p-4 text-center">Acesso</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {series.map(s => (
                                <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-black text-slate-800 uppercase tracking-tight text-sm">{String(s.name)}</div>
                                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[4px] mt-0.5">{String(s.code)}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase border shadow-sm ${s.type === 'NORMAL' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                            {String(s.type)}
                                        </span>
                                    </td>
                                    <td className="p-4 font-black text-slate-500 font-mono text-base">{s.year}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex -space-x-2 justify-center">
                                            {(s.allowedUserIds || []).length > 0 ? (
                                                s.allowedUserIds?.slice(0,4).map(uid => (
                                                    <div key={uid} className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm" title={localUsers.find(u => u.id === uid)?.name || '---'}>
                                                        {(localUsers.find(u => u.id === uid)?.name || '?').charAt(0)}
                                                    </div>
                                                ))
                                            ) : <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">Acesso Livre</span>}
                                            {(s.allowedUserIds || []).length > 4 && <div className="w-8 h-8 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center text-[10px] font-black shadow-lg">+{s.allowedUserIds!.length - 4}</div>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {s.isActive ? (
                                            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase"><CheckCircle size={14}/> Ativo</div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 text-slate-300 font-black text-[9px] uppercase"><X size={14}/> Inativo</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleOpenSeriesModal(s)} className="p-2 bg-white border rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm" title="Configurar Série"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteSeries(s.id)} className="p-2 bg-white border rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm" title="Eliminar"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'USERS' && (
            <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="p-5 flex justify-between items-center bg-slate-900 text-white">
                    <h3 className="font-black text-xs uppercase tracking-[3px] flex items-center gap-3"><Users size={18} className="text-blue-400"/> UTILIZADORES DO SISTEMA</h3>
                    <button onClick={() => { setIsUserModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
                        <UserPlus size={16}/> Novo Utilizador
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[9px] border-b">
                            <tr><th className="p-4">Nome</th><th className="p-4">Username</th><th className="p-4">Email</th><th className="p-4 text-center">Perfil</th><th className="p-4 text-center">Ações</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {localUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-black text-slate-800 uppercase text-sm">{String(u.name)}</td>
                                    <td className="p-4 font-mono text-blue-600 font-bold">@{u.username || u.email.split('@')[0]}</td>
                                    <td className="p-4 text-slate-500 font-medium">{String(u.email)}</td>
                                    <td className="p-4 text-center"><span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">{String(u.role)}</span></td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 bg-white border rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"><Pencil size={16}/></button>
                                            <button onClick={() => onDeleteUser(u.id)} className="p-2 bg-white border rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'BANCOS' && (
            <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="p-5 flex justify-between items-center bg-slate-900 text-white">
                    <h3 className="font-black text-xs uppercase tracking-[3px] flex items-center gap-3"><Landmark size={18} className="text-blue-400"/> COORDENADAS BANCÁRIAS CLOUD</h3>
                    <button onClick={() => setIsBankModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
                        <Plus size={16}/> Registar Bancos
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[9px] border-b">
                            <tr><th className="p-4">Sigla / Nome</th><th className="p-4">Nº Conta</th><th className="p-4">IBAN</th><th className="p-4 text-center">Opções</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {banks.map(b => (
                                <tr key={b.id} className="hover:bg-blue-50 transition-colors font-bold">
                                    <td className="p-4 text-slate-800 uppercase tracking-tighter">{String(b.sigla)} - {String(b.nome)}</td>
                                    <td className="p-4 font-mono text-slate-600">{b.accountNumber || '---'}</td>
                                    <td className="p-4 font-mono text-blue-700 font-black">{String(b.iban)}</td>
                                    <td className="p-4 text-center"><button onClick={() => onDeleteBank?.(b.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'METRICAS' && (
            <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="p-5 flex justify-between items-center bg-slate-900 text-white">
                    <h3 className="font-black text-xs uppercase tracking-[3px] flex items-center gap-3"><Ruler size={18} className="text-blue-400"/> UNIDADES DE MEDIDA</h3>
                    <button onClick={() => setIsMetricModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
                        <Plus size={16}/> Registar Métrica
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[9px] border-b">
                            <tr><th className="p-4">Sigla Apresentação</th><th className="p-4">Descrição da Métrica</th><th className="p-4 text-center">Opções</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {metrics.map(m => (
                                <tr key={m.id} className="hover:bg-blue-50 transition-colors font-bold">
                                    <td className="p-4 text-blue-800 uppercase tracking-[3px] font-black">{String(m.sigla)}</td>
                                    <td className="p-4 text-slate-700 uppercase font-medium">{String(m.nome)}</td>
                                    <td className="p-4 text-center"><button onClick={() => onDeleteMetric?.(m.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'TAXES' && <TaxTable onClose={() => setActiveTab('SERIES')} onTaxRatesUpdate={onTaxRatesUpdate} />}

        {/* MODALS COM DESIGN PROFISSIONAL E LABELS/PLACEHOLDERS INTEGRADOS */}

        {isSeriesModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                    <div className="bg-slate-900 text-white p-7 flex justify-between items-center border-b-8 border-blue-600 shrink-0">
                        <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-4">
                            <FileBadge className="text-blue-400" size={32}/> {editingSeries ? 'Editar Configuração de Série' : 'Adicionar Nova Série Fiscal'}
                        </h3>
                        <button onClick={() => setIsSeriesModalOpen(false)} className="hover:bg-red-600 p-2 rounded-full transition-all border border-white/10 shadow-lg"><X size={28}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10 custom-scrollbar">
                        <div className="space-y-6">
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Info size={14}/> IDENTIFICAÇÃO</h4>
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Nome da Série (Descritivo) *</label>
                                    <input 
                                        className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-bold focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner" 
                                        value={String(newSeriesData.name || '')} 
                                        onChange={e => setNewSeriesData({...newSeriesData, name: e.target.value})} 
                                        placeholder="Ex: Série Principal 2025" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Código Fiscal *</label>
                                        <input 
                                            className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black uppercase focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner text-blue-700" 
                                            value={String(newSeriesData.code || '')} 
                                            onChange={e => setNewSeriesData({...newSeriesData, code: e.target.value.toUpperCase()})} 
                                            placeholder="Ex: A" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Exercício Fiscal</label>
                                        <div className="w-full p-4 border-2 border-slate-100 bg-slate-100 rounded-2xl text-slate-400 font-black text-lg text-center shadow-inner">{newSeriesData.year}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Natureza da Série</label>
                                        <select 
                                            className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black uppercase text-[10px] focus:border-blue-600 outline-none transition-all shadow-inner cursor-pointer" 
                                            value={String(newSeriesData.type || 'NORMAL')} 
                                            onChange={e => setNewSeriesData({...newSeriesData, type: e.target.value as any})}
                                        >
                                            <option value="NORMAL">NORMAL (Certificada AGT)</option>
                                            <option value="MANUAL">MANUAL (Recuperação)</option>
                                            <option value="POS">POS (Venda de Balcão)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Estado de Operação</label>
                                        <select 
                                            className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black uppercase text-[10px] focus:border-blue-600 outline-none transition-all shadow-inner cursor-pointer" 
                                            value={newSeriesData.isActive ? '1' : '0'} 
                                            onChange={e => setNewSeriesData({...newSeriesData, isActive: e.target.value === '1'})}
                                        >
                                            <option value="1">ATIVA</option>
                                            <option value="0">INATIVA</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><ShieldCheck size={14}/> PERMISSÕES DE UTILIZADOR</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic mb-2">Utilizadores autorizados a utilizar esta série para emissão:</p>
                            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-5 max-h-56 overflow-y-auto space-y-2 shadow-inner custom-scrollbar">
                                {localUsers.map(u => (
                                    <label key={u.id} className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${newSeriesData.allowedUserIds?.includes(u.id) ? 'bg-white border-blue-500 shadow-md scale-[1.02]' : 'bg-transparent border-transparent hover:bg-slate-100'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-sm text-slate-700 shadow-sm border-2 border-white">{(u.name || '?').charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-tight uppercase">{String(u.name || '---')}</p>
                                                <p className="text-[10px] text-slate-400 font-mono font-bold">@{u.username || u.email.split('@')[0]}</p>
                                            </div>
                                        </div>
                                        <input 
                                          type="checkbox" 
                                          className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
                                          checked={newSeriesData.allowedUserIds?.includes(u.id)}
                                          onChange={() => toggleUserInSeries(u.id)}
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-[10px] text-amber-800 font-bold leading-relaxed uppercase tracking-wider flex items-start gap-3">
                                <AlertCircle size={18} className="shrink-0"/>
                                Se nenhum utilizador for marcado, todos os utilizadores terão acesso.
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Lock size={14}/> RODAPÉ E DADOS FINANCEIROS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Dados Bancários para Documentos</label>
                                    <textarea 
                                        className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-[2rem] h-32 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-xs leading-relaxed shadow-inner resize-none" 
                                        value={String(newSeriesData.bankDetails || '')} 
                                        onChange={e => setNewSeriesData({...newSeriesData, bankDetails: e.target.value})} 
                                        placeholder="IBAN BFA: AO06 0001 0000 0000 0000 0000 1..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Texto Promocional / Fiscal em Rodapé</label>
                                    <textarea 
                                        className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-[2rem] h-32 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-xs leading-relaxed shadow-inner resize-none" 
                                        value={String(newSeriesData.footerText || '')} 
                                        onChange={e => setNewSeriesData({...newSeriesData, footerText: e.target.value})} 
                                        placeholder="Obrigado pela preferência! Software Certificado nº 25/AGT/2019."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-950 flex justify-end gap-4 shrink-0 border-t-4 border-blue-600">
                        <button onClick={() => setIsSeriesModalOpen(false)} className="px-10 py-4 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all">Cancelar</button>
                        <button onClick={handleSaveSeries} disabled={isLoading} className="bg-blue-600 text-white px-16 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl flex items-center gap-3 transform active:scale-95 transition-all disabled:opacity-50 hover:bg-blue-500">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                            {editingSeries ? 'ATUALIZAR SÉRIE CLOUD' : 'GRAVAR SÉRIE CLOUD'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isBankModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="bg-slate-900 text-white p-7 flex justify-between items-center border-b-8 border-blue-600">
                        <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-4"><Landmark className="text-blue-400" size={28}/> Registar Novo Banco Cloud</h3>
                        <button onClick={() => setIsBankModalOpen(false)} className="hover:bg-red-600 p-2 rounded-full transition-all border border-white/10 shadow-lg"><X size={24}/></button>
                    </div>
                    <div className="p-10 space-y-6 grid grid-cols-2 gap-6">
                        <div className="col-span-1 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Sigla do Banco *</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black uppercase focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner text-blue-700" value={newBank.sigla} onChange={e => setNewBank({...newBank, sigla: e.target.value})} placeholder="Ex: BAI, BFA, BIC" />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Código SWIFT / BIC</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-mono uppercase focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner text-slate-600" value={newBank.swift} onChange={e => setNewBank({...newBank, swift: e.target.value})} placeholder="Ex: BAIAO..." />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Número de Conta ✅</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner text-slate-800" value={newBank.conta} onChange={e => setNewBank({...newBank, conta: e.target.value})} placeholder="Introduza o número de conta oficial" />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">NIB (21 Dígitos)</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-mono focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner" value={newBank.nib} onChange={e => setNewBank({...newBank, nib: e.target.value})} placeholder="00010000..." />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">IBAN Angolano (AO06) *</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-mono font-bold focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner text-blue-700" value={newBank.iban} onChange={e => setNewBank({...newBank, iban: e.target.value})} placeholder="AO06 0001 0000..." />
                        </div>
                    </div>
                    <div className="p-8 bg-slate-950 flex justify-end gap-4 border-t-4 border-blue-600">
                        <button onClick={() => setIsBankModalOpen(false)} className="px-8 py-3 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all">Cancelar</button>
                        <button onClick={handleSaveBank} disabled={isLoading} className="bg-blue-600 text-white px-12 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-3 transform active:scale-95 transition-all hover:bg-blue-500">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} REGISTAR BANCO
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isUserModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                    <div className="bg-slate-900 text-white p-7 flex justify-between items-center border-b-8 border-emerald-600 shrink-0">
                        <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-4">
                            <UserPlus className="text-emerald-400" size={32}/> Cadastro de Utilizador Cloud
                        </h3>
                        <button onClick={() => setIsUserModalOpen(false)} className="hover:bg-red-600 p-2 rounded-full transition-all border border-white/10 shadow-lg"><X size={28}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Info size={14}/> DADOS DE ACESSO</h4>
                                <div className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Nome Completo do Funcionário *</label>
                                        <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-bold focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-inner" value={String(newUser.name || '')} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Ex: João Manuel Silva" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Utilizador (Username) *</label>
                                        <div className="relative">
                                            <Hash size={16} className="absolute left-4 top-4.5 text-slate-300"/>
                                            <input className="w-full pl-10 p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-blue-700 outline-none focus:border-emerald-600 shadow-inner" value={String(newUser.username || '')} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="username" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Endereço de Email Institucional *</label>
                                        <input type="email" className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:border-emerald-600 focus:bg-white shadow-inner font-medium" value={String(newUser.email || '')} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="email@empresa.ao" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Palavra-passe de Acesso *</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-4 top-4.5 text-slate-300"/>
                                            <input type="password" required className="w-full pl-10 p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:border-emerald-600 shadow-inner" value={String(newUser.password || '')} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Contacto Telefónico</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-4 top-4.5 text-slate-300"/>
                                                <input className="w-full pl-10 p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-mono font-bold" value={String(newUser.phone || '')} onChange={e => setNewUser({...newUser, phone: e.target.value})} placeholder="+244 9..." />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Validade Acesso</label>
                                            <input type="date" className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:border-emerald-600 shadow-inner font-bold" value={String(newUser.accessValidity || '')} onChange={e => setNewUser({...newUser, accessValidity: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Perfil de Privilégios</label>
                                        <select className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-xs uppercase focus:border-emerald-600 outline-none shadow-inner cursor-pointer" value={String(newUser.role || 'OPERATOR')} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                                            <option value="ADMIN">ADMINISTRADOR TOTAL</option>
                                            <option value="OPERATOR">OPERADOR DE CAIXA</option>
                                            <option value="ACCOUNTANT">CONTABILISTA / FISCAL</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Layout size={14}/> PERMISSÕES DO UTILIZADOR</h4>
                                <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 max-h-[500px] overflow-y-auto space-y-6 shadow-inner custom-scrollbar">
                                    {permissionGroups.map(group => (
                                        <div key={group.label} className="space-y-3">
                                            <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">{group.label}</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {group.perms.map(p => (
                                                    <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${newUser.permissions?.includes(p.id as ViewState) ? 'bg-white border-emerald-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-200'}`}>
                                                        <input 
                                                          type="checkbox" 
                                                          className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                                                          checked={newUser.permissions?.includes(p.id as ViewState)}
                                                          onChange={() => handleTogglePermission(p.id)}
                                                        />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase">{p.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-slate-950 flex justify-end gap-4 border-t-4 border-emerald-600">
                        <button onClick={() => setIsUserModalOpen(false)} className="px-10 py-4 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all">Cancelar</button>
                        <button onClick={handleSaveUser} disabled={isLoading} className="bg-emerald-600 text-white px-16 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-50">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} GRAVAR UTILIZADOR
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isMetricModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="bg-slate-900 text-white p-7 flex justify-between items-center border-b-8 border-indigo-500">
                        <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-4"><Ruler className="text-indigo-400" size={28}/> Registar Unidade de Medida</h3>
                        <button onClick={() => setIsMetricModalOpen(false)} className="hover:bg-red-600 p-2 rounded-full transition-all border border-white/10 shadow-lg"><X size={24}/></button>
                    </div>
                    <div className="p-10 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Sigla / Abreviatura</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-indigo-700 uppercase focus:border-indigo-600 outline-none transition-all shadow-inner" value={newMetric.sigla} onChange={e => setNewMetric({...newMetric, sigla: e.target.value})} placeholder="Ex: kg, un, l, m2" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Descrição por Extenso</label>
                            <input className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all shadow-inner text-slate-800" value={newMetric.nome} onChange={e => setNewMetric({...newMetric, nome: e.target.value})} placeholder="Ex: Kilogramas, Unidades" />
                        </div>
                    </div>
                    <div className="p-8 bg-slate-950 flex justify-end gap-4 border-t-4 border-indigo-500">
                        <button onClick={() => setIsMetricModalOpen(false)} className="px-8 py-3 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all">Cancelar</button>
                        <button onClick={handleSaveMetric} disabled={isLoading} className="bg-indigo-600 text-white px-12 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-3 transform active:scale-95 transition-all hover:bg-indigo-500">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} GRAVAR
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Settings;
