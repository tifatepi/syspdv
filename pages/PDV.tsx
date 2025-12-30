
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Product, CartItem, Sale, Client } from '../types';
import { CATEGORIES, PAYMENT_METHODS, ICONS } from '../constants';
import { ShoppingCart, Search, Package, Plus, Minus, X, UserCheck, UserPlus } from 'lucide-react';

const PDV: React.FC = () => {
  const { products, setProducts, setSales, user, setHeldSales, clients } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  
  // Estado para o cliente selecionado na venda
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cpfInput, setCpfInput] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F12' && cart.length > 0) { e.preventDefault(); setShowPaymentModal(true); }
      if (e.key === 'Escape') { e.preventDefault(); resetVenda(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

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

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const addToCart = (product: Product) => {
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

  const handleFinishSale = (method: string) => {
    const sale: Sale = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      items: [...cart],
      subtotal,
      total,
      discount,
      paymentMethod: method,
      timestamp: new Date().toLocaleString('pt-BR'),
      operatorId: user?.id || 'u1',
      operator: user?.name || 'Caixa',
      clientCpf: selectedClient?.cpf || cpfInput || 'CONSUMIDOR NÃO IDENTIFICADO',
      clientName: selectedClient?.name || ''
    };
    
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));

    setLastSale(sale);
    setSales(prev => [...prev, sale]);
    setShowPaymentModal(false);
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
  };

  const handleIdentifyCpf = () => {
    const found = clients.find(c => c.cpf === cpfInput);
    if (found) {
      setSelectedClient(found);
    }
    setShowClientModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] select-none">
      {/* AREA DE IMPRESSAO */}
      {lastSale && (
        <div className="print-only print-content p-4 font-mono text-[12pt] leading-tight">
          <div className="text-center font-bold mb-4">
            QUICKTOUCH POS SISTEMAS<br/>
            CNPJ: 00.000.000/0001-00<br/>
            --------------------------------
            RECIBO DE VENDA
            --------------------------------
          </div>
          <div className="mb-2">
            DATA: {lastSale.timestamp}<br/>
            OPERADOR: {lastSale.operator}<br/>
            PEDIDO: #{lastSale.id}
          </div>
          <div className="mb-2 border-t border-dashed pt-2">
            CONSUMIDOR: {lastSale.clientCpf}<br/>
            {lastSale.clientName && `NOME: ${lastSale.clientName}`}
          </div>
          <div className="border-b border-dashed mb-2"></div>
          <div className="mb-2">
            <div className="flex justify-between font-bold">
              <span>ITEM</span>
              <span>TOTAL</span>
            </div>
            {lastSale.items.map((it: any) => (
              <div key={it.id} className="flex justify-between">
                <span>{it.quantity}x {it.name.substring(0, 18)}</span>
                <span>{(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed pt-2">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>R$ {lastSale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>DESCONTO:</span>
              <span>- R$ {lastSale.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-1 border-t pt-1">
              <span>TOTAL:</span>
              <span>R$ {lastSale.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-dashed pt-2">
            FORMA DE PAGAMENTO: {lastSale.paymentMethod}<br/>
            --------------------------------
            <div className="text-center mt-2">
              OBRIGADO PELA PREFERENCIA!
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Categorias */}
      <aside className="w-20 bg-white border-r flex flex-col items-center py-4 gap-2 no-print shrink-0">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
          <ShoppingCart size={24} />
        </div>
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-2 px-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex flex-col items-center py-3 rounded-xl transition-all ${
                activeCategory === cat 
                ? 'bg-blue-50 text-blue-600 border-2 border-blue-600' 
                : 'text-slate-400 hover:bg-slate-50'
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
          <button onClick={() => setHeldSales(h => h)} className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm hover:bg-amber-50">
            {ICONS.Hold}
          </button>
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
                  <h4 className="text-sm font-black text-slate-700 leading-tight mb-1 group-hover:text-blue-600 line-clamp-2">
                    {product.name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{product.category}</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carrinho lateral */}
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

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center opacity-50">
              <ShoppingCart size={48} className="mb-4" />
              <p className="text-sm font-bold">CARRINHO VAZIO</p>
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
                      <div className="text-[10px] text-slate-400 font-bold">UN: R$ {item.price.toFixed(2)}</div>
                      <div className="text-lg font-black text-blue-600 tracking-tighter">R$ {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Cliente no Carrinho */}
        <div className="px-5 py-3 border-t bg-blue-50/50">
           {selectedClient || cpfInput ? (
             <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserCheck className="text-blue-600" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Cliente Identificado</p>
                    <p className="text-xs font-black text-slate-700">{selectedClient?.name || `CPF: ${cpfInput}`}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedClient(null); setCpfInput(''); }} className="text-slate-300 hover:text-red-500">
                   <X size={16} />
                </button>
             </div>
           ) : (
             <button 
              onClick={() => setShowClientModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-black text-xs hover:bg-white transition-all"
             >
               <UserPlus size={16} /> CPF NA NOTA?
             </button>
           )}
        </div>

        {/* Rodapé Dinâmico */}
        <div className="p-5 bg-slate-900 text-white rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Desconto</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setDiscount(d => Math.max(0, d - 1))} className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px]">-</button>
                <span className="text-orange-400 font-black">- R$ {discount.toFixed(2)}</span>
                <button onClick={() => setDiscount(d => d + 1)} className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px]">+</button>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800 mb-4" />

          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Total Final</span>
            <span className="text-4xl font-black tracking-tighter leading-none">R$ {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
             <button onClick={() => { resetVenda(); playBeep('cancel'); }} className="flex-1 py-4 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest">LIMPAR (ESC)</button>
             <button disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)} className="flex-[2] py-4 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all font-black text-sm uppercase tracking-widest disabled:opacity-30">PAGAR (F12)</button>
          </div>
        </div>
      </div>

      {/* Modal Identificar Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Identificar Cliente</h2>
              <button onClick={() => setShowClientModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inserir CPF / CNPJ</p>
              <div className="text-3xl font-black text-blue-600 tracking-widest min-h-[40px]">
                {cpfInput || '000.000.000-00'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(key => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') setCpfInput('');
                    else if (key === 'OK') handleIdentifyCpf();
                    else if (cpfInput.length < 11) setCpfInput(prev => prev + key);
                  }}
                  className={`h-16 rounded-2xl text-xl font-bold transition-all btn-touch-active ${
                    key === 'OK' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="flex-1 p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Meio de Pagamento</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} onClick={() => handleFinishSale(m.id)} className="flex items-center gap-3 p-5 rounded-2xl text-left border-2 border-slate-100 hover:border-blue-50 hover:bg-blue-50 transition-all group">
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-black text-slate-700 uppercase text-xs tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full md:w-[240px] bg-blue-600 p-8 text-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total à Receber</span>
                <div className="text-4xl font-black tracking-tighter mt-1">R$ {total.toFixed(2)}</div>
                <div className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">Consumidor</div>
                <div className="text-sm font-bold truncate">{selectedClient?.name || cpfInput || 'Não identificado'}</div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase transition-all">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tela de Recibo Final */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white p-6 no-print overflow-y-auto">
          <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                {ICONS.Finish}
             </div>
             <h2 className="text-3xl font-black">Venda Concluída!</h2>
             
             {/* Simulação Visual do Recibo */}
             <div className="bg-slate-50 p-6 rounded-2xl w-full font-mono text-left text-xs border border-dashed border-slate-300">
                <p className="font-bold text-center border-b pb-2 mb-2 uppercase">Recibo Balcão</p>
                <div className="mb-2 text-[10px]">
                   <p>DATA: {lastSale.timestamp}</p>
                   <p>OP: {lastSale.operator}</p>
                   <p className="font-bold">CPF: {lastSale.clientCpf}</p>
                </div>
                <div className="space-y-1 py-2 border-y border-dashed">
                  {lastSale.items.map((it: any) => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.quantity}x {it.name.substring(0, 20)}</span>
                      <span>R$ {(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-bold text-sm">
                   <div className="flex justify-between"><span>TOTAL PAGO</span> <span>R$ {lastSale.total.toFixed(2)}</span></div>
                </div>
             </div>

             <div className="flex flex-col w-full gap-2">
                <button onClick={handlePrint} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20">
                  {ICONS.Printer} IMPRIMIR RECIBO
                </button>
                <button onClick={resetVenda} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-200">PRÓXIMA VENDA</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDV;
