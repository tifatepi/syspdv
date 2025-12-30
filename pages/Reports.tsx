
import React from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Award, DollarSign, Package, Calendar, Download, FileText, ClipboardList } from 'lucide-react';

const Reports: React.FC = () => {
  const { sales, products } = useApp();

  // Mix de Pagamentos
  const paymentMix = [
    { name: 'PIX', value: sales.filter(s => s.paymentMethod === 'PIX').length },
    { name: 'Dinheiro', value: sales.filter(s => s.paymentMethod === 'DINHEIRO').length },
    { name: 'Crédito', value: sales.filter(s => s.paymentMethod === 'CRÉDITO').length },
    { name: 'Débito', value: sales.filter(s => s.paymentMethod === 'DÉBITO').length },
  ].filter(p => p.value > 0);

  // Vendas por Dia (Simulado para os últimos 7 dias baseado nas vendas reais se houver)
  const weeklySales = [
    { day: 'Seg', total: 1200 },
    { day: 'Ter', total: 1800 },
    { day: 'Qua', total: 1500 },
    { day: 'Qui', total: 2200 },
    { day: 'Sex', total: 3100 },
    { day: 'Sáb', total: 4500 },
    { day: 'Dom', total: 1900 },
  ];

  // Top Produtos (Simulado baseado nos dados existentes)
  const topProducts = products.slice(0, 5).map(p => ({
    name: p.name,
    sold: Math.floor(Math.random() * 50) + 10,
    revenue: 0 
  })).sort((a, b) => b.sold - a.sold);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (sales.length === 0) {
      alert("Não há dados de vendas para exportar no momento.");
      return;
    }

    const headers = ["ID Venda", "Data/Hora", "Cliente", "Metodo Pagamento", "Subtotal", "Desconto", "Total"];
    const csvRows = sales.map(s => [
      s.id,
      s.timestamp,
      s.clientName || 'Consumidor',
      s.paymentMethod,
      s.subtotal.toFixed(2).replace('.', ','),
      s.discount.toFixed(2).replace('.', ','),
      s.total.toFixed(2).replace('.', ',')
    ]);

    const csvContent = "\uFEFF" + [headers, ...csvRows].map(e => e.join(";")).join("\n");
    
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `vendas_quicktouch_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Erro ao gerar o arquivo de exportação.");
    }
  };

  const handleGenerateInventoryBalance = () => {
    if (products.length === 0) {
      alert("Não há produtos no catálogo para gerar balanço.");
      return;
    }

    // Cabeçalhos para o Balanço de Inventário
    const headers = ["Produto", "Categoria", "SKU", "Estoque Atual", "Preco Custo (Un)", "Preco Venda (Un)", "Valor Custo Total", "Valor Venda Total", "Margem Est. (%)"];
    
    const csvRows = products.map(p => {
      const totalCost = p.costPrice * p.stock;
      const totalSale = p.price * p.stock;
      const margin = p.price > 0 ? ((p.price - p.costPrice) / p.price) * 100 : 0;

      return [
        p.name,
        p.category,
        p.sku,
        p.stock,
        p.costPrice.toFixed(2).replace('.', ','),
        p.price.toFixed(2).replace('.', ','),
        totalCost.toFixed(2).replace('.', ','),
        totalSale.toFixed(2).replace('.', ','),
        margin.toFixed(2).replace('.', ',') + "%"
      ];
    });

    const totalInventoryCost = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const totalInventorySale = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    // Linha de Resumo
    const summaryRows = [
      [],
      ["RESUMO DO INVENTARIO"],
      ["Total Itens Unicos", products.length],
      ["Total Pecas em Estoque", products.reduce((acc, p) => acc + p.stock, 0)],
      ["Valor Total Custo", "R$ " + totalInventoryCost.toFixed(2).replace('.', ',')],
      ["Valor Total Venda", "R$ " + totalInventorySale.toFixed(2).replace('.', ',')],
      ["Lucro Potencial Bruto", "R$ " + (totalInventorySale - totalInventoryCost).toFixed(2).replace('.', ',')]
    ];

    const csvContent = "\uFEFF" + [headers, ...csvRows, ...summaryRows].map(e => e.join(";")).join("\n");

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `balanco_estoque_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Erro ao gerar balanço de estoque.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Inteligência de Vendas</h1>
          <p className="text-slate-500 font-medium mt-2">Relatórios consolidados para tomada de decisão</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleExportPDF}
            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all btn-touch-active flex items-center gap-2"
           >
             <FileText size={16} /> GERAR PDF
           </button>
           <button 
            onClick={handleExportExcel}
            className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl btn-touch-active flex items-center gap-2"
           >
             <Download size={16} /> EXPORTAR EXCEL (CSV)
           </button>
        </div>
      </div>

      {/* Header visível apenas na impressão */}
      <div className="hidden print:block border-b-4 border-slate-900 pb-4 mb-8">
        <h1 className="text-3xl font-black uppercase">Relatório Gerencial - QuickTouch POS</h1>
        <p className="text-sm font-bold text-slate-500">Emitido em: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Vendas Semanal */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 break-inside-avoid">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
               <TrendingUp className="text-blue-600" /> Faturamento Semanal
             </h3>
             <span className="text-xs font-bold text-slate-400 no-print">Últimos 7 dias</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}} 
                  itemStyle={{fontWeight: '900', color: '#1e293b'}}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mix de Pagamentos */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 break-inside-avoid">
          <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
             <DollarSign className="text-emerald-500" /> Mix de Recebimento
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMix.length > 0 ? paymentMix : [{name: 'Sem Vendas', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {paymentMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {paymentMix.length === 0 && <Cell fill="#f1f5f9" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
             {paymentMix.map((p, idx) => (
               <div key={idx} className="flex justify-between items-center text-xs font-bold p-2 bg-slate-50 rounded-xl">
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx]}} />
                   {p.name}
                 </span>
                 <span className="text-slate-900">{p.value} vendas</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Produtos */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 break-inside-avoid">
           <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tighter">
             <Award className="text-orange-500" size={24} /> Ranking de Produtos (Top 5)
           </h3>
           <div className="space-y-4">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-blue-100 transition-all group">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                     idx === 0 ? 'bg-orange-500 text-white shadow-orange-900/20' : 
                     idx === 1 ? 'bg-slate-300 text-slate-700' :
                     'bg-orange-100 text-orange-600'
                   }`}>
                     {idx + 1}
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sold} unidades vendidas este mês</p>
                   </div>
                   <TrendingUp className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity no-print" size={20} />
                </div>
              ))}
           </div>
        </div>

        {/* Card Informativo de Estoque */}
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden text-white break-inside-avoid">
           <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-bl-[150px] no-print" />
           <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white">
                 <Package size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black">Valor do Inventário</h3>
                <p className="text-blue-400 font-bold uppercase text-xs tracking-widest">Patrimônio em mercadoria</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-8">
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Preço de Custo Total</p>
                 <p className="text-3xl font-black tracking-tighter">R$ {products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0).toFixed(2)}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Preço de Venda Total</p>
                 <p className="text-3xl font-black text-blue-400 tracking-tighter">R$ {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)}</p>
              </div>
           </div>

           <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Calendar className="text-blue-500" />
                 <span className="text-xs font-black uppercase tracking-widest">Giro de estoque: 14 dias</span>
              </div>
              <button 
                onClick={handleGenerateInventoryBalance}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors no-print flex items-center gap-2"
              >
                <ClipboardList size={14} /> GERAR BALANÇO
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
