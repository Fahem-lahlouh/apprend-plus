import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from '@/design-system/Icon';

export function TopBar({ title, action }: { title: string; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="ap-topbar">
      <button type="button" className="ap-back" onClick={() => navigate(-1)} aria-label="Retour">
        <Icon name="chevron-left" size={20} />
      </button>
      <h1 className="ap-title-lg" style={{ flex: 1, minWidth: 0 }}>
        {title}
      </h1>
      {action}
    </div>
  );
}
