
import React, { useState, useEffect, useMemo } from 'react';
import { Company, CompanyStatus, LicensePlan } from '../types';
import { supabase } from '../services/supabaseClient';
import { formatDate, formatCurrency, generateUUID } from '../utils';
import { 
  Building2, Search, ShieldCheck, Clock, CheckCircle, AlertTriangle, 
  XCircle, Filter, Download, ExternalLink, Edit3, Save, X, 
  RefreshCw, Loader2, Database, DollarSign, List, History, 
  FileCheck, Shield, Zap, Info, Landmark, MapPin, Phone, Mail, ImageIcon,
  ChevronRight, Upload
} from 'lucide-react';

interface CRMManagerProps {
  onUpdateCompany: () => void;
}

const CRMManager: React.FC<CRMManagerProps> = ({ onUpdateCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'PENDING'>('ALL');

  // Edit Form State
  const [editForm, setEditForm] = useState<Partial<Company>>({});
  const [licenseForm, setLicenseForm] = useState({
      plan: 'STARTER' as LicensePlan,
      months: 12,
      discount: 0,
      paymentProofUrl: '',
      notes: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('empresas').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setCompanies(data.map(c => ({
          id: c.id,
          name: c.nome,
          nif: c.nif,
          email: c.email,
          phone: c.telefone,
          address: c.morada || c.endereco,
          regime: c.regime,
          licensePlan: c.plano,
          status: c.status as CompanyStatus,
          validUntil: c.validade,
          activationDate: c.data_ativacao,
          registrationDate: c.created_at,
          footerCustom: c.rodape_personalizado,
          watermark: c.marca_agua,
          currentDebt: c.divida_atual || 0,
          appliedDiscount: c.desconto_aplicado || 0,
          logo: c.logo
        })));
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateCompany = async () => {
    if (!editForm.id) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('empresas').update({
        nome: editForm.name,
        nif: editForm.nif,
        email: editForm.email,
        telefone: editForm.phone,
        morada: editForm.address,
        regime: editForm.regime,
        rodape_personalizado: editForm.footerCustom,
        marca_agua: editForm.watermark,
        logo: editForm.logo
      }).eq('id', editForm.id);

      if (error) throw error;
      await fetchCompanies();
      setShowEditModal(false);
      onUpdateCompany();
      alert("Empresa atualizada com sucesso!");
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateLicense = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
      const activationDate = new Date().toISOString().split('T')[0];
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + licenseForm.months);
      
      const { error } = await supabase.from('empresas').update({
        status: 'ACTIVE',
        plano: licenseForm.plan,
        data_ativacao: activationDate,
        validade: validUntil.toISOString().split('T')[0],
        desconto_aplicado: licenseForm.discount,
        divida_atual: 0 // Assume pago na ativação
      }).eq('id', selectedCompany.id);

      if (error) throw error;
      await fetchCompanies();
      setShowLicenseModal(false);
      onUpdateCompany();
      alert("Licença ativada com sucesso!");
    } catch (err: any) {
      alert("Erro ao ativar licença: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.nif.includes(searchTerm);
      const isExpired = new Date(c.validUntil) < new Date();
      const matchTab = activeTab === 'ALL' || 
                       (activeTab === 'ACTIVE' && c.status === 'ACTIVE' && !isExpired) ||
                       (activeTab === 'EXPIRED' && (c.status === 'EXPIRED' || isExpired)) ||
                       (activeTab === 'PENDING' && c.status === 'PRE-REGISTRO');
      return matchSearch && matchTab;
    });
  }, [companies, searchTerm, activeTab]);

  const getTimeRemaining = (validUntil: string) => {
      const now = new Date();
      const exp = new Date(validUntil);
      const diff = exp.getTime() - now.getTime();
      
      if (diff <= 0) return { days: 0, hours: 0, status: 'EXPIRED' };
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      let status = 'ACTIVE';
      if (days <= 7) status = 'WARNING';
      
      return { days, hours, status };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <ShieldCheck className="text-blue-600" size={32}/> Módulo CRM: Gestão Central de Licenças
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Auditado pela IMATEC SOFTWARE • Controle Multi-Empresa</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchCompanies} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
             <RefreshCw size={18} className={isLoading ? "animate-spin" : ""}/>
           </button>
           <a href="https://portaldocontribuinte.minfin.gov.ao/consultar-nif-do-contribuinte" target="_blank" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition shadow-lg">
             <Landmark size={16}/> Consulta NIF AGT
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Filtrar Estado</p>
                  <button onClick={() => setActiveTab('ALL')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase transition flex items-center justify-between ${activeTab === 'ALL' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <span>Todas as Empresas</span>
                      <ChevronRight size={14}/>
                  </button>
                  <button onClick={() => setActiveTab('ACTIVE')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase transition flex items-center justify-between ${activeTab === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-emerald-600'}`}>
                      <span>Licenças Ativas</span>
                      <CheckCircle size={14}/>
                  </button>
                  <button onClick={() => setActiveTab('EXPIRED')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase transition flex items-center justify-between ${activeTab === 'EXPIRED' ? 'bg-red-600 text-white' : 'hover:bg-slate-50 text-red-600'}`}>
                      <span>Licenças Expiradas</span>
                      <AlertTriangle size={14}/>
                  </button>
                  <button onClick={() => setActiveTab('PENDING')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase transition flex items-center justify-between ${activeTab === 'PENDING' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-blue-600'}`}>
                      <span>Novos Registos</span>
                      <RefreshCw size={14}/>
                  </button>
              </div>

              <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80}/></div>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4">Resumo Financeiro</h3>
                  <div className="space-y-4">
                      <div>
                          <p className="text-[9px] font-bold text-blue-200 uppercase">Receita Bruta Esperada</p>
                          <p className="text-xl font-black">{formatCurrency(companies.length * 35000)}</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-bold text-blue-200 uppercase">Dívidas em Aberto</p>
                          <p className="text-xl font-black text-red-300">{formatCurrency(companies.reduce((a, b) => a + (b.currentDebt || 0), 0))}</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-9 space-y-4">
              <div className="bg-white p-3 border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                <Search className="text-slate-400" size={20}/>
                <input className="flex-1 outline-none text-sm font-bold" placeholder="Pesquisar por Nome, NIF ou Email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm relative">
                  {isLoading && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                          <Loader2 className="animate-spin text-blue-600" size={40}/>
                      </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest border-b border-slate-800">
                        <tr>
                          <th className="p-4">Empresa / NIF</th>
                          <th className="p-4">Contacto / Email</th>
                          <th className="p-4">Plano</th>
                          <th className="p-4">Expiração</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCompanies.map(comp => {
                            const timeRem = getTimeRemaining(comp.validUntil);
                            return (
                                <tr key={comp.id} className={`hover:bg-slate-50 transition-colors group`}>
                                    <td className="p-4 relative">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${timeRem.status === 'EXPIRED' ? 'bg-red-500' : timeRem.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                        <div className="font-black text-slate-800 uppercase tracking-tight ml-2">{comp.name}</div>
                                        <div className="text-[10px] font-mono text-slate-400 ml-2">{comp.nif}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-600 font-bold italic"><Mail size={12}/> {comp.email}</div>
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px]"><Phone size={12}/> {comp.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-blue-100 shadow-sm">
                                          {comp.licensePlan}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="font-black text-slate-700">{formatDate(comp.validUntil)}</div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase">{timeRem.days} dias restantes</div>
                                            </div>
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors"><Clock size={16}/></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase border shadow-sm ${
                                            timeRem.status === 'EXPIRED' ? 'bg-red-100 text-red-700 border-red-200' :
                                            comp.status === 'PRE-REGISTRO' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {timeRem.status === 'EXPIRED' ? 'EXPIRADA' : comp.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditForm(comp); setShowEditModal(true); }} className="p-2 bg-white border rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm" title="Editar Empresa"><Edit3 size={16}/></button>
                                            <button onClick={() => { setSelectedCompany(comp); setShowLicenseModal(true); }} className="p-2 bg-white border rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm" title="Gerir Licença"><Zap size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                      </tbody>
                    </table>
                  </div>
              </div>
          </div>
      </div>

      {showEditModal && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-slate-900 text-white p-7 flex justify-between items-center border-b-8 border-blue-600 shrink-0">
                      <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-4">
                          <Building2 size={32} className="text-blue-400"/> Ficha Técnica da Empresa
                      </h3>
                      <button onClick={() => setShowEditModal(false)} className="hover:bg-red-600 p-2 rounded-full transition-all border border-white/10 shadow-lg"><X size={28}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><Info size={14}/> IDENTIFICAÇÃO</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome da Empresa</label>
                                <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-600" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">NIF</label>
                                <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-mono font-bold outline-none focus:border-blue-600" value={editForm.nif || ''} onChange={e => setEditForm({...editForm, nif: e.target.value})}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Telefone</label>
                                    <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-600" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Email</label>
                                    <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-600" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[4px] border-b pb-2 flex items-center gap-2"><ImageIcon size={14}/> IDENTIDADE VISUAL</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">URL do Logótipo</label>
                                <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl text-xs outline-none focus:border-blue-600" value={editForm.logo || ''} onChange={e => setEditForm({...editForm, logo: e.target.value})} placeholder="https://..."/>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Marca de Água (Texto)</label>
                                <input className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold outline-none focus:border-blue-600" value={editForm.watermark || ''} onChange={e => setEditForm({...editForm, watermark: e.target.value})} placeholder="Ex: COPIA NÃO VÁLIDA"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Rodapé Personalizado</label>
                                <textarea className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-medium outline-none focus:border-blue-600 h-24 resize-none" value={editForm.footerCustom || ''} onChange={e => setEditForm({...editForm, footerCustom: e.target.value})} placeholder="Informações extras no rodapé das faturas..."/>
                            </div>
                        </div>
                      </div>
                  </div>
                  <div className="p-8 bg-slate-950 flex justify-end gap-4 border-t-4 border-blue-600 shrink-0">
                      <button onClick={() => setShowEditModal(false)} className="px-10 py-4 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all">Cancelar</button>
                      <button onClick={handleUpdateCompany} className="bg-blue-600 text-white px-16 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl flex items-center gap-3 transform active:scale-95 transition-all hover:bg-blue-500">
                          <Save size={20}/> ATUALIZAR EMPRESA
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showLicenseModal && selectedCompany && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                  <div className="bg-slate-900 text-white p-7 flex justify-between items-center border-b-8 border-emerald-600 shrink-0">
                      <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-4">
                          <Zap size={28} className="text-emerald-400"/> Ativação de Licença
                      </h3>
                      <button onClick={() => setShowLicenseModal(false)} className="hover:bg-red-600 p-2 rounded-full transition-all border border-white/10 shadow-lg"><X size={24}/></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Empresa Selecionada</p>
                          <p className="text-lg font-black text-slate-800 uppercase italic">{selectedCompany.name}</p>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pacote de Licença</label>
                              <select className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black uppercase text-xs" value={licenseForm.plan} onChange={e => setLicenseForm({...licenseForm, plan: e.target.value as LicensePlan})}>
                                  <option value="STARTER">STARTER - 15.000 Kz/mês</option>
                                  <option value="PROFESSIONAL">PROFESSIONAL - 35.000 Kz/mês</option>
                                  <option value="ENTERPRISE">ENTERPRISE - 85.000 Kz/mês</option>
                              </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Duração (Meses)</label>
                                  <input type="number" className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black text-center" value={licenseForm.months} onChange={e => setLicenseForm({...licenseForm, months: Number(e.target.value)})}/>
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Desconto (%)</label>
                                  <input type="number" className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-black text-center text-blue-600" value={licenseForm.discount} onChange={e => setLicenseForm({...licenseForm, discount: Number(e.target.value)})}/>
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Comprovativo de Pagamento (URL)</label>
                              <div className="flex gap-2">
                                  <input className="flex-1 p-3 border-2 border-slate-100 bg-slate-50 rounded-xl text-xs outline-none" placeholder="Link do arquivo na nuvem..." value={licenseForm.paymentProofUrl} onChange={e => setLicenseForm({...licenseForm, paymentProofUrl: e.target.value})}/>
                                  <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200"><Upload size={18}/></button>
                              </div>
                          </div>
                      </div>

                      <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-xl">
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold uppercase text-blue-200">Total Líquido</span>
                              <span className="text-2xl font-black">{formatCurrency((licenseForm.months * (licenseForm.plan === 'STARTER' ? 15000 : licenseForm.plan === 'PROFESSIONAL' ? 35000 : 85000)) * (1 - licenseForm.discount / 100))}</span>
                          </div>
                      </div>
                  </div>
                  <div className="p-8 bg-slate-950 flex justify-end gap-3 border-t-4 border-emerald-600 shrink-0">
                      <button onClick={handleActivateLicense} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[4px] shadow-2xl transition transform active:scale-95">
                          CONCLUIR ATIVAÇÃO DE LICENÇA
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CRMManager;
