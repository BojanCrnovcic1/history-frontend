import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './manageUsers.scss';
import { ApiConfig } from '../../../config/ApiConfig';
import { useAuth } from '../../../context/AuthContext';
import type { User } from '../../../types/User';

interface PaginatedResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

interface PaginateUsersDto {
  page: number;
  limit: number;
  username?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  isPremium?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1
  });
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '' as '' | 'USER' | 'ADMIN',
    isPremium: undefined as boolean | undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC' as 'ASC' | 'DESC'
  });
  const { accessToken } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: PaginateUsersDto = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.username && { username: filters.username }),
        ...(filters.email && { email: filters.email }),
        ...(filters.role && { role: filters.role }),
        ...(filters.isPremium !== undefined && { isPremium: filters.isPremium }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const response = await axios.get<PaginatedResponse>(ApiConfig.API_URL + 'api/users/paginate', {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setUsers(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta.total,
        lastPage: response.data.meta.lastPage
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

 
  const handleToggleRole = async (userId: number) => {
    try {
      const response = await axios.patch<User | { status: string; message: string }>(
        ApiConfig.API_URL + `api/users/${userId}/change-role`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if ('userId' in response.data) {
        setUsers(users.map(user => 
          user.userId === userId ? response.data as User : user
        ));
      } else {
        alert(response.data || 'Failed to change role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await axios.delete<{ status: string; message: string }>(
        ApiConfig.API_URL + `api/users/remove/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.data.status === 'ok') {
        
        setUsers(users.filter(user => user.userId !== userId));
        alert('User deleted successfully');
      } else {
        alert(response.data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };


  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); 
  };


  const handleResetFilters = () => {
    setFilters({
      username: '',
      email: '',
      role: '',
      isPremium: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSubscriptionActive = (user: User) => {
    if (!user.subscriptionExpiresAt) return false;
    return new Date(user.subscriptionExpiresAt) > new Date();
  };

  const formatSubscriptionType = (type: string | null) => {
    if (!type) return 'None';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="manage-users">
      <div className="header">
        <h1>Manage Users</h1>
        <div className="stats">
          Total Users: {pagination.total}
        </div>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Username:</label>
            <input
              type="text"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="Search by username"
            />
          </div>

          <div className="filter-group">
            <label>Email:</label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="Search by email"
            />
          </div>

          <div className="filter-group">
            <label>Role:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value as 'USER' | 'ADMIN' | '')}
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Premium:</label>
            <select
              value={filters.isPremium === undefined ? '' : filters.isPremium.toString()}
              onChange={(e) => handleFilterChange('isPremium', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">All</option>
              <option value="true">Premium</option>
              <option value="false">Non-Premium</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="createdAt">Registration Date</option>
              <option value="role">Role</option>
              <option value="isPremium">Premium Status</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={handleResetFilters} className="btn-reset">
            Reset Filters
          </button>
          <button onClick={fetchUsers} className="btn-apply">
            Apply Filters
          </button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Premium</th>
              <th>Verified</th>
              <th>Subscription</th>
              <th>Expires At</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId} className={user.role === 'ADMIN' ? 'admin-row' : ''}>
                <td>{user.userId}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role?.toLowerCase() || 'user'}`}>
                    {user.role || 'USER'}
                  </span>
                </td>
                <td>
                  <span className={`premium-badge ${user.isPremium ? 'premium' : 'non-premium'}`}>
                    {user.isPremium ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`verified-badge ${user.isVerified ? 'verified' : 'not-verified'}`}>
                    {user.isVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`subscription-badge ${isSubscriptionActive(user) ? 'active' : 'inactive'}`}>
                    {formatSubscriptionType(user.subscriptionType)}
                  </span>
                </td>
                <td>
                  {user.subscriptionExpiresAt ? (
                    <span className={`expiry-badge ${isSubscriptionActive(user) ? 'active' : 'expired'}`}>
                      {formatDate(user.subscriptionExpiresAt)}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => user.userId && handleToggleRole(user.userId)}
                      className={`btn-role ${user.role === 'ADMIN' ? 'btn-demote' : 'btn-promote'}`}
                      title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      disabled={!user.userId}
                    >
                      {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      onClick={() => user.userId && handleDeleteUser(user.userId)}
                      className="btn-delete"
                      title="Delete User"
                      disabled={!user.userId}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-users">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {pagination.lastPage > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(
              pagination.page - 2,
              pagination.lastPage - 4
            )) + i;
            
            if (pageNum > pagination.lastPage) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.lastPage}
            className="pagination-btn"
          >
            Next
          </button>

          <span className="pagination-info">
            Page {pagination.page} of {pagination.lastPage}
          </span>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;