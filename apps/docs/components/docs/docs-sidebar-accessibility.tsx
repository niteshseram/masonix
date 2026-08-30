'use client';

import { useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { useEffect } from 'react';

export function DocsSidebarAccessibility() {
  const { collapsed, open } = useSidebar();

  useEffect(() => {
    const collapseButtons = document.querySelectorAll<HTMLButtonElement>(
      'button[data-collapsed]',
    );

    collapseButtons.forEach((button) => {
      button.setAttribute(
        'aria-label',
        collapsed ? 'Expand Sidebar' : 'Collapse Sidebar',
      );
      button.setAttribute('aria-controls', 'nd-sidebar');
      button.setAttribute('aria-expanded', String(!collapsed));
    });

    const drawerButtons = document.querySelectorAll<HTMLButtonElement>(
      '#nd-subnav button[aria-label$="Sidebar"], #nd-sidebar-mobile button[aria-label$="Sidebar"]',
    );

    drawerButtons.forEach((button) => {
      button.setAttribute(
        'aria-label',
        open ? 'Close Sidebar' : 'Open Sidebar',
      );
      button.setAttribute('aria-controls', 'nd-sidebar-mobile');
      button.setAttribute('aria-expanded', String(open));
    });
  }, [collapsed, open]);

  return null;
}
