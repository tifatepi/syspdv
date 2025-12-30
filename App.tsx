
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole, Product, Sale, Transaction, Supplier } from './types';
import { MOCK_USER, INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from './services/mockData';
import { ICONS } from './constants';

// Context for global state
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

// Pages
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {!isPDV && (
        <aside className="w-64 bg-slate-900 text-white flex flex-col no-print shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-tight">QuickTouch <span className="text-blue-400">POS</span></h1>
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors py-2 text-sm font-medium"
            >
              {ICONS.Logout} Sair
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-10 no-print shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {isPDV && (
              <Link to="/dashboard" className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
                {ICONS.Dashboard} <span className="hidden md:inline">Painel Admin</span>
              </Link>
            )}
            {!isPDV && <div className="h-4 w-px bg-slate-200" />}
            <h2 className="font-bold text-slate-800 text-lg">
              {location.pathname === '/pdv' ? 'Frente de Caixa (PDV)' : (location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2))}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-full">
              {ICONS.User} <span>{user.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-black text-lg">
              {ICONS.Clock} <span>{time}</span>
            </div>
          </div>
        </header>

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
      ? 'bg-blue-600 text-white shadow-xl translate-x-1' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <span className="font-bold">{label}</span>
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
