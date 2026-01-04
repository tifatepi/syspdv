
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { StockEntry, StockEntryItem, Product, StockMovement } from '../types';
import { Package, Truck, FileText, Plus, Search, Trash2, CheckCircle2, X, ShoppingBag, Edit3, Calendar, FilterX } from 'lucide-react';

const Inventory: React.FC = () => {
  const { products, setProducts, suppliers, stockEntries, setStockEntries, setStockMovements, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Estado para nova entrada ou edição
  const [newEntry, setNewEntry] = useState<{
    invoiceNumber: string;
    invoiceDate: string;
    supplierId: string;
    items: StockEntryItem[];
  }>({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    supplierId: '',
    items: []
  });

  const [productSearch, setProductSearch] = useState('');

  // Fix: Added missing 'matchedProducts' memoization to filter products based on user input in the stock entry modal
  const matchedProducts = useMemo(() => {
    if (productSearch.length < 2) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.barcode.includes(productSearch) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5);
  }, [products, productSearch]);

  const filteredEntries = useMemo(() => {
    return stockEntries.filter(e => {
      const matchText = e.invoiceNumber.includes(searchTerm) || 
                        e.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const entryDate = e.invoiceDate; // Formato YYYY-MM-DD
      const matchStart = !startDate || entryDate >= startDate;
      const matchEnd = !endDate || entryDate <= endDate;

      return matchText && matchStart && matchEnd;
    });
  }, [stockEntries, searchTerm, startDate, endDate]);

  const handleEditClick = (entry: StockEntry) => {
    setEditingEntryId(entry.id);
    setNewEntry({
      invoiceNumber: entry.invoiceNumber,
      invoiceDate: entry.invoiceDate || new Date().toISOString().split('T')[0],
      supplierId: entry.supplierId,
      items: [...entry.items]
    });
    setIsModalOpen(true);
  };

  const addProductToEntry = (product: Product) => {
    const existing = newEntry.items.find(i => i.productId === product.id);
    if (existing) return;

    setNewEntry(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        costPrice: product.costPrice
      }]
    }));
    setProductSearch('');
  };

  const updateItem = (productId: string, field: 'quantity' | 'costPrice', value: number) => {
    setNewEntry(prev => ({
      ...prev,
      items: prev.items.map(i => i.productId === productId ? { ...i, [field]: value } : i)
    }));
  };

  const removeItem = (productId: string) => {
    setNewEntry(prev => ({
      ...prev,
      items: prev.items.filter(i => i.productId !== productId)
    }));
  };

  const handleSaveEntry = () => {
    if (!newEntry.supplierId || !newEntry.invoiceNumber || !newEntry.invoiceDate || newEntry.items.length === 0) {
      alert("Preencha todos os campos e adicione ao menos um item.");
      return;
    }

    const supplier = suppliers.find(s => s.id === newEntry.supplierId);
    const totalValue = newEntry.items.reduce((acc, it) => acc + (it.costPrice * it.quantity), 0);
    const currentTimestamp = new Date().toLocaleString();

    let updatedStockEntries = [...stockEntries];
    let newMovements: StockMovement[] = [];

    if (editingEntryId) {
      const oldEntry = stockEntries.find(e => e.id === editingEntryId);
      if (!oldEntry) return;

      setProducts(prev => prev.map(p => {
        let updatedP = { ...p };
        const oldItem = oldEntry.items.find(oi => oi.productId === p.id);
        if (oldItem) {
          updatedP.stock -= oldItem.quantity;
        }
        const newItem = newEntry.items.find(ni => ni.productId === p.id);
        if (newItem) {
          const previousStockForMovement = updatedP.stock;
          updatedP.stock += newItem.quantity;
          updatedP.costPrice = newItem.costPrice;
          newMovements.push({
            id: Math.random().toString(36).substring(7).toUpperCase(),
            productId: p.id,
            productName: p.name,
            type: 'ENTRADA_NF',
            quantity: newItem.quantity,
            previousStock: previousStockForMovement,
            currentStock: updatedP.stock,
            timestamp: currentTimestamp,
            referenceId: newEntry.invoiceNumber,
            operator: user?.name || 'Sistema',
            description: `RETIFICAÇÃO NF #${newEntry.invoiceNumber} - ${supplier?.name}`
          });
        }
        return updatedP;
      }));

      updatedStockEntries = updatedStockEntries.map(e => e.id === editingEntryId ? {
        ...e,
        invoiceNumber: newEntry.invoiceNumber,
        invoiceDate: newEntry.invoiceDate,
        supplierId: newEntry.supplierId,
        supplierName: supplier?.name || 'Fornecedor Desconhecido',
        items: [...newEntry.items],
        totalValue,
        date: currentTimestamp + ' (Editado)'
      } : e);

    } else {
      const entryId = Math.random().toString(36).substring(7).toUpperCase();
      const entryRecord: StockEntry = {
        id: entryId,
        invoiceNumber: newEntry.invoiceNumber,
        invoiceDate: newEntry.invoiceDate,
        supplierId: newEntry.supplierId,
        supplierName: supplier?.name || 'Fornecedor Desconhecido',
        items: [...newEntry.items],
        totalValue,
        date: currentTimestamp
      };

      setProducts(prev => prev.map(p => {
        const entryItem = newEntry.items.find(ei => ei.productId === p.id);
        if (entryItem) {
          const currentStock = p.stock + entryItem.quantity;
          newMovements.push({
            id: Math.random().toString(36).substring(7).toUpperCase(),
            productId: p.id,
            productName: p.name,
            type: 'ENTRADA_NF',
            quantity: entryItem.quantity,
            previousStock: p.stock,
            currentStock: currentStock,
            timestamp: entryRecord.date,
            referenceId: entryRecord.invoiceNumber,
            operator: user?.name || 'Sistema',
            description: `Entrada NF #${entryRecord.invoiceNumber} - ${entryRecord.supplierName}`
          });
          return { ...p, stock: currentStock, costPrice: entryItem.costPrice };
        }
        return p;
      }));
      updatedStockEntries = [entryRecord, ...updatedStockEntries];
    }

    setStockMovements(prev => [...newMovements, ...prev]);
    setStockEntries(updatedStockEntries);
    setIsModalOpen(false);
    setEditingEntryId(null);
    setNewEntry({ 
      invoiceNumber: '', 
      invoiceDate: new Date().toISOString().split('T')[0], 
      supplierId: '', 
      items: [] 
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntryId(null);
    setNewEntry({ 
      invoiceNumber: '', 
      invoiceDate: new Date().toISOString().split('T')[0], 
      supplierId: '', 
      items: [] 
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/I';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Gestão de Estoque</h1>
          <p className="text-slate-500 font-medium mt-2">Entradas de mercadorias, NF-e e movimentação física</p>
        </div>
        <button 
          onClick={() => { setEditingEntryId(null); setIsModalOpen(true); }}
          className="px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center gap-3 btn-touch-active"
        >
          <Plus size={24} /> NOVA ENTRADA (COMPRA)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-100">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package size={24} /></div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Itens em Estoque</p>
           </div>
           <p className="text-3xl font-black text-slate-800">{products.reduce((acc, p) => acc + p.stock, 0)} UN</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-100">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Truck size={24} /></div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Entradas Exibidas</p>
           </div>
           <p className="text-3xl font-black text-slate-800">{filteredEntries.length} NF-e</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-100">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><ShoppingBag size={24} /></div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Exibido</p>
           </div>
           <p className="text-3xl font-black text-slate-800">R$ {filteredEntries.reduce((acc, e) => acc + e.totalValue, 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Buscar NF ou Fornecedor</label>
            <div className="relative">
              <Search className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400" size={24} />
              <input 
                type="text" 
                placeholder="Ex: 000.123..."
                className="w-full h-16 pl-16 pr-8 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Data Inicial (Nota)</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                <input 
                  type="date" 
                  className="w-full h-16 pl-14 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Data Final (Nota)</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                <input 
                  type="date" 
                  className="w-full h-16 pl-14 pr-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              {(startDate || endDate || searchTerm) && (
                <button 
                  onClick={() => { clearDateFilters(); setSearchTerm(''); }}
                  className="h-16 px-6 bg-slate-100 text-slate-500 hover:text-red-500 rounded-2xl flex items-center gap-2 font-black text-xs uppercase transition-all"
                  title="Limpar Filtros"
                >
                  <FilterX size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border-2 border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-100">
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">NF / Data Nota</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Fornecedor</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Itens</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Valor Total</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {filteredEntries.map(entry => (
              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-lg">NF: {entry.invoiceNumber}</span>
                    <span className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2 mt-1">
                      <Calendar size={12} /> {formatDate(entry.invoiceDate)}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase mt-1">Reg: {entry.date}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                   <span className="font-bold text-slate-700">{entry.supplierName}</span>
                </td>
                <td className="px-10 py-8">
                   <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                     {entry.items.length} PRODUTOS
                   </span>
                </td>
                <td className="px-10 py-8">
                   <span className="text-xl font-black text-slate-900">R$ {entry.totalValue.toFixed(2)}</span>
                </td>
                <td className="px-10 py-8 text-right">
                  <button 
                    onClick={() => handleEditClick(entry)}
                    className="w-12 h-12 bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <Edit3 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-10 py-20 text-center opacity-30">
                  <Package size={60} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest">Nenhuma nota encontrada para este filtro</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50 rounded-t-[40px]">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                  <Truck size={32} className="text-blue-600" /> 
                  {editingEntryId ? 'Editar Entrada de Mercadoria' : 'Registrar Entrada de Mercadoria'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                   <X size={28} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Fornecedor</label>
                      <select 
                        className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-lg transition-all"
                        value={newEntry.supplierId}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, supplierId: e.target.value }))}
                      >
                         <option value="">Selecione o Fornecedor...</option>
                         {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cnpj})</option>)}
                      </select>
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número da Nota Fiscal (NF-e)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 000.123.456"
                        className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-2xl transition-all"
                        value={newEntry.invoiceNumber}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      />
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Calendar size={14} className="text-blue-500" /> Data da Nota Fiscal
                      </label>
                      <input 
                        type="date" 
                        className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-xl transition-all"
                        value={newEntry.invoiceDate}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      />
                   </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[32px] space-y-6">
                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Buscar Produto para Adicionar</label>
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={24} />
                        <input 
                          type="text" 
                          placeholder="Digite nome ou código de barras..."
                          className="w-full h-16 pl-16 pr-6 bg-white/5 border-2 border-white/10 focus:border-blue-500 rounded-2xl outline-none font-bold text-white transition-all"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                        {matchedProducts.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-2xl border border-white/10 shadow-2xl z-[160] overflow-hidden">
                            {matchedProducts.map(p => (
                              <button 
                                key={p.id} 
                                onClick={() => addProductToEntry(p)}
                                className="w-full p-5 text-left hover:bg-white/5 flex justify-between items-center transition-all border-b border-white/5 last:border-0"
                              >
                                 <div>
                                   <p className="font-black text-white">{p.name}</p>
                                   <p className="text-xs text-slate-500 font-bold uppercase">{p.sku}</p>
                                 </div>
                                 <Plus size={20} className="text-blue-500" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Itens da Nota</p>
                      {newEntry.items.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-white/10 rounded-3xl text-center">
                           <p className="text-slate-600 font-bold uppercase text-xs">Aguardando adição de produtos</p>
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-3xl overflow-hidden divide-y divide-white/10">
                           {newEntry.items.map(it => (
                             <div key={it.productId} className="p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1">
                                   <p className="font-black text-white">{it.name}</p>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase">ID: {it.productId}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-black text-slate-500 uppercase">Quantidade</span>
                                      <input 
                                        type="number" 
                                        className="w-24 h-12 bg-white/10 border border-white/10 rounded-xl px-3 text-white font-black outline-none focus:border-blue-500"
                                        value={it.quantity}
                                        onChange={(e) => updateItem(it.productId, 'quantity', parseInt(e.target.value) || 0)}
                                      />
                                   </div>
                                   <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-black text-slate-500 uppercase">Custo Unit. R$</span>
                                      <input 
                                        type="number" 
                                        step="0.01"
                                        className="w-32 h-12 bg-white/10 border border-white/10 rounded-xl px-3 text-white font-black outline-none focus:border-blue-500"
                                        value={it.costPrice}
                                        onChange={(e) => updateItem(it.productId, 'costPrice', parseFloat(e.target.value) || 0)}
                                      />
                                   </div>
                                   <div className="text-right w-32">
                                      <p className="text-[10px] font-black text-slate-500 uppercase">Subtotal</p>
                                      <p className="text-lg font-black text-blue-400">R$ {(it.costPrice * it.quantity).toFixed(2)}</p>
                                   </div>
                                   <button onClick={() => removeItem(it.productId)} className="p-3 text-slate-600 hover:text-red-500 transition-colors">
                                      <Trash2 size={20} />
                                   </button>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
             </div>

             <div className="p-10 border-t bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[40px]">
                <div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor Total da Nota</p>
                   <p className="text-4xl font-black text-slate-800 tracking-tighter">R$ {newEntry.items.reduce((acc, it) => acc + (it.costPrice * it.quantity), 0).toFixed(2)}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <button onClick={closeModal} className="flex-1 md:flex-none px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-xs btn-touch-active uppercase">CANCELAR</button>
                   <button 
                    onClick={handleSaveEntry}
                    className="flex-1 md:flex-none px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 btn-touch-active uppercase tracking-widest"
                   >
                     <CheckCircle2 size={24} /> {editingEntryId ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR ENTRADA'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
