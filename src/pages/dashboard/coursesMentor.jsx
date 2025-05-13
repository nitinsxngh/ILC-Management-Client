import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import CourseMentorModal from "@/components/CoursesMentorModal";
import { API_BASE_URL } from "@/configs/config";
import { v4 as uuidv4 } from "uuid"; // Importing uuid for unique mentorId generation

function CourseMentors({
  mentorsData,
  professionTypesData,
  specializationsData,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [mentorDetails, setMentorDetails] = useState({
    mentorId: "",
    mentorName: "",
    mentorEmail: "",
    professionType: "",
    specialization: "",
  });
  const [mentors, setMentors] = useState(mentorsData || []);
  const [professionTypes] = useState(professionTypesData || []);
  const [specializations] = useState(specializationsData || []);

  // Fetch mentors when the component mounts
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/course-mentors`);
        const data = await response.json();
        setMentors(data); // Update mentors state with fetched data
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentors();
  }, []); // This will only run once on mount

  const handleMenuClick = (mentorId) => {
    setOpenMenuId(openMenuId === mentorId ? null : mentorId);
  };

  const handleOpenModal = (type, mentor = null) => {
    setModalType(type);
    setMentorDetails(
      mentor
        ? { 
            mentorId: mentor.mentorId,
            mentorName: mentor.mentorName,
            mentorEmail: mentor.mentorEmail,
            professionType: mentor.professionType,
            specialization: mentor.specialization
          }
        : {
            mentorId: "",
            mentorName: "",
            mentorEmail: "",
            professionType: "",
            specialization: "",
          }
    );
    setOpenModal(true);
  };

  const handleAddOrEditMentor = async () => {
    try {
      // Generate mentorId for new mentors
      const mentorPayload = modalType === "add"
        ? {
            mentorName: mentorDetails.mentorName,
            mentorEmail: mentorDetails.mentorEmail,
            professionType: mentorDetails.professionType,
            specialization: mentorDetails.specialization,
            mentorId: uuidv4(), // Generate unique mentorId
            associatedCourses: mentorDetails.associatedCourses || [],  // Optional empty array
          }
        : mentorDetails;  // If editing, send full mentor details

      const url = modalType === "add"
        ? `${API_BASE_URL}/course-mentors`
        : `${API_BASE_URL}/course-mentors/${mentorDetails.mentorId}`;
      
      const method = modalType === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mentorPayload),
      });

      if (!response.ok) throw new Error("Failed to save mentor");

      const result = await response.json();
      setMentors((prev) =>
        modalType === "add"
          ? [...prev, result]
          : prev.map((m) => (m.mentorId === result.mentorId ? result : m))
      );
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving mentor:", error);
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    try {
      await fetch(`${API_BASE_URL}/course-mentors/${mentorId}`, {
        method: "DELETE",
      });
      setMentors((prev) => prev.filter((m) => m.mentorId !== mentorId));
    } catch (error) {
      console.error("Error deleting mentor:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Course Mentors
          </Typography>
          <Button color="white" size="sm" onClick={() => handleOpenModal("add")}>
            + Add Mentor
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Mentor Name", "Mentor Email", "Profession", "Specialization", "Actions"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mentors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500">
                    No mentors found.
                  </td>
                </tr>
              ) : (
                mentors.map((mentor, index) => {
                  const className = `py-3 px-5 ${
                    index === mentors.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={mentor.mentorId}>
                      <td className={className}>
                        <Typography variant="small" className="font-semibold">
                          {mentor.mentorName}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {mentor.mentorEmail}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {mentor.professionType}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {mentor.specialization}
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
                })
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <CourseMentorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        mentor={mentorDetails}
        setMentor={setMentorDetails}
        onSave={handleAddOrEditMentor}
        professionTypes={professionTypes}
        specializations={specializations}
        type={modalType}
      />
    </div>
  );
}

export default CourseMentors;
