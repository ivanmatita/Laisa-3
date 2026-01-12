
import React from 'react';
import { TransferOrder, Company } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadPDF } from '../utils/exportUtils';
// Fix: Added Info icon to the lucide-react imports.
import { Printer, Download, ArrowLeft, Landmark, FileText, PieChart, Info } from 'lucide-react';

interface TransferOrderReportProps {
  order: TransferOrder;
  company: Company;
  onBack: () => void;
}

const TransferOrderReport: React.FC<TransferOrderReportProps> = ({ order, company, onBack }) => {
  const f = (v: number) => formatCurrency(v).replace('Kz', '').trim();

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-3 py-1.5 rounded-lg border transition-colors">
                <ArrowLeft size={16}/> Voltar
            </button>
            <div className="flex gap-2">
                <button onClick={() => downloadPDF('transfer-report-area', `Ordem_Transferencia_${order.reference.replace(/\//g,'_')}.pdf`)} className="p-2 bg-slate-100 rounded-lg text-slate-600 border hover:bg-slate-200"><Download size={18}/></button>
                <button onClick={() => printDocument('transfer-report-area')} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-black shadow shadow-slate-200"><Printer size={18}/></button>
            </div>
        </div>

        <div className="bg-white p-12 border border-slate-300 shadow-2xl min-h-[800px] flex flex-col relative" id="transfer-report-area">
            <div className="mb-16">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">ORDEM TRANSFERÊNCIA</h1>
                    <div className="text-right text-xs font-bold space-y-2">
                        <div className="flex justify-end gap-2 text-blue-800"><span>N/ Ref Nº :</span> <span className="font-black">{order.reference}</span></div>
                        <div className="flex justify-end gap-2"><span>Data Emissão :</span> <span className="font-black">{formatDate(order.date).replace(/ /g, '-')}</span></div>
                        <div className="flex justify-end gap-2"><span>Período Processado :</span> <span className="font-black uppercase">{order.period || '---'}</span></div>
                        <div className="flex justify-end gap-2"><span>Terminal de Saída :</span> <span className="font-black uppercase">{order.cashRegisterId || 'Caixa Geral'}</span></div>
                        <div className="flex justify-end gap-2 border-t-2 border-slate-800 pt-1"><span>Total Líquido :</span> <span className="font-black text-sm">{formatCurrency(order.totalAmount)}</span></div>
                    </div>
                </div>
                <div className="mt-8 text-lg font-black text-slate-800 ml-48 uppercase underline italic">À Direcção Financeira</div>
                <div className="w-full border-b-4 border-slate-900 mt-12"></div>
            </div>

            <div className="flex-1 space-y-12">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <Info size={24} className="text-blue-600"/>
                    <p className="text-[10px] font-bold text-slate-600 uppercase leading-relaxed italic">
                        Confirmamos a saída de caixa global para o pagamento de salários. Abaixo segue a discriminação individual por colaborador para crédito bancário via IBAN.
                    </p>
                </div>

                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest text-center">
                            <th className="p-2 border-r border-white/20">Item</th>
                            <th className="p-2 border-r border-white/20 text-left">Beneficiário / Coordenadas</th>
                            <th className="p-2 border-r border-white/20 text-right">Vct Bruto</th>
                            <th className="p-2 border-r border-white/20 text-right">Descontos</th>
                            <th className="p-2 text-right">Líquido a Receber</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, idx) => (
                            <tr key={idx} className="border-b-2 border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 text-center border-r border-slate-100 font-black text-slate-400">
                                    {idx + 1}
                                </td>
                                <td className="py-4 px-4 align-top border-r border-slate-100">
                                    <div className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-1">
                                        <span className="font-bold text-slate-500 uppercase text-[9px]">IDNF:</span> <span className="font-black text-blue-900">{item.idnf || '---'}</span>
                                        <span className="font-bold text-slate-500 uppercase text-[9px]">Nome:</span> <span className="font-black uppercase">{item.employeeName}</span>
                                        <span className="font-bold text-slate-500 uppercase text-[9px]">Banco:</span> <span className="font-bold text-slate-600">{item.bankName}</span>
                                        <span className="font-bold text-slate-500 uppercase text-[9px]">Iban:</span> <span className="font-mono font-bold text-blue-700">{item.iban}</span>
                                    </div>
                                    <div className="mt-2 italic text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded border border-dashed">
                                        Obs: {item.description}
                                    </div>
                                </td>
                                <td className="p-4 text-right border-r border-slate-100 align-top font-mono font-bold text-slate-500">
                                    {f(item.grossAmount || item.amount)}
                                </td>
                                <td className="p-4 text-right border-r border-slate-100 align-top font-mono font-bold text-red-500">
                                    -{f(item.discounts || 0)}
                                </td>
                                <td className="p-4 text-right align-top">
                                    <div className="bg-slate-900 text-white p-2 rounded-lg font-black text-sm font-mono text-center">
                                        {f(item.amount)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-4 border-slate-900 bg-slate-100 font-black text-sm">
                        <tr>
                            <td colSpan={4} className="p-4 text-right uppercase tracking-[3px] border-r border-slate-200">Total Acumulado na Ordem</td>
                            <td className="p-4 text-right font-mono text-blue-900 text-lg underline">{f(order.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-24 pt-8 flex justify-between items-end border-t-2 border-slate-100">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 border-2 border-slate-900 p-1">
                        {/* QR Code integration placeholder */}
                        <div className="bg-slate-100 w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">QR Cloud</div>
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase italic">Digital Signature V2.0</span>
                </div>
                <div className="flex-1 flex justify-center gap-24">
                    <div className="text-center w-64 border-t-2 border-slate-800 pt-2 font-black text-[9px] uppercase">O Processador (RH)</div>
                    <div className="text-center w-64 border-t-2 border-slate-800 pt-2 font-black text-[9px] uppercase">Aprovado por (Direcção)</div>
                </div>
            </div>

            <div className="mt-12 flex justify-center text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">
                Software Certificado AGT nº 25/2019 • Licenciado para IMATEC SOFTWARE
            </div>
        </div>
      </div>
    </div>
  );
};

export default TransferOrderReport;
