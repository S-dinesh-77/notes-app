import React from 'react'
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('authToken');  // Remove token from localStorage
        navigate('/');  // Redirect to login page
      };
  return (
    <div className='logout'><button  className='logout' onClick={handleLogout}>Logout</button></div>
  )
}

export default Logout