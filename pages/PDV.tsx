
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Product, CartItem, Sale, Client } from '../types';
import { PAYMENT_METHODS, ICONS } from '../constants';
import { ShoppingCart, Search, Package, Plus, Minus, X, UserCheck, UserPlus, User, ArrowLeft, Lock, LogIn, Printer, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PDV: React.FC = () => {
  const { products, setProducts, setSales, user, clients, categories, cashSession } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cpfInput, setCpfInput] = useState('');

  const [isCashPayment, setIsCashPayment] = useState(false);
  const [amountReceived, setAmountReceived] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cashSession.isOpen) return;
      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F12' && cart.length > 0) { e.preventDefault(); setShowPaymentModal(true); }
      
      if (showClientModal) {
        if (e.key === 'Enter') handleIdentifyCpf();
        if (e.key === 'Escape') setShowClientModal(false);
        return;
      }

      if (e.key === 'Escape') { 
        if (showPaymentModal) {
            setShowPaymentModal(false);
            setIsCashPayment(false);
            setAmountReceived('');
        } else {
            e.preventDefault(); 
            resetVenda(); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showClientModal, cpfInput, showPaymentModal, cashSession.isOpen]);

  const playBeep = (type: 'add' | 'success' | 'cancel' = 'add') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'success' ? 880 : type === 'cancel' ? 220 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { console.warn("Audio feedback disabled"); }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.includes(searchTerm);
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const matchedClients = useMemo(() => {
    if (!cpfInput) return [];
    return clients.filter(c => 
      c.cpf.includes(cpfInput) || 
      c.name.toLowerCase().includes(cpfInput.toLowerCase())
    ).slice(0, 4);
  }, [clients, cpfInput]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const addToCart = (product: Product) => {
    if (!cashSession.isOpen) return;
    playBeep('add');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    if (methodId === 'DINHEIRO') {
      setIsCashPayment(true);
      setAmountReceived('');
    } else {
      handleFinishSale(methodId);
    }
  };

  const handleFinishSale = (method: string) => {
    const cashValue = parseFloat(amountReceived) || total;
    const change = Math.max(0, cashValue - total);

    const sale: Sale = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      items: [...cart],
      subtotal,
      total,
      discount,
      paymentMethod: method,
      timestamp: new Date().toLocaleString('pt-BR'),
      operatorId: user?.id || 'u1',
      operator: user?.name || 'Caixa 01',
      clientCpf: selectedClient?.cpf || (cpfInput.length > 0 ? cpfInput : 'N/I'),
      clientName: selectedClient?.name || '',
      // @ts-ignore
      amountReceived: method === 'DINHEIRO' ? cashValue : total,
      // @ts-ignore
      change: method === 'DINHEIRO' ? change : 0
    };
    
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));

    setLastSale(sale);
    setSales(prev => [...prev, sale]);
    setShowPaymentModal(false);
    setIsCashPayment(false);
    setAmountReceived('');
    setShowReceipt(true);
    playBeep('success');
  };

  const resetVenda = () => {
    setCart([]);
    setDiscount(0);
    setShowReceipt(false);
    setLastSale(null);
    setSelectedClient(null);
    setCpfInput('');
    setIsCashPayment(false);
    setAmountReceived('');
  };

  const handleIdentifyCpf = () => {
    const found = clients.find(c => c.cpf === cpfInput);
    if (found) {
      setSelectedClient(found);
    }
    setShowClientModal(false);
  };

  const selectClientFromList = (client: Client) => {
    setSelectedClient(client);
    setCpfInput(client.cpf);
    setShowClientModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getFormattedTime = (ts: string) => {
    const parts = ts.split(' ');
    return { date: parts[0], time: (parts[1] || '').substring(0, 5) };
  };

  const renderReceiptText = (sale: any) => {
    const { date, time } = getFormattedTime(sale.timestamp);
    const SEP = "--------------------------------";
    let receipt = `${SEP}\n      MERCEARIA DO CLAUDIO\n     CNPJ: 00.000.000/0001-00\n${SEP}\n`;
    receipt += `Data: ${date}  Hora: ${time}\nOperador: ${sale.operator}\n${SEP}\n`;
    receipt += `Cliente: ${sale.clientName || sale.clientCpf || 'N/I'}\n${SEP}\n`;
    receipt += `Produto        Qtd   Valor\n`;
    sale.items.forEach((it: any) => {
      const name = it.name.substring(0, 14).padEnd(15, ' ');
      const qty = it.quantity.toString().padStart(4, ' ');
      const val = (it.price * it.quantity).toFixed(2).replace('.', ',').padStart(11, ' ');
      receipt += `${name}${qty}${val}\n`;
    });
    receipt += `${SEP}\nSubtotal:`.padEnd(15, ' ') + sale.subtotal.toFixed(2).replace('.', ',').padStart(17, ' ') + `\n`;
    receipt += `Desconto:`.padEnd(15, ' ') + sale.discount.toFixed(2).replace('.', ',').padStart(17, ' ') + `\n`;
    receipt += `TOTAL:`.padEnd(15, ' ') + sale.total.toFixed(2).replace('.', ',').padStart(17, ' ') + `\n${SEP}\n`;
    receipt += `Pagamento: ${sale.paymentMethod}\n`;
    if (sale.paymentMethod === 'DINHEIRO') {
        receipt += `Recebido: R$ ${sale.amountReceived.toFixed(2)}\n Troco: R$ ${sale.change.toFixed(2)}\n`;
    }
    receipt += `${SEP}\nObrigado pela preferência!\n${SEP}`;
    return receipt;
  };

  const changeValue = Math.max(0, (parseFloat(amountReceived) || 0) - total);

  return (
    <div className="flex h-screen bg-[#f1f5f9] select-none">
      {/* Bloqueio de Caixa Fechado */}
      {!cashSession.isOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 no-print">
           <div className="bg-white rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
                 <Lock size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tighter">Caixa Fechado</h2>
              <p className="text-slate-500 font-bold mb-10">Você precisa abrir o caixa para iniciar as vendas do turno.</p>
              <div className="flex flex-col gap-4">
                 <Link 
                  to="/finance" 
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                 >
                   <LogIn size={20} /> IR PARA FINANCEIRO
                 </Link>
                 <Link to="/dashboard" className="text-slate-400 font-black text-xs uppercase tracking-widest py-2">Voltar ao Painel</Link>
              </div>
           </div>
        </div>
      )}

      {/* Recibo para Impressão */}
      {lastSale && (
        <div className="print-only print-content">
          <pre style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.2', whiteSpace: 'pre-wrap', margin: 0, width: '100%' }}>
            {renderReceiptText(lastSale)}
          </pre>
        </div>
      )}

      <aside className="w-20 bg-white border-r flex flex-col items-center py-4 gap-2 no-print shrink-0">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
          <ShoppingCart size={24} />
        </div>
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-2 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex flex-col items-center py-3 rounded-xl transition-all ${
                activeCategory === cat ? 'bg-blue-50 text-blue-600 border-2 border-blue-600' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-center leading-tight">
                {cat === 'Todos' ? 'Tudo' : cat.substring(0, 5)}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden no-print">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="F1: Nome ou Código de Barras..."
              className="w-full h-12 pl-12 pr-4 bg-white border-none rounded-xl text-lg font-bold shadow-sm focus:ring-2 ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`flex flex-col text-left bg-white p-3 rounded-2xl border-2 border-transparent transition-all btn-touch-active group shadow-sm hover:shadow-md hover:border-blue-300 ${
                  product.stock <= 0 ? 'opacity-40 grayscale' : ''
                }`}
              >
                <div className="flex-1 min-h-[60px]">
                  <h4 className="text-sm font-black text-slate-700 leading-tight mb-1 group-hover:text-blue-600 line-clamp-2">{product.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{product.category}</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">R$ {product.price.toFixed(2)}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[380px] bg-white border-l shadow-2xl flex flex-col shrink-0 no-print">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
              <Package size={16} />
            </div>
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Cupom Atual</h3>
          </div>
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
            {cart.reduce((a, b) => a + b.quantity, 0)} ITENS
          </span>
        </div>

        {/* Info Cliente no Cupom */}
        {selectedClient && (
          <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
             <div className="flex items-center gap-2 text-blue-700">
                <UserCircle2 size={16} />
                <span className="text-[10px] font-black uppercase truncate max-w-[200px]">{selectedClient.name}</span>
             </div>
             <button onClick={() => setSelectedClient(null)} className="text-blue-300 hover:text-red-500">
                <X size={14} />
             </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center opacity-50">
              <ShoppingCart size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Aguardando Itens</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {cart.map(item => (
                <div key={item.id} className="p-4 flex flex-col gap-2 hover:bg-blue-50/30 transition-all group">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 text-sm leading-tight flex-1">{item.name}</span>
                    <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-slate-300 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-600 hover:bg-red-50 shadow-sm"><Minus size={12} /></button>
                      <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-600 hover:bg-blue-50 shadow-sm"><Plus size={12} /></button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-blue-600 tracking-tighter">R$ {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-900 text-white rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          {/* Botão Identificar Cliente (CPF na Nota) */}
          <button 
            onClick={() => setShowClientModal(true)}
            className={`w-full mb-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              selectedClient ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
          >
            {selectedClient ? <UserCheck size={16} /> : <UserPlus size={16} />}
            {selectedClient ? 'CLIENTE IDENTIFICADO' : 'IDENTIFICAR CLIENTE (CPF)'}
          </button>

          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Total Final</span>
            <span className="text-4xl font-black tracking-tighter leading-none">R$ {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
             <button onClick={resetVenda} className="flex-1 py-4 rounded-xl bg-slate-800 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest">LIMPAR</button>
             <button disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)} className="flex-[2] py-4 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all font-black text-sm uppercase tracking-widest disabled:opacity-30">PAGAR (F12)</button>
          </div>
        </div>
      </div>

      {/* Modal Identificar Cliente / CPF */}
      {showClientModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Identificar Cliente</h2>
                <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
             </div>
             
             <div className="space-y-6">
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Digite o CPF ou Nome</label>
                   <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Ex: 123.456.789-00"
                        className="w-full h-16 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-2xl font-black transition-all"
                        value={cpfInput}
                        onChange={(e) => setCpfInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleIdentifyCpf()}
                      />
                   </div>
                </div>

                {matchedClients.length > 0 && (
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultados Encontrados:</p>
                     <div className="grid grid-cols-1 gap-2">
                        {matchedClients.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => selectClientFromList(c)}
                            className="p-4 bg-slate-50 hover:bg-blue-50 text-left rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all group"
                          >
                             <div className="flex justify-between items-center">
                                <div>
                                   <p className="font-black text-slate-700 group-hover:text-blue-600">{c.name}</p>
                                   <p className="text-xs font-bold text-slate-400">{c.cpf}</p>
                                </div>
                                <Plus size={16} className="text-blue-500" />
                             </div>
                          </button>
                        ))}
                     </div>
                  </div>
                )}
             </div>

             <div className="flex gap-4 mt-10">
                <button onClick={() => setShowClientModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black rounded-2xl text-xs uppercase tracking-widest">CANCELAR</button>
                <button 
                  onClick={handleIdentifyCpf}
                  className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20"
                >
                  CONFIRMAR (ENTER)
                </button>
             </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {!isCashPayment ? (
              <div className="flex-1 p-8">
                <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Pagamento</h2>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => handleSelectPaymentMethod(m.id)} className="flex items-center gap-3 p-5 rounded-2xl text-left border-2 border-slate-100 hover:border-blue-50 hover:bg-blue-50 transition-all active:scale-95">
                      <span className="text-2xl">{m.icon}</span>
                      <span className="font-black text-slate-700 uppercase text-xs tracking-widest">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setIsCashPayment(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><ArrowLeft size={24} /></button>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Em Dinheiro</h2>
                </div>
                <div className="space-y-6">
                   <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Recebido R$</label>
                      <input 
                        autoFocus
                        type="number" 
                        step="0.01"
                        className="w-full bg-transparent border-none text-4xl font-black text-blue-600 outline-none"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFinishSale('DINHEIRO')}
                      />
                   </div>
                   <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 flex justify-between items-center">
                      <div>
                        <label className="text-xs font-black text-orange-400 uppercase tracking-widest block mb-1">Troco</label>
                        <span className="text-4xl font-black text-orange-600 tracking-tighter">R$ {changeValue.toFixed(2)}</span>
                      </div>
                   </div>
                </div>
                <button 
                  disabled={parseFloat(amountReceived) < total}
                  onClick={() => handleFinishSale('DINHEIRO')}
                  className="w-full mt-8 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-30 active:scale-95 transition-all"
                >
                  FINALIZAR VENDA
                </button>
              </div>
            )}
            <div className="w-full md:w-[240px] bg-blue-600 p-8 text-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total</span>
                <div className="text-4xl font-black tracking-tighter mt-1">R$ {total.toFixed(2)}</div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white p-6 no-print overflow-y-auto">
          <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                {ICONS.Finish}
             </div>
             <h2 className="text-3xl font-black">Venda Concluída!</h2>
             <div className="bg-slate-50 p-6 rounded-2xl w-full font-mono text-left text-[11px] border border-dashed border-slate-300 shadow-inner">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{renderReceiptText(lastSale)}</pre>
             </div>
             <div className="flex flex-col w-full gap-2">
                <button onClick={handlePrint} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <Printer size={20} /> IMPRIMIR RECIBO
                </button>
                <button onClick={resetVenda} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest active:scale-95 transition-transform">PRÓXIMA VENDA</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDV;
