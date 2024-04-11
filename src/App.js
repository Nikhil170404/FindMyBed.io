import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyA1S8iHwDNl8qvl3ClLVBXpW3QNltrVIRg",
  authDomain: "findmybed-6f97a.firebaseapp.com",
  projectId: "findmybed-6f97a",
  storageBucket: "findmybed-6f97a.appspot.com",
  messagingSenderId: "521085721021",
  appId: "1:521085721021:web:7fb1796d69261b23d75ad4",
  measurementId: "G-5R33XF3D4W",
};

firebase.initializeApp(firebaseConfig);

const UserSite = ({ hospitals }) => {
  const [expandedHospitalId, setExpandedHospitalId] = useState(null);

  const handleHospitalClick = (hospitalId) => {
    setExpandedHospitalId(prevId => (prevId === hospitalId ? null : hospitalId));
  };

  return (
    <div>
      {hospitals.map(hospital => (
        <div key={hospital.id} className="hospital-card" onClick={() => handleHospitalClick(hospital.id)}>
          <div className="hospital-header">
            <h2>{hospital.name}</h2>
            <p>Location: {hospital.location}</p>
            <button onClick={(event) => {
              event.stopPropagation();
              handleHospitalClick(hospital.id);
            }}>
              {expandedHospitalId === hospital.id ? 'Show Less' : 'Show Details'}
            </button>
          </div>
          {expandedHospitalId === hospital.id && (
            <div className="ward-info">
              <h3>Wards</h3>
              <ul>
                {hospital.wards.map(ward => (
                  <li key={ward.name}>
                    <h4>{ward.name}</h4>
                    <p>Total Beds: {ward.beds}</p>
                    <p>Vacant Beds: {ward.vacantBeds}</p>
                    {/* Add logic to display availability status */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [allHospitals, setAllHospitals] = useState([]); // Original list of hospitals
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const snapshot = await firebase.firestore().collection('hospitals').get();
        const hospitalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllHospitals(hospitalsData); // Set the original list of hospitals
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hospitals:', error.message);
        setLoading(false); // Update loading state even if fetching fails
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setUser(user);
    });

    return () => unregisterAuthObserver();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleSearch = () => {
    // Filter hospitals based on the search query without modifying the original list
    const filteredHospitals = allHospitals.filter(hospital => {
      const nameMatch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = hospital.location.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || locationMatch;
    });
    setAllHospitals(filteredHospitals); // Update the list of hospitals with filtered results
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    // Reset the list of hospitals to the original list
    setAllHospitals(allHospitals);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="sign-in-page">
        <h1>Welcome to FindMyBed</h1>
        <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="left-section">
          <h1>FindMyBed</h1>
          <p>Welcome, {user.displayName}</p>
        </div>
        <div className="right-section">
          <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>
      <nav className="secondary-navbar">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search hospitals..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleResetSearch}>Reset</button>
      </div>
      <div className="container">
        <h1>List of Hospitals</h1>
        <UserSite hospitals={allHospitals} />
      </div>
      
    </div>
  );
};

export default App;
