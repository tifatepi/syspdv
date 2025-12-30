
import React, { useState } from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { Transaction, CashSession } from '../types';
import { Wallet, LogIn, LogOut, ArrowUpCircle, ArrowDownCircle, Info, Calculator, X, CreditCard, Smartphone, Banknote, TrendingUp } from 'lucide-react';

const Finance: React.FC = () => {
  const { transactions, setTransactions, sales, cashSession, setCashSession } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'SANGRIA' | 'SUPRIMENTO' | 'OPEN' | 'CLOSE'>('SANGRIA');
  
  const [amountInput, setAmountInput] = useState('');
  const [descInput, setDescInput] = useState('');

  // Cálculos por Modalidade
  const cashSalesToday = sales
    .filter(s => s.paymentMethod === 'DINHEIRO')
    .reduce((acc, s) => acc + s.total, 0);

  const pixSalesToday = sales
    .filter(s => s.paymentMethod === 'PIX')
    .reduce((acc, s) => acc + s.total, 0);

  const cardSalesToday = sales
    .filter(s => ['DÉBITO', 'CRÉDITO', 'ALIMENTAÇÃO', 'BENEFÍCIO'].includes(s.paymentMethod as string))
    .reduce((acc, s) => acc + s.total, 0);

  const totalRevenueToday = sales.reduce((acc, s) => acc + s.total, 0);

  // Cálculo específico da Gaveta (Dinheiro Físico)
  const expectedBalance = cashSession.startingBalance + cashSalesToday + cashSession.totalSuprimentos - cashSession.totalSangrias;

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);

    if (modalType === 'OPEN') {
      setCashSession({
        isOpen: true,
        openedAt: new Date().toLocaleString(),
        startingBalance: amount,
        totalCashSales: 0,
        totalSuprimentos: 0,
        totalSangrias: 0,
        expectedFinalBalance: amount
      });
    } else if (modalType === 'CLOSE') {
      setCashSession(prev => ({ ...prev, isOpen: false, closedAt: new Date().toLocaleString() }));
    } else {
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(7),
        type: modalType as any,
        description: descInput || (modalType === 'SANGRIA' ? 'Retirada de Caixa' : 'Reforço de Troco'),
        amount: amount,
        date: new Date().toISOString(),
        category: 'Operacional'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setCashSession(prev => ({
        ...prev,
        totalSuprimentos: modalType === 'SUPRIMENTO' ? prev.totalSuprimentos + amount : prev.totalSuprimentos,
        totalSangrias: modalType === 'SANGRIA' ? prev.totalSangrias + amount : prev.totalSangrias
      }));
    }

    setIsModalOpen(false);
    setAmountInput('');
    setDescInput('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Gestão Financeira</h1>
          <p className="text-slate-500 font-medium mt-2">Monitoramento de vendas, faturamento e fluxo de caixa físico</p>
        </div>
        {!cashSession.isOpen ? (
          <button 
            onClick={() => { setModalType('OPEN'); setIsModalOpen(true); }}
            className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3 btn-touch-active uppercase tracking-widest"
          >
            <LogIn size={24} /> ABRIR CAIXA
          </button>
        ) : (
          <div className="flex gap-4 w-full md:w-auto">
             <button 
              onClick={() => { setModalType('SUPRIMENTO'); setIsModalOpen(true); }}
              className="flex-1 px-8 py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 btn-touch-active uppercase tracking-tighter"
             >
               <ArrowUpCircle size={20} /> SUPRIMENTO
             </button>
             <button 
              onClick={() => { setModalType('SANGRIA'); setIsModalOpen(true); }}
              className="flex-1 px-8 py-5 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-900/20 flex items-center justify-center gap-2 btn-touch-active uppercase tracking-tighter"
             >
               <ArrowDownCircle size={20} /> SANGRIA
             </button>
             <button 
              onClick={() => { setModalType('CLOSE'); setIsModalOpen(true); }}
              className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 btn-touch-active uppercase tracking-tighter"
             >
               <LogOut size={20} /> FECHAR
             </button>
          </div>
        )}
      </div>

      {/* Cards de Faturamento Geral (Modalidades Digitais) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 flex items-center gap-5">
           <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center">
              <Smartphone size={32} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendas em PIX</p>
              <p className="text-3xl font-black text-teal-600 tracking-tighter">R$ {pixSalesToday.toFixed(2)}</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 flex items-center gap-5">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
              <CreditCard size={32} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cartões (Déb/Créd)</p>
              <p className="text-3xl font-black text-blue-600 tracking-tighter">R$ {cardSalesToday.toFixed(2)}</p>
           </div>
        </div>
        <div className="bg-blue-600 p-8 rounded-[40px] shadow-2xl flex items-center gap-5 text-white">
           <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
              <TrendingUp size={32} />
           </div>
           <div>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Faturamento Total</p>
              <p className="text-3xl font-black tracking-tighter">R$ {totalRevenueToday.toFixed(2)}</p>
           </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <Banknote size={16} /> Fluxo de Caixa Físico (Gaveta)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Saldo Inicial</p>
            <p className="text-2xl font-black text-slate-800">R$ {cashSession.startingBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vendas Dinheiro</p>
            <p className="text-2xl font-black text-emerald-600">+ R$ {cashSalesToday.toFixed(2)}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suprimento / Sangria</p>
            <p className={`text-2xl font-black ${(cashSession.totalSuprimentos - cashSession.totalSangrias) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              { (cashSession.totalSuprimentos - cashSession.totalSangrias) >= 0 ? '+' : '' }
              R$ {(cashSession.totalSuprimentos - cashSession.totalSangrias).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Saldo em Gaveta</p>
            <p className="text-3xl font-black text-white tracking-tighter">R$ {expectedBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-3">
            <Calculator size={18} className="text-blue-600" />
            Movimentações do Turno
          </h3>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cashSession.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
            {cashSession.isOpen ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
          </span>
        </div>
        <div className="divide-y-2 divide-slate-50">
          {transactions.filter(t => t.type === 'SANGRIA' || t.type === 'SUPRIMENTO').length === 0 ? (
            <div className="p-20 text-center text-slate-300 flex flex-col items-center gap-4">
               <Info size={40} className="opacity-20" />
               <p className="font-black uppercase tracking-widest text-xs">Nenhuma sangria ou suprimento registrado</p>
            </div>
          ) : (
            transactions.filter(t => t.type === 'SANGRIA' || t.type === 'SUPRIMENTO').map(t => (
              <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${t.type === 'SANGRIA' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {t.type === 'SANGRIA' ? <ArrowDownCircle /> : <ArrowUpCircle />}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-tight">{t.description}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">{t.type} • {new Date(t.date).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-2xl font-black ${t.type === 'SANGRIA' ? 'text-orange-600' : 'text-emerald-600'}`}>
                     {t.type === 'SANGRIA' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                   </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleAction} className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4 uppercase tracking-tighter">
                {modalType === 'OPEN' ? 'Abertura de Caixa' : modalType === 'CLOSE' ? 'Fechamento de Caixa' : modalType}
               </h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
               </button>
            </div>
            
            <div className="space-y-6">
              {modalType === 'CLOSE' ? (
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-xs font-black text-slate-400 uppercase">Saldo Esperado em Gaveta</span>
                      <span className="text-xl font-black text-slate-800">R$ {expectedBalance.toFixed(2)}</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                     Ao confirmar o fechamento, o caixa será bloqueado para novas vendas até a próxima abertura.
                   </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor R$</label>
                    <input 
                      autoFocus
                      required
                      type="number" 
                      step="0.01" 
                      className="h-20 p-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-4xl transition-all"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                    />
                  </div>
                  {modalType !== 'OPEN' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Observação (Motivo)</label>
                      <input 
                        type="text" 
                        className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-lg"
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                        placeholder="Ex: Pagamento de frete..."
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-6 mt-12">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-slate-400 font-black tracking-widest text-xs btn-touch-active uppercase">Cancelar</button>
              <button 
                type="submit" 
                className={`px-12 py-5 rounded-2xl font-black shadow-xl shadow-slate-900/20 btn-touch-active uppercase tracking-widest text-white ${
                  modalType === 'SANGRIA' ? 'bg-orange-500' : modalType === 'SUPRIMENTO' ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
              >
                {modalType === 'CLOSE' ? 'CONFIRMAR FECHAMENTO' : 'EFETUAR LANÇAMENTO'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Finance;
