import { api } from './api';

export interface AppointmentCreate {
  doctor_id: number;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  time_slot: string; // HH:MM format
  reason?: string | null;
  notes?: string | null;
}

export interface AppointmentUpdate {
  reason?: string | null;
  notes?: string | null;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export interface UserBase {
  id: number;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar: string | null;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string; // ISO date string
  time_slot: string;
  reason: string | null;
  notes: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithRelations extends Appointment {
  patient?: UserBase;
  doctor?: UserBase & {
    doctor_profile?: {
      specialization?: string;
      bio?: string;
      rating?: number;
      review_count?: number;
      consultation_fee?: number;
      years_of_experience?: number;
    };
  };
}

export interface AppointmentListResponse {
  data: AppointmentWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const appointmentService = {
  // Create a new appointment
  createAppointment: async (data: AppointmentCreate): Promise<Appointment> => {
    try {
      const response = await api.post<Appointment>('/appointments/', data);
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Create appointment error:', error?.message || String(error));
      }
      throw error;
    }
  },

  // Get appointments with filters
  getAppointments: async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<AppointmentListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.page) queryParams.append('page', params.page.toString());
      // Ensure limit doesn't exceed backend maximum (200)
      if (params?.limit) {
        const limit = Math.min(params.limit, 200);
        queryParams.append('limit', limit.toString());
      }

      const endpoint = `/appointments/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      if (__DEV__) {
        console.log('Fetching appointments from:', endpoint);
      }
      const response = await api.get<AppointmentListResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Get appointments error:', error?.message || String(error));
      }
      throw error;
    }
  },

  // Get appointment detail by ID
  getAppointmentDetail: async (appointmentId: number): Promise<AppointmentWithRelations> => {
    try {
      const response = await api.get<AppointmentWithRelations>(`/appointments/${appointmentId}`);
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Get appointment detail error:', error?.message || String(error));
      }
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (
    appointmentId: number,
    data: AppointmentUpdate
  ): Promise<Appointment> => {
    try {
      const response = await api.put<Appointment>(`/appointments/${appointmentId}`, data);
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Update appointment error:', error?.message || String(error));
      }
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: number): Promise<Appointment> => {
    try {
      const response = await api.put<Appointment>(`/appointments/${appointmentId}`, {
        status: 'CANCELLED',
      });
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Cancel appointment error:', error?.message || String(error));
      }
      throw error;
    }
  },

  // Approve appointment (for doctors)
  approveAppointment: async (appointmentId: number): Promise<Appointment> => {
    try {
      const response = await api.put<Appointment>(`/appointments/${appointmentId}`, {
        status: 'CONFIRMED',
      });
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Approve appointment error:', error?.message || String(error));
      }
      throw error;
    }
  },

  // Reject appointment (for doctors)
  rejectAppointment: async (appointmentId: number): Promise<Appointment> => {
    try {
      const response = await api.put<Appointment>(`/appointments/${appointmentId}`, {
        status: 'CANCELLED',
      });
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Reject appointment error:', error?.message || String(error));
      }
      throw error;
    }
  },
};

