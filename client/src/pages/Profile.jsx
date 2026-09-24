import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineAcademicCap } from 'react-icons/hi';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const map = { student: 'Student', staff: 'Staff Member', admin: 'Administrator', hod: 'Head of Department' };
    return map[role] || role;
  };

  const getRoleBadge = (role) => {
    const map = { student: 'role-student', staff: 'role-staff', admin: 'role-admin', hod: 'role-hod' };
    return map[role] || '';
  };

  return (
    <div className="profile-page animate-fade-in">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-hero__bg"></div>
        <div className="profile-hero__content">
          <div className="profile-hero__avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-hero__info">
            <h2 className="profile-hero__name">{user?.name}</h2>
            <p className="profile-hero__email">{user?.email}</p>
            <span className={`sidebar__role-badge ${getRoleBadge(user?.role)}`}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="profile-grid">
        <div className="profile-card">
          <h3 className="profile-card__title">Personal Information</h3>
          <div className="profile-card__rows">
            <div className="profile-field">
              <HiOutlineUser className="profile-field__icon" />
              <div>
                <span className="profile-field__label">Full Name</span>
                <span className="profile-field__value">{user?.name || '—'}</span>
              </div>
            </div>
            <div className="profile-field">
              <HiOutlineMail className="profile-field__icon" />
              <div>
                <span className="profile-field__label">Email Address</span>
                <span className="profile-field__value">{user?.email || '—'}</span>
              </div>
            </div>
            <div className="profile-field">
              <HiOutlinePhone className="profile-field__icon" />
              <div>
                <span className="profile-field__label">Phone Number</span>
                <span className="profile-field__value">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3 className="profile-card__title">Academic Information</h3>
          <div className="profile-card__rows">
            <div className="profile-field">
              <HiOutlineAcademicCap className="profile-field__icon" />
              <div>
                <span className="profile-field__label">Department</span>
                <span className="profile-field__value">{user?.department || 'Not assigned'}</span>
              </div>
            </div>
            <div className="profile-field">
              <HiOutlineUser className="profile-field__icon" />
              <div>
                <span className="profile-field__label">{user?.role === 'student' ? 'Student ID' : 'Staff ID'}</span>
                <span className="profile-field__value">{user?.studentId || user?.staffId || 'Not assigned'}</span>
              </div>
            </div>
            <div className="profile-field">
              <HiOutlineUser className="profile-field__icon" />
              <div>
                <span className="profile-field__label">Role</span>
                <span className="profile-field__value">{getRoleLabel(user?.role)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3 className="profile-card__title">Account</h3>
          <div className="profile-card__rows">
            <div className="profile-field">
              <div>
                <span className="profile-field__label">Account Status</span>
                <span className="profile-field__value">
                  <span className="user-status user-status--active">Active</span>
                </span>
              </div>
            </div>
            <div className="profile-field">
              <div>
                <span className="profile-field__label">Member Since</span>
                <span className="profile-field__value">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
