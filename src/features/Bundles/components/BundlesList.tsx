import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Bundle, BundleCardProps } from '../types';
import BundleCardItem from './BundleCardItem';
import { BundlesStyles as styles } from '../styles';
import { THEME } from '../constants';

interface BundlesListProps {
  bundles: Bundle[];
  loading: boolean;
  onEdit: (bundle: Bundle) => void;
  onDelete: (id: string) => void;
}

export default function BundlesList({ bundles, loading, onEdit, onDelete }: BundlesListProps) {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (bundles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bundles found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {bundles.map((bundle, index) => (
        <BundleCardItem 
          key={bundle.id} 
          bundle={{
            ...bundle,
            theme: index % 2 === 0 ? 'light' : 'purple'
          }} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </View>
  );
}
