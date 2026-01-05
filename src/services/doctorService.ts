import { api } from './api';

export interface DoctorProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar: string | null;
  role: 'DOCTOR';
  doctor_profile?: {
    specialization?: string;
    bio?: string;
    rating?: number;
    review_count?: number;
    consultation_fee?: number;
    years_of_experience?: number;
  };
  specialization?: string; // For convenience, extract from doctor_profile
  bio?: string;
  rating?: number;
  review_count?: number;
  consultation_fee?: number;
  years_of_experience?: number;
}

export interface DoctorListResponse {
  data: DoctorProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const doctorService = {
  // Get all doctors
  getDoctors: async (
    page: number = 1,
    limit: number = 20,
    specialization?: string
  ): Promise<DoctorListResponse> => {
    try {
      let endpoint = `/doctors/?page=${page}&limit=${limit}`;
      if (specialization) {
        endpoint += `&specialization=${encodeURIComponent(specialization)}`;
      }
      const response = await api.get<DoctorListResponse>(endpoint);
      
      // Normalize doctor data - extract doctor_profile fields
      const normalizedData = response.data.map((doctor: any) => ({
        ...doctor,
        specialization: doctor.doctor_profile?.specialization || doctor.specialization,
        bio: doctor.doctor_profile?.bio || doctor.bio,
        rating: doctor.doctor_profile?.rating || doctor.rating || 0,
        review_count: doctor.doctor_profile?.review_count || doctor.review_count || 0,
        consultation_fee: doctor.doctor_profile?.consultation_fee || doctor.consultation_fee || 0,
        years_of_experience: doctor.doctor_profile?.years_of_experience || doctor.years_of_experience || 0,
      }));
      
      return {
        ...response,
        data: normalizedData,
      };
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  // Get doctor by ID
  getDoctorById: async (doctorId: number): Promise<DoctorProfile> => {
    try {
      const response = await api.get<DoctorProfile>(`/doctors/${doctorId}`);
      return response;
    } catch (error) {
      console.error('Get doctor error:', error);
      throw error;
    }
  },
};

