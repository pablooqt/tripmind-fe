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
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
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
  return apiRequest<DestinationCard[]>("/ai/recommendation/preferences", {
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
