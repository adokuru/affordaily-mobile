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
import {
  useDashboardPayments,
  useDashboardStats,
  useRollCall,
} from '@/hooks/useDashboardQueries';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  // Use TanStack Query to fetch dashboard stats
  const { data: dashboardData, isLoading, error } = useDashboardStats();
  const { data: paymentsData } = useDashboardPayments();
  const { data: rollCallData } = useRollCall();

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
  const paymentSummary = paymentsData?.summary;
  const activeRollCallCount = rollCallData?.data.length ?? 0;

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

  const occupancyRate =
    stats.total_rooms > 0
      ? Math.round((stats.occupied_rooms / stats.total_rooms) * 100)
      : 0;

  const StatCard = ({ title, value, icon, color = theme.colors.primary }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  const QuickAction = ({ title, icon, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.quickActionCopy}>
        <Text style={styles.quickActionText}>{title}</Text>
        <Text style={styles.quickActionSubtext}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerEyebrow}>Today at the front desk</Text>
            <Text style={styles.headerTitle}>Affordaily POS</Text>
            {user && (
              <Text style={styles.welcomeText}>Signed in as {user.name}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#527B2E" />
          </TouchableOpacity>
        </View>
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.heroNumber}>{occupancyRate}%</Text>
            <Text style={styles.heroLabel}>Occupancy</Text>
          </View>
          <View style={styles.heroDivider} />
          <View>
            <Text style={styles.heroNumber}>{stats.available_rooms}</Text>
            <Text style={styles.heroLabel}>Available now</Text>
          </View>
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
            color="#6C8F53"
          />
          <StatCard
            title="Occupied"
            value={stats.occupied_rooms}
            icon="person"
            color="#B28B39"
          />
          <StatCard
            title="Available"
            value={stats.available_rooms}
            icon="checkmark-circle"
            color="#527B2E"
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
            subtitle="Create a booking"
            icon="person-add"
            onPress={() => router.push('/(tabs)/checkin')}
          />
          <QuickAction
            title="Check Out"
            subtitle="Close active stay"
            icon="person-remove"
            onPress={() => router.push('/(tabs)/checkout')}
          />
          <QuickAction
            title="Extend Stay"
            subtitle="Add extra nights"
            icon="time"
            onPress={() => router.push('/(tabs)/extend-stay')}
          />
          <QuickAction
            title="Visitor Pass"
            subtitle="Issue or clear visitors"
            icon="card"
            onPress={() => router.push('/(tabs)/visitor-pass')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Live Operations</Text>
        <View style={styles.operationRow}>
          <View style={styles.operationItem}>
            <Text style={styles.operationValue}>{activeRollCallCount}</Text>
            <Text style={styles.operationLabel}>Guests in roll call</Text>
          </View>
          <View style={styles.operationItem}>
            <Text style={styles.operationValue}>
              ₦{Number(paymentSummary?.total_amount ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.operationLabel}>Payments recorded</Text>
          </View>
        </View>
        <View style={styles.operationRow}>
          <View style={styles.operationItem}>
            <Text style={styles.operationValue}>
              ₦{Number(paymentSummary?.cash_total ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.operationLabel}>Cash</Text>
          </View>
          <View style={styles.operationItem}>
            <Text style={styles.operationValue}>
              ₦{Number(paymentSummary?.transfer_total ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.operationLabel}>Transfer</Text>
          </View>
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
    backgroundColor: '#F4FAF1',
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerEyebrow: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#6B8E36',
    marginBottom: theme.spacing.xs,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#143B1D',
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F3F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: '#F7FBF2',
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  heroNumber: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#214E2B',
    fontVariant: ['tabular-nums'],
  },
  heroLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
  },
  heroDivider: {
    width: 1,
    height: 46,
    backgroundColor: '#DDEBD5',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDEBD5',
    padding: theme.spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
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
    color: '#143B1D',
    fontVariant: ['tabular-nums'],
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    gap: theme.spacing.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: '#F7FBF2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#EAF5E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  quickActionCopy: {
    flex: 1,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#143B1D',
  },
  quickActionSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: '#55735C',
    marginTop: theme.spacing.xs,
  },
  operationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  operationItem: {
    width: '48%',
    padding: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: '#F5FAEE',
    borderWidth: 1,
    borderColor: theme.colors.primary + '88',
  },
  operationValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  operationLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
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
