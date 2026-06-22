import { useState, FormEvent } from 'react';
import { Users, Info, Search, FileDown, PlusCircle, Car, UserCheck, Trash2, X, Save } from 'lucide-react';
import { Client, Vehicle } from '../types';

interface ClientsViewProps {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Client;
}

export default function ClientsView({ clients, addClient }: ClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Client Form states
  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clientType, setClientType] = useState<'Particular' | 'Empresa'>('Particular');

  // Validation States
  const [rutError, setRutError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

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
    if (!val) return false;
    const clean = val.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('56')) {
      const remaining = clean.slice(2);
      return remaining.length === 9 || remaining.length === 8;
    }
    return clean.length === 9 || clean.length === 8;
  };

  const validateEmailFormat = (val: string): boolean => {
    if (!val) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
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
      setRutError('RUT inválido (ej: 12.345.678-K).');
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
      setPhoneError('Teléfono inválido (ej: +56 9 1234 5678). Debe tener 8 o 9 dígitos de celular o red fija.');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val || validateEmailFormat(val)) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmailFormat(email)) {
      setEmailError('Correo inválido (ej: cliente@taller.cl).');
    } else {
      setEmailError('');
    }
  };

  // Trigger vehicle modal state to bind cars directly to a client
  const [bindingClient, setBindingClient] = useState<Client | null>(null);
  const [nPatent, setNPatent] = useState('');
  const [nBrand, setNBrand] = useState('');
  const [nModel, setNModel] = useState('');
  const [nYear, setNYear] = useState<number>(new Date().getFullYear());

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter query targeting name, RUT, or bound plates
  const filteredClients = clients.filter((c) => {
    const term = searchQuery.toLowerCase();
    const matchesProfile = c.name.toLowerCase().includes(term) || c.rut.toLowerCase().includes(term);
    const matchesPlate = c.vehicles.some(v => v.patent.toLowerCase().includes(term));
    return matchesProfile || matchesPlate;
  });

  // Paginated slices
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateClient = (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('El Nombre Completo o razón social del cliente es obligatorio.');
      return;
    }

    if (!rut.trim()) {
      setRutError('RUT obligatorio.');
      alert('El RUT del cliente es obligatorio.');
      return;
    }

    const isRutValid = validateChileanRut(rut);
    if (!isRutValid) {
      setRutError('RUT inválido (ej: 12.345.678-K).');
      alert('El RUT chileno ingresado no es válido. Por favor verifique el dígito verificador.');
      return;
    }

    if (!phone.trim()) {
      setPhoneError('Teléfono obligatorio.');
      alert('El número de teléfono del cliente es obligatorio.');
      return;
    }

    const isPhoneValid = validateChileanPhone(phone);
    if (!isPhoneValid) {
      setPhoneError('Teléfono inválido. Debe tener 8 o 9 dígitos.');
      alert('El número de de teléfono ingresado no es válido para Chile (debe tener 8 o 9 dígitos).');
      return;
    }

    if (!email.trim()) {
      setEmailError('Correo obligatorio.');
      alert('El correo electrónico del cliente es obligatorio.');
      return;
    }

    const isEmailValid = validateEmailFormat(email);
    if (!isEmailValid) {
      setEmailError('Correo inválido (ej: cliente@taller.cl).');
      alert('El correo electrónico ingresado no tiene un formato válido.');
      return;
    }

    addClient({
      rut: rut.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      type: clientType,
      vehicles: []
    });

    // Reset
    setRut('');
    setName('');
    setPhone('');
    setEmail('');
    setClientType('Particular');
    setRutError('');
    setPhoneError('');
    setEmailError('');
  };

  const handleAddNewVehicle = (e: FormEvent) => {
    e.preventDefault();
    if (!bindingClient) return;

    if (!nPatent.trim()) {
      alert("Por favor, ingrese la patente del vehículo.");
      return;
    }

    const cleanPatent = nPatent.replace(/[\s\.-]/g, '').toUpperCase();
    const isPatentValid = /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2})$/.test(cleanPatent);
    if (!isPatentValid) {
      alert("La patente ingresada no tiene un formato chileno válido esperado. Los formatos válidos constan de 2 letras y 4 números (ej: AB1234) o de 4 letras y 2 números (ej: BBBB11).");
      return;
    }

    if (!nBrand.trim()) {
      alert("Por favor, ingrese la marca del vehículo.");
      return;
    }

    if (!nModel.trim()) {
      alert("Por favor, ingrese el modelo del vehículo.");
      return;
    }

    // Mutate vehicles inside client directly in state (persists in localStorage since state change registers there)
    const newVeh: Vehicle = {
      patent: cleanPatent,
      brand: nBrand.trim(),
      model: nModel.trim(),
      year: Number(nYear) || 2022
    };

    if (!bindingClient.vehicles) {
      bindingClient.vehicles = [];
    }
    
    // Check if plate already registered here
    const exists = bindingClient.vehicles.some(v => v.patent.toLowerCase() === newVeh.patent.toLowerCase());
    if (!exists) {
      bindingClient.vehicles.push(newVeh);
    } else {
      alert(`La patente ${cleanPatent} ya se encuentra registrada para este cliente.`);
      return;
    }

    // Reset add vehicle form
    setNPatent('');
    setNBrand('');
    setNModel('');
    setNYear(new Date().getFullYear());
    setBindingClient(null);
  };

  const downloadReport = () => {
    const txt = clients.map(c => `${c.name}\t${c.rut}\t${c.email}\t${c.vehicles.map(v => v.patent).join(', ')}`).join('\n');
    alert(`Reporte consolidado generado (${clients.length} clientes):\n\n${txt}`);
  };

  return (
    <div id="clients-view" className="space-y-6 font-sans">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight">Registro de Clientes</h2>
        <p className="text-[#434655] text-sm">Gestión centralizada de perfiles y vehículos asociados del taller.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Nuevo Cliente */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#004ac6]" />
            <span>Nuevo Cliente</span>
          </h3>

          <form onSubmit={handleCreateClient} className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">RUT</label>
              <input
                id="form-client-rut"
                type="text"
                placeholder="Ej: 12.345.678-9"
                value={rut}
                onChange={(e) => handleRutChange(e.target.value)}
                onBlur={handleRutBlur}
                className={`w-full text-xs border rounded-lg px-4 py-3 transition-colors ${
                  rutError ? 'border-red-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]'
                }`}
              />
              {rutError && (
                <p id="client-rut-error" className="text-[10px] text-red-500 font-bold mt-1">
                  {rutError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">Nombre Completo</label>
              <input
                id="form-client-name"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs border-slate-200 border rounded-lg px-4 py-3 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">Teléfono</label>
              <input
                id="form-client-phone"
                type="text"
                placeholder="Ej: +56 9 1234 5678"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={handlePhoneBlur}
                className={`w-full text-xs border rounded-lg px-4 py-3 transition-colors ${
                  phoneError ? 'border-red-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]'
                }`}
              />
              {phoneError && (
                <p id="client-phone-error" className="text-[10px] text-red-500 font-bold mt-1">
                  {phoneError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">Correo Electrónico</label>
              <input
                id="form-client-email"
                type="email"
                placeholder="Ej: jperez@ejemplo.cl"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                className={`w-full text-xs border rounded-lg px-4 py-3 transition-colors ${
                  emailError ? 'border-red-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]'
                }`}
              />
              {emailError && (
                <p id="client-email-error" className="text-[10px] text-red-500 font-bold mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">Tipo de Cliente</label>
              <select
                id="form-client-type"
                value={clientType}
                onChange={(e) => setClientType(e.target.value as 'Particular' | 'Empresa')}
                className="w-full text-xs border-slate-200 bg-white border rounded-lg px-4 py-3"
              >
                <option value="Particular">Particular</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>

            {/* Buttons row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRut('');
                  setName('');
                  setPhone('');
                  setEmail('');
                  setClientType('Particular');
                  setRutError('');
                  setPhoneError('');
                  setEmailError('');
                }}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Limpiar
              </button>
              
              <button
                type="submit"
                className="w-full py-3 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold rounded-xl transition-all cursor-pointer text-center shadow-sm"
              >
                Guardar Cliente
              </button>
            </div>
          </form>

          {/* Bottom tip info block */}
          <div className="bg-[#f0f3ff] border border-[#dee8ff] text-[#54647a] p-4 rounded-xl flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed font-semibold">
              <span className="font-bold text-[#111c2d] block mb-0.5">Nota de Registro</span>
              Asegúrese de validar el RUT antes de guardar. Los vehículos pueden ser añadidos una vez que el cliente esté registrado en el sistema.
            </div>
          </div>
        </div>

        {/* Right Column: Listado de Clientes */}
        <div className="lg:col-span-2 bg-white border border-[#dee8ff] rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold">Listado de Clientes y Vehículos</h3>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  id="clients-list-search-input"
                  type="text"
                  placeholder="Buscar por RUT o Patente..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold border-slate-200 border rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:border-[#004ac6] w-48 sm:w-60"
                />
              </div>

              <button
                onClick={downloadReport}
                id="btn-download-clients-excel"
                className="p-2.5 bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] text-[#004ac6] rounded-xl transition-all hover:scale-102"
                title="Descargar Planilla Excel"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl border-[#dee8ff]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#dee8ff]">
                  <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider w-1/3">Cliente</th>
                  <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider w-1/3">RUT / Contacto</th>
                  <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider w-1/3">Vehículos Asociados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedClients.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-[#dee8ff]/15 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900 text-sm">{c.name}</p>
                      <span className="text-[9px] font-black uppercase tracking-wide bg-slate-100 border text-slate-500 px-1.5 py-0.5 rounded mt-1 inline-block">
                        Cliente {c.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 space-y-1 font-semibold">
                      <p className="font-mono text-slate-800">{c.rut}</p>
                      <p className="text-[10px]">{c.phone}</p>
                      <p className="text-[10px] text-[#54647a]">{c.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5 max-w-[240px]">
                        {c.vehicles && c.vehicles.map((v, i) => (
                          <div
                            key={i}
                            className="bg-[#e7eeff] border border-[#dee8ff] text-[#004ac6] px-2 py-1 rounded inline-flex items-center justify-between text-[10px] font-bold"
                          >
                            <span className="truncate">{v.brand} {v.model} ({v.year})</span>
                            <span className="font-mono bg-white text-[#111c2d] px-1 rounded ml-1 border shrink-0">
                              {v.patent}
                            </span>
                          </div>
                        ))}
                        {(!c.vehicles || c.vehicles.length === 0) && (
                          <span className="text-[10px] text-slate-400 italic font-semibold">Sin autos ingresados</span>
                        )}
                        <button
                          onClick={() => setBindingClient(c)}
                          id={`link-auto-btn-${c.id}`}
                          className="text-[#004ac6] hover:text-[#2563eb] hover:underline text-[9px] font-black text-left mt-1 inline-flex items-center space-x-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Asociar Vehículo</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedClients.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold">
                      No hay clientes registrados o coincidentes con los criterios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-xs font-semibold text-[#54647a] rounded-b-xl">
            <span>
              Mostrando {Math.min(startIndex + 1, filteredClients.length)}-{Math.min(startIndex + itemsPerPage, filteredClients.length)} de{' '}
              {filteredClients.length} clientes registrados
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border border-[#dee8ff] bg-white disabled:opacity-50 text-[#111c2d] hover:bg-[#dee8ff]"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded border transition-colors ${
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
                className="px-3 py-1.5 rounded border border-[#dee8ff] bg-white disabled:opacity-50 text-[#111c2d] hover:bg-[#dee8ff]"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Bind new vehicle to selected client */}
      {bindingClient && (
        <div id="add-vehicle-modal-overlay" className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-[#dee8ff] max-w-sm w-full overflow-hidden">
            <div className="bg-[#dee8ff] px-6 py-4 flex items-center justify-between border-b border-[#dee8ff]">
              <div>
                <span className="text-[10px] font-black text-[#54647a] uppercase tracking-wide block">Vincular nuevo auto</span>
                <h3 className="font-extrabold text-[#111c2d]">Cliente: {bindingClient.name}</h3>
              </div>
              <button
                onClick={() => setBindingClient(null)}
                className="p-1 text-[#434655] hover:text-[#ba1a1a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewVehicle} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Patente Vehicular</label>
                <input
                  id="modal-veh-patent"
                  type="text"
                  required
                  placeholder="ABCD-12"
                  value={nPatent}
                  onChange={(e) => setNPatent(e.target.value)}
                  className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Marca</label>
                  <input
                    id="modal-veh-brand"
                    type="text"
                    required
                    placeholder="Ej: Mazda"
                    value={nBrand}
                    onChange={(e) => setNBrand(e.target.value)}
                    className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Modelo</label>
                  <input
                    id="modal-veh-model"
                    type="text"
                    required
                    placeholder="Ej: CX-5"
                    value={nModel}
                    onChange={(e) => setNModel(e.target.value)}
                    className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Año</label>
                <input
                  id="modal-veh-year"
                  type="number"
                  value={nYear}
                  onChange={(e) => setNYear(Number(e.target.value))}
                  className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setBindingClient(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-[#434655] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Vehículo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
