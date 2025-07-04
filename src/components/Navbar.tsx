import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getSession, signOut } from "next-auth/react";

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void | Promise<void>;
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        setIsSignedIn(!!session?.user);
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      setIsSignedIn(false);
      router.push("/auth/signin");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Discover" },
    { href: "/group/create", label: "Create Group" },
    { href: "/groups", label: "Groups" },
    { href: "/learn", label: "Learn" },
  ];

  const authLinks: NavLink[] = isSignedIn
    ? [{ href: "#", label: "Sign Out", onClick: handleSignOut }]
    : [
        { href: "/auth/signin", label: "Sign In" },
        { href: "/auth/register", label: "Register" },
      ];

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold">
              StudyBuddy
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === link.href
                    ? "bg-teal-600 text-white"
                    : "hover:bg-gray-800 hover:text-teal-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={link.onClick ? () => link.onClick!() : undefined}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === link.href
                    ? "bg-teal-600 text-white"
                    : "hover:bg-gray-800 hover:text-teal-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  router.pathname === link.href
                    ? "bg-teal-600 text-white"
                    : "hover:bg-gray-800 hover:text-teal-500"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.onClick) {
                    link.onClick();
                  }
                  setIsOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  router.pathname === link.href
                    ? "bg-teal-600 text-white"
                    : "hover:bg-gray-800 hover:text-teal-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
