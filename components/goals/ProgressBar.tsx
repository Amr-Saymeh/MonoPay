// components/goals/ProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
}

export const ProgressBar = ({ progress, color = '#FFFFFF' }: ProgressBarProps) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${clampedProgress * 100}%`,
              backgroundColor: color,
            }
          ]} 
        />
      </View>
      <Text style={styles.percentage}>
        {Math.round(clampedProgress * 100)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});
