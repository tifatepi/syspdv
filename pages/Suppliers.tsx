
import React, { useState } from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { Supplier } from '../types';
import { X } from 'lucide-react';

const Suppliers: React.FC = () => {
  const { suppliers, setSuppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cnpj.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir permanentemente este fornecedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supplierData: Partial<Supplier> = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      contact: formData.get('contact') as string,
    };

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...supplierData } : s));
    } else {
      const newSupplier: Supplier = {
        ...supplierData as Supplier,
        id: Math.random().toString(36).substring(7),
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Fornecedores</h1>
          <p className="text-slate-500 font-medium mt-2">Parceiros e histórico de suprimentos</p>
        </div>
        <button 
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-3 btn-touch-active"
        >
          {ICONS.Plus} ADICIONAR
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
            {ICONS.Search}
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou CNPJ..."
            className="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(supplier => (
          <div key={supplier.id} className="bg-white p-8 rounded-[32px] shadow-sm border-2 border-slate-100 hover:border-blue-500 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[60px] flex items-center justify-center text-slate-300">
              {React.cloneElement(ICONS.Suppliers as React.ReactElement<any>, { size: 32 })}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2 truncate pr-10">{supplier.name}</h3>
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6">{supplier.cnpj}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500 font-bold bg-slate-50 p-3 rounded-xl">
                <span className="text-blue-500 text-xs">📞</span>
                {supplier.contact}
              </div>
            </div>

            <div className="mt-8 flex gap-3 pt-6 border-t border-slate-50">
              <button 
                onClick={() => handleOpenEdit(supplier)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all btn-touch-active"
              >
                EDITAR
              </button>
              <button 
                onClick={() => handleDelete(supplier.id)}
                className="px-4 py-3 bg-red-50 text-red-400 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all btn-touch-active"
              >
                EXCLUIR
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30">
             <p className="text-xl font-black uppercase tracking-widest">Nenhum fornecedor encontrado</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-800">
                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Fornecedor</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingSupplier?.name} 
                  type="text" 
                  className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                  <input 
                    name="cnpj" 
                    required 
                    defaultValue={editingSupplier?.cnpj} 
                    type="text" 
                    className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contato</label>
                  <input 
                    name="contact" 
                    required 
                    defaultValue={editingSupplier?.contact} 
                    type="text" 
                    className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" 
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-6 mt-12">
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setEditingSupplier(null); }} 
                className="px-8 py-4 text-slate-400 font-black tracking-widest text-xs btn-touch-active uppercase"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 btn-touch-active uppercase tracking-widest"
              >
                {editingSupplier ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
