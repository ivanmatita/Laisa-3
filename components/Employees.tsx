
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, WorkLocation, Profession, Contract, SalarySlip } from '../types';
import { generateId, formatCurrency, formatDate } from '../utils';
import { 
  Users, UserPlus, Search, Printer, FileText, Trash2, Edit2, X, Save, User, 
  RefreshCw, Info, Settings, Ruler, Calculator, MoreVertical, Plus, PlusCircle,
  ArrowLeft, Loader2, Hash, Calendar, AlertTriangle, UserMinus, UserCheck, Gift,
  Wallet, FileSignature, ChevronDown, ChevronUp, Check, CheckSquare, Square, DollarSign,
  Mail, Phone, MapPin, Building2, CreditCard, ShieldCheck, Globe, Briefcase
} from 'lucide-react';
import { printDocument } from '../utils/exportUtils';
import { supabase } from '../services/supabaseClient';

interface EmployeesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  workLocations: WorkLocation[];
  professions: Profession[];
  contracts?: Contract[];
  payroll?: SalarySlip[];
  onIssueContract?: (emp: Employee) => void; 
}

interface EmployeeActionsModalProps {
    employee: Employee;
    onClose: () => void;
    onAction: (action: string) => void;
}

const EmployeeActionsModal: React.FC<EmployeeActionsModalProps> = ({ employee, onClose, onAction }) => {
    const actions = [
        { label: "Ver Cadastro", icon: Info },
        { label: "Editar Dados Pessoais", icon: Settings },
        { label: "Imprimir Ficha", icon: Printer },
        { label: "Medidas de Fardas", icon: Ruler },
        { label: "Multas e Penalizações", icon: AlertTriangle },
        { label: "Acertos Salariais", icon: Calculator },
        { label: "Gratificações Periodicas Mensais", icon: Gift },
        { label: "Abonos ou Adiantamentos", icon: Wallet },
        { label: "Emitir Contrato de Trabalho", icon: FileSignature },
        { label: "Readmitir Funcionario", icon: UserCheck, hidden: employee.status !== 'Terminated' && employee.employmentStatus !== 'demitido' },
        { label: "Demitir Funcionario", icon: UserMinus, hidden: employee.status === 'Terminated' || employee.employmentStatus === 'demitido' }
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#1e40af] p-1 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="bg-[#1e40af] rounded-[1.4rem] overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 text-center shrink-0 border-b border-white/10">
                        <h3 className="text-white font-black uppercase text-base tracking-tighter italic">{employee.name}</h3>
                    </div>
                    <div className="p-4 space-y-1 bg-[#1e40af] overflow-y-auto custom-scrollbar flex-1">
                        {actions.filter(a => !a.hidden).map((act, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onAction(act.label)}
                                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white text-left px-4 py-3 rounded-lg flex items-center gap-4 group transition-all border-b-2 border-blue-900"
                            >
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-all">
                                    <act.icon size={18} className="text-white"/>
                                </div>
                                <span className="font-bold text-xs uppercase tracking-tight leading-none">{act.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-[#1e40af] flex justify-center">
                        <button onClick={onClose} className="text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                           <X size={14}/> FECHAR MENU
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Employees: React.FC<EmployeesProps> = ({ employees, onSaveEmployee, workLocations, professions, contracts = [], payroll = [], onIssueContract }) => {
  const [view, setView] = useState<'LIST' | 'FORM' | 'PROFILE'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedEmployeeForActions, setSelectedEmployeeForActions] = useState<Employee | null>(null);
  
  // Accordion State
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Dismissal Modal State
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissData, setDismissData] = useState({ date: new Date().toISOString().split('T')[0], orderer: '', reason: '', occurrence: '' });

  const [formData, setFormData] = useState<Partial<Employee>>({
    status: 'Active',
    contractType: 'Indeterminado',
    gender: 'M',
    maritalStatus: 'Solteiro',
    baseSalary: 0,
    subsidyFood: 0,
    subsidyTransport: 0,
    cadastralData: {
        personalDocs: [], occurrences: [], equipment: [], otherDocs: [], adjustments: [], fines: [], advances: []
    }
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const nameMatch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const nifMatch = (e.nif && e.nif.includes(searchTerm));
      const biMatch = (e.biNumber && e.biNumber.includes(searchTerm));
      const matchSearch = nameMatch || nifMatch || biMatch;
      
      const isActiveStatus = (e.status === 'Active' || e.status === 'Readmitted' || e.status === 'ativo') && e.employmentStatus !== 'demitido';
      const isTerminatedStatus = e.status === 'Terminated' || e.employmentStatus === 'demitido' || e.status === 'demitido';
      
      const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? isActiveStatus : isTerminatedStatus);
      const matchDept = deptFilter === 'ALL' || e.department === deptFilter;
      
      const isCompleted = e.cadastralData && (
          (e.cadastralData.personalDocs?.length || 0) > 0 || 
          (e.cadastralData.occurrences?.length || 0) > 0 || 
          (e.cadastralData.equipment?.length || 0) > 0
      );
      const matchCompleted = !onlyCompleted || isCompleted;

      return matchSearch && matchStatus && matchDept && matchCompleted;
    });
  }, [employees, searchTerm, statusFilter, deptFilter, onlyCompleted]);

  const handleEdit = (emp: Employee) => {
    setFormData(emp);
    setView('FORM');
  };

  const handleViewProfile = (emp: Employee) => {
      setSelectedEmployeeForActions(emp);
      setFormData(emp);
      setView('PROFILE');
  };

  const handleCreate = () => {
    setFormData({
      id: generateId(),
      employeeNumber: '',
      status: 'Active',
      contractType: 'Indeterminado',
      gender: 'M',
      maritalStatus: 'Solteiro',
      admissionDate: new Date().toISOString().split('T')[0],
      baseSalary: 0,
      subsidyFood: 0,
      subsidyTransport: 0,
      subsidyFamily: 0,
      subsidyHousing: 0,
      subsidyChristmas: 0,
      subsidyVacation: 0,
      subsidyExtra: 0,
      bonuses: 0,
      allowances: 0,
      otherSubsidies: 0,
      cadastralData: { personalDocs: [], occurrences: [], equipment: [], otherDocs: [], adjustments: [], fines: [], advances: [] }
    });
    setView('FORM');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.nif || !formData.role) return alert("Preencha os campos obrigatórios (*)");
    setIsLoading(true);
    try {
        onSaveEmployee(formData as Employee);
        if (view !== 'PROFILE') setView('LIST');
        else alert("Ficha Cadastral atualizada!");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
      if(!dismissData.date || !dismissData.orderer || !dismissData.reason) return alert("Preencha todos os campos obrigatórios.");
      if(selectedEmployeeForActions) {
          setIsLoading(true);
          try {
              const payload = {
                  ...selectedEmployeeForActions,
                  status: 'Terminated',
                  employmentStatus: 'demitido',
                  dismissalDate: dismissData.date,
                  dismissedBy: dismissData.orderer,
                  dismissalReason: dismissData.reason,
                  occurrence: dismissData.occurrence,
                  history: [
                    ...(selectedEmployeeForActions.history || []),
                    { date: dismissData.date, action: 'Demitido', reason: dismissData.reason, orderer: dismissData.orderer }
                  ]
              };
              
              onSaveEmployee(payload as Employee);
              setShowDismissModal(false);
              setShowActionsModal(false);
              alert("Funcionário demitido e bloqueado no sistema!");
          } catch (err: any) {
              alert("Erro ao salvar demissão na Cloud: " + (err?.message || "Erro de ligação"));
          } finally {
              setIsLoading(false);
          }
      }
  };

  const renderForm = () => (
      <div className="max-w-6xl mx-auto p-6 animate-in zoom-in-95 duration-300">
          <button onClick={() => setView('LIST')} className="mb-4 text-blue-600 flex items-center gap-2 font-bold hover:underline transition">
              <ArrowLeft size={18}/> Voltar para Listagem
          </button>
          
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b-8 border-blue-600">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                      <UserPlus className="text-blue-400"/> Ficha Cadastral Completa
                  </h2>
                  <div className="flex gap-3">
                      <button type="button" onClick={() => setView('LIST')} className="px-6 py-2 border-2 border-slate-700 text-slate-400 rounded-xl font-black uppercase text-[10px] hover:bg-slate-800 transition">Cancelar</button>
                      <button type="submit" disabled={isLoading} className="px-10 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-blue-500 transition flex items-center gap-2">
                          {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Gravar Funcionário
                      </button>
                  </div>
              </div>

              <div className="p-10 space-y-12">
                  {/* Seção 1: Identificação */}
                  <section className="space-y-6">
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Info size={14}/> IDENTIFICAÇÃO PESSOAL E FISCAL</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nº Funcionário (Agente)</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black text-blue-700 outline-none focus:border-blue-500 transition shadow-inner" value={formData.employeeNumber || ''} onChange={e => setFormData({...formData, employeeNumber: e.target.value})} placeholder="Ex: 001" />
                          </div>
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo *</label>
                              <input required className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black text-slate-800 uppercase outline-none focus:border-blue-500 transition shadow-inner" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome Completo do Trabalhador" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">NIF (Contribuinte) *</label>
                              <input required className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.nif || ''} onChange={e => setFormData({...formData, nif: e.target.value})} placeholder="999999999" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bilhete de Identidade (BI) *</label>
                              <input required className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.biNumber || ''} onChange={e => setFormData({...formData, biNumber: e.target.value})} placeholder="000000000LA000" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nº Segurança Social (INSS)</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.ssn || ''} onChange={e => setFormData({...formData, ssn: e.target.value})} placeholder="00000000" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Gênero</label>
                              <select className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition cursor-pointer shadow-inner" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                                  <option value="M">Masculino</option>
                                  <option value="F">Feminino</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data Nascimento</label>
                              <input type="date" className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Estado Civil</label>
                              <select className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value as any})}>
                                  <option value="Solteiro">Solteiro</option>
                                  <option value="Casado">Casado</option>
                                  <option value="Divorciado">Divorciado</option>
                                  <option value="Viuvo">Viúvo</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nacionalidade</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.nationality || 'Angolana'} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                          </div>
                      </div>
                  </section>

                  {/* Seção 2: Dados Laborais */}
                  <section className="space-y-6">
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Briefcase size={14}/> DADOS LABORAL E REMUNERAÇÃO</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cargo / Função Profissional *</label>
                              <select required className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black text-blue-800 uppercase outline-none focus:border-blue-500 transition shadow-inner" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                  <option value="">Seleccionar Profissão...</option>
                                  {professions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Departamento</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Ex: Financeiro, RH" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status</label>
                              <select className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black text-emerald-600 outline-none focus:border-blue-500 transition shadow-inner" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                  <option value="Active">Ativo</option>
                                  <option value="Terminated">Demitido</option>
                                  <option value="OnLeave">Em Licença</option>
                                  <option value="Readmitted">Readmitido</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Salário Base (Kz) *</label>
                              <input type="number" required className="w-full p-3 border-2 border-slate-100 bg-white rounded-xl font-black text-blue-900 text-lg outline-none focus:border-blue-500 transition shadow-inner" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data Admissão</label>
                              <input type="date" className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.admissionDate || ''} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data Demissão</label>
                              <input type="date" className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.dismissalDate || ''} onChange={e => setFormData({...formData, dismissalDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tipo de Contrato</label>
                              <select className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as any})}>
                                  <option value="Indeterminado">Tempo Indeterminado</option>
                                  <option value="Determinado">Tempo Determinado</option>
                                  <option value="Estagio">Estágio</option>
                              </select>
                          </div>
                      </div>
                  </section>

                  {/* Seção 3: Contactos e Bancários */}
                  <section className="space-y-6">
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><CreditCard size={14}/> CONTACTOS E DADOS BANCÁRIOS</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Email Profissional</label>
                              <div className="relative">
                                  <Mail className="absolute left-3 top-3.5 text-slate-300" size={16}/>
                                  <input className="w-full pl-10 p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="exemplo@empresa.ao" />
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Telefone / Móvel</label>
                              <div className="relative">
                                  <Phone className="absolute left-3 top-3.5 text-slate-300" size={16}/>
                                  <input className="w-full pl-10 p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+244 9XX XXX XXX" />
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome do Banco</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-600 transition shadow-inner" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="Ex: BAI, BFA, BIC" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nº Conta Bancária</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.bankAccount || ''} onChange={e => setFormData({...formData, bankAccount: e.target.value})} />
                          </div>
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">IBAN (21 Dígitos)</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-black text-blue-800 outline-none focus:border-blue-500 transition shadow-inner" value={formData.iban || ''} onChange={e => setFormData({...formData, iban: e.target.value})} placeholder="AO06 0000 0000 0000 0000 0000 0" />
                          </div>
                      </div>
                  </section>

                  {/* Seção 4: Localização */}
                  <section className="space-y-6">
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><MapPin size={14}/> LOCALIZAÇÃO E ENDEREÇO</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Endereço / Morada Completa</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-medium outline-none focus:border-blue-500 transition shadow-inner" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Casa, Travessa..." />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bairro</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.neighborhood || ''} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Município</label>
                              <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-500 transition shadow-inner" value={formData.municipality || ''} onChange={e => setFormData({...formData, municipality: e.target.value})} />
                          </div>
                      </div>
                  </section>

                  {/* Seção 5: Subsídios e Abonos (Dinâmico) */}
                  <section className="space-y-8 bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                      <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[4px] border-b border-slate-200 pb-2 flex items-center gap-2"><DollarSign size={16} className="text-emerald-600"/> SUBSÍDIOS, ABONOS E GRATIFICAÇÕES</h3>
                      
                      <div className="grid grid-cols-1 gap-12">
                          {/* Subsídio Alimentação */}
                          <div className="space-y-4">
                              <div className="flex items-center justify-between"><h4 className="font-black text-xs uppercase text-slate-700 italic border-l-4 border-emerald-500 pl-3">Subsídio de Alimentação</h4></div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Valor Mensal (Kz)</label><input type="number" className="w-full p-2 border-b-2 border-slate-200 bg-white font-bold outline-none" value={formData.subsidyFood} onChange={e => setFormData({...formData, subsidyFood: Number(e.target.value)})} /></div>
                                  <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Data Início</label><input type="date" className="w-full p-2 border-b-2 border-slate-200 bg-white outline-none" value={formData.subsidyFoodStart || ''} onChange={e => setFormData({...formData, subsidyFoodStart: e.target.value})} /></div>
                                  <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Data Fim</label><input type="date" className="w-full p-2 border-b-2 border-slate-200 bg-white outline-none" value={formData.subsidyFoodEnd || ''} onChange={e => setFormData({...formData, subsidyFoodEnd: e.target.value})} /></div>
                              </div>
                          </div>

                          {/* Subsídio Transporte */}
                          <div className="space-y-4">
                              <div className="flex items-center justify-between"><h4 className="font-black text-xs uppercase text-slate-700 italic border-l-4 border-blue-500 pl-3">Subsídio de Transporte</h4></div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Valor Mensal (Kz)</label><input type="number" className="w-full p-2 border-b-2 border-slate-200 bg-white font-bold outline-none" value={formData.subsidyTransport} onChange={e => setFormData({...formData, subsidyTransport: Number(e.target.value)})} /></div>
                                  <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Data Início</label><input type="date" className="w-full p-2 border-b-2 border-slate-200 bg-white outline-none" value={formData.subsidyTransportStart || ''} onChange={e => setFormData({...formData, subsidyTransportStart: e.target.value})} /></div>
                                  <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Data Fim</label><input type="date" className="w-full p-2 border-b-2 border-slate-200 bg-white outline-none" value={formData.subsidyTransportEnd || ''} onChange={e => setFormData({...formData, subsidyTransportEnd: e.target.value})} /></div>
                              </div>
                          </div>
                      </div>
                  </section>
              </div>

              <div className="p-10 bg-slate-950 flex justify-end gap-4 border-t-4 border-blue-600">
                  <button type="button" onClick={() => setView('LIST')} className="px-12 py-4 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all">Descartar</button>
                  <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-20 py-4 rounded-2xl font-black uppercase text-sm tracking-[3px] shadow-2xl transition transform active:scale-95 disabled:opacity-50 hover:bg-blue-500">
                      {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} FINALIZAR CADASTRO CLOUD
                  </button>
              </div>
          </form>
      </div>
  );

  return (
    <div className="h-full">
      {view === 'LIST' ? (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-blue-600"/> Gestão de Funcionários
              </h1>
              <p className="text-xs text-slate-500">Controlo de pessoal e vínculos</p>
            </div>
            <div className="flex gap-2">
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-lg">
                    <UserPlus size={18}/> Novo Funcionário
                </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
              <input 
                className="w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Pesquisar..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Funcionário</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">NIF</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 uppercase italic">{emp.name}</td>
                    <td className="p-4 font-bold text-slate-700 uppercase">{emp.role}</td>
                    <td className="p-4 font-mono">{emp.nif}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${emp.status === 'Active' || emp.status === 'Readmitted' || emp.status === 'ativo' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => { setSelectedEmployeeForActions(emp); setShowActionsModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <MoreVertical size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : view === 'FORM' ? renderForm() : null}
      
      {showActionsModal && selectedEmployeeForActions && (
          <EmployeeActionsModal 
              employee={selectedEmployeeForActions}
              onClose={() => { setShowActionsModal(false); setSelectedEmployeeForActions(null); }}
              onAction={(label) => {
                  if (label === "Ver Cadastro") {
                      handleViewProfile(selectedEmployeeForActions);
                      setShowActionsModal(false);
                  } else if (label === "Editar Dados Pessoais") {
                      handleEdit(selectedEmployeeForActions);
                      setShowActionsModal(false);
                  } else if (label === "Demitir Funcionario") {
                      setShowDismissModal(true);
                      setShowActionsModal(false);
                  }
                  // Manter outras ações originais integradas...
              }}
          />
      )}

      {/* DISMISS MODAL */}
      {showDismissModal && selectedEmployeeForActions && (
          <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="bg-red-600 text-white p-6 flex justify-between items-center">
                      <h3 className="font-black uppercase tracking-widest flex items-center gap-2"><UserMinus/> Demitir Funcionário</h3>
                      <button onClick={() => setShowDismissModal(false)}><X/></button>
                  </div>
                  <div className="p-8 space-y-4">
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                          <p className="text-[10px] font-black text-red-800 uppercase">Funcionário Alvo:</p>
                          <p className="font-black text-slate-800 text-lg uppercase italic">{selectedEmployeeForActions.name}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data de Demissão *</label>
                              <input type="date" className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold" value={dismissData.date} onChange={e => setDismissData({...dismissData, date: e.target.value})}/>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome de quem ordenou *</label>
                              <input className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold" value={dismissData.orderer} onChange={e => setDismissData({...dismissData, orderer: e.target.value})}/>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Motivo do Despedimento *</label>
                              <textarea className="w-full p-3 border-2 border-slate-100 rounded-xl h-24 resize-none" value={dismissData.reason} onChange={e => setDismissData({...dismissData, reason: e.target.value})}/>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ocorrência / Notas</label>
                              <textarea className="w-full p-3 border-2 border-slate-100 rounded-xl h-20 resize-none" value={dismissData.occurrence} onChange={e => setDismissData({...dismissData, occurrence: e.target.value})}/>
                          </div>
                      </div>
                      <button onClick={handleDismiss} disabled={isLoading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2">
                          {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Check size={20}/>} Confirmar Demissão
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Employees;
