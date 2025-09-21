import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/Theme';
import { Card } from '@/components/ui';

interface Room {
  id: string;
  number: string;
  type: 'A' | 'B';
  status: 'available' | 'occupied' | 'maintenance';
  guestName?: string;
  checkoutTime?: string;
  visitors?: number;
}

export default function RoomsScreen() {
  const [rooms] = useState<Room[]>([
    { id: '1', number: '101', type: 'A', status: 'occupied', guestName: 'John Doe', checkoutTime: '12:00 PM', visitors: 2 },
    { id: '2', number: '102', type: 'B', status: 'available' },
    { id: '3', number: '103', type: 'A', status: 'occupied', guestName: 'Jane Smith', checkoutTime: '12:00 PM', visitors: 0 },
    { id: '4', number: '201', type: 'B', status: 'occupied', guestName: 'Mike Johnson', checkoutTime: '11:00 AM', visitors: 1 },
    { id: '5', number: '202', type: 'A', status: 'maintenance' },
    { id: '6', number: '203', type: 'B', status: 'available' },
    { id: '7', number: '301', type: 'A', status: 'occupied', guestName: 'Sarah Wilson', checkoutTime: '12:00 PM', visitors: 3 },
    { id: '8', number: '302', type: 'B', status: 'available' },
    { id: '9', number: '303', type: 'A', status: 'occupied', guestName: 'David Brown', checkoutTime: '10:00 AM', visitors: 0 },
    { id: '10', number: '401', type: 'B', status: 'available' },
  ]);

  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');

  const filteredRooms = rooms.filter(room => 
    filter === 'all' || room.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return theme.colors.success;
      case 'occupied': return theme.colors.warning;
      case 'maintenance': return theme.colors.error;
      default: return theme.colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'checkmark-circle';
      case 'occupied': return 'person';
      case 'maintenance': return 'construct';
      default: return 'help-circle';
    }
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <TouchableOpacity style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomNumberContainer}>
          <Text style={styles.roomNumber}>Room {room.number}</Text>
          <Text style={styles.roomType}>Type {room.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(room.status) }]}>
          <Ionicons name={getStatusIcon(room.status)} size={16} color={theme.colors.white} />
          <Text style={styles.statusText}>{room.status.toUpperCase()}</Text>
        </View>
      </View>

      {room.status === 'occupied' && room.guestName && (
        <View style={styles.occupantInfo}>
          <View style={styles.occupantRow}>
            <Ionicons name="person" size={16} color={theme.colors.gray[600]} />
            <Text style={styles.occupantName}>{room.guestName}</Text>
          </View>
          
          {room.checkoutTime && (
            <View style={styles.occupantRow}>
              <Ionicons name="time" size={16} color={theme.colors.gray[600]} />
              <Text style={styles.checkoutTime}>Check-out: {room.checkoutTime}</Text>
            </View>
          )}
          
          {room.visitors !== undefined && room.visitors > 0 && (
            <View style={styles.occupantRow}>
              <Ionicons name="people" size={16} color={theme.colors.info} />
              <Text style={styles.visitorCount}>{room.visitors} visitor{room.visitors !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      )}

      {room.status === 'maintenance' && (
        <View style={styles.maintenanceInfo}>
          <Ionicons name="construct" size={16} color={theme.colors.error} />
          <Text style={styles.maintenanceText}>Under maintenance</Text>
        </View>
      )}

      {room.status === 'available' && (
        <View style={styles.availableInfo}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.availableText}>Ready for check-in</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionTitle}>Room Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>{stats.occupied}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.maintenance}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Filter Rooms</Text>
        <View style={styles.filterContainer}>
          {(['all', 'available', 'occupied', 'maintenance'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.activeFilter
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text style={[
                styles.filterText,
                filter === filterType && styles.activeFilterText
              ]}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Room Status</Text>
        <View style={styles.roomsGrid}>
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </View>
      </Card>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeFilterText: {
    color: theme.colors.white,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  roomNumberContainer: {
    flex: 1,
  },
  roomNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
  },
  roomType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  },
  occupantInfo: {
    marginTop: theme.spacing.sm,
  },
  occupantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  occupantName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.black,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  checkoutTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.sm,
  },
  visitorCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.info,
    marginLeft: theme.spacing.sm,
  },
  maintenanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  maintenanceText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  availableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  availableText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
});