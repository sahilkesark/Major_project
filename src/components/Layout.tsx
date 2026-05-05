import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

/**
 * Main layout with responsive sidebar + content area.
 */
export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  // Watch sidebar width changes via CSS custom property
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarWidth(sidebar.getBoundingClientRect().width);
      }
    });

    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
      setSidebarWidth(sidebar.getBoundingClientRect().width);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          minHeight: '100vh',
          background: 'var(--bg-secondary)',
          transition: 'margin-left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
