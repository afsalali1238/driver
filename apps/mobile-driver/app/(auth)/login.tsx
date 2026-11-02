import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { driverApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken, setDriver } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar' | 'ur'>('en');

  const translations = {
    en: { title: 'Kasper Driver', subtitle: 'Sign in to continue', phoneLabel: 'Phone Number', sendOtp: 'Send OTP', otpLabel: 'Enter OTP', verify: 'Verify & Continue', invalidPhone: 'Enter a valid UAE phone number', otpSent: 'OTP sent successfully', invalidOtp: 'Invalid OTP. Try again.', somethingWrong: 'Something went wrong' },
    ar: { title: 'كاسبر للسائقين', subtitle: 'تسجيل الدخول للمتابعة', phoneLabel: 'رقم الهاتف', sendOtp: 'إرسال الرمز', otpLabel: 'أدخل الرمز', verify: 'تحقق والمتابعة', invalidPhone: 'أدخل رقم هاتف إماراتي صحيح', otpSent: 'تم إرسال الرمز بنجاح', invalidOtp: 'رمز غير صحيح. حاول مرة أخرى.', somethingWrong: 'حدث خطأ ما' },
    ur: { title: 'کسپر ڈرائیور', subtitle: 'جاری رکھنے کے لیے سائن ان کریں', phoneLabel: 'فون نمبر', sendOtp: 'او ٹی پی بھیجیں', otpLabel: 'او ٹی پی درج کریں', verify: 'تصدیق اور جاری رکھیں', invalidPhone: 'درست یو اے ای فون نمبر درج کریں', otpSent: 'او ٹی پی کامیابی سے بھیجا گیا', invalidOtp: 'غلط او ٹی پی۔ دوبارہ کوشش کریں۔', somethingWrong: 'کچھ غلط ہو گیا' },
  };

  const t = translations[selectedLanguage];

  const handleSendOtp = async () => {
    if (!phoneNumber.match(/^\+971\d{9}$/)) {
      setError(t.invalidPhone);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await driverApi.requestOtp(phoneNumber);
      setStep('otp');
      Alert.alert('Success', t.otpSent);
    } catch (e: any) {
      setError(e.response?.data?.error || t.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError(t.invalidOtp);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const deviceInfo = { platform: Platform.OS, model: 'Unknown', osVersion: 'Unknown', appVersion: '1.0.0' };
      const res = await driverApi.verifyOtp(phoneNumber, otp, deviceInfo);
      setToken(res.data.token);
      setDriver(res.data.driver);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.error || t.invalidOtp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={50}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Language Selector */}
        <View style={styles.languageSelector}>
          {(['en', 'ar', 'ur'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langButton,
                selectedLanguage === lang && styles.langButtonActive,
              ]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text style={[
                styles.langText,
                selectedLanguage === lang && styles.langTextActive,
              ]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🚛</Text>
          </View>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {step === 'phone' ? (
          <View style={styles.form}>
            <Text style={styles.label}>{t.phoneLabel}</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+971501234567"
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={13}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{t.sendOtp}</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>{t.otpLabel}</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="123456"
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
            />
            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{t.verify}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Change Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  languageSelector: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  langButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  langButtonActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  langText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  langTextActive: { color: 'white' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  error: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { height: 52, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, backgroundColor: 'white' },
  otpInput: { letterSpacing: 8, fontSize: 24 },
  button: { height: 52, backgroundColor: '#0ea5e9', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  backButton: { marginTop: 16, alignItems: 'center' },
  backButtonText: { color: '#0ea5e9', fontSize: 14, fontWeight: '600' },
});
