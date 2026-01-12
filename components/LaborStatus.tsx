
import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { 
  Search, Calendar, Printer, Download, User, Info, 
  CheckCircle, XCircle, RefreshCw, UserCheck, UserMinus, ArrowRight, Clock, List, History
} from 'lucide-react';
import { printDocument, downloadPDF } from '../utils/exportUtils';

interface LaborStatusProps {
  employees: Employee[];
  onRehire: (emp: Employee) => void;
}

const LaborStatus: React.FC<LaborStatusProps> = ({ employees, onRehire }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subView, setSubView] = useState<'ALL' | 'ACTIVE' | 'TERMINATED' | 'READMITTED'>('ALL');

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const nameMatch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = e.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSearch = nameMatch || roleMatch;
      
      const isDemitido = e.employmentStatus === 'demitido' || e.status === 'Terminated' || e.status === 'demitido';
      const isRea = e.status === 'Readmitted';
      const isAct = (e.status === 'Active' || e.status === 'ativo') && e.employmentStatus !== 'demitido';

      const matchView = subView === 'ALL' || 
                        (subView === 'ACTIVE' && isAct) ||
                        (subView === 'TERMINATED' && isDemitido) ||
                        (subView === 'READMITTED' && isRea);

      const admDate = new Date(e.admissionDate);
      const matchDates = (!startDate || admDate >= new Date(startDate)) && 
                         (!endDate || admDate <= new Date(endDate));

      return matchSearch && matchView && matchDates;
    });
  }, [employees, searchTerm, subView, startDate, endDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
            <Info className="text-blue-600" size={32}/> Situação Laboral Consolidada
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Histórico completo de vínculos, readmissões e demissões</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => downloadPDF('labor-status-table', 'Situacao_Laboral.pdf')} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs border hover:bg-slate-200 flex items-center gap-2">
             <Download size={16}/> Baixar PDF
           </button>
           <button onClick={() => printDocument('labor-status-table')} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-xs shadow-lg hover:bg-black transition flex items-center gap-2">
             <Printer size={16}/> Imprimir
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pesquisar Funcionário</label>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                  <input className="w-full pl-10 p-2 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Nome ou Cargo..."/>
              </div>
          </div>
          <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Início</label>
              <input type="date" className="p-2 border-2 border-slate-100 rounded-xl text-xs font-bold" value={startDate} onChange={e => setStartDate(e.target.value)}/>
          </div>
          <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fim</label>
              <input type="date" className="p-2 border-2 border-slate-100 rounded-xl text-xs font-bold" value={endDate} onChange={e => setEndDate(e.target.value)}/>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setSubView('ALL')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${subView === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Todos</button>
              <button onClick={() => setSubView('ACTIVE')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${subView === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Ativos</button>
              <button onClick={() => setSubView('TERMINATED')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${subView === 'TERMINATED' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Demitidos</button>
              <button onClick={() => setSubView('READMITTED')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${subView === 'READMITTED' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Readmitidos</button>
          </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden" id="labor-status-table">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                  <thead className="bg-slate-900 text-white font-black uppercase tracking-widest border-b border-slate-800">
                      <tr>
                          <th className="p-4 border-r border-slate-800">Funcionário / Profissão</th>
                          <th className="p-4 border-r border-slate-800 text-right">Salário Ref.</th>
                          <th className="p-4 border-r border-slate-800 text-center">Cronologia</th>
                          <th className="p-4 border-r border-slate-800">Ocorrência de Saída / Reentrada</th>
                          <th className="p-4 border-r border-slate-800 text-center">Mandante</th>
                          <th className="p-4 border-r border-slate-800 text-center">Estado</th>
                          <th className="p-4 text-center">Ações</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredEmployees.map(emp => {
                          const isDemitido = emp.employmentStatus === 'demitido' || emp.status === 'Terminated' || emp.status === 'demitido';
                          const isRea = emp.status === 'Readmitted';
                          
                          return (
                            <React.Fragment key={emp.id}>
                                <tr className="hover:bg-blue-50 transition-colors italic group">
                                    <td className="p-4 border-r">
                                        <div className="font-black text-slate-900 uppercase leading-none mb-1">{emp.name}</div>
                                        <div className="text-[8px] text-slate-400 uppercase font-bold">{emp.role}</div>
                                    </td>
                                    <td className="p-4 border-r text-right font-black text-slate-600">
                                        {formatCurrency(emp.baseSalary)}
                                    </td>
                                    <td className="p-4 border-r text-center">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1 justify-center"><CheckCircle size={10} className="text-emerald-500"/> <span className="font-bold">ADM: {formatDate(emp.admissionDate)}</span></div>
                                            {emp.dismissalDate && <div className="flex items-center gap-1 justify-center"><XCircle size={10} className="text-red-500"/> <span className="font-bold">DEM: {formatDate(emp.dismissalDate)}</span></div>}
                                            {emp.rehireDate && <div className="flex items-center gap-1 justify-center"><RefreshCw size={10} className="text-indigo-500"/> <span className="font-bold">REA: {formatDate(emp.rehireDate)}</span></div>}
                                        </div>
                                    </td>
                                    <td className="p-4 border-r">
                                        {isDemitido ? (
                                            <div className="space-y-1">
                                                <p className="text-red-600 font-black uppercase leading-tight italic">{emp.dismissalReason || 'Desligamento de Vínculo'}</p>
                                            </div>
                                        ) : isRea ? (
                                            <div className="space-y-1">
                                                <p className="text-indigo-600 font-black uppercase leading-tight italic">{emp.rehireReason || 'Reinclusão no Quadro'}</p>
                                            </div>
                                        ) : <span className="text-slate-300">Quadro Ativo</span>}
                                    </td>
                                    <td className="p-4 border-r text-center font-bold uppercase text-slate-500">
                                        {isDemitido ? (emp.dismissedBy) : 
                                         isRea ? emp.rehireOrderer : '---'}
                                    </td>
                                    <td className="p-4 border-r text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${
                                            isDemitido ? 'bg-red-100 text-red-700 border-red-200' :
                                            isRea ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {isDemitido ? 'Demitido' : isRea ? 'Readmitido' : 'Ativo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            {isDemitido && (
                                                <button onClick={() => onRehire(emp)} className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 rounded-lg transition-all border border-indigo-100 shadow-sm" title="Reintegração">
                                                    <RefreshCw size={14}/>
                                                </button>
                                            )}
                                            <button className="text-slate-400 hover:text-slate-900 p-1.5"><History size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                                {emp.history && emp.history.length > 0 && (
                                  <tr className="bg-slate-50/50">
                                    <td colSpan={7} className="p-4">
                                        <div className="flex gap-4 overflow-x-auto pb-2">
                                            {emp.history.map((h, hIdx) => (
                                                <div key={hIdx} className="bg-white border p-3 rounded-xl shadow-sm min-w-[200px] space-y-1">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">{h.action}</p>
                                                    <p className="text-[9px] font-bold text-slate-700">{formatDate(h.date)}</p>
                                                    <p className="text-[10px] italic text-slate-500 leading-tight">"{h.reason}"</p>
                                                    <p className="text-[8px] font-bold text-blue-600 uppercase border-t pt-1 mt-1">Ref: {h.orderer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                  </tr>
                                )}
                            </React.Fragment>
                          );
                      })}
                      {filteredEmployees.length === 0 && (
                          <tr><td colSpan={7} className="p-20 text-center text-slate-300 font-black uppercase tracking-[5px] italic">Sem registos na cloud</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default LaborStatus;
