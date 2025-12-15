import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { theme } from '@/src/theme';
import { ScheduleEvent } from '@/src/store/useMindLogStore';
import { REMINDER_OPTIONS } from '@/src/services/notificationService';

interface ScheduleBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { 
    title: string; 
    startTime: string; 
    endTime?: string; 
    description?: string;
    reminderMinutes?: number;
  }) => void;
  editingEvent?: ScheduleEvent | null;
}

const DURATION_CHIPS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
];

// Helper to add minutes to time string
const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

export function ScheduleBottomSheet({ visible, onClose, onSave, editingEvent }: ScheduleBottomSheetProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const titleInputRef = useRef<TextInput>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime || '');
      setDescription(editingEvent.description || '');
      setReminderMinutes(editingEvent.reminderMinutes || 0);
    } else {
      // Reset for new
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setReminderMinutes(0);
    }
  }, [editingEvent, visible]);

  // Auto focus
  useEffect(() => {
    if (visible) {
      setTimeout(() => titleInputRef.current?.focus(), 300);
    }
  }, [visible]);

  const handleDurationChip = (minutes: number) => {
    setEndTime(addMinutesToTime(startTime, minutes));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      startTime,
      endTime: endTime || undefined,
      description: description.trim() || undefined,
      reminderMinutes: reminderMinutes > 0 ? reminderMinutes : undefined,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheet}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingEvent ? '编辑日程' : '新建日程'}
            </Text>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input (Underlined) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>标题</Text>
              <TextInput
                ref={titleInputRef}
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="做什么..."
                placeholderTextColor={theme.colors.ink.watermark}
              />
            </View>

            {/* Time Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>开始</Text>
                <TextInput
                  style={styles.textInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={theme.colors.ink.watermark}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <Text style={styles.timeSeparator}>→</Text>
              <View style={styles.timeInput}>
                <Text style={styles.inputLabel}>结束</Text>
                <TextInput
                  style={styles.textInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                  placeholderTextColor={theme.colors.ink.watermark}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* Duration Chips */}
            <View style={styles.chipsRow}>
              {DURATION_CHIPS.map((chip) => (
                <Pressable
                  key={chip.label}
                  style={styles.chip}
                  onPress={() => handleDurationChip(chip.minutes)}
                >
                  <Text style={styles.chipText}>{chip.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Reminder Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🔔 提醒</Text>
              <View style={styles.reminderChipsRow}>
                {REMINDER_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.reminderChip,
                      reminderMinutes === option.value && styles.reminderChipActive,
                    ]}
                    onPress={() => setReminderMinutes(option.value)}
                  >
                    <Text
                      style={[
                        styles.reminderChipText,
                        reminderMinutes === option.value && styles.reminderChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>备注 (可选)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="添加备注..."
                placeholderTextColor={theme.colors.ink.watermark}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.paper.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.ink.watermark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: theme.typography.serif,
    fontSize: 20,
    color: theme.colors.ink.main,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    fontFamily: theme.typography.sans,
    fontSize: 16,
    color: theme.colors.ink.main,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.marks.blueGrey,
    paddingVertical: 8,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 18,
    color: theme.colors.ink.watermark,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(212, 225, 241, 0.4)',
    borderRadius: 16,
  },
  chipText: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.secondary,
  },
  // Reminder styles
  reminderChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(212, 225, 241, 0.3)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  reminderChipActive: {
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
    borderColor: theme.colors.marks.terracotta,
  },
  reminderChipText: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.secondary,
  },
  reminderChipTextActive: {
    color: theme.colors.ink.main,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 225, 241, 0.4)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: theme.typography.sans,
    fontSize: 15,
    color: theme.colors.ink.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.marks.terracotta,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: theme.typography.sans,
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
