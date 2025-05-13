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
import { useState, useEffect } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import CourseModal from "@/components/CourseModal";
import { API_BASE_URL } from "@/configs/config";

export function Courses() {
  const [openModal, setOpenModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    image: "",
    title: "",
    instructor: "",
    duration: "",
    category: "",
    description: "",
    price: "",
    tags: [],
    timestamp: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleOpenModal = (course = null) => {
    setNewCourse(
      course || {
        image: "",
        title: "",
        instructor: "",
        duration: "",
        category: "",
        description: "",
        price: "",
        tags: [],
        timestamp: "",
      }
    );
    setOpenModal(true);
  };

  const handleSaveCourse = async () => {
    try {
      setLoading(true);
      const courseData = {
        image: newCourse.image,
        title: newCourse.title,
        instructor: newCourse.instructor,
        duration: newCourse.duration,
        category: newCourse.category,
        description: newCourse.description,
        price: newCourse.price,
        tags: newCourse.tags,
      };

      if (!courseData.title || !courseData.category || !courseData.description || !courseData.image) {
        alert("Please fill in all required fields");
        return;
      }

      let response;
      if (newCourse._id) {
        response = await axios.put(
          `${API_BASE_URL}/courses/${newCourse._id}`,
          courseData
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/courses`,
          courseData
        );
      }

      // Refresh courses list
      const updatedResponse = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(updatedResponse.data);
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error saving course. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (_id) => {
    try {
      await axios.delete(`${API_BASE_URL}/courses/${_id}`);
      setCourses(courses.filter(course => course._id !== _id));
    } catch (error) {
      console.error("Error deleting course:", error);
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
            Courses Table
          </Typography>
          <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal()}>
            + Add Course
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "ID",
                  "Image",
                  "Title",
                  "Instructor",
                  "Duration",
                  "Category",
                  "Price",
                  "Tags",
                  "Timestamp",
                  "Actions",
                ].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map(({ _id, image, title, instructor, duration, category, description, price, tags, timestamp }, index) => {
                const className = `py-3 px-5 ${index === courses.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleString() : "N/A";

                return (
                  <tr key={_id}>
                    <td className={className}><Typography variant="small">{index + 1}</Typography></td>
                    <td className={className}><Avatar src={image || ""} alt={title} size="sm" variant="rounded" /></td>
                    <td className={className}><Typography variant="small">{title}</Typography></td>
                    <td className={className}><Typography variant="small">{instructor}</Typography></td>
                    <td className={className}><Typography variant="small">{duration}</Typography></td>
                    <td className={className}><Typography variant="small">{category}</Typography></td>
                    <td className={className}><Typography variant="small">${price}</Typography></td>
                    <td className={className}><Typography variant="small">{tags?.join(", ") || "N/A"}</Typography></td>
                    <td className={className}><Typography variant="small">{formattedTimestamp}</Typography></td>
                    <td className={className}>
                      <Menu placement="left-start">
                        <MenuHandler>
                          <Button variant="text" className="p-0">
                            <EllipsisVerticalIcon className="h-5 w-5 text-black-gray-500 cursor-pointer" />
                          </Button>
                        </MenuHandler>
                        <MenuList className="text-black-gray-700">
                          <MenuItem onClick={() => handleOpenModal({ _id, image, title, instructor, duration, category, description, price, tags, timestamp })}>Edit</MenuItem>
                          <MenuItem onClick={() => handleDeleteCourse(_id)} className="text-red-500">Delete</MenuItem>
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

      <CourseModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        course={newCourse}
        setCourse={setNewCourse}
        onSave={handleSaveCourse}
        loading={loading}
      />
    </div>
  );
}

export default Courses;