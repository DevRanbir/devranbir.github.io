import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Documents from './components/Documents';
import Projects from './components/Projects';
import About from './components/About';
import Contacts from './components/Contacts';
import Controller from './components/Controller';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/controller" element={<Controller />} />
          <Route path="/god" element={<Controller />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
