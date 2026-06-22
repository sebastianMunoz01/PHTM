import { User, Client, WorkOrder, InventoryItem, Invoice, ActivityLog } from '../types';

export const PRESET_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Juan Pérez',
    rut: '12.345.678-9',
    role: 'Encargado',
    email: 'j.perez@phtm.cl',
    phone: '+56 9 1234 5678',
    active: true
  },
  {
    id: 'usr-2',
    name: 'Carlos Soto',
    rut: '15.823.441-2',
    role: 'Mecánico',
    email: 'c.soto@phtm.cl',
    phone: '+56 9 8831 2284',
    active: true
  },
  {
    id: 'usr-3',
    name: 'Marta Díaz',
    rut: '18.229.110-k',
    role: 'Recepcionista',
    email: 'm.diaz@phtm.cl',
    phone: '+56 9 7311 9923',
    active: true
  },
  {
    id: 'usr-4',
    name: 'Roberto Ruiz',
    rut: '12.114.550-9',
    role: 'Mecánico',
    email: 'r.ruiz@phtm.cl',
    phone: '+56 9 6612 0021',
    active: true
  },
  {
    id: 'usr-5',
    name: 'Elena Morales',
    rut: '14.992.338-2',
    role: 'Encargado',
    email: 'e.morales@phtm.cl',
    phone: '+56 9 9912 3342',
    active: true
  },
  {
    id: 'usr-6',
    name: 'Miguel Soto',
    rut: '14.552.128-k',
    role: 'Mecánico',
    email: 'm.soto@phtm.cl',
    phone: '+56 9 8544 3321',
    active: true
  },
  {
    id: 'usr-7',
    name: 'Pedro Gómez',
    rut: '12.771.391-4',
    role: 'Mecánico',
    email: 'p.gomez@phtm.cl',
    phone: '+56 9 7544 1123',
    active: true
  },
  {
    id: 'usr-8',
    name: 'Sebastián Valdés',
    rut: '10.334.221-5',
    role: 'Gerente',
    email: 's.valdes@phtm.cl',
    phone: '+56 9 5555 1234',
    active: true
  }
];

export const PRESET_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    rut: '15.987.234-K',
    name: 'Carlos Rodríguez',
    phone: '+56 9 8877 6655',
    email: 'crodriguez@ejemplo.cl',
    type: 'Particular',
    vehicles: [
      { patent: 'GH-TY-44', brand: 'Toyota', model: 'Hilux', year: 2022 },
      { patent: 'KL-TR-12', brand: 'Suzuki', model: 'Swift', year: 2019 }
    ]
  },
  {
    id: 'cli-2',
    rut: '76.453.220-4',
    name: 'Transportes Sol del Sur',
    phone: '+56 9 7122 3344',
    email: 'contacto@soldelsur.cl',
    type: 'Empresa',
    vehicles: [
      { patent: 'PR-ST-88', brand: 'Volvo', model: 'FH16', year: 2023 }
    ]
  },
  {
    id: 'cli-3',
    rut: '12.776.345-2',
    name: 'Marta Valenzuela',
    phone: '+56 9 4433 2211',
    email: 'marta.v@ejemplo.cl',
    type: 'Particular',
    vehicles: [
      { patent: 'ZZ-PP-90', brand: 'Mazda', model: 'CX-5', year: 2021 }
    ]
  },
  {
    id: 'cli-4',
    rut: '11.223.344-5',
    name: 'Carlos Retamal',
    phone: '+56 9 8122 3456',
    email: 'cretamal@mail.cl',
    type: 'Particular',
    vehicles: [
      { patent: 'KJ-LP-88', brand: 'Ford', model: 'F-150', year: 2021 }
    ]
  },
  {
    id: 'cli-5',
    rut: '13.334.455-6',
    name: 'María Ignacia Paz',
    phone: '+56 9 9345 5678',
    email: 'm.paz@mail.cl',
    type: 'Particular',
    vehicles: [
      { patent: 'BC-RT-44', brand: 'Hyundai', model: 'Tucson', year: 2020 }
    ]
  }
];

