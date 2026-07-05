/**
 * Home/Dashboard page - redirects to audiobooks
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Home.css';
const Home: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to audiobooks page by default
    navigate('/library', { replace: true });
  }, [navigate]);
  return (
    <div className="home-page">
      <div className="loading-state">
        <p>Redirecting...</p>
      </div>
    </div>
  );
};

export default Home;
