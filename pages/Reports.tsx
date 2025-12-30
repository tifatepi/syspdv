
import React from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Reports: React.FC = () => {
  const { sales, products } = useApp();

  const pieData = [
    { name: 'Bebidas', value: 400 },
    { name: 'Mercearia', value: 300 },
    { name: 'Padaria', value: 300 },
    { name: 'Limpeza', value: 200 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Relatórios</h1>
        <p className="text-slate-500">Analise seu negócio e tome decisões</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Sales by Category */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Vendas por Categoria</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReportCard 
            title="Relatório de Vendas" 
            desc="Detalhamento de todas as vendas por período" 
            icon={ICONS.PDV} 
            color="bg-blue-600"
          />
          <ReportCard 
            title="Estoque Completo" 
            desc="Lista total de itens e valor de inventário" 
            icon={ICONS.Products} 
            color="bg-purple-600"
          />
          <ReportCard 
            title="Fluxo de Caixa" 
            desc="Movimentação financeira mensal" 
            icon={ICONS.Finance} 
            color="bg-green-600"
          />
          <ReportCard 
            title="Clientes & Fornecedores" 
            desc="Base cadastral e histórico de compras" 
            icon={ICONS.Suppliers} 
            color="bg-orange-600"
          />
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl text-white flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black mb-2">Precisa de um relatório personalizado?</h3>
          <p className="text-slate-400">Exporte os dados em Excel ou PDF para análise profunda.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold border border-white/10 transition-all">GERAR PDF</button>
          <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-xl transition-all">EXPORTAR EXCEL</button>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, desc, icon, color }: { title: string, desc: string, icon: any, color: string }) => (
  <button className="bg-white p-6 rounded-3xl shadow-sm border hover:shadow-md transition-all text-left flex items-start gap-4 group btn-touch-active">
    <div className={`${color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default Reports;
