import React, { useState } from "react";
import supabase from "./supabaseClient";

const UploadMedia = ({ user }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected.");
      return;
    }

    setUploading(true);

    try {
      // Get the current session
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
        setUploading(false);
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("userId", user.id);

      // Upload file to backend
      const response = await fetch("/functions/v1/upload-media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          // No need to set 'Content-Type' manually for FormData
        },
        body: formData,
      });

      // Handle response
      if (response.ok) {
        try {
          const data = await response.json();
          console.log("Media uploaded successfully:", data);
        } catch (jsonError) {
          console.warn("Upload successful, but response was not JSON:", jsonError);
        }
      } else {
        const errorText = await response.text();
        console.error("Error uploading media:", errorText);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
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
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadMedia;
