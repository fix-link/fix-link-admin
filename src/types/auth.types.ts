export type StaffRole = "admin" | "moderator";

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: StaffRole | string;
  is_verified?: boolean;
  created_at?: string;
  mustChangePassword?: boolean;
  isDeactivated?: boolean;
  deactivationReason?: string;
}

export const isStaffRole = (role?: string): role is StaffRole =>
  role === "admin" || role === "moderator";

export const getStaffHomePath = (role?: string): string => {
  if (role === "admin") return "/admin";
  if (role === "moderator") return "/moderator";
  return "/login";
};
