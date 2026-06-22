export interface User {
  id: string;
  name: string;
  rut: string;
  role: 'Mecánico' | 'Recepcionista' | 'Encargado' | 'Gerente';
  email: string;
  phone: string;
  avatar?: string;
  active: boolean;
}

export interface Vehicle {
  patent: string; // Patente
  brand: string;
  model: string;
  year: number;
}

export interface Client {
  id: string;
  rut: string;
  name: string;
  phone: string;
  email: string;
  vehicles: Vehicle[];
  type: 'Particular' | 'Empresa';
}

export type OTStatus = 'PENDIENTE' | 'EN REPARACIÓN' | 'COMPLETADO' | 'ENTREGADO';

export interface WorkOrder {
  id: string; // Folio e.g. #OT-2024-001 or #OT-4521
  clientRut: string;
  clientName: string;
  clientPhone: string;
  vehiclePatent: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  initialDiagnosis: string;
  requestedServices: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  estimatedDeliveryDate: string;
  estimatedBudget: number;
  status: OTStatus;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
}

export interface Invoice {
  id: string; // e.g. F-10293
  date: string;
  clientRut: string;
  clientName: string;
  moCost: number; // Mano de Obra
  repCost: number; // Repuestos
  total: number;
  status: 'PAGADA' | 'PENDIENTE';
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  timeOnly: string;
  isOnlyGerente: boolean;
}
