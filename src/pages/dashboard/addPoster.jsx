import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Input,
    Button,
  } from "@material-tailwind/react";
  import { useState, useEffect } from "react";
  import axios from "axios";
  import {
    API_BASE_URL,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
  } from "@/configs/config";
  
  export function AddPoster() {
    const [posters, setPosters] = useState([]);
    const [poster, setPoster] = useState({ name: "", videoUrl: "" });
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [selectedPosterId, setSelectedPosterId] = useState(null);
  
    useEffect(() => {
      fetchPosters();
    }, []);
  
    const getAuthHeaders = () => {
      const token = localStorage.getItem("adminToken");
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
  
    const fetchPosters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posters`, {
          headers: getAuthHeaders(),
        });
        setPosters(response.data);
      } catch (error) {
        console.error("Error fetching posters:", error);
        alert("Failed to load posters.");
      }
    };
  
    const handleOpenModal = (type, data = null) => {
      setModalType(type);
      if (data) {
        setPoster({ name: data.name, videoUrl: data.videoUrl });
        setPreviewUrl(data.videoUrl);
        setSelectedPosterId(data._id);
      } else {
        setPoster({ name: "", videoUrl: "" });
        setPreviewUrl("");
        setSelectedPosterId(null);
      }
      setOpenModal(true);
    };
  
    const handleVideoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("resource_type", "video");
  
      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            },
          }
        );
  
        const videoUrl = response.data.secure_url;
        setPoster({ ...poster, videoUrl });
        setPreviewUrl(videoUrl);
        setUploadProgress(0);
      } catch (error) {
        console.error("Error uploading video:", error);
        alert("Video upload failed.");
        setUploadProgress(0);
      }
    };
  
    const handleSavePoster = async () => {
      if (!poster.name.trim() || !poster.videoUrl) {
        alert("Both name and video are required.");
        return;
      }
  
      try {
        if (modalType === "add") {
          await axios.post(`${API_BASE_URL}/posters`, poster, {
            headers: getAuthHeaders(),
          });
        } else {
          await axios.put(`${API_BASE_URL}/posters/${selectedPosterId}`, poster, {
            headers: getAuthHeaders(),
          });
        }
        fetchPosters();
        setOpenModal(false);
      } catch (error) {
        console.error("Error saving poster:", error);
        alert("Failed to save poster.");
      }
    };
  
    const handleDeletePoster = async (id) => {
      if (window.confirm("Are you sure you want to delete this poster?")) {
        try {
          await axios.delete(`${API_BASE_URL}/posters/${id}`, {
            headers: getAuthHeaders(),
          });
          fetchPosters();
        } catch (error) {
          console.error("Error deleting poster:", error);
          alert("Failed to delete poster.");
        }
      }
    };
  
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-6 flex justify-between"
          >
            <Typography variant="h6" color="white">
              Posters
            </Typography>
            <Button
              color="white"
              size="sm"
              className="text-gray-700"
              onClick={() => handleOpenModal("add")}
            >
              + Add Poster
            </Button>
          </CardHeader>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            <table className="w-full min-w-[600px] table-auto">
              <thead>
                <tr>
                  {["ID", "Poster Name", "Preview", "Actions"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posters.map((data, index) => (
                  <tr key={data._id}>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      {index + 1}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      {data.name}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <video src={data.videoUrl} width="120" height="80" controls />
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Button
                        variant="text"
                        color="blue"
                        className="mr-2"
                        onClick={() => handleOpenModal("edit", data)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => handleDeletePoster(data._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
  
        {openModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <Typography variant="h5" color="blue-gray">
                {modalType === "add" ? "Add Poster" : "Edit Poster"}
              </Typography>
              <div className="mt-4 space-y-4">
                <Input
                  label="Poster Name"
                  value={poster.name}
                  onChange={(e) =>
                    setPoster({ ...poster, name: e.target.value })
                  }
                  maxLength={50}
                />
  
                {/* Custom Upload Button */}
                <div>
                  <label
                    htmlFor="videoUpload"
                    className={`block w-full text-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition ${
                      uploadProgress > 0 && uploadProgress < 100
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {uploadProgress > 0 && uploadProgress < 100
                      ? "Uploading..."
                      : "Upload Video"}
                  </label>
                  <input
                    id="videoUpload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  />
                </div>
  
                {/* Progress Bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
  
                {/* Video Preview */}
                {previewUrl && (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded-md mt-2"
                  />
                )}
  
                <div className="flex justify-end gap-4 mt-4">
                  <Button color="gray" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="blue"
                    onClick={handleSavePoster}
                    disabled={uploadProgress > 0 && uploadProgress < 100 || !poster.videoUrl}
                  >
                    {modalType === "add" ? "Add Poster" : "Update Poster"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default AddPoster;
  