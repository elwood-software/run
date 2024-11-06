"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  success: boolean | null;
  email?: string;
  password?: string;
};

export async function login(
  _state: LoginActionState,
  formData: FormData | undefined = undefined,
): Promise<LoginActionState> {
  const supabase = await createClient();

  const data = {
    email: formData?.get("email") as string,
    password: formData?.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      success: false,
      ...data,
    };
  }

  revalidatePath("/", "layout");
  redirect(`/login/complete`);

  return {
    success: true,
  };
}
