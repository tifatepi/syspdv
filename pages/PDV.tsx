
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Product, CartItem, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS, ICONS } from '../constants';
// Fix: Import ShoppingCart directly for custom sizing
import { ShoppingCart } from 'lucide-react';

const PDV: React.FC = () => {
  const { products, setProducts, setSales, user, heldSales, setHeldSales } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHeldSalesModal, setShowHeldSalesModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [mixedPayments, setMixedPayments] = useState<{method: string, value: number}[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Audio Feedback
  const playBeep = (type: 'add' | 'success' | 'cancel' = 'add') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'success' ? 880 : type === 'cancel' ? 220 : 440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.includes(searchTerm) || 
                          p.sku.includes(searchTerm);
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
    searchInputRef.current?.focus();
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleHoldSale = () => {
    if (cart.length === 0) return;
    const newHeld = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      cart: [...cart],
      discount,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };
    setHeldSales(prev => [...prev, newHeld]);
    setCart([]);
    setDiscount(0);
    playBeep('success');
  };

  const resumeHeldSale = (held: any) => {
    setCart(held.cart);
    setDiscount(held.discount);
    setHeldSales(prev => prev.filter(h => h.id !== held.id));
    setShowHeldSalesModal(false);
  };

  const handleFinishSale = (method: string) => {
    const sale = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      items: [...cart],
      total,
      discount,
      paymentMethod: method,
      timestamp: new Date().toLocaleString('pt-BR'),
      operatorId: user?.id || '?'
    };

    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
      return p;
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
    setMixedPayments([]);
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-100">
      {/* Left: Products (65%) */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex gap-3 no-print">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
              {ICONS.Search}
            </div>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Buscar produto ou bipar código..."
              className="w-full h-16 pl-14 pr-6 bg-white border-2 border-slate-200 rounded-2xl text-xl font-bold focus:border-blue-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowHeldSalesModal(true)}
            className="h-16 px-6 bg-amber-500 text-white rounded-2xl font-black flex items-center gap-3 shadow-lg hover:bg-amber-600 btn-touch-active"
          >
            {ICONS.Hold} 
            <span className="bg-white/20 px-2 rounded-lg">{heldSales.length}</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-print shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all btn-touch-active border-2 ${
                activeCategory === cat 
                ? 'bg-blue-600 text-white border-blue-600 shadow-xl' 
                : 'bg-white text-slate-600 border-white hover:border-blue-200 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar no-print">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`flex flex-col text-left bg-white p-5 rounded-3xl border-2 transition-all btn-touch-active group ${
                  product.stock <= 0 
                  ? 'opacity-50 grayscale cursor-not-allowed border-slate-100' 
                  : 'hover:border-blue-500 border-transparent shadow-sm hover:shadow-xl'
                }`}
              >
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</span>
                  <h4 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${product.stock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      Estoque: {product.stock}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">R$ {product.price.toFixed(2)}</span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    {ICONS.Plus}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart (35%) */}
      <div className="w-[450px] bg-white shadow-2xl flex flex-col no-print z-20 border-l">
        <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest text-sm">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{ICONS.PDV}</div>
            Resumo do Cupom
          </h3>
          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">
            {cart.reduce((a, b) => a + b.quantity, 0)} ITENS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-10 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200">
                <ShoppingCart size={48} className="opacity-10" />
              </div>
              <p className="text-xl font-black text-slate-400">Caixa Livre</p>
              <p className="text-sm mt-2 font-medium">Bipe ou toque nos produtos para iniciar a venda</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.id} className="p-6 flex flex-col gap-3 hover:bg-white transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-black text-slate-800 text-lg leading-tight flex-1 pr-4">{item.name}</span>
                    <span className="font-black text-blue-600 text-xl">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400">P. Unit: R$ {item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition-all btn-touch-active"
                      >
                        {item.quantity === 1 ? ICONS.Trash : ICONS.Minus}
                      </button>
                      <span className="text-2xl font-black w-10 text-center text-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-blue-500 shadow-sm transition-all btn-touch-active"
                      >
                        {ICONS.Plus}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-900 text-white space-y-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] rounded-t-[40px]">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              <span>Subtotal Bruto</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Desconto Especial</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setDiscount(p => Math.max(0, p-1))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">{ICONS.Minus.type({...ICONS.Minus.props, size: 14})}</button>
                <span className="font-black text-orange-400 text-xl">- R$ {discount.toFixed(2)}</span>
                <button onClick={() => setDiscount(p => p+1)} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">{ICONS.Plus.type({...ICONS.Plus.props, size: 14})}</button>
              </div>
            </div>
          </div>
          
          <div className="h-px bg-slate-800" />
          
          <div className="flex flex-col items-end">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Total Geral</span>
            <span className="text-6xl font-black text-white tracking-tighter">R$ {total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => { setCart([]); playBeep('cancel'); }}
                className="flex items-center justify-center p-5 rounded-2xl bg-red-500/10 text-red-500 border-2 border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black btn-touch-active"
                title="Cancelar"
              >
                {ICONS.Cancel}
              </button>
              <button 
                onClick={handleHoldSale}
                className="flex items-center justify-center p-5 rounded-2xl bg-amber-500/10 text-amber-500 border-2 border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all font-black btn-touch-active"
                title="Segurar"
              >
                {ICONS.Hold}
              </button>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-green-500 text-white shadow-2xl shadow-green-900/40 hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-xl btn-touch-active"
            >
              {ICONS.Finish} PAGAR
            </button>
          </div>
        </div>
      </div>

      {/* Held Sales Modal */}
      {showHeldSalesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-amber-50">
              <div>
                <h2 className="text-3xl font-black text-amber-800">Vendas em Espera</h2>
                <p className="text-amber-600 font-bold">Retome o atendimento de onde parou</p>
              </div>
              <button onClick={() => setShowHeldSalesModal(false)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">{ICONS.Cancel}</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {heldSales.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Nenhuma venda segurada no momento.</div>
              ) : (
                heldSales.map(held => (
                  <div key={held.id} className="p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between hover:border-amber-400 transition-all">
                    <div>
                      <p className="font-black text-slate-800 text-lg">Venda #{held.id}</p>
                      <p className="text-sm text-slate-500">{held.timestamp} • {held.cart.length} itens</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-black text-amber-600">R$ {(held.cart.reduce((a, b) => a + (b.price * b.quantity), 0) - held.discount).toFixed(2)}</p>
                      <button 
                        onClick={() => resumeHeldSale(held)}
                        className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold btn-touch-active shadow-lg shadow-amber-900/20"
                      >
                        REATIVAR
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white rounded-[50px] w-full max-w-4xl overflow-hidden shadow-2xl flex">
            <div className="flex-1 p-12">
              <h2 className="text-4xl font-black text-slate-800 mb-2">Pagamento</h2>
              <p className="text-xl text-slate-400 font-medium mb-10">Escolha o método de fechamento</p>
              
              <div className="grid grid-cols-2 gap-6">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.id}
                    onClick={() => handleFinishSale(method.id)}
                    className={`flex items-center gap-6 p-10 rounded-[32px] text-left border-2 border-transparent transition-all btn-touch-active shadow-xl shadow-slate-200/50 hover:scale-105 active:scale-95 ${method.color} text-white`}
                  >
                    <span className="text-6xl bg-white/20 p-4 rounded-3xl">{method.icon}</span>
                    <span className="text-3xl font-black leading-none">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[350px] bg-slate-50 border-l p-12 flex flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Total à Receber</p>
                <p className="text-6xl font-black text-slate-900 tracking-tighter">R$ {total.toFixed(2)}</p>
                <div className="mt-10 p-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 text-sm font-bold uppercase mb-2">Operador</p>
                  <p className="text-slate-800 font-black text-lg">{user?.name}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-6 bg-slate-200 text-slate-600 rounded-2xl font-black text-xl hover:bg-slate-300 transition-all btn-touch-active"
              >
                VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal (Unchanged but ensuring presence) */}
      {(showReceipt && lastSale) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white overflow-auto p-10 no-print">
          <div className="flex flex-col items-center gap-10">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce shadow-xl">
               {ICONS.Finish.type({...ICONS.Finish.props, size: 48})}
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900">Venda Realizada!</h2>
              <p className="text-slate-500 font-bold mt-2">Número do pedido: #{lastSale.id}</p>
            </div>

            <div className="bg-white p-10 shadow-2xl border-2 border-slate-100 rounded-3xl w-96 text-sm font-mono text-slate-800">
               <div className="text-center mb-6">
                <h3 className="font-black text-xl uppercase tracking-tighter">QUICKTOUCH POS</h3>
                <p className="text-xs">CNPJ: 00.000.000/0001-00</p>
                <div className="border-b-2 border-dashed border-slate-200 my-4" />
                <p className="font-bold">CUPOM NÃO FISCAL</p>
                <p>{lastSale.timestamp}</p>
              </div>
              <div className="space-y-2 mb-6">
                {lastSale.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate flex-1 pr-4">{item.quantity}x {item.name}</span>
                    <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2 text-lg">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">PAGAMENTO:</span>
                  <span className="font-black">{lastSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-2xl">
                  <span className="font-black text-slate-800">TOTAL:</span>
                  <span className="font-black text-blue-600">R$ {lastSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <button onClick={() => window.print()} className="px-12 py-6 bg-slate-900 text-white rounded-[24px] font-black text-xl shadow-2xl flex items-center gap-4 btn-touch-active">
                {ICONS.Printer} IMPRIMIR
              </button>
              <button onClick={resetVenda} className="px-12 py-6 bg-blue-600 text-white rounded-[24px] font-black text-xl shadow-2xl hover:bg-blue-700 transition-all btn-touch-active">
                NOVA VENDA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDV;
