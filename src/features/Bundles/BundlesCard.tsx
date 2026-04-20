import React from 'react';
import { View, Text, Button } from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { useI18n } from "@/hooks/use-i18n";   
import EditCard from './EditCard';

export default function BundlesCard({ searchQuery = '' }: { searchQuery?: string }) {
    const { t } = useI18n() as any;
    const [bundles, setBundles] = React.useState<any[]>([]);
    const [editingBundleId, setEditingBundleId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const bundlesRef = ref(db, 'Bundles');
        const unsubscribe = onValue(bundlesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bundlesList = Object.entries(data).map(([id, value]: [string, any]) => ({
                    id,
                    ...value
                }));
                setBundles(bundlesList);
            } else {
                setBundles([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const filteredBundles = bundles.filter(bundle => 
        bundle.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View>
            {filteredBundles.map((bundle: any) => (
                <View key={bundle.id} style={{ marginBottom: 20, padding: 15, borderRadius: 10, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{bundle.name}</Text>
                    
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: '600', color: '#555', marginBottom: 3 }}>
                            {t("items")} ({bundle.items?.length || 0}):
                        </Text>
                        {(bundle.items || []).map((item: any, index: number) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, marginVertical: 2 }}>
                                <Text style={{ color: '#444' }}>- {item.name}</Text>
                                <Text style={{ fontWeight: '500' }}>{item.price} {item.currency}</Text>
                            </View>
                        ))}
                        {(!bundle.items || bundle.items.length === 0) && (
                            <Text style={{ fontStyle: 'italic', color: '#999', paddingLeft: 10 }}>{t("noItemsInBundle")}</Text>
                        )}
                    </View>

                    <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }}>
                            {t("totalCost")}: {bundle.totalPrice || 0}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Button title={t("edit")} onPress={() => setEditingBundleId(bundle.id === editingBundleId ? null : bundle.id)} />
                            <Button title={t("delete")} color="#e74c3c" onPress={() => { remove(ref(db, 'Bundles/' + bundle.id)); }} />
                        </View>
                    </View>

                    {editingBundleId === bundle.id && (
                        <View style={{ marginTop: 15 }}>
                            <EditCard bundle={bundle} onComplete={() => setEditingBundleId(null)} />
                        </View>
                    )}
                </View>
            ))}

            {filteredBundles.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#999' }}>{t("noBundlesFound")}</Text>
                </View>
            )}
        </View>
    );
}