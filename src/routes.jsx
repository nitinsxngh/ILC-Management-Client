import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  BookOpenIcon,
  UsersIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import {
  Home,
  Admins,
  Users,
  Library,
  Blogs,
  Courses,
  CoursesMentor,
  Mentors,
  AddBlogCategory,
  AddAssetCategory,
  AddCoursesCategory,
  AddPoster,
} from "@/pages/dashboard";

import { SignIn, SignUp } from "@/pages/auth";
import SignOut from "@/pages/auth/sign-out";

const iconMapping = {
  Dashboard: <HomeIcon className="w-5 h-5 text-inherit" />,
  Admins: <UserCircleIcon className="w-5 h-5 text-inherit" />,
  Users: <UserPlusIcon className="w-5 h-5 text-inherit" />,
  Library: <TableCellsIcon className="w-5 h-5 text-inherit" />,
  Blogs: <BookOpenIcon className="w-5 h-5 text-inherit" />,
  Mentors: <UsersIcon className="w-5 h-5 text-inherit" />,
  "Courses Mentor": <UsersIcon className="w-5 h-5 text-inherit" />,
  Courses: <BookOpenIcon className="w-5 h-5 text-inherit" />,
  "Add Poster": <BookOpenIcon className="w-5 h-5 text-inherit" />,
  "Add Blog Category": <BookOpenIcon className="w-5 h-5 text-inherit" />,
  "Add Asset Category": <UsersIcon className="w-5 h-5 text-inherit" />,
  "Add Courses Category": <UsersIcon className="w-5 h-5 text-inherit" />,
  SignIn: <UserCircleIcon className="w-5 h-5 text-inherit" />,
  SignUp: <UserPlusIcon className="w-5 h-5 text-inherit" />,
  SignOut: <UserCircleIcon className="w-5 h-5 text-inherit" />,
};

const isLoggedIn = !!localStorage.getItem("adminToken");

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        name: "Dashboard",
        path: "/home",
        element: <Home />,
        icon: iconMapping["Dashboard"],
      },
      {
        name: "Admins",
        path: "/admins",
        element: <Admins />,
        icon: iconMapping["Admins"],
      },
      {
        name: "Users",
        path: "/users",
        element: <Users />,
        icon: iconMapping["Users"],
      },
      {
        name: "Library",
        path: "/library",
        element: <Library />,
        icon: iconMapping["Library"],
      },
      {
        name: "Blogs",
        path: "/blogs",
        element: <Blogs />,
        icon: iconMapping["Blogs"],
      },
      {
        name: "Mentors",
        path: "/mentors",
        element: <Mentors />,
        icon: iconMapping["Mentors"],
      },
      {
        name: "Courses Mentor",
        path: "/courses-mentor",
        element: <CoursesMentor />,
        icon: iconMapping["Courses Mentor"],
      },
      {
        name: "Courses",
        path: "/courses",
        element: <Courses />,
        icon: iconMapping["Courses"],
      },
      {
        name: "Add Poster",
        path: "/add-poster",
        element: <AddPoster />,
        icon: iconMapping["Add Poster"],
      },
      {
        name: "Add Blog Category",
        path: "/add-blog-category",
        element: <AddBlogCategory />,
        icon: iconMapping["Add Blog Category"],
      },
      {
        name: "Add Asset Category",
        path: "/add-asset-category",
        element: <AddAssetCategory />,
        icon: iconMapping["Add Asset Category"],
      },
      {
        name: "Add Courses Category",
        path: "/add-courses-category",
        element: <AddCoursesCategory />,
        icon: iconMapping["Add Courses Category"],
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        path: isLoggedIn ? "/sign-out" : "/sign-in",
        element: isLoggedIn ? <SignOut /> : <SignIn />,
        icon: iconMapping[isLoggedIn ? "SignOut" : "SignIn"],
      },
      {
        path: "/sign-up",
        element: <SignUp />,
        icon: iconMapping["SignUp"],
      },
    ],
  },
];

export default routes;
