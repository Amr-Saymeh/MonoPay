import { useState, useEffect, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { useForm } from 'react-hook-form';
import { ref, push, set, onValue } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { FormValues, Currency, SuggestionItem } from '../types';

export function usePurchasesForm(
  dailyBudgetNIS: number,
  totalSpentNIS: number,
  toNIS: (amount: number, currency: Currency) => number,
  onSuccessAction?: () => void, 
  onErrorAction?: () => void
) {
  const [visibleToast, setVisibleToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pastPurchases, setPastPurchases] = useState<SuggestionItem[]>([]);
  const [availableBundles, setAvailableBundles] = useState<SuggestionItem[]>([]);
  
  // For Budget Warning
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [pendingData, setPendingData] = useState<FormValues | null>(null);
  const [projectedTotal, setProjectedTotal] = useState(0);

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      cost: '',
      currency: 'NIS',
      category: 'shopping',
    },
  });

  const nameInput = watch('name');
  const selectedCurrency = watch('currency') as Currency;

  useEffect(() => {
    const purchasesRef = ref(db, 'purchases');
    const bundlesRef = ref(db, 'Bundles');

    const unsubPurchases = onValue(purchasesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      const items = Object.values(data).map((item: any) => ({
        name: item.title,
        cost: item.amount?.toString(),
        currency: item.currency as Currency,
        category: item.category,
      })).filter(i => i.name && typeof i.name === 'string');
      
      // Keep only unique names, prefer most recent
      const unique = Array.from(new Map(items.map(i => [i.name, i])).values());
      setPastPurchases(unique);
    });

    const unsubBundles = onValue(bundlesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      const items = Object.values(data).map((item: any) => ({
        name: item.name,
        cost: item.totalPrice?.toString(),
        currency: (item.items?.[0]?.currency || 'NIS') as Currency,
        category: item.items?.[0]?.category || 'shopping',
        isBundle: true,
      })).filter(i => i.name && typeof i.name === 'string');
      
      setAvailableBundles(items);
    });

    return () => {
      unsubPurchases();
      unsubBundles();
    };
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!nameInput || typeof nameInput !== 'string' || nameInput.trim() === '') return [];
    
    const combined = [...availableBundles, ...pastPurchases];
    const uniqueMap = new Map();
    combined.forEach(item => {
      if (!uniqueMap.has(item.name.toLowerCase())) {
        uniqueMap.set(item.name.toLowerCase(), item);
      }
    });

    return Array.from(uniqueMap.values())
      .filter(item =>
        item.name.toLowerCase().includes(nameInput.toLowerCase()) && 
        item.name.toLowerCase() !== nameInput.toLowerCase()
      )
      .slice(0, 6);
  }, [nameInput, pastPurchases, availableBundles]);

  const performSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const now = new Date();
      await set(push(ref(db, 'purchases')), {
        title: data.name.trim(),
        amount: parseFloat(data.cost),
        currency: data.currency,
        category: data.category,
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        createdAt: now.toISOString(),
        isBundle: false,
      });

      setVisibleToast(true);
      setTimeout(() => setVisibleToast(false), 1500);

      reset();
      setShowBudgetAlert(false);
      setPendingData(null);
      Keyboard.dismiss();
      if (onSuccessAction) onSuccessAction();
    } catch (e) {
      console.error(e);
      if (onErrorAction) onErrorAction();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (!data.name.trim() || !data.cost) {
      if (onErrorAction) onErrorAction();
      return;
    }

    const newAmountNIS = toNIS(parseFloat(data.cost), data.currency);
    const newTotal = totalSpentNIS + newAmountNIS;

    if (dailyBudgetNIS > 0 && newTotal > dailyBudgetNIS) {
      setPendingData(data);
      setProjectedTotal(newTotal);
      setShowBudgetAlert(true);
      return;
    }

    performSubmit(data);
  };

  return {
    control,
    errors,
    setValue,
    selectedCurrency,
    loading,
    visibleToast,
    suggestions: filteredSuggestions,
    onSubmit: handleSubmit(onSubmit),
    // Budget Alert related
    showBudgetAlert,
    setShowBudgetAlert,
    projectedTotal,
    confirmBudgetWarning: () => pendingData && performSubmit(pendingData),
  };
}
