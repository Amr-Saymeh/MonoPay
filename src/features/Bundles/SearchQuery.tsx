import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, ScrollView, StyleSheet } from 'react-native';
import BundlesCard from './BundlesCard';
import { ref, onValue } from 'firebase/database';
import { db } from '@/src/firebaseConfig';

export default function SearchQuery() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [bundles, setBundles] = React.useState<any[]>([]);

    React.useEffect(() => {
        const bundlesRef = ref(db, 'Bundles');
        // Listen for live updates from Firebase
        const unsubscribe = onValue(bundlesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Map Firebase object to array of bundles
                const bundleList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setBundles(bundleList);
            } else {
                setBundles([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Filter bundles based on search query
    const filteredBundlesName = bundles
        .filter(bundle => bundle.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(bundle => bundle.name);

    // Get unique bundle names for quick suggestions (limit to 10)
    const quickSuggestions = Array.from(new Set(bundles.map(b => b.name))).slice(0, 10);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search Bundles</Text>
            
            <TextInput 
                style={styles.searchInput} 
                placeholder="Type bundle name..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* Quick Suggestions Chips */}
            {quickSuggestions.length > 0 && searchQuery === '' && (
                <View style={styles.quickSuggestionsContainer}>
                    <Text style={styles.suggestionLabel}>Popular Bundles:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
                        {quickSuggestions.map((name, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.suggestionChip}
                                onPress={() => {
                                    setSearchQuery(name);
                                    Keyboard.dismiss();
                                }}
                            >
                                <Text style={styles.suggestionChipText}>{name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Quick Results List (when typing) */}
            {searchQuery.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsLabel}>Quick Results:</Text>
                    {bundles
                        .filter(bundle => bundle.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 5) // Show only first 5 in quick view
                        .map((bundle) => (
                        <TouchableOpacity 
                            key={bundle.id} 
                            style={styles.resultItem}
                            onPress={() => {
                                setSearchQuery(bundle.name);
                                Keyboard.dismiss();
                            }}
                        >
                            <Text style={styles.resultText}>• {bundle.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {bundles.filter(bundle => bundle.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <Text style={styles.noResultsText}>No bundles found.</Text>
                    ) }
                </View>
            )}

            {/* Main Bundles Card/List */}
            <BundlesCard searchQuery={searchQuery} />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { 
    marginTop: 20, 
    paddingHorizontal: 15 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#1A1A1A'
  },
  searchInput: { 
    borderBottomWidth: 1, 
    borderColor: '#E1E2E7', 
    paddingVertical: 12, 
    marginBottom: 20, 
    fontSize: 16,
    color: '#1A1A1A'
  },
  quickSuggestionsContainer: { 
    marginBottom: 25 
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '600'
  },
  suggestionChip: { 
    backgroundColor: '#4F00D0', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10,
    height: 38,
    justifyContent: 'center',
    shadowColor: '#4F00D0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  suggestionChipText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 13 
  },
  resultsContainer: { 
    marginBottom: 20, 
    backgroundColor: '#F8F9FA', 
    padding: 15, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF'
  },
  resultsLabel: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginBottom: 10,
    fontWeight: '600'
  },
  resultItem: { 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E8ECEF' 
  },
  resultText: { 
    fontSize: 16,
    color: '#1A1A1A'
  },
  noResultsText: {
    color: '#6B7280',
    fontStyle: 'italic'
  },
  // Keep original styles requested or previously present
  row:                  { flexDirection: 'row', gap: 10, marginBottom: 15 },
  error:                { color: 'red', fontSize: 12, marginTop: 4 },
  radioGroup:           { flex: 1.5, flexDirection: 'row', gap: 6 },
  radioButton:          { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#E1E2E7', alignItems: 'center', justifyContent: 'center' },
  radioButtonSelected:  { backgroundColor: '#4F00D0' },
  radioText:            { fontSize: 13, fontWeight: '600', color: '#555' },
  radioTextSelected:    { color: '#fff' },
  categoryTitle:            { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 10 },
  categoryScroll:           { paddingBottom: 12 },
  categoryChip:             { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 30, backgroundColor: '#E1E2E7', marginRight: 8 },
  categoryChipSelected:     { backgroundColor: '#EDE7FF', borderColor: '#7C4DFF', borderWidth: 1.5 },
  categoryChipIcon:         { fontSize: 15 },
  categoryChipText:         { fontSize: 13, fontWeight: '600', color: '#555' },
  categoryChipTextSelected: { color: '#7C4DFF' },
  addButton:         { backgroundColor: '#4F00D0', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  addButtonDisabled: { backgroundColor: '#a38eff' },
  addButtonText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});