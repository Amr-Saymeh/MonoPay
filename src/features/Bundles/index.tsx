import React, { useState } from 'react';
import { ScrollView, View, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useBundles } from './hooks/useBundles';
import { BundlesStyles as styles } from './styles';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

// Components
import BundlesHeader from './components/BundlesHeader';
import SearchInput from './components/SearchInput';
import BundlesList from './components/BundlesList';
import CreateBundleForm from './components/CreateBundleForm';
import { Bundle } from './types';

export default function BundlesFeature() {
    const { 
        bundles, 
        loading, 
        searchQuery, 
        setSearchQuery, 
        handleDelete 
    } = useBundles();

    const { colorScheme } = useThemeMode();
    const isDark = colorScheme === 'dark';

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);

    const handleCreateNew = () => {
        setEditingBundle(null);
        setShowCreateForm(true);
    };

    const handleEdit = (bundle: Bundle) => {
        setEditingBundle(bundle);
        setShowCreateForm(true);
    };

    const handleFormComplete = () => {
        setShowCreateForm(false);
        setEditingBundle(null);
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            'Delete Bundle',
            'Are you sure you want to delete this bundle?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: () => handleDelete(id) 
                }
            ]
        );
    };

    return (
        <ScrollView 
            style={[styles.container, isDark && styles.darkBackground]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
        >
            {/* Header section includes "My Bundles" and "Create New Bundle" button */}
            <BundlesHeader 
                onCreateNew={handleCreateNew} 
                onBack={() => router.back()}
            />
            
            {/* Show Create/Edit Form if toggled */}
            {showCreateForm && (
                <View style={{ marginBottom: 30 }}>
                    <CreateBundleForm 
                        bundle={editingBundle}
                        onComplete={handleFormComplete} 
                        onCancel={handleFormComplete} 
                    />
                </View>
            )}

            {/* Stylized Search Bar */}
            <SearchInput 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
            />

            {/* List of Bundles with Light/Purple themes */}
            <BundlesList 
                bundles={bundles} 
                loading={loading} 
                onEdit={handleEdit} 
                onDelete={confirmDelete} 
            />
        </ScrollView>
    );
}
