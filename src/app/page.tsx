import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/supabase/actions';

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasUser = cookieStore.get('aljouza_active_user')?.value;

  if (!hasUser) {
    redirect('/login');
  }

  const user = await getCurrentUser();
  if (user.role === 'manager') {
    redirect('/admin/tasks');
  } else {
    redirect('/my-tasks');
  }
}
