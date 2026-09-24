import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineTicket,
  HiOutlinePlusCircle,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineAcademicCap,
} from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/tickets', icon: HiOutlineTicket, label: 'My Tickets' },
    { to: '/tickets/new', icon: HiOutlinePlusCircle, label: 'New Request' },
    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
  ];

  const staffLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/tickets', icon: HiOutlineTicket, label: 'Assigned Tickets' },
    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/tickets', icon: HiOutlineTicket, label: 'All Tickets' },
    { to: '/tickets/new', icon: HiOutlinePlusCircle, label: 'Create Ticket' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/admin/reports', icon: HiOutlineChartBar, label: 'Reports' },
    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
  ];

  const hodLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/tickets', icon: HiOutlineTicket, label: 'All Tickets' },
    { to: '/admin/reports', icon: HiOutlineChartBar, label: 'Reports' },
    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
  ];

  const linksByRole = {
    student: studentLinks,
    staff: staffLinks,
    admin: adminLinks,
    hod: hodLinks,
  };

  const navLinks = linksByRole[user?.role] || studentLinks;

  const getRoleBadge = (role) => {
    const badges = {
      student: { label: 'Student', className: 'role-student' },
      staff: { label: 'Staff', className: 'role-staff' },
      admin: { label: 'Admin', className: 'role-admin' },
      hod: { label: 'HOD', className: 'role-hod' },
    };
    return badges[role] || badges.student;
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <HiOutlineAcademicCap className="sidebar__logo-icon" />
          {!isCollapsed && <span className="sidebar__logo-text">Edumerge</span>}
        </div>
        <button className="sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <span className="sidebar__toggle-bar"></span>
          <span className="sidebar__toggle-bar"></span>
          <span className="sidebar__toggle-bar"></span>
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user?.name || 'User'}</p>
            <span className={`sidebar__role-badge ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <li key={to} className="sidebar__item">
              <NavLink
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                title={isCollapsed ? label : undefined}
              >
                <Icon className="sidebar__link-icon" />
                {!isCollapsed && <span className="sidebar__link-label">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar__footer">
        <NavLink to="/profile" className="sidebar__link" title={isCollapsed ? 'Settings' : undefined}>
          <HiOutlineCog className="sidebar__link-icon" />
          {!isCollapsed && <span className="sidebar__link-label">Settings</span>}
        </NavLink>
        <button className="sidebar__link sidebar__logout" onClick={logout}>
          <HiOutlineLogout className="sidebar__link-icon" />
          {!isCollapsed && <span className="sidebar__link-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
