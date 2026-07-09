import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import OtpModal from '@/components/traveler/otp-modal';
import ResetPasswordModal from '@/components/traveler/ResetPasswordModal';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL, forgotAuthPassword, verifyResetPassword, resetPasswordWithToken } from '@/services/api';
import { useAlert } from '@/context/AlertContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { login, register, verifyOtp, saveGoogleSession, isLoading } = useAuth();

  // Status Alur Autentikasi
  const [step, setStep] = useState<'role-selection' | 'auth'>('role-selection');
  const [role, setRole] = useState<'guide' | 'traveler' | null>(null);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // Status Input Formulir
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status Modal OTP
  const [showOtp, setShowOtp] = useState<boolean>(false);

  // Status Password Recovery
  const [isRecoveryFlow, setIsRecoveryFlow] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [recoverySessionToken, setRecoverySessionToken] = useState<string>('');

  const selectRole = (selectedRole: 'guide' | 'traveler') => {
    setRole(selectedRole);
    setStep('auth');
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Email & Password Required', 'Harap isi alamat email dan password Anda.', 'info');
      return;
    }

    const currentRole = role || 'traveler';

    if (isSignUp) {
      if (password !== confirmPassword) {
        showAlert('Password Mismatch', 'Konfirmasi password tidak cocok.', 'error');
        return;
      }
      
      // Default name diambil dari email prefix
      const defaultName = email.split('@')[0];
      const res = await register(defaultName, email, password, currentRole === 'guide' ? 'guide' : 'user');
      
      if (res.success) {
        setShowOtp(true);
      } else {
        showAlert('Registration Failed', res.error ?? 'Registrasi gagal.', 'error');
      }
    } else {
      // Proses Login
      const res = await login(email, password, currentRole === 'guide' ? 'guide' : 'user');
      if (res.success) {
        if (res.verified) {
          if (currentRole === 'guide') {
            router.replace('/guide-dashboard');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          // Email belum diverifikasi (error 403 / unverified)
          setShowOtp(true);
        }
      } else {
        showAlert('Login Failed', res.error ?? 'Gagal masuk. Periksa kembali email dan sandi Anda.', 'error');
      }
    }
  };

  const handleVerifyOtp = async (code: string) => {
    const currentRole = role || 'traveler';

    if (isRecoveryFlow) {
      try {
        const res = await verifyResetPassword(email, code);
        if (res.status === 'success' && res.data?.access_token) {
          setRecoverySessionToken(res.data.access_token);
          setShowOtp(false);
          setShowResetPasswordModal(true);
        } else {
          showAlert('Verification Failed', 'Gagal memverifikasi kode OTP pemulihan.', 'error');
        }
      } catch (e: any) {
        showAlert('Verification Failed', e.message || 'Kode keamanan salah atau kedaluwarsa.', 'error');
      }
      return;
    }

    const res = await verifyOtp(
      email,
      code,
      currentRole === 'guide' ? 'guide' : 'user',
      password // Auto-login setelah OTP diverifikasi
    );

    if (res.success) {
      setShowOtp(false);
      if (currentRole === 'guide') {
        router.replace('/guide-dashboard');
      } else {
        router.replace('/profiling');
      }
    } else {
      showAlert('Verification Failed', res.error ?? 'Kode keamanan salah atau kedaluwarsa.', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showAlert('Email Required', 'Harap isi kolom Mail Address terlebih dahulu untuk pemulihan kata sandi.', 'info');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('Invalid Email', 'Format email tidak valid. Harap periksa kembali.', 'error');
      return;
    }

    try {
      const res = await forgotAuthPassword(email.trim());
      if (res.status === 'success') {
        setIsRecoveryFlow(true);
        showAlert('OTP Sent', 'Kode keamanan untuk pemulihan kata sandi telah dikirim ke email Anda.', 'success', () => {
          setShowOtp(true);
        });
      } else {
        showAlert('Request Failed', res.message || 'Gagal mengirim instruksi pemulihan.', 'error');
      }
    } catch (e: any) {
      showAlert('Error', e.message || 'Terjadi kesalahan saat memproses permintaan.', 'error');
    }
  };

  const handleResetPasswordSubmit = async (newPass: string) => {
    try {
      const res = await resetPasswordWithToken(newPass, recoverySessionToken);
      if (res.status === 'success') {
        setShowResetPasswordModal(false);
        setIsRecoveryFlow(false);
        setRecoverySessionToken('');
        showAlert('Password Reset Success', 'Kata sandi Anda berhasil diperbarui! Silakan masuk menggunakan kata sandi baru Anda.', 'success');
      } else {
        showAlert('Reset Failed', res.message || 'Gagal mereset kata sandi.', 'error');
      }
    } catch (e: any) {
      showAlert('Error', e.message || 'Gagal memperbarui kata sandi.', 'error');
      throw e;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = Linking.createURL('login');
      console.log('🔗 REDIRECT URI:', redirectUri);  
      const authUrl = `https://noxdtjknzizhssbxibqh.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('📦 AUTH RESULT:', JSON.stringify(result));

      if (result.type === 'success' && result.url) {
        const fragment = result.url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          if (accessToken) {
            // Tarik profil user dari backend /me menggunakan token
            const profileRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const profileBody = await profileRes.json();
            
            if (profileRes.ok && profileBody.status === 'success') {
              const profileData = profileBody.data;
              const currentRole = role || 'traveler';

              // Simpan sesi global
              saveGoogleSession(accessToken, { ...profileData, role: currentRole === 'guide' ? 'guide' : 'user' });

              if (currentRole === 'guide') {
                router.replace('/guide-dashboard');
              } else {
                // Traveler baru yang belum onboarding diarahkan ke profiling
                if (profileData.birth_date) {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/profiling');
                }
              }
            } else {
              throw new Error(profileBody.detail ?? 'Gagal mengambil data profil Google.');
            }
          }
        }
      }
    } catch (err: any) {
      showAlert('Google Sign-In Error', err.message || 'Failed to authenticate with Google.', 'error');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/misty_mountains.png')}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Overlay Gelap untuk Kontras Desain */}
      <View className="absolute inset-0 bg-brand-900/15" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tombol Kembali ke Pemilihan Peran */}
          {step === 'auth' && (
            <TouchableOpacity
              onPress={() => setStep('role-selection')}
              activeOpacity={0.8}
              className="absolute top-14 left-6 bg-brand-900/60 p-3 rounded-full z-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
          )}

          <View className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
            {step === 'role-selection' ? (
              <View className="items-center">
                <Text className="text-2xl font-bold text-brand-950 mb-2">
                  Trip-Mind
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-8">
                  Rencanakan petualangan Anda atau pandu pelancong hebat di seluruh Indonesia
                </Text>

                <TouchableOpacity
                  onPress={() => selectRole('guide')}
                  activeOpacity={0.9}
                  className="w-full bg-brand-700 flex-row items-center justify-center py-4 rounded-xl mb-4 shadow-lg shadow-brand-700/20"
                >
                  <Ionicons name="compass-outline" size={20} color="white" className="mr-2" />
                  <Text className="text-white font-semibold text-base">
                    Login to Guide
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selectRole('traveler')}
                  activeOpacity={0.9}
                  className="w-full bg-brand-700 flex-row items-center justify-center py-4 rounded-xl shadow-lg shadow-brand-700/20"
                >
                  <Ionicons name="airplane-outline" size={20} color="white" className="mr-2" />
                  <Text className="text-white font-semibold text-base">
                    Login to Traveler
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Navigasi Tab atas: Log In vs Sign Up */}
                <View className="flex-row items-center border-b border-border-stroke mb-10" style={{ gap: 32 }}>
                  {/* Tab Log In */}
                  <TouchableOpacity
                    onPress={() => setIsSignUp(false)}
                    className={`pb-3 ${
                      !isSignUp ? 'border-b-2 border-brand-700 -mb-[1px]' : ''
                    }`}
                  >
                    <Text
                      className={`text-xl font-bold ${
                        !isSignUp ? 'text-brand-700' : 'text-gray-400'
                      }`}
                    >
                      Log In
                    </Text>
                  </TouchableOpacity>

                  {/* Tab Sign Up */}
                  <TouchableOpacity
                    onPress={() => setIsSignUp(true)}
                    className={`pb-3 ${
                      isSignUp ? 'border-b-2 border-brand-700 -mb-[1px]' : ''
                    }`}
                  >
                    <Text
                      className={`text-xl font-bold ${
                        isSignUp ? 'text-brand-700' : 'text-gray-400'
                      }`}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* KOLOM INPUT FORMULIR */}
                <View className="mb-2">
                  {/* Input 1: E-mail */}
                  <View className="flex-row items-center border border-border-stroke rounded-xl px-4 py-3 bg-neutral-white mb-4">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      placeholder="Mail Address"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={{ flex: 1, marginLeft: 12, color: '#373737', fontSize: 16 }}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Input 2: Password */}
                  <View className="flex-row items-center border border-border-stroke rounded-xl px-4 py-3 bg-neutral-white mb-4">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={{ flex: 1, marginLeft: 12, color: '#373737', fontSize: 16 }}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Input 3: Confirm Password (Hanya muncul jika Sign Up) */}
                  {isSignUp && (
                    <View className="flex-row items-center border border-border-stroke rounded-xl px-4 py-3 bg-neutral-white mb-4">
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        style={{ flex: 1, marginLeft: 12, color: '#373737', fontSize: 16 }}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Tautan Forgot Password (Hanya muncul jika Log In) */}
                {!isSignUp && (
                  <TouchableOpacity 
                    style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 24 }}
                    onPress={handleForgotPassword}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-semibold text-brand-600">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Tombol Utama Sign In / Sign Up */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  className="w-full bg-brand-700 py-4 rounded-xl items-center justify-center shadow-lg shadow-brand-700/20"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* PEMBATAS METODE SOSIAL */}
                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-border-stroke" />
                  <Text className="text-xs text-gray-400 px-4">Or continue with</Text>
                  <View className="flex-1 h-[1px] bg-border-stroke" />
                </View>

                {/* TOMBOL SOSIAL MEDIA MOCKUP & GOOGLE REAL */}
                <View className="flex-row" style={{ gap: 16 }}>
                  {/* Google Button Real */}
                  <TouchableOpacity
                    onPress={handleGoogleLogin}
                    activeOpacity={0.8}
                    className="flex-1 flex-row items-center justify-center border border-border-stroke py-3 rounded-xl bg-white"
                  >
                    <Ionicons name="logo-google" size={20} color="#EA4335" />
                    <Text className="text-brand-950 font-semibold text-sm ml-2">Google</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OtpModal
        visible={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={handleVerifyOtp}
        email={email}
      />

      <ResetPasswordModal
        visible={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onSubmit={handleResetPasswordSubmit}
      />
    </ImageBackground>
  );
}
