import React from 'react';
import { Employee, Company } from '../types';
import { formatDate } from '../utils';
import { Printer, Download, FileSpreadsheet, Calculator } from 'lucide-react';
import { printDocument, downloadExcel } from '../utils/exportUtils';

interface EffectivenessMapProps {
  employees: Employee[];
  company: Company;
  year: number;
  month: number;
}

const EffectivenessMap: React.FC<EffectivenessMapProps> = ({ employees, company, year, month }) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-end gap-2 print:hidden">
          <button 
            onClick={() => downloadExcel("effectiveness-table", `Mapa_Efetividade_${year}_${month}`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={16}/> Baixar Excel
          </button>
          <button 
            onClick={() => printDocument("effectiveness-report")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs shadow-md hover:bg-black transition"
          >
            <Printer size={16}/> Imprimir PDF
          </button>
      </div>

      <div className="bg-white p-12 border-2 border-slate-300 shadow-2xl min-h-[1100px] flex flex-col font-sans text-slate-900" id="effectiveness-report">
        {/* 01 - IDENTIFICAÇÃO DO CONTRIBUINTE */}
        <div className="mb-10">
          <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 w-fit border-l-8 border-blue-600">
            01 – IDENTIFICAÇÃO DO CONTRIBUINTE
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-slate-100 p-6 rounded-2xl bg-slate-50/50">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresa Licenciada</p>
                <p className="text-lg font-black text-slate-800 uppercase italic leading-tight">IVAN JOSÉ LUCAS MATITA</p>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Número de Identificação Fiscal (NIF)</p>
                <p className="text-lg font-black text-blue-700 font-mono tracking-widest">004972225NE040</p>
             </div>
          </div>
        </div>

        {/* 02 – LISTAGEM DE TRABALHADORES */}
        <div className="flex-1">
          <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 w-fit border-l-8 border-blue-600">
            02 – LISTAGEM DE TRABALHADORES
          </div>
          <div className="overflow-x-auto border-2 border-slate-900 shadow-xl">
            <table className="w-full text-left border-collapse text-[10px]" id="effectiveness-table">
              <thead className="bg-white">
                <tr className="border-b-4 border-slate-900">
                  <th className="p-3 border-r border-slate-300 font-black uppercase italic">Nome do Beneficiário</th>
                  <th className="p-3 border-r border-slate-300 font-black uppercase italic">Profissão</th>
                  <th className="p-3 border-r border-slate-300 font-black uppercase italic">NIF</th>
                  <th className="p-3 border-r border-slate-300 font-black uppercase italic">Nº da INSS</th>
                  <th className="p-3 border-r border-slate-300 text-center font-black uppercase italic bg-slate-50">Indicação dos dias</th>
                  <th className="p-3 border-r border-slate-300 text-center font-black uppercase italic bg-emerald-50 text-emerald-800">Serviço</th>
                  <th className="p-3 border-r border-slate-300 text-center font-black uppercase italic bg-blue-50 text-blue-800">Folga</th>
                  <th className="p-3 border-r border-slate-300 text-center font-black uppercase italic">Justi.</th>
                  <th className="p-3 border-r border-slate-300 text-center font-black uppercase italic text-red-600">Injust.</th>
                  <th className="p-3 border-r border-slate-300 text-center font-black uppercase italic">Férias</th>
                  <th className="p-3 text-center font-black uppercase italic bg-slate-900 text-white">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Linha pontilhada conforme solicitado */}
                <tr className="bg-slate-50 italic">
                  <td className="p-2 border-r border-slate-300 font-black">.</td>
                  <td className="p-2 border-r border-slate-300 font-black">.</td>
                  <td className="p-2 border-r border-slate-300"></td>
                  <td className="p-2 border-r border-slate-300"></td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">0</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">0</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">0</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">0</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">0</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">0</td>
                  <td className="p-2 text-center font-black">0</td>
                </tr>
                {/* Dados dinâmicos seguindo o exemplo */}
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50/50 italic font-bold">
                    <td className="p-2 border-r border-slate-300 uppercase truncate max-w-[200px]">{emp.name}</td>
                    <td className="p-2 border-r border-slate-300 uppercase">{emp.role}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{emp.nif}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{emp.ssn || '00000'}</td>
                    <td className="p-2 border-r border-slate-300 text-center">24</td>
                    <td className="p-2 border-r border-slate-300 text-center text-emerald-700 bg-emerald-50/20">3</td>
                    <td className="p-2 border-r border-slate-300 text-center text-blue-700 bg-blue-50/20">0</td>
                    <td className="p-2 border-r border-slate-300 text-center">0</td>
                    <td className="p-2 border-r border-slate-300 text-center text-red-600">0</td>
                    <td className="p-2 border-r border-slate-300 text-center">0</td>
                    <td className="p-2 text-center font-black text-blue-900 bg-slate-50">27</td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr className="italic font-bold">
                    <td className="p-2 border-r border-slate-300 uppercase">INACIOO</td>
                    <td className="p-2 border-r border-slate-300 uppercase">Secretaria</td>
                    <td className="p-2 border-r border-slate-300 font-mono">0292929922</td>
                    <td className="p-2 border-r border-slate-300 font-mono">00000</td>
                    <td className="p-2 border-r border-slate-300 text-center">24</td>
                    <td className="p-2 border-r border-slate-300 text-center text-emerald-700 bg-emerald-50/20">3</td>
                    <td className="p-2 border-r border-slate-300 text-center text-blue-700 bg-blue-50/20">0</td>
                    <td className="p-2 border-r border-slate-300 text-center">0</td>
                    <td className="p-2 border-r border-slate-300 text-center text-red-600">0</td>
                    <td className="p-2 border-r border-slate-300 text-center">0</td>
                    <td className="p-2 text-center font-black text-blue-900 bg-slate-50">27</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-end text-[9px] text-slate-400 font-mono italic uppercase tracking-widest">
            <div>
              <p>Relatório emitido em: {new Date().toLocaleString()}</p>
              <p>Período: {months[month-1]} {year}</p>
            </div>
            <div className="text-right">
              <p>Licença ERP IMATEC V.2.0</p>
              <p>Processado por Computador • Software Certificado 25/AGT/2019</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EffectivenessMap;