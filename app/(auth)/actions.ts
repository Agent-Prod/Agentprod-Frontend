"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { setCookie } from "cookies-next";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export async function login(formData: { email: string; password: string }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email,
    password: formData.password,
  };

  const { data: userData, error } =
    await supabase.auth.signInWithPassword(data);

  if (error) {
    throw new Error(error.message);
  }

  return userData;
  // revalidatePath("/", "layout");
  // redirect("/");
}

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

export async function signupAppsumo(formData: {
  email: string;
  password: string;
}) {
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

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw new Error(error.message);
  } else {
    // Ideally, you might want to also revalidate or clear any cache that depends on the user session
    // This step depends on your application's structure and how it handles cache
    // redirect("/");
    // Redirect to the homepage or login page after successful logout
  }
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

export async function resetPasswordMain(
  newPassword: string,
  accessToken: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Authenticate the user using the token
  const { error: sessionError } =
    await supabase.auth.exchangeCodeForSession(accessToken);

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  // Update the password
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.log("Update error: " + error.message);
    throw new Error(error.message);
  }

  console.log(data);
  return data;
}
