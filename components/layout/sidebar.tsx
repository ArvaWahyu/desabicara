import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Languages,
  BookOpen,
  History,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Kamus", href: "/admin/dictionary", icon: BookOpen },
  { name: "Riwayat", href: "/admin/history", icon: History },
  { name: "Pengaturan", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "glass-card border-r transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="Desa Bicara Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base font-bold gradient-text">Admin Panel</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "transition-transform",
              collapsed && "rotate-180"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/translate"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent",
              collapsed && "justify-center"
            )}
          >
            <Languages className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Ke Terjemahan</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
