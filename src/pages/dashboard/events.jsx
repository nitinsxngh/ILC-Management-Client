import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/configs/config";

export function Events() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    description: "",
    video: "",
    date: "",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
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

    const formDataImage = new FormData();
    formDataImage.append("file", selectedImage);
    formDataImage.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formDataImage,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, image: data.secure_url }));
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddEvent = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.image
    ) {
      alert("Please fill out all required fields and upload image.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save event");

      const savedEvent = await res.json();
      setEvents((prev) => [...prev, savedEvent]);

      setFormData({
        title: "",
        image: "",
        description: "",
        video: "",
        date: "",
      });
      setSelectedImage(null);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to add event. Try again.");
    }
  };

  return (
    <div className="p-6 space-y-10">
      <Typography variant="h4" color="blue-gray">
        Add Event
      </Typography>

      <Card className="p-6">
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
          <Input
            type="datetime-local"
            label="Event Date & Time"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
          <div className="col-span-full">
            <label className="block mb-2 font-medium text-sm">Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <Button
              onClick={uploadImageToCloudinary}
              disabled={!selectedImage || imageUploading}
              className="mt-2"
            >
              {imageUploading ? "Uploading..." : "Upload Image"}
            </Button>
            {formData.image && (
              <img
                src={formData.image}
                alt="Event"
                className="w-32 h-32 mt-4 object-cover rounded-md"
              />
            )}
          </div>
          <Input
            label="Video URL (YouTube or direct)"
            name="video"
            value={formData.video}
            onChange={handleInputChange}
          />
          <div className="col-span-full">
            <label className="block mb-2 font-medium text-sm">
              Description
            </label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              className="h-40 mb-6"
            />
          </div>
          <div className="col-span-full">
            <Button color="green" onClick={handleAddEvent}>
              Add Event
            </Button>
          </div>
        </CardBody>
      </Card>

      <Typography variant="h4" color="blue-gray">
        Upcoming Events
      </Typography>

      {events.length === 0 ? (
        <p>No events added yet.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {events.map((event, index) => (
            <Card key={index} className="p-4 space-y-3">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <Typography variant="h5">{event.title}</Typography>
              <Typography variant="small" color="gray">
                Date: {new Date(event.date).toLocaleString()}
              </Typography>
              <div dangerouslySetInnerHTML={{ __html: event.description }} />
              {event.video && (
                <div className="aspect-video mt-2">
                  {event.video.includes("youtube.com") ||
                  event.video.includes("youtu.be") ? (
                    <iframe
                      src={event.video.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title="Event Video"
                    ></iframe>
                  ) : (
                    <video src={event.video} controls className="w-full h-full" />
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
