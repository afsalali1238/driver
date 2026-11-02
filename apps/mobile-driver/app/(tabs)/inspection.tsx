import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTripStore } from '@/store/tripStore';
import { driverApi } from '@/lib/api';

type InspectionPhase = 'PRE_TRIP' | 'POST_TRIP';

interface Photo {
  uri: string;
  phase: InspectionPhase;
  notes?: string;
  localPath?: string;
}

export default function InspectionScreen() {
  const { activeTrip } = useTripStore();
  const [preTripPhotos, setPreTripPhotos] = useState<Photo[]>([]);
  const [postTripPhotos, setPostTripPhotos] = useState<Photo[]>([]);
  const [activePhase, setActivePhase] = useState<InspectionPhase>('PRE_TRIP');
  const [uploading, setUploading] = useState(false);

  const trip = activeTrip;

  const pickImage = useCallback(async (phase: InspectionPhase) => {
    if (phase === 'PRE_TRIP' && preTripPhotos.length >= 4) {
      Alert.alert('Limit Reached', 'Maximum 4 pre-trip photos allowed');
      return;
    }
    if (phase === 'POST_TRIP' && postTripPhotos.length >= 4) {
      Alert.alert('Limit Reached', 'Maximum 4 post-trip photos allowed');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newPhoto: Photo = {
        uri: asset.uri,
        phase,
        notes: '',
        localPath: asset.uri,
      };
      if (phase === 'PRE_TRIP') setPreTripPhotos(p => [...p, newPhoto]);
      else setPostTripPhotos(p => [...p, newPhoto]);
    }
  }, [preTripPhotos.length, postTripPhotos.length]);

  const pickFromGallery = useCallback(async (phase: InspectionPhase) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      selectionLimit: phase === 'PRE_TRIP' ? 4 - preTripPhotos.length : 4 - postTripPhotos.length,
    });

    if (!result.canceled) {
      const newPhotos: Photo[] = result.assets.map(asset => ({
        uri: asset.uri,
        phase,
        notes: '',
        localPath: asset.uri,
      }));
      if (phase === 'PRE_TRIP') setPreTripPhotos(p => [...p, ...newPhotos]);
      else setPostTripPhotos(p => [...p, ...newPhotos]);
    }
  }, [preTripPhotos.length, postTripPhotos.length]);

  const removePhoto = (phase: InspectionPhase, index: number) => {
    if (phase === 'PRE_TRIP') setPreTripPhotos(p => p.filter((_, i) => i !== index));
    else setPostTripPhotos(p => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!trip) return;
    const allPhotos = [...preTripPhotos, ...postTripPhotos];
    if (allPhotos.length === 0) {
      Alert.alert('No Photos', 'Please capture at least one inspection photo');
      return;
    }

    setUploading(true);
    try {
      // In production, upload photos to S3 first, then submit URLs
      // For now, we'll submit with local URIs
      const inspectionPhotos = allPhotos.map(p => ({
        phase: p.phase,
        url: p.uri, // Would be S3 URL in production
        notes: p.notes,
      }));

      await driverApi.submitEpod(trip.id, {
        receiverName: '',
        receiverPhone: '',
        receiverDesignation: '',
        signatureImageBase64: '',
        inspectionPhotos,
        remarks: 'Inspection photos submitted',
      });

      Alert.alert('Success', 'Inspection photos submitted');
      setPreTripPhotos([]);
      setPostTripPhotos([]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to submit');
    } finally {
      setUploading(false);
    }
  };

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Trip</Text>
        <Text style={styles.emptySubtitle}>Start a trip to capture inspection photos</Text>
      </View>
    );
  }

  const currentPhotos = activePhase === 'PRE_TRIP' ? preTripPhotos : postTripPhotos;

  return (
    <ScrollView style={styles.container}>
      {/* Phase Selector */}
      <View style={styles.phaseSelector}>
        {(['PRE_TRIP', 'POST_TRIP'] as const).map((phase) => (
          <TouchableOpacity
            key={phase}
            style={[
              styles.phaseButton,
              activePhase === phase && styles.phaseButtonActive,
            ]}
            onPress={() => setActivePhase(phase)}
          >
            <Text style={[
              styles.phaseText,
              activePhase === phase && styles.phaseTextActive,
            ]}>
              {phase === 'PRE_TRIP' ? '📦 Pre-Trip Inspection' : '📍 Post-Trip Inspection'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Photo Grid */}
      <View style={styles.gridContainer}>
        {currentPhotos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity style={styles.deleteButton} onPress={() => removePhoto(activePhase, index)}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {currentPhotos.length < 4 && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={() => pickImage(activePhase)}>
            <Text style={styles.addPhotoText}>+ Add Photo</Text>
            <Text style={styles.addPhotoSubtext}>Camera</Text>
          </TouchableOpacity>
        )}
        {currentPhotos.length < 4 && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={() => pickFromGallery(activePhase)}>
            <Text style={styles.addPhotoText}>+ Add Photo</Text>
            <Text style={styles.addPhotoSubtext}>Gallery</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes */}
      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="e.g., Tie-down chains secured, no visible damage"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity style={[styles.submitButton, uploading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={uploading || currentPhotos.length === 0}>
        {uploading ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Text style={styles.submitButtonText}>Submit {activePhase} Inspection</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingBottom: 40 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  phaseSelector: { flexDirection: 'row', padding: 16, gap: 12 },
  phaseButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: 'white' },
  phaseButtonActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  phaseText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  phaseTextActive: { color: 'white' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, justifyContent: 'center' },
  photoWrapper: { position: 'relative', width: 150, height: 150 },
  photo: { width: '100%', height: '100%', borderRadius: 12 },
  deleteButton: { position: 'absolute', top: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  addPhotoButton: { width: 150, height: 150, borderRadius: 12, borderWidth: 2, borderColor: '#0ea5e9', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f9ff' },
  addPhotoText: { fontSize: 16, fontWeight: '700', color: '#0ea5e9', marginBottom: 4 },
  addPhotoSubtext: { fontSize: 12, color: '#0ea5e9' },
  notesSection: { padding: 16 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  notesInput: { height: 80, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: 'white', textAlignVertical: 'top' },
  submitButton: { marginHorizontal: 16, marginTop: 20, paddingVertical: 16, backgroundColor: '#22c55e', borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
