import React, { useEffect, useState } from 'react';
import supabase from './supabaseClient';

const MediaGallery = ({ user }) => {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from('media') // Ensure this matches your table name
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching media:', error.message);
      } else {
        setMedia(data);
      }
    };

    fetchMedia();
  }, [user]);

  return (
    <div className="gallery">
      {media.map((item) => (
        <div key={item.id}>
          <img src={`https://rqbbiezwdxquijlqxjjg.supabase.co/storage/v1/object/public/media/${item.path}`} alt={item.caption} />
          <p>{item.caption}</p>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
