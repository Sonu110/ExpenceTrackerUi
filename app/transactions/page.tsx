'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Smartphone, TrendingUp, Banknote, Filter, X } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { usePayFlow } from '@/components/pay-flow/pay-flow-provider';
import { useAllData } from '@/hooks/use-data';
import { useSettingsStore } from '@/lib/store';
import { formatCurrency, formatDate, getStartOfMonth } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PaymentMethod } from '@/lib/types';

type TypeFilter = 'all' | 'expense' | 'income' | 'investment';

export default function TransactionsPage() {
  const { transactions, categories } = useAllData();
  const { currency } = useSettingsStore();
  const { openPayFlow } = usePayFlow();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            t.item_name.toLowerCase().includes(q) ||
            t.category.name.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, categoryFilter, search]);

  const stats = useMemo(() => {
    const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const totalInvestment = filtered.filter((t) => t.type === 'investment').reduce((s, t) => s + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense - totalInvestment;
    return { totalIncome, totalExpense, totalInvestment, netBalance };
  }, [filtered]);

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all' || search !== '';

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setSearch('');
  };

  return (
    <PageContainer
      title="Transactions"
      description="All your financial activity in one place"
      action={
        <Button onClick={openPayFlow} className="rounded-xl shadow-premium">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Income"
            amount={stats.totalIncome}
            icon={Banknote}
            color="text-sky-500"
            bg="bg-sky-500/10"
            prefix="+"
          />
          <StatCard
            label="Expense"
            amount={stats.totalExpense}
            icon={ArrowDownRight}
            color="text-red-500"
            bg="bg-red-500/10"
            prefix="-"
          />
          <StatCard
            label="Investment"
            amount={stats.totalInvestment}
            icon={TrendingUp}
            color="text-green-500"
            bg="bg-green-500/10"
            prefix="-"
          />
          <StatCard
            label="Net Balance"
            amount={stats.netBalance}
            icon={Wallet}
            color={stats.netBalance >= 0 ? 'text-blue-500' : 'text-red-500'}
            bg={stats.netBalance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}
          />
        </div>

        {/* Filters */}
        <Card className="border-0 p-4 shadow-premium">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Transaction list */}
        <Card className="border-0 p-0 shadow-premium">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-sm font-semibold">
              {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
            </h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" /> Filtered
              </Badge>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No transactions found</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-22rem)]">
              <div className="divide-y divide-border">
                {filtered.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/50"
                  >
                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${t.category.color}20`, color: t.category.color }}
                    >
                      {t.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : t.type === 'expense' ? (
                        <ArrowDownRight className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.item_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t.category.name}</span>
                        <span>·</span>
                        <span>{formatDate(t.date)}</span>
                      </div>
                    </div>

                    {/* Payment method badge */}
                    <PaymentMethodBadge method={t.payment_method} />

                    {/* Amount */}
                    <div className={cn(
                      'shrink-0 text-right text-sm font-semibold',
                      t.type === 'expense' ? 'text-red-500' : t.type === 'income' ? 'text-sky-500' : 'text-green-500'
                    )}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(Number(t.amount), currency)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

function StatCard({
  label,
  amount,
  icon: Icon,
  color,
  bg,
  prefix,
}: {
  label: string;
  amount: number;
  icon: typeof Wallet;
  color: string;
  bg: string;
  prefix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 p-4 shadow-premium">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', bg, color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-lg font-bold', color)}>
          {prefix}{formatCurrency(amount, 'INR')}
        </p>
      </Card>
    </motion.div>
  );
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const config = {
    cash: { icon: Wallet, label: 'Cash', cls: 'bg-amber-500/10 text-amber-600' },
    card: { icon: CreditCard, label: 'Card', cls: 'bg-blue-500/10 text-blue-600' },
    upi: { icon: Smartphone, label: 'UPI', cls: 'bg-violet-500/10 text-violet-600' },
  };
  const { icon: Icon, label, cls } = config[method];
  return (
    <span className={cn('hidden items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex', cls)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
