import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/Theme';
import { Button, Card } from '@/components/ui';

interface Booking {
  id: string;
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
  const [loading, setLoading] = useState(false);
  const [keyReturned, setKeyReturned] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');

  // Mock current bookings data
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      guestName: 'John Doe',
      roomNumber: '101',
      roomType: 'A',
      checkInTime: '2024-01-15 14:00',
      checkOutTime: '2024-01-17 12:00',
      nights: 2,
      totalAmount: 3000,
      paidAmount: 3000,
      keyStatus: 'issued',
      visitors: 2,
    },
    {
      id: '2',
      guestName: 'Jane Smith',
      roomNumber: '205',
      roomType: 'B',
      checkInTime: '2024-01-16 16:00',
      checkOutTime: '2024-01-18 12:00',
      nights: 2,
      totalAmount: 4000,
      paidAmount: 4000,
      keyStatus: 'issued',
      visitors: 0,
    },
    {
      id: '3',
      guestName: 'Mike Johnson',
      roomNumber: '103',
      roomType: 'A',
      checkInTime: '2024-01-17 12:00',
      checkOutTime: '2024-01-18 12:00',
      nights: 1,
      totalAmount: 1500,
      paidAmount: 1500,
      keyStatus: 'issued',
      visitors: 1,
    },
  ]);

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

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

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
      Alert.alert('Error', 'Failed to process check-out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

        {searchQuery && (
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
              <Text style={styles.detailValue}>₱{selectedBooking.totalAmount}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid Amount:</Text>
              <Text style={styles.detailValue}>₱{selectedBooking.paidAmount}</Text>
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
                name={keyReturned ? 'checkmark-circle' : 'circle-outline'} 
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
            loading={loading}
            disabled={!keyReturned}
            style={styles.checkOutButton}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
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
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  selectedBooking: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + '10',
  },
  bookingInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
  },
  roomInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  checkoutTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
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
  bookingDetails: {
    backgroundColor: theme.colors.gray[50],
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
    borderBottomColor: theme.colors.gray[200],
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.black,
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
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
  },
  keyReturned: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  keyReturnText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[700],
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
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  damageNotesInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    backgroundColor: theme.colors.white,
    textAlignVertical: 'top',
  },
  actionButtons: {
    paddingVertical: theme.spacing.lg,
  },
  checkOutButton: {
    marginBottom: theme.spacing.md,
  },
});