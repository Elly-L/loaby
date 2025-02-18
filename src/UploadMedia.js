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
      alert("Please select a file before uploading.");
      return;
    }

    setUploading(true);

    try {
      // ✅ Step 1: Check User Authentication
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData?.user) {
        console.error("Error getting user:", error?.message);
        alert("Authentication failed. Please log in again.");
        setUploading(false);
        return;
      }

      console.log("Authenticated User:", userData.user);

      // ✅ Step 2: Get Auth Token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        console.error("No session token found.");
        alert("Session expired. Please log in again.");
        setUploading(false);
        return;
      }

      console.log("Token:", token);

      // ✅ Step 3: Prepare FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("userId", user.id);

      // ✅ Step 4: Upload to Backend
      const response = await fetch("/functions/v1/upload-media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log("Server Response:", responseText, "Status:", response.status);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Media uploaded successfully:", data);
          alert("Upload successful!");
        } catch (jsonError) {
          console.warn("Upload successful, but response was not JSON:", jsonError);
          alert("Upload successful, but response format was unexpected.");
        }
      } else {
        console.error("Error uploading media:", responseText);
        alert(`Upload failed: ${responseText}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("An error occurred while uploading.");
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
