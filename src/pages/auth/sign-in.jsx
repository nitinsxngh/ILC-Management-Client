import { useState } from "react"; // Add useEffect
import { Input, Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/configs/config"; // Import centralized API config

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // State for login status
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("adminToken"));

  // Handle SignIn
  const handleSignIn = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      setErrorMessage("Please provide email and password");
      return;
    }
  
    try {
      console.log("Sending request to:", `${API_BASE_URL}/admins/login`);
      const response = await axios.post(`${API_BASE_URL}/admins/login`, { email, password });
  
      console.log("Response received:", response.data);
      const { token, role } = response.data;
  
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminEmail", email);
      localStorage.setItem("adminRole", role);
  
      setIsLoggedIn(true);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
  
      if (error.response?.status === 403) {
        setErrorMessage("Your account is inactive. Contact support.");
      } else {
        setErrorMessage(error.response?.data?.message || "Invalid email or password");
      }
    }
  };
  
  

  // Handle SignOut (if applicable)
  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole"); // Remove the role as well
    setIsLoggedIn(false); // Update the state
    navigate("/sign-in"); // Redirect to sign-in page
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Sign In
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your email and password to Sign In.
          </Typography>
        </div>
        <form onSubmit={handleSignIn} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          {errorMessage && (
            <Typography color="red" className="text-sm mt-2">
              {errorMessage}
            </Typography>
          )}
          <Button type="submit" className="mt-6" fullWidth>
            Sign In
          </Button>
        </form>
        {/* Add sign-out logic for button */}
        {isLoggedIn && (
          <Button onClick={handleSignOut} className="mt-6" fullWidth>
            Sign Out
          </Button>
        )}
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default SignIn;
