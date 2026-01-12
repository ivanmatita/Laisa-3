
import React, { useState, useEffect } from 'react';
import { TaxRate } from '../types';
import { formatDate, generateId } from '../utils';
import { supabase } from '../services/supabaseClient';
import { 
  X, Save, Plus, Search, RefreshCw, Loader2, Scale, 
  ChevronDown, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface TaxTableProps {
  onClose: () => void;
  onTaxRatesUpdate: (rates: TaxRate[]) => void;
}

const TaxTable: React.FC<TaxTableProps> = ({ onClose, onTaxRatesUpdate }) => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<TaxRate>>({
      description: '', percentage: 14, type: 'IVA', region: 'N/A', code: 'NOR', exemptionCode: '', exemptionReason: '', isActive: true
  });

  useEffect(() => { fetchTaxRates(); }, []);

  async function fetchTaxRates() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('tax_rates')
        .select('id, nome, tipo, percentagem, codigo_fiscal, descricao, created_at')
        .order('created_at', { ascending: false });
        
      if (fetchErr) throw fetchErr;
      if (data) {
        const mapped: TaxRate[] = data.map(t => ({
          id: t.id, 
          name: t.nome || 'IVA', 
          percentage: Number(t.percentagem), 
          type: (t.tipo || 'IVA') as any, 
          region: 'N/A', 
          code: t.codigo_fiscal || 'OUT', 
          description: t.descricao || '', 
          exemptionCode: '', 
          exemptionReason: t.descricao || '', 
          startDate: t.created_at, 
          isActive: true
        }));
        setTaxRates(mapped);
        onTaxRatesUpdate(mapped);
      }
    } catch (err: any) { 
        console.error("Erro taxas:", err.message); 
        setError("Aviso: Cloud indisponível, dados locais ativos.");
    } finally { setIsLoading(false); }
  }

  const handleSave = async (payloadOverride?: any) => {
    setIsSaving(true);
    try {
      let dataToSave;
      if (payloadOverride) {
          dataToSave = payloadOverride;
      } else {
          dataToSave = {
            nome: formData.description || 'IVA',
            tipo: formData.type || 'IVA',
            percentagem: Number(formData.percentage),
            codigo_fiscal: formData.code || 'OUT',
            descricao: formData.exemptionReason || '',
            empresa_id: '00000000-0000-0000-0000-000000000001'
          };
      }
      
      const { error: saveErr } = await supabase.from('tax_rates').insert(dataToSave);
      if (saveErr) throw saveErr;
      
      await fetchTaxRates();
      setShowForm(false);
      alert("Taxa guardada com sucesso na Cloud!");
    } catch (err: any) { 
        console.error("Erro ao salvar taxa:", err.message);
        alert("Falha ao salvar na Cloud. Verifique a ligação.");
        
        // Fallback local
        const localNew: TaxRate = {
            id: generateId(),
            name: formData.description || 'IVA',
            percentage: Number(formData.percentage),
            type: (formData.type || 'IVA') as any,
            region: 'N/A',
            code: formData.code || 'OUT',
            description: formData.exemptionReason || '',
            startDate: new Date().toISOString(),
            isActive: true
        };
        const updatedList = [localNew, ...taxRates];
        setTaxRates(updatedList);
        onTaxRatesUpdate(updatedList);
    } finally { setIsSaving(false); }
  };

  const handleImport = async (type: string) => {
      let imp: any = { empresa_id: '00000000-0000-0000-0000-000000000001' };
      
      if (type === 'TRANS') imp = { ...imp, nome: 'IVA - Regime Transitório', percentagem: 0, tipo: 'IVA', codigo_fiscal: 'ISE', descricao: 'Regime Transitório' };
      if (type === 'NOR14') imp = { ...imp, nome: 'IVA Normal 14%', percentagem: 14, tipo: 'IVA', codigo_fiscal: 'NOR', descricao: 'Normal 14%' };
      if (type === 'NSUJ') imp = { ...imp, nome: 'IVA - Regime de Não Sujeição', percentagem: 0, tipo: 'IVA', codigo_fiscal: 'ISE', descricao: 'Regime de Não Sujeição' };
      if (type === 'SIMP') imp = { ...imp, nome: 'IVA - Regime Simplificado', percentagem: 0, tipo: 'IVA', codigo_fiscal: 'OUT', descricao: 'Regime Simplificado' };
      if (type === 'EXCL') imp = { ...imp, nome: 'IVA - Regime de Exclusão', percentagem: 0, tipo: 'IVA', codigo_fiscal: 'OUT', descricao: 'Regime de Exclusão' };
      if (type === '7PER') imp = { ...imp, nome: 'IVA - 7%', percentagem: 7, tipo: 'IVA', codigo_fiscal: 'OUT', descricao: 'Taxa 7%' };
      if (type === 'ISE12A') imp = { ...imp, nome: 'IVA Isento Artigo 12.º a) do CIVA', percentagem: 0, tipo: 'IVA', codigo_fiscal: 'ISE', descricao: 'Isento nos termos da alínea a) do nº1 do artigo 12.º do CIVA' };
      if (type === 'IS16') imp = { ...imp, nome: 'IS Verba 16.1.4', percentagem: 0.1, tipo: 'IS', codigo_fiscal: 'OUT', descricao: 'Imposto Selo 0.1%' };

      if (imp.nome) {
          await handleSave(imp);
      }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in font-sans border border-slate-300 rounded shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-b from-gray-100 to-gray-300 p-2 border-b-2 border-gray-500 flex justify-between items-center px-4">
             <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Scale size={16} className="text-gray-600"/> Tax Table
             </h2>
             <div className="flex gap-4 items-center">
                 <button className="text-[10px] font-black uppercase text-gray-700 hover:text-blue-700">Menu</button>
                 <button onClick={onClose} className="text-[10px] font-black uppercase text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-all">Fechar</button>
             </div>
        </div>

        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 border-b gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                 <label className="text-[11px] font-black text-gray-700 uppercase">Importar Taxa:</label>
                 <div className="relative flex-1 md:w-80">
                    <select className="w-full border-2 border-gray-300 rounded p-1.5 text-[11px] bg-white font-bold outline-none cursor-pointer focus:border-blue-500" onChange={(e) => handleImport(e.target.value)} value="">
                        <option value="">Selecionar Taxa Pré-definida...</option>
                        <option value="TRANS">IVA - Regime Transitório – 0,00%</option>
                        <option value="NOR14">IVA Normal 14%</option>
                        <option value="NSUJ">IVA - Regime de Não Sujeição</option>
                        <option value="SIMP">IVA - Regime Simplificado</option>
                        <option value="EXCL">IVA - Regime de Exclusão</option>
                        <option value="7PER">IVA - 7%</option>
                        <option value="ISE12A">IVA Isento Artigo 12.º a)</option>
                        <option value="IS16">IS Verba 16.1.4 – 0,1%</option>
                    </select>
                 </div>
            </div>
            {error && <div className="text-[10px] font-bold text-orange-600 animate-pulse">{error}</div>}
            <div className="flex gap-2">
                <button onClick={fetchTaxRates} className="bg-white border-2 border-gray-300 text-gray-600 px-4 py-1.5 rounded font-black text-[10px] uppercase hover:bg-gray-50 flex items-center gap-2">
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""}/> Atualizar
                </button>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2 rounded font-black text-[10px] uppercase shadow-md flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={14}/> {showForm ? 'Fechar' : 'Nova Taxa'}
                </button>
            </div>
        </div>

        {showForm && (
            <div className="p-6 bg-blue-50 border-b-2 border-blue-200 animate-in slide-in-from-top-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grid grid-cols-1 md:grid-cols-4 gap-5 max-w-7xl mx-auto">
                    <div className="col-span-1 md:col-span-2"><label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Layout / Descrição</label><input required className="w-full border-2 border-slate-200 p-2 rounded bg-white text-xs font-bold outline-none focus:border-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: IVA Normal 14%" /></div>
                    <div><label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Tipo</label><select className="w-full border-2 border-slate-200 p-2 rounded bg-white text-xs font-bold outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option value="IVA">IVA</option><option value="IS">IS</option><option value="OUT">OUT</option></select></div>
                    <div><label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Taxa (%)</label><input type="number" step="0.01" className="w-full border-2 border-slate-200 p-2 rounded bg-white text-xs font-black text-blue-600" value={formData.percentage} onChange={e => setFormData({...formData, percentage: Number(e.target.value)})}/></div>
                    <div><label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Código</label><input className="w-full border-2 border-slate-200 p-2 rounded bg-white text-xs font-black uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} /></div>
                    <div className="col-span-1 md:col-span-2"><label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Motivo Isenção</label><input className="w-full border-2 border-slate-200 p-2 rounded bg-white text-xs font-medium" value={formData.exemptionReason || ''} onChange={e => setFormData({...formData, exemptionReason: e.target.value})} /></div>
                    <div className="flex items-end"><button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-2.5 rounded font-black text-[10px] uppercase shadow-xl hover:bg-blue-700 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Gravar na Cloud</button></div>
                </form>
            </div>
        )}

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <div className="bg-white border-2 border-gray-300 rounded shadow-sm min-w-[1200px]">
                <table className="w-full text-[10px] text-left border-collapse">
                    <thead className="bg-gray-200 text-gray-800 font-bold border-b-2 border-gray-800 uppercase">
                        <tr>
                            <th className="p-2 border-r border-gray-400 w-24">Data Inicio</th>
                            <th className="p-2 border-r border-gray-400">Layout</th>
                            <th className="p-2 border-r border-gray-400 text-center w-16">Tipo</th>
                            <th className="p-2 border-r border-gray-400 text-center w-16">Região</th>
                            <th className="p-2 border-r border-gray-400 text-center w-16">Codigo</th>
                            <th className="p-2 border-r border-gray-400">Descrição</th>
                            <th className="p-2 border-r border-gray-400 text-right w-24">Taxa</th>
                            <th className="p-2 border-r border-gray-400 text-right w-20">Valor Fixo</th>
                            <th className="p-2 border-r border-gray-400 text-center w-16">Cód</th>
                            <th className="p-2 border-r border-gray-400">Motivo</th>
                            <th className="p-2 text-center w-12">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {taxRates.map(rate => (
                            <tr key={rate.id} className="hover:bg-blue-50 transition-colors">
                                <td className="p-2 border-r border-gray-200 font-bold bg-gray-100/50 text-center">{formatDate(rate.startDate).replace(/ /g, '-')}</td>
                                <td className="p-2 border-r border-gray-200 font-black text-slate-800 uppercase">{rate.name}</td>
                                <td className="p-2 border-r border-gray-200 text-center font-black text-slate-600 uppercase">{rate.type}</td>
                                <td className="p-2 border-r border-gray-200 text-center text-slate-400 uppercase">N/A</td>
                                <td className="p-2 border-r border-gray-200 text-center font-black text-blue-700 uppercase">{rate.code}</td>
                                <td className="p-2 border-r border-gray-200 text-slate-500 uppercase font-bold truncate max-w-[150px]">{rate.description || 'NA'}</td>
                                <td className="p-2 border-r border-gray-200 text-right font-black text-slate-900">{rate.percentage.toFixed(2)}%</td>
                                <td className="p-2 border-r border-gray-200 text-right text-slate-400 font-mono">0,00</td>
                                <td className="p-2 border-r border-gray-200 text-center font-black text-orange-700">---</td>
                                <td className="p-2 border-r border-gray-200 italic text-slate-600 uppercase font-medium">{rate.exemptionReason || '---'}</td>
                                <td className="p-2 text-center">
                                    <button onClick={async () => { if(confirm("Eliminar?")) await supabase.from('tax_rates').delete().eq('id', rate.id); fetchTaxRates(); }} className="p-1 bg-red-100 text-red-600 rounded border border-red-200 hover:bg-red-600 hover:text-white transition-all">
                                        <X size={12}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default TaxTable;
