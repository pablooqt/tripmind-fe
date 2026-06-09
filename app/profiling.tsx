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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRecommendationsByPreference } from '@/services/api';

export default function ProfilingScreen() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  // Status Langkah (0 sampai 5)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState({ month: '', day: '', year: '' });
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Beach & Sunset', 'Hidden Gems', 'Photography Spots']);
  const [selectedSpeed, setSelectedSpeed] = useState<string>('Balanced');
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['Halal Friendly', 'Seafood Allergy']);
  const [selectedSpice, setSelectedSpice] = useState<string>('Mild');
  const [selectedPersona, setSelectedPersona] = useState<string>('The Social Butterfly');

  // Status Modal Notifikasi
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  useEffect(() => {
    // Geser halaman secara halus ke indeks langkah yang ditargetkan
    scrollViewRef.current?.scrollTo({
      x: currentStep * screenWidth,
      animated: true,
    });
  }, [currentStep, screenWidth]);

  // Penanganan Tombol Lanjut (Next)
  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        Alert.alert('Eits, tunggu dulu!', 'Tolong masukkan nama panggilan Anda agar AI kami bisa menyapa Anda dengan akrab.');
        return;
      }
      if (!birthday.month || !birthday.day || !birthday.year) {
        Alert.alert('Tanggal Lahir Kosong', 'Tolong isi kolom Bulan, Hari, dan Tahun agar kami bisa menyesuaikan tempat wisata berdasarkan usia Anda.');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowNotificationModal(true);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNotificationPermission = async () => {
    setShowNotificationModal(false);
    setIsLoading(true);
    try {
      const dobString = `${birthday.month.padStart(2, '0')}/${birthday.day.padStart(2, '0')}/${birthday.year}`;
      await getRecommendationsByPreference({
        user_preferences: [selectedPersona, ...selectedVibes],
        dob_string: dobString,
        mode: 'exploration',
        limit: 6,
      });
    } catch (error) {
      console.warn('Gagal prefetch rekomendasi:', error);
    } finally {
      setIsLoading(false);
      router.replace('/(tabs)/explore');
    }
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
          source={require('../assets/images/misty_mountains.png')}
          style={{ width: screenWidth, height: screenHeight }}
          resizeMode="cover"
        >
          {/* Overlay Gelap Tipis untuk Kontras */}
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
                  onPress={() => setCurrentStep(1)}
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
              className="flex-1 justify-between"
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {renderProgressBar(20)}

                <Text className="text-[26px] font-bold text-brand-950 mb-8 tracking-tight">
                  Hey traveler! Let's start{"\n"}something easy.
                </Text>

                {/* Kolom 1: Nama Panggilan */}
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

                {/* Kolom 2: Tanggal Lahir */}
                <Text className="text-sm font-semibold text-brand-950 mb-3">
                  May i know your birthday?
                </Text>

                <View className="flex-row gap-3 mb-8">
                  {/* Bulan */}
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-brand-950 mb-1.5 pl-0.5">Month</Text>
                    <TextInput
                      placeholder="MM"
                      placeholderTextColor="#A9A9A9"
                      keyboardType="numeric"
                      maxLength={2}
                      value={birthday.month}
                      onChangeText={val => setBirthday(prev => ({ ...prev, month: val }))}
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

                  {/* Hari */}
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-brand-950 mb-1.5 pl-0.5">Day</Text>
                    <TextInput
                      placeholder="DD"
                      placeholderTextColor="#A9A9A9"
                      keyboardType="numeric"
                      maxLength={2}
                      value={birthday.day}
                      onChangeText={val => setBirthday(prev => ({ ...prev, day: val }))}
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

                  {/* Tahun */}
                  <View className="flex-2">
                    <Text className="text-xs font-semibold text-brand-950 mb-1.5 pl-0.5">Year</Text>
                    <TextInput
                      placeholder="YYYY"
                      placeholderTextColor="#A9A9A9"
                      keyboardType="numeric"
                      maxLength={4}
                      value={birthday.year}
                      onChangeText={val => setBirthday(prev => ({ ...prev, year: val }))}
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
              </ScrollView>

              {/* Tombol Kontrol Bawah */}
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

                {/* Sub-judul Vibe */}
                <Text className="text-base font-bold text-brand-950 mb-1">
                  What's your ideal Bali vibe?
                </Text>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={13} color="#777" className="mr-1" />
                  <Text style={{ fontSize: 11, color: '#777' }}>
                    feel free to pick as many as you need.
                  </Text>
                </View>

                {/* Grid Pilihan Vibe */}
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

                {/* Pilihan Kecepatan Perjalanan (Speed) */}
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

              {/* Tombol Kontrol Bawah */}
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

                {/* Sub-judul Diet */}
                <Text className="text-base font-bold text-brand-950 mb-1">
                  Any specific diet or allergies?
                </Text>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={13} color="#777" className="mr-1" />
                  <Text style={{ fontSize: 11, color: '#777' }}>
                    feel free to pick as many as you need.
                  </Text>
                </View>

                {/* Grid Pilihan Diet */}
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

                {/* Pilihan Spice Tolerance */}
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

              {/* Tombol Kontrol Bawah */}
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

                {/* Daftar Vertikal Kartu Travel Persona */}
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

              {/* Tombol Kontrol Bawah */}
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

              {/* Bagian Bawah */}
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
          {/* Popup Card */}
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
            {/* Notification Mockup Container Area */}
            <View style={{ width: '100%', alignItems: 'center', marginVertical: 10, position: 'relative' }}>

              {/* Soft Gradient/Radial Vignette Effect */}
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

              {/* Cards Stack */}
              <View style={{ width: '100%', alignItems: 'center', zIndex: 10 }}>
                {/* 1. Top Card (staggered backdrop) */}
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

                {/* 2. Middle Card (Focused primary card) */}
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
                  {/* Brand Logo with Lightning bolt */}
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

                {/* 3. Bottom Card (staggered outline) */}
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

            {/* Description Text */}
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

            {/* Action Buttons */}
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
