import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '@/design-system/Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Accueil', icon: 'home' },
  { to: '/courses', label: 'Cours', icon: 'book' },
  { to: '/practice', label: 'Pratique', icon: 'code' },
  { to: '/reminders', label: 'Rappels', icon: 'bell' },
  { to: '/profile', label: 'Profil', icon: 'user' },
];

export function BottomNav() {
  return (
    <nav className="ap-nav" aria-label="Navigation principale">
      <div className="ap-nav__inner">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) => `ap-nav__item ${isActive ? 'ap-nav__item--active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <Icon name={tab.icon} size={23} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
