
import React, { useState } from 'react';
import { useApp } from '../App';
import { Product } from '../types';
import { ICONS } from '../constants';
import { Tag, Plus, Trash2, X } from 'lucide-react';

const Products: React.FC = () => {
  const { products, setProducts, categories, setCategories } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir permanentemente este produto do catálogo?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
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
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      barcode: formData.get('barcode') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      minStock: parseInt(formData.get('minStock') as string),
      category: formData.get('category') as string,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      const newProduct: Product = {
        ...productData as Product,
        id: Math.random().toString(36).substring(7),
        costPrice: 0
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Catálogo de Produtos</h1>
          <p className="text-slate-500 font-medium mt-2">Gerenciamento completo de preços, estoque e validade</p>
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
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Item</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Preço Final</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Estoque</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Categoria</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-xl leading-none mb-1 group-hover:text-blue-600 transition-colors">{product.name}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.sku} | {product.barcode}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-2xl font-black text-blue-600">R$ {product.price.toFixed(2)}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${product.stock <= product.minStock ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                      <span className={`px-4 py-2 rounded-xl text-sm font-black shadow-inner ${
                        product.stock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.stock} UN
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <span className="px-4 py-2 bg-blue-50 text-blue-500 rounded-xl text-xs font-black uppercase tracking-widest">{product.category}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 md:opacity-0 group-hover:opacity-100 transition-all">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Gerenciar Categorias */}
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

      {/* Modal Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white rounded-[40px] w-full max-w-3xl p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">{ICONS.Products}</div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Código de Barras</label>
                  <input name="barcode" defaultValue={editingProduct?.barcode} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-xl transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Preço de Venda R$</label>
                  <input name="price" required step="0.01" defaultValue={editingProduct?.price} type="number" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black text-3xl transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                  <select name="category" defaultValue={editingProduct?.category} className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-lg transition-all appearance-none">
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
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
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="px-10 py-5 text-slate-400 font-black tracking-widest text-xs btn-touch-active">FECHAR</button>
              <button type="submit" className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/20 btn-touch-active uppercase tracking-widest">SALVAR ALTERAÇÕES</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;
