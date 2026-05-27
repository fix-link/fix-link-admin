import { api, parseError } from "./client";
import type { StaffUser } from "../types/auth.types";
import { isStaffRole } from "../types/auth.types";

export const loginStaff = async (email: string, password: string) => {
  try {
    const response = await api.post("/users/login/", {
      username: email,
      email,
      password,
    });
    const user = response.data.user as StaffUser;
    if (!isStaffRole(user.role)) {
      throw new Error(
        "Access denied. This portal is for Fix Link administrators and moderators only."
      );
    }
    return {
      user,
      access: response.data.access as string,
      refresh: response.data.refresh as string,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw error;
    }
    throw new Error(parseError(error));
  }
};

export const logoutStaff = async (refresh: string) => {
  try {
    await api.post("/users/logout/", { refresh });
  } catch {
    // ignore — clear local session regardless
  }
};
