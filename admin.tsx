import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppContext } from './contexts/AppContext';
import { Product, User, Store, Coupon, Category, Subcategory } from './types';
import { Button, Modal, Input, Select, Textarea } from './components/ui';

const Icon = ({ name, className = '' }: { name: string, className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// --- PRODUCT MANAGEMENT --- //

export const ProductManagement = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleDelete = (productId: number) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            dispatch({ type: 'DELETE_PRODUCT', payload: productId });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Producto eliminado', type: 'success' } });
        }
    };

    const handleFormSubmit = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount'> | Product) => {
        if ('id' in productData) {
            dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Producto actualizado', type: 'success' } });
        } else {
            // FIX: Initialize rating to 0 for new products as it's not in the form data.
            const newProduct: Product = { ...productData, id: Date.now(), reviewCount: 0, rating: 0, isFeatured: false, barcode: '', sku: '' };
            dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Producto agregado', type: 'success' } });
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Gestión de Productos ({state.products.length})</h2>
                <Button variant="primary" onClick={handleAddNew}><Icon name="add"/> Agregar Producto</Button>
            </div>
            <div className="bg-white dark:bg-[#2C2B30] shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Categoría</th>
                            <th scope="col" className="px-6 py-3">Precio</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.products.map(p => (
                            <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{p.category}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${p.price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{p.stock}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Icon name="edit"/></button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Icon name="delete"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={editingProduct} onSubmit={handleFormSubmit} />
        </div>
    );
};

const ProductFormModal: React.FC<{isOpen: boolean, onClose: () => void, product: Product | null, onSubmit: (data: any) => void}> = ({isOpen, onClose, product, onSubmit}) => {
    const { state } = useAppContext();
    const [formData, setFormData] = useState<Partial<Product>>({});
    
    useEffect(() => {
        setFormData(product || { name: '', category: '', mainCategory: '', price: 0, stock: 0, image: '', description: '', features: [], tags: [] });
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | string[] = value;
        if (type === 'number') {
            processedValue = parseFloat(value);
        }
        if(name === 'tags' || name === 'features') {
            processedValue = value.split(',').map(s => s.trim());
        }
        if(name === 'category') {
            const mainCategory = state.categories.find(c => c.subcategories.some(s => s.id === value))?.id;
            // FIX: Use `value` directly for `category` to avoid type mismatch with `processedValue`.
            setFormData(prev => ({ ...prev, category: value, mainCategory }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("La imagen es demasiado grande. Por favor, sube una imagen de menos de 2MB.");
                e.target.value = ''; // Reset file input
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormData(prev => ({ ...prev, image: event.target.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4 dark:text-white">{product ? 'Editar Producto' : 'Agregar Producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="Nombre del Producto" name="name" value={formData.name || ''} onChange={handleChange} required />
                <Select label="Categoría" name="category" value={formData.category || ''} onChange={handleChange} required>
                    <option value="">Selecciona una categoría</option>
                    {state.categories.map(cat => (
                        <optgroup label={cat.name} key={cat.id}>
                            {cat.subcategories.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </Select>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Precio" name="price" type="number" step="0.01" value={formData.price || ''} onChange={handleChange} required />
                    <Input label="Stock" name="stock" type="number" value={formData.stock || ''} onChange={handleChange} required />
                </div>
                <Input 
                    label="URL de Imagen" 
                    name="image" 
                    value={formData.image?.startsWith('data:') ? 'Imagen cargada desde archivo' : formData.image || ''} 
                    onChange={handleChange}
                    disabled={formData.image?.startsWith('data:')}
                    placeholder="Pega una URL de imagen pública"
                />
                 <div>
                    <label className="block text-sm font-medium mb-2 text-[#1C1B1F] dark:text-[#E6E1E5]">O subir/cambiar imagen</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EADDFF] file:text-[#21005D] hover:file:bg-[#d9c8ff] dark:file:bg-[#4A4458] dark:file:text-[#E8DEF8] dark:hover:file:bg-[#635C70]"/>
                </div>
                {formData.image && <img src={formData.image} alt="preview" className="w-32 h-32 object-cover rounded-lg mx-auto"/>}

                <Textarea name="description" label="Descripción" value={formData.description || ''} onChange={handleChange}/>
                <Input label="Etiquetas (separadas por coma)" name="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={handleChange} />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar</Button>
                </div>
            </form>
        </Modal>
    )
}

// --- USER MANAGEMENT --- //

export const UserManagement = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string | number) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            dispatch({ type: 'DELETE_USER', payload: userId });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Usuario eliminado', type: 'success' } });
        }
    };
    
    const handleFormSubmit = (userData: Omit<User, 'id'> | User) => {
         if ('id' in userData) {
            dispatch({ type: 'UPDATE_USER', payload: userData });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Usuario actualizado', type: 'success' } });
        } else {
            const newUser: User = { ...userData, id: `user_${Date.now()}`, loyaltyPoints: 0 };
            dispatch({ type: 'REGISTER', payload: newUser });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Usuario agregado', type: 'success' } });
        }
        setIsModalOpen(false);
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Gestión de Usuarios ({state.users.length})</h2>
                <Button variant="primary" onClick={handleAddNew}><Icon name="add"/> Agregar Usuario</Button>
            </div>
             <div className="bg-white dark:bg-[#2C2B30] shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Correo</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.users.map(u => (
                            <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium dark:text-white">{u.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                                <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">{u.role}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Icon name="edit"/></button>
                                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Icon name="delete"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={editingUser} onSubmit={handleFormSubmit} />
        </div>
    )
};

const UserFormModal: React.FC<{isOpen: boolean, onClose: () => void, user: User | null, onSubmit: (data: any) => void}> = ({isOpen, onClose, user, onSubmit}) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    
    useEffect(() => {
        setFormData(user || { name: '', email: '', role: 'user' });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4 dark:text-white">{user ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre" name="name" value={formData.name || ''} onChange={handleChange} required />
                <Input label="Correo" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                <Input label="Contraseña" name="password" type="password" placeholder={user ? 'Dejar en blanco para no cambiar' : ''} />
                <Select label="Rol" name="role" value={formData.role || 'user'} onChange={handleChange}>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                </Select>
                 <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar</Button>
                </div>
            </form>
        </Modal>
    )
};

// --- STORE MANAGEMENT --- //
export const StoreManagement = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const handleEdit = (store: Store) => { setEditingStore(store); setIsModalOpen(true); };
    const handleAddNew = () => { setEditingStore(null); setIsModalOpen(true); };
    const handleDelete = (storeId: string | number) => {
        if(window.confirm('¿Eliminar esta tienda?')) {
            dispatch({ type: 'DELETE_STORE', payload: storeId });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Tienda eliminada', type: 'success' } });
        }
    };
    const handleFormSubmit = (storeData: Omit<Store, 'id'> | Store) => {
        if ('id' in storeData) {
            dispatch({ type: 'UPDATE_STORE', payload: storeData });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Tienda actualizada', type: 'success' } });
        } else {
            const newStore: Store = { ...storeData, id: `store_${Date.now()}` } as Store;
            dispatch({ type: 'ADD_STORE', payload: newStore });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Tienda agregada', type: 'success' } });
        }
        setIsModalOpen(false);
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Gestión de Tiendas ({state.stores.length})</h2>
                <Button variant="primary" onClick={handleAddNew}><Icon name="add"/> Agregar Tienda</Button>
            </div>
             <div className="bg-white dark:bg-[#2C2B30] shadow-md rounded-lg overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Dirección</th>
                            <th className="px-6 py-3">Teléfono</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.stores.map(s => (
                             <tr key={s.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium dark:text-white">{s.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.address}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.phone}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(s)} className="text-blue-600 dark:text-blue-400"><Icon name="edit"/></button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-600 dark:text-red-400"><Icon name="delete"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
             <StoreFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} store={editingStore} onSubmit={handleFormSubmit} />
        </div>
    );
};

const StoreFormModal: React.FC<{isOpen: boolean, onClose: () => void, store: Store | null, onSubmit: (data: any) => void}> = ({isOpen, onClose, store, onSubmit}) => {
    const [formData, setFormData] = useState<Partial<Store>>({});
    useEffect(() => { setFormData(store || { name: '', address: '', phone: '', hours: '8:00 - 21:00' }) }, [store]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    }
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4 dark:text-white">{store ? 'Editar Tienda' : 'Agregar Tienda'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre" name="name" value={formData.name || ''} onChange={handleChange} required />
                <Input label="Dirección" name="address" value={formData.address || ''} onChange={handleChange} required />
                <Input label="Teléfono" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                <Input label="Horario" name="hours" value={formData.hours || ''} onChange={handleChange} />
                <div className="flex justify-end gap-4"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></div>
            </form>
        </Modal>
    )
};

// --- COUPON MANAGEMENT --- //
export const CouponManagement = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const handleEdit = (c: Coupon) => { setEditingCoupon(c); setIsModalOpen(true); };
    const handleAddNew = () => { setEditingCoupon(null); setIsModalOpen(true); };
    const handleDelete = (code: string) => {
        if(window.confirm('¿Eliminar este cupón?')) {
            dispatch({ type: 'DELETE_COUPON', payload: code });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Cupón eliminado', type: 'success' } });
        }
    };
    const handleFormSubmit = (couponData: Coupon) => {
        if (state.coupons.some(c => c.code === couponData.code && c.code !== editingCoupon?.code)) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'El código del cupón ya existe', type: 'error' } });
            return;
        }
        if (editingCoupon) {
            dispatch({ type: 'UPDATE_COUPON', payload: couponData });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Cupón actualizado', type: 'success' } });
        } else {
            dispatch({ type: 'ADD_COUPON', payload: couponData });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Cupón agregado', type: 'success' } });
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Gestión de Cupones ({state.coupons.length})</h2>
                <Button variant="primary" onClick={handleAddNew}><Icon name="add"/> Agregar Cupón</Button>
            </div>
            <div className="bg-white dark:bg-[#2C2B30] shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                     <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3">Expira</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.coupons.map(c => (
                            <tr key={c.code} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium dark:text-white">{c.code}</td>
                                <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">{c.type}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.type === 'percentage' ? `${c.value}%` : `$${c.value.toFixed(2)}`}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(c.endDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(c)} className="text-blue-600 dark:text-blue-400"><Icon name="edit"/></button>
                                    <button onClick={() => handleDelete(c.code)} className="text-red-600 dark:text-red-400"><Icon name="delete"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CouponFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coupon={editingCoupon} onSubmit={handleFormSubmit} />
        </div>
    );
};

const CouponFormModal: React.FC<{isOpen: boolean, onClose: () => void, coupon: Coupon | null, onSubmit: (data: Coupon) => void}> = ({isOpen, onClose, coupon, onSubmit}) => {
    const [formData, setFormData] = useState<Partial<Coupon>>({});
    useEffect(() => { setFormData(coupon || { code: '', type: 'percentage', value: 10, minOrder: 0 }) }, [coupon]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    }
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData as Coupon); };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4 dark:text-white">{coupon ? 'Editar Cupón' : 'Agregar Cupón'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Código" name="code" value={formData.code || ''} onChange={handleChange} required disabled={!!coupon} />
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Tipo" name="type" value={formData.type || 'percentage'} onChange={handleChange}>
                        <option value="percentage">Porcentaje</option>
                        <option value="fixed">Monto Fijo</option>
                    </Select>
                    <Input label="Valor" name="value" type="number" step="0.01" value={formData.value || ''} onChange={handleChange} required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Fecha de Inicio" name="startDate" type="date" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} required />
                    <Input label="Fecha de Fin" name="endDate" type="date" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} required />
                </div>
                <Input label="Mínimo de Compra" name="minOrder" type="number" step="0.01" value={formData.minOrder || ''} onChange={handleChange} />
                <div className="flex justify-end gap-4"><Button type="button" onClick={onClose}>Cancelar</Button><Button type="submit">Guardar</Button></div>
            </form>
        </Modal>
    );
};

// --- CATEGORY MANAGEMENT --- //
export const CategoryManagement = () => {
    const { state, dispatch } = useAppContext();

    const handleAddCategory = () => {
        const name = prompt("Nombre de la nueva categoría principal:");
        const icon = prompt("Nombre del icono (Material Symbols):", "label");
        if (name && icon) {
            const newCategory: Category = {
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                icon,
                color: '#6750A4',
                subcategories: []
            };
            dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        }
    };
    
    const handleDeleteCategory = (id: string) => {
        if(window.confirm('¿Eliminar categoría y todas sus subcategorías?')) {
            dispatch({type: 'DELETE_CATEGORY', payload: id});
        }
    };

    const handleAddSubcategory = (categoryId: string) => {
         const name = prompt("Nombre de la nueva subcategoría:");
         if(name) {
             const newSub: Subcategory = {
                 id: name.toLowerCase().replace(/\s+/g, '-'),
                 name
             };
             dispatch({type: 'ADD_SUBCATEGORY', payload: {categoryId, subcategory: newSub}});
         }
    };
    
    const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
        if(window.confirm('¿Eliminar subcategoría?')) {
            dispatch({type: 'DELETE_SUBCATEGORY', payload: {categoryId, subcategoryId}});
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Gestión de Categorías</h2>
                <Button variant="primary" onClick={handleAddCategory}><Icon name="add"/> Nueva Categoría</Button>
            </div>
            <div className="space-y-4">
                {state.categories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-[#2C2B30] p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 dark:text-white"><Icon name={cat.icon}/> {cat.name}</h3>
                            <div className="flex gap-2">
                                <Button onClick={() => handleAddSubcategory(cat.id)}><Icon name="add"/> Subcategoría</Button>
                                <Button variant="danger" onClick={() => handleDeleteCategory(cat.id)}><Icon name="delete"/></Button>
                            </div>
                        </div>
                        <ul className="pl-6 mt-2 space-y-1">
                            {cat.subcategories.map(sub => (
                                <li key={sub.id} className="flex justify-between items-center dark:text-gray-300">
                                    <span>{sub.name}</span>
                                    <button onClick={() => handleDeleteSubcategory(cat.id, sub.id)} className="text-red-500 text-sm"><Icon name="close"/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};