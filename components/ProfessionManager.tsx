import React, { useState } from 'react';
import { Profession } from '../types';
import { Search, PlusCircle, Trash2, Edit2, Briefcase, Save, X, BookOpen, Check } from 'lucide-react';
import { generateId, formatCurrency } from '../utils';

interface ProfessionManagerProps {
  professions: Profession[];
  onSave: (p: Profession) => void;
  onDelete: (id: string) => void;
  onSelect?: (p: Profession) => void; // Optional selection mode
  onClose?: () => void;
}

const ProfessionManager: React.FC<ProfessionManagerProps> = ({ professions, onSave, onDelete, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [formData, setFormData] = useState<Partial<Profession>>({
    baseSalary: 0,
    complement: 0,
    category: 'Interna'
  });

  const filtered = professions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.includes(searchTerm)
  );

  const handleCreate = () => {
    setFormData({ code: '', name: '', category: 'Interna', baseSalary: 0, complement: 0 });
    setView('FORM');
  };

  const handleEdit = (p: Profession) => {
    setFormData(p);
    setView('FORM');
  };

  const handleSaveForm = () => {
    if(!formData.name || !formData.code) return alert("Código e Nome são obrigatórios");
    
    const newProf: Profession = {
        id: formData.id || generateId(),
        code: formData.code!,
        name: formData.name!,
        category: formData.category || 'Interna',
        description: formData.description,
        group: formData.group,
        baseSalary: Number(formData.baseSalary),
        complement: Number(formData.complement)
    };
    onSave(newProf);
    setView('LIST');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-lg border-b-4 border-blue-600">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Briefcase className="text-blue-400" size={24}/> Gestão de Profissões / Categorias Cloud
            </h2>
            {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition border border-white/10">
                    <X size={20}/>
                </button>
            )}
        </div>

        {view === 'LIST' && (
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
                        <input 
                            className="w-full pl-10 p-3 border-2 border-slate-100 bg-white rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            placeholder="Pesquisar por nome ou código..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center gap-2 border-b-4 border-blue-800"
                    >
                        <PlusCircle size={20}/> CRIAR PROFISSÃO INTERNA
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-slate-900 p-5 text-[10px] font-black text-white uppercase tracking-widest sticky top-0 z-10 border-b border-slate-800">
                        <div className="col-span-2">Código INSS</div>
                        <div className="col-span-5">Descrição da Profissão</div>
                        <div className="col-span-2 text-right">Salário Base</div>
                        <div className="col-span-2 text-right">Complemento</div>
                        <div className="col-span-1 text-center">Opções</div>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                        {filtered.map((p, idx) => (
                            <div 
                                key={p.id} 
                                className={`grid grid-cols-12 p-5 text-sm items-center hover:bg-blue-50 transition-all group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                            >
                                <div className="col-span-2 font-mono font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl w-fit border border-blue-100">{p.code}</div>
                                <div className="col-span-5 font-black text-slate-800 uppercase tracking-tight">{p.name}</div>
                                <div className="col-span-2 text-right font-black text-slate-900">{formatCurrency(p.baseSalary || 0).replace('Kz','')}</div>
                                <div className="col-span-2 text-right font-bold text-slate-400">{formatCurrency(p.complement || 0).replace('Kz','')}</div>
                                <div className="col-span-1 flex justify-center gap-2">
                                    {onSelect ? (
                                        <button onClick={() => onSelect(p)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition">
                                            <Check size={18}/>
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(p)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-blue-100">
                                                <Edit2 size={16}/>
                                            </button>
                                            <button onClick={() => onDelete(p.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-red-100">
                                                <Trash2 size={16}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filtered.length === 0 && (
                        <div className="p-32 text-center text-slate-300 font-black uppercase tracking-[8px] opacity-30 italic">
                            Sem registos configurados
                        </div>
                    )}
                </div>
            </div>
        )}

        {view === 'FORM' && (
            <div className="p-10 max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-300">
                <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-8 border-blue-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl"><BookOpen size={24}/></div>
                            <h3 className="font-black text-xl uppercase tracking-tighter">{formData.id ? 'Editar Profissão' : 'Nova Profissão'}</h3>
                        </div>
                        <button onClick={() => setView('LIST')} className="p-2 hover:bg-red-600 rounded-full transition border border-white/10 shadow-lg"><X size={24}/></button>
                    </div>
                    
                    <div className="p-10 space-y-8 bg-gradient-to-br from-white to-slate-50">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Código de Referência (INSS) *</label>
                            <input 
                                className="w-full border-2 border-slate-100 bg-white p-4 rounded-2xl font-mono font-black text-blue-700 outline-none focus:border-blue-600 transition shadow-inner"
                                placeholder="Ex: 157"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Nome Profissional *</label>
                            <input 
                                className="w-full border-2 border-slate-100 bg-white p-4 rounded-2xl font-black uppercase text-slate-900 outline-none focus:border-blue-600 transition shadow-inner"
                                placeholder="Ex: Operador de Máquina Senior"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Salário Base (Kz) *</label>
                                <input 
                                    type="number"
                                    className="w-full border-2 border-slate-100 bg-white p-4 rounded-2xl font-black text-blue-800 text-lg outline-none focus:border-blue-600 transition shadow-inner"
                                    value={formData.baseSalary}
                                    onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Ajudas Custo Ref.</label>
                                <input 
                                    type="number"
                                    className="w-full border-2 border-slate-100 bg-white p-4 rounded-2xl font-black text-slate-400 text-lg outline-none focus:border-blue-600 transition shadow-inner"
                                    value={formData.complement}
                                    onChange={e => setFormData({...formData, complement: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setView('LIST')} className="flex-1 py-5 border-4 border-slate-100 rounded-[2rem] font-black text-slate-400 uppercase tracking-widest text-[10px] hover:bg-white transition-all">Cancelar</button>
                            <button onClick={handleSaveForm} className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black uppercase text-xs tracking-[3px] shadow-2xl transition transform active:scale-95 flex items-center justify-center gap-3">
                                <Save size={20}/> GRAVAR NA CLOUD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProfessionManager;