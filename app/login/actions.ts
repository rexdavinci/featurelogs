"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

async function ensureProfile(userId: string, email: string) {
    const cookieStore = await cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  await supabase.from("profiles").upsert({ id: userId, email }, { onConflict: "id" });
}

export async function signIn(formData: FormData) {
    const cookieStore = await cookies();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/?error=Email+and+password+are+required");
  }

  const supabase = await createServerSupabaseClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user?.id && data.user.email) {
    await ensureProfile(data.user.id, data.user.email);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
    const cookieStore = await cookies();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/?error=Email+and+password+are+required");
  }

  const supabase = await createServerSupabaseClient(cookieStore);
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user?.id && data.user.email) {
    await ensureProfile(data.user.id, data.user.email);
  }

  redirect("/dashboard");
}
