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
      // ✅ Step 1: Get Authenticated User
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error getting user:", userError?.message);
        alert("Authentication failed. Please log in again.");
        setUploading(false);
        return;
      }

      console.log("Authenticated User:", userData.user);
      const userId = userData.user.id;

      // ✅ Step 2: Define Storage Path
      const filePath = `user-${userId}/${Date.now()}-${file.name}`;

      // ✅ Step 3: Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("media-uploads") // Bucket name: "media-uploads"
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("Failed to upload file.");
        setUploading(false);
        return;
      }

      console.log("File uploaded:", data);

      // ✅ Step 4: Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("media-uploads")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrlData.publicUrl);

      // ✅ Step 5: Save Metadata in Supabase Table
      const { error: dbError } = await supabase
        .from("media_uploads")
        .insert([{ user_id: userId, file_url: publicUrlData.publicUrl, caption }]);

      if (dbError) {
        console.error("Error saving metadata:", dbError.message);
        alert("Upload complete, but metadata save failed.");
      } else {
        alert("Upload successful!");
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
