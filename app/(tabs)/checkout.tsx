import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/Theme';
import { Button, Card } from '@/components/ui';
import { useActiveBookings, useCheckoutBooking } from '@/hooks/useBookingQueries';
import type { Booking as ApiBooking } from '@/services/api';

interface Booking {
  id: number;
  guestName: string;
  roomNumber: string;
  roomType: 'A' | 'B';
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  totalAmount: number;
  paidAmount: number;
  keyStatus: 'issued' | 'returned';
  visitors: number;
}

export default function CheckOutScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [keyReturned, setKeyReturned] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');

  const { data: activeBookingsData, isLoading, error } = useActiveBookings();
  const checkoutMutation = useCheckoutBooking();

  const bookings: Booking[] =
    activeBookingsData?.data.map((booking) => mapApiBookingToCheckoutBooking(booking)) ?? [];

  const filteredBookings = bookings.filter(booking =>
    booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.roomNumber.includes(searchQuery)
  );

  const selectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setKeyReturned(booking.keyStatus === 'returned');
  };

  const handleCheckOut = async () => {
    if (!selectedBooking) {
      Alert.alert('No Booking Selected', 'Please select a booking to check out.');
      return;
    }

    if (!keyReturned) {
      Alert.alert('Key Not Returned', 'Please confirm that the room key has been returned.');
      return;
    }

    try {
      await checkoutMutation.mutateAsync({
        bookingId: selectedBooking.id,
        data: {
          damage_notes: damageNotes || undefined,
          key_returned: keyReturned,
          early_checkout: false,
        },
      });

      Alert.alert(
        'Check-Out Successful',
        `Guest ${selectedBooking.guestName} has been successfully checked out from Room ${selectedBooking.roomNumber}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedBooking(null);
              setSearchQuery('');
              setKeyReturned(false);
              setDamageNotes('');
            }
          }
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process check-out. Please try again.';
      Alert.alert('Error', message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Departure care</Text>
        <Text style={styles.heroTitle}>Close a stay gently</Text>
        <Text style={styles.heroSubtitle}>
          Find the active booking, confirm the key, and release the room.
        </Text>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Search Booking</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by guest name or room number"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.secondary} />
            <Text style={styles.loadingText}>Loading active bookings...</Text>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>Failed to load active bookings.</Text>
        )}

        {searchQuery && !isLoading && !error && (
          <View style={styles.searchResults}>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={[
                    styles.bookingItem,
                    selectedBooking?.id === booking.id && styles.selectedBooking
                  ]}
                  onPress={() => selectBooking(booking)}
                >
                  <View style={styles.bookingInfo}>
                    <Text style={styles.guestName}>{booking.guestName}</Text>
                    <Text style={styles.roomInfo}>Room {booking.roomNumber} (Type {booking.roomType})</Text>
                    <Text style={styles.checkoutTime}>Check-out: {booking.checkOutTime}</Text>
                  </View>
                  <View style={styles.bookingStatus}>
                    <Ionicons 
                      name={booking.keyStatus === 'returned' ? 'checkmark-circle' : 'key'} 
                      size={24} 
                      color={booking.keyStatus === 'returned' ? theme.colors.success : theme.colors.warning} 
                    />
                    {booking.visitors > 0 && (
                      <Text style={styles.visitorCount}>{booking.visitors} visitors</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResults}>No bookings found</Text>
            )}
          </View>
        )}
      </Card>

      {selectedBooking && (
        <Card>
          <Text style={styles.sectionTitle}>Check-Out Details</Text>
          
          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guest:</Text>
              <Text style={styles.detailValue}>{selectedBooking.guestName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Room:</Text>
              <Text style={styles.detailValue}>{selectedBooking.roomNumber} (Type {selectedBooking.roomType})</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in:</Text>
              <Text style={styles.detailValue}>{selectedBooking.checkInTime}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-out:</Text>
              <Text style={styles.detailValue}>{selectedBooking.checkOutTime}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nights:</Text>
              <Text style={styles.detailValue}>{selectedBooking.nights}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailValue}>₦{selectedBooking.totalAmount}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid Amount:</Text>
              <Text style={styles.detailValue}>₦{selectedBooking.paidAmount}</Text>
            </View>

            {selectedBooking.visitors > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Visitors:</Text>
                <Text style={styles.detailValue}>{selectedBooking.visitors}</Text>
              </View>
            )}
          </View>

          <View style={styles.checkoutOptions}>
            <TouchableOpacity
              style={[
                styles.keyReturnOption,
                keyReturned && styles.keyReturned
              ]}
              onPress={() => setKeyReturned(!keyReturned)}
            >
              <Ionicons 
                name={keyReturned ? 'checkmark-circle' : 'ellipse-outline'}
                size={24} 
                color={keyReturned ? theme.colors.success : theme.colors.gray[400]} 
              />
              <Text style={[
                styles.keyReturnText,
                keyReturned && styles.keyReturnedText
              ]}>
                Room key returned
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.damageNotesContainer}>
            <Text style={styles.damageNotesLabel}>Damage/Notes (Optional)</Text>
            <TextInput
              style={styles.damageNotesInput}
              placeholder="Record any damage or additional notes"
              value={damageNotes}
              onChangeText={setDamageNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>
      )}

      {selectedBooking && (
        <View style={styles.actionButtons}>
          <Button
            title="Process Check-Out"
            onPress={handleCheckOut}
            loading={checkoutMutation.isPending}
            disabled={!keyReturned}
            style={styles.checkOutButton}
          />
        </View>
      )}
    </ScrollView>
  );
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapApiBookingToCheckoutBooking = (booking: ApiBooking): Booking => ({
  id: booking.id,
  guestName: booking.guest?.name || booking.guest_name || 'Unknown Guest',
  roomNumber: booking.room?.room_number || booking.room_number || 'Unassigned',
  roomType: (booking.room?.bed_type || booking.preferred_bed_type || 'A') as 'A' | 'B',
  checkInTime: formatDateTime(booking.check_in_time),
  checkOutTime: formatDateTime(booking.scheduled_checkout_time || booking.check_out_time),
  nights: booking.number_of_nights,
  totalAmount: Number(booking.total_amount || 0),
  paidAmount: Number(booking.amount_paid || 0),
  keyStatus: booking.key_returned ? 'returned' : 'issued',
  visitors: booking.visitor_passes?.length ?? 0,
});

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDEBD5',
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FAFCF7',
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
  },
  searchResults: {
    marginTop: theme.spacing.md,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#DDEBD5',
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  selectedBooking: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#F3F8EF',
  },
  bookingInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#143B1D',
  },
  roomInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    marginTop: theme.spacing.xs,
  },
  checkoutTime: {
    fontSize: theme.typography.fontSize.sm,
    color: '#6F8673',
    marginTop: theme.spacing.xs,
  },
  bookingStatus: {
    alignItems: 'center',
  },
  visitorCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.info,
    marginTop: theme.spacing.xs,
  },
  noResults: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[500],
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    paddingTop: theme.spacing.md,
  },
  bookingDetails: {
    backgroundColor: '#F7FBF2',
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEBD5',
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.md,
    color: '#55735C',
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    color: '#143B1D',
    fontWeight: theme.typography.fontWeight.semibold,
  },
  checkoutOptions: {
    marginBottom: theme.spacing.md,
  },
  keyReturnOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: '#DDEBD5',
    borderRadius: 8,
  },
  keyReturned: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  keyReturnText: {
    fontSize: theme.typography.fontSize.md,
    color: '#355D3D',
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  keyReturnedText: {
    color: theme.colors.success,
  },
  damageNotesContainer: {
    marginBottom: theme.spacing.md,
  },
  damageNotesLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: '#355D3D',
    marginBottom: theme.spacing.sm,
  },
  damageNotesInput: {
    borderWidth: 1,
    borderColor: '#DDEBD5',
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    backgroundColor: '#FAFCF7',
    textAlignVertical: 'top',
  },
  actionButtons: {
    paddingVertical: theme.spacing.lg,
  },
  checkOutButton: {
    marginBottom: theme.spacing.md,
  },
});
