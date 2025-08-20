"use server";
import { auth } from "@/lib/auth";

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in Successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occured",
    };
  }
};

export const signUp = async (name: string, email: string, password: string) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    return {
      success: true,
      message: "Signed Up Successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occured",
    };
  }
};
