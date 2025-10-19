import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from './contexts/AppContext';
import { View, Product, User, Store, CartItem, Category, Coupon, Subcategory } from './types';
import { ProductCard, Modal, Button, Input, Toast, Select, Textarea } from './components/ui';

// Helper: Icon Component
const Icon = ({ name, className = '' }: { name: string, className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// --- SIDEBAR --- //
const Sidebar: React.FC<{ isSidebarOpen: boolean, setIsSidebarOpen: (isOpen: boolean) => void, onAuthClick: () => void }> = ({ isSidebarOpen, setIsSidebarOpen, onAuthClick }) => {
    const { state, dispatch } = useAppContext();
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

    const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: categoryId });
        dispatch({type: 'SET_SEARCH_QUERY', payload: ''});
        dispatch({ type: 'SET_VIEW', payload: View.PRODUCT });
        setIsSidebarOpen(false);
    };

    const handleViewClick = (view: View, e: React.MouseEvent) => {
        e.preventDefault();
        if((view === View.ACCOUNT || view === View.WISHLIST) && !state.currentUser) {
            onAuthClick();
            setIsSidebarOpen(false);
            return;
        }
        dispatch({ type: 'SET_VIEW', payload: view });
        setIsSidebarOpen(false);
    };

    const toggleSubmenu = (categoryId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenSubmenus(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const menuItems = [
        { name: 'Mi Cuenta', icon: 'account_circle', view: View.ACCOUNT, requiresAuth: true },
        { name: 'Mi Lista de Deseos', icon: 'favorite', view: View.WISHLIST, requiresAuth: true, badge: state.wishlist.length },
    ];
    
    if (state.currentUser?.role === 'admin') {
        menuItems.push({ name: 'Panel Admin', icon: 'admin_panel_settings', view: View.ADMIN, requiresAuth: true, badge: 0 });
    }

    const NavLink = ({ children, onClick, isActive }: { children: React.ReactNode, onClick: (e:React.MouseEvent) => void, isActive?: boolean }) => (
        <a href="#" onClick={onClick} className={`flex items-center gap-4 px-4 py-3 my-1 rounded-r-full transition-colors duration-200 ${isActive ? 'bg-[#EADDFF] text-[#21005D]' : 'text-[#49454F] hover:bg-gray-200/50'}`}>
            {children}
        </a>
    );

    return (
        <>
            <aside className={`fixed top-0 left-0 w-72 h-full bg-[#FFFBFE] shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-4 flex items-center justify-between gap-4">
                    <a href="#" onClick={(e) => handleViewClick(View.PRODUCT, e)} className="flex items-center gap-2 text-2xl font-bold text-[#6750A4]">
                        <Icon name="store" className="text-3xl" /> SuperGo
                    </a>
                     <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2">
                        <Icon name="close" />
                    </button>
                </div>
                <nav className="pr-4 mt-4 h-[calc(100vh-80px)] overflow-y-auto">
                    <ul>
                        {state.currentUser ? (
                             <>
                                {menuItems.map(item => item.requiresAuth && (
                                    <li key={item.name}>
                                        <NavLink onClick={(e) => handleViewClick(item.view, e)} isActive={state.currentView === item.view}>
                                            <Icon name={item.icon} /> <span>{item.name}</span>
                                            {item.badge > 0 && <span className="ml-auto bg-[#B3261E] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{item.badge}</span>}
                                        </NavLink>
                                    </li>
                                ))}
                                <li>
                                    <NavLink onClick={() => dispatch({ type: 'LOGOUT' })}>
                                        <Icon name="logout" /> <span>Cerrar Sesión</span>
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <li>
                                <NavLink onClick={onAuthClick}>
                                    <Icon name="login" /> <span>Ingresar</span>
                                </NavLink>
                            </li>
                        )}
                        <hr className="my-4"/>
                        <li>
                            <NavLink onClick={(e) => handleCategoryClick('all', e)} isActive={state.activeCategory === 'all'}>
                                <Icon name="category" /> <span>Todos los Productos</span>
                            </NavLink>
                        </li>
                        {state.categories.map(cat => (
                             <li key={cat.id}>
                                <div className="relative">
                                     <NavLink onClick={(e) => handleCategoryClick(cat.id, e)} isActive={state.activeCategory === cat.id}>
                                        <Icon name={cat.icon} /> <span>{cat.name}</span>
                                    </NavLink>
                                    {cat.subcategories.length > 0 && (
                                        <button onClick={(e) => toggleSubmenu(cat.id, e)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-transform ${openSubmenus[cat.id] ? 'rotate-90' : ''}`}>
                                            <Icon name={'chevron_right'} />
                                        </button>
                                    )}
                                </div>
                                {cat.subcategories.length > 0 && openSubmenus[cat.id] && (
                                    <ul className="pl-8">
                                        {cat.subcategories.map(sub => (
                                            <li key={sub.id}>
                                                <NavLink onClick={(e) => handleCategoryClick(sub.id, e)} isActive={state.activeCategory === sub.id}>
                                                    <span>{sub.name}</span>
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden"></div>}
        </>
    );
};

// --- HEADER --- //
const Header: React.FC<{ onCartClick: () => void, onMenuClick: () => void }> = ({ onCartClick, onMenuClick }) => {
    const { state, dispatch } = useAppContext();
    const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
        if(state.currentView !== View.PRODUCT) {
          dispatch({ type: 'SET_VIEW', payload: View.PRODUCT });
        }
    };

    return (
        <header className="sticky top-0 bg-[#FFFBFE]/80 backdrop-blur-sm z-30 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                 <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2">
                    <Icon name="menu" />
                </button>
                <div className="flex-1 flex justify-center lg:justify-start">
                    <div className="relative w-full max-w-md">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="search" 
                            placeholder="Buscar productos..."
                            value={state.searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-[#EADDFF]/50 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onCartClick} className="relative p-2">
                        <Icon name="shopping_cart" />
                        {cartItemCount > 0 && (
                            <span className="absolute top-0 right-0 bg-[#B3261E] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{cartItemCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
};


// --- VIEWS --- //

const ProductView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    
    const filteredProducts = useMemo(() => {
        return state.products
            .filter(p => {
                const searchMatch = state.searchQuery === '' || 
                                    p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                    p.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));

                const categoryMatch = (() => {
                    if (state.activeCategory === 'all') return true;
                    const mainCat = state.categories.find(c => c.id === state.activeCategory);
                    if(mainCat) return p.mainCategory === state.activeCategory;
                    
                    const subCatParent = state.categories.find(c => c.subcategories.some(s => s.id === state.activeCategory));
                    if (subCatParent) return p.category === state.activeCategory;

                    return false;
                })();
                
                const [min, max] = state.filters.priceRange.split('-').map(Number);
                const priceMatch = state.filters.priceRange === 'all' || (p.price >= min && (isNaN(max) || p.price <= max));
                
                const ratingMatch = p.rating >= state.filters.minRating;
                
                const availabilityMatch = state.filters.availability === 'all' ||
                                        (state.filters.availability === 'in-stock' && p.stock > 0) ||
                                        (state.filters.availability === 'out-of-stock' && p.stock === 0);

                return searchMatch && categoryMatch && priceMatch && ratingMatch && availabilityMatch;
            })
            .sort((a, b) => {
                switch (state.sortOrder) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'name-desc': return b.name.localeCompare(a.name);
                    case 'rating-desc': return b.rating - a.rating;
                    case 'popularity-desc': return (b.reviewCount || 0) - (a.reviewCount || 0);
                    default: return a.name.localeCompare(b.name);
                }
            });
    }, [state.products, state.searchQuery, state.activeCategory, state.filters, state.sortOrder, state.categories]);
    
    const activeCategoryInfo = state.categories.flatMap(c => [{...c, isMain: true}, ...c.subcategories.map(s => ({...s, isMain: false}))]).find(c => c.id === state.activeCategory);
    const activeCategoryName = state.activeCategory === 'all' ? 'Todos los Productos' : activeCategoryInfo?.name || 'Productos';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-gradient-to-r from-[#6750A4] to-[#625B71] text-white p-6 rounded-2xl mb-8 text-center">
                <h2 className="text-2xl font-bold">¡Oferta Especial!</h2>
                <p>Envío gratis en compras superiores a $100</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold text-[#1C1B1F]">{activeCategoryName}</h2>
                <select 
                    value={state.sortOrder} 
                    onChange={(e) => dispatch({ type: 'SET_SORT_ORDER', payload: e.target.value })}
                    className="bg-[#FFFBFE] border border-[#79747E] rounded-full px-4 py-2"
                >
                    <option value="name-asc">Ordenar por: Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                    <option value="price-asc">Precio (Menor a Mayor)</option>
                    <option value="price-desc">Precio (Mayor a Menor)</option>
                    <option value="rating-desc">Mejor Valorados</option>
                    <option value="popularity-desc">Más Populares</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {state.isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => <div key={i} className="bg-gray-200 h-96 rounded-2xl animate-pulse"></div>)
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <Icon name="search_off" className="text-6xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium">No se encontraron productos</h3>
                        <p>Intenta ajustar tu búsqueda o filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductDetailView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const product = state.selectedProduct;

    if (!product) {
         useEffect(() => {
            dispatch({ type: 'SET_VIEW', payload: View.PRODUCT });
        }, [dispatch]);
        return null;
    }
    
    const handleAddToCart = () => {
        dispatch({ type: 'UPDATE_CART_QUANTITY', payload: {productId: product.id, quantity: (state.cart.find(i=>i.id===product.id)?.quantity || 0) + quantity } });
        dispatch({ type: 'SHOW_TOAST', payload: { message: `${quantity} x ${product.name} agregado(s) al carrito`, type: 'success' } });
        setQuantity(1);
    };
    
    const isInWishlist = state.wishlist.includes(product.id);
    const handleToggleWishlist = () => {
        dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id });
         dispatch({ type: 'SHOW_TOAST', payload: { message: isInWishlist ? 'Removido de la lista de deseos' : 'Agregado a la lista de deseos', type: 'info' } });
    };

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <Button onClick={() => dispatch({type:'SET_VIEW', payload: View.PRODUCT})} className="mb-6">
                <Icon name="arrow_back" /> Volver
            </Button>
            <div className="grid md:grid-cols-2 gap-8">
                <img src={product.image} alt={product.name} className="w-full rounded-2xl shadow-lg"/>
                <div>
                    <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="star" className="text-yellow-500" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({product.reviewCount} reseñas)</span>
                    </div>
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-4xl font-bold text-[#6750A4]">${product.price.toFixed(2)}</span>
                        {product.originalPrice && <span className="text-2xl line-through text-gray-400">${product.originalPrice.toFixed(2)}</span>}
                    </div>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                    
                     <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center border border-gray-300 rounded-full">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3"><Icon name="remove" /></button>
                            <span className="px-4 text-lg font-medium">{quantity}</span>
                            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3"><Icon name="add" /></button>
                        </div>
                        <Button variant="primary" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-grow">
                            <Icon name="add_shopping_cart" /> Agregar al Carrito
                        </Button>
                        <button onClick={handleToggleWishlist} className={`p-3 rounded-full border border-gray-300 transition-colors ${isInWishlist ? 'text-[#B3261E] bg-red-50' : 'text-gray-500'}`}>
                            <Icon name={isInWishlist ? 'favorite' : 'favorite_border'} />
                        </button>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold mb-2">Características</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {product.features.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

const WishlistView: React.FC = () => {
    const { state } = useAppContext();
    const wishlistProducts = state.products.filter(p => state.wishlist.includes(p.id));

    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <h2 className="text-3xl font-bold text-[#1C1B1F] mb-6">Mi Lista de Deseos</h2>
             {wishlistProducts.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
                 </div>
             ) : (
                <div className="text-center py-12 text-gray-500">
                    <Icon name="favorite_border" className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium">Tu lista de deseos está vacía</h3>
                    <p>Agrega productos que te gusten para verlos aquí.</p>
                </div>
             )}
        </div>
    );
};

const CheckoutView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping' | 'express'>('pickup');
    const [couponCode, setCouponCode] = useState('');

    const subtotal = useMemo(() => state.cart.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0), [state.cart, state.products]);

    const shippingCost = useMemo(() => {
        if (deliveryMethod === 'pickup') return 0;
        if (deliveryMethod === 'shipping') return 25.00;
        if (deliveryMethod === 'express') return 40.00;
        return 0;
    }, [deliveryMethod]);
    
    const discountAmount = useMemo(() => {
        if (!state.appliedDiscount) return 0;
        const { type, value, minOrder } = state.appliedDiscount;
        if(subtotal < minOrder) return 0;
        return type === 'percentage' ? subtotal * (value / 100) : Math.min(value, subtotal);
    }, [state.appliedDiscount, subtotal]);

    const total = subtotal + shippingCost - discountAmount;
    
    const handleApplyCoupon = () => {
        const coupon = state.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
        if(coupon) {
            const now = new Date();
            if (new Date(coupon.endDate) < now) {
                dispatch({type: 'SHOW_TOAST', payload: {message: 'El cupón ha expirado.', type: 'error'}});
                dispatch({type: 'APPLY_COUPON', payload: null});
                return;
            }
            if(subtotal < coupon.minOrder) {
                 dispatch({type: 'SHOW_TOAST', payload: {message: `Se requiere una compra mínima de $${coupon.minOrder.toFixed(2)}`, type: 'warning'}});
                dispatch({type: 'APPLY_COUPON', payload: null});
                return;
            }
            dispatch({type: 'APPLY_COUPON', payload: coupon});
            dispatch({type: 'SHOW_TOAST', payload: {message: 'Cupón aplicado.', type: 'success'}});
        } else {
            dispatch({type: 'SHOW_TOAST', payload: {message: 'Código de cupón no válido.', type: 'error'}});
             dispatch({type: 'APPLY_COUPON', payload: null});
        }
    };
    
    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const order = {
            id: `ord_${Date.now()}`,
            userId: state.currentUser?.id,
            customerName: (data.cardName as string) || state.currentUser?.name || 'Invitado',
            date: new Date().toISOString(),
            total: total,
            status: 'Completado' as const,
            items: state.cart,
            delivery: {
                method: deliveryMethod,
                address: data.address as string,
                storeId: data.storeId as string,
            },
            paymentMethod: 'Tarjeta',
        };

        dispatch({type: 'PLACE_ORDER', payload: order});
        dispatch({type: 'SHOW_TOAST', payload: {message: '¡Pedido realizado con éxito!', type: 'success'}});
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>
            <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">1. Método de Entrega</h2>
                        <div className="space-y-2">
                            {['pickup', 'shipping', 'express'].map(method => (
                                <label key={method} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${deliveryMethod === method ? 'border-[#6750A4] ring-2 ring-[#EADDFF]' : ''}`}>
                                    <input type="radio" name="deliveryMethod" value={method} checked={deliveryMethod === method} onChange={() => setDeliveryMethod(method as any)} className="accent-[#6750A4]"/>
                                    <span className="font-medium capitalize">{method === 'pickup' ? 'Retirar en tienda' : (method === 'shipping' ? 'Envío a domicilio' : 'Envío Express')}</span>
                                    <span className="ml-auto font-bold">{method === 'pickup' ? 'Gratis' : (method === 'shipping' ? '$25.00' : '$40.00')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {deliveryMethod === 'pickup' ? (
                        <div>
                             <h2 className="text-xl font-bold mb-4">2. Selecciona una Tienda</h2>
                             <Select id="storeId" name="storeId" label="Tienda para recoger" required>
                                 <option value="">Selecciona una tienda</option>
                                 {state.stores.map(store => <option key={store.id} value={store.id}>{store.name} - {store.address}</option>)}
                             </Select>
                        </div>
                    ) : (
                         <div>
                             <h2 className="text-xl font-bold mb-4">2. Dirección de Envío</h2>
                            <Input id="address" name="address" label="Dirección" placeholder="Ingresa tu dirección completa" required/>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input id="city" name="city" label="Ciudad" defaultValue="Guatemala City"/>
                                <Input id="zip" name="zip" label="Código Postal" placeholder="01001"/>
                            </div>
                        </div>
                    )}

                    <div>
                         <h2 className="text-xl font-bold mb-4">3. Información de Pago</h2>
                         <Input id="cardName" name="cardName" label="Nombre en la tarjeta" placeholder="Como aparece en la tarjeta" required />
                         <Input id="cardNumber" name="cardNumber" label="Número de tarjeta" placeholder="0000 0000 0000 0000" required />
                         <div className="grid sm:grid-cols-2 gap-4">
                            <Input id="cardExpiry" name="cardExpiry" label="Fecha de expiración" placeholder="MM/AA" required />
                            <Input id="cardCvc" name="cardCvc" label="CVC" placeholder="123" required />
                         </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <h2 className="text-xl font-bold">Resumen de Orden</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Envío</span><span>${shippingCost.toFixed(2)}</span></div>
                         {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600"><span className="text-green-600">Descuento ({state.appliedDiscount?.code})</span><span>-${discountAmount.toFixed(2)}</span></div>
                        )}
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                     <div className="pt-4 border-t">
                        <label htmlFor="coupon" className="text-sm font-medium">Código de descuento</label>
                        <div className="flex gap-2 mt-1">
                            <input id="coupon" type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Ingresa código" className="w-full px-3 py-2 text-sm rounded-lg border border-[#79747E]"/>
                            <Button type="button" onClick={handleApplyCoupon}>Aplicar</Button>
                        </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full !py-3 !text-base mt-4" disabled={state.cart.length === 0}><Icon name="lock"/> Pagar Ahora</Button>
                </div>
            </form>
        </div>
    );
};

const OrderConfirmationView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const order = state.lastOrder;
    if (!order) {
        useEffect(() => { dispatch({type: 'SET_VIEW', payload: View.PRODUCT})}, [dispatch]);
        return null;
    }
    return (
        <div className="p-8 max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
                <Icon name="check_circle" className="text-6xl text-green-500 mb-4"/>
                <h1 className="text-3xl font-bold mb-2">¡Gracias por tu compra!</h1>
                <p className="text-gray-600 mb-6">Tu pedido ha sido procesado exitosamente.</p>
                <div className="text-left bg-gray-50 p-4 rounded-lg border">
                    <p className="mb-2"><strong>Pedido #:</strong> {order.id}</p>
                    <p className="mb-2"><strong>Fecha:</strong> {new Date(order.date).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> <span className="font-bold">${order.total.toFixed(2)}</span></p>
                </div>
                 <div className="flex gap-4 justify-center mt-8">
                     <Button variant="primary" onClick={() => dispatch({type:'SET_VIEW', payload:View.PRODUCT})}>Seguir comprando</Button>
                     <Button onClick={() => dispatch({type:'SET_VIEW', payload:View.ACCOUNT})}>Ver mis pedidos</Button>
                 </div>
            </div>
        </div>
    );
};

const AccountView: React.FC = () => {
    const { state } = useAppContext();
    const user = state.currentUser;
    const userOrders = state.orders.filter(o => o.userId === user?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!user) return <p>Inicia sesión para ver tu cuenta.</p>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Mi Cuenta</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Información Personal</h2>
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Correo:</strong> {user.email}</p>
                    <p><strong>Teléfono:</strong> {user.phone || 'No especificado'}</p>
                    <p><strong>Dirección:</strong> {user.address || 'No especificada'}</p>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Programa de Fidelidad</h2>
                     <div className="text-center">
                        <Icon name="star" className="text-5xl text-yellow-500"/>
                        <p className="text-2xl font-bold">{user.loyaltyPoints} puntos</p>
                     </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4">Historial de Pedidos</h2>
                <div className="bg-white rounded-2xl shadow-sm">
                    {userOrders.length > 0 ? (
                        <ul className="divide-y">
                            {userOrders.map(order => (
                                <li key={order.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">Pedido #{order.id}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">${order.total.toFixed(2)}</p>
                                        <p className="text-sm text-green-600">{order.status}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ): (
                        <p className="p-8 text-center text-gray-500">No tienes pedidos recientes.</p>
                    )}
                </div>
            </div>
        </div>
    );
}


// --- ADMIN --- //
import * as Admin from './admin';

const AdminView: React.FC = () => {
    // FIX: Destructure `dispatch` from useAppContext to make it available.
    const { state, dispatch } = useAppContext();
    if(state.currentUser?.role !== 'admin') {
        useEffect(() => {
             dispatch({type: 'SET_VIEW', payload: View.PRODUCT});
        }, [dispatch]);
        return null;
    }

    const [activeTab, setActiveTab] = useState('products');
    const tabs = ['products', 'users', 'stores', 'coupons', 'categories'];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products': return <Admin.ProductManagement />;
            case 'users': return <Admin.UserManagement />;
            case 'stores': return <Admin.StoreManagement />;
            case 'coupons': return <Admin.CouponManagement />;
            case 'categories': return <Admin.CategoryManagement />;
            default: return <div>Contenido de {activeTab}</div>;
        }
    };
    
    const stats = [
        { label: 'Ingresos Totales', value: `$${state.orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`, icon: 'payments' },
        { label: 'Total Pedidos', value: state.orders.length, icon: 'receipt_long' },
        { label: 'Total Productos', value: state.products.length, icon: 'inventory_2' },
        { label: 'Total Usuarios', value: state.users.length, icon: 'group' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                        <div className="p-3 bg-[#EADDFF] rounded-full"><Icon name={stat.icon} className="text-[#21005D]"/></div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium capitalize ${activeTab === tab ? 'border-[#6750A4] text-[#6750A4]' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="py-6">
                {renderTabContent()}
            </div>
        </div>
    );
};


// --- MODALS & OVERLAYS --- //

const CartSidebar: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useAppContext();
    const subtotal = useMemo(() => state.cart.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0), [state.cart, state.products]);

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity: newQuantity }});
    };
    
    const handleCheckout = () => {
        onClose();
        if(state.currentUser) {
            dispatch({ type: 'SET_VIEW', payload: View.CHECKOUT });
        } else {
             // If not logged in, we could prompt them to login/register first
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Por favor, inicia sesión para continuar', type: 'info' } });
            // In a real app, you might open the auth modal here. For now, we'll just navigate.
             dispatch({ type: 'SET_VIEW', payload: View.CHECKOUT });
        }
    }

    return (
        <>
            <aside className={`fixed top-0 right-0 w-full max-w-sm h-full bg-[#FFFBFE] shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex items-center justify-between border-b">
                    <h2 className="text-xl font-bold">Mi Carrito</h2>
                    <button onClick={onClose}><Icon name="close"/></button>
                </div>
                <div className="h-[calc(100%-16rem)] overflow-y-auto p-4">
                    {state.cart.length === 0 ? (
                        <p className="text-center text-gray-500 mt-8">Tu carrito está vacío.</p>
                    ) : (
                        <ul className="space-y-4">
                            {state.cart.map(item => {
                                const product = state.products.find(p => p.id === item.id);
                                if (!product) return null;
                                return (
                                    <li key={item.id} className="flex gap-4">
                                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg"/>
                                        <div className="flex-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                                            <div className="flex items-center border rounded-full w-fit mt-2">
                                                <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="px-2 py-1"><Icon name="remove" className="text-sm"/></button>
                                                <span className="px-2 text-sm">{item.quantity}</span>
                                                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="px-2 py-1"><Icon name="add" className="text-sm"/></button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${(product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                    <div className="flex justify-between font-medium">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Envío y descuentos calculados en el checkout.</p>
                    <Button variant="primary" className="w-full mt-4" disabled={state.cart.length === 0} onClick={handleCheckout}>Proceder al Pago</Button>
                </div>
            </aside>
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40"></div>}
        </>
    );
};

const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { state, dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = state.users.find(u => u.email === email && u.password === password);
        if(user) {
            dispatch({ type: 'LOGIN', payload: user });
            dispatch({ type: 'SHOW_TOAST', payload: { message: `Bienvenido, ${user.name}`, type: 'success' }});
            onClose();
        } else {
            setError('Credenciales incorrectas.');
        }
    };
    
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (state.users.some(u => u.email === email)) {
            setError('El correo electrónico ya está en uso.');
            return;
        }
        const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            email,
            password,
            role: 'user',
            loyaltyPoints: 0,
        };
        dispatch({ type: 'REGISTER', payload: newUser });
        dispatch({ type: 'SHOW_TOAST', payload: { message: `¡Cuenta creada! Bienvenido, ${name}`, type: 'success' }});
        onClose();
    };


    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">{isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            {isLoginView ? (
                <form onSubmit={handleLogin}>
                    <Input id="login-email" label="Correo Electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    <Input id="login-password" label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    <Button variant="primary" className="w-full mt-4" type="submit">Ingresar</Button>
                </form>
            ) : (
                <form onSubmit={handleRegister}>
                    <Input id="reg-name" label="Nombre Completo" type="text" value={name} onChange={e => setName(e.target.value)} required/>
                    <Input id="reg-email" label="Correo Electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
                    <Input id="reg-password" label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
                    <Button variant="primary" className="w-full mt-4" type="submit">Registrarse</Button>
                </form>
            )}
            <p className="text-center mt-4 text-sm">
                {isLoginView ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-[#6750A4] hover:underline ml-1">
                    {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
                </button>
            </p>
        </div>
    );
}

// --- MAIN APP COMPONENT --- //
const App: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const renderView = useCallback(() => {
        switch(state.currentView) {
            case View.PRODUCT: return <ProductView />;
            case View.PRODUCT_DETAIL: return <ProductDetailView />;
            case View.WISHLIST: return <WishlistView />;
            case View.ADMIN: return <AdminView />;
            case View.CHECKOUT: return <CheckoutView />;
            case View.ORDER_CONFIRMATION: return <OrderConfirmationView />;
            case View.ACCOUNT: return <AccountView />;
            default:
                return <ProductView />;
        }
    }, [state.currentView]);
    
    const handleToastClose = () => {
        dispatch({ type: 'HIDE_TOAST' });
    }

    return (
        <div className="min-h-screen lg:pl-72">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} onAuthClick={() => setIsAuthModalOpen(true)}/>
            
            <div className="flex flex-col flex-1">
                 <Header onCartClick={() => setIsCartOpen(true)} onMenuClick={() => setIsSidebarOpen(true)}/>
                <main className="bg-[#F7F2FA] flex-grow">
                    {renderView()}
                </main>
            </div>
            
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
                <AuthModal onClose={() => setIsAuthModalOpen(false)} />
            </Modal>
            
            {state.toast && <Toast message={state.toast.message} type={state.toast.type} onClose={handleToastClose} />}
        </div>
    );
}

export default App;