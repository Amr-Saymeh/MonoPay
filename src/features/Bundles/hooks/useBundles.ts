import React from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { Bundle } from '../types';

export function useBundles() {
    const [bundles, setBundles] = React.useState<Bundle[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        const bundlesRef = ref(db, 'Bundles');
        
        const unsubscribe = onValue(bundlesRef, (snapshot) => {
            setLoading(true);
            const data = snapshot.val();
            if (data) {
                const bundleList = Object.keys(data).map((key, index) => ({
                    id: key,
                    ...data[key],
                    // Alternate themes if not provided
                    theme: data[key].theme || (index % 2 === 0 ? 'light' : 'purple'),
                    icon: data[key].icon || (data[key].name?.toLowerCase().includes('routine') ? '☀️' : '🏋️‍♀️')
                }));
                setBundles(bundleList);
            } else {
                setBundles([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Firebase read error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredBundles = bundles.filter(bundle => 
        bundle.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        try {
            await remove(ref(db, `Bundles/${id}`));
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return {
        bundles: filteredBundles,
        allBundles: bundles,
        loading,
        searchQuery,
        setSearchQuery,
        handleDelete
    };
}
