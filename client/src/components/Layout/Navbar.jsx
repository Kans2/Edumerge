import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/tickets/new') return 'Create New Request';
    if (path === '/tickets') return 'Tickets';
    if (path.startsWith('/tickets/')) return 'Ticket Details';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/reports') return 'Reports & Analytics';
    if (path === '/notifications') return 'Notifications';
    if (path === '/profile') return 'Profile Settings';
    return 'Edumerge';
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        <h1 className="navbar__title">{getPageTitle()}</h1>
      </div>

      <div className="navbar__right">
        {/* Search */}
        <div className="navbar__search">
          <HiOutlineSearch className="navbar__search-icon" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="navbar__search-input"
            id="global-search"
          />
        </div>

        {/* Notifications */}
        <button className="navbar__icon-btn" id="notification-bell" aria-label="Notifications">
          <HiOutlineBell />
          <span className="navbar__badge">3</span>
        </button>

        {/* User */}
        <div className="navbar__user">
          <div className="navbar__user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="navbar__user-name">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
