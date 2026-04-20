import { StyleSheet } from 'react-native';
import { THEME, DELETE_BTN_WIDTH } from './constants';

export const DailyTotalCardStyles = StyleSheet.create({
  container:        { marginHorizontal: 16, marginVertical: 12, borderRadius: 40, overflow: 'hidden', elevation: 8 , marginTop: 50},
  gradient:         { minHeight: 220, borderRadius: 40, position: 'relative' },
  content:          { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 30, zIndex: 3, alignItems: 'flex-start' },
  circleTopRight:   { position: 'absolute', top: -60, right: -43, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.04)' },
  circleBottomLeft: { position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4 },
  label:            { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, textTransform: 'uppercase' },
  ratesBtn:         { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  ratesBtnText:     { color: '#fff', fontSize: 12, fontWeight: '700' },
  amount:           { fontSize: 42, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  badge:            { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 2 },
  badgeText:        { fontSize: 11, fontWeight: '700', color: '#fff' },
  editButton:       { flex: 1, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  editButtonText:   { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  actionRow:        { flexDirection: 'row', gap: 10, marginTop: 15, width: '100%' },
  bundleActionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  bundleActionText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 30,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 15,
    paddingVertical: 1,
  },
  backButton: {
    position: 'absolute',
    top: 5,
    left: 10,
    zIndex: 10,
  },
});

export const RatesModalStyles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:      { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:       { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub:         { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  grid:        { flexDirection: 'row', gap: 10, marginBottom: 20 },
  card:        { flex: 1, backgroundColor: '#f5f3ff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  flag:        { fontSize: 24 },
  pair:        { fontSize: 13, fontWeight: '700', color: '#555' },
  value:       { fontSize: 14, fontWeight: '800', color: THEME.primary },
  errorBox:    { backgroundColor: '#fff3f3', borderRadius: 12, padding: 14, marginBottom: 16 },
  errorText:   { color: THEME.danger, textAlign: 'center', fontSize: 13 },
  refreshBtn:  { backgroundColor: '#f5f3ff', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  refreshText: { color: THEME.primary, fontWeight: '700' },
  closeBtn:    { backgroundColor: THEME.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  closeText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export const BudgetModalStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '88%' },
  title:          { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub:            { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  currencyRow:    { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
  curBtn:         { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#f0f0f0' },
  curBtnActive:   { backgroundColor: THEME.primary },
  curLabel:       { fontWeight: '700', color: '#555', fontSize: 13 },
  curLabelActive: { color: '#fff' },
  inputRow:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 },
  symbol:         { fontSize: 22, color: THEME.primary, marginRight: 8, fontWeight: '700' },
  input:          { flex: 1, fontSize: 28, fontWeight: '700', paddingVertical: 14, color: '#1c1c1e' },
  preview:        { backgroundColor: '#f5f3ff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 12, alignItems: 'center' },
  previewText:    { color: THEME.primary, fontWeight: '600', fontSize: 13 },
  btnRow:         { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:      { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
  saveBtn:        { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: THEME.primary, alignItems: 'center' },
  cancelLabel:    { color: '#333', fontWeight: '700' },
  saveLabel:      { color: '#fff', fontWeight: '700' },
});

export const WarningModalStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 32, padding: 24, width: '90%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
  iconBox:        { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FFE5E5' },
  icon:           { fontSize: 40 },
  title:          { fontSize: 22, fontWeight: '900', color: THEME.danger, marginBottom: 12, textAlign: 'center' },
  message:        { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
  statsBox:       { width: '100%', backgroundColor: '#F8F9FA', borderRadius: 20, padding: 16, marginBottom: 24 },
  statRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel:      { fontSize: 13, color: '#666', fontWeight: '600' },
  statValue:      { fontSize: 13, color: '#111', fontWeight: '700' },
  divider:        { height: 1, backgroundColor: '#EEE', marginVertical: 8 },
  totalLabel:     { fontSize: 14, color: THEME.danger, fontWeight: '800' },
  totalValue:     { fontSize: 16, color: THEME.danger, fontWeight: '900' },
  btnCol:         { width: '100%', gap: 12 },
  saveBtn:        { width: '100%', backgroundColor: THEME.success || '#4CAF50', paddingVertical: 16, borderRadius: 18, alignItems: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
  proceedBtn:     { width: '100%', paddingVertical: 12, alignItems: 'center' },
  proceedBtnText: { color: '#888', fontWeight: '600', fontSize: 14, textDecorationLine: 'underline' },
});

export const FormStyles = StyleSheet.create({
  container:   { padding: 20 },
  inputWrapper: { marginBottom: 15 },
  label:       { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 15 },
  input:       { padding: 14, borderRadius: 15, backgroundColor: '#E1E2E7', borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  quickSuggestionsContainer: { marginTop: 8, height: 40 },
  suggestionChip: { 
    backgroundColor: '#4F00D0', 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    justifyContent: 'center', 
    marginRight: 8,
    height: 34,
  },
  suggestionChipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  bundleSuggestionChip: { backgroundColor: '#FF9500' }, // Premium Orange/Gold for Bundles
  bundleSuggestionChipText: { color: '#000', fontWeight: '700' },
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

export const ToastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e1e2e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  toastIcon: { fontSize: 16 },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export const PurchaseCardStyles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  deleteBackground: {
    width: DELETE_BTN_WIDTH,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    height: '100%',
  },
  deleteAction: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 17.5,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  bundleBadge: {
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  bundleText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13.8,
    color: '#8e8e93',
    marginTop: 3,
  },
  amountContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  amount: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1c1c1e',
  },
});

export const PurchaseListStyles = StyleSheet.create({
  listContainer: {
    paddingBottom: 30
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  darkEmptyText: {
    color: 'rgba(236, 237, 238, 0.4)',
  }
});

// Dark Mode Unified Styles (appended)
export const DarkThemeStyles = {
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
  darkInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  darkHeaderTitle: {
    color: '#a78bfa',
  },
  darkLabel: {
    color: '#a78bfa',
  }
};
