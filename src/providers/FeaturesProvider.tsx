import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeaturesContextType {
    activeFeatures: string[];
    toggleFeature: (id: string) => void;
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

const STORAGE_KEY = '@monopay_active_features';

export const FeaturesProvider = ({ children }: { children: ReactNode }) => {
    const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        try {
            const storedFeatures = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedFeatures) {
                setActiveFeatures(JSON.parse(storedFeatures));
            } else {
                const defaults = ['1', '2', '3']; // Default selected features
                setActiveFeatures(defaults);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            }
        } catch (error) {
            console.error('Error loading features:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const toggleFeature = async (id: string) => {
        try {
            let updatedFeatures;
            if (activeFeatures.includes(id)) {
                updatedFeatures = activeFeatures.filter(featureId => featureId !== id);
            } else {
                if (activeFeatures.length >= 3) {
                    Alert.alert("Error", "You must select 3 features");
                    return;
                }
                updatedFeatures = [...activeFeatures, id];
            }
            setActiveFeatures(updatedFeatures);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFeatures));
        } catch (error) {
            console.error('Error toggling feature:', error);
        }
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <FeaturesContext.Provider value={{ activeFeatures, toggleFeature }}>
            {children}
        </FeaturesContext.Provider>
    );
};

export const useFeatures = () => {
    const context = useContext(FeaturesContext);
    if (context === undefined) {
        throw new Error('useFeatures must be used within a FeaturesProvider');
    }
    return context;
};
