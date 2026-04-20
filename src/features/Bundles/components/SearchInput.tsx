import React from 'react';
import { View, TextInput } from 'react-native';
import { BundlesStyles as styles } from '../styles';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
}

export default function SearchInput({ value, onChangeText }: SearchInputProps) {
    return (
        <View style={styles.searchContainer}>
            <Ionicons 
                name="search-outline" 
                size={20} 
                color="#8E8E93" 
                style={styles.searchIcon} 
            />
            <TextInput 
                style={styles.searchInput}
                placeholder="Search your bundles..."
                placeholderTextColor="#8E8E93"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}
