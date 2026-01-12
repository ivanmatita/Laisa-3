
import React, { useState, useMemo } from 'react';
import { Purchase, PurchaseType, Supplier, PaymentMethod } from '../types';
import { formatCurrency, formatDate, exportToExcel, generateWhatsAppLink } from '../utils';
import { 
  Search, PlusCircle, Download, Trash2, Printer, X, Upload, FileCheck, 
  MoreHorizontal, Save, Filter, UserPlus, Database, Edit3, ArrowRightLeft, 
  Mail, MessageSquare, ListTree, Copy, User, ShoppingBag, DollarSign, ChevronRight
} from 'lucide-react';

interface PurchaseListProps {
  purchases: Purchase[];
  onDelete: (id: string) => void;
  onUpdate?: (purchase: Purchase) => void;
  onCreateNew: () => void;
  onUpload: (id: string, file: File) => void; 
  onSaveSupplier: (supplier: Supplier) => void;
}

const PurchaseList: React.FC<PurchaseListProps> = ({ purchases, onDelete, onUpdate, onCreateNew, onUpload, onSaveSupplier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  // Actions
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionPurchase, setSelectedActionPurchase] = useState<Purchase | null>(null);
  
  // Filtering
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchesSearch = 
        p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nif.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [purchases, searchTerm, statusFilter, typeFilter]);

  const openActions = (purchase: Purchase) => {
      setSelectedActionPurchase(purchase);
      setActionModalOpen(true);
  };

  const closeActions = () => {
      setActionModalOpen(false);
      setSelectedActionPurchase(null);
  };

  const handleDelete = () => {
      if (selectedActionPurchase) {
          if (window.confirm("Tem a certeza que deseja eliminar este registo de compra da Cloud?")) {
              onDelete(selectedActionPurchase.id);
              closeActions();
          }
      }
  };

  const handleEdit = () => {
      if (selectedActionPurchase && onUpdate) {
          onUpdate(selectedActionPurchase);
          closeActions();
      }
  };

  const handleWhatsApp = () => {
      if (selectedActionPurchase) {
          const msg = `Olá, referente ao documento de compra ${selectedActionPurchase.documentNumber} no valor de ${formatCurrency(selectedActionPurchase.total)}.`;
          const url = generateWhatsAppLink('244900000000', msg);
          window.open(url, '_blank');
      }
  };

  // Fix: Added missing handleEmail function to resolve "Cannot find name 'handleEmail'" error
  const handleEmail = () => {
      if (selectedActionPurchase) {
          const subject = `Documento de Compra ${selectedActionPurchase.documentNumber}`;
          const body = `Olá, referente ao documento de compra ${selectedActionPurchase.documentNumber} no valor de ${formatCurrency(selectedActionPurchase.total)}.`;
          const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(url, '_blank');
      }
  };

  const ActionButton = ({ icon: Icon, label, onClick, danger = false, disabled = false }: any) => (
      <button 
          onClick={onClick}
          disabled={disabled}
          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group disabled:opacity-50 ${
            danger 
              ? 'bg-red-50 border-red-100 hover:bg-red-100 text-red-700' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-blue-300 shadow-sm'
          }`}
      >
          <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${danger ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white'} transition-colors`}>
                <Icon size={18}/>
              </div>
              <span className="font-bold text-xs uppercase tracking-tight">{label}</span>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-all"/>
      </button>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Documentos de Compras
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database size={10}/> Cloud Sync
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão de aquisições e fornecedores</p>
        </div>
        <div className="flex gap-2">
             <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition font-black uppercase tracking-widest shadow-lg">
                 <PlusCircle size={16} /> Registar Compra
             </button>
             <button onClick={() => exportToExcel(filteredPurchases, 'Compras_Imatec')} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition font-bold shadow-md">
                 <Download size={16} /> Excel
             </button>
        </div>
      </div>

      <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex flex-wrap items-end gap-3 text-sm">
         <div className="flex-1 min-w-[200px]">
             <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pesquisa Rápida</label>
             <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Fornecedor, NIF, Doc..." 
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
         </div>
         <div>
             <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tipo</label>
             <select className="py-1.5 px-2 border border-slate-300 rounded-lg w-40 outline-none font-bold bg-white" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                 <option value="ALL">Todos os Tipos</option>
                 {Object.values(PurchaseType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
         </div>
         <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-1 font-black text-[10px] uppercase transition-all" onClick={() => {setSearchTerm(''); setStatusFilter('ALL'); setTypeFilter('ALL');}}>
             <Filter size={14}/> Limpar Filtros
         </button>
      </div>

      <div className="bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-white font-black uppercase tracking-widest">
              <tr>
                <th className="p-4 border-r border-slate-700">Data Registo</th>
                <th className="p-4 border-r border-slate-700">Doc Número</th>
                <th className="p-4 border-r border-slate-700">Fornecedor</th>
                <th className="p-4 w-32 border-r border-slate-700">Contribuinte</th>
                <th className="p-4 text-right border-r border-slate-700">IVA Suportado</th>
                <th className="p-4 text-right">Total Bruto</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 w-12 text-center">OPC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-mono">{formatDate(p.date)}</td>
                        <td className="p-4 font-black text-blue-700 uppercase tracking-tighter">{p.documentNumber}</td>
                        <td className="p-4 font-black uppercase text-slate-800">{p.supplier}</td>
                        <td className="p-4 font-mono font-bold text-slate-500">{p.nif}</td>
                        <td className="p-4 text-right font-mono text-red-500">{formatCurrency(p.taxAmount).replace('Kz','')}</td>
                        <td className="p-4 text-right font-black text-slate-900 bg-slate-50/30">{formatCurrency(p.total)}</td>
                        <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${p.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                {p.status}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <button onClick={() => openActions(p)} className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 shadow-sm border transition-all"><MoreHorizontal size={18}/></button>
                        </td>
                    </tr>
                ))}
                {filteredPurchases.length === 0 && (
                    <tr><td colSpan={8} className="p-20 text-center text-slate-300 font-black uppercase tracking-[10px] italic">Sem registos na cloud</td></tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
      
       {/* Actions Modal - Igual às Vendas */}
       {actionModalOpen && selectedActionPurchase && (
          <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border-4 border-slate-800 animate-in zoom-in-95">
                  <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg uppercase tracking-widest flex items-center gap-2">
                            <ShoppingBag size={20} className="text-blue-400"/>
                            {selectedActionPurchase.type} {selectedActionPurchase.documentNumber}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate uppercase font-bold">{selectedActionPurchase.supplier} • {formatCurrency(selectedActionPurchase.total)}</p>
                      </div>
                      <button onClick={closeActions} className="hover:bg-red-600 p-1.5 rounded-full transition-all border border-white/10"><X size={20}/></button>
                  </div>
                  <div className="p-6 bg-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                              <div className="text-[9px] font-black text-slate-400 uppercase mb-2 border-b pb-1 tracking-widest">Gestão de Compra</div>
                              <ActionButton icon={Edit3} label="Editar Documento" onClick={handleEdit} />
                              <ActionButton icon={User} label="Ver Conta Corrente" onClick={() => {}} />
                              <ActionButton icon={Copy} label="Clonar Documento" onClick={() => {}} />
                          </div>

                          <div className="space-y-2">
                              <div className="text-[9px] font-black text-slate-400 uppercase mb-2 border-b pb-1 tracking-widest">Financeiro & Saída</div>
                              <ActionButton icon={DollarSign} label="Emitir Recibo (Pagar)" onClick={() => {}} disabled={selectedActionPurchase.status === 'PAID'} />
                              <ActionButton icon={ArrowRightLeft} label="Emitir Nota de Crédito" onClick={() => {}} />
                              <ActionButton icon={Printer} label="Imprimir em A4" onClick={() => window.print()} />
                          </div>

                          <div className="space-y-2">
                              <div className="text-[9px] font-black text-slate-400 uppercase mb-2 border-b pb-1 tracking-widest">Comunicação & Perigo</div>
                              <ActionButton icon={Mail} label="Enviar por Email" onClick={handleEmail} />
                              <ActionButton icon={MessageSquare} label="Enviar por WhatsApp" onClick={handleWhatsApp} />
                              <div className="pt-4 border-t border-slate-200 mt-2">
                                <ActionButton icon={Trash2} label="Eliminar Registo" danger onClick={handleDelete} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PurchaseList;
