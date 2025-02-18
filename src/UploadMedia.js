import React, { useState } from 'react';
import supabase from './supabaseClient';

const UploadMedia = ({ user }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    // Get the current session
    const { data: session, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error.message);
      return;
    }

    const response = await fetch('/functions/v1/upload-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ file, caption, userId: user.id }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Media uploaded:', data);
    } else {
      console.error('Error uploading media:', data.error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadMedia;
