import { useState, useEffect, FormEvent } from 'react';
import { Search, UserPlus, Car, Wrench, Calendar, DollarSign, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Client, User, WorkOrder } from '../types';

interface NewWorkOrderViewProps {
  clients: Client[];
  users: User[];
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => WorkOrder;
  addClient: (client: Omit<Client, 'id'>) => Client;
  setActiveTab: (tab: string) => void;
  setSelectedWorkOrder: (order: WorkOrder | null) => void;
}

export default function NewWorkOrderView({
  clients,
  users,
  addWorkOrder,
  addClient,
  setActiveTab,
  setSelectedWorkOrder
}: NewWorkOrderViewProps) {
  // Option: select an existing client or write new
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Client fields
  const [clientRut, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientType, setClientType] = useState<'Particular' | 'Empresa'>('Particular');

  // New Client toggle switch states
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);

  // Vehicle info
  const [patent, setPatent] = useState('');
  const [brand, setBrand] = useState('');
  const [vModel, setVModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Suggested vehicle values if existing client was selected
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);

  // Diagnosis, Assignment, and Planning info
  const [diagnosis, setDiagnosis] = useState('');
  const [requestedServices, setRequestedServices] = useState('');
  const [techId, setTechId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [budget, setBudget] = useState<number>(0);

  // Success / error states
  const [errorMess, setErrorMess] = useState('');
  const [successMess, setSuccessMess] = useState('');

  // filter mechanically active workers
  const mechanics = users.filter((u) => u.role === 'Mecánico' && u.active);

  // Handle clients autocomplete search
  const filteredClients = clients.filter((c) =>
    c.rut.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  // Autosave client details if an existing client is picked
  const handleSelectClient = (c: Client) => {
    setSelectedClient(c);
    setClientSearchQuery(`${c.rut} - ${c.name}`);
    setClientRut(c.rut);
    setClientName(c.name);
    setClientPhone(c.phone);
    setClientEmail(c.email);
    setExistingVehicles(c.vehicles || []);
    setIsCreatingNewClient(false);
    setShowClientDropdown(false);
  };

  // If selecting one of the client's existing vehicles
  const handleSelectExistingVehicle = (v: any) => {
    setPatent(v.patent);
    setBrand(v.brand);
    setVModel(v.model);
    setYear(v.year);
  };

  // Reset form helper
  const handleReset = () => {
    setSelectedClient(null);
    setClientSearchQuery('');
    setClientRut('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setPatent('');
    setBrand('');
    setVModel('');
    setYear(new Date().getFullYear());
    setDiagnosis('');
    setRequestedServices('');
    setTechId('');
    setDeliveryDate('');
    setBudget(0);
    setErrorMess('');
    setSuccessMess('');
    setIsCreatingNewClient(false);
    setExistingVehicles([]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMess('');
    setSuccessMess('');

    if (!clientRut.trim()) {
      setErrorMess('Falta ingresar el RUT del cliente o empresa.');
      alert('Por favor, ingrese el RUT del cliente.');
      return;
    }

    if (!clientName.trim()) {
      setErrorMess('Falta ingresar el nombre del cliente.');
      alert('Por favor, ingrese el nombre del cliente o razón social.');
      return;
    }

    if (!patent.trim()) {
      setErrorMess('Falta ingresar la patente del vehículo.');
      alert('Por favor, ingrese la patente del vehículo.');
      return;
    }

    const cleanPatent = patent.replace(/[\s\.-]/g, '').toUpperCase();
    const isPatentValid = /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2})$/.test(cleanPatent);
    if (!isPatentValid) {
      setErrorMess('La patente ingresada no es válida. Formatos esperados: AB1234 o BBBB11.');
      alert('La patente ingresada no tiene un formato chileno válido esperado. Los formatos válidos constan de 2 letras y 4 números (ej: AB1234) o de 4 letras y 2 números (ej: BBBB11). No incluya espacios, puntos ni guiones.');
      return;
    }

    if (!brand.trim()) {
      setErrorMess('Falta ingresar la marca del vehículo.');
      alert('Por favor, ingrese la marca del vehículo.');
      return;
    }

    if (!vModel.trim()) {
      setErrorMess('Falta ingresar el modelo del vehículo.');
      alert('Por favor, ingrese el modelo del vehículo.');
      return;
    }

    if (!techId) {
      setErrorMess('Debe asignar obligatoriamente un técnico mecánico para este servicio.');
      alert('Por favor, asigne un técnico mecánico para este servicio.');
      return;
    }

    if (!deliveryDate) {
      setErrorMess('Indique la fecha estimada de entrega para el vehículo.');
      alert('Por favor, indique la fecha estimada de entrega para el vehículo.');
      return;
    }

    let finalClientRut = clientRut.trim();
    let finalClientName = clientName.trim();

    // If client does not exist and user ticked creating client, create it
    const clientExists = clients.some(c => c.rut.toLowerCase() === finalClientRut.toLowerCase());
    if (!clientExists && isCreatingNewClient) {
      addClient({
        rut: finalClientRut,
        name: finalClientName,
        phone: clientPhone || '+56 9 1234 5678',
        email: clientEmail || 'test@ejemplo.cl',
        type: clientType,
        vehicles: [{ patent: cleanPatent, brand: brand.trim(), model: vModel.trim(), year }]
      });
    }

    const assignedTechObj = users.find(u => u.id === techId);
    const assignedTechName = assignedTechObj ? assignedTechObj.name : 'Mecánico General';

    // Submit Work Order
    const newOT = addWorkOrder({
      clientRut: finalClientRut,
      clientName: finalClientName,
      clientPhone: clientPhone || '+56 9 1234 5678',
      vehiclePatent: cleanPatent,
      vehicleBrand: brand.trim(),
      vehicleModel: vModel.trim(),
      vehicleYear: Number(year) || 2022,
      initialDiagnosis: diagnosis.trim(),
      requestedServices: requestedServices.trim(),
      assignedTechnicianId: techId,
      assignedTechnicianName: assignedTechName,
      estimatedDeliveryDate: deliveryDate,
      estimatedBudget: Number(budget) || 0,
      status: 'PENDIENTE'
    });

    setSuccessMess(`¡Orden de Trabajo creada exitosamente bajo el folio #${newOT.id}! Redireccionando...`);
    
    // Switch to OTs panel and select new order after 1.5 seconds delay
    setTimeout(() => {
      setSelectedWorkOrder(newOT);
      setActiveTab('ot');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} id="new-ot-form" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight">Ingresar Vehículo</h2>
          <p className="text-[#434655] text-sm">Registre el ingreso de un móvil y configure su ficha original.</p>
        </div>
        
        <button
          type="button"
          onClick={() => setIsCreatingNewClient(prev => !prev)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            isCreatingNewClient
              ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
              : 'bg-[#dee8ff] text-[#004ac6] border border-[#b4c5ff] hover:bg-[#e7eeff]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isCreatingNewClient ? 'Cancelar Crear Cliente' : 'Registrar Nuevo Cliente'}</span>
        </button>
      </div>

      {/* Warning & Success flags */}
      {errorMess && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#ba1a1a] p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMess}</span>
        </div>
      )}

      {successMess && (
        <div className="bg-[#e6fcf5] border border-[#10b981] text-[#10b981] p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <span>{successMess}</span>
        </div>
      )}

      {/* Panel 1: Datos del Cliente */}
      <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#004ac6]" />
          <span>Datos del Cliente</span>
        </h3>

        {!isCreatingNewClient ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Search client input */}
            <div className="relative space-y-1">
              <label className="text-xs font-bold text-[#54647a]">Buscar por RUT o Nombre</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  id="client-search-field"
                  type="text"
                  placeholder="Escriba RUT o Nombre (Ej. Carlos Rodríguez)"
                  value={clientSearchQuery}
                  onFocus={() => setShowClientDropdown(true)}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  className="w-full text-sm border-slate-200 border rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              {/* Suggestions floating list */}
              {showClientDropdown && clientSearchQuery && (
                <div className="absolute z-30 left-0 right-0 max-h-48 overflow-y-auto bg-white border border-[#dee8ff] rounded-lg mt-1 shadow-lg divide-y divide-slate-100">
                  {filteredClients.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectClient(c)}
                      className="p-3 text-xs font-semibold text-slate-700 hover:bg-[#e7eeff] cursor-pointer flex justify-between items-center"
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-50 border px-1.5 py-0.5 rounded">
                        {c.rut}
                      </span>
                    </div>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="p-3 text-xs text-slate-400 font-medium text-center">
                      No se encontraron clientes coincidentes.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected phone readout */}
            <div className="space-y-1 text-xs">
              <label className="text-xs font-bold text-[#54647a]">Teléfono de Contacto</label>
              <input
                id="client-phone-readout"
                type="text"
                disabled
                placeholder="+56 9 1234 5678"
                value={clientPhone}
                className="w-full text-sm border-slate-200 border bg-slate-50/75 rounded-lg px-4 py-3 text-slate-600 font-semibold"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Create new fields */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">RUT del Cliente</label>
              <input
                id="new-client-rut"
                type="text"
                placeholder="11.222.333-4"
                value={clientRut}
                onChange={(e) => setClientRut(e.target.value)}
                className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
              />
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-[#54647a]">Nombre Completo</label>
              <input
                id="new-client-name"
                type="text"
                placeholder="Nombre o Razón Social"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#54647a]">Teléfono</label>
              <input
                id="new-client-phone"
                type="text"
                placeholder="+56 9 ..."
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
              />
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-[#54647a]">Correo Electrónico</label>
              <input
                id="new-client-email"
                type="email"
                placeholder="correo@ejemplo.cl"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
              />
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-[#54647a]">Tipo de Cliente</label>
              <select
                id="new-client-type"
                value={clientType}
                onChange={(e) => setClientType(e.target.value as 'Particular' | 'Empresa')}
                className="w-full text-sm border-slate-200 bg-white border rounded-lg px-4 py-3"
              >
                <option value="Particular">Particular</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Suggested existing vehicles list (optional) */}
      {existingVehicles.length > 0 && !isCreatingNewClient && (
        <div className="bg-slate-50 border border-[#dee8ff] p-4 rounded-xl flex flex-col gap-2">
          <span className="text-xs font-bold text-[#54647a]">Vehículos vinculados:</span>
          <div className="flex flex-wrap gap-2.5">
            {existingVehicles.map((v, i) => (
              <button
                key={i}
                type="button"
                id={`linked-veh-idx-${i}`}
                onClick={() => handleSelectExistingVehicle(v)}
                className="bg-white border rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#dee8ff] hover:text-[#004ac6] transition-colors flex items-center space-x-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>{v.brand} {v.model} ({v.patent})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panel 2: Información del Vehículo */}
      <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
          <Car className="w-4 h-4 text-[#004ac6]" />
          <span>Información del Vehículo</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Patente</label>
            <input
              id="vehicle-patent"
              type="text"
              placeholder="ABCD-12"
              value={patent}
              onChange={(e) => setPatent(e.target.value)}
              className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3 uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Marca</label>
            <input
              id="vehicle-brand"
              type="text"
              placeholder="Ej: Toyota"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Modelo</label>
            <input
              id="vehicle-model"
              type="text"
              placeholder="Ej: Hilux"
              value={vModel}
              onChange={(e) => setVModel(e.target.value)}
              className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Año</label>
            <input
              id="vehicle-year"
              type="number"
              placeholder="Año"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full text-sm border-slate-200 border rounded-lg px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Diagnóstico & Servicios en columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 3: Diagnóstico Inicial */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#004ac6]" />
            <span>Diagnóstico Inicial</span>
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Detalle de fallas o ruidos reportados</label>
            <textarea
              id="diag-input"
              rows={4}
              placeholder="Describa el estado inicial del vehículo..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full text-sm border-slate-200 border rounded-lg p-4 focus:outline-none focus:border-[#004ac6] min-h-[140px]"
            ></textarea>
          </div>
        </div>

        {/* Panel 4: Servicios Solicitados */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#004ac6]" />
            <span>Servicios Solicitados</span>
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Trabajos específicos a realizar</label>
            <textarea
              id="requested-services-input"
              rows={4}
              placeholder="Ej: Cambio de aceite, revisión de frenos, alineación..."
              value={requestedServices}
              onChange={(e) => setRequestedServices(e.target.value)}
              className="w-full text-sm border-slate-200 border rounded-lg p-4 focus:outline-none focus:border-[#004ac6] min-h-[140px]"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Panel 5: Asignación y Planificación */}
      <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#004ac6]" />
          <span>Asignación y Planificación</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Técnico Asignado (Obligatorio)</label>
            <select
              id="assigned-tech-select"
              value={techId}
              onChange={(e) => setTechId(e.target.value)}
              className="w-full text-sm border-slate-200 bg-white border rounded-lg px-4 py-3"
            >
              <option value="">Seleccionar Técnico...</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Fecha Entrega Estimada</label>
            <input
              id="estimated-delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full text-sm border-slate-200 bg-white border rounded-lg px-4 py-3"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Presupuesto Estimado (Repuestos)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686]" />
              <input
                id="estimated-budget-field"
                type="number"
                placeholder="0"
                value={budget || ''}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full text-sm border-slate-200 border rounded-lg pl-10 pr-4 py-3 text-right font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons row */}
      <div className="flex justify-end items-center space-x-4">
        <button
          type="button"
          onClick={handleReset}
          className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-3.5 px-6 border border-slate-200 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer justify-center"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpiar Formulario</span>
        </button>

        <button
          type="submit"
          className="bg-[#004ac6] hover:bg-[#2563eb] text-white text-sm font-bold py-3.5 px-6 rounded-xl flex items-center space-x-2 shadow-md transition-all cursor-pointer justify-center"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Orden de Trabajo</span>
        </button>
      </div>
    </form>
  );
}
