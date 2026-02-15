import { ReactNode } from 'react';
import { Home, PlusSquare, User } from 'lucide-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate({ to: '/' })}>
            <img src="/assets/generated/logo.dim_512x512.png" alt="Snaply" className="h-10 w-10" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Snaply
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-around px-4">
          <Button
            variant={currentPath === '/' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => navigate({ to: '/' })}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant={currentPath === '/create' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => navigate({ to: '/create' })}
          >
            <PlusSquare className="h-6 w-6" />
          </Button>
          <Button
            variant={currentPath === '/profile' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => navigate({ to: '/profile' })}
          >
            <User className="h-6 w-6" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
