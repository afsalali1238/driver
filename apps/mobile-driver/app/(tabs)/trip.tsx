import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Share, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { driverApi } from '@/lib/api';
import { useTripStore } from '@/store/tripStore';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { STATUS_LABELS, STATUS_COLORS, TRIP_STATUSES } from '@/constants';
import type { TripStatus } from '@/constants';

export default function TripScreen() {
  const router = useRouter();
  const { activeTrip, setActiveTrip, updateTripStatus } = useTripStore();
  const { currentLocation, isTracking, startTracking, stopTracking } = useLocationTracking();
  const [refreshing, setRefreshing] = useState(false);

  const trip = activeTrip;
  const currentStatus = trip?.status as TripStatus || 'ASSIGNED';
  const currentIndex = TRIP_STATUSES.indexOf(currentStatus);
  const nextStatus = currentIndex < TRIP_STATUSES.length - 1 ? TRIP_STATUSES[currentIndex + 1] : null;

  const loadTrip = async () => {
    try {
      const res = await driverApi.getActiveTrip();
      if (res.data.activeTrip) setActiveTrip(res.data.activeTrip);
    } catch (e) {
      console.error('Failed to load trip:', e);
    }
  };

  useEffect(() => { loadTrip(); }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrip();
    setRefreshing(false);
  };

  
  const handleShareTrackingLink = async () => {
    if (!trip) return;
    const trackingUrl = `https://track.kasperpro.com/t/${trip.trackingToken || trip.tripCode}`;
    const message = `🚨 *KASPER FREIGHT LIVE TRACKING* 🚨\n\n📦 Cargo: ${trip.cargo?.title || 'Heavy Consignment'}\n📍 Destination: ${trip.destination?.address || 'Site'}\n🕒 Status: ${STATUS_LABELS[currentStatus]}\n\n🔗 Track Heavy Equipment Live (Zero Login):\n${trackingUrl}`;

    try {
      await Share.share({
        message,
        url: trackingUrl,
        title: `Kasper Live Tracking: ${trip.tripCode}`
      });
    } catch (error) {
      console.error('Error sharing tracking link:', error);
    }
  };

  const handleNextStatus = async () => {
    if (!nextStatus || !trip) return;
    Alert.alert(
      `Confirm ${STATUS_LABELS[nextStatus]}`,
      `Mark trip as ${STATUS_LABELS[nextStatus]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const loc = currentLocation;
              await driverApi.updateTripStatus(trip.id, nextStatus, loc?.latitude, loc?.longitude);
              updateTripStatus(nextStatus);
              if (nextStatus === 'COMPLETED') router.push('/(tabs)/epod');
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.error || 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Trip</Text>
        <Text style={styles.emptySubtitle}>You have no trips assigned at the moment.</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={refreshing}>
          <Text style={styles.refreshButtonText}>{refreshing ? 'Refreshing...' : 'Pull to Refresh'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCompleted = currentStatus === 'COMPLETED';
  const isAssigned = currentStatus === 'ASSIGNED';

  return (
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }>
      {/* Trip Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.tripCode}>{trip.tripCode}</Text>
          <View style={{ backgroundColor: STATUS_COLORS[currentStatus], paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={styles.statusText}>{STATUS_LABELS[currentStatus]}</Text>
          </View>
        </View>
        <Text style={styles.cargoTitle}>{trip.cargo.title}</Text>
        <Text style={styles.cargoSubtitle}>{trip.cargo.weightTons}t • {trip.cargo.category}</Text>
      </View>

      {/* Route Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Route</Text>
        <View style={styles.routeRow}>
          <View style={styles.locationColumn}>
            <Text style={styles.locationLabel}>PICKUP</Text>
            <Text style={styles.locationAddress}>{trip.origin.address}</Text>
            <Text style={styles.locationContact}>{trip.origin.contactName} • {trip.origin.contactPhone}</Text>
          </View>
          <View style={styles.arrowColumn}>
            <Text style={styles.arrow}>▼</Text>
            {currentStatus !== 'ASSIGNED' && currentStatus !== 'EN_ROUTE_PICKUP' && (
              <View style={styles.line} />
            )}
          </View>
          <View style={styles.locationColumn}>
            <Text style={styles.locationLabel}>DROP-OFF</Text>
            <Text style={styles.locationAddress}>{trip.destination.address}</Text>
            <Text style={styles.locationContact}>{trip.destination.contactName} • {trip.destination.contactPhone}</Text>
          </View>
        </View>
      </View>

      
      {/* Client Live Tracking Link Sharing Button */}
      <View style={styles.shareCard}>
        <View style={styles.shareCardHeader}>
          <Text style={styles.shareCardTitle}>SHARE LIVE GPS WITH CLIENT</Text>
          <Text style={styles.shareCardBadge}>TOKENIZED LINK</Text>
        </View>
        <Text style={styles.shareCardText}>Send live map link to site consignee with real-time ETA & route updates.</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareTrackingLink}>
          <Text style={styles.shareBtnText}>📲 Share Live Tracking via WhatsApp / SMS</Text>
        </TouchableOpacity>
      </View>

      {/* Live Location */}
      {currentLocation && !isCompleted && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Live Location</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.coordLabel}>Lat: {currentLocation.latitude.toFixed(6)}</Text>
            <Text style={styles.coordLabel}>Lng: {currentLocation.longitude.toFixed(6)}</Text>
            <Text style={styles.coordLabel}>Speed: {currentLocation.speed.toFixed(1)} km/h</Text>
            <Text style={styles.coordLabel}>Battery: {currentLocation.batteryLevel}%</Text>
          </View>
          <Text style={styles.trackingStatus}>
            {isTracking ? '🟢 Tracking Active' : '🔴 Tracking Paused'}
          </Text>
        </View>
      )}

      {/* Progress Steps */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Trip Progress</Text>
        <View style={styles.stepsContainer}>
          {TRIP_STATUSES.map((status, index) => (
            <View key={status} style={styles.stepRow}>
              <View style={[
                styles.stepCircle,
                index < currentIndex ? styles.stepCompleted : index === currentIndex ? styles.stepCurrent : styles.stepPending,
              ]}>
                {index < currentIndex ? <Text style={styles.checkmark}>✓</Text> : <Text style={styles.stepNumber}>{index + 1}</Text>}
              </View>
              <View style={index < TRIP_STATUSES.length - 1 ? styles.stepLine : undefined} />
              <Text style={[
                styles.stepLabel,
                index < currentIndex ? styles.stepCompletedText : index === currentIndex ? styles.stepCurrentText : styles.stepPendingText,
              ]}>
                {STATUS_LABELS[status]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Button */}
      {!isCompleted && nextStatus && (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: STATUS_COLORS[nextStatus] }]} onPress={handleNextStatus} disabled={isAssigned && currentStatus === 'ASSIGNED'}>
          <Text style={styles.actionButtonText}>Next: {STATUS_LABELS[nextStatus]}</Text>
        </TouchableOpacity>
      )}

      {isAssigned && (
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => handleNextStatus()}>
          <Text style={styles.actionButtonTextSecondary}>Start Trip → En Route to Pickup</Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={styles.completedCard}>
          <Text style={styles.completedText}>✅ Trip Completed Successfully</Text>
          <Text style={styles.completedSubtext}>Proceed to ePOD tab to complete delivery sign-off</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

import { RefreshControl } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#0ea5e9', borderRadius: 12 },
  refreshButtonText: { color: 'white', fontWeight: '600' },
  
  shareCard: { backgroundColor: '#eff6ff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  shareCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  shareCardTitle: { fontSize: 11, fontWeight: '800', color: '#1d4ed8', letterSpacing: 0.5 },
  shareCardBadge: { fontSize: 9, fontWeight: '700', color: '#1d4ed8', backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  shareCardText: { fontSize: 12, color: '#475569', marginBottom: 12, lineHeight: 16 },
  shareBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  shareBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },

  headerCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, margin: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tripCode: { fontSize: 20, fontWeight: '800', color: '#1e293b', fontFamily: 'monospace' },
  statusText: { color: 'white', fontWeight: '700', fontSize: 12 },
  cargoTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  cargoSubtitle: { fontSize: 14, color: '#64748b' },
  sectionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  locationColumn: { flex: 1 },
  arrowColumn: { width: 40, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  arrow: { fontSize: 20, color: '#0ea5e9' },
  line: { width: 2, height: 60, backgroundColor: '#e2e8f0', marginTop: 4 },
  locationLabel: { fontSize: 11, fontWeight: '700', color: '#0ea5e9', letterSpacing: 0.5, marginBottom: 4 },
  locationAddress: { fontSize: 14, color: '#1e293b', marginBottom: 4 },
  locationContact: { fontSize: 12, color: '#64748b' },
  locationInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 8 },
  coordLabel: { fontSize: 13, fontFamily: 'monospace', color: '#334155', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trackingStatus: { fontSize: 13, fontWeight: '600' },
  stepsContainer: { gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  stepCompleted: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  stepCurrent: { backgroundColor: 'white', borderColor: '#0ea5e9' },
  stepPending: { backgroundColor: 'white', borderColor: '#e2e8f0' },
  checkmark: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  stepNumber: { color: '#0ea5e9', fontSize: 14, fontWeight: '700' },
  stepLine: { position: 'absolute', left: 15, top: 32, bottom: -16, width: 2, backgroundColor: '#e2e8f0' },
  stepLabel: { flex: 1, paddingLeft: 16, fontSize: 14, paddingTop: 4 },
  stepCompletedText: { color: '#22c55e', fontWeight: '600' },
  stepCurrentText: { color: '#0ea5e9', fontWeight: '700' },
  stepPendingText: { color: '#94a3b8' },
  actionButton: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  actionButtonSecondary: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#0ea5e9' },
  actionButtonTextSecondary: { color: 'white', fontSize: 16, fontWeight: '700' },
  completedCard: { marginHorizontal: 16, marginBottom: 16, padding: 20, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center' },
  completedText: { fontSize: 18, fontWeight: '700', color: '#166534', marginBottom: 4 },
  completedSubtext: { fontSize: 14, color: '#166534', textAlign: 'center' },
});