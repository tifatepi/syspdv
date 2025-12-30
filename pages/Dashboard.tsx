
import React from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Calendar, Package, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { sales, products } = useApp();

  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nearExpiryProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const days = getDaysRemaining(p.expiryDate);
    return days <= 10;
  });

  // Cálculos Financeiros Hoje
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalCostOfGoodsSold = sales.reduce((acc, s) => {
    const saleCost = s.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    return acc + saleCost;
  }, 0);
  const totalProfit = totalRevenue - totalCostOfGoodsSold;

  const stats = [
    { label: 'Vendas Hoje', value: `R$ ${totalRevenue.toFixed(2)}`, icon: ICONS.PDV, color: 'bg-blue-500' },
    { label: 'Lucro Bruto', value: `R$ ${totalProfit.toFixed(2)}`, icon: <TrendingUp size={24} />, color: 'bg-emerald-500' },
    { label: 'Produtos Baixos', value: products.filter(p => p.stock <= p.minStock).length, icon: ICONS.Trash, color: 'bg-red-500' },
    { label: 'Validade Crítica', value: nearExpiryProducts.length, icon: <Calendar size={24} />, color: 'bg-orange-500' },
  ];

  const chartData = [
    { name: '08:00', sales: 120 },
    { name: '10:00', sales: 450 },
    { name: '12:00', sales: 890 },
    { name: '14:00', sales: 320 },
    { name: '16:00', sales: 560 },
    { name: '18:00', sales: 1100 },
    { name: '20:00', sales: 780 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-4 rounded-xl text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-800">Desempenho de Vendas (Hoje)</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Tempo Real</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
              <AlertCircle className="text-orange-500" size={24} /> Alertas de Validade (Próximos 10 dias)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearExpiryProducts.map(p => {
                const days = getDaysRemaining(p.expiryDate!);
                const isExpired = days <= 0;
                return (
                  <div key={p.id} className={`p-4 rounded-xl border flex items-center gap-4 ${isExpired ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className={`p-3 rounded-xl text-white ${isExpired ? 'bg-red-500' : 'bg-orange-500'}`}>
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800 leading-tight">{p.name}</p>
                      <p className={`text-xs font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                        {isExpired ? 'PRODUTO VENCIDO!' : `Vence em ${days} dias`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Lote: {p.batch || 'N/I'}</p>
                    </div>
                  </div>
                );
              })}
              {nearExpiryProducts.length === 0 && (
                <div className="col-span-full py-6 text-center text-slate-400 font-bold uppercase text-xs">
                  Nenhum produto próximo ao vencimento
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
             <Package className="text-red-500" size={24} /> Estoque Crítico
          </h3>
          <div className="space-y-4">
            {products.filter(p => p.stock <= p.minStock).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="bg-red-500 text-white p-2 rounded-lg">
                  {React.cloneElement(ICONS.Trash as React.ReactElement<any>, { size: 18 })}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">{p.name}</p>
                  <p className="text-xs text-red-700">Qtd: {p.stock}un (Mín: {p.minStock})</p>
                </div>
              </div>
            ))}
            {products.filter(p => p.stock <= p.minStock).length === 0 && (
              <div className="text-center py-10">
                <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  {ICONS.Finish}
                </div>
                <p className="text-slate-500 text-sm font-medium">Estoque normalizado!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
