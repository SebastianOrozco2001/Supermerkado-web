
import { Product, User, Store, Category, Order, Coupon, Banner, Notification, SavedPaymentMethod } from '../types';

// Mock data based on the provided JS file
const initialProducts: Product[] = [
    { id: 1, name: 'Aceite de Oliva Extra Virgen', mainCategory: 'abarrotes', category: 'aceites', price: 55.50, originalPrice: 65.50, stock: 25, image: 'https://picsum.photos/seed/aceite/500/500', description: 'Aceite de oliva extra virgen de primera calidad, ideal para ensaladas y cocina.', rating: 4.5, reviewCount: 128, sku: 'ACE-001', barcode: '123456789012', features: ['Extra virgen', 'Primera prensada en frío', 'Botella de vidrio oscuro', '500ml'], tags: ['orgánico', 'premium', 'saludable'] },
    { id: 2, name: 'Arroz Blanco Grano Largo', mainCategory: 'abarrotes', category: 'granos', price: 12.00, stock: 50, image: 'https://picsum.photos/seed/arroz/500/500', description: 'Arroz blanco de grano largo, perfecto para acompañar tus comidas.', rating: 4.2, reviewCount: 89, sku: 'ARR-001', barcode: '123456789013', features: ['Grano largo', 'Bolsa de 1kg', 'No transgénico'], tags: ['básico', 'económico'] },
    { id: 3, name: 'Filete de Res Premium', mainCategory: 'carnes', category: 'res', price: 75.00, stock: 15, image: 'https://picsum.photos/seed/res/500/500', description: 'Filete de res de la más alta calidad, perfecto para asar o freír.', rating: 4.8, reviewCount: 45, sku: 'CAR-001', barcode: '123456789014', features: ['Corte premium', 'Empacado al vacío', 'Aprox. 500g'], tags: ['premium', 'fresco'], isFeatured: true },
    { id: 4, name: 'Pechuga de Pollo Orgánica', mainCategory: 'carnes', category: 'pollo', price: 28.00, stock: 30, image: 'https://picsum.photos/seed/pollo/500/500', description: 'Pechuga de pollo orgánica, criada sin antibióticos ni hormonas.', rating: 4.3, reviewCount: 67, sku: 'POL-001', barcode: '123456789015', features: ['Orgánico', 'Sin antibióticos', 'Empacado al vacío', 'Aprox. 400g'], tags: ['orgánico', 'saludable'] },
    { id: 5, name: 'Chorizo Argentino Artesanal', mainCategory: 'carnes', category: 'embutidos', price: 45.00, originalPrice: 50.00, stock: 20, image: 'https://picsum.photos/seed/chorizo/500/500', description: 'Chorizo argentino artesanal, elaborado con recetas tradicionales.', rating: 4.7, reviewCount: 34, sku: 'EMB-001', barcode: '123456789016', features: ['Artesanal', 'Receta tradicional', 'Paquete de 4 unidades'], tags: ['artesanal', 'premium', 'argentino'] },
    { id: 6, name: 'Salmón Fresco Noruego', mainCategory: 'pescados', category: 'salmón', price: 95.00, stock: 8, image: 'https://picsum.photos/seed/salmon/500/500', description: 'Salmón fresco noruego, perfecto para sashimi o a la parrilla.', rating: 4.9, reviewCount: 23, sku: 'PES-001', barcode: '123456789017', features: ['Fresco', 'Noruego', 'Filete sin piel', 'Aprox. 300g'], tags: ['premium', 'fresco', 'noruego'], isFeatured: true },
    { id: 7, name: 'Queso Gouda Holandés', mainCategory: 'lacteos', category: 'quesos', price: 32.00, stock: 18, image: 'https://picsum.photos/seed/queso/500/500', description: 'Queso Gouda holandés añejado, con sabor suave y textura cremosa.', rating: 4.4, reviewCount: 56, sku: 'QUE-001', barcode: '123456789018', features: ['Holandés', 'Añejado 6 meses', 'Cuña de 250g'], tags: ['importado', 'premium'] },
    { id: 8, name: 'Yogur Griego Natural', mainCategory: 'lacteos', category: 'yogures', price: 8.50, stock: 35, image: 'https://picsum.photos/seed/yogur/500/500', description: 'Yogur griego natural, alto en proteína y bajo en azúcar.', rating: 4.1, reviewCount: 42, sku: 'YOG-001', barcode: '123456789019', features: ['Alto en proteína', 'Bajo en azúcar', 'Pote de 500g'], tags: ['saludable', 'proteína'] },
    { id: 9, name: 'Manzanas Royal Gala', mainCategory: 'frutas', category: 'manzanas', price: 6.00, stock: 60, image: 'https://picsum.photos/seed/manzanas/500/500', description: 'Manzanas Royal Gala frescas, crujientes y dulces.', rating: 4.0, reviewCount: 31, sku: 'FRU-001', barcode: '123456789020', features: ['Variedad Royal Gala', 'Bolsa de 1kg', 'Origen nacional'], tags: ['fresco', 'dulce'] },
    { id: 10, name: 'Aguacates Hass Maduros', mainCategory: 'frutas', category: 'aguacates', price: 18.00, stock: 0, image: 'https://picsum.photos/seed/aguacates/500/500', description: 'Aguacates Hass maduros, listos para consumir.', rating: 4.6, reviewCount: 78, sku: 'FRU-002', barcode: '123456789021', features: ['Variedad Hass', 'Listos para consumir', 'Bolsa de 4 unidades'], tags: ['maduro', 'cremoso'] },
    { id: 11, name: 'Pan Integral Multigrano', mainCategory: 'panaderia', category: 'panes', price: 15.00, stock: 25, image: 'https://picsum.photos/seed/pan/500/500', description: 'Pan integral multigrano, rico en fibra y nutrientes.', rating: 4.3, reviewCount: 29, sku: 'PAN-001', barcode: '123456789022', features: ['Multigrano', 'Alto en fibra', 'Barra de 500g'], tags: ['integral', 'saludable'] },
    { id: 12, name: 'Croissants de Mantequilla', mainCategory: 'panaderia', category: 'pasteles', price: 4.50, stock: 40, image: 'https://picsum.photos/seed/croissant/500/500', description: 'Croissants de mantequilla, hojaldrados y deliciosos.', rating: 4.7, reviewCount: 63, sku: 'PAN-002', barcode: '123456789023', features: ['Mantequilla 100%', 'Hojaldrado', 'Paquete de 4 unidades'], tags: ['mantequilla', 'francés'], isFeatured: true },
    { id: 13, name: 'Vino Tinto Malbec', mainCategory: 'bebidas', category: 'vinos', price: 120.00, stock: 12, image: 'https://picsum.photos/seed/vino/500/500', description: 'Vino tinto Malbec argentino, con notas frutales y taninos suaves.', rating: 4.8, reviewCount: 18, sku: 'VIN-001', barcode: '123456789024', features: ['Malbec', 'Botella 750ml', '13.5% alcohol'], tags: ['argentino', 'premium', 'tinto'] },
    { id: 14, name: 'Café Molido Premium', mainCategory: 'bebidas', category: 'café', price: 45.00, stock: 28, image: 'https://picsum.photos/seed/cafe/500/500', description: 'Café molido premium, mezcla de granos arábicos tostados.', rating: 4.5, reviewCount: 95, sku: 'CAF-001', barcode: '123456789025', features: ['100% arábica', 'Tostado medio', 'Paquete de 500g'], tags: ['premium', 'arábica'] },
    { id: 15, name: 'Agua Mineral Sin Gas', mainCategory: 'bebidas', category: 'aguas', price: 8.00, stock: 100, image: 'https://picsum.photos/seed/agua/500/500', description: 'Agua mineral natural sin gas, en botella de 1.5 litros.', rating: 4.0, reviewCount: 24, sku: 'AGU-001', barcode: '123456789026', features: ['Mineral natural', 'Sin gas', 'Botella 1.5L', '6 unidades'], tags: ['natural', 'hidratante'] }
];
const initialUsers: User[] = [
    { id: '1', name: 'Administrador', email: 'admin@supergo.com', password: 'admin_2025', role: 'admin', phone: '+502 1234-5678', address: '6a Avenida 7-50, Zona 1', loyaltyPoints: 1250, paymentMethods: [{id: 'pm_1', last4: '1234', brand: 'Visa', expiry: '12/25'}] },
    { id: '2', name: 'Juan Perez', email: 'juan@example.com', password: 'password123', role: 'user', phone: '+502 5555-4321', address: 'Calle Falsa 123, Zona 10', loyaltyPoints: 350 },
];
const initialStores: Store[] = [
    { id: 1, name: 'SuperGo Centro', address: '6a Avenida 7-50, Zona 1', phone: '+502 1234-5678', hours: '7:00 - 22:00', lat: '14.6349', lng: '-90.5069' },
    { id: 2, name: 'SuperGo Norte', address: 'Plaza Norte, Local 15', phone: '+502 2345-6789', hours: '8:00 - 21:00', lat: '14.6472', lng: '-90.5357' },
    { id: 3, name: 'SuperGo Sur', address: 'Centro Comercial Sur, Nivel 2', phone: '+502 3456-7890', hours: '7:30 - 21:30', lat: '14.5928', lng: '-90.5485' }
];
const initialCategories: Category[] = [
    { id: 'abarrotes', name: 'Abarrotes', icon: 'shopping_basket', color: '#6750A4', subcategories: [ { id: 'aceites', name: 'Aceites' }, { id: 'cereales', name: 'Cereales' }, { id: 'granos', name: 'Granos' }, { id: 'conservas', name: 'Conservas' } ] },
    { id: 'carnes', name: 'Carnicería', icon: 'kebab_dining', color: '#B3261E', subcategories: [ { id: 'res', name: 'Res' }, { id: 'pollo', name: 'Pollo' }, { id: 'embutidos', name: 'Embutidos' }, { id: 'cerdo', name: 'Cerdo' } ] },
    { id: 'pescados', name: 'Pescadería', icon: 'set_meal', color: '#0288D1', subcategories: [ { id: 'salmón', name: 'Salmón' }, { id: 'atún', name: 'Atún' }, { id: 'mariscos', name: 'Mariscos' } ] },
    { id: 'lacteos', name: 'Lácteos', icon: 'local_cafe', color: '#2E7D32', subcategories: [ { id: 'quesos', name: 'Quesos' }, { id: 'yogures', name: 'Yogures' }, { id: 'leches', name: 'Leches' } ] },
    { id: 'frutas', name: 'Frutas y Verduras', icon: 'nutrition', color: '#4CAF50', subcategories: [ { id: 'manzanas', name: 'Manzanas' }, { id: 'aguacates', name: 'Aguacates' }, { id: 'citricos', name: 'Cítricos' } ] },
    { id: 'panaderia', name: 'Panadería', icon: 'bakery_dining', color: '#F57C00', subcategories: [ { id: 'panes', name: 'Panes' }, { id: 'pasteles', name: 'Pasteles' }, { id: 'galletas', name: 'Galletas' } ] },
    { id: 'bebidas', name: 'Bebidas', icon: 'local_bar', color: '#7B1FA2', subcategories: [ { id: 'vinos', name: 'Vinos' }, { id: 'café', name: 'Café' }, { id: 'aguas', name: 'Aguas' }, { id: 'refrescos', name: 'Refrescos' } ] }
];
const initialOrders: Order[] = [
    { id: '1001', userId: '1', customerName: 'Administrador', date: new Date().toISOString(), total: 80.50, status: 'Completado', items: [ { id: 1, quantity: 1 }, { id: 2, quantity: 2 } ], delivery: { method: 'pickup', storeId: 1 }, paymentMethod: 'Tarjeta' },
    { id: '1002', userId: '2', customerName: 'Juan Perez', date: new Date(Date.now() - 86400000 * 2).toISOString(), total: 75.00, status: 'Completado', items: [ { id: 3, quantity: 1 } ], delivery: { method: 'shipping', address: 'Calle Falsa 123, Zona 10' }, paymentMethod: 'Tarjeta' }
];
const initialCoupons: Coupon[] = [
    { code: 'BIENVENIDA10', type: 'percentage', value: 10, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), usageLimit: 100, usedCount: 25, minOrder: 50 },
    { code: 'ENVIOGRATIS', type: 'fixed', value: 25, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), usageLimit: 50, usedCount: 12, minOrder: 100 }
];
const initialBanners: Banner[] = [
    { id: '1', title: '¡Oferta Especial!', description: 'Envío gratis en compras superiores a $100', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
];
const initialNotifications: Notification[] = [
    { id: '1', title: '¡Bienvenido a SuperGo!', message: 'Disfruta de envío gratis en tu primera compra', date: new Date().toISOString(), read: false, type: 'welcome' },
    { id: '2', title: 'Oferta Especial', message: '10% de descuento en productos seleccionados', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false, type: 'promotion' }
];

const mockApi = {
  fetchInitialData: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          products: initialProducts,
          users: initialUsers,
          stores: initialStores,
          categories: initialCategories,
          orders: initialOrders,
          coupons: initialCoupons,
          banners: initialBanners,
          notifications: initialNotifications,
        });
      }, 500);
    });
  }
};

export default mockApi;
