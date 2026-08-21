import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'autopilote_catalogue_cart';

const CatalogueCartContext = createContext(null);

function loadCart() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function toCartItem(item, quantity = '') {
    return {
        catalog_id: item.id,
        product_id: item.product_id || null,
        article_ref: item.article_id || item.reference || '',
        barcode: item.reference || '',
        category: item.category || '',
        brand: item.brand || '',
        description: item.name || '',
        unit: item.unit || '',
        unit_price: item.price != null && item.price !== '' ? String(item.price) : '',
        quantity: quantity === '' || quantity == null ? '' : String(quantity),
        photo_url: item.photo_url || null,
        name: item.name || '',
    };
}

export function CatalogueCartProvider({ children }) {
    const [items, setItems] = useState(loadCart);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            /* ignore */
        }
    }, [items]);

    const addItem = useCallback((catalogItem, quantity = '') => {
        setItems((prev) => {
            const id = catalogItem.id;
            const existing = prev.find((x) => x.catalog_id === id);
            if (existing) return prev;
            return [...prev, toCartItem(catalogItem, quantity)];
        });
    }, []);

    const toggleItem = useCallback((catalogItem) => {
        setItems((prev) => {
            const id = catalogItem.id;
            if (prev.some((x) => x.catalog_id === id)) {
                return prev.filter((x) => x.catalog_id !== id);
            }
            return [...prev, toCartItem(catalogItem, '')];
        });
    }, []);

    const setQuantity = useCallback((catalogId, quantity) => {
        setItems((prev) =>
            prev.map((x) =>
                x.catalog_id === catalogId
                    ? { ...x, quantity: quantity === '' ? '' : String(quantity) }
                    : x,
            ),
        );
    }, []);

    const removeItem = useCallback((catalogId) => {
        setItems((prev) => prev.filter((x) => x.catalog_id !== catalogId));
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const isInCart = useCallback(
        (catalogId) => items.some((x) => x.catalog_id === catalogId),
        [items],
    );

    const getQuantity = useCallback(
        (catalogId) => items.find((x) => x.catalog_id === catalogId)?.quantity ?? '',
        [items],
    );

    const count = items.length;

    const value = useMemo(
        () => ({
            items,
            count,
            addItem,
            toggleItem,
            setQuantity,
            removeItem,
            clear,
            isInCart,
            getQuantity,
        }),
        [items, count, addItem, toggleItem, setQuantity, removeItem, clear, isInCart, getQuantity],
    );

    return (
        <CatalogueCartContext.Provider value={value}>
            {children}
        </CatalogueCartContext.Provider>
    );
}

export function useCatalogueCart() {
    const ctx = useContext(CatalogueCartContext);
    if (!ctx) {
        throw new Error('useCatalogueCart must be used within CatalogueCartProvider');
    }
    return ctx;
}
