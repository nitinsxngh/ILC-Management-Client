import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { API_BASE_URL } from "@/configs/config";

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

  const DROPBOX_ACCESS_TOKEN = import.meta.env.VITE_DROPBOX_TOKEN;

  useEffect(() => {
    if (!open) return;

    setSelectedFile(null);
    setError(null);
    setFileTypeError(null);

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/asset-categories`);
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Error fetching categories. Please try again.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      const numericValue = value.replace(/\D/g, "");
      setAsset({ ...asset, [name]: numericValue.slice(0, 10) });
    } else {
      setAsset({ ...asset, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setFileTypeError(null);
    } else {
      setFileTypeError("Please select a valid PDF file.");
    }
  };

  const getSharedLink = async (filePath) => {
    const headers = {
      Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    try {
      const createRes = await fetch(
        "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            path: filePath,
            settings: {
              requested_visibility: "public",
              audience: "public",
              access: "viewer",
            },
          }),
        }
      );

      if (createRes.status === 409) {
        const listRes = await fetch(
          "https://api.dropboxapi.com/2/sharing/list_shared_links",
          {
            method: "POST",
            headers,
            body: JSON.stringify({ path: filePath }),
          }
        );

        const listData = await listRes.json();
        return listData.links[0]?.url || "";
      }

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(`Dropbox API: ${errorData.error_summary}`);
      }

      const createData = await createRes.json();
      return createData.url;
    } catch (err) {
      console.error("Shared link error:", err);
      setError(err.message);
      return "";
    }
  };

  const getPreviewLink = (sharedUrl) => {
    if (!sharedUrl) return "";
    try {
      const url = new URL(sharedUrl);
      url.searchParams.set("dl", "0");
      url.searchParams.set("raw", "1");
      return url.toString();
    } catch (err) {
      console.error("URL transformation error:", err);
      return sharedUrl;
    }
  };

  const uploadPDFToDropbox = async () => {
    if (!selectedFile || !DROPBOX_ACCESS_TOKEN) {
      setError("Missing file or Dropbox access token.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const sanitizedFilename = encodeURIComponent(selectedFile.name);

      const uploadRes = await fetch(
        "https://content.dropboxapi.com/2/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Dropbox-API-Arg": JSON.stringify({
              path: `/${sanitizedFilename}`,
              mode: "overwrite",
              autorename: false,
            }),
            "Content-Type": "application/octet-stream",
          },
          body: selectedFile,
        }
      );

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error_summary);
      }

      const uploadData = await uploadRes.json();
      const sharedUrl = await getSharedLink(uploadData.path_display);
      const previewLink = getPreviewLink(sharedUrl);

      if (!previewLink) {
        throw new Error("Failed to generate preview link");
      }

      setAsset((prev) => ({ ...prev, fileUrl: previewLink }));
    } catch (err) {
      console.error("Dropbox error:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>{type === "add" ? "Add New Asset" : "Edit Asset"}</DialogHeader>
      <DialogBody className="grid gap-4">
        <Input
          label="Name"
          name="name"
          value={asset.name || ""}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Description"
          name="description"
          value={asset.description || ""}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Price"
          name="price"
          value={asset.price || ""}
          onChange={handleInputChange}
          required
        />

        <select
          name="category"
          value={asset.category || ""}
          onChange={handleInputChange}
          className="border p-2 rounded text-sm"
          disabled={loadingCategories}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id || cat.name} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="space-y-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-600">
            Only PDF files are accepted (Max size: 25MB)
          </p>
        </div>

        <Button
          color="blue"
          onClick={uploadPDFToDropbox}
          disabled={!selectedFile || uploading}
          className="flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload PDF'
          )}
        </Button>

        {fileTypeError && <p className="text-red-500 text-sm">{fileTypeError}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {asset.fileUrl && (
          <div className="mt-4">
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 inline-block"
            >
              Open PDF in new tab
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
            !asset.name?.trim() ||
            !asset.description?.trim() ||
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
