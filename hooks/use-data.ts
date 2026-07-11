'use client';

import { useSyncExternalStore } from 'react';
import { dummyStore } from '@/lib/dummy-store';
import type { Category, TransactionWithCategory } from '@/lib/types';

export function useCategories() {
  const categories = useSyncExternalStore(
    dummyStore.subscribe,
    dummyStore.getCategories,
    dummyStore.getCategories
  );
  return { categories, loading: false, error: null };
}

export function useTransactions() {
  const transactions = useSyncExternalStore(
    dummyStore.subscribe,
    dummyStore.getTransactions,
    dummyStore.getTransactions
  );
  return { transactions, loading: false, error: null };
}

export function useAllData() {
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  return { categories, transactions, loading: false, error: null, refetch: () => {} };
}
