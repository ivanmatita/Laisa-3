
import React from 'react';
import { Employee, Company } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadExcel } from '../utils/exportUtils';
import { Printer, FileSpreadsheet, ArrowLeft, ShieldCheck } from 'lucide-react';

interface InssListProps {
  employees: Employee[];
  company: Company;
  onBack: () => void;
  year: number;
}

const InssList: React.FC<InssListProps> = ({ employees, company, onBack, year }) => {
  const activeEmployees = employees.filter(e => e.status === 'Active');

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-3 py-1.5 rounded-lg border transition-colors">
                <ArrowLeft size={16}/> Voltar
            </button>
            <div className="flex gap-2">
                <button onClick={() => downloadExcel("inss-table", "Listagem_INSS")} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow shadow-emerald-200"><FileSpreadsheet size={18}/></button>
                <button onClick={() => printDocument("inss-report-area")} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-black shadow shadow-slate-200"><Printer size={18}/></button>
            </div>
        </div>

        <div className="bg-white p-12 shadow-2xl min-h-[800px] border border-slate-200" id="inss-report-area">
            <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-8">
                <h1 className="text-xl font-black uppercase text-slate-800 tracking-tight">LISTAGEM DE TRABALHADORES INSCRITOS INSS</h1>
                <div className="text-right">
                    <h2 className="text-xl font-black uppercase text-slate-900">{company.name}</h2>
                    <p className="font-bold text-slate-500 uppercase text-xs">Exercicio de {year}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]" id="inss-table">
                    <thead className="border-b border-slate-800 uppercase font-black text-slate-700 italic">
                        <tr>
                            <th className="p-2 w-16 text-center">IDNF</th>
                            <th className="p-2 w-32 text-center">Data Inscrição</th>
                            <th className="p-2">Nome Funcionario</th>
                            <th className="p-2">Profissão</th>
                            <th className="p-2 text-right">Salário Base</th>
                            <th className="p-2 text-right">Complemento Salarial</th>
                            <th className="p-2 text-right">VCT TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {activeEmployees.map((emp, idx) => {
                            const vctTotal = emp.baseSalary + (emp.complementSalary || 0);
                            return (
                                <tr key={emp.id} className="hover:bg-slate-50 font-bold italic">
                                    <td className="p-2 text-center border-r border-slate-100">{emp.idnf || (idx + 1)}</td>
                                    <td className="p-2 text-center border-r border-slate-100 font-mono">{formatDate(emp.admissionDate).replace(/ /g, '-')}</td>
                                    <td className="p-2 border-r border-slate-100 uppercase">{emp.name}</td>
                                    <td className="p-2 border-r border-slate-100 uppercase text-slate-500">{emp.role}</td>
                                    <td className="p-2 text-right border-r border-slate-100">{formatCurrency(emp.baseSalary).replace('Kz','')}</td>
                                    <td className="p-2 text-right border-r border-slate-100 text-slate-400">{formatCurrency(emp.complementSalary || 0).replace('Kz','')}</td>
                                    <td className="p-2 text-right font-black text-blue-900">{formatCurrency(vctTotal).replace('Kz','')}</td>
                                </tr>
                            );
                        })}
                        {activeEmployees.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-slate-400 uppercase tracking-widest italic opacity-50">Nenhum funcionário ativo inscrito</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="border-t border-slate-800">
                        <tr className="font-black italic">
                            <td colSpan={6} className="p-4 text-right uppercase text-xs">Fim de Listagem</td>
                            <td></td>
                        </tr>
                        <tr className="font-black italic">
                            <td colSpan={6} className="p-1 text-right uppercase">Total de Trabalhadores activos {activeEmployees.length}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div className="mt-20 flex justify-center opacity-30">
                <div className="p-2 border-4 border-double border-slate-200 rounded-full flex flex-col items-center">
                    <ShieldCheck size={32} className="text-slate-300"/>
                    <span className="text-[8px] font-black uppercase">Seguro INSS</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InssList;
