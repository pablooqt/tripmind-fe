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
  onVerify: (otpCode: string) => void;
  email: string;
}

export default function OtpModal({ visible, onClose, onVerify, email }: OtpModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '', '', '']);

  const otpRef0 = useRef<TextInput>(null);
  const otpRef1 = useRef<TextInput>(null);
  const otpRef2 = useRef<TextInput>(null);
  const otpRef3 = useRef<TextInput>(null);
  const otpRef4 = useRef<TextInput>(null);
  const otpRef5 = useRef<TextInput>(null);
  const otpRef6 = useRef<TextInput>(null);
  const otpRef7 = useRef<TextInput>(null);

  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5, otpRef6, otpRef7];

  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', '', '', '']);
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value !== '' && index < 7) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 8) {
      alert('Harap isi lengkap 8-digit kode keamanan dari email Anda');
      return;
    }
    onVerify(enteredOtp);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }}
        className="px-6"
      >
        <View 
          style={{
            width: '95%',
            maxWidth: 360,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 20,
            position: 'relative'
          }}
          className="shadow-2xl"
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: '#F3F4F6',
              borderRadius: 99,
              padding: 6,
            }}
          >
            <Ionicons name="close" size={16} color="#373737" />
          </TouchableOpacity>

          <View className="items-center mt-2 mb-4">
            <View className="bg-brand-50 p-4 rounded-full">
              <Ionicons name="shield-checkmark" size={32} color="#196660" />
            </View>
          </View>

          <Text className="text-xl font-bold text-center text-brand-950 mb-2">
            Enter Security Code
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 24 }}>
            We've sent an 8-digit authentication{'\n'}code to{' '}
            <Text style={{ fontWeight: '600', color: '#373737' }}>{email || 'hello@traveldulu.com'}</Text>
          </Text>

          {/* 8-Digit OTP Inputs Grid */}
          <View className="flex-row justify-center mb-6" style={{ gap: 5 }}>
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
                  width: 32,
                  height: 48,
                  borderWidth: 1.5,
                  borderColor: digit !== '' ? '#196660' : '#E5E7EB',
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#373737',
                  backgroundColor: '#FFFFFF',
                }}
              />
            ))}
          </View>

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
              elevation: 4,
            }}
          >
            <Text className="text-white font-bold text-base text-center">
              Verify Code
            </Text>
          </TouchableOpacity>

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
