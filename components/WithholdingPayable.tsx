
import React, { useState, useMemo } from 'react';
import { Purchase, Company, PurchaseType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadPDF, downloadExcel } from '../utils/exportUtils';
import { 
  ArrowLeft, Printer, Download, FileSpreadsheet, 
  Calendar, Building2, Calculator, Info, ChevronDown, Search
} from 'lucide-react';

interface WithholdingPayableProps {
  purchases: Purchase[];
  company: Company;
  onBack: () => void;
}

const WithholdingPayable: React.FC<WithholdingPayableProps> = ({ purchases, company, onBack }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const data = useMemo(() => {
    return purchases.filter(pur => {
      const d = new Date(pur.date);
      const isPeriod = d.getFullYear() === year && (d.getMonth() + 1) === month;
      const matchesSearch = pur.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            pur.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return isPeriod && pur.status === 'PAID' && (pur.items.some(it => (it.withholdingAmount || 0) > 0)) && matchesSearch;
    }).flatMap(pur => pur.items.filter(it => (it.withholdingAmount || 0) > 0).map((it, idx) => ({
      no: idx + 1,
      nifAO: company.nif.substring(0, 9),
      nif: pur.nif,
      prestador: pur.supplier,
      conformidade: '(a)',
      petrolifero: '(b)',
      docNo: pur.documentNumber,
      dateEmit: pur.date,
      datePay: pur.date, 
      total: pur.total,
      paid: pur.total,
      subject: it.total,
      rate: `${it.withholdingRate || 6.5}%`,
      withheld: it.withholdingAmount || 0
    })));
  }, [purchases, year, month, company, searchTerm]);

  const totals = useMemo(() => {
    return data.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      paid: acc.paid + curr.paid,
      subject: acc.subject + curr.subject,
      withheld: acc.withheld + curr.withheld
    }), { total: 0, paid: 0, subject: 0, withheld: 0 });
  }, [data]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold px-3 py-1.5 rounded-lg border transition-colors">
          <ArrowLeft size={16}/> Voltar
        </button>
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                <input 
                    className="pl-9 p-2 border-2 border-slate-100 rounded-xl text-xs font-bold w-64 outline-none focus:border-orange-500" 
                    placeholder="Pesquisar fornecedor ou doc..."
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
            <button onClick={() => downloadExcel("payable-withholding-table", `Retencoes_Pagar_${year}_${month}`)} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow shadow-emerald-200"><FileSpreadsheet size={18}/></button>
            <button onClick={() => downloadPDF("payable-report", `Retencoes_Pagar_${year}_${month}.pdf`)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow shadow-red-200"><Download size={18}/></button>
            <button onClick={() => printDocument("payable-report")} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-black shadow shadow-slate-200"><Printer size={18}/></button>
        </div>
      </div>

      <div className="bg-white p-12 border-2 border-slate-400 shadow-2xl min-h-[1100px] flex flex-col font-sans text-slate-900" id="payable-report">
        <div className="mb-8">
            <div className="bg-blue-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 w-fit border-l-8 border-blue-600">
                01- IDENTIFICAÇÃO DO CONTRIBUINTE
            </div>
            <div className="space-y-1 p-4 border border-slate-100 rounded-xl bg-slate-50 font-bold uppercase text-[10px]">
                <p>EMPRESA: <span className="font-black italic text-slate-800">{company.name}</span></p>
                <p>NIF: <span className="font-black italic text-blue-700">{company.nif}</span></p>
            </div>
        </div>

        <div className="flex-1">
            <div className="bg-blue-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 w-fit border-l-8 border-blue-600">
                2 - LISTAGEM DE RETENÇÃO A FORNECEDORES
            </div>
            <div className="overflow-x-auto border-2 border-slate-900">
                <table className="w-full text-left border-collapse text-[9px]" id="payable-withholding-table">
                    <thead className="bg-white">
                        <tr className="border-b-2 border-slate-900 text-center font-black uppercase italic">
                            <th className="p-2 border-r border-slate-300 w-8" rowSpan={2}>Nº</th>
                            <th className="p-2 border-r border-slate-300 w-20" rowSpan={2}>NIF<br/>AO</th>
                            <th className="p-2 border-r border-slate-300 w-24" rowSpan={2}>NIF</th>
                            <th className="p-2 border-r border-slate-300" rowSpan={2}>Prestador</th>
                            <th className="p-2 border-r border-slate-300 w-12" rowSpan={2}>(a)</th>
                            <th className="p-2 border-r border-slate-300 w-12" rowSpan={2}>(b)</th>
                            <th className="p-2 border-b-2 border-slate-900" colSpan={7}>Dados da factura</th>
                        </tr>
                        <tr className="border-b-2 border-slate-900 text-center font-black uppercase italic">
                            <th className="p-1 border-r border-slate-300 w-12">Nº</th>
                            <th className="p-1 border-r border-slate-300 w-20">Data Emissão</th>
                            <th className="p-1 border-r border-slate-300 w-20">Data Pagamento</th>
                            <th className="p-1 border-r border-slate-300 w-24">Valor Total</th>
                            <th className="p-1 border-r border-slate-300 w-24">Valor Pago</th>
                            <th className="p-1 border-r border-slate-300 w-24">Valor Sujeito</th>
                            <th className="p-1 border-r border-slate-300 w-12">Taxa</th>
                            <th className="p-1">Imposto Retido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.map(row => (
                            <tr key={row.no} className="hover:bg-blue-50/50 italic text-center font-bold">
                                <td className="p-2 border-r border-slate-300">{row.no}</td>
                                <td className="p-2 border-r border-slate-300 font-mono">{row.nifAO}</td>
                                <td className="p-2 border-r border-slate-300 font-mono">{row.nif}</td>
                                <td className="p-2 border-r border-slate-300 text-left uppercase truncate max-w-[150px]">{row.prestador}</td>
                                <td className="p-2 border-r border-slate-300">{row.conformidade}</td>
                                <td className="p-2 border-r border-slate-300">{row.petrolifero}</td>
                                <td className="p-2 border-r border-slate-300 font-mono">{row.no}</td>
                                <td className="p-2 border-r border-slate-300 font-mono">{formatDate(row.dateEmit)}</td>
                                <td className="p-2 border-r border-slate-300 font-mono">{formatDate(row.datePay)}</td>
                                <td className="p-2 border-r border-slate-300 text-right pr-2">{formatCurrency(row.total).replace('Kz','')}</td>
                                <td className="p-2 border-r border-slate-300 text-right pr-2">{formatCurrency(row.paid).replace('Kz','')}</td>
                                <td className="p-2 border-r border-slate-300 text-right pr-2">{formatCurrency(row.subject).replace('Kz','')}</td>
                                <td className="p-2 border-r border-slate-300">{row.rate}</td>
                                <td className="p-2 text-right pr-2 font-black text-blue-900">{formatCurrency(row.withheld).replace('Kz','')}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                             <tr className="italic h-12 opacity-30"><td colSpan={14} className="p-4 text-center text-slate-400 uppercase tracking-widest">Sem registos de retenção a fornecedores</td></tr>
                        )}
                    </tbody>
                    <tfoot className="border-t-4 border-slate-900 bg-slate-50 font-black text-[10px]">
                        <tr className="italic">
                            <td colSpan={6} className="p-2 text-right uppercase border-r border-slate-300">Totais Acumulados</td>
                            <td className="border-r border-slate-300"></td>
                            <td className="border-r border-slate-300"></td>
                            <td className="border-r border-slate-300"></td>
                            <td className="p-2 border-r border-slate-300 text-right pr-2">{formatCurrency(totals.total).replace('Kz','')}</td>
                            <td className="p-2 border-r border-slate-300 text-right pr-2">{formatCurrency(totals.paid).replace('Kz','')}</td>
                            <td className="p-2 border-r border-slate-300 text-right pr-2">{formatCurrency(totals.subject).replace('Kz','')}</td>
                            <td className="border-r border-slate-300"></td>
                            <td className="p-2 text-right pr-2 text-blue-900 underline">{formatCurrency(totals.withheld).replace('Kz','')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div className="mt-8 text-[9px] font-bold text-slate-500 uppercase italic space-y-1">
                <p>(a) Nº da Declaração de Conformidade</p>
                <p>(b) Sector Petrolífero</p>
            </div>
        </div>

        <div className="mt-auto pt-8 border-t-2 border-slate-100 flex justify-between items-end text-[8px] text-slate-400 font-mono italic uppercase tracking-widest">
            <div>Ficheiro Retenção Cloud • Software Certificado 25/AGT/2019</div>
            <div className="text-right">ERP IMATEC Software V.2.0 • {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default WithholdingPayable;
