import { AppState } from "react-native";
import { supabase } from "./client";
import { Session, User } from "@supabase/supabase-js";
import { AuthRequest, PhoneAuth } from "@/types/auth";
import {
  LocalAuthenticationOptions,
  authenticateAsync,
  hasHardwareAsync,
} from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  /**
   * Sign a user in with phone number by sending their phone number OTP.
   *
   * @param {string} phoneNo - The phone number used for signing up.
   */
  signInWithPhoneNumber(phoneNo: string): Promise<void>;

  /**
   * Verify user's OTP code sent to their phone number.
   *
   * @param {string} payload.phone - Phone number that OTP code is sent to.
   * @param {string} payload.token - OTP code sent to user.
   */
  verifyPhoneOTP(payload: PhoneAuth): Promise<Session>;

  /**
   * Attempts to login to the device using any available biometrics.
   */
  loginWithBiometrics(): Promise<Session>;

  /**
   * Stores an active device token onto the device, allow for biometric facial scans.
   */
  storeLocalSessionToDevice(email: string, password: string): Promise<void>;
}

export class SupabaseAuth implements AuthService {
  async loginWithBiometrics(): Promise<Session> {
    const options: LocalAuthenticationOptions = {
      promptMessage: "Dearly wants to authenticate you with biometrics.",
    };

    const hasHardware = await hasHardwareAsync();

    if (!hasHardware) {
      throw new Error("Device does not support fingerprinting or facial id.");
    }

    const auth = await authenticateAsync(options);

    if (auth.success) {
      const session = await this.getSessionFromDevice();
      return session;
    } else {
      throw new Error(auth.error);
    }
  }

  private async getSessionFromDevice(): Promise<Session> {
    const email = await AsyncStorage.getItem("email");
    const password = await AsyncStorage.getItem("password");
    if (!email || !password) {
      throw new Error("Please login again to use biometrics");
    }
    const auth = this.login({ email, password });
    return auth;
  }

  async storeLocalSessionToDevice(email: string, password: string) {
    await AsyncStorage.setItem("email", email);
    await AsyncStorage.setItem("password", password);
  }

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

  async signInWithPhoneNumber(phoneNo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNo,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async verifyPhoneOTP(payload: PhoneAuth): Promise<Session> {
    const { data, error } = await supabase.auth.verifyOtp({
      ...payload,
      type: "sms",
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session!;
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
