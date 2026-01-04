
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CAIXA'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  contact: string;
  points?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string; // UN, KG, LT, PC, etc.
  category: string;
  expiryDate?: string;
  batch?: string;
  size?: string;
  color?: string;
}

export type MovementType = 'ENTRADA_NF' | 'VENDA_PDV' | 'AJUSTE_MANUAL' | 'DEVOLUCAO';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number; // Positivo para entrada, Negativo para saída
  previousStock: number;
  currentStock: number;
  timestamp: string;
  referenceId?: string; // ID da Venda ou Número da NF
  operator: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'DINHEIRO',
  DEBIT = 'DÉBITO',
  CREDIT = 'CRÉDITO',
  FOOD = 'ALIMENTAÇÃO',
  BENEFIT = 'BENEFÍCIO'
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  discount: number;
  paymentMethod: PaymentMethod | string;
  timestamp: string;
  operatorId: string;
  operator: string;
  clientCpf?: string;
  clientName?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  cnpj: string;
}

export interface StockEntryItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export interface StockEntry {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: string;
  supplierName: string;
  items: StockEntryItem[];
  totalValue: number;
  date: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'SANGRIA' | 'SUPRIMENTO';
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface CashSession {
  isOpen: boolean;
  openedAt?: string;
  closedAt?: string;
  startingBalance: number;
  totalCashSales: number;
  totalSuprimentos: number;
  totalSangrias: number;
  expectedFinalBalance: number;
}
