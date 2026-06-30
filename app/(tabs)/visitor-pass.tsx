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
import { useActiveBookings } from '@/hooks/useBookingQueries';
import {
  useActiveVisitorPassesForBooking,
  useCheckoutVisitorPass,
  useCreateVisitorPass,
} from '@/hooks/useVisitorPassQueries';
import type { Booking } from '@/services/api';

const bookingLabel = (booking: Booking) =>
  `${booking.guest?.name || booking.guest_name || 'Unknown Guest'} - Room ${
    booking.room?.room_number || booking.room_number || 'Unassigned'
  }`;

const formatTime = (value?: string | null) => {
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

export default function VisitorPassScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');

  const { data, isLoading, error } = useActiveBookings();
  const createVisitorPass = useCreateVisitorPass();
  const checkoutVisitorPass = useCheckoutVisitorPass();
  const activeVisitors = useActiveVisitorPassesForBooking(selectedBooking?.id);

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

  const handlePhoneChange = (value: string) => {
    setVisitorPhone(value.replace(/\D/g, '').slice(0, 11));
  };

  const handleIssuePass = async () => {
    if (!selectedBooking) {
      Alert.alert('No Booking Selected', 'Please select an active booking.');
      return;
    }

    if (!visitorName.trim()) {
      Alert.alert('Missing Visitor Name', 'Please enter the visitor name.');
      return;
    }

    if (visitorPhone.length !== 11) {
      Alert.alert('Invalid Phone', 'Visitor phone number must be 11 digits.');
      return;
    }

    try {
      const response = await createVisitorPass.mutateAsync({
        booking_id: selectedBooking.id,
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone,
      });

      Alert.alert(
        'Visitor Pass Issued',
        `${response.data.visitor.name || visitorName} can visit ${bookingLabel(
          selectedBooking
        )}.`
      );
      setVisitorName('');
      setVisitorPhone('');
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to issue visitor pass. Please try again.';
      Alert.alert('Visitor Pass Failed', message);
    }
  };

  const handleCheckoutVisitor = async (visitorPassId: number) => {
    try {
      await checkoutVisitorPass.mutateAsync(visitorPassId);
      Alert.alert('Visitor Checked Out', 'The visitor pass has been checked out.');
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to check out visitor. Please try again.';
      Alert.alert('Checkout Failed', message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Visitor welcome</Text>
        <Text style={styles.heroTitle}>Make visits feel simple</Text>
        <Text style={styles.heroSubtitle}>
          Select a host booking, issue a pass, and check visitors out cleanly.
        </Text>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Select Host Booking</Text>
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
          <Text style={styles.sectionTitle}>Issue Visitor Pass</Text>
          <Text style={styles.hostText}>Host: {bookingLabel(selectedBooking)}</Text>
          <Input
            label="Visitor Name"
            value={visitorName}
            onChangeText={setVisitorName}
            placeholder="Enter visitor full name"
          />
          <Input
            label="Visitor Phone"
            value={visitorPhone}
            onChangeText={handlePhoneChange}
            placeholder="Enter 11-digit phone number"
            keyboardType="phone-pad"
            maxLength={11}
          />
          <Button
            title="Issue Visitor Pass"
            onPress={handleIssuePass}
            loading={createVisitorPass.isPending}
            disabled={!visitorName.trim() || visitorPhone.length !== 11}
          />
        </Card>
      )}

      {selectedBooking && (
        <Card>
          <Text style={styles.sectionTitle}>Active Visitors</Text>

          {activeVisitors.isLoading && (
            <View style={styles.centerState}>
              <ActivityIndicator color={theme.colors.secondary} />
              <Text style={styles.mutedText}>Loading visitors...</Text>
            </View>
          )}

          {activeVisitors.error && (
            <Text style={styles.errorText}>Failed to load active visitors.</Text>
          )}

          {!activeVisitors.isLoading &&
            !activeVisitors.error &&
            activeVisitors.data?.data.map((visitorPass) => (
              <View key={visitorPass.id} style={styles.visitorItem}>
                <View style={styles.bookingText}>
                  <Text style={styles.bookingTitle}>
                    {visitorPass.visitor.name || 'Unnamed Visitor'}
                  </Text>
                  <Text style={styles.bookingMeta}>
                    Phone: {visitorPass.visitor.phone || 'Not set'}
                  </Text>
                  <Text style={styles.bookingMeta}>
                    Checked in: {formatTime(visitorPass.check_in_time)}
                  </Text>
                </View>
                <Button
                  title="Checkout"
                  size="small"
                  variant="outline"
                  onPress={() => handleCheckoutVisitor(visitorPass.id)}
                  loading={checkoutVisitorPass.isPending}
                />
              </View>
            ))}

          {!activeVisitors.isLoading &&
            !activeVisitors.error &&
            activeVisitors.data?.data.length === 0 && (
              <Text style={styles.mutedText}>No active visitors for this booking.</Text>
            )}
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
  hostText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#355D3D',
    marginBottom: theme.spacing.md,
  },
  visitorItem: {
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
});
