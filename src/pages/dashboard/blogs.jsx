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
import BlogModal from "@/components/BlogModal"; // Importing the modal component
import axios from "axios"; // Importing Axios for API requests
import { API_BASE_URL } from "@/configs/config"; // Import centralized API config

export function Blogs() {
  const [openModal, setOpenModal] = useState(false);
  const [newBlog, setNewBlog] = useState({
    img: "",
    category: "",
    title: "",
    description: "",
    body: "",
    keywords: [],
    timestamp: "",
  });
  const [blogs, setBlogs] = useState([]); // State for holding all blogs
  const [loading, setLoading] = useState(false); // Track loading state for preventing duplicate requests

  // Fetch the blogs from the server or an API (useEffect hook)
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/blogs`); // Use the centralized API base URL
        console.log("Fetched blogs:", response.data); // Check the fetched data
        setBlogs(response.data); // Storing blogs in state
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setNewBlog(blog); // Pre-fill the modal with the blog data if editing
    } else {
      setNewBlog({
        img: "",
        category: "",
        title: "",
        description: "",
        body: "",
        keywords: [],
        timestamp: "",
      });
    }
    setOpenModal(true);
  };

  const handleSaveBlog = async () => {
    if (loading) return; // Prevent saving if already in progress
    setLoading(true);

    const blogToSave = {
      ...newBlog,
      timestamp: newBlog.timestamp || new Date(),
    };

    try {
      let response;
      if (newBlog._id) {
        // Updating an existing blog
        response = await axios.put(`${API_BASE_URL}/blogs/${newBlog._id}`, blogToSave); // Use the centralized API base URL
        console.log("Blog updated:", response.data);

        // Update the blogs array by replacing the old blog with the updated blog
        setBlogs(prevBlogs =>
          prevBlogs.map(blog => (blog._id === newBlog._id ? response.data : blog))
        );
      } else {
        // Adding a new blog
        response = await axios.post(`${API_BASE_URL}/blogs`, blogToSave); // Use the centralized API base URL
        console.log("New Blog added:", response.data);

        // Add the new blog to the beginning of the list to ensure it appears immediately
        setBlogs(prevBlogs => [response.data, ...prevBlogs]);
      }

      setOpenModal(false); // Close modal after saving
    } catch (error) {
      console.error("Error saving blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (_id) => {
    try {
      await axios.delete(`${API_BASE_URL}/blogs/${_id}`); // Use the centralized API base URL
      setBlogs(blogs.filter(blog => blog._id !== _id)); // Remove the blog from the state
      console.log("Blog deleted");
    } catch (error) {
      console.error("Error deleting blog:", error);
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
            Blogs Table
          </Typography>
          <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal()}>
            + Add Blog
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "ID",
                  "Image",
                  "Category",
                  "Title",
                  "Description",
                  "Keywords",
                  "Timestamp",
                  "Actions",
                ].map((el) => (
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
              {blogs.map(({ _id, img, category, title, description, body, keywords, timestamp }, index) => {
                const className = `py-3 px-5 ${index === blogs.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                // Format the timestamp (convert from Unix timestamp)
                const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleString() : "No timestamp";

                return (
                  <tr key={_id}> {/* Use MongoDB _id as the key */}
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {index + 1}  {/* Display the sequence number here */}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Avatar src={img || ""} alt={title} size="sm" variant="rounded" />  {/* Fallback for image */}
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {category || "No category"}  {/* Default if category is undefined */}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {title && title.length > 30 ? title.slice(0, 30) + "..." : title || "No title"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {description && description.length > 30 ? description.slice(0, 30) + "..." : description || "No description"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {keywords && keywords.length > 0 ? keywords.join(", ") : "No keywords"}  {/* Handle empty or undefined keywords */}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {formattedTimestamp}  {/* Render formatted timestamp */}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Menu placement="left-start">
                        <MenuHandler>
                          <Button variant="text" className="p-0">
                            <EllipsisVerticalIcon className="h-5 w-5 text-blue-gray-500 cursor-pointer" />
                          </Button>
                        </MenuHandler>
                        <MenuList className="text-blue-gray-700">
                          <MenuItem onClick={() => handleOpenModal({ _id, img, category, title, description, body, keywords, timestamp })}>
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleDeleteBlog(_id)} className="text-red-500">
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

      {/* Blog Modal */}
      <BlogModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        blog={newBlog}
        setBlog={setNewBlog}
        onSave={handleSaveBlog}  // Directly pass handleSaveBlog
        loading={loading}  // Pass loading state to modal
      />
    </div>
  );
}

export default Blogs;
