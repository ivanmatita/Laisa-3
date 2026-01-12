
import React, { useState, useMemo } from 'react';
import { SalarySlip, Employee } from '../types';
import { formatCurrency, exportToExcel, formatDate } from '../utils';
import { Printer, Download, Calendar, Filter, FileJson, FileSpreadsheet, ChevronRight, Square, CheckSquare } from 'lucide-react';

interface SalaryMapProps {
  payroll: SalarySlip[];
  employees: Employee[];
}

const SalaryMap: React.FC<SalaryMapProps> = ({ payroll, employees }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const mapData = useMemo(() => {
    return employees.map((emp, idx) => {
      const slip = payroll.find(p => p.employeeId === emp.id) || {
          employeeId: emp.id,
          employeeName: emp.name,
          baseSalary: emp.baseSalary,
          grossTotal: emp.baseSalary,
          inss: emp.baseSalary * 0.03,
          irt: 0,
          netTotal: emp.baseSalary * 0.97
      } as SalarySlip;

      return {
        id: idx + 1,
        bi: emp.biNumber || '---',
        nif: emp.nif || '---',
        inssNo: emp.ssn || '000000',
        name: emp.name,
        admission: emp.admissionDate,
        termination: emp.terminationDate || '---',
        base: slip.baseSalary,
        inss3: slip.inss,
        irt: slip.irt,
        net: slip.netTotal,
        inss8: slip.baseSalary * 0.08,
        province: emp.province || 'LUANDA'
      };
    });
  }, [employees, payroll]);

  const totals = useMemo(() => {
    return mapData.reduce((acc, curr) => ({
      liquid: acc.liquid + curr.net,
      irt: acc.irt + curr.irt,
      inss: acc.inss + curr.inss3 + curr.inss8
    }), { liquid: 0, irt: 0, inss: 0 });
  }, [mapData]);

  const f = (n: number) => formatCurrency(n).replace('Kz', '').trim();

  return (
    <div className="space-y-6 animate-in fade-in pb-20 font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-end gap-6 print:hidden">
          <div className="flex gap-4">
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Exercício</label>
                  <select className="border-2 border-slate-100 p-2 rounded-xl font-bold bg-slate-50" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                      <option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option>
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mês</label>
                  <select className="border-2 border-slate-100 p-2 rounded-xl font-bold bg-slate-50 min-w-[150px]" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                      {months.map((m, i) => <option key={i} value={i + 1}>{m.toUpperCase()}</option>)}
                  </select>
              </div>
          </div>

          <div className="flex gap-2">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg transition">
                  <FileSpreadsheet size={16}/> Baixar INSS (XLS)
              </button>
              <button className="bg-blue-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg transition">
                  <FileJson size={16}/> Baixar AGT (XML)
              </button>
              <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg transition">
                  <Printer size={16}/> Imprimir
              </button>
          </div>
      </div>

      <div className="bg-white border-2 border-slate-200 shadow-2xl overflow-hidden min-h-[800px] border-collapse">
          <div className="p-8 border-b-2 border-slate-100 flex justify-between items-start">
             <div className="space-y-1 text-[10px] font-bold text-slate-600 uppercase italic">
                <p>Contribuinte N. 004972225NE040</p>
                <p>Numero INSS: 000000</p>
             </div>
             <div className="text-center">
                <h2 className="text-xl font-black uppercase text-slate-800 tracking-tighter border-b-4 border-slate-900 pb-1 italic">MAPA GERAL SALARIOS IRT/INSS</h2>
                <span className="font-black text-sm text-slate-500 uppercase italic">{months[selectedMonth - 1]} de {selectedYear}</span>
             </div>
             <div className="text-right w-40"></div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left text-[9px] border-collapse">
                  <thead>
                      <tr className="bg-slate-50 font-black text-slate-700 text-center border-b-2 border-slate-900 uppercase">
                          <th className="p-2 border-r w-32" rowSpan={2}>No Identificação</th>
                          <th className="p-2 border-r w-12" rowSpan={2}>Exercicio</th>
                          <th className="p-2 border-r w-24">Data Vinculo</th>
                          <th className="p-2 border-r w-24">Vencimento Base</th>
                          <th className="p-2 border-r w-20">Faltas</th>
                          <th className="p-2 border-r w-20">Férias</th>
                          <th className="p-2 border-r w-20">Horas Perdidas</th>
                          <th className="p-2 border-r w-20">Horas Extra</th>
                          <th className="p-2 border-r w-40">Subsídios</th>
                          <th className="p-2 border-r w-24" colSpan={2}>Vencimentos</th>
                          <th className="p-2 border-r w-24" colSpan={3}>Venc tributavel IRT</th>
                          <th className="p-2 border-r w-24" colSpan={3}>Impostos</th>
                          <th className="p-2 w-24" rowSpan={2}>Vencimento Líquido</th>
                      </tr>
                      <tr className="bg-slate-100 text-[8px] uppercase text-slate-500 font-black text-center border-b border-slate-300">
                          <th className="p-1 border-r">Inicio / Fim</th>
                          <th className="p-1 border-r">Dias Base / Vct Base</th>
                          <th className="p-1 border-r">Dias / Valor</th>
                          <th className="p-1 border-r">Dias / Valor</th>
                          <th className="p-1 border-r">Hrs / Valor</th>
                          <th className="p-1 border-r">Hrs / Valor</th>
                          <th className="p-1 border-r">Transp / Alim / Outros</th>
                          <th className="p-1 border-r">Antes Imp.</th>
                          <th className="p-1 border-r">Trib. INSS</th>
                          <th className="p-1 border-r">Isento</th>
                          <th className="p-1 border-r">N/Suj.</th>
                          <th className="p-1 border-r">Sujeito</th>
                          <th className="p-1 border-r">INSS 8%</th>
                          <th className="p-1 border-r">INSS 3%</th>
                          <th className="p-1">IRT</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                      {mapData.map(row => (
                          <tr key={row.id} className="hover:bg-blue-50 transition-colors h-10 italic">
                              <td className="p-2 border-r">
                                  <div className="font-black text-slate-900 uppercase leading-none">{row.name}</div>
                                  <div className="text-[7px] text-slate-400 font-mono">BI: {row.bi} • INSS: {row.inssNo}</div>
                              </td>
                              <td className="p-2 border-r text-center font-bold text-slate-500">{selectedYear}</td>
                              <td className="p-2 border-r text-center text-slate-500 text-[8px]">
                                  {formatDate(row.admission)}<br/>{row.termination}
                              </td>
                              <td className="p-2 border-r text-right font-mono font-bold text-slate-800">
                                  <div className="flex justify-between"><span>30</span><span>{f(row.base)}</span></div>
                              </td>
                              <td className="p-2 border-r text-right text-slate-400">0 / 0,00</td>
                              <td className="p-2 border-r text-right text-slate-400">0 / 0,00</td>
                              <td className="p-2 border-r text-right text-slate-400">0 / 0,00</td>
                              <td className="p-2 border-r text-right text-slate-400">0 / 0,00</td>
                              <td className="p-2 border-r text-right text-slate-500 text-[7px] flex justify-between">
                                  <span>0,00</span><span>0,00</span><span>0,00</span>
                              </td>
                              <td className="p-2 border-r text-right font-bold text-slate-800">{f(row.base)}</td>
                              <td className="p-2 border-r text-right font-bold text-slate-800">{f(row.base)}</td>
                              <td className="p-2 border-r text-right text-slate-400">0,00</td>
                              <td className="p-2 border-r text-right text-slate-400">0,00</td>
                              <td className="p-2 border-r text-right text-slate-800">{f(row.base - row.inss3)}</td>
                              <td className="p-2 border-r text-right text-slate-400 italic">{f(row.inss8)}</td>
                              <td className="p-2 border-r text-right text-red-600 font-bold">{f(row.inss3)}</td>
                              <td className="p-2 border-r text-right text-red-600 font-bold">{f(row.irt)}</td>
                              <td className="p-2 text-right font-black text-slate-900 bg-slate-50/50">{f(row.net)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="p-10 border-t-2 border-slate-900 bg-slate-50 grid grid-cols-2 gap-12">
             <div className="space-y-6">
                <p className="text-slate-400 uppercase text-[10px] font-black italic">Valores Totais mensais</p>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Square className="text-slate-400" size={16} />
                        <span className="font-black uppercase text-xs text-slate-700 italic">Anexo Guias de Pagamento</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Square className="text-slate-400" size={16} />
                        <span className="font-black uppercase text-xs text-slate-700 italic">Anexo Comprovativos Pagamento</span>
                    </div>
                </div>
             </div>

             <div className="space-y-2 border-l-4 border-slate-900 pl-8 text-right font-black italic">
                 <div className="flex justify-end gap-16 text-sm uppercase text-slate-800 border-b pb-1">
                    <span>Total Salários a Liquidar</span>
                    <span>{f(totals.liquid)} akz</span>
                 </div>
                 <div className="flex justify-end gap-16 text-sm uppercase text-slate-600 border-b pb-1">
                    <span>Total Imposto IRT a pagar</span>
                    <span>{f(totals.irt)} akz</span>
                 </div>
                 <div className="flex justify-end gap-16 text-sm uppercase text-slate-600">
                    <span>Total Imposto INSS a pagar</span>
                    <span>{f(totals.inss)} akz</span>
                 </div>
             </div>
          </div>

          <div className="mt-8 p-4 text-[8px] text-slate-400 text-right font-mono uppercase tracking-widest italic border-t">
              Processado por programa certificado N. 25/AGT/2019 • ERP IMATEC Software V.2.0
          </div>
      </div>
    </div>
  );
};

export default SalaryMap;
