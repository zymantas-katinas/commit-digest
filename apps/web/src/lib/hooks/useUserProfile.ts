import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface UserProfile {
  id: string;
  email: string;
  timezone: string;
}

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.getUserProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
