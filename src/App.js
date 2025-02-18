import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import Auth from './Auth';
import UploadMedia from './UploadMedia';
import MediaGallery from './MediaGallery';
import './styles.css';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Check the current session
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
      } else if (error) {
        console.error('Error getting session:', error.message);
      }
    };

    checkUser();

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  return (
    <div id="app">
      {user ? (
        <div>
          <UploadMedia user={user} />
          <MediaGallery user={user} />
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
};

export default App;
