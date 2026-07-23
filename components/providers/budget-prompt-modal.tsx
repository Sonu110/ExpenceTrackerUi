'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, X, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/lib/store';
import { useCategories } from '@/hooks/use-data';
import { dummyStore } from '@/lib/dummy-store';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

const STORAGE_KEY = 'fintrack-budget-prompt-answered';

export function BudgetPromptModal() {
  const { currency } = useSettingsStore();
  const { categories } = useCategories();
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState('');
  const [step, setStep] = useState<'ask' | 'enter'>('ask');

  useEffect(() => {
    const answered = localStorage.getItem(STORAGE_KEY);
    if (!answered) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const currentTotalBudget = categories
    .filter((c) => c.type === 'expense' && c.budget_limit)
    .reduce((sum, c) => sum + (c.budget_limit || 0), 0);

  const handleYes = () => setStep('enter');

  const handleSubmit = () => {
    const amount = parseFloat(budget);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    const expenseCats = categories.filter((c) => c.type === 'expense');
    if (expenseCats.length === 0) {
      toast.error('No expense categories found');
      return;
    }

    const perCategory = Math.round(amount / expenseCats.length);
    expenseCats.forEach((cat) => {
      dummyStore.updateCategory(cat.id, { budget_limit: perCategory });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ budget: amount, date: new Date().toISOString() }));
    toast.success(`Monthly budget set to ${formatCurrency(amount, currency)}`);
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ skipped: true, date: new Date().toISOString() }));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="gradient-primary p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">Monthly Budget</DialogTitle>
              <DialogDescription className="text-white/80">
                {currentTotalBudget > 0
                  ? `Current: ${formatCurrency(currentTotalBudget, currency)}`
                  : 'Set up your spending limit'}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'ask' ? (
              <motion.div
                key="ask"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-base font-semibold">
                    Would you like to increase your monthly budget?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Setting a monthly budget helps you track spending and stay on top of your
                    financial goals.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handleYes} className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Yes, increase my budget
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSkip} className="flex-1">
                      Skip for now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="enter"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Enter your monthly budget</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    placeholder="e.g. 50000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="text-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be distributed across your {categories.filter((c) => c.type === 'expense').length} expense categories.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStep('ask')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    Submit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <button
                  onClick={handleSkip}
                  className="w-full pt-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip and stick with current budget
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
