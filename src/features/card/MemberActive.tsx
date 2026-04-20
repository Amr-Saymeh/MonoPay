import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AVATAR_COLORS, CARD_BG } from './Styles';

interface MemberActiveProps {
  memberUids: string[];
}

const MAX_VISIBLE = 3;

export function MemberActive({ memberUids }: MemberActiveProps) {
  const visible = Math.min(memberUids.length, MAX_VISIBLE);
  const overflow = memberUids.length - visible;

  return (
    <View style={styles.stack}>
      {Array.from({ length: visible }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.avatar,
            {
              backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
              marginLeft: i === 0 ? 0 : -8,
            },
          ]}
        >
          <Text style={styles.avatarText}>
            {memberUids[i].slice(0, 2).toUpperCase()}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={[styles.avatar, styles.avatarOverflow, { marginLeft: -8 }]}>
          <Text style={styles.avatarOverflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  avatarOverflow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarOverflowText: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
});