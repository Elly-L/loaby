import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import Auth from './Auth';
import UploadMedia from './UploadMedia';
import MediaGallery from './MediaGallery';
import './styles.css';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user || null);

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

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
