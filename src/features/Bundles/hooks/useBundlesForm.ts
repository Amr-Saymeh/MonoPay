import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, push, set, onValue } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { Bundle, BundleItem } from '../types';

export function useBundlesForm(
  onComplete: () => void,
  initialBundle: Bundle | null = null
) {
  const [bundleName, setBundleName] = useState(initialBundle?.name || '');
  const [items, setItems] = useState<BundleItem[]>(initialBundle?.items || []);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCurrency, setItemCurrency] = useState('NIS');
  const [itemCategory, setItemCategory] = useState('foodDrinks');
  const [loading, setLoading] = useState(false);
  const [allBundles, setAllBundles] = useState<Bundle[]>([]);

  useEffect(() => {
    const bundlesRef = ref(db, 'Bundles');
    const unsubscribe = onValue(bundlesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bundleList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAllBundles(bundleList);
      }
    });
    return () => unsubscribe();
  }, []);

  const suggestions = allBundles
    .map(b => b.name)
    .filter(name => name.toLowerCase().includes(bundleName.toLowerCase()) && name !== bundleName)
    .slice(0, 5);

  const itemSuggestions = allBundles
    .flatMap(b => b.items || [])
    .map(i => i.name)
    .filter(name => name.toLowerCase().includes(itemName.toLowerCase()) && name !== itemName)
    .filter((v, i, a) => a.indexOf(v) === i) // Unique
    .slice(0, 5);

  // Re-sync if initialBundle changes (e.g. switching between different edits)
  useEffect(() => {
    if (initialBundle) {
      setBundleName(initialBundle.name);
      setItems(initialBundle.items || []);
    } else {
      setBundleName('');
      setItems([]);
    }
  }, [initialBundle]);

  const calculateTotal = (itemList: BundleItem[]) => {
    return itemList.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };

  const handleAddItem = () => {
    if (!itemName || !itemPrice) {
      Alert.alert('Missing Info', 'Please provide at least a name and price.');
      return;
    }
    
    const newItem: BundleItem = {
      name: itemName,
      price: parseFloat(itemPrice),
      currency: itemCurrency,
      category: itemCategory
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemPrice('');
    // Optionally reset category: setItemCategory('foodDrinks');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!bundleName) {
      Alert.alert('Error', 'Please enter a bundle name.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the bundle.');
      return;
    }

    setLoading(true);
    try {
      const bundleData = {
        name: bundleName,
        items: items,
        totalPrice: calculateTotal(items),
        recurring: initialBundle ? initialBundle.recurring : true,
        theme: initialBundle ? initialBundle.theme : (Math.random() > 0.5 ? 'purple' : 'light'),
        updatedAt: new Date().toISOString(),
        createdAt: initialBundle?.createdAt || new Date().toISOString()
      };

      if (initialBundle && initialBundle.id) {
        // Update existing
        await set(ref(db, `Bundles/${initialBundle.id}`), bundleData);
      } else {
        // Create new
        await push(ref(db, 'Bundles'), bundleData);
      }
      
      onComplete();
    } catch (error) {
      console.error('Firebase save error:', error);
      Alert.alert('Error', 'Failed to save bundle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    bundleName,
    setBundleName,
    items,
    itemName,
    setItemName,
    itemPrice,
    setItemPrice,
    itemCurrency,
    setItemCurrency,
    itemCategory,
    setItemCategory,
    loading,
    handleAddItem,
    removeItem,
    handleSubmit,
    totalPrice: calculateTotal(items),
    suggestions,
    itemSuggestions
  };
}
