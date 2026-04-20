import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BundlesStyles as styles } from '../styles';
import { Ionicons } from '@expo/vector-icons';
import { THEME, CATEGORIES, CURRENCY_SYMBOL } from '../constants';
import { useBundlesForm } from '../hooks/useBundlesForm';
import { Bundle } from '../types';
import { useI18n } from '@/hooks/use-i18n';

interface CreateBundleFormProps {
    onComplete: () => void;
    onCancel: () => void;
    bundle?: Bundle | null;
}

export default function CreateBundleForm({ onComplete, onCancel, bundle }: CreateBundleFormProps) {
    const { t } = useI18n() as any;
    const {
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
        totalPrice
    } = useBundlesForm(onComplete, bundle);

    const [showAddItem, setShowAddItem] = useState(false);

    return (
        <View style={[styles.cardWrapper, { backgroundColor: '#FFFFFF', padding: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: THEME.text }}>
                    {bundle ? t('editBundle') : t('createNewBundle')}
                </Text>
                <TouchableOpacity onPress={onCancel}>
                    <Ionicons name="close-circle" size={28} color="#D1D1D6" />
                </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: THEME.secondaryText, marginBottom: 8 }}>{t('bundleName')}</Text>
                <TextInput 
                    style={{ backgroundColor: '#F2F2F7', padding: 14, borderRadius: 12, fontSize: 16 }}
                    placeholder={t('bundleNamePlaceholder')}
                    value={bundleName}
                    onChangeText={setBundleName}
                />
            </View>

            {/* Items List */}
            {items.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: THEME.secondaryText, marginBottom: 10 }}>{t('items')}</Text>
                    {items.map((item, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, marginBottom: 8 }}>
                            <Text style={{ flex: 1, fontWeight: '600' }}>{item.name}</Text>
                            <Text style={{ fontWeight: '700', marginRight: 15 }}>
                                {CURRENCY_SYMBOL[item.currency] || ''}{Number(item.price || 0).toFixed(2)}
                            </Text>
                            <TouchableOpacity onPress={() => removeItem(index)}>
                                <Ionicons name="trash" size={18} color={THEME.delete} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Add Item Form Toggle */}
            <TouchableOpacity 
                onPress={() => setShowAddItem(!showAddItem)}
                style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: '#F2F2F7', 
                    padding: 15, 
                    borderRadius: 16, 
                    marginBottom: showAddItem ? 10 : 25 
                }}
            >
                <Text style={{ fontSize: 13, fontWeight: '800', color: THEME.primary }}>
                    {showAddItem ? t('cancelAdding') : t('addItemToBundle')}
                </Text>
                <Ionicons name={showAddItem ? "chevron-up" : "chevron-down"} size={20} color={THEME.primary} />
            </TouchableOpacity>

            {showAddItem && (
                <View style={{ backgroundColor: '#F2F2F7', padding: 15, borderRadius: 16, marginBottom: 25, marginTop: -5 }}>
                    <TextInput 
                        style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 10 }}
                        placeholder={t('itemNamePlaceholder')}
                        value={itemName}
                        onChangeText={setItemName}
                    />
                    
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15, alignItems: 'center' }}>
                        <TextInput 
                            style={{ flex: 1.2, backgroundColor: '#FFF', padding: 12, borderRadius: 10 }}
                            placeholder={t('price')}
                            keyboardType="numeric"
                            value={itemPrice}
                            onChangeText={setItemPrice}
                        />
                        <View style={styles.radioGroup}>
                            {(['NIS', 'USD', 'JOD'] as const).map((cur) => (
                                <TouchableOpacity
                                    key={cur}
                                    onPress={() => setItemCurrency(cur)}
                                    style={[
                                        styles.radioButton,
                                        itemCurrency === cur && styles.radioButtonSelected
                                    ]}
                                >
                                    <Text style={[
                                        styles.radioText,
                                        itemCurrency === cur && styles.radioTextSelected
                                    ]}>
                                        {cur}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Category Selection */}
                    <Text style={styles.categoryTitle}>{t('category')}</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.categoryScroll}
                    >
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.labelKey}
                                onPress={() => setItemCategory(cat.labelKey)}
                                style={[
                                    styles.categoryChip, 
                                    itemCategory === cat.labelKey && styles.categoryChipSelected
                                ]}
                            >
                                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                                <Text style={[
                                    styles.categoryChipText, 
                                    itemCategory === cat.labelKey && styles.categoryChipTextSelected
                                ]}>
                                    {t(cat.labelKey)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity 
                        style={{ backgroundColor: THEME.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 }}
                        onPress={() => {
                            handleAddItem();
                            setShowAddItem(false);
                        }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '700' }}>{t('confirmItem')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Footer */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.secondaryText }}>{t('totalCost')}</Text>
                    <Text style={{ fontSize: 26, fontWeight: '900', color: THEME.primary }}>₪{Number(totalPrice).toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity 
                    style={[styles.createButton, { marginBottom: 0, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.createButtonText}>
                            {bundle ? t('updateBundle') : t('confirmCreateBundle')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
