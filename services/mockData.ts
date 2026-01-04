
import { Product, Supplier, User, UserRole } from '../types';

// Função auxiliar para gerar datas relativas
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Fix: Exporting MOCK_USER as required by App.tsx and Login.tsx
export const MOCK_USER: User = {
  id: 'u1',
  name: 'Admin QuickTouch',
  role: UserRole.ADMIN
};

// Fix: Exporting INITIAL_SUPPLIERS as required by App.tsx
export const INITIAL_SUPPLIERS: Supplier[] = [
  { 
    id: 's1', 
    name: 'Distribuidora de Bebidas Silva', 
    contact: '(11) 98888-7777', 
    cnpj: '12.345.678/0001-90' 
  },
  { 
    id: 's2', 
    name: 'Atacadão Alimentos Central', 
    contact: '(11) 97777-6666', 
    cnpj: '98.765.432/0001-10' 
  }
];

// Fix: Completing INITIAL_PRODUCTS array
export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Coca-Cola 2L', 
    sku: 'BEB001', 
    barcode: '789123456001', 
    price: 10.50, 
    costPrice: 6.50, 
    stock: 45, 
    minStock: 10, 
    unit: 'UN', 
    category: 'Bebidas', 
    expiryDate: getFutureDate(45), 
    batch: 'L-2024-X1' 
  },
  { 
    id: '2', 
    name: 'Água Mineral 500ml', 
    sku: 'BEB002', 
    barcode: '789123456002', 
    price: 2.50, 
    costPrice: 0.80, 
    stock: 120, 
    minStock: 24, 
    unit: 'UN', 
    category: 'Bebidas', 
    expiryDate: getFutureDate(180), 
    batch: 'L-2024-W2'
  },
  {
    id: '3',
    name: 'Arroz 5kg Tipo 1',
    sku: 'MER001',
    barcode: '789123456003',
    price: 25.90,
    costPrice: 18.00,
    stock: 20,
    minStock: 5,
    unit: 'PC',
    category: 'Mercearia',
    expiryDate: getFutureDate(300),
    batch: 'LOT-ARR-25'
  }
];
