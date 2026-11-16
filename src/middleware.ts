import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. تجاهل الملفات الثابتة وملفات النظام
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. التحقق من الجلسة عبر Supabase إن توفرت
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
        userRole = (user.user_metadata?.role as 'manager' | 'employee') || 'employee';
      }
    } catch {
      // Supabase unavailable
    }
  }

  // 3. التحقق من كوكي المستخدم التجريبي
  if (!isAuthenticated) {
    const demoUser = request.cookies.get('aljouza_active_user')?.value;
    if (demoUser) {
      isAuthenticated = true;
      userRole = demoUser === '11111111-1111-1111-1111-111111111111' ? 'manager' : 'employee';
    }
  }

  // 4. التوجيه عند زيارة الجذر /
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    if (!isAuthenticated) {
      redirectUrl.pathname = '/login';
    } else {
      redirectUrl.pathname = userRole === 'manager' ? '/admin/tasks' : '/my-tasks';
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 5. التوجيه عند زيارة صفحة تسجيل الدخول /login
  if (pathname === '/login') {
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole === 'manager' ? '/admin/tasks' : '/my-tasks';
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // 6. حماية مسارات لوحة التحكم من الزوار غير المسجلين
  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // 7. حماية مسارات المدير /admin للمدير فقط
  if (pathname.startsWith('/admin') && userRole !== 'manager') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/my-tasks';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
