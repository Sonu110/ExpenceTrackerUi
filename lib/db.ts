import { dummyStore } from './dummy-store';
import type { Category, Transaction, TransactionWithCategory } from './types';

export async function createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  return dummyStore.createCategory(data);
}

export async function updateCategory(id: string, data: Partial<Category>) {
  return dummyStore.updateCategory(id, data);
}

export async function deleteCategory(id: string) {
  dummyStore.deleteCategory(id);
}

export async function createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
  return dummyStore.createTransaction(data);
}

export async function updateTransaction(id: string, data: Partial<Transaction>) {
  return dummyStore.updateTransaction(id, data);
}

export async function deleteTransaction(id: string) {
  dummyStore.deleteTransaction(id);
}

export async function getCategorySpending(categoryId: string): Promise<number> {
  return dummyStore.getCategorySpending(categoryId);
}
