import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/components/home/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onDayPress: (date: Date) => void;
  onClear: () => void;
}

export default function CustomCalendarModal({
  visible,
  onClose,
  rangeStart,
  rangeEnd,
  onDayPress,
  onClear,
}: Props) {
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    const today = new Date();
    if (viewDate.getFullYear() <= today.getFullYear() && viewDate.getMonth() <= today.getMonth()) {
      return;
    }
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSelected = (date: Date) => {
    if (rangeStart && date.getTime() === rangeStart.getTime()) return 'endpoint';
    if (rangeEnd && date.getTime() === rangeEnd.getTime()) return 'endpoint';
    if (rangeStart && rangeEnd && date > rangeStart && date < rangeEnd) return 'between';
    return 'none';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getFormattedRange = () => {
    if (!rangeStart) return '';
    const startStr = rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!rangeEnd) return startStr;
    const endStr = rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthLabels = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const isPrevDisabled = year <= todayDate.getFullYear() && month <= todayDate.getMonth();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentCalendar}>
          <Text style={styles.modalTitle}>Select Trip Dates</Text>
          
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              onPress={handlePrevMonth} 
              disabled={isPrevDisabled}
              style={[styles.arrowBtn, isPrevDisabled && styles.arrowBtnDisabled]}
            >
              <Ionicons name="chevron-back" size={18} color={isPrevDisabled ? '#D1D5DB' : COLORS.brand950} />
            </TouchableOpacity>
            <Text style={styles.calendarMonthTitle}>
              {monthLabels[month]} {year}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.brand950} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekRow}>
            {weekdayLabels.map((label, idx) => (
              <Text key={idx} style={styles.calendarWeekLabel}>{label}</Text>
            ))}
          </View>

          <View style={styles.calendarDaysGrid}>
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <View key={`empty-${idx}`} style={styles.calendarDayCellEmpty} />;
              }

              const state = isSelected(day);
              const dayIsToday = isToday(day);
              const isPast = day < todayDate;

              return (
                <TouchableOpacity
                  key={`day-${idx}`}
                  onPress={() => onDayPress(day)}
                  disabled={isPast}
                  style={[
                    styles.calendarDayCell,
                    state === 'endpoint' && styles.calendarDayEndpoint,
                    state === 'between' && styles.calendarDayBetween,
                    dayIsToday && styles.calendarDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      state === 'endpoint' && styles.calendarDayTextEndpoint,
                      state === 'between' && styles.calendarDayTextBetween,
                      isPast && styles.calendarDayTextPast,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.calendarSelectionFooter}>
            <Text style={styles.selectionInfoText}>
              {rangeStart ? (
                rangeEnd ? (
                  `Selected: ${getFormattedRange()}`
                ) : (
                  `Start Date: ${rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                )
              ) : (
                'Choose start & end dates'
              )}
            </Text>
            
            <View style={styles.calendarActionsRow}>
              <TouchableOpacity 
                style={[styles.calendarActionBtn, styles.calendarActionBtnCancel]} 
                onPress={onClear}
              >
                <Text style={styles.calendarActionBtnTextCancel}>Clear & Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.calendarActionBtn, styles.calendarActionBtnConfirm, (!rangeStart || !rangeEnd) && styles.calendarActionBtnConfirmDisabled]} 
                disabled={!rangeStart || !rangeEnd}
                onPress={onClose}
              >
                <Text style={styles.calendarActionBtnTextConfirm}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContentCalendar: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand950,
    marginBottom: 16,
    textAlign: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  arrowBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  arrowBtnDisabled: {
    opacity: 0.4,
  },
  calendarMonthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.brand950,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarWeekLabel: {
    width: (SCREEN_WIDTH - 40) / 7 - 4,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray400,
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    marginBottom: 20,
  },
  calendarDayCell: {
    width: (SCREEN_WIDTH - 40) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  calendarDayCellEmpty: {
    width: (SCREEN_WIDTH - 40) / 7,
    height: 40,
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand950,
  },
  calendarDayToday: {
    borderWidth: 1.5,
    borderColor: '#196660',
  },
  calendarDayEndpoint: {
    backgroundColor: '#196660',
    borderRadius: 20,
  },
  calendarDayTextEndpoint: {
    color: COLORS.white,
    fontWeight: '700',
  },
  calendarDayBetween: {
    backgroundColor: '#E2F5F1',
    borderRadius: 0,
  },
  calendarDayTextBetween: {
    color: '#196660',
    fontWeight: '600',
  },
  calendarDayTextPast: {
    color: '#D1D5DB',
    textDecorationLine: 'line-through',
  },
  calendarSelectionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    gap: 16,
  },
  selectionInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#196660',
    textAlign: 'center',
  },
  calendarActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  calendarActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarActionBtnCancel: {
    backgroundColor: '#F3F4F6',
  },
  calendarActionBtnConfirm: {
    backgroundColor: '#196660',
  },
  calendarActionBtnConfirmDisabled: {
    backgroundColor: '#E5E7EB',
  },
  calendarActionBtnTextCancel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  calendarActionBtnTextConfirm: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
