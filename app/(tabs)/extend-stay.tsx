import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Input } from '@/components/ui';
import { theme } from '@/constants/Theme';
import { useActiveBookings, useExtendBooking } from '@/hooks/useBookingQueries';
import type { Booking } from '@/services/api';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not set';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const bookingLabel = (booking: Booking) =>
  `${booking.guest?.name || booking.guest_name || 'Unknown Guest'} - Room ${
    booking.room?.room_number || booking.room_number || 'Unassigned'
  }`;

export default function ExtendStayScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [additionalNights, setAdditionalNights] = useState('1');

  const { data, isLoading, error } = useActiveBookings();
  const extendMutation = useExtendBooking();

  const bookings = data?.data ?? [];
  const filteredBookings = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return bookings;

    return bookings.filter((booking) =>
      [
        booking.guest?.name,
        booking.guest_name,
        booking.guest?.phone,
        booking.guest_phone,
        booking.room?.room_number,
        booking.room_number,
        booking.booking_reference,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [bookings, searchQuery]);

  const handleExtendStay = async () => {
    const nights = Number.parseInt(additionalNights, 10);

    if (!selectedBooking) {
      Alert.alert('No Booking Selected', 'Please select an active booking.');
      return;
    }

    if (!Number.isInteger(nights) || nights < 1) {
      Alert.alert('Invalid Nights', 'Additional nights must be at least 1.');
      return;
    }

    try {
      const response = await extendMutation.mutateAsync({
        bookingId: selectedBooking.id,
        additionalNights: nights,
      });

      Alert.alert(
        'Stay Extended',
        `${bookingLabel(response.data)} was extended by ${nights} night(s).`
      );
      setSelectedBooking(response.data);
      setAdditionalNights('1');
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to extend stay. Please try again.';
      Alert.alert('Extend Stay Failed', message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Stay care</Text>
        <Text style={styles.heroTitle}>Give guests more time</Text>
        <Text style={styles.heroSubtitle}>
          Extend an active booking without disturbing the room assignment.
        </Text>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Select Active Booking</Text>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search guest, phone, room, or reference"
          rightIcon={<Ionicons name="search" size={20} color={theme.colors.gray[500]} />}
        />

        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.secondary} />
            <Text style={styles.mutedText}>Loading active bookings...</Text>
          </View>
        )}

        {error && <Text style={styles.errorText}>Failed to load active bookings.</Text>}

        {!isLoading &&
          !error &&
          filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={[
                styles.bookingItem,
                selectedBooking?.id === booking.id && styles.selectedBooking,
              ]}
              onPress={() => setSelectedBooking(booking)}
            >
              <View style={styles.bookingText}>
                <Text style={styles.bookingTitle}>{bookingLabel(booking)}</Text>
                <Text style={styles.bookingMeta}>
                  Checkout: {formatDateTime(booking.scheduled_checkout_time)}
                </Text>
                <Text style={styles.bookingMeta}>
                  Ref: {booking.booking_reference || 'Not set'}
                </Text>
              </View>
              <Ionicons
                name={selectedBooking?.id === booking.id ? 'checkmark-circle' : 'chevron-forward'}
                size={22}
                color={
                  selectedBooking?.id === booking.id
                    ? theme.colors.success
                    : theme.colors.gray[500]
                }
              />
            </TouchableOpacity>
          ))}

        {!isLoading && !error && filteredBookings.length === 0 && (
          <Text style={styles.mutedText}>No active bookings found.</Text>
        )}
      </Card>

      {selectedBooking && (
        <Card>
          <Text style={styles.sectionTitle}>Extend Stay</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Booking</Text>
            <Text style={styles.summaryValue}>{bookingLabel(selectedBooking)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Checkout</Text>
            <Text style={styles.summaryValue}>
              {formatDateTime(selectedBooking.scheduled_checkout_time)}
            </Text>
          </View>
          <Input
            label="Additional Nights"
            value={additionalNights}
            onChangeText={(value) =>
              setAdditionalNights(value.replace(/\D/g, '').slice(0, 2))
            }
            keyboardType="numeric"
            placeholder="Enter number of nights"
          />
          <Button
            title="Extend Stay"
            onPress={handleExtendStay}
            loading={extendMutation.isPending}
            disabled={!additionalNights}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAF1',
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  hero: {
    padding: theme.spacing.lg,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  heroEyebrow: {
    fontSize: theme.typography.fontSize.xs,
    color: '#6B8E36',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xxl,
    color: '#143B1D',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#143B1D',
    marginBottom: theme.spacing.md,
  },
  centerState: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  mutedText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DDEBD5',
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  selectedBooking: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#F3F8EF',
  },
  bookingText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  bookingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#143B1D',
    marginBottom: theme.spacing.xs,
  },
  bookingMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
  },
  summaryRow: {
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: '#143B1D',
    fontWeight: theme.typography.fontWeight.medium,
  },
});
