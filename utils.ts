
import { Invoice, InvoiceType } from "./types";
// Import XLSX for spreadsheet export functionality
import * as XLSX from "xlsx";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateInvoiceHash = (invoice: Invoice): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "";
  for(let i=0; i<4; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

export const generateQrCodeUrl = (data: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
};

export const getDocumentPrefix = (type: InvoiceType): string => {
  switch (type) {
    case InvoiceType.FT: return 'FT';
    case InvoiceType.FR: return 'FR';
    case InvoiceType.RG: return 'RC';
    case InvoiceType.NC: return 'NC';
    case InvoiceType.ND: return 'ND';
    case InvoiceType.PP: return 'PP';
    case InvoiceType.OR: return 'OR';
    case InvoiceType.GT: return 'GT';
    case InvoiceType.GR: return 'GR';
    case InvoiceType.VD: return 'VD';
    default: return 'DOC';
  }
};

export const numberToExtenso = (valor: number, moedaPlural: string = "Kwanzas", moedaSingular: string = "Kwanza"): string => {
  if (valor === 0) return "Zero " + moedaPlural;
  return valor.toLocaleString('pt-AO') + " " + moedaPlural; // Simplified for brevity
};

// --- PAYROLL CALCULATIONS (PROMPT SPECIFIC - ANGOLA AGT) ---

export const calculateINSS = (grossSalary: number): number => {
  return grossSalary * 0.03; 
};

export const calculateINSSEntity = (grossSalary: number): number => {
  return grossSalary * 0.08;
};

export const calculateIRT = (grossSalary: number, inss: number): number => {
  const taxable = grossSalary - inss;
  
  // Tabela solicitada no Prompt Oficial
  if (taxable <= 50000) return 0;
  if (taxable <= 150000) return (taxable - 50000) * 0.10;
  if (taxable <= 250000) return (taxable - 150000) * 0.15 + 10000;
  if (taxable <= 500000) return (taxable - 250000) * 0.20 + 25000;
  
  return (taxable - 500000) * 0.25 + 75000; 
};

/**
 * Added exportToExcel function to resolve 'no exported member' errors in multiple components.
 */
export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Added generateWhatsAppLink function to resolve 'no exported member' errors in components.
 */
export const generateWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
