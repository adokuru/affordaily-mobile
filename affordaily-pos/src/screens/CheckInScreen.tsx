import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function CheckInScreen() {
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    idNumber: '',
    nights: '1',
    paymentMethod: 'cash' as 'cash' | 'transfer',
    transferReference: '',
    amount: '',
  });

  const [assignedRoom, setAssignedRoom] = useState<{
    id: string;
    number: string;
    type: 'A' | 'B';
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Mock available rooms data
  const availableRooms = [
    { id: '1', number: '101', type: 'A' as const, status: 'available' },
    { id: '2', number: '102', type: 'B' as const, status: 'available' },
    { id: '3', number: '103', type: 'A' as const, status: 'available' },
    { id: '4', number: '201', type: 'B' as const, status: 'available' },
    { id: '5', number: '202', type: 'A' as const, status: 'available' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const assignRoom = () => {
    // Simple room assignment logic - prefer same type grouping
    const available = availableRooms.filter(room => room.status === 'available');
    if (available.length === 0) {
      Alert.alert('No Available Rooms', 'All rooms are currently occupied.');
      return;
    }

    // For demo, just assign the first available room
    const room = available[0];
    setAssignedRoom(room);
  };

  const captureIdPhoto = () => {
    Alert.alert(
      'ID Photo Capture',
      'This would open the camera to capture guest ID photo.',
      [{ text: 'OK' }]
    );
  };

  const calculateAmount = () => {
    const nights = parseInt(formData.nights) || 1;
    const ratePerNight = assignedRoom?.type === 'A' ? 1500 : 2000;
    return nights * ratePerNight;
  };

  const handleCheckIn = async () => {
    if (!formData.guestName || !formData.phone) {
      Alert.alert('Missing Information', 'Please fill in guest name and phone number.');
      return;
    }

    if (!assignedRoom) {
      Alert.alert('No Room Assigned', 'Please assign a room first.');
      return;
    }

    if (!formData.amount) {
      Alert.alert('Missing Amount', 'Please enter the payment amount.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Check-In Successful',
        `Guest ${formData.guestName} has been checked into Room ${assignedRoom.number}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                guestName: '',
                phone: '',
                idNumber: '',
                nights: '1',
                paymentMethod: 'cash',
                transferReference: '',
                amount: '',
              });
              setAssignedRoom(null);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionTitle}>Guest Information</Text>
        
        <Input
          label="Guest Name *"
          value={formData.guestName}
          onChangeText={(value) => handleInputChange('guestName', value)}
          placeholder="Enter guest full name"
        />

        <Input
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Input
          label="ID Number"
          value={formData.idNumber}
          onChangeText={(value) => handleInputChange('idNumber', value)}
          placeholder="Enter ID number"
        />

        <TouchableOpacity style={styles.idPhotoButton} onPress={captureIdPhoto}>
          <Ionicons name="camera" size={24} color={colors.secondary} />
          <Text style={styles.idPhotoText}>Capture ID Photo</Text>
        </TouchableOpacity>

        <Input
          label="Number of Nights"
          value={formData.nights}
          onChangeText={(value) => handleInputChange('nights', value)}
          placeholder="Enter number of nights"
          keyboardType="numeric"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Room Assignment</Text>
        
        {assignedRoom ? (
          <View style={styles.assignedRoom}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomNumber}>Room {assignedRoom.number}</Text>
              <Text style={styles.roomType}>Type {assignedRoom.type}</Text>
            </View>
            <TouchableOpacity onPress={() => setAssignedRoom(null)}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Auto-Assign Room"
            onPress={assignRoom}
            variant="outline"
          />
        )}

        <View style={styles.availableRooms}>
          <Text style={styles.availableRoomsTitle}>Available Rooms</Text>
          <View style={styles.roomList}>
            {availableRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomItem,
                  assignedRoom?.id === room.id && styles.selectedRoom
                ]}
                onPress={() => setAssignedRoom(room)}
              >
                <Text style={styles.roomItemNumber}>{room.number}</Text>
                <Text style={styles.roomItemType}>Type {room.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        
        <View style={styles.paymentMethod}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'cash' && styles.selectedPayment
            ]}
            onPress={() => handleInputChange('paymentMethod', 'cash')}
          >
            <Ionicons name="cash" size={24} color={colors.secondary} />
            <Text style={styles.paymentText}>Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'transfer' && styles.selectedPayment
            ]}
            onPress={() => handleInputChange('paymentMethod', 'transfer')}
          >
            <Ionicons name="card" size={24} color={colors.secondary} />
            <Text style={styles.paymentText}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {formData.paymentMethod === 'transfer' && (
          <Input
            label="Transfer Reference"
            value={formData.transferReference}
            onChangeText={(value) => handleInputChange('transferReference', value)}
            placeholder="Enter transfer reference"
          />
        )}

        <Input
          label="Amount"
          value={formData.amount}
          onChangeText={(value) => handleInputChange('amount', value)}
          placeholder={`Suggested: ₱${calculateAmount()}`}
          keyboardType="numeric"
        />

        <View style={styles.amountBreakdown}>
          <Text style={styles.breakdownText}>
            {formData.nights} nights × ₱{assignedRoom?.type === 'A' ? '1,500' : '2,000'} = ₱{calculateAmount()}
          </Text>
        </View>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          title="Process Check-In"
          onPress={handleCheckIn}
          loading={loading}
          disabled={!assignedRoom || !formData.guestName || !formData.phone}
          style={styles.checkInButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  idPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  idPhotoText: {
    fontSize: typography.fontSize.md,
    color: colors.secondary,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  assignedRoom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  roomType: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  availableRooms: {
    marginTop: spacing.md,
  },
  availableRoomsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  roomList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomItem: {
    width: '30%',
    padding: spacing.sm,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRoom: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  roomItemNumber: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  roomItemType: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
  paymentMethod: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: 8,
  },
  selectedPayment: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + '10',
  },
  paymentText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  amountBreakdown: {
    padding: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  breakdownText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  actionButtons: {
    paddingVertical: spacing.lg,
  },
  checkInButton: {
    marginBottom: spacing.md,
  },
});