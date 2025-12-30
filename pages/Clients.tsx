
import React, { useState } from 'react';
import { useApp } from '../App';
import { Client } from '../types';
import { ICONS } from '../constants';
// Fixed: Changed IdentificationCard to IdCard as IdentificationCard does not exist in lucide-react
import { User, Phone, IdCard, Search, Plus, Trash2, Edit } from 'lucide-react';

const Clients: React.FC = () => {
  const { clients, setClients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm) ||
    c.contact.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientData: Partial<Client> = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      contact: formData.get('contact') as string,
    };

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...clientData as Client } : c));
    } else {
      const newClient: Client = {
        ...clientData as Client,
        id: Math.random().toString(36).substring(7),
        points: 0
      };
      setClients(prev => [...prev, newClient]);
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Clientes</h1>
          <p className="text-slate-500 font-medium mt-2">Gerenciamento de consumidores e fidelidade</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 btn-touch-active"
        >
          <Plus size={24} /> NOVO CLIENTE
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, CPF ou telefone..."
            className="w-full h-16 pl-16 pr-8 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => (
          <div key={client.id} className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-100 group hover:border-blue-500 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">{client.name}</h3>
                <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Fidelidade: {client.points} pts</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-500 font-bold bg-slate-50 p-4 rounded-2xl">
                {/* Fixed: Changed IdentificationCard to IdCard */}
                <IdCard size={18} className="text-slate-400" />
                <span className="text-sm">{client.cpf}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-bold bg-slate-50 p-4 rounded-2xl">
                <Phone size={18} className="text-slate-400" />
                <span className="text-sm">{client.contact}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setEditingClient(client); setIsModalOpen(true); }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all btn-touch-active flex items-center justify-center gap-2"
              >
                <Edit size={18} /> EDITAR
              </button>
              <button 
                onClick={() => handleDelete(client.id)}
                className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all btn-touch-active"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30">
             <User size={80} className="mx-auto mb-4" />
             <p className="text-xl font-black">NENHUM CLIENTE ENCONTRADO</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white rounded-[40px] w-full max-w-xl p-12 shadow-2xl">
            <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Plus size={24} /></div>
               {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <input name="name" required defaultValue={editingClient?.name} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</label>
                  <input name="cpf" required defaultValue={editingClient?.cpf} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-xl" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contato</label>
                  <input name="contact" defaultValue={editingClient?.contact} type="text" className="h-16 p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-xl" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-6 mt-12">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-400 font-black tracking-widest text-xs btn-touch-active uppercase">Cancelar</button>
              <button type="submit" className="px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-900/20 btn-touch-active uppercase tracking-widest">Gravar Cadastro</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;
