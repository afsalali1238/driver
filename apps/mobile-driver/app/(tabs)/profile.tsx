import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { driverApi } from '@/lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { driver, token, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); }},
    ]);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await driverApi.getActiveTrip();
      Alert.alert('Refreshed', 'Profile data updated');
    } catch (e) {
      Alert.alert('Error', 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
    >
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{driver?.fullName?.charAt(0) || 'D'}</Text>
          </View>
        </View>
        <Text style={styles.driverName}>{driver?.fullName || 'Driver'}</Text>
        <Text style={styles.driverPhone}>{driver?.phone || ''}</Text>
        <View style={[
          styles.statusBadge,
          driver?.status === 'ON_TRIP' ? styles.statusActiveBadge : driver?.status === 'AVAILABLE' ? styles.statusAvailableBadge : styles.statusOffDutyBadge,
        ]}>
          <Text style={styles.statusText}>
            {driver?.status === 'ON_TRIP' ? '● ON ACTIVE TRIP' : driver?.status === 'AVAILABLE' ? '● AVAILABLE FOR DISPATCH' : 'OFF DUTY'}
          </Text>
        </View>
      </View>

      {/* Vehicle Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Assigned Heavy Vehicle</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Plate Number</Text>
            <Text style={styles.infoValue}>{driver?.assignedVehiclePlate || 'DXB-T-49102'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fleet Type</Text>
            <Text style={styles.infoValue}>Heavy Transport (UAE)</Text>
          </View>
        </View>
      </View>

      {/* Driver Operational Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Telemetry & Privacy Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Trip-Gated Privacy</Text>
          <Text style={styles.settingSubtext}>GPS operates strictly between Start Trip and ePOD sign-off</Text>
        </View>
        <View style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 }]}>
          <Text style={styles.settingTitle}>Offline Buffer Health</Text>
          <Text style={styles.settingSubtext}>SQLite engine automatically buffers desert & port site breadcrumbs</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.actionButtonText}>Sync Status</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 40 },
  headerCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, margin: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 36, fontWeight: '800', color: 'white' },
  driverName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  driverPhone: { fontSize: 15, fontFamily: 'monospace', color: '#64748b', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusActiveBadge: { backgroundColor: '#dcfce7' },
  statusAvailableBadge: { backgroundColor: '#e0f2fe' },
  statusOffDutyBadge: { backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  sectionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.6 },
  infoRow: { flexDirection: 'row', gap: 16 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  settingItem: { marginBottom: 8 },
  settingTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  settingSubtext: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  actionsSection: { paddingHorizontal: 16, marginTop: 8 },
  actionButton: { backgroundColor: '#0ea5e9', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  logoutButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  logoutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
