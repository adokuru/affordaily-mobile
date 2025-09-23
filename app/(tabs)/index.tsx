import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { theme } from '@/constants/Theme';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardQueries';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  // Use TanStack Query to fetch dashboard stats
  const { data: dashboardData, isLoading, error } = useDashboardStats();

  // Fallback to default stats if data is loading or unavailable
  const stats = dashboardData?.data || {
    total_rooms: 400,
    occupied_rooms: 180,
    available_rooms: 200,
    pending_checkouts: 15,
    total_guests: 180,
    total_visitors: 45,
    today_revenue: 360000,
    monthly_revenue: 10800000,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color = theme.colors.primary }: any) => (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color={theme.colors.white} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </Card>
  );

  const QuickAction = ({ title, icon, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.secondary} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Affordaily POS</Text>
            <Text style={styles.headerSubtitle}>Property Management System</Text>
            {user && (
              <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.gray[600]} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Rooms"
            value={stats.total_rooms}
            icon="bed"
            color={theme.colors.info}
          />
          <StatCard
            title="Occupied"
            value={stats.occupied_rooms}
            icon="person"
            color={theme.colors.warning}
          />
          <StatCard
            title="Available"
            value={stats.available_rooms}
            icon="checkmark-circle"
            color={theme.colors.success}
          />
          <StatCard
            title="Pending Checkout"
            value={stats.pending_checkouts}
            icon="time"
            color={theme.colors.error}
          />
        </View>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Check In"
            icon="person-add"
            onPress={() => router.push('/(tabs)/checkin')}
          />
          <QuickAction
            title="Check Out"
            icon="person-remove"
            onPress={() => router.push('/(tabs)/checkout')}
          />
          <QuickAction
            title="Extend Stay"
            icon="time"
            onPress={() => { }}
          />
          <QuickAction
            title="Visitor Pass"
            icon="card"
            onPress={() => { }}
          />
        </View>
      </Card>


      {!isLoading && stats.pending_checkouts > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color={theme.colors.error} />
            <Text style={styles.alertTitle}>Pending Checkouts</Text>
          </View>
          <Text style={styles.alertText}>
            {stats.pending_checkouts} guests have pending checkouts.
            Please process them to avoid auto-checkout at 12:00 PM.
          </Text>
          <Button
            title="View Pending Checkouts"
            onPress={() => router.push('/(tabs)/checkout')}
            variant="secondary"
            size="small"
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[600],
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoutButton: {
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[100],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: theme.colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  alertTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  alertText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    minHeight: 200,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.md,
  },
});
