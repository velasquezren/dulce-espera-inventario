'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  RequestItem,
  ReceptionItem,
  MovementLog,
  NotificationItem,
  INITIAL_PRODUCTS,
  INITIAL_REQUESTS,
  INITIAL_RECEPTIONS,
  INITIAL_HISTORY,
  INITIAL_NOTIFICATIONS
} from '../lib/mockData';

export type AppModule = 
  | 'login' 
  | 'dashboard' 
  | 'inventory' 
  | 'requests' 
  | 'receptions' 
  | 'history' 
  | 'profile' 
  | 'detail' 
  | 'request-form'
  | 'manage-products';

interface User {
  name: string;
  username: string;
  role: string;
  token: string;
}

interface AppContextType {
  user: User | null;
  activeModule: AppModule;
  selectedProductId: string | null;
  isOnline: boolean;
  isLoading: boolean;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  products: Product[];
  requests: RequestItem[];
  receptions: ReceptionItem[];
  history: MovementLog[];
  notifications: NotificationItem[];
  
  draftItems: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  addDraftItem: (productId: string, quantity: number, notes?: string) => void;
  updateDraftItem: (id: string, quantity: number, notes?: string) => void;
  removeDraftItem: (id: string) => void;
  sendDraftList: (reason?: string) => Promise<void>;
  sendSingleItem: (productId: string, quantity: number, notes?: string) => Promise<void>;
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addProduct: (name: string, category: string, unit: string) => void;
  deleteProduct: (productId: string) => void;
  updateProductCategory: (productId: string, category: string) => void;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setModule: (module: AppModule) => void;
  viewProductDetails: (productId: string) => void;
  createRequest: (productId: string, quantity: number, notes?: string) => void;
  confirmReception: (receptionId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  exportToPDF: (data: any[], title: string) => void;
  exportToExcel: (data: any[], title: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<AppModule>('login');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [receptions, setReceptions] = useState<ReceptionItem[]>([]);
  const [history, setHistory] = useState<MovementLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [draftItems, setDraftItems] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>>([]);

  const [categories, setCategories] = useState<string[]>([]);

  // Synchronize browser online/offline status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Load database from localStorage or seed it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('montalvo_user');
        const storedModule = localStorage.getItem('montalvo_module') as AppModule | null;

        if (storedUser && storedUser !== 'undefined') {
          try {
            setUser(JSON.parse(storedUser));
            setActiveModule(storedModule && storedModule !== 'login' ? storedModule : 'dashboard');
          } catch (e) {
            localStorage.removeItem('montalvo_user');
            setActiveModule('login');
          }
        } else {
          setActiveModule('login');
        }

        const parseOrFallback = (key: string, fallback: any) => {
          try {
            const item = localStorage.getItem(key);
            if (!item || item === 'undefined') return fallback;
            return JSON.parse(item);
          } catch (e) {
            localStorage.removeItem(key);
            return fallback;
          }
        };

        const loadedProducts = parseOrFallback('montalvo_products', INITIAL_PRODUCTS);
        const loadedRequests = parseOrFallback('montalvo_requests', INITIAL_REQUESTS);
        const loadedReceptions = parseOrFallback('montalvo_receptions', INITIAL_RECEPTIONS);
        const loadedHistory = parseOrFallback('montalvo_history', INITIAL_HISTORY);
        const loadedNotifications = parseOrFallback('montalvo_notifications', INITIAL_NOTIFICATIONS);
        const loadedDrafts = parseOrFallback('montalvo_drafts', []);
        const DEFAULT_CATEGORIES = ['Lácteos', 'Carnes y Proteínas', 'Granos y Cereales', 'Nutrición Clínica', 'Abarrotes', 'Verduras', 'Otros'];
        const loadedCategories = parseOrFallback('montalvo_categories', DEFAULT_CATEGORIES);

        setProducts(loadedProducts);
        setRequests(loadedRequests);
        setReceptions(loadedReceptions);
        setHistory(loadedHistory);
        setNotifications(loadedNotifications);
        setDraftItems(loadedDrafts);
        setCategories(loadedCategories);

        if (!localStorage.getItem('montalvo_categories')) localStorage.setItem('montalvo_categories', JSON.stringify(DEFAULT_CATEGORIES));

        // Seed initial local storage if not set
        if (!localStorage.getItem('montalvo_products')) localStorage.setItem('montalvo_products', JSON.stringify(INITIAL_PRODUCTS));
        if (!localStorage.getItem('montalvo_requests')) localStorage.setItem('montalvo_requests', JSON.stringify(INITIAL_REQUESTS));
        if (!localStorage.getItem('montalvo_receptions')) localStorage.setItem('montalvo_receptions', JSON.stringify(INITIAL_RECEPTIONS));
        if (!localStorage.getItem('montalvo_history')) localStorage.setItem('montalvo_history', JSON.stringify(INITIAL_HISTORY));
        if (!localStorage.getItem('montalvo_notifications')) localStorage.setItem('montalvo_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      } catch (globalError) {
        console.error('Error al inicializar la base de datos local:', globalError);
        // Fallback to initial values
        setActiveModule('login');
        setProducts(INITIAL_PRODUCTS);
        setRequests(INITIAL_REQUESTS);
        setReceptions(INITIAL_RECEPTIONS);
        setHistory(INITIAL_HISTORY);
        setNotifications(INITIAL_NOTIFICATIONS);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Helper to persist state updates
  const saveState = (key: string, data: any) => {
    if (typeof window !== 'undefined') {

      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const saveDrafts = (drafts: any) => {
    setDraftItems(drafts);
    saveState('montalvo_drafts', drafts);
  };

  const addDraftItem = (productId: string, quantity: number, notes?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existingIndex = draftItems.findIndex((item) => item.productId === productId);
    if (existingIndex > -1) {
      const updated = [...draftItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
        notes: notes || updated[existingIndex].notes || ''
      };
      saveDrafts(updated);
    } else {
      const newItem = {
        id: `draft-${Date.now()}-${Math.random().toString().slice(-3)}`,
        productId,
        productName: product.name,
        quantity,
        unit: product.unit,
        notes: notes || ''
      };
      saveDrafts([...draftItems, newItem]);
    }
  };

  const updateDraftItem = (id: string, quantity: number, notes?: string) => {
    const updated = draftItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
          notes: notes !== undefined ? notes : item.notes
        };
      }
      return item;
    });
    saveDrafts(updated);
  };

  const removeDraftItem = (id: string) => {
    const updated = draftItems.filter((item) => item.id !== id);
    saveDrafts(updated);
  };

  const sendDraftList = async (reason?: string) => {
    if (draftItems.length === 0 || !user) return;
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newRequest: RequestItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pendiente',
      user: user.name,
      reason: reason || '',
      items: draftItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes
      }))
    };
    setRequests((prev) => {
      const updated = [newRequest, ...prev];
      saveState('montalvo_requests', updated);
      return updated;
    });
    const newLogs: MovementLog[] = draftItems.map((item, idx) => ({
      id: `log-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      date: newRequest.date,
      productId: item.productId,
      productName: item.productName,
      type: 'Solicitud',
      quantity: item.quantity,
      unit: item.unit,
      user: user.name,
      status: 'Solicitado en cocina'
    }));
    setHistory((prev) => {
      const updated = [...newLogs, ...prev];
      saveState('montalvo_history', updated);
      return updated;
    });
    saveDrafts([]);
    setActiveModule('requests');
    saveState('montalvo_module', 'requests');
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveState('montalvo_categories', updated);
  };

  const removeCategory = (category: string) => {
    const updated = categories.filter((c) => c !== category);
    setCategories(updated);
    saveState('montalvo_categories', updated);

    // Also update products in that category to 'Otros'
    setProducts((prev) => {
      const updatedProds = prev.map((p) => {
        if (p.category === category) {
          return { ...p, category: 'Otros' };
        }
        return p;
      });
      saveState('montalvo_products', updatedProds);
      return updatedProds;
    });
  };

  const addProduct = (name: string, category: string, unit: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: trimmedName,
      category: category || 'Otros',
      unit: unit || 'Unidades',
      stock: 0,
      minStock: 0,
      description: 'Producto registrado por cocina.',
      avgConsumption: '0/mes',
      lastDelivery: '-'
    };
    setProducts((prev) => {
      const updated = [...prev, newProduct];
      saveState('montalvo_products', updated);
      return updated;
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveState('montalvo_products', updated);
      return updated;
    });
    // Also remove from draft items if present
    setDraftItems((prev) => {
      const updated = prev.filter((d) => d.productId !== productId);
      saveState('montalvo_drafts', updated);
      return updated;
    });
  };

  const updateProductCategory = (productId: string, category: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          return { ...p, category };
        }
        return p;
      });
      saveState('montalvo_products', updated);
      return updated;
    });
  };

  const sendSingleItem = async (productId: string, quantity: number, notes?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !user) return;
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newRequest: RequestItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pendiente',
      user: user.name,
      items: [
        {
          productId,
          productName: product.name,
          quantity,
          unit: product.unit,
          notes: notes || ''
        }
      ]
    };

    setRequests((prev) => {
      const updated = [newRequest, ...prev];
      saveState('montalvo_requests', updated);
      return updated;
    });

    const newLog: MovementLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: newRequest.date,
      productId,
      productName: product.name,
      type: 'Solicitud',
      quantity,
      unit: product.unit,
      user: user.name,
      status: 'Solicitado en cocina'
    };

    setHistory((prev) => {
      const updated = [newLog, ...prev];
      saveState('montalvo_history', updated);
      return updated;
    });

    setActiveModule('requests');
    saveState('montalvo_module', 'requests');
  };

  // JWT Mock Authentication
  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulating API call latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Accepted demo credentials: any password for matching demo users, or 'admin' / '123'
    if (username.trim() && password.trim()) {
      let displayName = 'Personal Clínico';
      let role = 'Auxiliar de Cocina';

      if (username.toLowerCase().includes('chef') || username.toLowerCase() === 'teresa') {
        displayName = 'Chef Teresa Ortiz';
        role = 'Jefe de Cocina';
      } else if (username.toLowerCase().includes('nutri') || username.toLowerCase() === 'mariana') {
        displayName = 'Nutrióloga Mariana Ríos';
        role = 'Coordinadora de Nutrición';
      } else if (username.toLowerCase() === 'admin') {
        displayName = 'Administrador Clínica';
        role = 'Administrador de Cocina';
      }

      const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockUserTokenFor-${username}`;
      const newUser = {
        name: displayName,
        username,
        role,
        token: mockJwtToken
      };

      setUser(newUser);
      saveState('montalvo_user', newUser);
      saveState('montalvo_module', 'dashboard');
      setActiveModule('dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('montalvo_user');
      localStorage.removeItem('montalvo_module');
    }
    setActiveModule('login');
  };

  const setModule = (module: AppModule) => {
    setActiveModule(module);
    saveState('montalvo_module', module);
    setMobileSidebarOpen(false);
  };

  const viewProductDetails = (productId: string) => {
    setSelectedProductId(productId);
    setActiveModule('detail');
    saveState('montalvo_module', 'detail');
    setMobileSidebarOpen(false);
  };

  // Create Kitchen request
  const createRequest = (productId: string, quantity: number, notes?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !user) return;

    const newRequest: RequestItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pendiente',
      user: user.name,
      items: [
        {
          productId,
          productName: product.name,
          quantity,
          unit: product.unit,
          notes: notes || ''
        }
      ]
    };

    setRequests((prev) => {
      const updated = [newRequest, ...prev];
      saveState('montalvo_requests', updated);
      return updated;
    });

    // Register movement log
    const newLog: MovementLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: newRequest.date,
      productId,
      productName: product.name,
      type: 'Solicitud',
      quantity,
      unit: product.unit,
      user: user.name,
      status: 'Solicitado en cocina'
    };

    setHistory((prev) => {
      const updated = [newLog, ...prev];
      saveState('montalvo_history', updated);
      return updated;
    });

    // Navigate back to my requests list
    setActiveModule('requests');
    saveState('montalvo_module', 'requests');
  };

  // Confirm Supplier Order Reception
  const confirmReception = async (receptionId: string) => {
    // Simulate delay for modern clinical software feel (skeletons/toasts)
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!user) return;

    setReceptions((prevReceptions) => {
      const receptionIndex = prevReceptions.findIndex((r) => r.id === receptionId);
      if (receptionIndex === -1) return prevReceptions;

      const reception = prevReceptions[receptionIndex];
      
      const updatedReceptions = [...prevReceptions];
      updatedReceptions[receptionIndex] = {
        ...reception,
        status: 'Recibido',
        receivedBy: user.name,
        receivedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      saveState('montalvo_receptions', updatedReceptions);

      // Perform child updates within the atomic update frame
      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((prod) => {
          if (prod.id === reception.productId) {
            const newStock = prod.stock + reception.quantity;
            return {
              ...prod,
              stock: newStock,
              lastDelivery: new Date().toISOString().slice(0, 10)
            };
          }
          return prod;
        });
        saveState('montalvo_products', updatedProducts);
        return updatedProducts;
      });

      const newLog: MovementLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        productId: reception.productId,
        productName: reception.productName,
        type: 'Recepción',
        quantity: reception.quantity,
        unit: reception.unit,
        user: user.name,
        status: `Recepción de ${reception.supplier}`
      };

      setHistory((prevHistory) => {
        const updatedHistory = [newLog, ...prevHistory];
        saveState('montalvo_history', updatedHistory);
        return updatedHistory;
      });

      const newNotif: NotificationItem = {
        id: `not-${Date.now()}`,
        type: 'delivered',
        title: 'Pedido Recibido',
        message: `Se confirmaron ${reception.quantity} ${reception.unit} de ${reception.productName} por ${user.name}.`,
        date: 'Justo ahora',
        read: false
      };

      setNotifications((prevNotifs) => {
        const updatedNotifs = [newNotif, ...prevNotifs];
        saveState('montalvo_notifications', updatedNotifs);
        return updatedNotifs;
      });

      return updatedReceptions;
    });
  };

  const markNotificationRead = (notificationId: string) => {
    const updatedNotifs = notifications.map((n) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifs);
    saveState('montalvo_notifications', updatedNotifs);
  };

  const clearNotifications = () => {
    const updatedNotifs = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updatedNotifs);
    saveState('montalvo_notifications', updatedNotifs);
  };

  // Mock Export Functions for Hospital Administration
  const exportToPDF = (data: any[], title: string) => {
    // Generate beautiful clean tabular content inside a printable popup window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = data.map((item) => {
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-size: 13px; color: #0f172a;">${item.date || item.lastDelivery || '-'}</td>
          <td style="padding: 10px; font-size: 13px; font-weight: 500; color: #0f172a;">${item.productName || item.name || '-'}</td>
          <td style="padding: 10px; font-size: 13px; color: #0f172a;">${item.type || item.category || '-'}</td>
          <td style="padding: 10px; font-size: 13px; font-weight: 600; color: #0f172a;">${item.quantity || item.stock || '-'} ${item.unit || '-'}</td>
          <td style="padding: 10px; font-size: 13px; color: #64748b;">${item.user || item.supplier || 'N/A'}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #006156; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 22px; font-weight: 700; color: #006156; margin: 0; }
            .meta { font-size: 12px; color: #64748b; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background-color: #f8fafc; padding: 12px 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #006156; border-bottom: 2px solid #e2e8f0; }
            .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">CLÍNICA MONTALVO</h1>
              <div style="font-size: 13px; color: #39ADA3; font-weight: 600; margin-top: 4px;">Inventario e Insumos de Cocina</div>
            </div>
            <div class="meta">
              <div>Documento Oficial Generado</div>
              <div>Fecha: ${new Date().toLocaleDateString()}</div>
              <div>Usuario: ${user?.name || 'Administrador'}</div>
            </div>
          </div>
          <h2 style="font-size: 16px; margin-bottom: 15px; font-weight: 600; color: #334155;">Reporte: ${title}</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha/Entrega</th>
                <th>Producto</th>
                <th>Tipo/Categoría</th>
                <th>Cantidad/Stock</th>
                <th>Responsable/Origen</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            © ${new Date().getFullYear()} Clínica Montalvo. Todos los derechos reservados. Confidencialidad de Nutrición y Cocina.
          </div>
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing dialogue finishes
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToExcel = (data: any[], title: string) => {
    // Elegant CSV formatted download mimicking Excel
    const headers = ['Fecha/Entrega', 'Producto', 'Tipo/Categoria', 'Cantidad', 'Unidad', 'Responsable/Detalle'];
    const rows = data.map((item) => [
      item.date || item.lastDelivery || '',
      item.productName || item.name || '',
      item.type || item.category || '',
      item.quantity || item.stock || '',
      item.unit || '',
      item.user || item.supplier || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeModule,
        selectedProductId,
        isOnline,
        isLoading,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        products,
        requests,
        receptions,
        history,
        notifications,
        draftItems,
        addDraftItem,
        updateDraftItem,
        removeDraftItem,
        sendDraftList,
        sendSingleItem,
        categories,
        addCategory,
        removeCategory,
        addProduct,
        deleteProduct,
        updateProductCategory,
        login,
        logout,
        setModule,
        viewProductDetails,
        createRequest,
        confirmReception,
        markNotificationRead,
        clearNotifications,
        exportToPDF,
        exportToExcel
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
