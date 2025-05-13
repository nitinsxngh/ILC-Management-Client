import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import MentorModal from "@/components/MentorModal";
import { API_BASE_URL } from "@/configs/config"; // Import centralized API config

export function Mentors() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [mentorDetails, setMentorDetails] = useState({
    id: "",
    mentorId: "",  // Change id field to mentorId
    img: "",
    name: "",
    email: "",
    jobTitle: "",
    jobCompany: "",
    date: "",
  });
  const [mentors, setMentors] = useState([]);

  // Placeholder image URL
  const placeholderImage = "/img/avatar.png"; // You can use a valid URL or an image from your assets

  // Function to format date to "YYYY-MM-DD HH:mm:ss"
  const formatDate = (dateString) => {
    if (!dateString) {
      return "No valid date"; // Return default message if date is missing
    }

    const jsDate = new Date(dateString);

    if (isNaN(jsDate.getTime())) {
      return "Invalid date"; // Handle invalid date strings
    }

    return jsDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",  // Example: Jan, Feb
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,  // 12-hour format with AM/PM
    });
  };

  // Fetch the mentors from the API on component mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mentors`); // Use API_BASE_URL
        if (!response.ok) {
          throw new Error("Failed to fetch mentors");
        }
        const data = await response.json();
        setMentors(data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentors();
  }, []);

  const handleMenuClick = (mentorId) => {
    setOpenMenuId(openMenuId === mentorId ? null : mentorId);
  };

  const handleOpenModal = (type, mentor = null) => {
    setModalType(type);
    if (mentor) {
      setMentorDetails({
        mentorId: mentor.mentorId,  // Use mentorId instead of _id
        img: mentor.img || placeholderImage, // Use placeholder if img is unavailable
        name: mentor.name,
        email: mentor.email,
        jobTitle: mentor.jobTitle,
        jobCompany: mentor.jobCompany,
        date: formatDate(mentor.date), // Format the date here
      });
    } else {
      setMentorDetails({
        mentorId: "",
        img: placeholderImage, // Set placeholder on add
        name: "",
        email: "",
        jobTitle: "",
        jobCompany: "",
        date: "",
      });
    }
    setOpenModal(true);
  };

  const handleAddOrEditMentor = async () => {
    try {
      const url =
        modalType === "add"
          ? `${API_BASE_URL}/mentors`
          : `${API_BASE_URL}/mentors/${mentorDetails.mentorId}`;  // Use mentorId for URL
      const method = modalType === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mentorDetails),
      });

      if (!response.ok) {
        throw new Error(`${modalType === "add" ? "Failed to add" : "Failed to update"} mentor`);
      }

      const result = await response.json();
      if (modalType === "add") {
        setMentors([...mentors, result]);
      } else {
        setMentors(
          mentors.map((mentor) =>
            mentor.mentorId === mentorDetails.mentorId ? { ...mentor, ...mentorDetails } : mentor
          )
        );
      }
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving mentor:", error);
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete mentor");
      }

      setMentors(mentors.filter((mentor) => mentor.mentorId !== mentorId));  // Use mentorId to filter
    } catch (error) {
      console.error("Error deleting mentor:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Mentors Table
          </Typography>
          <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal("add")}>
            + Add Mentor
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["ID", "Image", "Name", "Role", "Timestamp", "Actions"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mentors.map((mentor, index) => {
                const className = `py-3 px-5 ${index === mentors.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                return (
                  <tr key={`${mentor.mentorId}-${index}`}>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {index + 1} {/* Display sequence number starting from 1 */}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Avatar
                        src={mentor.img || placeholderImage} // Fallback to placeholder image if img is unavailable
                        alt={mentor.name}
                        size="sm"
                        variant="rounded"
                      />
                    </td>
                    <td className={className}>
                      <div className="flex flex-col">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {mentor.name || "No Name Available"}
                        </Typography>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {mentor.email || "No email available"}
                        </Typography>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {mentor.jobTitle || "No job title available"}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {mentor.jobCompany || "No company available"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {formatDate(mentor.date) || "No date available"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Menu open={openMenuId === mentor.mentorId} handler={() => handleMenuClick(mentor.mentorId)}>
                        <MenuHandler>
                          <Button variant="text" className="p-0">
                            <EllipsisVerticalIcon className="h-5 w-5 text-blue-gray-500 cursor-pointer" />
                          </Button>
                        </MenuHandler>
                        <MenuList>
                          <MenuItem onClick={() => handleOpenModal("edit", mentor)}>Edit</MenuItem>
                          <MenuItem onClick={() => handleDeleteMentor(mentor.mentorId)} className="text-red-500">
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Mentor Modal */}
      <MentorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        mentor={mentorDetails}
        setMentor={setMentorDetails}
        onSave={handleAddOrEditMentor}
        type={modalType}
      />
    </div>
  );
}

export default Mentors;
