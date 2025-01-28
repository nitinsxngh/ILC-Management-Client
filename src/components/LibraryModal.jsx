import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/configs/config"; // Config import

export default function LibraryModal({
  open,
  onClose,
  asset,
  setAsset,
  onSave,
  type,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileTypeError, setFileTypeError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories on modal open
  useEffect(() => {
    setSelectedFile(null);
    setError(null);
    setFileTypeError(null);

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/asset-categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError("Error fetching categories. Please try again.");
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      const numericValue = value.replace(/\D/g, "");
      setAsset({ ...asset, [name]: numericValue.slice(0, 10) });
    } else {
      setAsset({ ...asset, [name]: value });
    }
  };

  // Handle file selection and validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setFileTypeError(null); // Reset file type error
    } else {
      setFileTypeError("Please select a valid PDF file.");
    }
  };

  // Upload PDF to Cloudinary
  const uploadPDFToCloudinary = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "raw");

    const cloudName = CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setAsset({ ...asset, fileUrl: data.secure_url });
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (error) {
      setError("Error uploading file. Please try again.");
      console.error("Error uploading PDF:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>{type === "add" ? "Add New Asset" : "Edit Asset"}</DialogHeader>
      <DialogBody className="grid gap-4">
        <Input
          label="Title"
          name="name"
          value={asset.name}
          maxLength={60}
          onChange={handleInputChange}
          required
        />

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={asset.category}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loadingCategories}
            required
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Description"
          name="description"
          value={asset.description}
          maxLength={120}
          onChange={handleInputChange}
          required
        />
        <Input
          label="Price"
          name="price"
          type="text"
          value={asset.price}
          maxLength={10}
          onChange={handleInputChange}
          required
        />

        {/* PDF File Upload */}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          color="blue"
          onClick={uploadPDFToCloudinary}
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </Button>

        {/* Error messages */}
        {fileTypeError && <p className="text-red-500 mt-2">{fileTypeError}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}

        {asset.fileUrl && (
          <div className="mt-2">
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Uploaded PDF
            </a>
          </div>
        )}
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
            !asset.name ||
            !asset.category ||
            !asset.price ||
            !asset.fileUrl
          }
        >
          {type === "add" ? "Add Asset" : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
