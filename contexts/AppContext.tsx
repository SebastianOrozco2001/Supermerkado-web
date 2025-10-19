import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { Product, User, CartItem, Store, Category, Order, Coupon, Banner, Notification, View, Subcategory } from '../types';
import mockApi from '../services/mockApi';

// Note: To simulate a database for this frontend-only application,
// the entire application state is persisted in the browser's localStorage.

interface AppState {
    products: Product[];
    users: User[];
    stores: Store[];
    categories: Category[];
    orders: Order[];
    coupons: Coupon[];
    banners: Banner[];
    notifications: Notification[];
    cart: CartItem[];
    wishlist: number[];
    currentUser: User | null;
    currentView: View;
    selectedProduct: Product | null;
    activeCategory: string;
    searchQuery: string;
    sortOrder: string;
    filters: {
        priceRange: string;
        minRating: number;
        availability: string;
    };
    isLoading: boolean;
    lastOrder: Order | null;
    appliedDiscount: Coupon | null;
    toast: { message: string, type: 'success' | 'error' | 'warning' | 'info' } | null;
}

const initialState: AppState = {
    products: [],
    users: [],
    stores: [],
    categories: [],
    orders: [],
    coupons: [],
    banners: [],
    notifications: [],
    cart: [],
    wishlist: [],
    currentUser: null,
    currentView: View.PRODUCT,
    selectedProduct: null,
    activeCategory: 'all',
    searchQuery: '',
    sortOrder: 'name-asc',
    filters: {
        priceRange: 'all',
        minRating: 0,
        availability: 'all'
    },
    isLoading: true,
    lastOrder: null,
    appliedDiscount: null,
    toast: null
};

type Action =
    | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
    | { type: 'INITIALIZE_DATA'; payload: any }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'SET_SELECTED_PRODUCT'; payload: Product | null }
    | { type: 'LOGIN'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'REGISTER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'DELETE_USER'; payload: string | number }
    | { type: 'ADD_TO_CART'; payload: number }
    | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: number; quantity: number } }
    | { type: 'REMOVE_FROM_CART'; payload: number }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_WISHLIST'; payload: number }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_SORT_ORDER'; payload: string }
    | { type: 'SET_FILTERS'; payload: AppState['filters'] }
    | { type: 'SET_ACTIVE_CATEGORY'; payload: string }
    | { type: 'PLACE_ORDER'; payload: Order }
    | { type: 'APPLY_COUPON'; payload: Coupon | null }
    | { type: 'SHOW_TOAST'; payload: AppState['toast'] }
    | { type: 'HIDE_TOAST' }
    | { type: 'ADD_PRODUCT'; payload: Product }
    | { type: 'UPDATE_PRODUCT'; payload: Product }
    | { type: 'DELETE_PRODUCT'; payload: number }
    | { type: 'ADD_STORE'; payload: Store }
    | { type: 'UPDATE_STORE'; payload: Store }
    | { type: 'DELETE_STORE'; payload: number | string }
    | { type: 'ADD_COUPON'; payload: Coupon }
    | { type: 'UPDATE_COUPON'; payload: Coupon }
    | { type: 'DELETE_COUPON'; payload: string }
    | { type: 'ADD_CATEGORY'; payload: Category }
    | { type: 'DELETE_CATEGORY'; payload: string }
    | { type: 'ADD_SUBCATEGORY'; payload: { categoryId: string, subcategory: Subcategory } }
    | { type: 'DELETE_SUBCATEGORY'; payload: { categoryId: string, subcategoryId: string } };


