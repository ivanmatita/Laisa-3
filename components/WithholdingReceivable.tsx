import React, { useState, useMemo } from 'react';
import { Invoice, Company, InvoiceType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadPDF, downloadExcel } from '../utils/exportUtils';
import { 
  ArrowLeft, Printer, Download, FileSpreadsheet, 
  Calendar, Landmark, Calculator, Info, ShieldCheck, ChevronDown, Search, Filter
} from 'lucide-react';

interface WithholdingReceivableProps {
  invoices: Invoice[];
  company: Company;
  onBack: () => void;
}

const WithholdingReceivable: React.FC<WithholdingReceivableProps> = ({ invoices, company, onBack }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const data = useMemo(() => {
    return invoices.filter(inv => {
      const d = new Date(inv.date);
      const isPeriod = d.getFullYear() === year && (d.getMonth() + 1) === month;
      const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inv.number.toLowerCase().includes(searchTerm.toLowerCase());
      return isPeriod && inv.isCertified && (inv.withholdingAmount || 0) > 0 && matchesSearch;
    }).map((inv, idx) => ({
      no: idx + 1,
      client: inv.clientName,
      date: inv.date,
      docNo: inv.number,
      type: inv.type,
      rate: '6.5%',
      base: inv.subtotal,
      creditNote: 0,
      withheld: inv.withholdingAmount || 0
    }));
  }, [invoices, year, month, searchTerm]);

  const totalWithheld = data.reduce((acc, curr) => acc + curr.withheld, 0);

  return (
    <div className="p-6 space-y-6 animate-in fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-3 py-1.5 rounded-lg border transition-colors">
          <ArrowLeft size={16}/> Voltar
        </button>
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                <input 
                    className="pl-9 p-2 border-2 border-slate-100 rounded-xl text-xs font-bold w-64 outline-none focus:border-blue-500" 
                    placeholder="Pesquisar cliente ou doc..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select className="border-2 border-slate-100 p-2 rounded-xl font-bold bg-slate-50 text-xs" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m.toUpperCase()}</option>)}
            </select>
            <select className="border-2 border-slate-100 p-2 rounded-xl font-bold bg-slate-50 text-xs" value={year} onChange={e => setYear(Number(e.target.value))}>
                <option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option>
            </select>
            <button onClick={() => downloadExcel("receivable-withholding-table", `Retencoes_Receber_${year}_${month}`)} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow shadow-emerald-200"><FileSpreadsheet size={18}/></button>
            <button onClick={() => downloadPDF("receivable-report", `Retencoes_Receber_${year}_${month}.pdf`)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow shadow-red-200"><Download size={18}/></button>
            <button onClick={() => printDocument("receivable-report")} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-black shadow shadow-slate-200"><Printer size={18}/></button>
        </div>
      </div>

      <div className="bg-white p-12 border-2 border-slate-400 shadow-2xl min-h-[1100px] flex flex-col font-sans text-slate-900" id="receivable-report">
        <div className="border-2 border-slate-800 mb-8 overflow-hidden">
            <div className="grid grid-cols-[200px_1fr_200px] border-b-2 border-slate-800 h-24">
                <div className="p-4 flex flex-col items-center justify-center border-r-2 border-slate-800 bg-slate-50">
                    <Calculator className="text-blue-500 mb-1" size={24}/>
                    <div className="text-[8px] font-black text-slate-500 uppercase">Powered By IMATEC</div>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                    <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Retenções na Fonte</h1>
                    <h2 className="text-lg font-black text-blue-600 uppercase tracking-tighter">A Receber de Clientes</h2>
                </div>
                <div className="p-4 flex items-center justify-center bg-slate-50 border-l-2 border-slate-800 italic font-serif font-black text-3xl text-blue-900 opacity-20">IVA</div>
            </div>

            <div className="grid grid-cols-[1fr_2fr_2fr] border-b-2 border-slate-800 h-16 text-[9px] font-black">
                <div className="border-r-2 border-slate-800">
                    <div className="bg-blue-900 text-white px-2 py-0.5">01- REGIME DO IVA</div>
                    <div className="p-2 space-y-1">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 border border-black flex items-center justify-center text-[7px]">{company.regime === 'Regime Geral' ? 'X' : ''}</div> REGIME GERAL</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 border border-black flex items-center justify-center text-[7px]">{company.cashVAT ? 'X' : ''}</div> REGIME DE CAIXA</div>
                    </div>
                </div>
                <div className="border-r-2 border-slate-800">
                    <div className="bg-blue-900 text-white px-2 py-0.5">02- PERIODO DA DECLARAÇÃO</div>
                    <div className="p-2 flex gap-8 items-end">
                        <div>
                           <span className="text-slate-400 block mb-0.5">Ano:</span>
                           <div className="flex gap-1">
                               {String(year).split('').map((c, i) => <div key={i} className="w-5 h-6 border border-black flex items-center justify-center text-xs">{c}</div>)}
                           </div>
                        </div>
                        <div>
                           <span className="text-slate-400 block mb-0.5">Mês:</span>
                           <div className="flex gap-1">
                               {String(month).padStart(2,'0').split('').map((c, i) => <div key={i} className="w-5 h-6 border border-black flex items-center justify-center text-xs">{c}</div>)}
                           </div>
                        </div>
                        <div className="text-[8px] text-slate-500 italic pb-0.5">({months[month-1]} por extenso)</div>
                    </div>
                </div>
                <div>
                    <div className="bg-blue-900 text-white px-2 py-0.5">03- NÚMERO DE IDENTIFICAÇÃO FISCAL</div>
                    <div className="p-2 flex items-center justify-center h-full pb-4">
                        <div className="flex gap-0.5">
                            {company.nif.split('').map((c, i) => <div key={i} className="w-5 h-7 border border-black flex items-center justify-center text-xs font-mono">{c}</div>)}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="bg-blue-900 text-white px-2 py-0.5 text-[9px] font-black">04- IDENTIFICAÇÃO DO CONTRIBUINTE</div>
                <div className="p-3 flex gap-4 items-end">
                    <span className="text-[9px] font-black text-orange-600 uppercase whitespace-nowrap">1 - NOME OU DESIGNAÇÃO SOCIAL:</span>
                    <div className="flex-1 border-b border-slate-300 font-black text-sm uppercase italic">{company.name}</div>
                </div>
            </div>
        </div>

        <div className="border-2 border-slate-800">
            <div className="bg-blue-900 text-white px-2 py-0.5 text-[9px] font-black uppercase">9 - Retenções na Fonte a Receber</div>
            <table className="w-full text-left border-collapse text-[10px]" id="receivable-withholding-table">
                <thead className="bg-white">
                    <tr className="border-b border-slate-300 font-black uppercase text-center italic">
                        <th className="p-2 border-r border-slate-300 w-10">Nº</th>
                        <th className="p-2 border-r border-slate-300">Cliente</th>
                        <th className="p-2 border-r border-slate-300 w-24">Data Doc</th>
                        <th className="p-2 border-r border-slate-300 w-32">Doc Nº</th>
                        <th className="p-2 border-r border-slate-300 w-16">Tipo</th>
                        <th className="p-2 border-r border-slate-300 w-12">Taxa</th>
                        <th className="p-2 border-r border-slate-300 w-32">Imposto Base</th>
                        <th className="p-2 border-r border-slate-300 w-32">Nota Crédito</th>
                        <th className="p-2 w-32">IMP A RECEBER</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map(row => (
                        <tr key={row.no} className="hover:bg-blue-50/50 italic text-center font-bold">
                            <td className="p-2 border-r border-slate-300">{row.no}</td>
                            <td className="p-2 border-r border-slate-300 text-left uppercase truncate max-w-[200px]">{row.client}</td>
                            <td className="p-2 border-r border-slate-300 font-mono">{formatDate(row.date)}</td>
                            <td className="p-2 border-r border-slate-300 font-mono text-blue-700">{row.docNo}</td>
                            <td className="p-2 border-r border-slate-300">{row.type.substring(0,2).toUpperCase()}</td>
                            <td className="p-2 border-r border-slate-300">{row.rate}</td>
                            <td className="p-2 border-r border-slate-300 text-right pr-4">{formatCurrency(row.base).replace('Kz','')}</td>
                            <td className="p-2 border-r border-slate-300 text-right pr-4 text-red-500">0,00</td>
                            <td className="p-2 text-right pr-4 font-black">{formatCurrency(row.withheld).replace('Kz','')}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                         <tr className="italic h-12 opacity-30"><td colSpan={9} className="p-4 text-center text-slate-400 uppercase tracking-widest">Sem movimentos de retenção no período</td></tr>
                    )}
                </tbody>
                <tfoot className="border-t-2 border-slate-800 bg-slate-50 font-black text-[11px]">
                    <tr className="italic">
                        <td colSpan={8} className="p-2 text-right uppercase border-r border-slate-300">Valores Totais</td>
                        <td className="p-2 text-right pr-4 text-blue-700 underline">{formatCurrency(totalWithheld).replace('Kz','')}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div className="mt-auto pt-8 border-t-2 border-slate-100 flex justify-between items-end text-[8px] text-slate-400 font-mono italic uppercase tracking-widest">
            <div>Processado por Computador • Software Certificado 25/AGT/2019</div>
            <div className="text-right">Licença ERP IMATEC V.2.0 • {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default WithholdingReceivable;