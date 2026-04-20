import { StyleSheet } from 'react-native';

export const CARD_BG = '#0f0f14';
export const AVATAR_COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706'];

export const styles = StyleSheet.create({
  container: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    height: 240,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  glowTopRight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99,102,241,0.22)',
    top: -70,
    right: -50,
  },
  glowBottomLeft: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(139,92,246,0.14)',
    bottom: -40,
    left: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  emojiContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 16 },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    flex: 1,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  statusActive: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(74,222,128,0.25)',
  },
  statusInactive: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  // Balance
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.32)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  balance: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 8,
  },

  // Currency pill
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  currencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a78bfa',
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  currencyChevron: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },

  // Chips
  chips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  chip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: {
    width: 20,
    backgroundColor: '#a78bfa',
  },

  // Divider
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 5,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaBlock: { gap: 4 },
  metaBlockRight: { alignItems: 'flex-end' },
  metaLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
});