export const PRESET_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'OT-2024-001',
    clientRut: '11.223.344-5',
    clientName: 'Carlos Retamal',
    clientPhone: '+56 9 8122 3456',
    vehiclePatent: 'KJ-LP-88',
    vehicleBrand: 'Ford',
    vehicleModel: 'F-150',
    vehicleYear: 2021,
    initialDiagnosis: 'Ruido metálico en suspensión delantera derecha y pérdida de potencia intermitente.',
    requestedServices: 'Revisión y ajuste de suspensión delantera, cambio de amortiguador delantero. Escaneo de motor.',
    assignedTechnicianId: 'usr-6', // Miguel Soto
    assignedTechnicianName: 'Miguel Soto',
    estimatedDeliveryDate: '2026-06-25',
    estimatedBudget: 345000,
    status: 'EN REPARACIÓN',
    createdAt: '2026-06-20'
  },
  {
    id: 'OT-2024-002',
    clientRut: '13.334.455-6',
    clientName: 'María Ignacia Paz',
    clientPhone: '+56 9 9345 5678',
    vehiclePatent: 'BC-RT-44',
    vehicleBrand: 'Hyundai',
    vehicleModel: 'Tucson',
    vehicleYear: 2020,
    initialDiagnosis: 'Pedal de freno largo y chirrido agudo al frenar bruscamente.',
    requestedServices: 'Cambio de pastillas de freno delanteras, rectificado de discos de freno.',
    assignedTechnicianId: 'usr-7', // Pedro Gómez
    assignedTechnicianName: 'Pedro Gómez',
    estimatedDeliveryDate: '2026-06-22',
    estimatedBudget: 125000,
    status: 'COMPLETADO',
    createdAt: '2026-06-21'
  },
  {
    id: 'OT-2024-003',
    clientRut: '12.345.678-9',
    clientName: 'Juan Pérez',
    clientPhone: '+56 9 1234 5678',
    vehiclePatent: 'XX-YY-99',
    vehicleBrand: 'Chevrolet',
    vehicleModel: 'Spark',
    vehicleYear: 2018,
    initialDiagnosis: 'Mantención preventiva de kilometraje regular (50.000 KM). Cambio de aceite de motor y filtros.',
    requestedServices: 'Mantención completa, afinamiento, cambio de aceite sintético 5W30, cambio de filtro de aceite y aire.',
    assignedTechnicianId: 'usr-6', // Miguel Soto
    assignedTechnicianName: 'Miguel Soto',
    estimatedDeliveryDate: '2026-06-23',
    estimatedBudget: 95000,
    status: 'PENDIENTE',
    createdAt: '2026-06-21'
  },
  {
    id: 'OT-2024-004',
    clientRut: '15.987.234-K',
    clientName: 'Elena Fuentes',
    clientPhone: '+56 9 8877 6655',
    vehiclePatent: 'TR-56-YH',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Hilux',
    vehicleYear: 2019,
    initialDiagnosis: 'Cambio de aceite de transmisión automática.',
    requestedServices: 'Reemplazo fluido ATF y filtro de caja de cambios.',
    assignedTechnicianId: 'usr-7', // Pedro Gómez
    assignedTechnicianName: 'Pedro Gómez',
    estimatedDeliveryDate: '2026-06-19',
    estimatedBudget: 180000,
    status: 'ENTREGADO',
    createdAt: '2026-06-18'
  },
  {
    id: 'OT-2024-005',
    clientRut: '15.987.234-K',
    clientName: 'Carlos Rodríguez',
    clientPhone: '+56 9 8877 6655',
    vehiclePatent: 'GH-JK-89',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Hilux',
    vehicleYear: 2022,
    initialDiagnosis: 'Instalación de kit de levante y alineación.',
    requestedServices: 'Instalación de espaciadores de espiral y candados traseros + alineación 3D.',
    assignedTechnicianId: 'usr-6', // Miguel Soto
    assignedTechnicianName: 'Miguel Soto',
    estimatedDeliveryDate: '2026-06-24',
    estimatedBudget: 280000,
    status: 'EN REPARACIÓN',
    createdAt: '2026-06-21'
  },
  {
    id: 'OT-2024-006',
    clientRut: '12.776.345-2',
    clientName: 'Ana María Silva',
    clientPhone: '+56 9 4433 2211',
    vehiclePatent: 'LP-ZX-12',
    vehicleBrand: 'Suzuki',
    vehicleModel: 'Swift',
    vehicleYear: 2019,
    initialDiagnosis: 'Luz de check engine encendida en tablero.',
    requestedServices: 'Diagnóstico computarizado, limpieza de cuerpo de aceleración y sensor MAF.',
    assignedTechnicianId: 'usr-7', // Pedro Gómez
    assignedTechnicianName: 'Pedro Gómez',
    estimatedDeliveryDate: '2026-06-22',
    estimatedBudget: 60000,
    status: 'PENDIENTE',
    createdAt: '2026-06-21'
  },
  {
    id: 'OT-2024-007',
    clientRut: '12.114.550-9',
    clientName: 'Roberto Martínez',
    clientPhone: '+56 9 6612 0021',
    vehiclePatent: 'CC-VV-44',
    vehicleBrand: 'Mazda',
    vehicleModel: 'CX-5',
    vehicleYear: 2021,
    initialDiagnosis: 'Revisión técnica regular precompra.',
    requestedServices: 'Inspección certificada de 150 puntos, escaneo general, prueba de compresión de motor.',
    assignedTechnicianId: 'usr-6', // Miguel Soto
    assignedTechnicianName: 'Miguel Soto',
    estimatedDeliveryDate: '2026-06-21',
    estimatedBudget: 85000,
    status: 'COMPLETADO',
    createdAt: '2026-06-20'
  }
];

