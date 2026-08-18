// API Client for SpaService Backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CLIENT';
  assignedBranchId?: string;
  assignedBranchName?: string;
}

export interface BranchUnlockDto {
  branchId: string;
  branchName: string;
  expiresAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
  activeUnlocks: BranchUnlockDto[];
}

export interface BranchResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  staffCount: number;
  serviceCount: number;
}

export interface StaffCardResponse {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  specialization: string;
  specializations?: string[];
  bio?: string;
  profilePhotoUrl?: string;
  galleryPhotoUrls?: string;
  galleryPhotos?: string[];
  todayCheckinStatus: 'PRESENT' | 'ON_LEAVE' | 'NOT_CONFIRMED_YET';
  presentToday: boolean; // true when todayCheckinStatus === 'PRESENT'
  checkinConfirmedAt?: string;
  isBookable: boolean;
  isActive: boolean;
}

export interface SpaServiceResponse {
  id: string;
  branchId?: string;
  branchName?: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface AppointmentResponse {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  branchId: string;
  branchName: string;
  branchCity: string;
  branchAddress: string;
  branchMapsUrl: string;
  staffId: string;
  staffName: string;
  staffSpecialization: string;
  staffPhotoUrl?: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentMode: 'ONLINE' | 'AT_SPA';
  basePrice: number;
  taxAmount: number;
  totalPrice: number;
  paymentStatus: 'PENDING' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

export interface TimeSlotDto {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason: string;
}

export interface PaymentOrderResponse {
  paymentId: string;
  razorpayOrderId: string;
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  keyId: string;
  description: string;
}

export interface PaymentSummaryDto {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  paymentType: 'BRANCH_UNLOCK' | 'SERVICE_BOOKING';
  paymentMode: 'ONLINE' | 'AT_SPA';
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  description?: string;
  createdAt: string;
}

export interface BranchCheckinStatusResponse {
  branchId: string;
  branchName: string;
  date: string;
  totalStaff: number;
  presentCount: number;
  onLeaveCount: number;
  pendingCount: number;
  staffCheckins: {
    staffId: string;
    staffName: string;
    specialization: string;
    profilePhotoUrl?: string;
    status: 'PRESENT' | 'ON_LEAVE' | 'NOT_CONFIRMED_YET';
    confirmedAt?: string;
    confirmedByAgentName?: string;
  }[];
}

export interface AgentResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  assignedBranchId: string;
  assignedBranchName: string;
  isActive: boolean;
  createdAt: string;
}

// Fetch helper with token
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('spa_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const json: ApiResponse<T> = await res.json();

    if (!res.ok) {
      const err = new Error(json.message || `Request failed with status ${res.status}`);
      (err as any).status = res.status;
      (err as any).data = json.error || json.data;
      throw err;
    }

    return json.data;
  } catch (error: any) {
    // If backend is unreachable or local mock mode needed
    throw error;
  }
}
