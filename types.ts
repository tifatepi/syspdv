
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
  category: string;
  expiryDate?: string; // Mantido opcional para flexibilidade, mas usado nos alertas
  batch?: string;      // Campo de Lote
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

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  category: string;
}
