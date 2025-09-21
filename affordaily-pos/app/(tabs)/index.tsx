import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { theme } from '@/constants/Theme';
import { Button, Card } from '@/components/ui';

export default function DashboardScreen() {
  const [stats] = useState({
    totalRooms: 20,
    occupiedRooms: 12,
    availableRooms: 8,
    pendingCheckouts: 3,
    totalGuests: 24,
    totalVisitors: 8,
  });

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
        <Text style={styles.headerTitle}>Affordaily POS</Text>
        <Text style={styles.headerSubtitle}>Property Management System</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon="bed"
          color={theme.colors.info}
        />
        <StatCard
          title="Occupied"
          value={stats.occupiedRooms}
          icon="person"
          color={theme.colors.warning}
        />
        <StatCard
          title="Available"
          value={stats.availableRooms}
          icon="checkmark-circle"
          color={theme.colors.success}
        />
        <StatCard
          title="Pending Checkout"
          value={stats.pendingCheckouts}
          icon="time"
          color={theme.colors.error}
        />
      </View>

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
            onPress={() => {}}
          />
          <QuickAction
            title="Visitor Pass"
            icon="card"
            onPress={() => {}}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="person-add" size={16} color={theme.colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Guest checked in - Room 101</Text>
              <Text style={styles.activityTime}>2 minutes ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="card" size={16} color={theme.colors.info} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Visitor pass issued - Room 205</Text>
              <Text style={styles.activityTime}>15 minutes ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="person-remove" size={16} color={theme.colors.warning} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Guest checked out - Room 103</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
          </View>
        </View>
      </Card>

      {stats.pendingCheckouts > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color={theme.colors.error} />
            <Text style={styles.alertTitle}>Pending Checkouts</Text>
          </View>
          <Text style={styles.alertText}>
            {stats.pendingCheckouts} guests have pending checkouts. 
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
  activityList: {
    marginTop: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
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
});
