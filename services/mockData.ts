
import { Product, Supplier, User, UserRole } from '../types';

// Função auxiliar para gerar datas relativas
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Admin QuickTouch',
  role: UserRole.ADMIN
};

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
  },
  { 
    id: 's3', 
    name: 'Hortifruti Direto da Roça', 
    contact: '(11) 96666-5555', 
    cnpj: '45.123.890/0001-22' 
  },
  { 
    id: 's4', 
    name: 'Unilever Brasil LTDA', 
    contact: '0800-707-3553', 
    cnpj: '56.991.134/0001-99' 
  },
  { 
    id: 's5', 
    name: 'Frigorífico Boi Gordo', 
    contact: '(11) 94444-3333', 
    cnpj: '33.222.111/0001-00' 
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // BEBIDAS
  { 
    id: '1', 
    name: 'Coca-Cola 2L', 
    sku: 'BEB-001', 
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
    name: 'Cerveja Heineken 330ml Long Neck', 
    sku: 'BEB-002', 
    barcode: '789123456002', 
    price: 6.90, 
    costPrice: 4.20, 
    stock: 72, 
    minStock: 24, 
    unit: 'UN', 
    category: 'Bebidas', 
    expiryDate: getFutureDate(180), 
    batch: 'L-2024-W2'
  },
  { 
    id: '3', 
    name: 'Água Mineral Crystal 500ml', 
    sku: 'BEB-003', 
    barcode: '789123456003', 
    price: 2.50, 
    costPrice: 0.85, 
    stock: 150, 
    minStock: 30, 
    unit: 'UN', 
    category: 'Bebidas', 
    expiryDate: getFutureDate(360), 
    batch: 'AQ-998'
  },

  // MERCEARIA
  {
    id: '4',
    name: 'Arroz Tio João 5kg Tipo 1',
    sku: 'MER-001',
    barcode: '789123456004',
    price: 29.90,
    costPrice: 21.00,
    stock: 20,
    minStock: 5,
    unit: 'PC',
    category: 'Mercearia',
    expiryDate: getFutureDate(200),
    batch: 'LOT-ARR-25'
  },
  {
    id: '5',
    name: 'Feijão Carioca Kicaldo 1kg',
    sku: 'MER-002',
    barcode: '789123456005',
    price: 8.50,
    costPrice: 5.40,
    stock: 35,
    minStock: 10,
    unit: 'UN',
    category: 'Mercearia',
    expiryDate: getFutureDate(150),
    batch: 'FEJ-102'
  },
  {
    id: '6',
    name: 'Azeite de Oliva Galo 500ml',
    sku: 'MER-003',
    barcode: '789123456006',
    price: 38.90,
    costPrice: 28.00,
    stock: 12,
    minStock: 4,
    unit: 'UN',
    category: 'Mercearia',
    expiryDate: getFutureDate(400),
    batch: 'AZ-77'
  },

  // PADARIA
  {
    id: '7',
    name: 'Pão de Forma Wickbold 500g',
    sku: 'PAD-001',
    barcode: '789123456007',
    price: 9.90,
    costPrice: 6.20,
    stock: 15,
    minStock: 5,
    unit: 'UN',
    category: 'Padaria',
    expiryDate: getFutureDate(7),
    batch: 'P-FRESH'
  },
  {
    id: '8',
    name: 'Bolo de Rolo Pernambucano 400g',
    sku: 'PAD-002',
    barcode: '789123456008',
    price: 24.50,
    costPrice: 15.00,
    stock: 8,
    minStock: 2,
    unit: 'UN',
    category: 'Padaria',
    expiryDate: getFutureDate(10),
    batch: 'BOLO-01'
  },

  // LIMPEZA
  {
    id: '9',
    name: 'Detergente Ypê Coco 500ml',
    sku: 'LIM-001',
    barcode: '789123456009',
    price: 2.80,
    costPrice: 1.40,
    stock: 60,
    minStock: 12,
    unit: 'UN',
    category: 'Limpeza',
    expiryDate: getFutureDate(700),
    batch: 'YPE-L'
  },
  {
    id: '10',
    name: 'Sabão em Pó Omo Lavagem Perfeita 1.6kg',
    sku: 'LIM-002',
    barcode: '789123456010',
    price: 22.90,
    costPrice: 16.50,
    stock: 24,
    minStock: 6,
    unit: 'CX',
    category: 'Limpeza',
    expiryDate: getFutureDate(500),
    batch: 'OMO-24'
  },

  // FRIOS & LATICÍNIOS
  {
    id: '11',
    name: 'Queijo Muçarela Fatiada Sadia 150g',
    sku: 'FRI-001',
    barcode: '789123456011',
    price: 12.90,
    costPrice: 8.50,
    stock: 18,
    minStock: 5,
    unit: 'UN',
    category: 'Frios',
    expiryDate: getFutureDate(12),
    batch: 'SAD-Q'
  },
  {
    id: '12',
    name: 'Iogurte Grego Danone Tradicional',
    sku: 'FRI-002',
    barcode: '789123456012',
    price: 4.50,
    costPrice: 2.30,
    stock: 40,
    minStock: 10,
    unit: 'UN',
    category: 'Frios',
    expiryDate: getFutureDate(15),
    batch: 'GR-88'
  },

  // HORTIFRUTI
  {
    id: '13',
    name: 'Banana Prata Selecionada',
    sku: 'HOR-001',
    barcode: '789123456013',
    price: 5.90,
    costPrice: 2.50,
    stock: 25,
    minStock: 5,
    unit: 'KG',
    category: 'Hortifruti',
    expiryDate: getFutureDate(5),
    batch: 'ROCA-B'
  },
  {
    id: '14',
    name: 'Maçã Gala Nacional',
    sku: 'HOR-002',
    barcode: '789123456014',
    price: 11.90,
    costPrice: 6.00,
    stock: 15,
    minStock: 3,
    unit: 'KG',
    category: 'Hortifruti',
    expiryDate: getFutureDate(10),
    batch: 'ROCA-M'
  }
];
