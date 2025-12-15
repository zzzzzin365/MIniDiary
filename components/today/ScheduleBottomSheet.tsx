import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '@/src/theme';
import { TimelineEvent } from '@/src/types/domain';

interface ScheduleBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (event: { title: string; startTime: string; endTime?: string }) => void;
  initialEvent?: TimelineEvent | null;
}

const DURATION_CHIPS = [15, 30, 60];

export function ScheduleBottomSheet({ isVisible, onClose, onSave, initialEvent }: ScheduleBottomSheetProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState(60); // minutes
  
  // Reset form when opening/changing event
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setStartTime(new Date(initialEvent.startTime));
      // Calculate duration if possible
    } else {
      setTitle('');
      setStartTime(new Date()); // Default to now
      setDuration(60);
    }
  }, [isVisible, initialEvent]);

  const handleSave = () => {
    if (!title.trim()) return;

    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    onSave({
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    onClose();
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      avoidKeyboard
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContainer}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />
        
        <Text style={styles.headerTitle}>{initialEvent ? 'Edit Event' : 'New Focus'}</Text>

        {/* Title Input */}
        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          placeholderTextColor={theme.colors.ink.watermark}
          value={title}
          onChangeText={setTitle}
          autoFocus={!initialEvent} // Auto focus on new
        />

        {/* Time Picker Row */}
        <View style={styles.row}>
          <Text style={styles.label}>Start Time</Text>
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            style={styles.datePicker}
            themeVariant="light"
          />
        </View>

        {/* Duration Chips */}
        <View style={styles.chipsRow}>
          {DURATION_CHIPS.map((mins) => (
            <Pressable
              key={mins}
              style={[styles.chip, duration === mins && styles.chipSelected]}
              onPress={() => setDuration(mins)}
            >
              <Text style={[styles.chipText, duration === mins && styles.chipTextSelected]}>
                {mins}m
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Confirm</Text>
        </Pressable>

      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheetContainer: {
    backgroundColor: theme.colors.paper.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.ink.watermark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.5,
  },
  headerTitle: {
    fontFamily: theme.typography.serif,
    fontSize: 20,
    color: theme.colors.ink.main,
    marginBottom: 24,
  },
  input: {
    fontFamily: theme.typography.sans,
    fontSize: 18,
    color: theme.colors.ink.main,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ink.watermark,
    paddingVertical: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  label: {
    fontFamily: theme.typography.sans,
    fontSize: 16,
    color: theme.colors.ink.secondary,
  },
  datePicker: {
    // Styling handled by OS mostly
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.ink.watermark,
  },
  chipSelected: {
    backgroundColor: theme.colors.marks.sage,
    borderColor: theme.colors.marks.sage,
  },
  chipText: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.secondary,
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.marks.sage,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: theme.typography.sans,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

