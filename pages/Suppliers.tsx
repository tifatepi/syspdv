
import React, { useState } from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';

const Suppliers: React.FC = () => {
  const { suppliers, setSuppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cnpj.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Fornecedores</h1>
          <p className="text-slate-500 font-medium mt-2">Parceiros e histórico de suprimentos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
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
              {/* Fix: Use ICONS.Suppliers instead of ICONS.Users */}
              <ICONS.Suppliers.type {...ICONS.Suppliers.props} size={32} />
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
              <button className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all btn-touch-active">EDITAR</button>
              <button className="px-4 py-3 bg-red-50 text-red-400 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all btn-touch-active">EXCLUIR</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black text-slate-800 mb-8">Novo Fornecedor</h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Fornecedor</label>
                <input type="text" className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                  <input type="text" className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contato</label>
                  <input type="text" className="h-14 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-6 mt-12">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-400 font-black tracking-widest text-xs btn-touch-active">CANCELAR</button>
              <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 btn-touch-active">CADASTRAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
