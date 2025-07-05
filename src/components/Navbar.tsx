import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { Button, Badge } from "./ui";
import axios from "axios";

interface NavLink {
  href: string;
  label: string;
  icon?: string;
  onClick?: () => void | Promise<void>;
}

interface UserData {
  avatar?: string;
  name?: string;
  email?: string;
}

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notifications count
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [loadingUserData, setLoadingUserData] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user data including avatar
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      
      setLoadingUserData(true);
      try {
        const response = await axios.get('/api/users/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/auth/signin");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/discover", label: "Discover", icon: "🔍" },
    { href: "/groups", label: "Groups", icon: "👥" },
    { href: "/learn", label: "Learn", icon: "📚" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  // Get the best available avatar URL
  const getAvatarUrl = () => {
    if (userData.avatar) return userData.avatar;
    if (session?.user?.image) return session.user.image;
    return "/default.jpeg";
  };

  // Get the best available user name
  const getUserName = () => {
    return userData.name || session?.user?.name || "User";
  };

  // Get the best available user email
  const getUserEmail = () => {
    return userData.email || session?.user?.email || "";
  };

  // Click outside handler for profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [router.pathname]);

  if (status === "loading") {
    return (
      <nav className="bg-black/70 backdrop-blur-md border-b border-teal-500/30 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl shadow-md" />
              <span className="text-2xl font-bold tracking-wide text-teal-300">StudyBuddy</span>
            </div>
            <div className="animate-pulse bg-gray-600 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-black/70 backdrop-blur-md border-b border-teal-500/30 shadow-lg z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo + Title */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-10 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200" 
              />
              <span className="text-2xl font-bold tracking-wide text-teal-300 group-hover:text-white transition-all duration-200">
                StudyBuddy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(link.href)
                    ? "bg-teal-600 text-white shadow-lg"
                    : "text-teal-300 hover:bg-teal-700/20 hover:text-white hover:scale-105"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                onClick={() => setNotifications(0)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 01-6 6h12a6 6 0 01-6-6V9.75a6 6 0 00-6-6z" />
                </svg>
                {notifications > 0 && (
                  <Badge 
                    variant="danger" 
                    size="sm" 
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Profile */}
            {session ? (
              <div className="relative" ref={profileMenuRef}>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2"
                >
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-teal-400"
                    onError={(e) => {
                      e.currentTarget.src = "/default.jpeg";
                    }}
                  />
                  <span className="text-sm font-medium text-teal-300 hidden lg:block">
                    {getUserName()}
                  </span>
                  <svg className="h-4 w-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-teal-500/30 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-teal-500/20">
                        <p className="text-sm font-medium text-white">{getUserName()}</p>
                        <p className="text-xs text-gray-400">{getUserEmail()}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-teal-300 hover:bg-teal-700/20 hover:text-white transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-teal-300 hover:bg-teal-700/20 hover:text-white transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        👤 Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowProfileMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-teal-500/20">
          <div className="px-4 py-4 space-y-2">
            {/* User Info */}
            {session && (
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg mb-4">
                <img
                  src={getAvatarUrl()}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-teal-400"
                  onError={(e) => {
                    e.currentTarget.src = "/default.jpeg";
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{getUserName()}</p>
                  <p className="text-xs text-gray-400">{getUserEmail()}</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-teal-600 text-white"
                    : "text-teal-300 hover:bg-teal-700/20 hover:text-white"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Notifications */}
            <div className="flex items-center justify-between px-4 py-3 text-teal-300 hover:bg-teal-700/20 hover:text-white rounded-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 01-6 6h12a6 6 0 01-6-6V9.75a6 6 0 00-6-6z" />
                </svg>
                <span>Notifications</span>
              </div>
              {notifications > 0 && (
                <Badge variant="danger" size="sm">
                  {notifications}
                </Badge>
              )}
            </div>

            {/* Auth Links */}
            {!session ? (
              <div className="pt-4 border-t border-teal-500/20 space-y-2">
                <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-teal-500/20">
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
