'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Target,
  CheckCircle2,
  CalendarDays,
  Sun,
  Moon,
  Share2,
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from 'next-themes';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    // On mount, set theme to dark if not set
    if (!theme) {
      setTheme('dark');
    }
  }, [theme, setTheme]);


  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const menuItems = [
    { href: '/', label: 'Goals', icon: Target },
    { href: '/today', label: 'Today', icon: CheckCircle2 },
    { href: '/calendar', label: 'Plan', icon: CalendarDays },
    { href: '/mindmap', label: 'Mindmap', icon: Share2 },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="p-2">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-primary-foreground">
                    Menifest.day
                </h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="md:hidden flex items-center p-2 border-b">
           <SidebarTrigger />
        </div>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
