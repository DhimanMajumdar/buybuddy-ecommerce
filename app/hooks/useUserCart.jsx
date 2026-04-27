"use client";

import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createCartStore } from '@/app/store/useCart';

// Cache for user-specific stores
const storeCache = new Map();

export function useUserCart(selector) {
  const { user } = useAuth();
  
  // Create or get user-specific cart store
  const store = useMemo(() => {
    const userId = user?.id || 'guest';
    
    if (!storeCache.has(userId)) {
      storeCache.set(userId, createCartStore(userId));
    }
    
    return storeCache.get(userId);
  }, [user?.id]);

  // Get initial state immediately
  const [storeState, setStoreState] = useState(() => store.getState());

  useEffect(() => {
    if (store) {
      // Set initial state
      setStoreState(store.getState());
      
      // Subscribe to store changes
      const unsubscribe = store.subscribe((state) => {
        setStoreState(state);
      });

      return unsubscribe;
    }
  }, [store]);

  // Return selected state or entire state
  if (selector) {
    return selector(storeState);
  }

  return storeState;
}
