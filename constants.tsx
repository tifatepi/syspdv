
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings,
  LogOut,
  Plus,
  Minus,
  Trash2,
  Search,
  ChevronRight,
  User,
  Clock,
  Printer,
  XCircle,
  Pause,
  CheckCircle2
} from 'lucide-react';

export const CATEGORIES = [
  'Todos',
  'Bebidas',
  'Mercearia',
  'Padaria',
  'Limpeza',
  'Higiene',
  'Frios',
  'Hortifruti',
  'Vestuário',
  'Calçados'
];

export const PAYMENT_METHODS = [
  { id: 'PIX', label: 'PIX', color: 'bg-teal-500', icon: '📱' },
  { id: 'DINHEIRO', label: 'Dinheiro', color: 'bg-green-500', icon: '💵' },
  { id: 'DÉBITO', label: 'Débito', color: 'bg-blue-500', icon: '💳' },
  { id: 'CRÉDITO', label: 'Crédito', color: 'bg-indigo-500', icon: '💳' },
  { id: 'ALIMENTAÇÃO', label: 'Alimentação', color: 'bg-orange-500', icon: '🍎' },
  { id: 'BENEFÍCIO', label: 'Benefício', color: 'bg-purple-500', icon: '🎁' }
];

export const ICONS = {
  Dashboard: <LayoutDashboard size={24} />,
  PDV: <ShoppingCart size={24} />,
  Products: <Package size={24} />,
  Suppliers: <Users size={24} />,
  Finance: <DollarSign size={24} />,
  Reports: <BarChart3 size={24} />,
  Settings: <Settings size={24} />,
  Logout: <LogOut size={20} />,
  Plus: <Plus size={24} />,
  Minus: <Minus size={24} />,
  Trash: <Trash2 size={24} />,
  Search: <Search size={20} />,
  ChevronRight: <ChevronRight size={20} />,
  User: <User size={18} />,
  Clock: <Clock size={18} />,
  Printer: <Printer size={20} />,
  Cancel: <XCircle size={24} />,
  Hold: <Pause size={24} />,
  Finish: <CheckCircle2 size={24} />
};
