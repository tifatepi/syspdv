
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { Product, StockMovement } from '../types';
import { ICONS } from '../constants';
import { Tag, Plus, Trash2, X, Calendar, Package, DollarSign, Palette, Ruler, History, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Scale } from 'lucide-react';

const Products: React.FC = () => {
  const { products, setProducts, categories, setCategories, stockMovements, setStockMovements, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('');

  // Sugestões de unidades de medida
  const UNIT_SUGGESTIONS = ['UN', 'KG', 'LT', 'PC', 'MT', 'CX', 'FD', 'PAR', 'GR', 'ML', 'DZ', 'BD'];

  useEffect(() => {
    if (editingProduct) {
      setSelectedCategory(editingProduct.category);
    } else {
      setSelectedCategory('Mercearia');
    }
  }, [editingProduct, isModalOpen]);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const productMovements = useMemo(() => {
    if (!historyProduct) return [];
    return stockMovements.filter(m => m.productId === historyProduct.id);
  }, [stockMovements, historyProduct]);

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir permanentemente este produto do catálogo?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setStockMovements(prev => prev.filter(m => m.productId !== id));
    }
  };

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(dateStr);
    expiry.setHours(0,0,0,0);
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return { label: 'VENCIDO', color: 'bg-red-500 text-white' };
    if (days <= 10) return { label: `${days} DIAS`, color: 'bg-orange-500 text-white' };
    return { label: 'OK', color: 'bg-green-100 text-green-700' };
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName)) {
      alert('Esta categoria já existe!');
      return;
    }
    setCategories(prev => [...prev, newCategoryName]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (cat === 'Todos') return;
    const hasProducts = products.some(p => p.category === cat);
    if (hasProducts) {
      alert('Não é possível excluir uma categoria que possui produtos vinculados!');
      return;
    }
    if (confirm(`Deseja excluir a categoria "${cat}"?`)) {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStockValue = parseInt(formData.get('stock') as string);
    const currentTimestamp = new Date().toLocaleString();

    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      barcode: formData.get('barcode') as string,
      unit: (formData.get('unit') as string || 'UN').toUpperCase(),
      price: parseFloat(formData.get('price') as string),
      costPrice: parseFloat(formData.get('costPrice') as string) || 0,
      stock: newStockValue,
      minStock: parseInt(formData.get('minStock') as string),
      category: formData.get('category') as string,
      expiryDate: formData.get('expiryDate') as string,
      batch: formData.get('batch') as string,
      size: formData.get('size') as string || undefined,
      color: formData.get('color') as string || undefined,
    };

    if (editingProduct) {
      if (editingProduct.stock !== newStockValue) {
        const diff = newStockValue - editingProduct.stock;
        const adjustment: StockMovement = {
          id: Math.random().toString(36).substring(7).toUpperCase(),
          productId: editingProduct.id,
          productName: productData.name || editingProduct.name,
          type: 'AJUSTE_MANUAL',
          quantity: diff,
          previousStock: editingProduct.stock,
          currentStock: newStockValue,
          timestamp: currentTimestamp,
          operator: user?.name || 'Sistema',
          description: 'Ajuste manual via cadastro de produtos'
        };
        setStockMovements(prev => [adjustment, ...prev]);
      }
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      const newId = Math.random().toString(36).substring(7);
      const newProduct: Product = {
        ...productData as Product,
        id: newId,
      };
      
      if (newStockValue > 0) {
        const initialMovement: StockMovement = {
          id: Math.random().toString(36).substring(7).toUpperCase(),
          productId: newId,
          productName: newProduct.name,
          type: 'AJUSTE_MANUAL',
          quantity: newStockValue,
          previousStock: 0,
          currentStock: newStockValue,
          timestamp: currentTimestamp,
          operator: user?.name || 'Sistema',
          description: 'Estoque inicial no cadastro'
        };
        setStockMovements(prev => [initialMovement, ...prev]);
      }
      setProducts(prev => [...prev, newProduct]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const calculateMargin = (price: number, cost: number) => {
    if (price <= 0) return 0;
    return ((price - cost) / price) * 100;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Estoque & Produtos</h1>
          <p className="text-slate-500 font-medium mt-2">Gerenciamento de lotes, validade e reposição</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3 btn-touch-active"
          >
            <Tag size={20} /> CATEGORIAS
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/40 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 btn-touch-active"
          >
            {ICONS.Plus} NOVO PRODUTO
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
            {ICONS.Search}
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por nome, código SKU ou barras..."
            className="w-full h-16 pl-16 pr-8 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Item / Detalhes</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Validade</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Precificação</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Estoque</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filtered.map(product => {
                const expiry = getExpiryStatus(product.expiryDate);
                const margin = calculateMargin(product.price, product.costPrice);
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-xl leading-none mb-1 group-hover:text-blue-600 transition-colors">{product.name}</span>
                        <div className="flex gap-2 items-center">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {product.sku}
                           </span>
                           <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">UND: {product.unit || 'UN'}</span>
                           {product.size && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">Tam: {product.size}</span>}
                           {product.color && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">Cor: {product.color}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {expiry ? (
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black w-fit uppercase ${expiry.color}`}>
                            {expiry.label}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(product.expiryDate!).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs uppercase">N/I</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-2xl font-black text-blue-600">R$ {product.price.toFixed(2)}</span>
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${margin > 30 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                             {margin.toFixed(0)}% MARGEM
                           </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Custo: R$ {product.costPrice.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${product.stock <= product.minStock ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className={`px-4 py-2 rounded-xl text-sm font-black shadow-inner ${
                          product.stock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {product.stock} {product.unit || 'UN'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 md:opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setHistoryProduct(product); setIsHistoryModalOpen(true); }}
                          title="Histórico de Movimentação"
                          className="w-12 h-12 bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                        >
                          <History size={20} />
                        </button>
                        <button 
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="w-12 h-12 bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                        >
                          {React.cloneElement(ICONS.Settings as React.ReactElement<any>, { size: 20 })}
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="w-12 h-12 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                        >
                          {React.cloneElement(ICONS.Trash as React.ReactElement<any>, { size: 20 })}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isHistoryModalOpen && historyProduct && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-10 border-b flex justify-between items-center bg-slate-50 rounded-t-[40px]">
                 <div>
                   <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <History size={28} className="text-emerald-600" /> Histórico de Movimentação
                   </h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{historyProduct.name} ({historyProduct.sku})</p>
                 </div>
                 <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <X size={28} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 <div className="space-y-4">
                    {productMovements.length === 0 ? (
                      <div className="py-20 text-center opacity-30">
                        <RefreshCcw size={60} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest">Nenhuma movimentação registrada</p>
                      </div>
                    ) : (
                      productMovements.map(m => (
                        <div key={m.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-blue-100 flex items-center justify-between transition-all">
                           <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                                m.quantity > 0 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'
                              }`}>
                                 {m.quantity > 0 ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                              </div>
                              <div>
                                 <p className="font-black text-slate-800">{m.description || m.type}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   {m.timestamp} • Operador: {m.operator}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-xl font-black ${m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {m.quantity > 0 ? '+' : ''}{m.quantity} {historyProduct.unit || 'UN'}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Estoque: {m.currentStock} {historyProduct.unit || 'UN'}</p>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

              <div className="p-10 border-t bg-slate-50 flex justify-between items-center rounded-b-[40px]">
                 <div className="flex gap-10">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase">Estoque Atual</p>
                       <p className="text-2xl font-black text-slate-800">{historyProduct.stock} {historyProduct.unit || 'UN'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase">Custo Médio</p>
                       <p className="text-2xl font-black text-blue-600">R$ {historyProduct.costPrice.toFixed(2)}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsHistoryModalOpen(false)} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest btn-touch-active">FECHAR FICHA</button>
              </div>
           </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <Tag size={24} className="text-blue-600" /> Categorias
               </h2>
               <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nova categoria..." 
                  className="flex-1 h-14 px-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button 
                  onClick={handleAddCategory}
                  className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 btn-touch-active"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                  <span className="font-bold text-slate-700">{cat}</span>
                  {cat !== 'Todos' && (
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white rounded-[40px] w-full max-w-4xl p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Package size={24} /></div>
               {editingProduct ? 'Editar Informações' : 'Cadastrar Novo Item'}
            </h2>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Produto</label>
                  <input name="name" required defaultValue={editingProduct?.name} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-xl transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Código SKU / Referência</label>
                  <input name="sku" required defaultValue={editingProduct?.sku} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-xl transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex flex-col md:col-span-2 gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Código de Barras</label>
                  <input name="barcode" defaultValue={editingProduct?.barcode} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-xl transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                  <select 
                    name="category" 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-lg transition-all appearance-none"
                  >
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Scale size={14} className="text-blue-500" /> Unidade (UND)
                  </label>
                  <input 
                    name="unit" 
                    list="units-list"
                    defaultValue={editingProduct?.unit || 'UN'} 
                    placeholder="Ex: UN, KG, LT..."
                    className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black text-xl transition-all uppercase" 
                  />
                  <datalist id="units-list">
                    {UNIT_SUGGESTIONS.map(u => <option key={u} value={u} />)}
                  </datalist>
                </div>
              </div>

              {(selectedCategory === 'Vestuário' || selectedCategory === 'Calçados') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-purple-50 p-8 rounded-[32px] border-2 border-purple-100 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                       <Ruler size={14} /> Tamanho
                    </label>
                    {selectedCategory === 'Vestuário' ? (
                      <select name="size" defaultValue={editingProduct?.size} className="h-16 p-5 bg-white border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none font-black text-xl transition-all">
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                        <option value="Outro">Outro</option>
                      </select>
                    ) : (
                      <input name="size" defaultValue={editingProduct?.size} type="text" placeholder="Ex: 38, 40, 42..." className="h-16 p-5 bg-white border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none font-black text-xl transition-all" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                       <Palette size={14} /> Cor
                    </label>
                    <input name="color" defaultValue={editingProduct?.color} type="text" placeholder="Ex: Azul Marinho, Branco..." className="h-16 p-5 bg-white border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none font-black text-xl transition-all" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} /> Preço de Custo R$
                  </label>
                  <input name="costPrice" required step="0.01" defaultValue={editingProduct?.costPrice} type="number" className="h-16 p-5 bg-white border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-black text-3xl transition-all" placeholder="0,00" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Quanto você pagou pelo produto</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} /> Preço de Venda R$
                  </label>
                  <input name="price" required step="0.01" defaultValue={editingProduct?.price} type="number" className="h-16 p-5 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-3xl transition-all" placeholder="0,00" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Preço final para o consumidor</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={14} /> Data de Vencimento
                  </label>
                  <input name="expiryDate" defaultValue={editingProduct?.expiryDate} type="date" className="h-16 p-5 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-xl transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                     <Tag size={14} /> Número do Lote
                  </label>
                  <input name="batch" defaultValue={editingProduct?.batch} type="text" placeholder="Ex: L-2025-01" className="h-16 p-5 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-xl transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Estoque Atual</label>
                  <input name="stock" required defaultValue={editingProduct?.stock} type="number" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black text-2xl transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Alerta de Estoque Mínimo</label>
                  <input name="minStock" required defaultValue={editingProduct?.minStock} type="number" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black text-2xl transition-all" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-6 mt-16">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="px-10 py-5 text-slate-400 font-black tracking-widest text-xs btn-touch-active uppercase">FECHAR</button>
              <button type="submit" className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/20 btn-touch-active uppercase tracking-widest">SALVAR ALTERAÇÕES</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;
