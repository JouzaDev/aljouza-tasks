import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // تجاهل الملفات الثابتة وملفات النظام
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // 1. فحص الجلسة عبر Supabase إن توفرت
  let userRole: 'manager' | 'employee' | null = null;
  let isAuthenticated = false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseLive =
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('dummy') &&
    !supabaseUrl.includes('your-project');

  if (isSupabaseLive) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        isAuthenticated = true;
        // قراءة الدور من الـ metadata أو profiles
        userRole = (user.user_metadata?.role as 'manager' | 'employee') || 'employee';
      }
    } catch {
      // Fallback
    }
  }

  // 2. فحص المستخدم النشط التجريبي (للتبديل السلس أثناء التطوير)
  if (!isAuthenticated) {
    const demoUser = request.cookies.get('aljouza_active_user')?.value;
    if (demoUser) {
      isAuthenticated = true;
      // Jouza is manager, others are employees
      userRole = demoUser === '11111111-1111-1111-1111-111111111111' ? 'manager' : 'employee';
    } else {
      // افتراضياً في البيئة التجريبية نعتبر جوزاء مسجلة
      isAuthenticated = true;
      userRole = 'manager';
    }
  }

  // 3. التوجيه عند زيارة الجذر /
  if (pathname === '/') {
    const target = userRole === 'manager' ? '/admin' : '/my-tasks';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 4. التوجيه عند زيارة /login
  if (pathname === '/login') {
    if (isAuthenticated) {
      const target = userRole === 'manager' ? '/admin' : '/my-tasks';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return response;
  }

  // 5. حماية مسارات المدير /admin للمدير فقط
  if (pathname.startsWith('/admin') && userRole !== 'manager') {
    return NextResponse.redirect(new URL('/my-tasks', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
