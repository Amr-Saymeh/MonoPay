import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, I18nManager, Keyboard, Animated } from 'react-native';
import { Controller } from 'react-hook-form';
import { useI18n } from "@/hooks/use-i18n";
import { FormStyles as styles, ToastStyles as toastStyles, DarkThemeStyles } from '../styles';
import { CATEGORIES } from '../constants';
import { PurchaseFormProps, ToastProps, Currency } from '../types';
import { useThemeMode } from '@/src/providers/ThemeModeProvider';

function Toast({ visible, message }: ToastProps) {
  const opacity = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[toastStyles.toast, { opacity }]}>
      <Text style={toastStyles.toastIcon}>✅</Text>
      <Text style={toastStyles.toastText}>{message}</Text>
    </Animated.View>
  );
}

export default function PurchaseForm({
  onSubmit,
  loading,
  visibleToast,
  suggestions,
  control,
  errors,
  setValue,
  selectedCurrency,
}: PurchaseFormProps) {
  const { t, locale } = useI18n() as any;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';
  const isRtl = locale === 'ar' || I18nManager.isRTL;

  return (
    <View style={styles.container}>
      <Toast visible={visibleToast} message={t('purchaseAdded')} />

      <Text style={[styles.label, isRtl && { textAlign: 'right' }, isDark && DarkThemeStyles.darkLabel]}>{t('addNewPurchase')}</Text>

      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          name="name"
          rules={{ required: t('fieldRequired') }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder={t('name')}
                value={value}
                onChangeText={onChange}
                style={[styles.input, isRtl && { textAlign: 'right' }]}
              />
              {suggestions.length > 0 && (
                <View style={styles.quickSuggestionsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
                    {suggestions.map((item, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={[styles.suggestionChip, item.isBundle && styles.bundleSuggestionChip]}
                        onPress={() => {
                          setValue('name', item.name);
                          if (item.cost) setValue('cost', item.cost);
                          if (item.currency) setValue('currency', item.currency);
                          if (item.category) setValue('category', item.category);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={[styles.suggestionChipText, item.isBundle && styles.bundleSuggestionChipText]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        />
        {errors.name && <Text style={[styles.error, isRtl && { textAlign: 'right' }]}>{errors.name.message as string}</Text>}
      </View>

      <View style={[styles.row, isRtl && { flexDirection: 'row-reverse' }]}>
        <Controller
          control={control}
          name="cost"
          rules={{ required: t('fieldRequired') }}
          render={({ field: { onChange, value } }) => (
            <View style={{ flex: 2 }}>
              <TextInput
                placeholder={selectedCurrency === 'USD' ? '$0.00' : selectedCurrency === 'JOD' ? 'JD 0.00' : '₪ 0.00'}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={[styles.input, isRtl && { textAlign: 'right' }]}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.radioGroup, isRtl && { flexDirection: 'row-reverse' }]}>
              {(['NIS', 'USD', 'JOD'] as Currency[]).map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => onChange(cur)}
                  style={[styles.radioButton, value === cur && styles.radioButtonSelected]}
                >
                  <Text style={[styles.radioText, value === cur && styles.radioTextSelected]}>{cur}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      <Text style={[styles.categoryTitle, isRtl && { textAlign: 'right' }, isDark && DarkThemeStyles.darkLabel]}>{t('category')}</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.labelKey}
                onPress={() => onChange(cat.labelKey)}
                style={[styles.categoryChip, value === cat.labelKey && styles.categoryChipSelected]}
              >
                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryChipText, value === cat.labelKey && styles.categoryChipTextSelected]}>
                  {t(cat.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      />

      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>{t('addPurchase')}</Text>}
      </TouchableOpacity>
    </View>
  );
}
