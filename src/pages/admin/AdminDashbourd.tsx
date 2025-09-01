import { useState } from 'react';
import './adminDashbourd.scss';
import SideBar from '../../components/admin/sideBar/SideBar';
import { Outlet } from 'react-router-dom';


const AdminDashbourd = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-dashbourd ${collapsed ? 'collapsed' : ''}`}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className='admin-container'>
        <div className='admin-contant'>
          <h1>Administrator Panel</h1>
          <div className='content'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashbourd;