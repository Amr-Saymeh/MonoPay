import { StyleSheet, Dimensions } from 'react-native';
import { THEME } from './constants';

const { width } = Dimensions.get('window');

export const BundlesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: -5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
   fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: -10,
    marginBottom:10,
    textAlign: 'left',
    paddingHorizontal: 15,
    paddingVertical: 1,
    
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.secondaryText,
    lineHeight: 20,
    marginBottom: 16,
  },
  // Action Button
  createButton: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Search Input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 52,
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.text,
  },
  // Bundle Card Common
  cardWrapper: {
    marginBottom: 25,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardInner: {
    padding: 20,
    minHeight: 250,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bundleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bundleIcon: {
    fontSize: 28,
  },
  bundleInfo: {
    flex: 1,
  },
  bundleTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  bundleBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  // Action Icons
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    padding: 5,
  },
  // Radio Buttons for Currency
  radioGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  radioButtonSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  radioText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.secondaryText,
  },
  radioTextSelected: {
    color: '#FFFFFF',
  },
  // Item Row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.08)', // For dark theme
  },
  itemRowLight: {
    backgroundColor: '#F8F9FA', // For light theme
  },
  itemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Footer
  cardFooter: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.primary,
  },
  // Variants
  lightTheme: {
    backgroundColor: THEME.cardLight,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  purpleTheme: {
    backgroundColor: THEME.cardPurple,
  },
  // Text Colors for themes
  textLight: {
    color: '#FFFFFF',
  },
  textDark: {
    color: THEME.text,
  },
  textSecondaryLight: {
    color: 'rgba(255,255,255,0.7)',
  },
  textSecondaryDark: {
    color: THEME.secondaryText,
  },
  // Category Selection
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.secondaryText,
    marginBottom: 10,
    marginTop: 15,
  },
  categoryScroll: {
    paddingBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  categoryChipSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  categoryChipIcon: {
    fontSize: 15,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.secondaryText,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.secondaryText,
    fontStyle: 'italic',
  },

  // Dark Mode Unified Styles
  darkBackground: {
    backgroundColor: '#000',
  },
  darkText: {
    color: '#ECEDEE',
  },
  darkSecondaryText: {
    color: 'rgba(236, 237, 238, 0.6)',
  },
  darkCard: {
    backgroundColor: '#0f0f14',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  whiteText: {
    color: '#fff',
  },
  darkHeaderTitle: {
    color: '#a78bfa',
  }
});
