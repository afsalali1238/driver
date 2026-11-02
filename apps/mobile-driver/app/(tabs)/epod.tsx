import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { driverApi } from '@/lib/api';
import { useTripStore } from '@/store/tripStore';
import SignatureCanvas, { SignatureCanvasRef } from '@/components/SignatureCanvas';

export default function EpodScreen() {
  const router = useRouter();
  const { activeTrip, setActiveTrip } = useTripStore();
  const signatureRef = useRef<SignatureCanvasRef>(null);
  
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverDesignation, setReceiverDesignation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const trip = activeTrip;

  const handleSubmit = async () => {
    if (!trip) return;
    if (!receiverName.trim()) {
      Alert.alert('Required', 'Please enter receiver name');
      return;
    }
    if (!receiverPhone.trim()) {
      Alert.alert('Required', 'Please enter receiver phone');
      return;
    }

    const signature = signatureRef.current?.getSignature();
    if (!signature || signature.isEmpty) {
      Alert.alert('Required', 'Please capture receiver signature');
      return;
    }

    setSubmitting(true);
    try {
      const signatureBase64 = signatureRef.current?.toBase64() || '';
      
      await driverApi.submitEpod(trip.id, {
        receiverName,
        receiverPhone,
        receiverDesignation,
        signatureImageBase64: signatureBase64,
        inspectionPhotos: [], // Already submitted in inspection tab
        remarks,
      });

      setActiveTrip(null); // Clear active trip
      Alert.alert('Success', 'Delivery completed and ePOD submitted');
      router.replace('/(tabs)/trip');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to submit ePOD');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  if (!trip || trip.status !== 'AT_DESTINATION') {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>ePOD Not Available</Text>
        <Text style={styles.emptySubtitle}>
          {trip?.status === 'COMPLETED' 
            ? 'This trip has already been completed.' 
            : 'Complete the trip to "Arrived at Site" status to access ePOD.'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={50}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.tripCode}>{trip.tripCode}</Text>
          <Text style={styles.cargoTitle}>{trip.cargo.title}</Text>
          <View style={{ backgroundColor: '#a855f7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 }}>
            <Text style={styles.statusText}>Arrived at Site</Text>
          </View>
        </View>

        {/* Receiver Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Receiver Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={receiverName} onChangeText={setReceiverName} placeholder="Enter receiver full name" autoCapitalize="words" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput style={styles.input} value={receiverPhone} onChangeText={setReceiverPhone} placeholder="+971501234567" keyboardType="phone-pad" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Designation</Text>
            <TextInput style={styles.input} value={receiverDesignation} onChangeText={setReceiverDesignation} placeholder="e.g., Site Manager, Storekeeper" />
          </View>
        </View>

        {/* Signature Canvas */}
        <View style={styles.sectionCard}>
          <View style={styles.signatureHeader}>
            <Text style={styles.sectionTitle}>Receiver Signature</Text>
            <TouchableOpacity style={styles.clearButton} onPress={() => setShowClearConfirm(true)}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signatureContainer}>
            <SignatureCanvas ref={signatureRef} style={styles.signatureCanvas} />
          </View>
          <Text style={styles.signatureHint}>Have the receiver sign above</Text>
        </View>

        {/* Remarks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Remarks (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="e.g., Received in good order, no damage noted"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
          {submitting ? <ActivityIndicator color="white" size="large" /> : <Text style={styles.submitButtonText}>Complete Delivery & Submit ePOD</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Clear Signature?</Text>
            <Text style={styles.modalText}>This will erase the current signature. Continue?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setShowClearConfirm(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={() => { handleClear(); setShowClearConfirm(false); }}>
                <Text style={styles.modalButtonTextConfirm}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  headerCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tripCode: { fontSize: 18, fontWeight: '800', color: '#1e293b', fontFamily: 'monospace', marginBottom: 4 },
  cargoTitle: { fontSize: 16, color: '#64748b', marginBottom: 8 },
  statusText: { color: 'white', fontWeight: '700', fontSize: 12 },
  sectionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  signatureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fef2f2', borderRadius: 8 },
  clearButtonText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  signatureContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', backgroundColor: 'white' },
  signatureCanvas: { width: '100%', height: 200 },
  signatureHint: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, fontSize: 15, backgroundColor: 'white' },
  textArea: { height: 80, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: 'white', textAlignVertical: 'top' },
  submitButton: { marginTop: 8, paddingVertical: 16, backgroundColor: '#10b981', borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButtonCancel: { flex: 1, paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 10, alignItems: 'center' },
  modalButtonConfirm: { flex: 1, paddingVertical: 12, backgroundColor: '#ef4444', borderRadius: 10, alignItems: 'center' },
  modalButtonText: { color: '#334155', fontWeight: '600' },
  modalButtonTextConfirm: { color: 'white', fontWeight: '600' },
});
