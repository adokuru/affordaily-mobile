import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/Theme';
import { Card } from '@/components/ui';
import { useRoomOccupancy } from '@/hooks/useRoomQueries';

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
  // Use TanStack Query to fetch room occupancy data
  const { data: occupancyData, isLoading, error } = useRoomOccupancy();

  // Fallback to default stats if data is loading or unavailable
  const stats = occupancyData?.data || {
    total_rooms: 400,
    available_rooms: 200,
    occupied_rooms: 180,
    maintenance_rooms: 20,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'checkmark-circle';
      case 'occupied': return 'person';
      case 'maintenance': return 'construct';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return theme.colors.success;
      case 'occupied': return theme.colors.warning;
      case 'maintenance': return theme.colors.error;
      default: return theme.colors.gray[500];
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Card>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.secondary} />
            <Text style={styles.loadingText}>Loading room data...</Text>
          </View>
        </Card>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Card>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
            <Text style={styles.errorText}>Failed to load room data</Text>
            <Text style={styles.errorSubtext}>Using default values</Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.sectionTitle}>Room Status Overview</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.gray[100] }]}>
              <Ionicons name="home" size={24} color={theme.colors.gray[600]} />
            </View>
            <Text style={styles.statValue}>{stats.total_rooms}</Text>
            <Text style={styles.statLabel}>Total Rooms</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Ionicons name={getStatusIcon('available')} size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.available_rooms}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Ionicons name={getStatusIcon('occupied')} size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>{stats.occupied_rooms}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.error + '20' }]}>
              <Ionicons name={getStatusIcon('maintenance')} size={24} color={theme.colors.error} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.maintenance_rooms}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});