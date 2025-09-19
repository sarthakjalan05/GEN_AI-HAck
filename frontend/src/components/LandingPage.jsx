import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the animation after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background blobs and shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000" />

      <section className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div
          className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Logo and Title */}
          <div className="mb-8">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800 dark:from-blue-400 dark:to-indigo-600 animate-pulse">
              LegalClear
            </h1>
            <p className="mt-4 text-2xl text-gray-700 dark:text-gray-300">
              Your Legal Document Analysis Partner
            </p>
          </div>

          {/* CTA Buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <button className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </Link>
            <Link to="/signup">
              <button className="group relative px-12 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </Link>
          </div>

          <div className="mt-8">
            <Link to="/demo">
              <Button
                variant="link"
                className="text-lg text-gray-600 dark:text-gray-400 hover:underline"
              >
                Explore a Demo <MoveRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/70 dark:bg-gray-800/70 py-20 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Quick Summaries
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant, concise summaries of long legal documents to grasp
                key points quickly.
              </p>
            </motion.div>
            <motion.div
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Q&A Chatbot
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interact with your documents using a natural language chatbot to
                find specific information.
              </p>
            </motion.div>
            <motion.div
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Identify critical clauses, potential risks, and key terms
                automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                95%
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Accuracy in identifying key clauses
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-5xl font-extrabold text-purple-600 dark:text-purple-400">
                70%
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Reduction in document review time
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-5xl font-extrabold text-cyan-600 dark:text-cyan-400">
                24/7
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Access to AI insights
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Ready to Streamline your Legal Workflow?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Get started today and revolutionize the way you handle legal
            documents.
          </p>
          <Link to="/signup">
            <button className="group relative px-12 py-4 bg-gradient-to-r from-green-500 to-lime-500 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
              <span className="relative z-10">Sign Up Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-lime-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;