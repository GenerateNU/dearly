import { AppState } from "react-native";
import { supabase } from "./client";
import { Session, User } from "@supabase/supabase-js";
import { AuthRequest } from "@/types/auth";

/**
 * Interface for authentication services, providing methods for user sign-up, login,
 * logout, and password management.
 */
export interface AuthService {
  /**
   * Registers a new user with the provided email and password.
   *
   * @param {AuthRequest} param - An object containing the user's email and password.
   * @returns {Promise<Session>} A promise that resolves to the user's session details
   *                             upon successful sign-up.
   */
  signUp({ email, password }: AuthRequest): Promise<Session>;

  /**
   * Authenticates a user with the provided email and password.
   *
   * @param {AuthRequest} param0 - An object containing the user's email and password.
   * @returns {Promise<Session>} A promise that resolves to the user's session details
   *                             upon successful login.
   */
  login({ email, password }: AuthRequest): Promise<Session>;

  /**
   * Logs the user out of the current session.
   *
   * @returns {Promise<void>} A promise that resolves when the user is successfully logged out.
   */
  logout(): Promise<void>;

  /**
   * Sends a password recovery email to the provided email address.
   *
   * @param {string} param.email - The email address associated with the user's account.
   * @returns {Promise<void>} A promise that resolves when the password recovery email is sent.
   */
  forgotPassword({ email }: { email: string }): Promise<void>;

  /**
   * Resets the user's password to the provided new password.
   *
   * @param {string} param.password - The new password for the user's account.
   * @returns {Promise<User>} A promise that resolves to the updated user details
   *                          upon successful password reset.
   */
  resetPassword({ password }: { password: string }): Promise<User>;
}

export class SupabaseAuth implements AuthService {
  async signUp({ email, password }: { email: string; password: string }): Promise<Session> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session!;
  }

  async login({ email, password }: { email: string; password: string }): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async forgotPassword({ email }: { email: string }): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "/",
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword({ password }: { password: string }): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }
}

// allow for auto-refresh token in the background
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
