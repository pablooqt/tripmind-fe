import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OtpModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: () => void;
  email: string;
}

export default function OtpModal({ visible, onClose, onVerify, email }: OtpModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);

  // Refs untuk Kotak Input OTP dideklarasikan secara eksplisit untuk React Compiler
  const otpRef0 = useRef<TextInput>(null);
  const otpRef1 = useRef<TextInput>(null);
  const otpRef2 = useRef<TextInput>(null);
  const otpRef3 = useRef<TextInput>(null);

  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  // Reset OTP saat modal dibuka kembali
  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '']);
      // Fokus kotak pertama setelah modal terbuka
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    }
  }, [visible]);

  // Penanganan Input OTP
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Ambil hanya karakter terakhir
    setOtp(newOtp);

    // Otomatis pindah ke kotak berikutnya jika angka diisi
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Otomatis pindah ke kotak sebelumnya jika tombol hapus (backspace) ditekan saat kosong
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      alert('Harap isi lengkap 4-digit kode keamanan');
      return;
    }
    onVerify();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay Gelap Latar Belakang Modal - Digelapkan Mendalam */}
      <View 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }}
        className="px-6"
      >
        {/* Kartu Modal Putih dengan Lebar Terkunci */}
        <View 
          style={{
            width: '90%',
            maxWidth: 340,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 24,
            position: 'relative'
          }}
          className="shadow-2xl"
        >
          
          {/* Tombol Tutup Silang Melingkar (Sesuai Figma Close Up) */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: '#F3F4F6', // Latar lingkaran abu-abu terang
              borderRadius: 99,
              padding: 6,
            }}
          >
            <Ionicons name="close" size={16} color="#373737" />
          </TouchableOpacity>

          {/* Ikon Perisai di Atas */}
          <View className="items-center mt-2 mb-4">
            <View className="bg-brand-50 p-4 rounded-full">
              <Ionicons name="shield-checkmark" size={32} color="#196660" />
            </View>
          </View>

          {/* Judul & Deskripsi Modal */}
          <Text className="text-xl font-bold text-center text-brand-950 mb-2">
            Enter Security Code
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            We've sent a 4-digit authentication{'\n'}code to{' '}
            <Text style={{ fontWeight: '600', color: '#373737' }}>{email || 'hello@traveldulu.com'}</Text>
          </Text>

          {/* KOTAK INPUT 4-DIGIT OTP (KUADRAT BULAT DENGAN GAP LEBAR) */}
          <View className="flex-row justify-center mb-6" style={{ gap: 16 }}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={otpRefs[index]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleOtpKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={{
                  width: 54,
                  height: 54, // Kuadrat sempurna
                  borderWidth: 1.5,
                  borderColor: digit !== '' ? '#196660' : '#E5E7EB',
                  borderRadius: 16, // Sudut bulat manis
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#373737',
                  backgroundColor: '#FFFFFF',
                }}
              />
            ))}
          </View>

          {/* Tombol Verifikasi Kode (Sesuai Desain Figma) */}
          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={0.9}
            style={{
              backgroundColor: '#196660',
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              shadowColor: '#196660',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4, // Efek shadow pada Android
            }}
          >
            <Text className="text-white font-bold text-lg text-center">
              Verify Code
            </Text>
          </TouchableOpacity>

          {/* Tautan Kirim Ulang OTP */}
          <View className="flex-row justify-center mt-5">
            <Text className="text-sm text-gray-400">Didn't Receive it? </Text>
            <TouchableOpacity>
              <Text className="text-sm font-bold text-brand-700">Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
