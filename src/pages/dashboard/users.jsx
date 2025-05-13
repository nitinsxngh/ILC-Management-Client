import { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import axios from "axios";
import { API_BASE_URL } from "@/configs/config"; // Centralized API URL

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const pageSize = 10; // Number of users per page

  // Fetch users with pagination
  const fetchUsers = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { page, limit: pageSize },
      });

      if (response.data.length < pageSize) {
        setHasMore(false); // No more users to load
      }

      setUsers((prevUsers) => [...prevUsers, ...response.data]);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Infinite scroll observer
  const lastUserRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1); // Load next page
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Users Table
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {error ? (
            <Typography className="text-center text-red-500">{error}</Typography>
          ) : (
            <>
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name", "Email", "Phone", "Category", "Registered On"].map((el) => (
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
                  {users.map(({ _id, name, email, phone, category, createdAt }, index) => {
                    const className = `py-3 px-5 ${
                      index === users.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={_id} ref={index === users.length - 1 ? lastUserRef : null}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {name}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {email}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {phone || "NA"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {category || "NA"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {new Date(createdAt).toLocaleDateString()}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {loading && (
                <div className="flex justify-center py-4">
                  <Spinner className="h-8 w-8 text-gray-500" />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Users;
