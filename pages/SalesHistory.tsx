
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { ICONS, PAYMENT_METHODS } from '../constants';
import { Search, Printer, X, Eye } from 'lucide-react';

const SalesHistory: React.FC = () => {
  const { sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const filteredSales = useMemo(() => {
    return [...sales].reverse().filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.clientCpf && s.clientCpf.includes(searchTerm)) ||
      (s.clientName && s.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sales, searchTerm]);

  const getFormattedTime = (ts: string) => {
    const parts = ts.split(' ');
    return { date: parts[0] + ',', time: (parts[1] || '').substring(0, 5) };
  };

  const renderReceiptText = (sale: any) => {
    const { date, time } = getFormattedTime(sale.timestamp);
    const SEP = "--------------------------------";
    
    let receipt = `      MERCEARIA DO CLAUDIO\n`;
    receipt += `     CNPJ: 00.000.000/0001-00\n`;
    receipt += `${SEP}\n`;
    receipt += `CLIENTE: CPF: ${sale.clientCpf || '000.000.000-00'}\n`;
    receipt += `${SEP}\n`;
    receipt += `Data: ${date}  Hora: ${time}\n`;
    receipt += `Operador: ${sale.operator}\n`;
    receipt += `${SEP}\n`;
    
    receipt += `Produto        Qtd   Valor\n`;

    sale.items.forEach((it: any) => {
      const name = it.name.substring(0, 14).padEnd(15, ' ');
      const qty = it.quantity.toString().padStart(6, ' ');
      const val = (it.price * it.quantity).toFixed(2).padStart(11, ' ');
      receipt += `${name}${qty}${val}\n`;
    });

    receipt += `${SEP}\n`;
    receipt += `Subtotal:`.padEnd(15, ' ') + (sale.subtotal || 0).toFixed(2).padStart(17, ' ') + `\n`;
    receipt += `Desconto:`.padEnd(15, ' ') + (sale.discount || 0).toFixed(2).padStart(17, ' ') + `\n`;
    receipt += `TOTAL:`.padEnd(15, ' ') + (sale.total || 0).toFixed(2).padStart(17, ' ') + `\n`;
    receipt += `${SEP}\n`;

    receipt += `Pagamento: ${sale.paymentMethod}\n`;
    if (sale.paymentMethod === 'DINHEIRO' && sale.amountReceived !== undefined) {
        receipt += `Valor Recebido: ${sale.amountReceived.toFixed(2)}\n`;
        receipt += `Troco: ${sale.change.toFixed(2)}\n`;
    }

    receipt += `${SEP}\n`;
    receipt += `Obrigado pela preferência!\n`;
    receipt += `${SEP}`;
    
    return receipt;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar no-print">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Histórico de Vendas</h1>
          <p className="text-slate-500 font-medium mt-2">Consulte e reimprima vendas realizadas no balcão</p>
        </div>
        <div className="bg-blue-600 text-white px-8 py-5 rounded-[24px] shadow-2xl shadow-blue-900/20 flex flex-col items-center">
           <span className="text-[10px] font-black uppercase opacity-60">Total em Vendas</span>
           <span className="text-3xl font-black tracking-tighter">R$ {sales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Filtrar por ID da Venda, CPF ou Nome do Cliente..."
            className="w-full h-16 pl-16 pr-8 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ID / Data</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Pagamento</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-lg">#{sale.id}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sale.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{sale.clientName || 'Consumidor'}</span>
                      <span className="text-xs text-slate-400 font-bold tracking-tighter">CPF: {sale.clientCpf || 'N/I'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xl font-black text-slate-900 tracking-tighter">R$ {sale.total.toFixed(2)}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="w-12 h-12 bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center opacity-30">
                    {React.cloneElement(ICONS.PDV as React.ReactElement<any>, { size: 60, className: "mx-auto mb-4" })}
                    <p className="font-black uppercase tracking-widest">Nenhuma venda encontrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhe da Venda (Recibo Virtual) */}
      {selectedSale && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800">Visualizar Recibo</h3>
               <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
               </button>
            </div>
            
            <div className="p-10 flex flex-col items-center">
               <div className="bg-slate-50 p-6 rounded-2xl w-full font-mono text-left text-[11px] border border-dashed border-slate-300 shadow-inner overflow-hidden mb-8">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {renderReceiptText(selectedSale)}
                  </pre>
               </div>

               <div className="flex w-full gap-4">
                  <button 
                    onClick={() => {
                      handlePrint();
                    }} 
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
                  >
                    <Printer size={20} /> REIMPRIMIR
                  </button>
                  <button 
                    onClick={() => setSelectedSale(null)} 
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[24px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    FECHAR
                  </button>
               </div>
            </div>
          </div>

          <div className="print-only print-content">
            <pre style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              lineHeight: '1.2',
              whiteSpace: 'pre-wrap',
              margin: 0,
              width: '100%'
            }}>
              {renderReceiptText(selectedSale)}
            </pre>
            <div style={{ height: '50px' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
