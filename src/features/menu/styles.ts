import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 40,
    marginBottom: 40,
    textAlign: 'left',
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  backButton: {
    position: 'absolute',
    top: 65,
    left: 20,
    zIndex: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },
  // Dark Mode Unified Styles
  darkScreen: {
    backgroundColor: '#000',
  },
  darkHeaderTitle: {
    color: '#a78bfa',
  },
  darkItem: {
    backgroundColor: '#0f0f14',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  darkItemTitle: {
    color: '#fff',
  },
  darkItemSubtitle: {
    color: 'rgba(255,255,255,0.5)',
  },
  darkIconContainer: {
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
  }
});
