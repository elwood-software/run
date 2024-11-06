"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type SignupActionState = {
  success: boolean | null;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
};

export async function signup(
  _state: SignupActionState,
  formData: FormData | undefined = undefined,
) {
  const supabase = await createClient();

  const first_name = formData?.get("first_name") as string;
  const last_name = formData?.get("last_name") as string;
  const email = formData?.get("email") as string;
  const password = formData?.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
      emailRedirectTo: "http://localhost:3000/signup/confirm",
    },
  });

  if (error) {
    console.log(error);

    return {
      success: false,
      first_name,
      last_name,
      email,
      password,
    };
  }

  revalidatePath("/", "layout");
  redirect("/signup/complete");
}
