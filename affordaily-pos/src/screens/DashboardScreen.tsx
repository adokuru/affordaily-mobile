import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function DashboardScreen() {
  const [stats] = useState({
    totalRooms: 20,
    occupiedRooms: 12,
    availableRooms: 8,
    pendingCheckouts: 3,
    totalGuests: 24,
    totalVisitors: 8,
  });

  const StatCard = ({ title, value, icon, color = colors.primary }: any) => (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color={colors.white} />
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
        <Ionicons name={icon} size={24} color={colors.secondary} />
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
          color={colors.info}
        />
        <StatCard
          title="Occupied"
          value={stats.occupiedRooms}
          icon="person"
          color={colors.warning}
        />
        <StatCard
          title="Available"
          value={stats.availableRooms}
          icon="checkmark-circle"
          color={colors.success}
        />
        <StatCard
          title="Pending Checkout"
          value={stats.pendingCheckouts}
          icon="time"
          color={colors.error}
        />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Check In"
            icon="person-add"
            onPress={() => {}}
          />
          <QuickAction
            title="Check Out"
            icon="person-remove"
            onPress={() => {}}
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
              <Ionicons name="person-add" size={16} color={colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Guest checked in - Room 101</Text>
              <Text style={styles.activityTime}>2 minutes ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="card" size={16} color={colors.info} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Visitor pass issued - Room 205</Text>
              <Text style={styles.activityTime}>15 minutes ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="person-remove" size={16} color={colors.warning} />
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
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.alertTitle}>Pending Checkouts</Text>
          </View>
          <Text style={styles.alertText}>
            {stats.pendingCheckouts} guests have pending checkouts. 
            Please process them to avoid auto-checkout at 12:00 PM.
          </Text>
          <Button
            title="View Pending Checkouts"
            onPress={() => {}}
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
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.md,
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
    marginRight: spacing.md,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    textAlign: 'center',
  },
  activityList: {
    marginTop: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  alertCard: {
    backgroundColor: colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  alertText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});