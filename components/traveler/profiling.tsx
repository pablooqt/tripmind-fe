import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getRecommendationsByPreference, submitTravelerProfiling } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';

const getMaxDays = (monthStr: string, yearStr: string): number => {
  const m = parseInt(monthStr, 10);
  const y = parseInt(yearStr, 10);
  
  if (isNaN(m) || m < 1 || m > 12) {
    return 31;
  }
  
  if (m === 4 || m === 6 || m === 9 || m === 11) {
    return 30;
  }
  
  if (m === 2) {
    if (!isNaN(y)) {
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
      return isLeap ? 29 : 28;
    }
    return 29;
  }
  
  return 31;
};

export default function TravelerProfiling() {
  const router = useRouter();
  const { setUserLocation } = useAuth();
  const { showAlert } = useAlert();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState({ month: '', day: '', year: '' });
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedSpeed, setSelectedSpeed] = useState<string>('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedSpice, setSelectedSpice] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<string>('');

  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: currentStep * screenWidth,
      animated: true,
    });
  }, [currentStep, screenWidth]);

  const handleRequestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLoc = await Location.getCurrentPositionAsync({});
        console.log('[Profiling] Traveler GPS Location retrieved:', currentLoc.coords);
        setUserLocation({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude
        });
      } else {
        console.log('[Profiling] Traveler location permission denied.');
      }
    } catch (err) {
      console.warn('[Profiling] Failed to request location:', err);
    } finally {
      setCurrentStep(1);
    }
  };

  const handleMonthChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    let monthVal = clean;
    
    if (clean.length === 2) {
      const num = parseInt(clean, 10);
      if (num < 1) monthVal = '01';
      else if (num > 12) monthVal = '12';
    }
    
    setBirthday(prev => {
      const maxDays = getMaxDays(monthVal, prev.year);
      let dayVal = prev.day;
      if (dayVal) {
        const dNum = parseInt(dayVal, 10);
        if (dNum > maxDays) {
          dayVal = String(maxDays).padStart(2, '0');
        }
      }
      return { ...prev, month: monthVal, day: dayVal };
    });
  };

  const handleDayChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    let dayVal = clean;
    
    const maxDays = getMaxDays(birthday.month, birthday.year);
    
    if (clean.length > 0) {
      const num = parseInt(clean, 10);
      if (clean.length === 2 && num < 1) {
        dayVal = '01';
      } else if (num > maxDays) {
        dayVal = String(maxDays).padStart(2, '0');
      }
    }
    
    setBirthday(prev => ({ ...prev, day: dayVal }));
  };

  const handleYearChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    
    setBirthday(prev => {
      let dayVal = prev.day;
      if (clean.length === 4) {
        const maxDays = getMaxDays(prev.month, clean);
        if (dayVal) {
          const dNum = parseInt(dayVal, 10);
          if (dNum > maxDays) {
            dayVal = String(maxDays).padStart(2, '0');
          }
        }
      }
      return { ...prev, year: clean, day: dayVal };
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        showAlert('Eits, tunggu dulu!', 'Tolong masukkan nama panggilan Anda agar AI kami bisa menyapa Anda dengan akrab.', 'info');
        return;
      }
      if (!birthday.month || !birthday.day || !birthday.year) {
        showAlert('Tanggal Lahir Kosong', 'Tolong isi kolom Bulan, Hari, dan Tahun agar kami bisa menyesuaikan tempat wisata berdasarkan usia Anda.', 'info');
        return;
      }
      
      const mNum = parseInt(birthday.month, 10);
      const dNum = parseInt(birthday.day, 10);
      const yNum = parseInt(birthday.year, 10);
      
      if (isNaN(mNum) || mNum < 1 || mNum > 12) {
        showAlert('Bulan Tidak Valid', 'Tolong isi kolom Bulan dengan angka 01-12.', 'error');
        return;
      }
      
      const maxDays = getMaxDays(birthday.month, birthday.year);
      if (isNaN(dNum) || dNum < 1 || dNum > maxDays) {
        showAlert('Hari Tidak Valid', `Bulan dan tahun yang Anda pilih hanya memiliki ${maxDays} hari. Tolong sesuaikan.`, 'error');
        return;
      }
      
      const currentYear = new Date().getFullYear();
      if (isNaN(yNum) || yNum < 1900 || yNum > currentYear) {
        showAlert('Tahun Tidak Valid', `Tolong masukkan tahun lahir yang valid antara 1900 dan ${currentYear}.`, 'error');
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedVibes.length === 0) {
        showAlert('Pilih Vibe Anda', 'Tolong pilih setidaknya satu vibe Bali yang menarik minat Anda.', 'info');
        return;
      }
      if (!selectedSpeed) {
        showAlert('Pilih Kecepatan Perjalanan', 'Tolong pilih seberapa cepat Anda ingin berpindah tempat wisata.', 'info');
        return;
      }
    }

    if (currentStep === 3) {
      if (!selectedSpice) {
        showAlert('Pilih Toleransi Pedas', 'Tolong pilih tingkat toleransi makanan pedas Anda.', 'info');
        return;
      }
      // Diet / Alergi boleh kosong (opsional)
    }

    if (currentStep === 4) {
      if (!selectedPersona) {
        showAlert('Pilih Persona Wisata', 'Tolong pilih tipe persona liburan yang paling menggambarkan diri Anda.', 'info');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowNotificationModal(true);
    }
  };

  const handleNotificationPermission = () => {
    setShowNotificationModal(false);
    
    // Format YYYY-MM-DD
    const dobString = `${birthday.year}-${birthday.month.padStart(2, '0')}-${birthday.day.padStart(2, '0')}`;
    
    // Susun payload preferensi sesuai kategori dan nilai Pydantic
    const preferencesPayload = [
      ...selectedVibes.map(vibe => ({
        preference_category: 'bali_vibe',
        preference_value: vibe
      })),
      {
        preference_category: 'move_pace',
        preference_value: selectedSpeed
      },
      ...selectedDiets.map(diet => ({
        preference_category: 'diet_allergy',
        preference_value: diet
      })),
      {
        preference_category: 'spice_tolerance',
        preference_value: selectedSpice
      },
      {
        preference_category: 'travel_persona',
        preference_value: selectedPersona
      }
    ];

    submitTravelerProfiling({
      name: name.trim(),
      birth_date: dobString,
      preferences: preferencesPayload
    })
      .then(() => {
        router.replace('/(tabs)/explore');
      })
      .catch((error) => {
        console.warn('Gagal menyimpan profil preferensi:', error);
        showAlert('Error', 'Gagal menyimpan preferensi Anda ke server. Masuk ke aplikasi...', 'error', () => {
          router.replace('/(tabs)/explore');
        });
      });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const vibeOptions = [
    'Beach & Sunset',
    'Cultural & Heritage',
    'Hidden Gems',
    'Wellness & Yoga',
    'Nature & Trekking',
    'Local Tastes',
    'Photography Spots',
  ];

  const speedOptions = ['Relaxed', 'Balanced', 'Packed'];

  const dietOptions = [
    'Halal Friendly',
    'Vegan',
    'Vegetarian',
    'No Pork',
    'Gluten-Free',
    'Seafood Allergy',
    'Nut Allergy',
    'Dairy-Free',
  ];

  const spiceOptions = ['Non-Spicy', 'Mild', 'Hot'];

  const personaOptions = [
    {
      id: 'The Zen Seeker',
      title: 'The Zen Seeker',
      desc: "You're all about finding that perfect moment of peace. You prefer the sound of rustling leaves over city noise and love discovering hidden sanctuaries where you can just breathe, meditate, and reconnect with yourself.",
    },
    {
      id: 'The Social Butterfly',
      title: 'The Social Butterfly',
      desc: "You love being where the heart of the action is! Whether it's a trendy neighborhood cafe or a lively community hub, you're always excited to meet new people, share stories, and soak up the vibrant energy of a crowd.",
    },
    {
      id: 'The Culture Geek',
      title: 'The Culture Geek',
      desc: "You're a storyteller at heart who wants to know the \"why\" behind every place. You live for ancient temples, local rituals, and hidden museums, diving deep into the history and traditions that make a destination truly authentic.",
    },
    {
      id: 'The Adrenaline Junkie',
      title: 'The Adrenaline Junkie',
      desc: "“Safe and steady” isn't really your style. You're always looking for the next thrill—whether it's hiking a rugged trail, catching a big wave, or finding a bold new challenge that gets your heart racing and your blood pumping.",
    },
  ];

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const toggleDiet = (diet: string) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter(d => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const renderWhyAsk = (message: string) => (
    <View
      style={{ borderColor: '#DCDCDC', borderWidth: 1 }}
      className="flex-row items-center p-3 rounded-2xl bg-brand-50/30 mb-8"
    >
      <Ionicons name="information-circle-outline" size={20} color="#373737" className="mr-2.5" />
      <Text style={{ fontSize: 11, color: '#373737', lineHeight: 15, flex: 1 }}>
        {message}
      </Text>
    </View>
  );

  const renderProgressBar = (progressPercentage: number) => (
    <View className="w-full h-2 bg-brand-50 rounded-full mb-8 relative overflow-hidden">
      <View
        style={{ width: `${progressPercentage}%` }}
        className="h-full bg-brand-700 rounded-full"
      />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: screenWidth * 6 }}
        className="flex-1"
      >
        <ImageBackground
          source={require('../../assets/images/misty_mountains.png')}
          style={{ width: screenWidth, height: screenHeight }}
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/15" />
          <View className="flex-1 justify-end">
            <SafeAreaView className="w-full">
              <View className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
                <Text className="text-[26px] font-bold text-brand-950 mb-3 tracking-tight">
                  Hey traveler! Let's see where you are.
                </Text>
                <Text className="text-[14px] text-gray-500 leading-6 mb-8">
                  To make your Bali adventure truly yours, we need a starting point. By knowing your location, our AI can tailor your day with the best nearby gems and make sure you spend more time exploring than sitting in traffic.
                </Text>
                {renderWhyAsk("why ask? so our ai can handle the traffic math for you and keep your journey smooth.")}
                <TouchableOpacity
                  onPress={handleRequestLocation}
                  activeOpacity={0.9}
                  className="w-full bg-brand-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/25"
                >
                  <Text className="text-white text-base font-bold">
                    Allow location
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </ImageBackground>

        <View style={{ width: screenWidth }} className="flex-1 bg-white">
          <SafeAreaView className="flex-1 px-8 pt-6">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                <View>
                  {renderProgressBar(20)}
                  <Text className="text-[26px] font-bold text-brand-950 mb-8 tracking-tight">
                    Hey traveler! Let's start{"\n"}something easy.
                  </Text>
                  <Text className="text-sm font-semibold text-brand-950 mb-2">
                    What should i call you?
                  </Text>
                  <TextInput
                    placeholder="Call me..."
                    placeholderTextColor="#A9A9A9"
                    value={name}
                    onChangeText={setName}
                    style={{
                      borderColor: '#DCDCDC',
                      borderWidth: 1,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: '#373737',
                      backgroundColor: '#FFFFFF',
                      marginBottom: 28,
                    }}
                  />
                  <Text className="text-sm font-semibold text-brand-950 mb-3">
                    May i know your birthday?
                  </Text>
                  <View className="flex-row gap-3 mb-8">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-brand-950 mb-1.5 pl-0.5">Month</Text>
                      <TextInput
                        placeholder="MM"
                        placeholderTextColor="#A9A9A9"
                        keyboardType="numeric"
                        maxLength={2}
                        value={birthday.month}
                        onChangeText={handleMonthChange}
                        style={{
                          borderColor: '#DCDCDC',
                          borderWidth: 1,
                          borderRadius: 16,
                          paddingVertical: 14,
                          fontSize: 15,
                          color: '#373737',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                        }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-brand-950 mb-1.5 pl-0.5">Day</Text>
                      <TextInput
                        placeholder="DD"
                        placeholderTextColor="#A9A9A9"
                        keyboardType="numeric"
                        maxLength={2}
                        value={birthday.day}
                        onChangeText={handleDayChange}
                        style={{
                          borderColor: '#DCDCDC',
                          borderWidth: 1,
                          borderRadius: 16,
                          paddingVertical: 14,
                          fontSize: 15,
                          color: '#373737',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                        }}
                      />
                    </View>
                    <View className="flex-2">
                      <Text className="text-xs font-semibold text-brand-950 mb-1.5 pl-0.5">Year</Text>
                      <TextInput
                        placeholder="YYYY"
                        placeholderTextColor="#A9A9A9"
                        keyboardType="numeric"
                        maxLength={4}
                        value={birthday.year}
                        onChangeText={handleYearChange}
                        style={{
                          borderColor: '#DCDCDC',
                          borderWidth: 1,
                          borderRadius: 16,
                          paddingVertical: 14,
                          fontSize: 15,
                          color: '#373737',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                        }}
                      />
                    </View>
                  </View>
                  {renderWhyAsk("why ask? it helps our ai find travel spots that fit your age perfectly.")}
                </View>
                <View className="flex-row items-center pt-4 pb-8 bg-white">
                  <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.9}
                    className="flex-1 bg-brand-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/20"
                  >
                    <Text className="text-white text-base font-bold">
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>

        <View style={{ width: screenWidth }} className="flex-1 bg-white">
          <SafeAreaView className="flex-1 px-8 pt-6">
            <View className="flex-1 justify-between">
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {renderProgressBar(40)}
                <Text className="text-[24px] font-bold text-brand-950 mb-2 tracking-tight">
                  {name ? `${name} is a great name, traveler` : 'Hey traveler! Great choice.'}
                </Text>
                <Text className="text-[13px] text-gray-500 leading-5 mb-6">
                  We love that you're joining us! Pick a few things you enjoy doing so we can find the perfect spots that match your energy.
                </Text>
                <Text className="text-base font-bold text-brand-950 mb-1">
                  What's your ideal Bali vibe?
                </Text>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={13} color="#777" className="mr-1" />
                  <Text style={{ fontSize: 11, color: '#777' }}>
                    feel free to pick as many as you need.
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5 mb-8">
                  {vibeOptions.map((vibe) => {
                    const isSelected = selectedVibes.includes(vibe);
                    return (
                      <TouchableOpacity
                        key={vibe}
                        onPress={() => toggleVibe(vibe)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: isSelected ? '#196660' : '#F5F5F5',
                          borderColor: isSelected ? 'transparent' : '#DCDCDC',
                          borderWidth: isSelected ? 0 : 1,
                        }}
                        className="px-4 py-2.5 rounded-full"
                      >
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : '#373737',
                            fontSize: 12.5,
                            fontWeight: '600',
                          }}
                        >
                          {vibe}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text className="text-base font-bold text-brand-950 mb-3">
                  How fast do you like to move?
                </Text>
                <View className="mb-8">
                  {speedOptions.map((speed) => {
                    const isSelected = selectedSpeed === speed;
                    return (
                      <TouchableOpacity
                        key={speed}
                        onPress={() => setSelectedSpeed(speed)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: isSelected ? '#196660' : '#F5F5F5',
                        }}
                        className="w-full py-4 px-6 rounded-2xl mb-3 flex-row items-center pl-6"
                      >
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : '#373737',
                            fontSize: 14.5,
                            fontWeight: '600',
                          }}
                        >
                          {speed}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View className="flex-row items-center pt-4 pb-8 gap-4 bg-white">
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.8}
                  className="w-14 h-14 bg-brand-950 rounded-2xl items-center justify-center shadow-md shadow-brand-950/20"
                >
                  <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.9}
                  className="flex-1 bg-brand-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/20"
                >
                  <Text className="text-white text-base font-bold">
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ width: screenWidth }} className="flex-1 bg-white">
          <SafeAreaView className="flex-1 px-8 pt-6">
            <View className="flex-1 justify-between">
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {renderProgressBar(60)}
                <Text className="text-[24px] font-bold text-brand-950 mb-2 tracking-tight">
                  Eat well, travel better.
                </Text>
                <Text className="text-[13px] text-gray-500 leading-5 mb-6">
                  Bali has it all! Tell us if you have any dietary preferences or allergies so our AI can find the safest and most delicious spots for you.
                </Text>
                <Text className="text-base font-bold text-brand-950 mb-1">
                  Any specific diet or allergies?
                </Text>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={13} color="#777" className="mr-1" />
                  <Text style={{ fontSize: 11, color: '#777' }}>
                    feel free to pick as many as you need.
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5 mb-8">
                  {dietOptions.map((diet) => {
                    const isSelected = selectedDiets.includes(diet);
                    return (
                      <TouchableOpacity
                        key={diet}
                        onPress={() => toggleDiet(diet)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: isSelected ? '#196660' : '#F5F5F5',
                          borderColor: isSelected ? 'transparent' : '#DCDCDC',
                          borderWidth: isSelected ? 0 : 1,
                        }}
                        className="px-4 py-2.5 rounded-full"
                      >
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : '#373737',
                            fontSize: 12.5,
                            fontWeight: '600',
                          }}
                        >
                          {diet}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text className="text-base font-bold text-brand-950 mb-3">
                  How's your spice tolerance?
                </Text>
                <View className="mb-8">
                  {spiceOptions.map((spice) => {
                    const isSelected = selectedSpice === spice;
                    return (
                      <TouchableOpacity
                        key={spice}
                        onPress={() => setSelectedSpice(spice)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: isSelected ? '#196660' : '#F5F5F5',
                        }}
                        className="w-full py-4 px-6 rounded-2xl mb-3 flex-row items-center pl-6"
                      >
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : '#373737',
                            fontSize: 14.5,
                            fontWeight: '600',
                          }}
                        >
                          {spice}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View className="flex-row items-center pt-4 pb-8 gap-4 bg-white">
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.8}
                  className="w-14 h-14 bg-brand-950 rounded-2xl items-center justify-center shadow-md shadow-brand-950/20"
                >
                  <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.9}
                  className="flex-1 bg-brand-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/20"
                >
                  <Text className="text-white text-base font-bold">
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ width: screenWidth }} className="flex-1 bg-white">
          <SafeAreaView className="flex-1 px-8 pt-6">
            <View className="flex-1 justify-between">
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {renderProgressBar(80)}
                <Text className="text-[24px] font-bold text-brand-950 mb-2 tracking-tight">
                  What's your travel persona?
                </Text>
                <Text className="text-[13px] text-gray-500 leading-5 mb-6">
                  Are you here to find peace, or are you chasing the next big adventure? Tell us your style so our AI knows exactly what to look for.
                </Text>
                <View className="mb-6">
                  {personaOptions.map((persona) => {
                    const isSelected = selectedPersona === persona.id;
                    return (
                      <TouchableOpacity
                        key={persona.id}
                        onPress={() => setSelectedPersona(persona.id)}
                        activeOpacity={0.9}
                        style={{
                          backgroundColor: isSelected ? '#196660' : '#F5F5F5',
                          borderColor: isSelected ? 'transparent' : '#DCDCDC',
                          borderWidth: isSelected ? 0 : 1,
                        }}
                        className="w-full p-5 rounded-2xl mb-4 shadow-sm"
                      >
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : '#373737',
                            fontSize: 15,
                            fontWeight: '700',
                            marginBottom: 6,
                          }}
                        >
                          {persona.title}
                        </Text>
                        <Text
                          style={{
                            color: isSelected ? '#E2F5F1' : '#6A6A6A',
                            fontSize: 11.5,
                            lineHeight: 16.5,
                          }}
                        >
                          {persona.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View className="flex-row items-center pt-4 pb-8 gap-4 bg-white">
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.8}
                  className="w-14 h-14 bg-brand-950 rounded-2xl items-center justify-center shadow-md shadow-brand-950/20"
                >
                  <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.9}
                  className="flex-1 bg-brand-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/20"
                >
                  <Text className="text-white text-base font-bold">
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ width: screenWidth }} className="flex-1 bg-white">
          <SafeAreaView className="flex-1 px-8 pt-6">
            <View className="flex-1 justify-between">
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {renderProgressBar(100)}
                <Text className="text-[26px] font-bold text-brand-950 mb-4 tracking-tight">
                  You're all set, {name || 'traveler'}!
                </Text>
                <Text className="text-[14px] text-gray-500 leading-6 mb-8">
                  Your profile is ready and our AI is already mapping out some magic for you. To keep your journey smooth, we'd love to send you real-time updates.
                </Text>
              </ScrollView>

              <View className="pt-4 pb-8 bg-white">
                <Text className="text-[11.5px] text-gray-400 text-center leading-5 mb-5 px-3">
                  Just a heads-up: tapping the button below will prompt a request to enable notifications, so we can send you real-time trip updates.
                </Text>
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.9}
                  className="w-full bg-brand-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/20"
                >
                  <Text className="text-white text-base font-bold">
                    Start Exploring
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ScrollView>

      {showNotificationModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 28,
            zIndex: 100,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 320,
              backgroundColor: '#FFFFFF',
              borderRadius: 32,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View style={{ width: '100%', alignItems: 'center', marginVertical: 10, position: 'relative' }}>
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: '#E2F5F1',
                  position: 'absolute',
                  top: 20,
                  opacity: 0.65,
                }}
              />
              <View style={{ width: '100%', alignItems: 'center', zIndex: 10 }}>
                <View
                  style={{
                    width: '82%',
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#EEEEEE',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: -16,
                    opacity: 0.5,
                    zIndex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 10, color: '#373737' }}>
                    Good morning, {name || 'traveler'}.
                  </Text>
                  <Text style={{ fontSize: 8, color: '#888' }}>now</Text>
                </View>
                <View
                  style={{
                    width: '95%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#E6E6E6',
                    padding: 14,
                    zIndex: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: '#A3ECDE',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="flash" size={16} color="#196660" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <Text style={{ fontWeight: '700', fontSize: 12, color: '#373737' }}>
                        Good morning, {name || 'traveler'}.
                      </Text>
                      <Text style={{ fontSize: 9, color: '#888' }}>1h ago</Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#555', lineHeight: 14.5 }}>
                      3 destinations mapped for today. Ready to explore?
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: '88%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#EEEEEE',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginTop: -14,
                    opacity: 0.7,
                    zIndex: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      backgroundColor: '#E2F5F1',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="flash" size={10} color="#1C857C" />
                  </View>
                  <Text style={{ fontSize: 9.5, color: '#666', flex: 1 }} numberOfLines={1}>
                    4 local gems identified. Ready to head out?
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontSize: 12.5,
                color: '#666666',
                textAlign: 'center',
                lineHeight: 18,
                marginTop: 24,
                marginBottom: 28,
                paddingHorizontal: 6,
              }}
            >
              Get real-time updates on your itinerary, live traffic alerts, and AI-powered hidden gems as you explore Bali.
            </Text>
            <TouchableOpacity
              onPress={handleNotificationPermission}
              activeOpacity={0.9}
              className="w-full bg-brand-700 py-4 rounded-2xl items-center justify-center shadow-lg shadow-brand-700/25 mb-3"
            >
              <Text className="text-white text-[15px] font-bold">
                Allow
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNotificationPermission}
              activeOpacity={0.7}
              className="py-1.5"
            >
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#555555' }}>
                Not Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
