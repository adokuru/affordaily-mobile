import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/Theme';
import { Card } from '@/components/ui';
import { useAvailableRooms, useRoomOccupancy } from '@/hooks/useRoomQueries';

export default function RoomsScreen() {
  // Use TanStack Query to fetch room occupancy data
  const { data: occupancyData, isLoading, error } = useRoomOccupancy();
  const { data: availableRoomsData } = useAvailableRooms();

  // Fallback to default stats if data is loading or unavailable
  const stats = occupancyData?.data || {
    total_rooms: 400,
    available_rooms: 200,
    occupied_rooms: 180,
    maintenance_rooms: 0,
  };
  const maintenanceRooms = "maintenance_rooms" in stats ? stats.maintenance_rooms : 0;
  const availableByType = availableRoomsData?.data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'checkmark-circle';
      case 'occupied': return 'person';
      case 'maintenance': return 'construct';
      default: return 'help-circle';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Room care</Text>
        <Text style={styles.heroTitle}>{stats.available_rooms} rooms ready</Text>
        <Text style={styles.heroSubtitle}>
          {stats.occupied_rooms} occupied out of {stats.total_rooms} total spaces.
        </Text>
      </View>

      <Card padding="lg">
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
            <Text style={[styles.statValue, { color: theme.colors.error }]}>{maintenanceRooms}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
        </View>
      </Card>

      {availableByType && (
        <Card padding="lg">
          <Text style={styles.sectionTitle}>Available Bed Spaces</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="bed" size={24} color={theme.colors.info} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.info }]}>
                {availableByType.A.length}
              </Text>
              <Text style={styles.statLabel}>Type A</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Ionicons name="bed" size={24} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {availableByType.B.length}
              </Text>
              <Text style={styles.statLabel}>Type B</Text>
            </View>
          </View>
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
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    color: '#143B1D',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: '#55735C',
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
    backgroundColor: '#F9FCF4',
    borderRadius: 8,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
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
    fontVariant: ['tabular-nums'],
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
