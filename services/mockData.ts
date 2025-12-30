
import { Product, Supplier, User, UserRole } from '../types';

// Função auxiliar para gerar datas relativas
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Coca-Cola 2L', sku: 'BEB001', barcode: '789123456001', price: 10.50, costPrice: 6.50, stock: 45, minStock: 10, category: 'Bebidas', expiryDate: getFutureDate(45), batch: 'L-2024-X1' },
  { id: '2', name: 'Água Mineral 500ml', sku: 'BEB002', barcode: '789123456002', price: 2.50, costPrice: 0.80, stock: 120, minStock: 24, category: 'Bebidas', expiryDate: getFutureDate(180), batch: 'L-2024-B2' },
  { id: '3', name: 'Pão Francês (un)', sku: 'PAD001', barcode: '789123456003', price: 1.20, costPrice: 0.40, stock: 200, minStock: 50, category: 'Padaria', expiryDate: getFutureDate(1), batch: 'FORN-09' },
  { id: '4', name: 'Arroz 5kg', sku: 'MER001', barcode: '789123456004', price: 28.90, costPrice: 22.00, stock: 15, minStock: 5, category: 'Mercearia', expiryDate: getFutureDate(8), batch: 'ABC-77' }, // Alerta: 8 dias
  { id: '5', name: 'Feijão Carioca 1kg', sku: 'MER002', barcode: '789123456005', price: 8.50, costPrice: 5.20, stock: 30, minStock: 10, category: 'Mercearia', expiryDate: getFutureDate(5), batch: 'FEIJ-01' }, // Alerta: 5 dias
  { id: '6', name: 'Leite Integral 1L', sku: 'MER003', barcode: '789123456006', price: 5.40, costPrice: 4.10, stock: 8, minStock: 12, category: 'Mercearia', expiryDate: getFutureDate(-2), batch: 'MLK-99' }, // Vencido: -2 dias
  { id: '7', name: 'Detergente Líquido', sku: 'LIM001', barcode: '789123456007', price: 2.30, costPrice: 1.20, stock: 50, minStock: 15, category: 'Limpeza', expiryDate: getFutureDate(365), batch: 'LIM-X' },
  { id: '8', name: 'Sabão em Pó 1kg', sku: 'LIM002', barcode: '789123456008', price: 15.90, costPrice: 11.50, stock: 25, minStock: 8, category: 'Limpeza', expiryDate: getFutureDate(15), batch: 'SAB-Z' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Coca-Cola FEMSA', contact: '(11) 98888-7777', cnpj: '00.111.222/0001-33' },
  { id: 's2', name: 'Atacadão S.A.', contact: '(11) 97777-6666', cnpj: '33.222.111/0001-55' },
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Caixa 01',
  role: UserRole.CASHIER
};
