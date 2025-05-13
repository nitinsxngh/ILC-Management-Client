import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/configs/config"; // Import config

export default function BlogModal({ open, onClose, blog, setBlog, onSave, loading }) {
  const [editorValue, setEditorValue] = useState(blog.body || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(blog.img || ""); // Store the uploaded image URL
  const [categories, setCategories] = useState([]); // Store fetched categories

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blog-categories`);
        const data = await response.json();
        setCategories(data); // Assuming the response contains an array of categories
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  // Update editor value and image URL when `blog` prop changes
  useEffect(() => {
    setEditorValue(blog.body || "");
    setImageUrl(blog.img || ""); // Ensure image URL is updated when blog prop changes
  }, [blog]); // Update whenever blog changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "title" && value.length > 60) return; // Enforce title length
    if (name === "description" && value.length > 120) return; // Enforce description length

    setBlog({ ...blog, [name]: value });
  };

  const handleKeywordsChange = (e) => {
    setBlog({ ...blog, keywords: e.target.value.split(",").map((kw) => kw.trim()) });
  };

  const handleEditorChange = (value) => {
    setEditorValue(value); // Update editor content state
    setBlog({ ...blog, body: value }); // Update blog state with new body content
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg")) {
      setSelectedImage(file);
    } else {
      alert("Please select a valid image file (JPEG, PNG, JPG).");
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!selectedImage) return;

    setImageUploading(true);

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // Use config value
    formData.append("resource_type", "image");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        setBlog({ ...blog, img: data.secure_url }); // Save the uploaded image URL to the blog state
      } else {
        alert("Image upload failed.");
      }
    } catch (error) {
      alert("Error uploading image.");
      console.error("Image upload error:", error);
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>{blog._id ? "Edit Blog" : "Add New Blog"}</DialogHeader>
      <DialogBody className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh] overflow-y-auto">
        {/* Left Column (smaller width) */}
        <div className="space-y-4 col-span-1">
          {/* Image Upload Section */}
          <div>
            <input
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleImageChange}
              disabled={imageUploading}
            />
            <Button
              onClick={uploadImageToCloudinary}
              disabled={imageUploading || !selectedImage}
            >
              {imageUploading ? "Uploading..." : "Upload Image"}
            </Button>
            {imageUrl && (
              <div className="mt-4">
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <Select
            label="Category"
            name="category"
            value={blog.category}
            onChange={(e) => setBlog({ ...blog, category: e })}
            required
          >
            {/* Render fetched categories in dropdown */}
            {categories.map((category) => (
              <Option key={category._id} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>

          {/* Title Input */}
          <Input
            label="Title (max 60 chars)"
            name="title"
            value={blog.title}
            onChange={handleInputChange}
            required
            maxLength={60} // Ensure the user knows the limit
          />
          <span className="text-sm text-gray-500">
            {blog.title.length}/60 characters only
          </span>

          {/* Keywords Input */}
          <Input
            label="Keywords (comma separated)"
            name="keywords"
            value={blog.keywords.join(", ")}
            onChange={handleKeywordsChange}
            required
          />
        </div>

        {/* Right Column (larger width) */}
        <div className="col-span-2 space-y-4">
          {/* Description Textarea */}
          <Input
            label="Description (max 120 chars)"
            name="description"
            value={blog.description}
            onChange={handleInputChange}
            required
            maxLength={120} // Ensure the user knows the limit
          />
          <span className="text-sm text-gray-500">
            {blog.description.length}/120 characters
          </span>

          {/* Quill Editor for Blog Body */}
          <div className="relative">
            <ReactQuill
              value={editorValue}
              onChange={handleEditorChange}
              theme="snow"
              className="h-72"
            />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outlined"
          color="red"
          onClick={onClose}
          className="mr-4"
        >
          Cancel
        </Button>
        <Button
          color="green"
          onClick={onSave}
          disabled={
            loading ||
            !blog.category ||
            !blog.title ||
            !blog.description ||
            !blog.body ||
            !imageUrl // Disable save if image is not uploaded
          }
        >
          {loading ? "Saving..." : "Save Blog"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
