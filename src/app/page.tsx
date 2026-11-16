import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/actions';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user.role === 'manager') {
    redirect('/admin');
  } else {
    redirect('/my-tasks');
  }
}
