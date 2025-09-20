import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Scale, Upload, Home, FileSearch } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LegalClear
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/Dashboard">
              <Button
                variant={isActive("/Dashboard") ? "default" : "ghost"}
                className={`flex items-center space-x-2 rounded-full px-6 py-2.5 font-semibold transition-all duration-300 ${
                  isActive("/Dashboard ")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/upload">
              <Button
                variant={isActive("/upload") ? "default" : "ghost"}
                className={`flex items-center space-x-2 rounded-full px-6 py-2.5 font-semibold transition-all duration-300 ${
                  isActive("/upload")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </Button>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <FileSearch className="h-4 w-4 mr-2" />
              Get Help
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
