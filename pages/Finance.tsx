import React, { useState } from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { Transaction } from '../types';

const Finance: React.FC = () => {
  const { transactions, setTransactions, sales } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const totalIncomes = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  
  const balance = (totalSales + totalIncomes) - totalExpenses;

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(7),
      type: modalType,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: new Date().toISOString(),
      category: formData.get('category') as string,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Fluxo Financeiro</h1>
          <p className="text-slate-500 font-medium mt-2">Controle de entradas, saídas e fechamento de caixa</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button 
            onClick={() => { setModalType('INCOME'); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-8 py-4 bg-green-500 text-white rounded-2xl font-black shadow-xl shadow-green-900/20 hover:bg-green-600 transition-all btn-touch-active flex items-center justify-center gap-2"
           >
             {ICONS.Plus} ENTRADA
           </button>
           <button 
            onClick={() => { setModalType('EXPENSE'); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-8 py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-900/20 hover:bg-red-600 transition-all btn-touch-active flex items-center justify-center gap-2"
           >
             {ICONS.Minus} SAÍDA
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden text-white flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px]" />
          <p className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Saldo em Caixa</p>
          <p className="text-5xl font-black tracking-tighter">R$ {balance.toFixed(2)}</p>
          <p className="mt-6 text-xs text-slate-500 font-bold uppercase tracking-widest">Atualizado agora</p>
        </div>
        <div className="bg-white p-10 rounded-[40px] shadow-sm border-2 border-slate-100 flex flex-col justify-center">
          <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Total Vendas</p>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">R$ {totalSales.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2 text-green-500 font-black text-xs">
            {/* Fix: Use ICONS.Finish instead of ICONS.CheckCircle2 */}
            {ICONS.Finish.type({...ICONS.Finish.props, size: 14})} {sales.length} VENDAS HOJE
          </div>
        </div>
        <div className="bg-white p-10 rounded-[40px] shadow-sm border-2 border-slate-100 flex flex-col justify-center">
          <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Despesas Manuais</p>
          <p className="text-4xl font-black text-red-500 tracking-tighter">R$ {totalExpenses.toFixed(2)}</p>
          <p className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Pagamentos diversos</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Últimas Movimentações
          </h3>
          <button className="text-xs font-black text-blue-600 hover:underline">VER TUDO</button>
        </div>
        <div className="divide-y-2 divide-slate-50 overflow-y-auto max-h-[400px] custom-scrollbar">
          {transactions.length === 0 && sales.length === 0 ? (
            <div className="p-20 text-center text-slate-400">Nenhuma movimentação registrada.</div>
          ) : (
            <>
              {transactions.map(t => (
                 <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                   <div className="flex items-center gap-6">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${t.type === 'EXPENSE' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                       {t.type === 'EXPENSE' ? ICONS.Minus : ICONS.Plus}
                     </div>
                     <div>
                       <p className="font-black text-slate-800 text-lg leading-tight">{t.description}</p>
                       <p className="text-xs text-slate-400 font-bold uppercase mt-1">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className={`text-2xl font-black ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}`}>
                       {t.type === 'EXPENSE' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                     </p>
                     <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Confirmado</p>
                   </div>
                 </div>
              ))}
              {sales.map(s => (
                <div key={s.id} className="p-8 flex items-center justify-between bg-blue-50/30 border-l-4 border-blue-500">
                   <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                       {ICONS.PDV}
                     </div>
                     <div>
                       <p className="font-black text-slate-800 text-lg leading-tight">Venda Balcão #{s.id}</p>
                       <p className="text-xs text-slate-400 font-bold uppercase mt-1">PDV • {s.timestamp}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-2xl font-black text-blue-600">+ R$ {s.total.toFixed(2)}</p>
                     <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{s.paymentMethod}</p>
                   </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddTransaction} className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
              <div className={`p-3 rounded-2xl text-white ${modalType === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`}>
                {modalType === 'INCOME' ? ICONS.Plus : ICONS.Minus}
              </div>
              Lançar {modalType === 'INCOME' ? 'Entrada' : 'Saída'}
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</label>
                <input name="description" required type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-xl" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor R$</label>
                  <input name="amount" required type="number" step="0.01" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black transition-all text-3xl" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                  <select name="category" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all appearance-none">
                    <option>Geral</option>
                    <option>Suprimentos</option>
                    <option>Limpeza</option>
                    <option>Pessoal</option>
                    <option>Manutenção</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-6 mt-12">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-400 font-black tracking-widest text-xs btn-touch-active">CANCELAR</button>
              <button type="submit" className={`px-10 py-5 ${modalType === 'INCOME' ? 'bg-green-500' : 'bg-red-500'} text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 btn-touch-active uppercase tracking-widest`}>REGISTRAR</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Finance;