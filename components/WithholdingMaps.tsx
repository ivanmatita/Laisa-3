
import React from 'react';
import { ViewState } from '../types';
import { Landmark, FileDown, FileUp, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

interface WithholdingMapsProps {
  onChangeView: (view: ViewState) => void;
}

const WithholdingMaps: React.FC<WithholdingMapsProps> = ({ onChangeView }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mapas de Retenção na Fonte</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Controlo de impostos retidos conforme legislação angolana</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
            <button 
                onClick={() => onChangeView('ACCOUNTING_WITHHOLDING_RECEIVABLE')}
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-blue-200 hover:bg-blue-100"
            >
                Retenção a Receber
            </button>
            <button 
                onClick={() => onChangeView('ACCOUNTING_WITHHOLDING_PAYABLE')}
                className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-orange-200 hover:bg-orange-100"
            >
                Retenção a Pagar
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onClick={() => onChangeView('ACCOUNTING_WITHHOLDING_RECEIVABLE')}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100 hover:border-blue-600 transition-all group flex flex-col items-center gap-6 text-center"
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
            <FileDown size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">Retenção na Fonte a Receber</h3>
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
            Aceder <ChevronRight size={16} />
          </div>
        </button>

        <button 
          onClick={() => onChangeView('ACCOUNTING_WITHHOLDING_PAYABLE')}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100 hover:border-orange-600 transition-all group flex flex-col items-center gap-6 text-center"
        >
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-inner">
            <FileUp size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">Retenção na Fonte a Pagar</h3>
          </div>
          <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest">
            Aceder <ChevronRight size={16} />
          </div>
        </button>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={120}/></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl">
             <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Conformidade Fiscal</h2>
             <p className="text-slate-400 leading-relaxed font-medium">
               Os mapas de retenção são gerados automaticamente com base no processamento de faturas e compras no sistema, garantindo a exatidão dos valores para a submissão no Portal do Contribuinte.
             </p>
          </div>
          <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Status do Módulo</span>
            <span className="text-sm font-black text-white uppercase flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400"/> Integrado à Cloud
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithholdingMaps;
