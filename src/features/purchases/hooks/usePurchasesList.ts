import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { PurchaseItem } from '../types';

export function usePurchasesList() {
  const { t } = useI18n() as any;
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const purchasesRef = ref(db, 'purchases');
    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPurchases([]);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const items: PurchaseItem[] = [];

      snapshot.forEach((child) => {
        const val = child.val();
        const itemDate = val.createdAt?.split('T')[0];
        if (itemDate === today) {
          items.push({ id: child.key!, ...val });
        }
      });

      items.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPurchases(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (item: PurchaseItem) => {
    Alert.alert(
      t('deletePurchase'),
      `${t('deleteWalletConfirmMessage')} "${item.title}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(db, `purchases/${item.id}`));
            } catch (error) {
              Alert.alert(t('error'), t('uploadFailed'));
            }
          },
        },
      ]
    );
  };

  return {
    purchases,
    loading,
    handleDelete,
  };
}
