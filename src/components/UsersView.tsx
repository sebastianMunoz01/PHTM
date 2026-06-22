import { useState, FormEvent } from 'react';
import { UserPlus, ShieldAlert, Users, Search, RefreshCw, FileText, CheckCircle2, AlertTriangle, EyeOff, Eye } from 'lucide-react';
import { User, ActivityLog } from '../types';

interface UsersViewProps {
  users: User[];
  logs: ActivityLog[];
  currentUser: User | null;
  addUser: (user: Omit<User, 'id'>) => User;
  toggleUserStatus: (id: string) => void;
}

export default function UsersView({
  users,
  logs,
  currentUser,
  addUser,
  toggleUserStatus,
}: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // New User Form states
  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Mecánico' | 'Recepcionista' | 'Encargado' | 'Gerente' | ''>('');

  // Validation states
  const [rutError, setRutError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Chilean RUT Validation & Formatting helper
  const formatRut = (raw: string): string => {
    let cleaned = raw.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleaned.length === 0) return '';
    cleaned = cleaned.slice(0, 9);
    if (cleaned.length <= 1) return cleaned;
    
    const dv = cleaned.slice(-1);
    const body = cleaned.slice(0, -1);
    
    let formattedBody = '';
    if (body.length > 0) {
      const revBody = body.split('').reverse().join('');
      let temp = '';
      for (let i = 0; i < revBody.length; i++) {
        if (i > 0 && i % 3 === 0) {
          temp += '.';
        }
        temp += revBody[i];
      }
      formattedBody = temp.split('').reverse().join('');
    }
    return formattedBody ? `${formattedBody}-${dv}` : dv;
  };

  const validateChileanRut = (value: string): boolean => {
    const cleanRut = value.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
    if (cleanRut.length < 8 || cleanRut.length > 9) return false;
    
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    if (!/^\d+$/.test(body)) return false;
    
    let sum = 0;
    let mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    
    const r = sum % 11;
    let expectedDv = 11 - r;
    let expectedDvStr = '';
    if (expectedDv === 11) expectedDvStr = '0';
    else if (expectedDv === 10) expectedDvStr = 'K';
    else expectedDvStr = expectedDv.toString();
    
    return dv === expectedDvStr;
  };

  const validateChileanPhone = (val: string): boolean => {
    if (!val) return true;
    const clean = val.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('56')) {
      const remaining = clean.slice(2);
      return remaining.length === 9 || remaining.length === 8;
    }
    return clean.length === 9 || clean.length === 8;
  };

  const handleRutChange = (val: string) => {
    const formatted = formatRut(val);
    setRut(formatted);
    if (!formatted) {
      setRutError('');
    } else if (validateChileanRut(formatted)) {
      setRutError('');
    }
  };

  const handleRutBlur = () => {
    if (rut && !validateChileanRut(rut)) {
      setRutError('RUT inválido (ej: 12.345.678-K)');
    } else {
      setRutError('');
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!val || validateChileanPhone(val)) {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    if (phone && !validateChileanPhone(phone)) {
      setPhoneError('Debe ingresar un número de 8 o 9 dígitos (ej: +56 9 1234 5678)');
    } else {
      setPhoneError('');
    }
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Filter list matching search query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.rut.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculation
  const totalStaff = users.length;
  const activeStaff = users.filter((u) => u.active).length;
  const inactiveStaff = totalStaff - activeStaff;

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !rut || !role) {
      alert('Por favor complete los campos obligatorios: Nombre, RUT y Cargo.');
      return;
    }

    const isRutValid = validateChileanRut(rut);
    const isPhoneValid = !phone || validateChileanPhone(phone);

    if (!isRutValid) {
      setRutError('RUT inválido (ej: 12.345.678-K)');
      alert('El RUT ingresado no es válido. Por favor ingrese un RUT chileno correcto.');
      return;
    }

    if (!isPhoneValid) {
      setPhoneError('Número inválido (ej: +56 9 1234 5678)');
      alert('El número de teléfono no es válido en el territorio chileno (debe tener 8 o 9 dígitos).');
      return;
    }

    addUser({
      rut: rut.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim() || '+56 9 1234 5678',
      email: email.trim() || 'user@phtm.cl',
      role: role as any,
      active: true
    });

    // Reset
    setRut('');
    setName('');
    setPhone('');
    setEmail('');
    setRole('');
    setRutError('');
    setPhoneError('');
  };

  const getRoleStyle = (userRole: string) => {
    switch (userRole) {
      case 'Gerente':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Encargado':
        return 'bg-blue-100 text-[#004ac6] border-blue-200';
      case 'Recepcionista':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Mecánico':
        return 'bg-[#f0f3ff] text-[#54647a] border-[#c3c6d7]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Check if logged in user is Gerente to fully unlock logs
  const isGerente = currentUser?.role === 'Gerente';

  return (
    <div id="users-view" className="space-y-6 font-sans">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight">Administración de Usuarios</h2>
        <p className="text-[#434655] text-sm">Controle delegaciones, permisos técnicos y verifique logs de auditoría.</p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Span 5): Create user & Log de Actividad */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Box 1: Crear Nuevo Usuario */}
          <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#004ac6]" />
              <span>Crear Nuevo Usuario</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">RUT</label>
                <input
                  id="user-rut-field"
                  type="text"
                  required
                  placeholder="Ej: 12.345.678-9"
                  value={rut}
                  onChange={(e) => handleRutChange(e.target.value)}
                  onBlur={handleRutBlur}
                  className={`w-full text-xs border rounded-lg px-4 py-3 transition-colors ${
                    rutError ? 'border-red-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]'
                  }`}
                />
                {rutError && (
                  <p id="rut-error-hint" className="text-[10px] text-red-500 font-bold mt-1">
                    {rutError}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Nombre Completo</label>
                <input
                  id="user-name-field"
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border-slate-200 border rounded-lg px-4 py-3 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Teléfono</label>
                  <input
                    id="user-phone-field"
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={handlePhoneBlur}
                    className={`w-full text-xs border rounded-lg px-4 py-3 transition-colors ${
                      phoneError ? 'border-red-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]'
                    }`}
                  />
                  {phoneError ? (
                    <p id="phone-error-hint" className="text-[9px] text-red-500 font-bold mt-1 leading-tight">
                      {phoneError}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Correo Electrónico</label>
                  <input
                    id="user-email-field"
                    type="email"
                    placeholder="usuario@phtm.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Selector de Rol</label>
                <select
                  id="user-role-select"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs border-[#dee8ff] bg-white border rounded-lg px-4 py-3"
                >
                  <option value="">Seleccione un cargo...</option>
                  <option value="Mecánico">Mecánico</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Encargado">Encargado</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#004ac6] hover:bg-[#2563eb] text-white font-heavy rounded-xl transition-all font-bold cursor-pointer text-center text-sm shadow-sm"
              >
                Crear Usuario
              </button>
            </form>
          </div>

          {/* Box 2: Log de Actividad */}
          <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heavy uppercase tracking-wider text-[#004ac6] font-bold">Log de Actividad</h3>
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                SOLO GERENTE
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 select-none">
              {logs.map((log) => {
                const blurClass = log.isOnlyGerente && !isGerente ? 'blur-xs line-through opacity-40' : '';
                return (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] leading-relaxed relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[#737686] font-bold mb-1">
                      <span>{log.user}</span>
                      <span>
                        {log.timestamp} - {log.timeOnly}
                      </span>
                    </div>
                    
                    <p className={`text-[#111c2d] font-semibold ${blurClass}`}>
                      {log.action}
                    </p>
                    {log.isOnlyGerente && !isGerente && (
                      <span className="absolute inset-0 bg-slate-100/10 flex items-center justify-center text-[10px] font-bold text-[#ba1a1a]">
                        Bloqueado (Solo Gerente)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Span 7): Personal Register */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold">Listado de Personal</h3>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                  <input
                    id="users-list-search"
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-semibold border-slate-200 border rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#004ac6] w-52"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-[#dee8ff] rounded-xl mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#dee8ff]">
                      <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Nombre</th>
                      <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">RUT</th>
                      <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Rol</th>
                      <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedUsers.map((u, idx) => (
                      <tr
                        key={u.id}
                        id={`user-row-${u.id}`}
                        className={`hover:bg-[#dee8ff]/15 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#e7eeff]/10'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{u.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">{u.rut}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleStyle(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            id={`toggle-user-status-${u.id}`}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
                              u.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {u.active ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="p-4 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-xs font-semibold text-[#54647a] rounded-b-xl my-4">
                <span>
                  Mostrando {Math.min(startIndex + 1, filteredUsers.length)}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} de{' '}
                  {filteredUsers.length} registrados
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white border border-[#dee8ff] disabled:opacity-50 text-[#111c2d] rounded-lg"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                        currentPage === i + 1
                          ? 'bg-[#004ac6] text-white border-[#004ac6]'
                          : 'bg-white text-slate-700 border-[#dee8ff] hover:bg-[#dee8ff]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white border border-[#dee8ff] disabled:opacity-50 text-[#111c2d] rounded-lg"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom mini counter indicators block */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="bg-[#dee8ff] p-4 rounded-xl text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#004ac6]">Total Personal</span>
                <p className="text-2xl font-black text-[#111c2d] mt-1">{totalStaff}</p>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Activos Hoy</span>
                <p className="text-2xl font-black text-emerald-800 mt-1">{activeStaff}</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 font-bold">Pendientes</span>
                <p className="text-2xl font-black text-amber-800 mt-1">{inactiveStaff}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
