
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { MOCK_USER } from '../services/mockData';

const Login: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    // In a real app, validate PIN
    setUser(MOCK_USER);
    navigate('/pdv');
  };

  const addDigit = (d: string) => {
    if (pin.length < 4) setPin(prev => prev + d);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">QuickTouch <span className="text-blue-500">POS</span></h1>
          <p className="text-slate-400">Insira seu PIN de acesso para entrar no caixa</p>
        </div>

        <div className="bg-slate-800 p-8 rounded-[40px] shadow-2xl border border-slate-700">
          <div className="flex justify-center gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-600 transition-all ${pin.length > i ? 'bg-blue-500 border-blue-500 scale-125' : ''}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(key => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'C') setPin('');
                  else if (key === 'OK') pin.length === 4 && handleLogin();
                  else addDigit(key);
                }}
                className={`h-20 rounded-2xl text-2xl font-bold transition-all btn-touch-active ${
                  key === 'OK' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-slate-500 text-sm">© 2025 QuickTouch Systems. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default Login;
