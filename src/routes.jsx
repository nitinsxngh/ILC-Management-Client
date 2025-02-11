import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  UserIcon,
  BookOpenIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Home, Admins, Users, Library, Blogs, Mentors, AddBlogCategory, AddAssetCategory } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import SignOut from "@/pages/auth/sign-out"; // Correct default import

const icon = {
  className: "w-5 h-5 text-inherit",
};

const isLoggedIn = !!localStorage.getItem("adminToken"); // Check if logged in

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserIcon {...icon} />,
        name: "admins",
        path: "/admins",
        element: <Admins />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: "users",
        path: "/users",
        element: <Users />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "library",
        path: "/library",
        element: <Library />,
      },
      {
        icon: <BookOpenIcon {...icon} />,
        name: "blogs",
        path: "/blogs",
        element: <Blogs />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "mentors",
        path: "/mentors",
        element: <Mentors />,
      },
      {
        icon: <BookOpenIcon {...icon} />,
        name: "Add blogs Category",
        path: "/add-blog-category",
        element: <AddBlogCategory />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Add asset Category",
        path: "/add-asset-category",
        element: <AddAssetCategory />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        path: isLoggedIn ? "/sign-out" : "/sign-in", // Conditional rendering
        element: isLoggedIn ? <SignOut /> : <SignIn />, // Conditional rendering
      },
    ],
  },
];

export default routes;
