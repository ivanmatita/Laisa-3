import React from 'react';
import { Employee, SalarySlip } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Printer, Download, FileSpreadsheet, Calculator, ArrowUpRight, CheckCircle } from 'lucide-react';
import { printDocument, downloadExcel } from '../utils/exportUtils';

interface SalaryListReportProps {
  employees: Employee[];
  payroll: SalarySlip[];
  year: number;
}

const SalaryListReport: React.FC<SalaryListReportProps> = ({ employees, payroll, year }) => {
  
  const reportData = employees.map((emp, idx) => {
      const admDate = new Date(emp.admissionDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - admDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const slip = payroll.find(p => p.employeeId === emp.id);
      const salaryBase = slip?.baseSalary || emp.baseSalary;
      const helps = slip?.allowances || 0;

      return {
          idnf: idx + 2, // Começa em 2 porque 1 é a linha de exemplo
          admissionDate: emp.admissionDate,
          antiquity: `${diffDays} dias`,
          name: emp.name,
          profession: emp.role,
          workplace: emp.department || 'Obra Generica',
          base: salaryBase,
          helps: helps,
          total: salaryBase + helps
      };
  });

  const totalVencimentos = reportData.reduce((acc, curr) => acc + curr.total, 0) + 20122 + 152333; // Adicionando valores do exemplo

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-end gap-2 print:hidden">
          <button 
            onClick={() => downloadExcel("salary-list-table", `Listagem_Vencimento_${year}`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={16}/> Baixar Excel
          </button>
          <button 
            onClick={() => printDocument("salary-list-report")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs shadow-md hover:bg-black transition"
          >
            <Printer size={16}/> Imprimir PDF
          </button>
      </div>

      <div className="bg-white p-12 border-2 border-slate-300 shadow-2xl min-h-[1100px] flex flex-col font-sans text-slate-900" id="salary-list-report">
          <div className="text-center mb-10 border-b-8 border-slate-900 pb-6">
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800 italic">LISTAGEM DE TRABALHADORES ACTIVOS POR VENCIMENTO</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Listagem emitida em 08-01-2026 | Exercício de 2026
              </p>
          </div>

          <div className="overflow-x-auto border-2 border-slate-800 shadow-lg mb-10">
              <table className="w-full text-left border-collapse text-[10px]" id="salary-list-table">
                  <thead className="bg-slate-100">
                      <tr className="border-b-2 border-slate-900 uppercase italic font-black text-slate-700">
                          <th className="p-3 border-r border-slate-300 w-12 text-center">IDNF</th>
                          <th className="p-3 border-r border-slate-300 w-24">Data Admissão</th>
                          <th className="p-3 border-r border-slate-300 w-32">Antiguidade Dias</th>
                          <th className="p-3 border-r border-slate-300">Nome Funcionário</th>
                          <th className="p-3 border-r border-slate-300">Profissão</th>
                          <th className="p-3 border-r border-slate-300">Posto</th>
                          <th className="p-3 border-r border-slate-300 text-right w-32">Salário Base</th>
                          <th className="p-3 border-r border-slate-300 text-right w-32">Ajudas Custo</th>
                          <th className="p-3 text-right w-32 bg-slate-900 text-white">VCT TOTAL</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {/* Linha de exemplo solicitada */}
                      <tr className="bg-slate-50 font-bold italic h-12">
                        <td className="p-2 border-r border-slate-300 text-center">1</td>
                        <td className="p-2 border-r border-slate-300 font-mono">01-02-2020</td>
                        <td className="p-2 border-r border-slate-300 font-mono">2169 dias</td>
                        <td className="p-2 border-r border-slate-300 uppercase">.</td>
                        <td className="p-2 border-r border-slate-300 uppercase">.</td>
                        <td className="p-2 border-r border-slate-300 uppercase text-slate-500">Obra Generica</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">0,00</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">20.122,00</td>
                        <td className="p-2 text-right font-black text-blue-900 bg-slate-200">20.122,00</td>
                      </tr>
                      {/* Linha INACIOO solicitada */}
                      <tr className="bg-white font-bold italic h-12">
                        <td className="p-2 border-r border-slate-300 text-center">2</td>
                        <td className="p-2 border-r border-slate-300 font-mono">05-01-2026</td>
                        <td className="p-2 border-r border-slate-300 font-mono">4 dias</td>
                        <td className="p-2 border-r border-slate-300 uppercase">INACIOO</td>
                        <td className="p-2 border-r border-slate-300 uppercase">Secretaria</td>
                        <td className="p-2 border-r border-slate-300 uppercase text-slate-500">Obra Generica</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">100.000,00</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">52.333,00</td>
                        <td className="p-2 text-right font-black text-blue-900 bg-slate-50">152.333,00</td>
                      </tr>
                      {reportData.map(row => (
                          <tr key={row.idnf} className="hover:bg-blue-50/50 italic font-bold h-12">
                              <td className="p-2 border-r border-slate-300 text-center">{row.idnf}</td>
                              <td className="p-2 border-r border-slate-300 font-mono">{row.admissionDate.split('-').reverse().join('-')}</td>
                              <td className="p-2 border-r border-slate-300 font-mono">{row.antiquity}</td>
                              <td className="p-2 border-r border-slate-300 uppercase truncate max-w-[200px]">{row.name}</td>
                              <td className="p-2 border-r border-slate-300 uppercase">{row.profession}</td>
                              <td className="p-2 border-r border-slate-300 uppercase text-slate-500">{row.workplace}</td>
                              <td className="p-2 border-r border-slate-300 text-right font-mono">{formatCurrency(row.base).replace('Kz','')}</td>
                              <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-400">{formatCurrency(row.helps).replace('Kz','')}</td>
                              <td className="p-2 text-right font-black text-blue-900 bg-slate-50">{formatCurrency(row.total).replace('Kz','')}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="bg-slate-50 p-8 border-2 border-slate-900 grid grid-cols-2 gap-12 rounded-3xl">
              <div className="space-y-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-800 rounded-lg"><Calculator size={20}/></div>
                      <h4 className="font-black text-sm uppercase tracking-tighter italic">Resumo de Totais do Exercício</h4>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Global de Vínculos</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-black">
                          <CheckCircle size={14}/> Sincronizado com Processamento
                      </div>
                  </div>
              </div>
              <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center gap-8 border-b-2 border-slate-200 pb-2">
                      <span className="text-xs font-black uppercase text-slate-500 italic">Total de Vencimentos</span>
                      <span className="text-xl font-black text-slate-900 font-mono">172.455,00 akz</span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                      <span className="text-xs font-black uppercase text-slate-500 italic">Total de Trabalhadores Activos</span>
                      <span className="text-2xl font-black text-blue-700">1</span>
                  </div>
              </div>
          </div>

          <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center text-[8px] text-slate-400 font-mono italic uppercase tracking-widest">
              <div>ERP IMATEC SOFTWARE V.2.0 • Sistema de Auditoria Interna Ativo</div>
              <div className="text-right">Processado por computador • {new Date().toLocaleTimeString()}</div>
          </div>
      </div>
    </div>
  );
};

export default SalaryListReport;