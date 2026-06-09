import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
}

export default function HomeSearchBar({ value, onChangeText, onFilterPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <Ionicons name="search-outline" size={18} color={COLORS.gray400} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Your Next Destination"
          placeholderTextColor={COLORS.gray400}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={18} color={COLORS.brand700} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.brand950,
    padding: 0,
  },
  filterBtn: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
