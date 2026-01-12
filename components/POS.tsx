import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Product, Client, Invoice, InvoiceItem, InvoiceType, 
  InvoiceStatus, PaymentMethod, CashRegister, DocumentSeries, 
  POSConfig, Company, User, WorkLocation, Warehouse, RestaurantTable,
  POSArea
} from '../types';
import { formatCurrency, generateId, formatDate, generateQrCodeUrl } from '../utils';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, User as UserIcon, 
  X, CreditCard, Monitor, CornerUpLeft, Printer, Image as ImageIcon, 
  AlertTriangle, ArrowRightLeft, Tag, MessageSquare, Utensils, 
  BedDouble, ShoppingBag, LayoutGrid, CheckCircle2, History,
  Maximize2, Minimize2, Split, DollarSign, Calculator,
  BriefcaseBusiness, UserPlus, ChevronRight, ChevronLeft, UtensilsCrossed, ScrollText, Save
} from 'lucide-react';

interface RestaurantOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

interface OrderFormProps {
    table: RestaurantTable | null;
    menuItems: Partial<Product>[];
    onCancel: () => void;
    onSave: (cart: RestaurantOrderItem[], waiter: string, type: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ table, menuItems, onCancel, onSave }) => {
    const [waiter, setWaiter] = useState('Admin');
    const [orderType, setOrderType] = useState<'SALAO' | 'BALCAO' | 'DELIVERY'>('SALAO');
    const [cart, setCart] = useState<RestaurantOrderItem[]>([]);

    const addToCart = (product: any) => {
      const existing = cart.find(i => i.productId === product.id);
      if (existing) {
        setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setCart([...cart, { id: generateId(), productId: product.id, name: product.name, quantity: 1, price: product.price, status: 'PENDING' }]);
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <button onClick={onCancel} className="flex items-center gap-2 hover:text-blue-400 transition">
            <ChevronLeft/> <span className="font-bold uppercase text-xs">Voltar</span>
          </button>
          <h2 className="font-black uppercase tracking-tighter">Novo Pedido - Mesa {table?.number}</h2>
          <div className="w-20"></div>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Garçom</label>
              <input className="w-full p-2 border rounded-lg" value={waiter} onChange={e => setWaiter(e.target.value)}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tipo de Serviço</label>
              <select className="w-full p-2 border rounded-lg font-bold" value={orderType} onChange={e => setOrderType(e.target.value as any)}>
                <option value="SALAO">Salão</option>
                <option value="BALCAO">Balcão / Take-away</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[500px] pr-2">
                {menuItems.map(item => (
                  <div key={item.id} onClick={() => addToCart(item)} className="bg-slate-50 p-4 rounded-xl border-2 border-transparent hover:border-blue-500 hover:bg-white cursor-pointer transition-all flex flex-col justify-between h-32">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                    <span className="font-bold text-slate-800 text-sm leading-tight">{item.name}</span>
                    <span className="font-black text-blue-600 mt-2">{formatCurrency(item.price!)}</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border p-6 flex flex-col h-full min-h-[500px]">
             <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><ShoppingCart size={18}/> Pedido</h3>
             <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.quantity} x {formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="font-black text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                       <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
             </div>
             <button onClick={() => onSave(cart, waiter, orderType)} disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
               <Save size={20}/> ENVIAR
             </button>
          </div>
        </div>
      </div>
    );
}

interface POSProps {
  products: Product[];
  clients: Client[];
  invoices: Invoice[];
  series: DocumentSeries[];
  cashRegisters: CashRegister[];
  config: POSConfig;
  onSaveInvoice: (invoice: Invoice, seriesId: string, action?: 'PRINT' | 'CERTIFY') => void;
  onGoBack: () => void;
  currentUser: User;
  company: Company;
  workLocations?: WorkLocation[];
  warehouses?: Warehouse[];
}

const POS: React.FC<POSProps> = ({ 
  products, clients, invoices, series, cashRegisters, config, 
  onSaveInvoice, onGoBack, currentUser, company, workLocations = [], warehouses = []
}) => {
  const [selectedArea, setSelectedArea] = useState<POSArea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(config.defaultSeriesId || '');
  const [activeInternalView, setActiveInternalView] = useState<'GRID' | 'ORDER_FORM' | 'COMANDA' | 'PAYMENT'>('GRID');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const menuItems = useMemo(() => products.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category })), [products]);

  const [tables, setTables] = useState<RestaurantTable[]>([
    { id: '1', number: 1, capacity: 4, status: 'AVAILABLE' },
    { id: '2', number: 2, capacity: 2, status: 'AVAILABLE' },
  ]);

  if (!selectedArea) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-12">Ponto de Venda Central</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl w-full">
                  {[
                      { id: 'RETAIL', label: 'Venda de Balcão', icon: ShoppingBag },
                      { id: 'RESTAURANT', label: 'Restaurante / Bar', icon: Utensils }
                  ].map((area) => (
                      <button key={area.id} onClick={() => setSelectedArea(area.id as any)} className="bg-white/5 hover:bg-white/10 border-2 border-white/5 hover:border-blue-500 p-8 rounded-[2rem] flex flex-col items-center gap-6 transition group">
                          <area.icon size={48} className="text-white"/>
                          <h3 className="text-white font-black text-lg uppercase">{area.label}</h3>
                      </button>
                  ))}
              </div>
              <button onClick={onGoBack} className="mt-12 text-slate-500 font-bold uppercase text-xs hover:text-white transition flex items-center gap-2"><CornerUpLeft size={16}/> Sair</button>
          </div>
      );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
        {selectedArea === 'RESTAURANT' && activeInternalView === 'ORDER_FORM' ? (
          <OrderForm table={selectedTable} menuItems={menuItems} onCancel={() => setActiveInternalView('GRID')} onSave={() => {}} />
        ) : (
          <div className="p-8 text-center text-slate-400 font-black uppercase">Módulo PDV {selectedArea} Activo</div>
        )}
    </div>
  );
};

export default POS;