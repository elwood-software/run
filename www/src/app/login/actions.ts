'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

import {createClient} from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log(data);

  const {error} = await supabase.auth.signInWithPassword(data);

  console.log(error);

  if (error) {
    redirect('/oauth/cli/login?error=invalid');
  }

  revalidatePath('/', 'layout');
  redirect(`/oauth/cli/login/complete`);
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const {error} = await supabase.auth.signUp(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/account');
}
