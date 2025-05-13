import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/configs/config"; // Import config

export default function MentorModal({
  open,
  onClose,
  mentor,
  setMentor,
  onSave,
  type,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileTypeError, setFileTypeError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [emailValid, setEmailValid] = useState(true);

  // Reset values and prepare for modal open
  useEffect(() => {
    setSelectedFile(null);
    setError(null);
    setFileTypeError(null);

    if (mentor?.img) {
      setPreview(mentor.img);
    } else {
      setPreview(null);
    }
  }, [open, mentor]);

  // Handle input field changes
  const handleInputChange = (e) => {
    setMentor({ ...mentor, [e.target.name]: e.target.value });

    if (e.target.name === "email") {
      validateEmail(e.target.value);
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmailValid(emailPattern.test(email));
  };

  // Handle file (image) change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setFileTypeError(null); // Clear any previous file type errors
      setPreview(URL.createObjectURL(file)); // Generate preview for the selected image
    } else {
      setFileTypeError("Please select a valid image file.");
      setPreview(null); // Reset preview on invalid file type
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null); // Reset error before uploading

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const cloudName = CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setMentor({ ...mentor, img: data.secure_url });
        setPreview(data.secure_url);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (error) {
      setError("Error uploading image. Please try again.");
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>{type === "add" ? "Add New Mentor" : "Edit Mentor"}</DialogHeader>
      <DialogBody className="grid gap-4">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2"
          />
          <Button
            color="blue"
            onClick={uploadImageToCloudinary}
            disabled={!selectedFile || uploading}
            className="mt-2"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          {fileTypeError && <p className="text-red-500 mt-2">{fileTypeError}</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}

          {/* Image Preview */}
          <div className="mt-4">
            {preview && (
              <img
                src={preview}
                alt="Image Preview"
                className="w-32 h-32 object-cover rounded-md shadow-md"
              />
            )}
          </div>
        </div>

        {/* Mentor Info Inputs */}
        <div>
          <Input
            label="Name"
            name="name"
            value={mentor.name}
            onChange={handleInputChange}
            maxLength={60}
          />
        </div>

        <div>
          <Input
            label="Email"
            name="email"
            value={mentor.email}
            onChange={handleInputChange}
            maxLength={60}
            error={!emailValid}
          />
          {!emailValid && (
            <p className="text-red-500 text-sm">Please enter a valid email address.</p>
          )}
        </div>

        <div>
          <Input
            label="Job Title"
            name="jobTitle"
            value={mentor.jobTitle}
            onChange={handleInputChange}
            maxLength={60}
          />
        </div>

        <div>
          <Input
            label="Company"
            name="jobCompany"
            value={mentor.jobCompany}
            onChange={handleInputChange}
            maxLength={60}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="blue"
          onClick={onSave}
          disabled={
            uploading ||
            !mentor.name ||
            !mentor.email ||
            !mentor.jobTitle ||
            !mentor.jobCompany ||
            !mentor.img ||
            !emailValid // Disable button if email is invalid
          }
        >
          {type === "add" ? "Add Mentor" : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}