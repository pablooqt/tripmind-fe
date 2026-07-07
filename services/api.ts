// ============================================================
//  TripMind API Service
//  Semua request ke backend lewat sini — import pakai @/services/api
// ============================================================

import Constants from 'expo-constants';

// Mendapatkan IP address laptop/PC secara dinamis agar berjalan di HP Fisik maupun Emulator
const getDebuggerHost = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return 'localhost';
  return hostUri.split(':')[0];
};

export const BASE_URL = `http://${getDebuggerHost()}:8000`;


// ============================================================
//  Types
// ============================================================

export interface DestinationCard {
  id: number;
  place_name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_urls: string[];
  tags: string[];
  price: number;
  rating: number;
  opening_hours: string;
  ai_context?: string;
  regency?: string;
  type: string; // "preference" | "exploration_random" | "similar_destination"
}

export interface PreferenceRequest {
  user_preferences: string[];
  dob_string: string;        // Format: "MM/DD/YYYY"
  mode?: "normal" | "exploration";
  limit?: number;
}

export interface SimilarRequest {
  target_destination_id: number;
  limit?: number;
}

// ============================================================
//  Helper: Generic Fetch
// ============================================================

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const globalToken = (global as any).apiToken;
  if (globalToken) {
    headers["Authorization"] = `Bearer ${globalToken}`;
  }

  const response = await fetch(url, {
    headers: { ...headers, ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.detail ?? `HTTP Error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ============================================================
//  Health Check
// ============================================================

/** Cek apakah API Gateway hidup */
export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const data = await apiRequest<{ message: string }>("/");
    return !!data.message;
  } catch {
    return false;
  }
}

// ============================================================
//  AI Service — Rekomendasi Destinasi
// ============================================================

/**
 * Rekomendasi destinasi berdasarkan profil user.
 * Pakai di halaman Beranda / setelah onboarding.
 *
 * @example
 * const destinations = await getRecommendationsByPreference({
 *   user_preferences: ["Hidden Gems", "The Zen Seeker"],
 *   dob_string: "05/15/2000",
 *   mode: "exploration",
 * });
 */
export async function getRecommendationsByPreference(
  params: PreferenceRequest
): Promise<DestinationCard[]> {
  return apiRequest<DestinationCard[]>("/ai/recommendation/api/v1/preferences", {
    method: "POST",
    body: JSON.stringify({
      user_preferences: params.user_preferences,
      dob_string: params.dob_string,
      mode: params.mode ?? "normal",
      limit: params.limit ?? 6,
    }),
  });
}

/**
 * Rekomendasi destinasi yang mirip dengan destinasi tertentu.
 * Pakai di halaman Detail Destinasi.
 *
 * @example
 * const similar = await getSimilarDestinations({ target_destination_id: 42 });
 */
export async function getSimilarDestinations(
  params: SimilarRequest
): Promise<DestinationCard[]> {
  return apiRequest<DestinationCard[]>("/ai/recommendation/similar", {
    method: "POST",
    body: JSON.stringify({
      target_destination_id: params.target_destination_id,
      limit: params.limit ?? 6,
    }),
  });
}

// ============================================================
//  Preferences & Saved Onboarding Profiling
// ============================================================

export interface PreferenceItem {
  preference_category: string; // 'bali_vibe' | 'move_pace' | 'diet_allergy' | 'spice_tolerance' | 'travel_persona'
  preference_value: string;
}

export interface ProfilingRequest {
  name?: string;
  birth_date?: string; // YYYY-MM-DD
  preferences: PreferenceItem[];
}

/** Menyimpan profil awal traveler dan preferensi liburan ke database */
export async function submitTravelerProfiling(
  payload: ProfilingRequest
): Promise<{ status: string; message: string }> {
  return apiRequest<{ status: string; message: string }>("/api/v1/preferences/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Mengambil profil dan preferensi traveler yang sedang login */
export async function getUserProfileAndPreferences(): Promise<any> {
  const response = await apiRequest<{ status: string; data: any }>("/api/v1/preferences/");
  return response.data;
}


/** Mengambil daftar destinasi rekomendasi AI berdasarkan profil preferensi traveler di database */
export async function getRecommendationsFromProfile(params: {
  mode?: "normal" | "exploration";
  limit?: number;
}): Promise<DestinationCard[]> {
  const mode = params.mode ?? "normal";
  const limit = params.limit ?? 6;
  const response = await apiRequest<{ status: string; data: DestinationCard[] }>(
    `/api/v1/preferences/recommendations?mode=${mode}&limit=${limit}`
  );
  return response.data || [];
}

/** Mengambil daftar destinasi umum (bisa difilter kota/kabupaten) */
export async function getDestinations(params?: {
  regency?: string;
  min_rating?: number;
  limit?: number;
}): Promise<DestinationCard[]> {
  const queryParams = [];
  if (params?.regency) queryParams.push(`regency=${params.regency}`);
  if (params?.min_rating) queryParams.push(`min_rating=${params.min_rating}`);
  if (params?.limit) queryParams.push(`limit=${params.limit}`);
  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  
  const response = await apiRequest<{ status: string; data: DestinationCard[] }>(
    `/api/v1/destinations${queryString}`
  );
  return response.data || [];
}

/** Helper aman untuk mengambil URL foto pertama dari berbagai format database */
export const getFirstPhotoUrl = (photoUrls: any): string => {
  if (!photoUrls) return '';
  if (Array.isArray(photoUrls)) {
    return photoUrls[0] || '';
  }
  if (typeof photoUrls === 'string') {
    let cleaned = photoUrls.trim();
    // Tangani format Postgres array raw: {url1,url2} atau {"url1","url2"}
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
      const split = cleaned.split(',');
      return (split[0] || '').replace(/["']/g, '').trim();
    }
    // Tangani format JSON string: ["url1","url2"]
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed[0] || '';
      }
    } catch {
      // ignore
    }
    // Tangani string tunggal (mungkin masih mengandung tanda kutip jika salah format)
    return cleaned.replace(/["']/g, '').trim();
  }
  return '';
};

/** Mengambil detail lengkap suatu destinasi berdasarkan ID */
export async function getDestinationDetail(id: number): Promise<DestinationCard> {
  const response = await apiRequest<{ status: string; data: DestinationCard }>(
    `/api/v1/destinations/${id}`
  );
  return response.data;
}

/** Menambahkan destinasi ke dalam daftar favorit */
export async function addFavorite(id_destination: number): Promise<any> {
  return apiRequest<any>('/api/v1/favorites/add', {
    method: 'POST',
    body: JSON.stringify({ id_destination }),
  });
}

/** Menghapus destinasi dari daftar favorit */
export async function removeFavorite(id_destination: number): Promise<any> {
  return apiRequest<any>(`/api/v1/favorites/${id_destination}`, {
    method: 'DELETE',
  });
}

/** Mengambil seluruh daftar destinasi favorit milik user */
export async function getUserFavorites(): Promise<any[]> {
  const response = await apiRequest<{ status: string; data: any[] }>('/api/v1/favorites/');
  return response.data;
}

export interface TripPlan {
  id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  budget: number;
  traveling_with: string;
  cover_photo?: string;
  guide_name?: string;
  guide_avatar?: string;
  guide_rating?: number;
}

/** Mengambil seluruh daftar rencana trip milik traveler aktif */
export async function getUserTripPlans(): Promise<TripPlan[]> {
  const response = await apiRequest<{ status: string; data: TripPlan[] }>('/api/v1/trips/my-plans');
  return response.data || [];
}

/** Membuat trip baru di backend dan mengembalikan detail itinerary */
export async function createNewTripItinerary(payload: {
  id_user: string;
  trip_name: string;
  budget: number;
  start_date: string;
  end_date: string;
  trip_duration: number;
  user_location: { latitude: number; longitude: number };
  destination_ids: number[];
}): Promise<any> {
  return apiRequest<any>('/api/v1/trips/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Mengambil rekomendasi guide untuk itinerary tertentu */
export async function getRecommendedGuides(
  id_itinerary: number,
  latitude?: number,
  longitude?: number
): Promise<any[]> {
  let url = `/api/v1/trips/${id_itinerary}/recommend-guides`;
  const params: string[] = [];
  if (latitude !== undefined) params.push(`latitude=${latitude}`);
  if (longitude !== undefined) params.push(`longitude=${longitude}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  const response = await apiRequest<{ status: string; data: any[] }>(url);
  return response.data || [];
}

/** Memilih guide untuk ditugaskan pada itinerary */
export async function selectGuideForTrip(id_itinerary: number, id_guide: string): Promise<any> {
  return apiRequest<any>(`/api/v1/trips/${id_itinerary}/select-guide`, {
    method: 'POST',
    body: JSON.stringify({ id_guide }),
  });
}

/** Mengambil seluruh daftar room chat milik user aktif */
export async function getUserChatRooms(): Promise<any[]> {
  return apiRequest<any[]>('/api/v1/chat/rooms');
}

/** Mengambil riwayat pesan di suatu room obrolan */
export async function getRoomMessages(
  room_id: string,
  limit: number = 50,
  skip: number = 0
): Promise<any[]> {
  return apiRequest<any[]>(`/api/v1/chat/rooms/${room_id}/messages?limit=${limit}&skip=${skip}`);
}

/** Guide menyetujui request trip */
export async function confirmTripBooking(id_itinerary: number): Promise<any> {
  return apiRequest<any>(`/api/v1/trips/${id_itinerary}/confirm`, {
    method: 'POST',
  });
}

/** Guide menolak request trip */
export async function rejectTripBooking(id_itinerary: number): Promise<any> {
  return apiRequest<any>(`/api/v1/trips/${id_itinerary}/reject`, {
    method: 'POST',
  });
}

/** Mengambil data ringkasan dashboard guide */
export async function getGuideDashboard(): Promise<any> {
  const response = await apiRequest<{ status: string; data: any }>('/api/v1/guides/dashboard');
  return response.data;
}

/** Mengambil daftar tur guide */
export async function getGuideTours(status?: string, search?: string): Promise<any[]> {
  let url = '/api/v1/guides/tours';
  const params: string[] = [];
  if (status) params.push(`status=${status}`);
  if (search) params.push(`search=${search}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  const response = await apiRequest<{ status: string; data: any[] }>(url);
  return response.data || [];
}

/** Mengambil saldo bagi hasil payout guide */
export async function getGuidePayout(): Promise<any> {
  const response = await apiRequest<{ status: string; data: any }>('/api/v1/guides/payout');
  return response.data;
}


