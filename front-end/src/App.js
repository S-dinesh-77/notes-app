import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Notes from './Notes';
import Logout from './Logout';



const App = () => {
    return (

   
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/notes" element={<Notes />} />
                <Route path='/logout' element={<Logout/>} />
            </Routes>
        </Router>
   
    );
};

export default App;
