
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole, Product, Sale, Transaction, Supplier } from './types';
import { MOCK_USER, INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from './services/mockData';
import { ICONS } from './constants';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  heldSales: { id: string, cart: any[], discount: number, timestamp: string }[];
  setHeldSales: React.Dispatch<React.SetStateAction<any[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

import Dashboard from './pages/Dashboard';
import PDV from './pages/PDV';
import Products from './pages/Products';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Login from './pages/Login';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useApp();
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return <Navigate to="/login" />;

  const isPDV = location.pathname === '/pdv';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {!isPDV && (
        <aside className="w-64 bg-[#0f172a] text-white flex flex-col no-print shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-black tracking-tighter">QuickTouch <span className="text-blue-500">POS</span></h1>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
            <NavLink to="/dashboard" icon={ICONS.Dashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
            <NavLink to="/pdv" icon={ICONS.PDV} label="Venda (PDV)" active={location.pathname === '/pdv'} />
            <NavLink to="/products" icon={ICONS.Products} label="Produtos" active={location.pathname === '/products'} />
            <NavLink to="/suppliers" icon={ICONS.Suppliers} label="Fornecedores" active={location.pathname === '/suppliers'} />
            <NavLink to="/finance" icon={ICONS.Finance} label="Financeiro" active={location.pathname === '/finance'} />
            <NavLink to="/reports" icon={ICONS.Reports} label="Relatórios" active={location.pathname === '/reports'} />
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => setUser(null)}
              className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors py-2 text-sm font-bold"
            >
              {ICONS.Logout} Sair
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!isPDV && (
          <header className="h-14 bg-white border-b flex items-center justify-between px-6 z-10 no-print shadow-sm shrink-0">
            <h2 className="font-black text-slate-800 text-base uppercase tracking-widest">
              {location.pathname.substring(1)}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{time}</div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                {user.name.substring(0,2).toUpperCase()}
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
      active 
      ? 'bg-blue-600 text-white shadow-lg z-10' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <div className={active ? 'scale-110' : ''}>{React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}</div>
    <span className="font-bold text-sm">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [heldSales, setHeldSales] = useState<any[]>([]);

  const value = {
    user, setUser,
    products, setProducts,
    sales, setSales,
    transactions, setTransactions,
    suppliers, setSuppliers,
    heldSales, setHeldSales
  };

  return (
    <AppContext.Provider value={value}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/pdv" element={<Layout><PDV /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
          <Route path="/finance" element={<Layout><Finance /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
