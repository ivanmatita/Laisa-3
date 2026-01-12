import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import PurchaseList from './components/PurchaseList';
import PurchaseForm from './components/PurchaseForm';
import ClientList from './components/ClientList';
import SupplierList from './components/SupplierList';
import Settings from './components/Settings';
import StockManager from './components/StockManager'; 
import TaxManager from './components/TaxManager';
import CostRevenueMap from './components/CostRevenueMap';
import RegularizationMap from './components/RegularizationMap';
import Model7 from './components/Model7';
import CashManager from './components/CashManager'; 
import HumanResources from './components/HumanResources'; 
import Employees from './components/Employees';
import Workspace from './components/Workspace';
import ProjectReport from './components/ProjectReport';
import SaftExport from './components/SaftExport';
import ManagementReports from './components/ManagementReports';
import PGCManager from './components/PGCManager'; 
import RubricasManager from './components/RubricasManager';
import ClassifyMovement from './components/ClassifyMovement';
import VatSettlementMap from './components/VatSettlementMap'; 
import OpeningBalanceMap from './components/OpeningBalanceMap'; 
import AccountExtract from './AccountExtract'; 
import SecretariaList from './SecretariaList'; 
import SecretariaForm from './SecretariaForm';
import PurchaseAnalysis from './PurchaseAnalysis'; 
import AIAssistant from './AIAssistant';
import LoginPage from './LoginPage';
import POS from './POS';
import CashClosure from './CashClosure';
import CashClosureHistory from './CashClosureHistory';
import POSSettings from './POSSettings';
import PerformanceAnalysis from './PerformanceAnalysis';
import TaxCalculationMap from './TaxCalculationMap';
import AccountingMaps from './AccountingMaps';
import ContractGenerator from './ContractGenerator';
import SchoolManagement from './SchoolManagement';
import RestaurantManagement from './RestaurantManagement';
import HotelManagement from './HotelManagement';
import ArchivesManager from './ArchivesManager';
import TaxDocsManager from './TaxDocsManager';
import GeneralMovements from './GeneralMovements';
import EffectivenessMap from './EffectivenessMap';
import SalaryListReport from './SalaryListReport';
import TaxTable from './TaxTable';
import WithholdingMaps from './WithholdingMaps';
import WithholdingReceivable from './WithholdingReceivable';
import WithholdingPayable from './WithholdingPayable';
import InssList from './InssList';
import LaborStatus from './LaborStatus';
import CRMManager from './CRMManager';

import { supabase } from './services/supabaseClient';

import { 
  Invoice, InvoiceStatus, ViewState, Client, Product, InvoiceType, 
  Warehouse, PriceTable, StockMovement, Purchase, Company, User,
  Employee, SalarySlip, HrTransaction, WorkLocation, CashRegister, DocumentSeries,
  Supplier, PaymentMethod, CashMovement, HrVacation, PGCAccount, SecretariaDocument, 
  VatSettlement, OpeningBalance, UserActivityLog, POSConfig, Contract, AttendanceRecord, Profession, PurchaseType, CashClosure as CashClosureType,
  IntegrationStatus, WorkProject, TaxRate, Bank, Metric, TransferOrder
} from './types';
import { Menu, Calendar as CalendarIcon, RefreshCw, AlertCircle, Clock as ClockIcon, ShieldCheck, Loader2 } from 'lucide-react';
import { generateId, generateUUID, generateInvoiceHash, getDocumentPrefix, formatDate } from './utils';

