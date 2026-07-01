import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

interface Props {
  tripName: string;
  setTripName: (name: string) => void;
  partner: string;
  budgetPercent: number;
  getBudgetValue: (percent: number) => string;
  handleSliderTouch: (event: any) => void;
  getFormattedRange: () => string;
  onOpenDatePicker: () => void;
  onOpenPartnerPicker: () => void;
  sliderTrackWidth: React.RefObject<number>;
}

export default function Step1Form({
  tripName,
  setTripName,
  partner,
  budgetPercent,
  getBudgetValue,
  handleSliderTouch,
  getFormattedRange,
  onOpenDatePicker,
  onOpenPartnerPicker,
  sliderTrackWidth,
}: Props) {
  return (
    <View style={styles.form}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Trip Name</Text>
        <TextInput
          placeholder="e.g. Summer Vacation in Ubud"
          placeholderTextColor={COLORS.gray400}
          value={tripName}
          onChangeText={setTripName}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Trip Dates (From - To)</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={onOpenDatePicker}
          activeOpacity={0.8}
        >
          <View style={styles.selectorLeft}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.gray500} style={styles.fieldIcon} />
            <Text style={[styles.selectorText, !getFormattedRange() && styles.placeholder]}>
              {getFormattedRange() || 'Select trip range'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.budgetHeader}>
          <Text style={styles.label}>Budget</Text>
          <Text style={styles.budgetValue}>{getBudgetValue(budgetPercent)}</Text>
        </View>
        
        <View 
          style={styles.sliderContainer}
          onLayout={(e) => {
            if (sliderTrackWidth) {
              (sliderTrackWidth as any).current = e.nativeEvent.layout.width;
            }
          }}
          onTouchStart={handleSliderTouch}
          onTouchMove={handleSliderTouch}
        >
          <View style={styles.sliderTrackBg}>
            <View style={[styles.sliderTrackFill, { width: `${budgetPercent}%` }]} />
          </View>
          <View 
            style={[
              styles.sliderThumb, 
              { left: `${Math.max(0, Math.min(96, budgetPercent))}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Traveling With</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={onOpenPartnerPicker}
          activeOpacity={0.8}
        >
          <View style={styles.selectorLeft}>
            <Ionicons name="people-outline" size={18} color={COLORS.gray500} style={styles.fieldIcon} />
            <Text style={[styles.selectorText, !partner && styles.placeholder]}>
              {partner || 'Select a your partner'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.brand950,
    backgroundColor: COLORS.white,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 10,
  },
  selectorText: {
    fontSize: 14,
    color: COLORS.brand950,
    fontWeight: '500',
  },
  placeholder: {
    color: COLORS.gray400,
    fontWeight: '400',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#196660',
  },
  sliderContainer: {
    height: 28,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  sliderTrackBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderTrackFill: {
    height: '100%',
    backgroundColor: '#196660',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: '#196660',
    position: 'absolute',
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
