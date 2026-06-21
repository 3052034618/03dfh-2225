import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [{ label: '首页', path: '/search' }];

  if (pathname.startsWith('/search')) {
    items.push({ label: '运单检索' });
  } else if (pathname.startsWith('/trace')) {
    items.push({ label: '运单检索', path: '/search' });
    items.push({ label: '温度留痕视图' });
  } else if (pathname.startsWith('/certificate')) {
    items.push({ label: '运单检索', path: '/search' });
    items.push({ label: '温度留痕视图', path: pathname.replace('/certificate', '/trace') });
    items.push({ label: '证明材料生成' });
  }

  return items;
};

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container mx-auto py-4">
        <nav className="flex items-center gap-2 text-sm mb-6 animate-fade-in">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.path ? (
                <Link
                  to={item.path}
                  className="flex items-center gap-1.5 text-neutral-500 hover:text-primary-600 transition-colors"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              ) : (
                <span className="text-neutral-800 font-medium">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              )}
            </div>
          ))}
        </nav>

        <main className="animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
