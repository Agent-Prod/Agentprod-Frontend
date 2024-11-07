"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { setCookie } from "cookies-next";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";



export async function signup(formData: { email: string; password: string }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email,
    password: formData.password,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    throw new Error(error.message);
  }


  // revalidatePath("/", "layout");
  // redirect("/");
}

export async function signupAppsumo(formData: { email: string; password: string }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email,
    password: formData.password,
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    throw new Error(error.message);
  }

  if (authData && authData.user) {
    return authData.user;
  } else {
    throw new Error("User data not available after signup");
  }

  // revalidatePath("/", "layout");
  // redirect("/");
}



export async function resetPassword(formData: { email: string }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.email,
  };

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `https://app.agentprod.com/reset`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function resetPasswordMain(newPassword: string, accessToken: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Authenticate the user using the token
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
    accessToken,
  );

  if (sessionError) {
    console.log("Session error: " + sessionError.message);
    throw new Error(sessionError.message);
  }

  // Update the password
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.log("Update error: " + error.message);
    throw new Error(error.message);
  }

  console.log(data);
  return data;
}

export async function logout() {
  try {
    // Remove server-side cookie
    cookies().delete('Authorization');
    
    // Clear any other session-related cookies
    cookies().delete('supabase-auth-token');
    
    // Revalidate the layout to clear cached data
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to logout" };
  }
}