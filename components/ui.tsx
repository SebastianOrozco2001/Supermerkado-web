import React, { useState } from 'react';
import { Product, View } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', children, className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: 'bg-[#6750A4] text-white border border-transparent hover:bg-[#58448a] focus:ring-[#6750A4]',
        secondary: 'bg-transparent text-[#6750A4] border border-[#79747E] hover:bg-[#EADDFF]',
        danger: 'bg-[#B3261E] text-white border border-transparent hover:bg-[#9e221b] focus:ring-[#B3261E]',
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const formElementClasses = "w-full px-4 py-3 rounded-lg border border-[#79747E] bg-[#FFFBFE] focus:outline-none focus:ring-2 focus:ring-[#6750A4] focus:border-transparent";
const labelClasses = "block text-sm font-medium mb-2 text-[#49454F]";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
export const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className={labelClasses}>{label}</label>
        <input id={id} className={`${formElementClasses} ${className}`} {...props} />
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
export const Select: React.FC<SelectProps> = ({ label, id, children, className, ...props }) => (
     <div className="mb-4">
        <label htmlFor={id} className={labelClasses}>{label}</label>
        <select id={id} className={`${formElementClasses} ${className}`} {...props}>
            {children}
        </select>
    </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className={labelClasses}>{label}</label>
        <textarea id={id} className={`${formElementClasses} ${className}`} {...props} />
    </div>
);


interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { state, dispatch } = useAppContext();
    const isInWishlist = state.wishlist.includes(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'ADD_TO_CART', payload: product.id });
        dispatch({ type: 'SHOW_TOAST', payload: { message: `${product.name} agregado al carrito`, type: 'success' } });
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id });
         dispatch({ type: 'SHOW_TOAST', payload: { message: isInWishlist ? 'Producto removido de la lista de deseos' : 'Producto agregado a la lista de deseos', type: 'info' } });
    };
    
    const handleCardClick = () => {
        dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
        dispatch({ type: 'SET_VIEW', payload: View.PRODUCT_DETAIL });
    }

    const stockStatus = product.stock === 0 ? { text: 'Agotado', class: 'text-[#B3261E]' }
        : product.stock < 10 ? { text: `Solo ${product.stock} disponibles`, class: 'text-[#F57C00]' }
        : { text: 'En stock', class: 'text-green-600' };

    return (
        <div onClick={handleCardClick} className="bg-[#FFFBFE] rounded-2xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="relative">
                <img className="w-full h-56 object-cover" src={product.image} alt={product.name} />
                <button onClick={handleToggleWishlist} className={`absolute top-3 right-3 p-2 rounded-full bg-white/70 backdrop-blur-sm transition-colors ${isInWishlist ? 'text-[#B3261E]' : 'text-[#49454F]'} hover:text-[#B3261E]`}>
                    <span className="material-symbols-outlined">{isInWishlist ? 'favorite' : 'favorite_border'}</span>
                </button>
                {product.originalPrice && (
                    <div className="absolute top-3 left-3 bg-[#B3261E] text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <p className="text-xs text-[#625B71] uppercase">{product.category}</p>
                <h3 className="text-lg font-medium text-[#1C1B1F] truncate">{product.name}</h3>
                <div className="flex items-center gap-1 my-1">
                    <span className="material-symbols-outlined text-yellow-500 text-base">star</span>
                    <span className="text-sm text-[#49454F]">{product.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#79747E]">({product.reviewCount})</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-[#6750A4]">${product.price.toFixed(2)}</p>
                    {product.originalPrice && (
                        <p className="text-sm text-[#79747E] line-through">${product.originalPrice.toFixed(2)}</p>
                    )}
                </div>
                <p className={`text-sm font-medium my-2 ${stockStatus.class}`}>{stockStatus.text}</p>
                <div className="mt-auto">
                    <Button variant="primary" onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                        Agregar
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-[#FFFBFE] rounded-3xl shadow-lg p-6 w-full max-w-md m-4 relative animate-scale-in-fast" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-[#49454F] hover:text-[#1C1B1F]">
                    <span className="material-symbols-outlined">close</span>
                </button>
                {children}
            </div>
        </div>
    );
};

export const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; onClose: () => void; }> = ({ message, type, onClose }) => {
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };
    const colors = {
        success: 'border-green-500',
        error: 'border-[#B3261E]',
        warning: 'border-yellow-500',
        info: 'border-blue-500',
    }

    React.useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-5 right-5 bg-[#FFFBFE] rounded-xl shadow-2xl p-4 flex items-center gap-4 border-l-4 ${colors[type]} z-[1100] animate-slide-in-right`}>
            <span className="material-symbols-outlined text-2xl">{icons[type]}</span>
            <span className="text-[#1C1B1F]">{message}</span>
        </div>
    );
};
