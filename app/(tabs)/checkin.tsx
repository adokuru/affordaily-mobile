import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { theme } from '@/constants/Theme';
import { Button, Card, Input } from '@/components/ui';

type CheckInFormData = {
  guestName: string;
  phone: string;
  idNumber: string;
  nights: string;
  paymentMethod: 'cash' | 'transfer';
  transferReference: string;
  amount: string;
};

export default function CheckInScreen() {
  const { guest_name, guest_phone, id_photo_path, number_of_nights } = useLocalSearchParams<{
    guest_name?: string | string[];
    guest_phone?: string | string[];
    id_photo_path?: string | string[];
    number_of_nights?: string | string[];
  }>();

  const toSingle = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

  const [formData, setFormData] = useState<CheckInFormData>({
    guestName: '',
    phone: '',
    idNumber: '',
    nights: '1',
    paymentMethod: 'cash',
    transferReference: '',
    amount: '',
  });

  const [assignedRoom, setAssignedRoom] = useState<{
    id: string;
    number: string;
    type: 'A' | 'B';
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    const name = toSingle(guest_name);
    const phone = toSingle(guest_phone);
    const photo = toSingle(id_photo_path);
    const nightsParam = toSingle(number_of_nights);

    setFormData((prev: CheckInFormData) => ({
      ...prev,
      guestName: name ?? prev.guestName,
      phone: phone ?? prev.phone,
      nights: nightsParam ? String(parseInt(nightsParam) || 1) : prev.nights,
    }));

    if (photo) {
      setIdPhotoUri(photo);
    }
  }, [guest_name, guest_phone, id_photo_path, number_of_nights]);

  // Mock available rooms data
  const availableRooms = [
    { id: '1', number: '101', type: 'A' as const, status: 'available' },
    { id: '2', number: '102', type: 'B' as const, status: 'available' },
    { id: '3', number: '103', type: 'A' as const, status: 'available' },
    { id: '4', number: '201', type: 'B' as const, status: 'available' },
    { id: '5', number: '202', type: 'A' as const, status: 'available' },
  ];

  const handleInputChange = (field: keyof CheckInFormData, value: string) => {
    setFormData((prev: CheckInFormData) => ({ ...prev, [field]: value }));
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
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));

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
          onChangeText={(value: string) => handleInputChange('guestName', value)}
          placeholder="Enter guest full name"
        />

        <Input
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(value: string) => handleInputChange('phone', value)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Input
          label="ID Number"
          value={formData.idNumber}
          onChangeText={(value: string) => handleInputChange('idNumber', value)}
          placeholder="Enter ID number"
        />

        <TouchableOpacity style={styles.idPhotoButton} onPress={captureIdPhoto}>
          <Ionicons name="camera" size={24} color={theme.colors.secondary} />
          <Text style={styles.idPhotoText}>Capture ID Photo</Text>
        </TouchableOpacity>

        {idPhotoUri && (
          <View style={styles.idPhotoPreview}>
            <Image source={{ uri: idPhotoUri }} style={styles.idPhotoImage} />
            <Text style={styles.idPhotoCaption}>ID Photo</Text>
          </View>
        )}

        <Input
          label="Number of Nights"
          value={formData.nights}
          onChangeText={(value: string) => handleInputChange('nights', value)}
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
              <Ionicons name="close-circle" size={24} color={theme.colors.error} />
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
            <Ionicons name="cash" size={24} color={theme.colors.secondary} />
            <Text style={styles.paymentText}>Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'transfer' && styles.selectedPayment
            ]}
            onPress={() => handleInputChange('paymentMethod', 'transfer')}
          >
            <Ionicons name="card" size={24} color={theme.colors.secondary} />
            <Text style={styles.paymentText}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {formData.paymentMethod === 'transfer' && (
          <Input
            label="Transfer Reference"
            value={formData.transferReference}
            onChangeText={(value: string) => handleInputChange('transferReference', value)}
            placeholder="Enter transfer reference"
          />
        )}

        <Input
          label="Amount"
          value={formData.amount}
          onChangeText={(value: string) => handleInputChange('amount', value)}
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
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  idPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  idPhotoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  idPhotoPreview: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  idPhotoImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.gray[100],
  },
  idPhotoCaption: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  assignedRoom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.success + '20',
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  roomType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  availableRooms: {
    marginTop: theme.spacing.md,
  },
  availableRoomsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  roomList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomItem: {
    width: '30%',
    padding: theme.spacing.sm,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRoom: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  roomItemNumber: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
  },
  roomItemType: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[600],
  },
  paymentMethod: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
  },
  selectedPayment: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + '10',
  },
  paymentText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[700],
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  amountBreakdown: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    marginTop: theme.spacing.sm,
  },
  breakdownText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  actionButtons: {
    paddingVertical: theme.spacing.lg,
  },
  checkInButton: {
    marginBottom: theme.spacing.md,
  },
});