const BASE_URL = 'http://affordaily-api.test/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Guest {
  id: number;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestSearchResponse {
  success: boolean;
  data: Guest | null;
}

export interface Booking {
  id: number;
  booking_reference: string;
  guest_name: string;
  guest_phone: string;
  id_photo_path?: string;
  number_of_nights: number;
  preferred_bed_type: 'A' | 'B';
  payment_method: 'cash' | 'transfer';
  payer_name: string;
  reference?: string;
  room_id: number;
  room_number: string;
  bed_space: 'A' | 'B';
  total_amount: number;
  status: 'active' | 'pending_checkout' | 'completed' | 'auto_checkout' | 'early_checkout';
  check_in_time: string;
  check_out_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  guest_name: string;
  guest_phone: string;
  id_photo_path?: string;
  number_of_nights: number;
  preferred_bed_type: 'A' | 'B';
  payment_method: 'cash' | 'transfer';
  payer_name: string;
  reference?: string;
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
    // Try to get token from storage on initialization
    this.loadToken();
  }

  private async loadToken() {
    try {
      // You can use AsyncStorage or SecureStore here
      // For now, we'll use a simple approach
      const storedToken = await this.getStoredToken();
      if (storedToken) {
        this.setToken(storedToken);
      }
    } catch (error) {
      console.log('No stored token found');
    }
  }

  private async getStoredToken(): Promise<string | null> {
    // This would typically use AsyncStorage or SecureStore
    // For now, return null - you can implement this later
    return null;
  }

  private async storeToken(token: string): Promise<void> {
    // This would typically use AsyncStorage or SecureStore
    // For now, just store in memory - you can implement this later
    console.log('Token stored:', token);
  }

  private async removeToken(): Promise<void> {
    // This would typically use AsyncStorage or SecureStore
    // For now, just clear from memory - you can implement this later
    console.log('Token removed');
  }

  setToken(token: string) {
    this.token = token;
    this.storeToken(token);
  }

  clearToken() {
    this.token = null;
    this.removeToken();
  }

  getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearToken();
    }
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/user');
  }

  // Guest methods
  async searchGuestByPhone(phone: string): Promise<GuestSearchResponse> {
    return this.request<GuestSearchResponse>(`/guests/search/phone?phone=${encodeURIComponent(phone)}`);
  }

  // Booking methods
  async createBooking(data: CreateBookingData): Promise<BookingResponse> {
    return this.request<BookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(): Promise<{ success: boolean; data: Booking[] }> {
    return this.request<{ success: boolean; data: Booking[] }>('/bookings');
  }

  async getActiveBookings(): Promise<{ success: boolean; data: Booking[] }> {
    return this.request<{ success: boolean; data: Booking[] }>('/bookings/active');
  }

  async checkoutBooking(bookingId: number, data: {
    damage_notes?: string;
    key_returned?: boolean;
    early_checkout?: boolean;
  }): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${bookingId}/checkout`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async extendBooking(bookingId: number, additionalNights: number): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${bookingId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ additional_nights: additionalNights }),
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiService = new ApiService();