export const PRESET_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', sku: 'PHTM-00124', name: 'Pastillas de Freno Delanteras Cerámicas', currentStock: 0, minStock: 10, unitPrice: 45990 },
  { id: 'inv-2', sku: 'PHTM-00382', name: 'Filtro de Aceite Sintético', currentStock: 3, minStock: 15, unitPrice: 12500 },
  { id: 'inv-3', sku: 'PHTM-00419', name: 'Amortiguador Trasero Reforzado', currentStock: 45, minStock: 5, unitPrice: 89900 },
  { id: 'inv-4', sku: 'PHTM-00552', name: 'Bujía Iridium Punta Platino', currentStock: 12, minStock: 20, unitPrice: 8200 },
  { id: 'inv-5', sku: 'PHTM-00711', name: 'Líquido Refrigerante 50/50 G12', currentStock: 120, minStock: 10, unitPrice: 15000 },
  { id: 'inv-6', sku: 'PHTM-00812', name: 'Filtro de Aire Motor', currentStock: 18, minStock: 10, unitPrice: 18500 },
  { id: 'inv-7', sku: 'PHTM-00923', name: 'Batería Hankook 55AH', currentStock: 4, minStock: 5, unitPrice: 75000 },
  { id: 'inv-8', sku: 'PHTM-01041', name: 'Kit de Ampolletas Halógenas H7', currentStock: 2, minStock: 8, unitPrice: 9900 }
];

export const PRESET_INVOICES: Invoice[] = [
  { id: 'F-10293', date: '15 Oct, 2023', clientRut: '15.987.234-K', clientName: 'Carlos Rodríguez', moCost: 120000, repCost: 280000, total: 400000, status: 'PAGADA' },
  { id: 'F-10294', date: '16 Oct, 2023', clientRut: '76.453.220-4', clientName: 'Transportes Andes SpA', moCost: 450000, repCost: 890000, total: 1340000, status: 'PENDIENTE' },
  { id: 'B-45012', date: '17 Oct, 2023', clientRut: '12.776.345-2', clientName: 'Marta Valdés', moCost: 450000, repCost: 0, total: 45000, status: 'PAGADA' }, // corrected based on total
  { id: 'F-10295', date: '17 Oct, 2023', clientRut: '99.123.456-7', clientName: 'Inmobiliaria Central', moCost: 220000, repCost: 580000, total: 800000, status: 'PENDIENTE' },
  { id: 'F-10296', date: '21 Jun, 2026', clientRut: '13.334.455-6', clientName: 'María Ignacia Paz', moCost: 45000, repCost: 80000, total: 125000, status: 'PAGADA' }
];

export const PRESET_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    user: 'Juan Pérez',
    action: 'Modificó estado de usuario: Carlos Soto a ACTIVO',
    timestamp: '24/10/2023',
    timeOnly: '14:22',
    isOnlyGerente: true
  },
  {
    id: 'log-2',
    user: 'Juan Pérez',
    action: 'Creó nuevo usuario: Marta Díaz (Recepcionista)',
    timestamp: '24/10/2023',
    timeOnly: '09:15',
    isOnlyGerente: false
  },
  {
    id: 'log-3',
    user: 'Juan Pérez',
    action: 'Desactivó usuario: Roberto Ruiz',
    timestamp: '23/10/2023',
    timeOnly: '18:40',
    isOnlyGerente: true
  },
  {
    id: 'log-4',
    user: 'Marta Díaz',
    action: 'Creó Orden de Trabajo: #OT-2024-003 para Carlos Retamal',
    timestamp: '21/06/2026',
    timeOnly: '15:10',
    isOnlyGerente: false
  },
  {
    id: 'log-5',
    user: 'Juan Pérez',
    action: 'Cargó inventario: Filtro de Aceite Sintético (+10 unidades)',
    timestamp: '21/06/2026',
    timeOnly: '11:45',
    isOnlyGerente: false
  }
];
