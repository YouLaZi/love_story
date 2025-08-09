import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// 需要认证的路由
const protectedRoutes = ['/dashboard'];

// 公开路由（不需要认证）
const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

// 管理员专用路由及所需权限
const adminRoutes: { [key: string]: string[] } = {
  '/dashboard/users': ['users:read'],
  '/dashboard/content': ['content:read'],
  '/dashboard/content/diaries': ['diaries:read'],
  '/dashboard/content/reports': ['reports:read'],
  '/dashboard/analytics': ['analytics:read'],
  '/dashboard/system': ['system:read'],
  '/dashboard/system/admins': ['admins:read'],
  '/dashboard/system/settings': ['settings:read'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  // 检查是否是公开路由
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // 如果已登录且访问登录页，重定向到仪表板
    if (pathname === '/login' && token) {
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.exp > Date.now() / 1000) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Token无效，继续到登录页
      }
    }
    return NextResponse.next();
  }

  // 检查是否是受保护的路由
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // 没有token，重定向到登录页
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 验证token
      const decoded = jwt.decode(token) as any;
      
      if (!decoded || decoded.exp <= Date.now() / 1000) {
        // Token过期，重定向到登录页
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_token');
        response.cookies.delete('admin_refresh_token');
        return response;
      }

      // 检查路由权限
      for (const [route, requiredPermissions] of Object.entries(adminRoutes)) {
        if (pathname.startsWith(route)) {
          const userPermissions = decoded.permissions || [];
          const userRole = decoded.role;
          
          // 超级管理员拥有所有权限
          if (userRole === 'super_admin') {
            break;
          }
          
          // 检查是否有必要的权限
          const hasPermission = requiredPermissions.some(permission =>
            userPermissions.some((p: any) => 
              p.name === permission || `${p.resource}:${p.action}` === permission
            )
          );
          
          if (!hasPermission) {
            // 无权限，重定向到403页面或仪表板
            return NextResponse.redirect(new URL('/dashboard?error=no_permission', request.url));
          }
          break;
        }
      }

      // 添加用户信息到请求头
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.sub || decoded.userId);
      requestHeaders.set('x-user-role', decoded.role);
      requestHeaders.set('x-user-permissions', JSON.stringify(decoded.permissions || []));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token验证失败，重定向到登录页
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_token');
      response.cookies.delete('admin_refresh_token');
      return response;
    }
  }

  // 默认根路径重定向到仪表板
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api路由
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - 其他静态资源
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