const DEFAULT_FALLBACK_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const INITIAL_COMPANY: Company = {
  id: DEFAULT_FALLBACK_COMPANY_ID, 
  name: 'IVAN JOSÉ LUCAS MATITA', 
  nif: '004972225NE040', 
  address: 'Luanda, Angola', 
  email: 'geral@imatec.ao', 
  phone: '+244 923 000 000', 
  regime: 'Regime Geral',
  licensePlan: 'ENTERPRISE', 
  status: 'ACTIVE', 
  validUntil: '2025-12-31', 
  registrationDate: '2024-01-01'
};

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin', email: 'admin@sistema.ao', password: '123', role: 'ADMIN', companyId: DEFAULT_FALLBACK_COMPANY_ID, permissions: [], createdAt: '2024-01-01' }
];

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [globalYear, setGlobalYear] = useState<number>(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCompany, setCurrentCompany] = useState<Company>(INITIAL_COMPANY);
  
  // Data State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [priceTables, setPriceTables] = useState<PriceTable[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [series, setSeries] = useState<DocumentSeries[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [pgcAccounts, setPgcAccounts] = useState<PGCAccount[]>([]);
  const [hrEmployees, setHrEmployees] = useState<Employee[]>([]);
  const [hrTransactions, setHrTransactions] = useState<HrTransaction[]>([]);
  const [hrVacations, setHrVacations] = useState<HrVacation[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<SalarySlip[]>([]);
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([]);
  const [secDocuments, setSecDocuments] = useState<SecretariaDocument[]>([]);
  const [vatSettlements, setVatSettlements] = useState<VatSettlement[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [posConfig, setPosConfig] = useState<POSConfig>({
      defaultSeriesId: 's1', printerType: '80mm', autoPrint: true, allowDiscounts: true,
      defaultClientId: '', defaultPaymentMethod: 'CASH', showImages: true, quickMode: false
  });
  const [cashClosures, setCashClosures] = useState<CashClosureType[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityLog[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [realEmpresaId, setRealEmpresaId] = useState<string | null>(null);

  const [invoiceInitialType, setInvoiceInitialType] = useState<InvoiceType>(InvoiceType.FT);
  const [invoiceInitialData, setInvoiceInitialData] = useState<Partial<Invoice> | undefined>(undefined);
  const [purchaseInitialData, setPurchaseInitialData] = useState<Partial<Purchase> | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedExtractAccount, setSelectedExtractAccount] = useState<string | null>(null);
  const [selectedHrEmployee, setSelectedHrEmployee] = useState<Employee | null>(null);
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);

  const certifiedInvoices = useMemo(() => invoices.filter(i => i.isCertified), [invoices]);
  const validPurchases = useMemo(() => purchases.filter(p => p.status !== 'CANCELLED'), [purchases]);

  const isLicenseExpired = useMemo(() => {
    return new Date(currentCompany.validUntil) < new Date();
  }, [currentCompany.validUntil]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ensureUUID = (id: string | undefined | null): string | null => {
    if (!id || id === 'CONSUMIDOR_FINAL' || id === '') return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    const hex = id.split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(32, '0').substring(0, 32);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  const getSecureEmpresaId = async (): Promise<string> => {
    if (realEmpresaId) return realEmpresaId;
    try {
      const { data } = await supabase.from('empresas').select('id').limit(1).single();
      if (data && data.id) {
        setRealEmpresaId(data.id);
        return data.id;
      }
    } catch (e) {
      console.error("Erro ao recuperar ID da empresa ativa:", e);
    }
    return DEFAULT_FALLBACK_COMPANY_ID;
  };

  const fetchTransferOrdersCloud = async () => {
    try {
        const { data, error } = await supabase.from('ordens_transferencia').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            setTransferOrders(data.map(d => ({
                id: d.id,
                reference: d.mes_referencia || 'TRANSF',
                date: d.data_transferencia || d.created_at,
                totalAmount: Number(d.valor || 0),
                totalCount: 1,
                period: d.mes_referencia,
                cashRegisterId: d.banco,
                items: []
            })));
        }
    } catch (e: any) { 
        console.error("Erro ao carregar transferências:", e?.message);
    }
  };

  const fetchInvoicesCloud = async () => {
    try {
      const { data, error } = await supabase.from('faturas').select('*').order('data_fatura', { ascending: false });
      if (error) throw error;
      if (data) {
        setInvoices(data.map(f => {
          let type = InvoiceType.FT;
          if (f.tipo_fatura === 'VD') type = InvoiceType.VD;
          if (f.tipo_fatura === 'FR') type = InvoiceType.FR;
          if (f.tipo_fatura === 'RC') type = InvoiceType.RG;
          if (f.tipo_fatura === 'NC') type = InvoiceType.NC;
          if (f.tipo_fatura === 'ND') type = InvoiceType.ND;
          if (f.tipo_fatura === 'PP') type = InvoiceType.PP;
          if (f.tipo_fatura === 'OR') type = InvoiceType.OR;
          if (f.tipo_fatura === 'GE') type = InvoiceType.GE;

          return {
            id: f.id,
            type: type,
            seriesId: f.serie_id || 's1', 
            number: f.numero_fatura || '---',
            date: f.data_fatura || '',
            dueDate: f.data_fatura || '',
            accountingDate: f.data_fatura || '',
            clientId: f.cliente_id || '',
            clientName: f.cliente_nome || 'Cliente Cloud',
            clientNif: f.cliente_nif || '',
            items: f.items || [], 
            subtotal: (Number(f.total) || 0) - (Number(f.iva) || 0),
            globalDiscount: 0,
            taxRate: 14,
            taxAmount: Number(f.iva) || 0,
            withholdingAmount: f.withholding_amount || 0,
            total: Number(f.total) || 0,
            currency: 'AOA',
            exchangeRate: 1,
            status: f.status === 'Pago' ? InvoiceStatus.PAID : f.status === 'Anulado' ? InvoiceStatus.CANCELLED : InvoiceStatus.PENDING,
            isCertified: !!f.hash || f.status === 'Pago', 
            hash: f.hash || '',
            companyId: f.empresa_id || DEFAULT_FALLBACK_COMPANY_ID,
            source: (f.source || 'MANUAL') as any,
            cashRegisterId: f.caixa_id,
            paymentMethod: f.metodo_pagamento as any,
            sourceInvoiceId: f.source_invoice_id,
            workLocation_id: ensureUUID(f.work_location_id),
            operatorName: f.operator_name,
            time: f.time
          };
        }));
      }
    } catch (e: any) { console.error("Erro ao carregar faturas:", e?.message || e); }
  };

  const fetchPurchasesCloud = async () => {
    try {
      const { data, error } = await supabase.from('compras').select('*').order('data_emissao', { ascending: false });
      if (error) throw error;
      if (data) {
        setPurchases(data.map(p => ({
          id: p.id,
          type: p.tipo_documento as any,
          supplierId: p.fornecedor_id,
          supplier: p.fornecedor_nome,
          nif: p.nif_fornecedor || '',
          date: p.data_emissao,
          dueDate: p.data_vencimento || p.data_emissao,
          documentNumber: p.numero_documento,
          items: p.items || [],
          subtotal: p.valor_subtotal || 0,
          taxAmount: p.valor_iva || 0,
          total: p.valor_total || 0,
          status: p.status as any,
          notes: p.observacoes,
          hash: p.hash,
          workLocationId: p.work_location_id,
          warehouseId: p.armazem_id,
          paymentMethod: p.metodo_pagamento as any,
          cashRegisterId: p.caixa_id
        })));
      }
    } catch (e: any) { console.error("Erro ao carregar compras:", e?.message || e); }
  };

  const fetchCashRegistersCloud = async () => {
    try {
        const { data, error } = await supabase.from('caixas').select('*');
        if (error) throw error;
        if (data) {
            setCashRegisters(data.map(c => ({
                id: c.id,
                name: c.titulo,
                status: c.status as any,
                balance: c.balance,
                initialBalance: c.saldo_abertura
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchCashClosuresCloud = async () => {
    try {
        const { data, error } = await supabase.from('fechos_caixa').select('*').order('data_fecho', { ascending: false });
        if (error) throw error;
        if (data) {
            setCashClosures(data.map(c => ({
                id: c.id,
                date: c.data_fecho,
                openedAt: c.aberto_em,
                closedAt: c.fechado_em,
                operatorId: c.operador_id,
                operatorName: c.operador_nome,
                cashRegisterId: c.caixa_id,
                expectedCash: Number(c.esperado_dinheiro || 0),
                expectedMulticaixa: Number(c.esperado_multicaixa || 0),
                expectedTransfer: Number(c.esperado_transferencia || 0),
                expectedCredit: Number(c.esperado_credito || 0),
                totalSales: Number(c.total_vendas || 0),
                actualCash: Number(c.dinheiro_real || 0),
                difference: Number(c.diferenca || 0),
                initialBalance: Number(c.saldo_inicial || 0),
                finalBalance: Number(c.saldo_final || 0),
                status: c.status as 'CLOSED',
                notes: c.notes
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchContractsCloud = async () => {
    try {
        const { data, error } = await supabase.from('contratos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            setContracts(data.map(c => ({
                id: c.id,
                employeeId: c.funcionario_id,
                type: c.tipo as any,
                startDate: c.data_inicio,
                endDate: c.data_fim,
                status: c.status as any,
                clauses: c.clausulas || []
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchWorkLocationsCloud = async () => {
    try {
        const { data, error } = await supabase.from('locais_trabalho').select('*');
        if (error) throw error;
        if (data) {
            setWorkLocations(data.map(d => ({
                id: d.id,
                name: d.titulo,
                address: d.localizacao,
                managerName: d.contacto
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchProductsCloud = async () => {
    try {
        const { data, error } = await supabase.from('produtos').select('*');
        if (error) throw error;
        if (data) {
            setProducts(data.map(p => ({
                id: p.id,
                name: p.nome,
                costPrice: p.preco || 0,
                price: (p.preco || 0) * 1.3,
                unit: 'un',
                category: 'Geral',
                stock: Number(p.stock || 0), 
                warehouseId: '',
                priceTableId: 'pt1',
                minStock: 0,
                barcode: p.barcode,
                imageUrl: p.image_url
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchWarehousesCloud = async () => {
    try {
        const { data, error } = await supabase.from('armazens').select('*');
        if (error) throw error;
        if (data) {
            setWarehouses(data.map(a => ({
                id: a.id,
                name: a.nome,
                location: a.localizacao,
                description: a.descricao,
                managerName: a.responsavel,
                contact: a.contacto,
                observations: a.observacoes
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchClientsCloud = async () => {
    try {
        const { data, error } = await supabase.from('clientes').select('*');
        if (error) throw error;
        if (data) {
            setClients(data.map(c => ({
                id: c.id, name: c.nome, vatNumber: c.nif, email: c.email || '',
                phone: c.telefone || '', address: c.endereco || '', city: c.localidade || '',
                country: c.pais || 'Angola', accountBalance: 0, initialBalance: Number(c.saldo_inicial || 0),
                clientType: c.tipo_cliente, province: c.provincia, transactions: []
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchSuppliersCloud = async () => {
    try {
        const { data, error } = await supabase.from('fornecedores').select('*');
        if (error) throw error;
        if (data) {
            setSuppliers(data.map(s => ({
                id: s.id, name: s.nome, vatNumber: s.contribuinte, email: s.email || '',
                phone: s.telefone || '', address: s.morada || '', city: s.localidade || '',
                province: s.provincia || '', accountBalance: 0, supplierType: s.tipo_cliente, country: s.pais || 'Angola', transactions: []
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchTaxRatesCloud = async () => {
    try {
      const { data, error } = await supabase.from('tax_rates').select('id, nome, tipo, percentagem, codigo_fiscal, descricao, created_at');
      if (error) throw error;
      if (data) {
          setTaxRates(data.map(t => ({
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
          })));
      }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchBanksCloud = async () => {
    try {
        const { data, error } = await supabase.from('bancos').select('id, sigla_banco, numero_conta, nib, iban, swift');
        if (error) throw error;
        if (data) {
            setBanks(data.map(b => ({ 
              id: b.id, 
              nome: b.sigla_banco || 'Banco', 
              sigla: b.sigla_banco || '---', 
              iban: b.iban || '', 
              swift: b.swift || '',
              nib: b.nib,
              accountNumber: b.numero_conta
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchMetricsCloud = async () => {
    try {
        const { data, error } = await supabase.from('metricas').select('*');
        if (error) throw error;
        if (data) setMetrics(data.map(m => ({ id: m.id, nome: m.descricao, sigla: m.sigla })));
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchUsersCloud = async () => {
    try {
        const { data, error } = await supabase.from('utilizadores').select('id, nome, utilizador, email, telefone, validade_acesso, permissoes, empresa_id, created_at');
        if (error) throw error;
        if (data) {
            setUsers(data.map(u => ({
                id: u.id,
                name: u.nome,
                username: u.utilizador,
                email: u.email,
                phone: u.telefone,
                accessValidity: u.validade_acesso,
                role: 'ADMIN',
                companyId: u.empresa_id,
                permissions: u.permissoes || [],
                createdAt: u.created_at
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchInternalProfessionsCloud = async () => {
    try {
        const { data, error } = await supabase.from('profissoes_internas').select('*');
        if (error) throw error;
        if (data) {
            setProfessions(data.map(p => ({
                id: p.id,
                code: p.codigo_inss || '',
                name: p.nome_profissao,
                indexedProfessionName: p.profissao_inss,
                indexedProfessionCode: p.codigo_inss,
                baseSalary: Number(p.salario_base || 0),
                complement: Number(p.ajudas_custo || 0),
                createdAt: p.created_at,
                userName: p.created_by || 'Admin',
                category: 'Interna'
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchSeriesCloud = async () => {
    try {
        const { data, error } = await supabase.from('series').select('*');
        if (error) throw error;
        if (data) {
            setSeries(data.map(s => ({
                id: s.id,
                name: s.nome || 'Série Geral',
                code: s.codigo || 'A',
                type: (s.tipo || 'NORMAL') as any,
                year: s.ano || new Date().getFullYear(),
                currentSequence: s.sequencia_atual || 1,
                sequences: s.sequencias_por_tipo || {}, 
                isActive: s.ativo !== undefined ? s.ativo : true,
                allowedUserIds: s.utilizadores_autorizados || [],
                bankDetails: s.detalhes_bancarios,
                footerText: s.texto_rodape
            })));
        }
    } catch (e: any) { console.error(e?.message || e); }
  };

  const fetchHrEmployeesCloud = async () => {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*').order('nome', { ascending: true });
      if (error) throw error;
      if (data) {
        setHrEmployees(data.map(e => ({
          id: e.id,
          idnf: e.idnf,
          employeeNumber: e.numero_funcionario,
          name: e.nome,
          nif: e.nif,
          bi: e.bi,
          ssn: e.num_inss,
          role: e.cargo,
          department: e.departamento,
          baseSalary: Number(e.salario_base || 0),
          status: e.status || 'Active',
          employmentStatus: e.employment_status || 'ativo',
          admissionDate: e.data_admissao,
          contractType: e.tipo_contrato || 'Determinado',
          subsidyTransport: Number(e.subs_transporte || 0),
          subsidyFood: Number(e.subs_alimentacao || 0),
          subsidyFamily: Number(e.subs_familia || 0),
          gender: e.genero || 'M',
          maritalStatus: e.estado_civil || 'Solteiro',
          address: e.morada || '',
          municipality: e.municipio || '',
          neighborhood: e.bairro || '',
          photoUrl: e.foto_url,
          workLocationId: e.local_trabalho_id,
          companyId: e.empresa_id,
          isCashier: e.is_caixa,
          isMagic: e.is_magic,
          dismissalDate: e.dismissal_date,
          dismissedBy: e.dismissed_by,
          dismissal_reason: e.motivo_demissao || e.dismissal_reason,
          rehire_date: e.rehire_date,
          rehire_orderer: e.rehire_orderer,
          rehire_reason: e.rehire_reason,
          occurrence: e.occurrence
        })));
      }
    } catch (e: any) { console.error("Erro ao carregar funcionários:", e?.message || e); }
  };

  /** Converted to function declaration to ensure availability during render */
  function handleViewProjectReport(project: WorkProject) {
    setSelectedProject(project);
    setCurrentView('PROJECT_REPORT');
  }

  /** Converted to function declaration to ensure availability during render */
  function handleProcessPayroll(slips: SalarySlip[]) {
      setPayrollHistory(prev => {
          const newHistory = [...prev];
          slips.forEach(slip => {
              const existingIdx = newHistory.findIndex(p => p.employeeId === slip.employeeId && p.month === slip.month && p.year === slip.year);
              if (existingIdx >= 0) newHistory[existingIdx] = slip;
              else newHistory.push(slip);
          });
          return newHistory;
      });
  }

  /** Converted to function declaration to ensure availability during render */
  function handleClearPayroll(empId: string, month: number, year: number) {
      setPayrollHistory(prev => prev.filter(p => !(p.employeeId === empId && p.month === month && p.year === year)));
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleSaveTransferOrder(order: TransferOrder) {
    setIsLoading(true);
    try {
        const companyIdToUse = await getSecureEmpresaId();
        const { error } = await supabase.from('ordens_transferencia').insert({
            id: ensureUUID(order.id) || generateUUID(),
            funcionario_id: null, 
            banco: order.cashRegisterId,
            iban: 'GLOBAL',
            valor: order.totalAmount,
            mes_referencia: order.period,
            data_transferencia: order.date,
            estado: 'pago',
            empresa_id: companyIdToUse
        });
        
        if (error) throw error;
        
        setTransferOrders([order, ...transferOrders]);
        alert("Ordem de transferência salva com sucesso na Cloud!");
    } catch (e: any) {
        console.error("Erro crítico ao salvar transferência:", e?.message);
        alert("Erro ao salvar transferência: " + e.message);
    } finally {
        setIsLoading(false);
    }
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleSaveInvoice(inv: Invoice, sId: string, action?: string) {
      if (isLicenseExpired) {
          alert("LICENÇA EXPIRADA: O sistema encontra-se em modo de visualização. Contacte o suporte IMATEC para renovar.");
          return;
      }

      const docSeries = series.find(s => s.id === sId);
      
      if (action === 'CERTIFY' && docSeries?.type !== 'MANUAL') {
          const lastCertified = invoices
              .filter(i => i.seriesId === sId && i.type === inv.type && i.isCertified)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          if (lastCertified && new Date(inv.date).getTime() < new Date(lastCertified.date).getTime()) {
              alert(`ERRO DE CRONOLOGIA AGT: A data do documento (${formatDate(inv.date)}) não pode ser anterior à data do último documento certificado deste tipo (${formatDate(lastCertified.date)}).`);
              return;
          }
      }

      setIsLoading(true);
      let finalInv = { ...inv };
      
      if (action === 'CERTIFY' && !inv.isCertified) {
          finalInv.isCertified = true;
          
          if (docSeries?.type === 'MANUAL') {
              finalInv.integrationStatus = IntegrationStatus.VALIDATED;
              finalInv.processedAt = new Date().toISOString();
          } else {
              finalInv.hash = generateInvoiceHash(finalInv);
              finalInv.integrationStatus = IntegrationStatus.VALIDATED;
              finalInv.processedAt = new Date().toISOString();
              
              const typeKey = inv.type as string;
              const currentSeqForType = docSeries?.sequences?.[typeKey] || 0;
              const nextSeq = currentSeqForType + 1;
              
              const prefix = getDocumentPrefix(inv.type);
              const number = `${prefix} ${docSeries?.code || 'S'} ${docSeries?.year}/${nextSeq}`;
              
              finalInv.number = number;
              finalInv.seriesCode = docSeries?.code;
              
              if (docSeries) {
                  const updatedSequences = { ...docSeries.sequences, [typeKey]: nextSeq };
                  setSeries(series.map(s => s.id === sId ? { ...s, sequences: updatedSequences } : s));
                  
                  await supabase.from('series').update({
                      sequencia_atual: nextSeq,
                      sequencias_por_tipo: updatedSequences
                  }).eq('id', sId);
              }
          }

          if (finalInv.cashRegisterId && finalInv.paymentMethod && finalInv.total > 0 && finalInv.status !== InvoiceStatus.CANCELLED) {
              try {
                  const regId = ensureUUID(finalInv.cashRegisterId);
                  const reg = cashRegisters.find(c => c.id === finalInv.cashRegisterId);
                  const newBalance = (reg?.balance || 0) + finalInv.total;
                  
                  if (regId) {
                    await supabase.from('caixas').update({ balance: newBalance }).eq('id', regId);
                    const companyIdForCash = await getSecureEmpresaId();
                    await supabase.from('movimentos_caixa').insert({
                        data_movimento: new Date().toISOString().split('T')[0],
                        tipo_movimento: 'entrada',
                        valor: finalInv.total,
                        descricao: `Venda ${finalInv.type} ${finalInv.number}`,
                        caixa_id: regId,
                        referencia: finalInv.number,
                        metodo_pagamento: finalInv.paymentMethod,
                        operador_nome: currentUser?.name || 'Sistema',
                        origem: 'vendas',
                        empresa_id: companyIdForCash
                    });
                  }
                  setCashRegisters(prev => prev.map(c => c.id === finalInv.cashRegisterId ? { ...c, balance: newBalance } : c));
              } catch (e: any) { console.error("Erro integração caixa:", e?.message || e); }
          }

          if ([InvoiceType.FT, InvoiceType.FR, InvoiceType.VD, InvoiceType.GE].includes(finalInv.type) && finalInv.status !== InvoiceStatus.CANCELLED) {
              const companyIdForStock = await getSecureEmpresaId();
              for (const item of finalInv.items) {
                  if (item.productId && item.type === 'PRODUCT') {
                      try {
                          const prodUUID = ensureUUID(item.productId);
                          const whUUID = ensureUUID(finalInv.targetWarehouseId || '');
                          if (prodUUID) {
                            await supabase.from('movimentos_stock').insert({
                                tipo: finalInv.type === InvoiceType.NC ? 'ENTRY' : 'EXIT',
                                produto_id: prodUUID,
                                produto_nome: item.description,
                                quantidade: item.quantity,
                                armazem_id: whUUID,
                                documento_ref: finalInv.number,
                                notes: `Baixa Automática POS/Fatura: ${finalInv.number}`,
                                empresa_id: companyIdForStock
                            });
                          }
                      } catch (e: any) { console.error("Erro stock:", e?.message || e); }
                  }
              }
          }
      }

      setInvoices([finalInv, ...invoices.filter(i => i.id !== finalInv.id)]);

      try {
        const companyIdToUse = await getSecureEmpresaId();
        if (!companyIdToUse) throw new Error("Empresa não identificada.");

        const syncPayload = {
          id: ensureUUID(finalInv.id) || undefined, 
          empresa_id: companyIdToUse,
          cliente_id: ensureUUID(finalInv.clientId),
          numero_fatura: finalInv.number,
          data_fatura: finalInv.date,
          total: Number(finalInv.total),
          iva: Number(finalInv.taxAmount),
          items: finalInv.items, 
          status: finalInv.status === InvoiceStatus.PAID ? 'Pago' : finalInv.status === InvoiceStatus.CANCELLED ? 'Anulado' : 'Pendente',
          source: finalInv.source || 'MANUAL',
          caixa_id: ensureUUID(finalInv.cashRegisterId),
          metodo_pagamento: finalInv.paymentMethod,
          tipo_fatura: getDocumentPrefix(finalInv.type),
          source_invoice_id: ensureUUID(finalInv.sourceInvoiceId),
          work_location_id: ensureUUID(finalInv.workLocationId),
          time: finalInv.time,
          serie_id: sId,
          hash: finalInv.hash || '',
          operator_name: finalInv.operatorName || currentUser?.name,
          withholding_amount: finalInv.withholdingAmount
        };

        const { error: syncError } = await supabase.from('faturas').upsert(syncPayload);
        if (syncError) alert("Erro ao enviar para Cloud: " + (syncError.message || "Erro desconhecido"));
      } catch (err: any) { 
          console.error("Erro fatal na sincronização:", err.message); 
      } finally { 
          setIsLoading(false); 
      }
      
      if(finalInv.source !== 'POS') setCurrentView('INVOICES');
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleSavePurchase(purchase: Purchase) {
    if (isLicenseExpired) {
        alert("LICENÇA EXPIRADA: O sistema encontra-se em modo de visualização. Contacte o suporte IMATEC para renovar.");
        return;
    }

    setIsLoading(true);
    const finalPurchase = { 
        ...purchase, 
        integrationStatus: IntegrationStatus.VALIDATED,
        processedAt: new Date().toISOString()
    };

    if (finalPurchase.type === PurchaseType.FR && finalPurchase.cashRegisterId && finalPurchase.paymentMethod && finalPurchase.status !== 'CANCELLED') {
        const amount = finalPurchase.total;
        const regId = ensureUUID(finalPurchase.cashRegisterId);
        const reg = cashRegisters.find(c => c.id === finalPurchase.cashRegisterId);
        const newBalance = (reg?.balance || 0) - amount;
        setCashRegisters(prev => prev.map(cr => cr.id === finalPurchase.cashRegisterId ? { ...cr, balance: newBalance } : cr));
        try {
            if (regId) {
              await supabase.from('caixas').update({ balance: newBalance }).eq('id', regId);
              const companyIdForCashPur = await getSecureEmpresaId();
              await supabase.from('movimentos_caixa').insert({
                  tipo_movimento: 'saída',
                  valor: amount,
                  descricao: `Pagamento Compra FR ${finalPurchase.documentNumber}`,
                  caixa_id: regId,
                  referencia: finalPurchase.documentNumber,
                  metodo_pagamento: finalPurchase.paymentMethod,
                  operador_nome: currentUser?.name || 'Sistema',
                  origem: 'compras',
                  data_movimento: new Date().toISOString().split('T')[0],
                  empresa_id: companyIdForCashPur
              });
            }
        } catch (e: any) { 
            console.error("Erro integração caixa compra:", e); 
            const msg = e?.message || e?.error_description || (typeof e === 'object' ? JSON.stringify(e) : String(e));
            alert("Erro integração caixa compra: " + msg);
        }
    }

    setPurchases([finalPurchase, ...purchases.filter(p => p.id !== finalPurchase.id)]);

    if (finalPurchase.status !== 'CANCELLED') {
        const companyIdForStockPur = await getSecureEmpresaId();
        for (const item of finalPurchase.items) {
            if (item.productId) {
                try {
                    const prodUUID = ensureUUID(item.productId);
                    const targetWarehouse = item.warehouseId || finalPurchase.warehouseId;
                    const whUUID = ensureUUID(targetWarehouse || '');
                    if (prodUUID) {
                      await supabase.from('movimentos_stock').insert({
                          tipo: 'ENTRY',
                          produto_id: prodUUID,
                          produto_nome: item.description,
                          quantidade: item.quantity,
                          armazem_id: whUUID,
                          documento_ref: finalPurchase.documentNumber,
                          notes: `Entrada Automática Compra: ${finalPurchase.documentNumber}`,
                          expiry_date: item.expiryDate || null, 
                          empresa_id: companyIdForStockPur
                      });
                    }
                } catch (e: any) { console.error("Erro stock compra:", e?.message || e); }
            }
        }
    }

    try {
        const companyIdToUse = await getSecureEmpresaId();
        const purchasePayload = {
            id: ensureUUID(finalPurchase.id) || undefined,
            tipo_documento: finalPurchase.type,
            numero_documento: finalPurchase.documentNumber,
            fornecedor_id: ensureUUID(finalPurchase.supplierId),
            fornecedor_nome: finalPurchase.supplier,
            nif_fornecedor: finalPurchase.nif,
            data_emissao: finalPurchase.date,
            valor_subtotal: finalPurchase.subtotal,
            valor_iva: finalPurchase.taxAmount,
            valor_total: finalPurchase.total,
            status: finalPurchase.status,
            empresa_id: companyIdToUse,
            items: finalPurchase.items,
            hash: finalPurchase.hash,
            armazem_id: ensureUUID(finalPurchase.warehouseId),
            work_location_id: ensureUUID(finalPurchase.workLocationId),
            metodo_pagamento: finalPurchase.paymentMethod,
            caixa_id: ensureUUID(finalPurchase.cashRegisterId)
        };
        const { error } = await supabase.from('compras').upsert(purchasePayload);
        if (error) throw error;
        await fetchPurchasesCloud();
    } catch (err: any) { 
      console.error("Erro ao sincronizar compra:", err); 
      // Fix: Added proper reference to catch variable 'err' to replace undefined 'e'
      const msg = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      alert("Erro ao sincronizar compra: " + msg);
    } finally { 
      setIsLoading(false); 
    }
    setCurrentView('STOCK');
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleLiquidate(invoice: Invoice, amount: number, method: PaymentMethod, registerId: string, dateValue: string, docDate: string) {
      setIsLoading(true);
      const docSeries = series.find(s => s.id === invoice.seriesId) || series[0];
      const typeKey = InvoiceType.RG as string;
      const currentSeq = docSeries.sequences[typeKey] || 0;
      const nextSeq = currentSeq + 1;
      const number = `RC ${docSeries.code || 'S'} ${docSeries.year}/${nextSeq}`;
      
      const receipt: Invoice = {
          id: generateId(),
          type: InvoiceType.RG,
          seriesId: docSeries.id,
          number,
          date: docDate,
          dueDate: docDate,
          accountingDate: dateValue,
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          clientNif: invoice.clientNif,
          items: [{ id: generateId(), type: 'SERVICE', description: `Pagamento Ref: ${invoice.number}`, quantity: 1, unitPrice: amount, discount: 0, taxRate: 0, total: amount }],
          subtotal: amount, globalDiscount: 0, taxRate: 0, taxAmount: 0, withholdingAmount: 0, retentionAmount: 0, total: amount,
          currency: invoice.currency, exchangeRate: invoice.exchangeRate,
          status: InvoiceStatus.PAID,
          isCertified: true,
          hash: generateInvoiceHash(invoice),
          companyId: invoice.companyId,
          workLocationId: invoice.workLocationId,
          sourceInvoiceId: invoice.id,
          paymentMethod: method,
          cashRegisterId: registerId,
          operatorName: currentUser?.name,
          time: new Date().toLocaleTimeString(),
          integrationStatus: IntegrationStatus.VALIDATED,
          processedAt: new Date().toISOString(),
      };

      const updatedInvoice = { 
          ...invoice, 
          paidAmount: (invoice.paidAmount || 0) + amount,
          status: ((invoice.paidAmount || 0) + amount) >= invoice.total ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL
      };

      const updatedSequences = { ...docSeries.sequences, [typeKey]: nextSeq };
      setSeries(series.map(s => s.id === docSeries.id ? { ...s, sequences: updatedSequences } : s));

      await supabase.from('series').update({
          sequencia_atual: nextSeq,
          sequencias_por_tipo: updatedSequences
      }).eq('id', docSeries.id);

      setInvoices([receipt, ...invoices.map(i => i.id === invoice.id ? updatedInvoice : i)]);

      try {
        const companyIdToUse = await getSecureEmpresaId();
        const regUUID = ensureUUID(registerId);
        const invUUID = ensureUUID(invoice.id);

        if (regUUID) {
            await supabase.from('faturas').upsert({
              id: ensureUUID(receipt.id) || undefined,
              empresa_id: companyIdToUse,
              cliente_id: ensureUUID(receipt.clientId),
              numero_fatura: receipt.number,
              data_fatura: receipt.date,
              total: Number(receipt.total),
              iva: 0,
              status: 'Pago',
              source: 'MANUAL',
              caixa_id: regUUID,
              metodo_pagamento: method,
              tipo_fatura: 'RC',
              source_invoice_id: invUUID,
              work_location_id: ensureUUID(receipt.workLocationId),
              time: receipt.time,
              serie_id: docSeries.id,
              hash: receipt.hash || '',
              operator_name: receipt.operatorName
            });

            if (invUUID) {
                await supabase.from('faturas').update({
                    status: updatedInvoice.status === InvoiceStatus.PAID ? 'Pago' : 'Pendente'
                }).eq('id', invUUID);
            }

            const reg = cashRegisters.find(c => c.id === registerId);
            const newBalance = (reg?.balance || 0) + amount;
            await supabase.from('caixas').update({ balance: newBalance }).eq('id', regUUID);
            setCashRegisters(prev => prev.map(c => c.id === registerId ? { ...c, balance: newBalance } : c));
        }
      } catch (err: any) { console.error("Erro liquidação:", err.message); } finally { setIsLoading(false); }
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleCancelInvoice(id: string, reason: string) {
      setIsLoading(true);
      const invoice = invoices.find(i => i.id === id);
      if (!invoice) return;

      const docSeries = series.find(s => s.id === invoice.seriesId) || series[0];
      let cancelType = InvoiceType.NC; 
      if (invoice.type === InvoiceType.NC) cancelType = InvoiceType.ND; 
      const typeKey = cancelType as string;
      const nextSeq = (docSeries.sequences[typeKey] || 0) + 1;
      const prefix = getDocumentPrefix(cancelType);
      const cancelNumber = `${prefix} ${docSeries.code || 'S'} ${docSeries.year}/${nextSeq}`;

      const rectification: Invoice = {
          ...invoice,
          id: generateId(),
          type: cancelType,
          number: cancelNumber,
          date: new Date().toISOString().split('T')[0],
          accountingDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          status: InvoiceStatus.PAID,
          isCertified: true,
          hash: generateInvoiceHash(invoice),
          notes: `Anulação do documento ${invoice.number}. Motivo: ${reason}`,
          sourceInvoiceId: invoice.id,
          source: 'MANUAL',
          operatorName: currentUser?.name,
          time: new Date().toLocaleTimeString(),
          integrationStatus: IntegrationStatus.VALIDATED,
          processedAt: new Date().toISOString(),
          taxRate: invoice.taxRate
      };

      const updatedSequences = { ...docSeries.sequences, [typeKey]: nextSeq };
      setSeries(series.map(s => s.id === docSeries.id ? { ...s, sequences: updatedSequences } : s));
      
      await supabase.from('series').update({
          sequencia_atual: nextSeq,
          sequencias_por_tipo: updatedSequences
      }).eq('id', docSeries.id);

      setInvoices([rectification, ...invoices.map(i => i.id === id ? { ...i, status: InvoiceStatus.CANCELLED, cancellationReason: reason } : i)]);

      try {
          const companyIdToUse = await getSecureEmpresaId();
          const rectUUID = ensureUUID(rectification.id);
          const originalInvoiceUUID = ensureUUID(id);

          if (rectUUID && originalInvoiceUUID) {
            await supabase.from('faturas').upsert({
                id: rectUUID,
                empresa_id: companyIdToUse,
                cliente_id: ensureUUID(rectification.clientId),
                numero_fatura: rectification.number,
                data_fatura: rectification.date,
                total: Number(rectification.total),
                iva: Number(rectification.taxAmount),
                status: 'Anulado',
                tipo_fatura: prefix,
                source_invoice_id: originalInvoiceUUID,
                work_location_id: ensureUUID(rectification.workLocationId),
                time: rectification.time,
                serie_id: docSeries.id,
                hash: rectification.hash || '',
                operator_name: rectification.operatorName
            });
            await supabase.from('faturas').update({ status: 'Anulado' }).eq('id', originalInvoiceUUID);
          }
      } catch (err: any) { console.error("Erro anulação:", err.message); } finally { setIsLoading(false); }
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleDeleteInvoice(id: string) {
      const inv = invoices.find(i => i.id === id);
      if (inv?.isCertified) {
          alert("REGRA AGT: Documentos certificados não podem ser apagados do sistema.");
          return;
      }
      setInvoices(invoices.filter(i => i.id !== id));
      try { 
          const uuid = ensureUUID(id);
          if (uuid) await supabase.from('faturas').delete().eq('id', uuid); 
      } catch (err: any) { console.error("Erro delete cloud:", err); }
  }

  /** Converted to function declaration to ensure availability during render */
  function handleSaveClient(client: Client) {
    setClients(prev => {
        const index = prev.findIndex(c => c.id === client.id || c.vatNumber === client.vatNumber);
        if (index >= 0) {
            const updated = [...prev];
            updated[index] = client;
            return updated;
        }
        return [client, ...prev];
    });
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleSaveCompany(company: Company) {
      setIsLoading(true);
      try {
          const { error } = await supabase.from('empresas').upsert({
              id: company.id,
              nome: company.name,
              nif: company.nif,
              email: company.email,
              telefone: company.phone,
              morada: company.address,
              regime: company.regime,
              plano: company.licensePlan,
              status: company.status,
              validade: company.validUntil,
              codigo_postal: company.postalCode,
              matricula: company.registrationNumber,
              alvara: company.licenseNumber,
              num_inss: company.inssNumber,
              tipo_empresa: company.companyType,
              iva_caixa: company.cashVAT
          });
          if (error) throw error;
          setCurrentCompany(company);
          alert("Dados da empresa atualizados com sucesso na Cloud!");
      } catch (err: any) {
          console.error("Erro ao salvar empresa:", err);
          alert("Aviso: Falha ao sincronizar com a Cloud. A atualização foi aplicada localmente para esta sessão.");
          setCurrentCompany(company);
      } finally {
          setIsLoading(false);
      }
  }

  /** Converted to function declaration to ensure availability during render */
  async function handleSaveEmployee(emp: Employee) {
    setIsLoading(true);
    try {
        const companyIdToUse = await getSecureEmpresaId();
        const payload = {
            id: ensureUUID(emp.id) || undefined,
            nome: emp.name,
            nif: emp.nif,
            bi: emp.biNumber,
            num_inss: emp.ssn,
            cargo: emp.role,
            departamento: emp.department,
            salario_base: emp.baseSalary,
            status: emp.status,
            employment_status: emp.employmentStatus || (emp.status === 'Terminated' ? 'demitido' : 'ativo'),
            data_admissao: emp.admissionDate,
            tipo_contrato: emp.contractType,
            subs_transporte: emp.subsidyTransport,
            subs_alimentacao: emp.subsidyFood,
            subs_familia: emp.subsidyFamily,
            genero: emp.gender,
            estado_civil: emp.maritalStatus,
            morada: emp.address,
            municipio: emp.municipality,
            bairro: emp.neighborhood,
            foto_url: emp.photoUrl,
            idnf: emp.idnf,
            is_caixa: emp.isCashier,
            is_magic: emp.isMagic,
            local_trabalho_id: ensureUUID(emp.workLocationId),
            empresa_id: companyIdToUse,
            dismissal_date: emp.dismissalDate,
            // Fixed: use correct property names for Employee interface (camelCase)
            dismissed_by: emp.dismissedBy,
            dismissal_reason: emp.dismissalReason,
            rehire_date: emp.rehireDate,
            rehire_orderer: emp.rehireOrderer,
            rehire_reason: emp.rehireReason,
            occurrence: emp.occurrence
        };

        const { error } = await supabase.from('funcionarios').upsert(payload);
        if (error) throw error;
        
        await fetchHrEmployeesCloud();
    } catch (err: any) {
        console.error("Erro ao salvar funcionário:", err);
        const errorMsg = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        alert("Erro ao salvar na Cloud: " + errorMsg);
    } finally {
        setIsLoading(false);
    }
  }

  async function initAppCloud() {
    setIsLoading(true);
    setCloudError(null);
    try {
      const { data: companies, error: compError } = await supabase.from('empresas').select('*').limit(1);
      
      if (compError) {
          throw new Error(`Erro na tabela empresas: ${compError.message} (Código: ${compError.code})`);
      }

      if (companies && companies.length > 0) {
          const comp = companies[0];
          setRealEmpresaId(comp.id);
          setCurrentCompany({
            id: comp.id,
            name: comp.nome,
            nif: comp.nif,
            address: comp.endereco || comp.morada,
            email: comp.email,
            phone: comp.telefone,
            regime: comp.regime || 'Regime Geral',
            licensePlan: comp.plano || 'PROFESSIONAL',
            status: comp.status || 'ACTIVE',
            validUntil: comp.validade,
            activationDate: comp.data_ativacao,
            registrationDate: comp.created_at,
            postalCode: comp.codigo_postal,
            registrationNumber: comp.matricula,
            licenseNumber: comp.alvara,
            inssNumber: comp.num_inss,
            companyType: comp.tipo_empresa,
            cashVAT: comp.iva_caixa,
            footerCustom: comp.rodape_personalizado,
            watermark: comp.marca_agua,
            currentDebt: comp.divida_atual,
            appliedDiscount: comp.desconto_aplicado
          });
      }

      await Promise.allSettled([
          fetchInvoicesCloud(),
          fetchPurchasesCloud(),
          fetchCashRegistersCloud(),
          fetchCashClosuresCloud(),
          fetchContractsCloud(),
          fetchWorkLocationsCloud(),
          fetchProductsCloud(),
          fetchWarehousesCloud(),
          fetchClientsCloud(),
          fetchSuppliersCloud(),
          fetchSeriesCloud(),
          fetchTaxRatesCloud(),
          fetchBanksCloud(),
          fetchMetricsCloud(),
          fetchUsersCloud(),
          fetchInternalProfessionsCloud(),
          fetchHrEmployeesCloud(),
          fetchTransferOrdersCloud()
      ]);

    } catch (err: any) {
        console.error("Erro crítico ao inicializar Cloud:", err);
        const detailedMessage = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        setCloudError(`Erro de conexão com a base de dados: ${detailedMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser) {
      initAppCloud();
    }
  }, [currentUser]);

  const handleLogin = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) setCurrentUser(user);
    else alert("Credenciais inválidas.");
  };

  const renderView = () => {
    if (!currentUser) return <LoginPage onLogin={handleLogin} />;

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard invoices={certifiedInvoices} />;
      case 'WORKSPACE': return <Workspace invoices={certifiedInvoices} purchases={validPurchases} clients={clients} onViewInvoice={(inv) => { setInvoiceInitialData(inv); setCurrentView('CREATE_INVOICE'); }} onViewProject={handleViewProjectReport} onRefreshPurchases={fetchPurchasesCloud} />;
      case 'PROJECT_REPORT': return selectedProject ? <ProjectReport project={selectedProject} invoices={certifiedInvoices} purchases={validPurchases} onBack={() => setCurrentView('WORKSPACE')} /> : <Workspace invoices={certifiedInvoices} purchases={validPurchases} clients={clients} onViewInvoice={(inv) => { setInvoiceInitialData(inv); setCurrentView('CREATE_INVOICE'); }} onViewProject={handleViewProjectReport} />;
      case 'CRM': return <CRMManager onUpdateCompany={initAppCloud} />;
      case 'ARCHIVES': return <ArchivesManager />;
      case 'FINANCE_TAX_DOCS': return <TaxDocsManager />;
      case 'INVOICES': return <InvoiceList invoices={invoices} onDelete={handleDeleteInvoice} onUpdate={i => { setInvoiceInitialData(i); setCurrentView('CREATE_INVOICE'); }} onLiquidate={handleLiquidate} onCancelInvoice={handleCancelInvoice} onCertify={i => handleSaveInvoice(i, i.seriesId, 'CERTIFY')} onCreateNew={()=>{ setInvoiceInitialData(undefined); setCurrentView('CREATE_INVOICE'); }} onCreateDerived={(s, t) => { setInvoiceInitialType(t); setInvoiceInitialData({ clientId: s.clientId, items: s.items.map(i=>({...i, id: generateId()})), sourceInvoiceId: s.id, currency: s.currency, exchangeRate: s.exchangeRate }); setCurrentView('CREATE_INVOICE'); }} onUpload={()=>{}} onViewReports={()=>{}} onQuickUpdate={()=>{}} onViewClientAccount={(cid) => { setSelectedClientId(cid); setCurrentView('CLIENTS'); }} currentCompany={currentCompany} workLocations={workLocations} cashRegisters={cashRegisters} series={series} currentUser={currentUser} />;
      case 'CREATE_INVOICE': return <InvoiceForm onSave={handleSaveInvoice} onCancel={()=>setCurrentView('INVOICES')} onViewList={()=>setCurrentView('INVOICES')} onAddWorkLocation={()=>{}} onSaveClient={handleSaveClient} onSaveWorkLocation={wl => setWorkLocations([...workLocations, wl])} clients={clients} products={products} workLocations={workLocations} cashRegisters={cashRegisters} series={series} warehouses={warehouses} initialType={invoiceInitialType} initialData={invoiceInitialData} currentUser={currentUser.name} currentUserId={currentUser.id} currentCompany={currentCompany} taxRates={taxRates.filter(t => t.isActive)} metrics={metrics} />;
      case 'PURCHASES': return <PurchaseList purchases={purchases} onDelete={handleDeleteInvoice} onUpdate={p => { setPurchaseInitialData(p); setCurrentView('CREATE_PURCHASE'); }} onCreateNew={() => { setPurchaseInitialData(undefined); setCurrentView('CREATE_PURCHASE'); }} onUpload={()=>{}} onSaveSupplier={s => setSuppliers([...suppliers, s])} />;
      case 'CREATE_PURCHASE': return <PurchaseForm onSave={handleSavePurchase} onCancel={() => setCurrentView('PURCHASES')} onViewList={() => setCurrentView('PURCHASES')} products={products} workLocations={workLocations} cashRegisters={cashRegisters} suppliers={suppliers} warehouses={warehouses} onSaveSupplier={s => setSuppliers([...suppliers, s])} initialData={purchaseInitialData} currentUser={currentUser.name} currentUserId={currentUser.id} currentCompany={currentCompany} taxRates={taxRates.filter(t => t.isActive)} metrics={metrics} />;
      case 'CLIENTS': return <ClientList clients={clients} onSaveClient={handleSaveClient} initialSelectedClientId={selectedClientId} onClearSelection={() => setSelectedClientId(null)} currentCompany={currentCompany} invoices={invoices} workLocations={workLocations} />;
      case 'SUPPLIERS': return <SupplierList suppliers={suppliers} onSaveSupplier={s => setSuppliers([...suppliers, s])} purchases={validPurchases} workLocations={workLocations} />;
      case 'PURCHASE_ANALYSIS': return <PurchaseAnalysis purchases={validPurchases} />;
      case 'STOCK': return <StockManager products={products} setProducts={setProducts} warehouses={warehouses} setWarehouses={setWarehouses} priceTables={priceTables} setPriceTables={setPriceTables} movements={stockMovements} invoices={invoices} purchases={purchases} suppliers={suppliers} onSavePurchase={handleSavePurchase} onStockMovement={m => setStockMovements([...stockMovements, m])} onCreateDocument={(t, i, n) => { setInvoiceInitialType(t); setInvoiceInitialData({items: i, notes: n}); setCurrentView('CREATE_INVOICE'); }} onOpenReportOverlay={() => setCurrentView('FINANCE_REPORTS')} cashRegisters={cashRegisters} clients={clients} workLocations={workLocations} series={series} />;
      case 'SETTINGS':
        return <Settings 
                  series={series} 
                  onSaveSeries={async (s) => {
                      const companyIdToUse = await getSecureEmpresaId();
                      const { error } = await supabase.from('series').upsert({
                          id: s.id || generateId(),
                          nome: s.name,
                          codigo: s.code,
                          tipo: s.type,
                          ano: s.year,
                          sequencia_atual: s.currentSequence,
                          sequencias_por_tipo: s.sequences,
                          ativo: s.isActive,
                          utilizadores_autorizados: s.allowedUserIds,
                          detalhes_bancarios: s.bankDetails,
                          texto_rodape: s.footerText,
                          empresa_id: companyIdToUse
                      });
                      if(!error) await fetchSeriesCloud();
                  }} 
                  onEditSeries={async (s) => {
                      await supabase.from('series').update({
                          nome: s.name,
                          codigo: s.code,
                          tipo: s.type,
                          ano: s.year,
                          ativo: s.isActive,
                          utilizadores_autorizados: s.allowedUserIds,
                          detalhes_bancarios: s.bankDetails,
                          texto_rodape: s.footerText
                      }).eq('id', s.id);
                      await fetchSeriesCloud();
                  }}
                  users={users} 
                  onSaveUser={(u) => setUsers([...users.filter(x => x.id !== u.id), u])} 
                  onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
                  workLocations={workLocations} 
                  onSaveWorkLocation={(wl) => setWorkLocations([...workLocations, wl])}
                  onDeleteWorkLocation={(id) => setWorkLocations(workLocations.filter(w => w.id !== id))}
                  cashRegisters={cashRegisters}
                  onSaveCashRegister={(cr) => setCashRegisters([...cashRegisters.filter(x => x.id !== cr.id), cr])}
                  onDeleteCashRegister={id => setCashRegisters(prev => prev.filter(x => x.id !== id))}
                  onTaxRatesUpdate={setTaxRates}
                  banks={banks}
                  onSaveBank={b => setBanks([...banks.filter(x => x.id !== b.id), b])}
                  onDeleteBank={id => setBanks(banks.filter(x => x.id !== id))}
                  metrics={metrics}
                  onSaveMetric={m => setMetrics([...metrics.filter(x => x.id !== m.id), m])}
                  onDeleteMetric={id => setMetrics(metrics.filter(x => x.id !== id))}
                  currentCompany={currentCompany}
                  onSaveCompany={handleSaveCompany}
               />;
      case 'FINANCE_CASH': return <CashManager cashRegisters={cashRegisters} onUpdateCashRegister={cr => setCashRegisters(cashRegisters.map(c => c.id === cr.id ? cr : c))} movements={[]} onAddMovement={()=>{}} invoices={certifiedInvoices} purchases={validPurchases} />;
      case 'FINANCE_MAPS': return <CostRevenueMap invoices={certifiedInvoices} purchases={validPurchases} />;
      case 'FINANCE_REPORTS': return <ManagementReports invoices={certifiedInvoices} products={products} />;
      case 'ACCOUNTING_VAT': return <VatSettlementMap invoices={certifiedInvoices} purchases={validPurchases} history={vatSettlements} onSaveSettlement={s => setVatSettlements([s, ...vatSettlements])} />;
      case 'ACCOUNTING_PGC': return <PGCManager accounts={pgcAccounts} onSaveAccount={a => setPgcAccounts([...pgcAccounts, a])} onUpdateAccount={a => setPgcAccounts(pgcAccounts.map(x => x.id === a.id ? a : x))} />;
      case 'ACCOUNTING_CLASSIFY_SALES': return <ClassifyMovement mode="SALES" invoices={certifiedInvoices} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => setCurrentView('ACCOUNTING_RUBRICAS_SALES')} />;
      case 'ACCOUNTING_CLASSIFY_PURCHASES': return <ClassifyMovement mode="PURCHASES" invoices={certifiedInvoices} purchases={validPurchases} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => setCurrentView('ACCOUNTING_RUBRICAS_PURCHASES')} />;
      case 'ACCOUNTING_CLASSIFY_SALARY_PROC': return <ClassifyMovement mode="SALARY_PROC" invoices={certifiedInvoices} payroll={payrollHistory} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => {}} />;
      case 'ACCOUNTING_CLASSIFY_SALARY_PAY': return <ClassifyMovement mode="SALARY_PAY" invoices={certifiedInvoices} payroll={payrollHistory} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => {}} />;
      case 'ACCOUNTING_RUBRICAS_SALES': return <RubricasManager mode="SALES" invoices={certifiedInvoices} pgcAccounts={pgcAccounts} onUpdateInvoice={i => setInvoices(invoices.map(x => x.id === i.id ? i : x))} />;
      case 'ACCOUNTING_RUBRICAS_PURCHASES': return <RubricasManager mode="PURCHASES" invoices={certifiedInvoices} purchases={validPurchases} pgcAccounts={pgcAccounts} onUpdateInvoice={()=>{}} onUpdatePurchase={p => setPurchases(purchases.map(x => x.id === p.id ? p : x))} />;
      case 'ACCOUNTING_MAPS': return <AccountingMaps invoices={certifiedInvoices} purchases={validPurchases} company={currentCompany} onOpenOpeningBalance={() => setCurrentView('ACCOUNTING_OPENING_BALANCE')} />;
      case 'ACCOUNTING_WITHHOLDING_MAPS': return <WithholdingMaps onChangeView={setCurrentView} />;
      case 'ACCOUNTING_WITHHOLDING_RECEIVABLE': return <WithholdingReceivable invoices={certifiedInvoices} company={currentCompany} onBack={() => setCurrentView('ACCOUNTING_WITHHOLDING_MAPS')} />;
      case 'ACCOUNTING_WITHHOLDING_PAYABLE': return <WithholdingPayable purchases={validPurchases} company={currentCompany} onBack={() => setCurrentView('ACCOUNTING_WITHHOLDING_MAPS')} />;
      case 'ACCOUNTING_DECLARATIONS': return <Model7 invoices={certifiedInvoices} purchases={validPurchases} company={currentCompany} />;
      case 'ACCOUNTING_TAXES': return <TaxManager invoices={certifiedInvoices} company={currentCompany} purchases={validPurchases} payroll={payrollHistory} />;
      case 'ACCOUNTING_CALC': return <TaxCalculationMap invoices={certifiedInvoices} purchases={validPurchases} />;
      case 'ACCOUNTING_SAFT': return <SaftExport invoices={certifiedInvoices} purchases={validPurchases} clients={clients} suppliers={suppliers} />;
      case 'ACCOUNTING_OPENING_BALANCE': return <OpeningBalanceMap accounts={pgcAccounts} savedBalances={openingBalances} onSaveBalances={setOpeningBalances} onBack={() => setCurrentView('ACCOUNTING_MAPS')} onViewAccount={(code) => { setSelectedExtractAccount(code); setCurrentView('ACCOUNTING_ACCOUNT_EXTRACT'); }} />;
      case 'ACCOUNTING_ACCOUNT_EXTRACT': return <AccountExtract company={currentCompany} accountCode={selectedExtractAccount || '31'} year={globalYear} pgcAccounts={pgcAccounts} openingBalances={openingBalances} invoices={certifiedInvoices} onBack={() => setCurrentView('ACCOUNTING_MAPS')} onUpdateAccountCode={(o, n) => setSelectedExtractAccount(n)} onUpdateBalance={b => setOpeningBalances(openingBalances.map(x => x.id === b.id ? b : x))} />;
      case 'ACCOUNTING_REGULARIZATION': return <RegularizationMap invoices={invoices} onViewInvoice={(inv) => { setInvoiceInitialData(inv); setCurrentView('CREATE_INVOICE'); }} />;
      case 'HR_EMPLOYEES': return <Employees employees={hrEmployees} onSaveEmployee={handleSaveEmployee} workLocations={workLocations} professions={professions} contracts={contracts} payroll={payrollHistory} onIssueContract={i => { setSelectedHrEmployee(i); setCurrentView('HR_CONTRACT_ISSUE'); }} />;
      case 'HR_EFFECTIVENESS_MAP': return <EffectivenessMap employees={hrEmployees} company={currentCompany} year={globalYear} month={new Date().getMonth() + 1} />;
      case 'HR_SALARY_LIST': return <SalaryListReport employees={hrEmployees} payroll={payrollHistory} year={globalYear} />;
      case 'HR_TRANSFER_ORDER':
      case 'HR':
          return <HumanResources 
                    employees={hrEmployees}
                    onSaveEmployee={handleSaveEmployee}
                    transactions={hrTransactions}
                    onSaveTransaction={t => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={v => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    transferHistory={transferOrders}
                    onProcessPayroll={handleProcessPayroll}
                    onClearPayroll={handleClearPayroll}
                    onSaveTransferOrder={handleSaveTransferOrder}
                    professions={professions}
                    onSaveProfession={p => setProfessions([...professions, p])}
                    onDeleteProfession={id => setProfessions(professions.filter(x => x.id !== id))}
                    contracts={contracts}
                    onSaveContract={setContracts}
                    attendance={attendance}
                    onSaveAttendance={a => setAttendance([...attendance, a])}
                    company={currentCompany}
                    currentView={currentView}
                    cashRegisters={cashRegisters}
                    onIssueContract={i => { setSelectedHrEmployee(i); setCurrentView('HR_CONTRACT_ISSUE'); }}
                 />;
      case 'HR_PERFORMANCE': return <PerformanceAnalysis logs={userActivity} employees={hrEmployees} users={users} />;
      case 'HR_CONTRACT_ISSUE': 
        if (!selectedHrEmployee) return <div className="p-8 text-center text-slate-400">Seleccione um funcionário primeiro.</div>;
        return <ContractGenerator employee={selectedHrEmployee} company={currentCompany} onBack={() => setCurrentView('HR_EMPLOYEES')} onSave={(c) => { setContracts([...contracts, c]); fetchContractsCloud(); setCurrentView('HR'); }} />;
      case 'SECRETARIA_LIST': return <SecretariaList documents={secDocuments} onCreateNew={() => setCurrentView('SECRETARIA_FORM')} onEdit={doc => { setInvoiceInitialData({ ...doc } as any); setCurrentView('SECRETARIA_FORM'); }} />;
      case 'SECRETARIA_FORM': return <SecretariaForm onSave={doc => { setSecDocuments([doc, ...secDocuments.filter(d => d.id !== doc.id)]); setCurrentView('SECRETARIA_LIST'); }} onCancel={() => setCurrentView('SECRETARIA_LIST')} series={series} document={invoiceInitialData as any} />;
      
      case 'POS_GROUP':
      case 'POS': return <POS products={products} clients={clients} invoices={invoices} series={series} cashRegisters={cashRegisters} config={posConfig} onSaveInvoice={handleSaveInvoice} onGoBack={() => setCurrentView('DASHBOARD')} currentUser={currentUser} company={currentCompany} warehouses={warehouses} workLocations={workLocations} />;
      case 'CASH_CLOSURE': return <CashClosure registers={cashRegisters} invoices={invoices} movements={[]} onSaveClosure={c => { setCashClosures([c, ...cashClosures]); fetchCashClosuresCloud(); }} onGoBack={() => setCurrentView('DASHBOARD')} currentUser={currentUser?.name || "Admin"} currentUserId={currentUser?.id || "u1"} />;
      case 'CASH_CLOSURE_HISTORY': return <CashClosureHistory closures={cashClosures} />;
      case 'POS_SETTINGS': return <POSSettings config={posConfig} onSaveConfig={setPosConfig} series={series} clients={clients} />;
      
      case 'SCHOOL_GROUP':
      case 'SCHOOL_STUDENTS':
      case 'SCHOOL_ACADEMIC':
      case 'SCHOOL_DOCUMENTS':
      case 'SCHOOL_REPORTS':
          return <SchoolManagement currentSubView={currentView} />;
      case 'RESTAURANT_GROUP':
      case 'RESTAURANT_MENU':
      case 'RESTAURANT_TABLES':
      case 'RESTAURANT_KDS':
      case 'RESTAURANT_PRODUCTION':
          return <RestaurantManagement currentSubView={currentView} />;
      case 'HOTEL_GROUP':
      case 'HOTEL_ROOMS':
      case 'HOTEL_RESERVATIONS':
      case 'HOTEL_CHECKIN':
      case 'HOTEL_GOVERNANCE':
          return <HotelManagement currentSubView={currentView} />;
      
      case 'REPORTS_MOVEMENTS':
          return <GeneralMovements invoices={certifiedInvoices} purchases={validPurchases} clients={clients} products={products} cashRegisters={cashRegisters} workLocations={workLocations} />;
      
      case 'INSS_LIST': return <InssList employees={hrEmployees} company={currentCompany} onBack={() => setCurrentView('DASHBOARD')} year={globalYear} />;
      case 'SITUACAO_LABORAL': return <LaborStatus employees={hrEmployees} onRehire={(emp) => { setSelectedHrEmployee(emp); }} />;

      default: return <div className="p-8 text-center text-slate-400">Selecione um módulo para continuar.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} currentUser={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-24 flex items-center justify-between px-6 shadow-md shrink-0 z-10">
          <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"><Menu /></button>
             <div className="flex items-center gap-4 border-r pr-6 border-slate-200 h-16">
                 <div className="w-16 h-16 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-xl transform hover:scale-105 transition-all">IM</div>
                 <div className="hidden lg:block">
                    <h2 className="font-black text-xl text-slate-900 leading-none tracking-tighter">IMATEC SOFTWARE</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[3px] mt-1">Sistemas de Gestão</p>
                 </div>
             </div>
             <div className="hidden xl:flex flex-col">
                 <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-1">Empresa Licenciada</h2>
                 <h2 className="font-bold text-slate-700 tracking-tight text-sm truncate max-w-[300px]">{currentCompany.name}</h2>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-800">
                 <ClockIcon size={16} className="text-blue-400 animate-pulse"/>
                 <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-0.5">Hora Local</span>
                     <span className="font-mono font-bold text-sm tracking-widest">{currentTime.toLocaleTimeString('pt-AO', { hour12: false })}</span>
                 </div>
             </div>
             {isLoading && <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full animate-pulse border border-blue-100"><Loader2 size={12} className="animate-spin"/> Sincronizando...</div>}
             <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 px-2 border hover:border-slate-300 transition-all shadow-inner">
                 <CalendarIcon size={14} className="text-slate-500"/>
                 <select className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer" value={globalYear} onChange={(e) => setGlobalYear(Number(e.target.value))}>
                     <option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option>
                 </select>
             </div>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || "Administrador"}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{currentUser?.role || "ADMIN"}</p>
                 </div>
                 <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-lg border-2 border-slate-100 shadow-lg transition-transform hover:scale-110 cursor-pointer">{(currentUser?.name || 'A').charAt(0)}</div>
             </div>
          </div>
        </header>
        {isLicenseExpired && currentView !== 'CRM' && currentView !== 'SETTINGS' && (
            <div className="bg-red-600 text-white px-6 py-2 flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="animate-bounce"/>
                    <span className="font-black uppercase text-xs tracking-widest">Aviso: A licença de uso expirou em {formatDate(currentCompany.validUntil)}. O sistema está em modo restrito de visualização.</span>
                </div>
                <button className="bg-white text-red-600 px-4 py-1 rounded-lg font-black text-[10px] uppercase">Regularizar Agora</button>
            </div>
        )}
        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
           {cloudError && (
             <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 text-red-700 animate-in slide-in-from-top duration-500">
                <AlertCircle className="shrink-0 mt-0.5" size={24}/>
                <div>
                   <h3 className="font-black uppercase text-sm tracking-widest mb-1">Erro de Conexão Cloud</h3>
                   <p className="text-xs font-bold leading-relaxed">{cloudError}</p>
                   <button onClick={initAppCloud} className="mt-3 px-6 py-1.5 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition shadow-lg">Tentar Re-conectar</button>
                </div>
             </div>
           )}
           {renderView()}
        </main>
      </div>
      <AIAssistant invoices={invoices} purchases={purchases} clients={clients} />
    </div>
  );
};

export default App;