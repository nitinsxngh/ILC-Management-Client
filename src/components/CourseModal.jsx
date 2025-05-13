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
import "react-quill/dist/quill.snow.css";
import {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/configs/config";

export default function CourseModal({ open, onClose, course = {}, setCourse, onSave, loading }) {
  const [editorValue, setEditorValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/course-categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (course) {
      setEditorValue(course.description || "");
      setImageUrl(course.image || "");
    }
  }, [course]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (value) => {
    setEditorValue(value);
    setCourse((prev) => ({ ...prev, description: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!selectedImage) return;
    setImageUploading(true);

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        setCourse((prev) => ({ ...prev, image: data.secure_url }));
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>{course._id ? "Edit Course" : "Add New Course"}</DialogHeader>
      <DialogBody className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh] overflow-y-auto">
        <div className="col-span-1 space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={imageUploading}
            />
            <Button
              onClick={uploadImageToCloudinary}
              disabled={!selectedImage || imageUploading}
              className="mt-2"
            >
              {imageUploading ? "Uploading..." : "Upload Image"}
            </Button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Course"
                className="w-32 h-32 mt-4 object-cover rounded-md"
              />
            )}
          </div>

          <Select
            label="Category"
            value={course.category || ""}
            onChange={(val) => setCourse((prev) => ({ ...prev, category: val }))}
          >
            {categories.map((cat) => (
              <Option key={cat._id} value={cat.name}>
                {cat.name}
              </Option>
            ))}
          </Select>

          <Input
            label="Course Title"
            name="title"
            value={course.title || ""}
            onChange={handleInputChange}
          />
          <Input
            label="Instructor"
            name="instructor"
            value={course.instructor || ""}
            onChange={handleInputChange}
          />
          <Input
            label="Price (USD)"
            name="price"
            type="number"
            value={course.price || ""}
            onChange={handleInputChange}
          />
          <Input
            label="Duration"
            name="duration"
            value={course.duration || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2 space-y-4">
          <ReactQuill
            value={editorValue}
            onChange={handleEditorChange}
            theme="snow"
            className="h-72"
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outlined" color="red" onClick={onClose} className="mr-4">
          Cancel
        </Button>
        <Button
          color="green"
          onClick={onSave}
          disabled={loading || !course.title || !course.category || !editorValue || !imageUrl}
        >
          {loading ? "Saving..." : "Save Course"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}