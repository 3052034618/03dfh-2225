import { Snowflake, Search, Thermometer, FileText, User, Bell } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/search', label: '运单检索', icon: Search },
  { path: '/trace/CC202606200001', label: '温度留痕', icon: Thermometer },
  { path: '/certificate/CC202606200001', label: '证明材料', icon: FileText },
];

export const Navbar = () => {
  const location = useLocation();
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);

  const isActive = (path: string) => {
    if (path.includes('/trace/') || path.includes('/certificate/')) {
      return location.pathname.startsWith(path.split('/:')[0].replace('CC202606200001', ''));
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-800">冷链客服工作台</h1>
              <p className="text-xs text-neutral-500">Cold Chain Service Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const actualPath = item.path.includes(':id') && selectedWaybill
                ? item.path.replace('CC202606200001', selectedWaybill.id)
                : item.path;

              return (
                <NavLink
                  key={item.path}
                  to={actualPath}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-800">李客服</p>
                <p className="text-xs text-neutral-500">工号: CS001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
