import { useState, useEffect } from 'react';
import { User, Client, WorkOrder, InventoryItem, Invoice, ActivityLog, OTStatus } from '../types';
import {
  PRESET_USERS,
  PRESET_CLIENTS,
  PRESET_WORK_ORDERS,
  PRESET_INVENTORY,
  PRESET_INVOICES,
  PRESET_ACTIVITY_LOGS
} from '../data/presets';

export function useWorkshopState() {
  const [users, setUsers] = useState<User[]>(() => {
    const data = localStorage.getItem('phtm_users');
    return data ? JSON.parse(data) : PRESET_USERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const data = localStorage.getItem('phtm_clients');
    return data ? JSON.parse(data) : PRESET_CLIENTS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const data = localStorage.getItem('phtm_work_orders');
    return data ? JSON.parse(data) : PRESET_WORK_ORDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const data = localStorage.getItem('phtm_inventory');
    return data ? JSON.parse(data) : PRESET_INVENTORY;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const data = localStorage.getItem('phtm_invoices');
    return data ? JSON.parse(data) : PRESET_INVOICES;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const data = localStorage.getItem('phtm_logs');
    return data ? JSON.parse(data) : PRESET_ACTIVITY_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const data = localStorage.getItem('phtm_current_user');
    return data ? JSON.parse(data) : PRESET_USERS[0]; // Default logged-in Juan Pérez
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem('phtm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('phtm_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('phtm_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('phtm_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('phtm_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('phtm_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('phtm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('phtm_current_user');
    }
  }, [currentUser]);

  // Auth Operations
  const login = (rut: string): User | null => {
    const strippedRut = rut.trim().toLowerCase();
    const foundUser = users.find(u => u.rut.toLowerCase() === strippedRut && u.active);
    if (foundUser) {
      setCurrentUser(foundUser);
      addLog(`Inició sesión el usuario: ${foundUser.name} (${foundUser.role})`, false, foundUser.name);
      return foundUser;
    }
    return null;
  };

  const logout = () => {
    if (currentUser) {
      addLog(`Cerró sesión el usuario: ${currentUser.name}`, false, currentUser.name);
    }
    setCurrentUser(null);
  };

  // Log creation helper
  const addLog = (action: string, isOnlyGerente: boolean = false, customUsername?: string) => {
    const operator = customUsername || currentUser?.name || 'Sistema';
    const now = new Date();
    // format to simple DD/MM/YYYY
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const dateFormatted = `${d}/${m}/${y}`;
    
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = `${h}:${min}`;

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user: operator,
      action,
      timestamp: dateFormatted,
      timeOnly: timeFormatted,
      isOnlyGerente
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // OT (Work Order) Operations
  const addWorkOrder = (orderData: Omit<WorkOrder, 'id' | 'createdAt'>): WorkOrder => {
    const totalCount = workOrders.length + 1;
    const year = new Date().getFullYear();
    const id = `OT-${year}-${String(totalCount).padStart(3, '0')}`;
    
    const newOrder: WorkOrder = {
      ...orderData,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setWorkOrders(prev => [newOrder, ...prev]);
    
    // Auto-generate a pending invoice associated with this OT back-office wise
    const invoiceId = `F-${10295 + totalCount}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
      clientRut: orderData.clientRut,
      clientName: orderData.clientName,
      moCost: Math.round(orderData.estimatedBudget * 0.45),
      repCost: Math.round(orderData.estimatedBudget * 0.55),
      total: orderData.estimatedBudget,
      status: 'PENDIENTE'
    };
    
    setInvoices(prev => [newInvoice, ...prev]);

    addLog(`Ingresó vehículo Patente ${orderData.vehiclePatent} (${orderData.vehicleBrand} ${orderData.vehicleModel}) - OT: #${id}`);
    
    // Also bind vehicle to client if not already there
    setClients(prevClients => {
      return prevClients.map(c => {
        if (c.rut.toLowerCase() === orderData.clientRut.toLowerCase()) {
          const vehicleExists = c.vehicles.some(v => v.patent.toLowerCase() === orderData.vehiclePatent.toLowerCase());
          if (!vehicleExists) {
            return {
              ...c,
              vehicles: [
                ...c.vehicles,
                {
                  patent: orderData.vehiclePatent,
                  brand: orderData.vehicleBrand,
                  model: orderData.vehicleModel,
                  year: orderData.vehicleYear
                }
              ]
            };
          }
        }
        return c;
      });
    });

    return newOrder;
  };

  const updateWorkOrderStatus = (id: string, status: OTStatus) => {
    setWorkOrders(prev => prev.map(o => {
      if (o.id === id) {
        addLog(`Modificó estado de OT #${id} a ${status}`);
        
        // If status becomes delivered or completed, maybe handle invoices?
        if (status === 'ENTREGADO') {
          // find invoice and pay it
          setInvoices(prevInvs => prevInvs.map(inv => {
            if (inv.clientRut === o.clientRut && inv.total === o.estimatedBudget) {
              return { ...inv, status: 'PAGADA' };
            }
            return inv;
          }));
        }
        
        return { ...o, status };
      }
      return o;
    }));
  };

  // Client Operations
  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`
    };
    setClients(prev => [...prev, newClient]);
    addLog(`Registró un nuevo cliente: ${clientData.name} (${clientData.type})`);
    return newClient;
  };

  // Inventory Operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'sku'>): InventoryItem => {
    const nextNum = inventory.length + 125;
    const sku = `PHTM-${String(nextNum).padStart(5, '0')}`;
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      sku
    };
    setInventory(prev => [...prev, newItem]);
    addLog(`Agregó nuevo ítem a inventario: ${newItem.name} (SKU: ${sku})`);
    return newItem;
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => {
      if (item.id === updatedItem.id) {
        addLog(`Modificó ítem de inventario: ${updatedItem.name} (${updatedItem.currentStock} UN)`);
        return updatedItem;
      }
      return item;
    }));
  };

  // Invoices & Billing Operations
  const addInvoice = (invoiceData: Omit<Invoice, 'id'>): Invoice => {
    const id = `F-${Math.floor(10000 + Math.random() * 90000)}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id
    };
    setInvoices(prev => [newInvoice, ...prev]);
    addLog(`Registró un nuevo documento tributario: ${id} para ${invoiceData.clientName}`);
    return newInvoice;
  };

  const payInvoice = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        addLog(`Registró pago para documento factura/boleta #${id}`);
        return { ...inv, status: 'PAGADA' };
      }
      return inv;
    }));
  };

  // User Administration
  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    addLog(`Creó nuevo usuario: ${userData.name} (${userData.role})`);
    return newUser;
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextState = !u.active;
        addLog(`${nextState ? 'Modificó estado de usuario: ' + u.name + ' a ACTIVO' : 'Desactivó usuario: ' + u.name}`, u.role === 'Mecánico' || u.role === 'Encargado');
        return { ...u, active: nextState };
      }
      return u;
    }));
  };

  return {
    users,
    clients,
    workOrders,
    inventory,
    invoices,
    logs,
    currentUser,
    login,
    logout,
    addWorkOrder,
    updateWorkOrderStatus,
    addClient,
    addInventoryItem,
    updateInventoryItem,
    addInvoice,
    payInvoice,
    addUser,
    toggleUserStatus,
    addLog
  };
}
