import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { HiOutlineSearch, HiOutlineUserCircle, HiOutlineShieldCheck, HiOutlineBan } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success('Role updated successfully');
      loadUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      student: 'role-student',
      staff: 'role-staff',
      admin: 'role-admin',
      hod: 'role-hod',
    };
    return map[role] || '';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="user-mgmt animate-fade-in">
      <div className="user-mgmt__header">
        <div>
          <h2>User Management</h2>
          <p className="user-mgmt__count">{pagination.total} users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="user-mgmt__filters">
        <div className="user-mgmt__search">
          <HiOutlineSearch className="user-mgmt__search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="user-mgmt__search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select form-select--compact"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="staff">Staff</option>
          <option value="admin">Admins</option>
          <option value="hod">HODs</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>ID</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="user-table__skeleton-row">
                  <td colSpan="7"><div className="skeleton skeleton--text" style={{ width: '100%' }}></div></td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id} className={!u.isActive ? 'user-table__row--inactive' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell__avatar">{u.name?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <p className="user-cell__name">{u.name}</p>
                        <p className="user-cell__email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {editingUser === u._id ? (
                      <select
                        className="form-select form-select--compact"
                        defaultValue={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        onBlur={() => setEditingUser(null)}
                        autoFocus
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="hod">HOD</option>
                      </select>
                    ) : (
                      <span
                        className={`sidebar__role-badge ${getRoleBadge(u.role)}`}
                        onClick={() => setEditingUser(u._id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to edit role"
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td><span className="user-table__dept">{u.department || '—'}</span></td>
                  <td><span className="user-table__id">{u.studentId || u.staffId || '—'}</span></td>
                  <td><span className="user-table__date">{formatDate(u.createdAt)}</span></td>
                  <td>
                    <span className={`user-status ${u.isActive ? 'user-status--active' : 'user-status--inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="user-action-btn"
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                      >
                        {u.isActive ? <HiOutlineBan /> : <HiOutlineShieldCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="user-table__empty">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
