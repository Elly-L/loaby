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
      alert("Please select a file before uploading.");
      return;
    }

    setUploading(true);

    try {
      // Get the current session
      const { data: session, error } = await supabase.auth.getSession();
      if (error || !session?.access_token) {
        console.error("Error getting session:", error?.message);
        alert("Authentication failed. Please log in again.");
        setUploading(false);
        return;
      }

      console.log("Uploading file:", file.name);
      console.log("User ID:", user.id);
      console.log("Token:", session.access_token);

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
