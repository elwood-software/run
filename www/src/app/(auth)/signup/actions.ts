'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

import {createClient} from '@/lib/supabase/server';

export async function signup(formData: FormData) {
  const supabase = createClient();

  const {error} = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
      },
      emailRedirectTo: 'http://localhost:3000/signup/confirm',
    }
  });

  if (error) {
    console.log(error)
    redirect('/signup?error=fail');
  }

  revalidatePath('/', 'layout');
  redirect('/signup/complete');
}
