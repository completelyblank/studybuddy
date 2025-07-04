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
    { href: "/group/create", label: "Create" },
    { href: "/groups", label: "Groups" },
    { href: "/learn", label: "Learn" },
  ];

  const authLinks: NavLink[] = isSignedIn
    ? [{ href: "#", label: "Sign Out", onClick: handleSignOut }]
    : [
        { href: "/auth/signin", label: "Sign In" },
        { href: "/auth/register", label: "Register" },
      ];

  if (loading) return null; // avoid session flash

  return (
    <nav className="bg-black/70 backdrop-blur-md border-b border-teal-500/30 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo + Title */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl shadow-md" />
              <span className="text-2xl font-bold tracking-wide text-teal-300 hover:text-white transition-all">
                StudyBuddy
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  router.pathname === link.href
                    ? "bg-teal-600 text-white"
                    : "text-teal-300 hover:bg-teal-700/20 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-teal-400 hover:text-white hover:bg-gray-800 transition duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-teal-300 hover:text-white hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle menu"
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
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-4 space-y-1 bg-black/90 border-t border-teal-500/20">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                router.pathname === link.href
                  ? "bg-teal-600 text-white"
                  : "text-teal-300 hover:bg-teal-700/20 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {authLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick();
                }
                setIsOpen(false);
              }}
              className="block px-3 py-2 rounded-md text-base font-medium text-teal-400 hover:text-white hover:bg-gray-800 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
