import { useState, FormEvent } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, HelpCircle, PhoneCall } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLogin: (rut: string) => UserType | null;
  presetUsers: UserType[];
}

export default function LoginView({ onLogin, presetUsers }: LoginViewProps) {
  const [rutInput, setRutInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMess, setErrorMess] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMess('');

    if (!rutInput) {
      setErrorMess('Por favor ingrese su RUT.');
      return;
    }

    // Authenticate with RUT (or any password since it is a local simulator)
    const successUser = onLogin(rutInput);
    if (!successUser) {
      setErrorMess('RUT no encontrado, inactivo o contraseña inválida en el sistema.');
    }
  };

  const handleShortcutLogin = (user: UserType) => {
    setRutInput(user.rut);
    setPasswordInput('phtm2026');
    onLogin(user.rut);
  };

  return (
    <div
      id="login-bg-container"
      className="min-h-screen bg-slate-900 bg-gradient-to-tr from-slate-950 via-slate-800 to-emerald-950 flex flex-col justify-center items-center p-4 font-sans text-brand-on-surface select-none relative"
    >
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login frame card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-100/10 space-y-6 relative z-10">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-extrabold text-[#004ac6] tracking-tighter">PHTM</h2>
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <span className="h-px bg-slate-200 w-12"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#54647a]">TALLER MECÁNICO</span>
            <span className="h-px bg-slate-200 w-12"></span>
          </div>
        </div>

        {errorMess && (
          <p className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold text-center p-3 rounded-xl border border-[#ba1a1a]">
            {errorMess}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* RUT fields */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-500 block">RUT</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-rut-field"
                type="text"
                placeholder="12.345.678-9"
                value={rutInput}
                onChange={(e) => setRutInput(e.target.value)}
                className="w-full text-xs font-semibold border-slate-200 border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#004ac6]"
              />
            </div>
          </div>

          {/* PASSWORD fields */}
          <div className="space-y-1 text-left relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 block">CONTRASEÑA</label>
            </div>
            
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs font-semibold border-slate-200 border rounded-xl pl-10 pr-10 py-3.5 focus:outline-none focus:border-[#004ac6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004ac6]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-button"
            className="w-full bg-[#004ac6] hover:bg-[#2563eb] text-white py-3.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-md relative group overflow-hidden"
          >
            <span>Iniciar Sesión</span>
            <span className="inline-block transform translate-x-1 group-hover:translate-x-2 transition-transform ml-2">→</span>
          </button>
        </form>

        <div className="border-t border-slate-100 pt-5 text-center space-y-4">
          {/* Quick Access section for testing */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2.5">
            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 block text-center">
              Accesos Rápidos Demo (Haga Click para testear)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              {presetUsers.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  id={`shortcut-login-${user.id}`}
                  onClick={() => handleShortcutLogin(user)}
                  className="bg-white border rounded-lg p-2 hover:bg-[#e7eeff] hover:text-[#004ac6] transition-colors text-slate-700 text-left truncate"
                >
                  <p className="truncate text-[10px]">{user.name}</p>
                  <p className="text-[8px] text-slate-400 truncate">{user.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs font-semibold text-slate-500">
        © 2026 Padre Hurtado Taller Mecánico — v1.4
      </p>
    </div>
  );
}
