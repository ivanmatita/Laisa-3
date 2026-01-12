
import React, { useState, useMemo } from 'react';
import { WorkProject, Invoice, Purchase } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadPDF } from "../utils/exportUtils";
import { 
  ArrowLeft, Download, Printer, Search, Info, MapPin, 
  Building2, BarChart3, FileText, CheckCircle, Zap
} from 'lucide-react';

interface ProjectReportProps {
  project: WorkProject;
  invoices: Invoice[];
  purchases: Purchase[];
  onBack: () => void;
}

const ProjectReport: React.FC<ProjectReportProps> = ({ project, invoices, purchases, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const projectInvoices = useMemo(() => invoices.filter(i => i.workLocationId === project.id && i.isCertified && i.status !== 'Anulado'), [invoices, project]);
  const projectPurchases = useMemo(() => purchases.filter(p => p.workLocationId === project.id && p.status !== 'CANCELLED'), [purchases, project]);
  
  const filteredInvoices = projectInvoices.filter(i => 
      i.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvoiced = projectInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalCosts = projectPurchases.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="bg-slate-50 min-h-screen animate-in fade-in flex flex-col">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0 border-b-4 border-indigo-600 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition border border-slate-700 mr-2"><ArrowLeft size={24}/></button>
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black uppercase shadow-xl">{project.code?.substring(0,2)}</div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tighter">Relatório do Local de Trabalho</h2>
                   <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{project.title}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => downloadPDF('project-report-content', `Relatorio_Obra_${project.code}.pdf`)} className="p-3 bg-white/10 hover:bg-blue-600 rounded-xl transition text-white border border-white/5"><Download size={20}/></button>
                <button onClick={() => printDocument('project-report-content')} className="p-3 bg-white/10 hover:bg-blue-600 rounded-xl transition text-white border border-white/5"><Printer size={20}/></button>
            </div>
        </div>

        <div className="bg-white p-4 border-b border-slate-100 flex gap-4 print:hidden sticky top-24 z-40 shadow-sm">
            <div className="max-w-xl flex-1 relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold transition-all" 
                  placeholder="Pesquisar faturas desta obra..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 p-10 custom-scrollbar" id="project-report-content">
            <div className="bg-white p-12 rounded-[2rem] shadow-xl border border-slate-200 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    <div className="space-y-6">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest border-b pb-2 flex items-center gap-2"><Info size={16} className="text-indigo-600"/> Dados Cadastrais</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">Referência</p><p className="font-black text-indigo-700">{project.code}</p></div>
                            <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">Abertura</p><p className="font-bold">{formatDate(project.startDate)}</p></div>
                            <div className="space-y-1 col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase">Localização</p><div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/><span className="font-bold">{project.location}</span></div></div>
                            <div className="space-y-1 col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase">Cliente</p><div className="flex items-center gap-2"><Building2 size={14} className="text-slate-400"/><span className="font-black uppercase">{project.clientName}</span></div></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest border-b pb-2 flex items-center gap-2"><BarChart3 size={16} className="text-emerald-600"/> Balanço Financeiro</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-[10px] font-black text-emerald-800 uppercase">Total Faturado</span>
                                <span className="text-xl font-black text-emerald-700">{formatCurrency(totalInvoiced)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                                <span className="text-[10px] font-black text-red-800 uppercase">Total de Custos</span>
                                <span className="text-xl font-black text-red-700">{formatCurrency(totalCosts)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
                                <span className="text-[10px] font-black text-blue-400 uppercase">Margem Bruta</span>
                                <span className="text-xl font-black">{formatCurrency(totalInvoiced - totalCosts)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest border-b pb-2 flex items-center gap-2"><FileText size={16} className="text-blue-600"/> Documentos de Venda Associados</h3>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[10px] border-collapse">
                            <thead className="bg-slate-50 font-black uppercase text-slate-500 border-b">
                                <tr><th className="p-4">Data</th><th className="p-4">Documento</th><th className="p-4">Tipo</th><th className="p-4 text-right">Valor Total</th><th className="p-4 text-center">Estado</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono">{formatDate(inv.date)}</td>
                                        <td className="p-4 font-black text-blue-700">{inv.number}</td>
                                        <td className="p-4 font-bold">{inv.type}</td>
                                        <td className="p-4 text-right font-black">{formatCurrency(inv.total)}</td>
                                        <td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-200">CERTIFICADO</span></td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase italic">Sem documentos para exibir</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t-4 border-slate-900 flex justify-between items-end text-[9px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                         <div className="p-1 border border-slate-200"><Zap size={20} className="text-blue-500 opacity-20"/></div>
                         <span>Software Certificado nº 25/AGT/2019 • Imatec Software V.2.0</span>
                    </div>
                    <div className="text-right">
                        Relatório gerado em: {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProjectReport;
