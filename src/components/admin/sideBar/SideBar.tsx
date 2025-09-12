import { ChevronDown, ChevronUp, Menu, NavigationIcon, Navigation2Off, HourglassIcon, Timer, Pen,  Edit, Users2Icon, Eye, LucideLanguages } from 'lucide-react';
import React, { useState } from 'react';
import './sideBar.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface AdminSideBarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar: React.FC<AdminSideBarProps> = ({ collapsed, setCollapsed }) => {
  const [showLocations, setShowLocations] = useState<boolean>(false);
  const [showPeriods, setShowPeriods] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(false);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [showVisits, setShowVisits] = useState<boolean>(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCollapsed(true);
  };

  const handleSelect = () => {
    setCollapsed(true);
  };

  return (
    <>
      <button className="mobile-toggle" onClick={() => setCollapsed(false)}>
        <Menu size={24} /> .
      </button>

      {!collapsed && <div className="overlay" onClick={() => setCollapsed(true)}></div>}
      <div className={`sidebar ${collapsed ? 'collapsed' : 'open'}`}>
        <div className="sidebar-header">
          <h2>Admin settings</h2>
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        <nav className="sidebar-nav">
        <div
            className="nav-item"
            onClick={() => setShowPeriods(!showPeriods)}
          >
            <span>Time Periods</span>
          </div>
          {showPeriods && (
            <div className="submenu">
              <Link to="createTimePeriod" onClick={handleSelect}>
                <HourglassIcon size={18} /> Create Time Period
              </Link>
              <Link to="manageTimePeriod" onClick={handleSelect}>
                <Timer size={18} /> Manage Time Period
              </Link>
              <Link to="translateTimePeriod" onClick={handleSelect}>
                <LucideLanguages size={18} /> Translate Time Period
              </Link>
            </div>
          )}

          <div
            className="nav-item"
            onClick={() => setShowLocations(!showLocations)}
          >
            <span>Locations</span>
          </div>
          {showLocations && (
            <div className="submenu">
              <Link to="createLocation" onClick={handleSelect}>
                <NavigationIcon size={18} /> Create Location
              </Link>
              <Link to="manageLocations" onClick={handleSelect}>
                <Navigation2Off size={18} /> Manage Locations
              </Link>
            </div>
          )}
          <div
            className="nav-item"
            onClick={() => setShowEvents(!showEvents)}
          >
            <span>Events</span>
          </div>
          {showEvents && (
            <div className="submenu">
              <Link to="createEvents" onClick={handleSelect}>
                <Pen size={18} /> Create Events
              </Link>
              <Link to="manageEvents" onClick={handleSelect}>
                <Edit size={18} /> Manage Events
              </Link>
              <Link to="translateEvents" onClick={handleSelect}>
                <LucideLanguages size={18} /> Translate Events
              </Link>
            </div>
          )}
          <div
            className="nav-item"
            onClick={() => setShowUsers(!showUsers)}
          >
            <span>Users</span>
          </div>
          {showUsers && (
            <div className="submenu">
              <Link to="manageUsers" onClick={handleSelect}>
                <Users2Icon size={18} /> Manage Users
              </Link>
            </div>
          )}
          <div
            className="nav-item"
            onClick={() => setShowVisits(!showVisits)}
          >
            <span>Visits</span>
          </div>
          {showVisits && (
            <div className="submenu">
              <Link to="showVisits" onClick={handleSelect}>
                <Eye size={18} /> Show visits
              </Link>
            </div>
          )}
        </nav>

        <button className="logout" type="button" onClick={handleLogout}>
          Odjavi se
        </button>
      </div>
    </>
  );
};

export default SideBar;