const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'HYDRATE_STATE':
            return { ...state, ...action.payload, isLoading: false };
        case 'INITIALIZE_DATA':
            return { ...state, ...action.payload, isLoading: false };
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'SET_SELECTED_PRODUCT':
            return { ...state, selectedProduct: action.payload };
        case 'LOGIN':
            return { ...state, currentUser: action.payload, wishlist: action.payload.id === '1' ? [3, 6, 13] : [] };
        case 'LOGOUT':
            return { ...state, currentUser: null, currentView: View.PRODUCT, wishlist: [], cart: [], appliedDiscount: null };
        case 'REGISTER':
            return { ...state, users: [...state.users, action.payload], currentUser: action.payload };
        case 'UPDATE_USER':
            return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
        case 'DELETE_USER':
            return { ...state, users: state.users.filter(u => u.id !== action.payload) };

        case 'ADD_PRODUCT':
            return { ...state, products: [...state.products, action.payload] };
        case 'UPDATE_PRODUCT':
            return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PRODUCT':
            return { ...state, products: state.products.filter(p => p.id !== action.payload) };

        case 'ADD_STORE':
            return { ...state, stores: [...state.stores, action.payload] };
        case 'UPDATE_STORE':
            return { ...state, stores: state.stores.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_STORE':
            return { ...state, stores: state.stores.filter(s => s.id !== action.payload) };

        case 'ADD_COUPON':
            return { ...state, coupons: [...state.coupons, action.payload] };
        case 'UPDATE_COUPON':
            return { ...state, coupons: state.coupons.map(c => c.code === action.payload.code ? action.payload : c) };
        case 'DELETE_COUPON':
            return { ...state, coupons: state.coupons.filter(c => c.code !== action.payload) };
            
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, action.payload] };
        case 'DELETE_CATEGORY':
            return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
        case 'ADD_SUBCATEGORY': {
            const { categoryId, subcategory } = action.payload;
            return {
                ...state,
                categories: state.categories.map(c => c.id === categoryId ? { ...c, subcategories: [...c.subcategories, subcategory] } : c)
            };
        }
        case 'DELETE_SUBCATEGORY': {
            const { categoryId, subcategoryId } = action.payload;
            return {
                ...state,
                categories: state.categories.map(c => c.id === categoryId ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) } : c)
            };
        }

        case 'ADD_TO_CART': {
            const productId = action.payload;
            const product = state.products.find(p => p.id === productId);
            if (!product || product.stock <= 0) return state;

            const existingItem = state.cart.find(item => item.id === productId);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) return state;
                return {
                    ...state,
                    cart: state.cart.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)
                };
            }
            return { ...state, cart: [...state.cart, { id: productId, quantity: 1 }] };
        }
        case 'UPDATE_CART_QUANTITY': {
            const { productId, quantity } = action.payload;
            const product = state.products.find(p => p.id === productId);
            if (!product) return state;

            const clampedQuantity = Math.min(quantity, product.stock);

            if (clampedQuantity <= 0) {
                return { ...state, cart: state.cart.filter(item => item.id !== productId) };
            }
            return {
                ...state,
                cart: state.cart.map(item => item.id === productId ? { ...item, quantity: clampedQuantity } : item)
            };
        }
        case 'REMOVE_FROM_CART':
            return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
        case 'CLEAR_CART':
            return { ...state, cart: [] };

        case 'TOGGLE_WISHLIST': {
            const productId = action.payload;
            const inWishlist = state.wishlist.includes(productId);
            return {
                ...state,
                wishlist: inWishlist
                    ? state.wishlist.filter(id => id !== productId)
                    : [...state.wishlist, productId]
            };
        }
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_SORT_ORDER':
            return { ...state, sortOrder: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: action.payload };
        case 'SET_ACTIVE_CATEGORY':
            return { ...state, activeCategory: action.payload };
        case 'PLACE_ORDER':
            return {
                ...state,
                orders: [...state.orders, action.payload],
                cart: [],
                lastOrder: action.payload,
                appliedDiscount: null,
                currentView: View.ORDER_CONFIRMATION
            };
        case 'APPLY_COUPON':
            return { ...state, appliedDiscount: action.payload };
        case 'SHOW_TOAST':
            return { ...state, toast: action.payload };
        case 'HIDE_TOAST':
            return { ...state, toast: null };
        default:
            return state;
    }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem('superGoState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // We hydrate the state but ensure transient properties are reset
                dispatch({ type: 'HYDRATE_STATE', payload: { ...parsedState, isLoading: false, toast: null, selectedProduct: null } });
            } else {
                const loadData = async () => {
                    const data = await mockApi.fetchInitialData();
                    dispatch({ type: 'INITIALIZE_DATA', payload: data });
                };
                loadData();
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
             const loadData = async () => {
                const data = await mockApi.fetchInitialData();
                dispatch({ type: 'INITIALIZE_DATA', payload: data });
            };
            loadData();
        }
    }, []);

    useEffect(() => {
        // This effect runs whenever the state changes, saving it to localStorage.
        // We exclude transient state properties that shouldn't be persisted.
        const { isLoading, toast, selectedProduct, ...stateToSave } = state;
        try {
            localStorage.setItem('superGoState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [state]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
