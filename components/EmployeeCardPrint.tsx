
import React, { useState, useMemo } from 'react';
import { Employee, WorkLocation } from '../types';
import { formatDate } from '../utils';
import { printDocument } from '../utils/exportUtils';
import { 
  Search, Printer, CheckSquare, Square, User, 
  CreditCard, LayoutGrid, X, MapPin, Briefcase, 
  Database, RefreshCw, ChevronLeft, Building2, Info
} from 'lucide-react';

interface EmployeeCardPrintProps {
  employees: Employee[];
  workLocations: WorkLocation[];
  onBack: () => void;
}

const EmployeeCardPrint: React.FC<EmployeeCardPrintProps> = ({ employees, workLocations, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const nameMatch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = e.role.toLowerCase().includes(searchTerm.toLowerCase());
      const isAct = (e.status === 'Active' || e.status === 'Readmitted' || e.status === 'ativo') && e.employmentStatus !== 'demitido';
      return (nameMatch || roleMatch) && isAct;
    });
  }, [employees, searchTerm]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
            <ChevronLeft size={24}/>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
              <CreditCard className="text-blue-600" size={32}/> Impressão de Cartões
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Geração de identificação corporativa</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            disabled={selectedIds.size === 0}
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Printer size={18}/> Imprimir Selecionados ({selectedIds.size})
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            placeholder="Pesquisar funcionário..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
           <button onClick={toggleSelectAll} className="text-[10px] font-black uppercase text-blue-600 hover:underline">
             {selectedIds.size === filteredEmployees.length ? 'Desmarcar Todos' : 'Marcar Todos'}
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest border-b border-slate-800">
              <tr>
                <th className="p-5 w-12 text-center">Sel.</th>
                <th className="p-5">Foto</th>
                <th className="p-5">Agente Nº</th>
                <th className="p-5">Nome do Funcionário</th>
                <th className="p-5">Profissão</th>
                <th className="p-5">Local de Trabalho</th>
                <th className="p-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className={`hover:bg-blue-50/50 transition-colors group ${selectedIds.has(emp.id) ? 'bg-blue-50' : ''}`} onClick={() => toggleSelect(emp.id)}>
                  <td className="p-5 text-center">
                    <button className="text-blue-600">
                      {selectedIds.has(emp.id) ? <CheckSquare size={20}/> : <Square size={20} className="text-slate-300"/>}
                    </button>
                  </td>
                  <td className="p-5">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-300"/>}
                    </div>
                  </td>
                  <td className="p-5 font-mono font-bold text-blue-600">{emp.employeeNumber || emp.id.substring(0,4).toUpperCase()}</td>
                  <td className="p-5 font-black text-slate-800 uppercase tracking-tight">{emp.name}</td>
                  <td className="p-5 font-bold text-slate-600 uppercase text-xs">{emp.role}</td>
                  <td className="p-5 text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400"/>
                      {workLocations.find(w => w.id === emp.workLocationId)?.name || 'Geral'}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-emerald-200">ATÍVO</span>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-slate-300 font-black uppercase tracking-[5px] bg-slate-50 italic">
                    Sem funcionários ativos encontrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 flex items-start gap-4">
        <Info className="text-blue-600 mt-1" size={24}/>
        <div>
            <h4 className="font-black text-blue-900 uppercase text-xs mb-1">Dica de Impressão</h4>
            <p className="text-sm text-blue-700 leading-relaxed font-medium">Selecione os funcionários desejados e clique em imprimir. O sistema gerará um layout otimizado para cartões de identificação em formato PVC ou A4.</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCardPrint;
