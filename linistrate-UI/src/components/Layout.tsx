import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Play,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  BookOpen,
  History,
} from 'lucide-react';

// ScrollToTop component to reset scroll on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Execution', href: '/commands', icon: Play },
    { name: 'Asset Manager', href: '/asset-manager', icon: Settings },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Execution History', href: '/execution-history', icon: History },
    { name: 'Account', href: '/account', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col items-stretch justify-start">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${

        sidebarOpen ? 'translate-x-0' : '-translate-x-full'

      } lg:static lg:inset-0 flex flex-col`}>

        <div className="flex flex-col p-4 border-b border-border">

          <div className="flex items-center justify-between mb-2">

            <h1 className="text-xl font-bold text-primary">Linistrate</h1>

            <Button

              variant="ghost"

              size="sm"

              className="lg:hidden"

              onClick={() => setSidebarOpen(false)}

            >

              <X className="h-4 w-4" />

            </Button>

          </div>

          <div className="text-xs text-muted-foreground truncate">

            Welcome, {user?.name}

          </div>

        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        

        {/* Page content */}
        <main className="pt-0 px-4 pb-0 min-h-fit">
          <ScrollToTop />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
