import React from "react";

const AuthCard = ({ title, description, image, children }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-blue-600 to-indigo-500 p-8 rounded-2xl shadow-lg">
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center mb-6">
        {image && (
          <img
            src={image}
            alt="Auth Illustration"
            className="w-16 h-16 rounded-full object-cover mb-2 border-4 border-blue-200"
          />
        )}
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm text-center">{description}</p>
        {children}
      </div>
      <div className="text-white text-xl font-bold text-center mt-4">
        Speedy, Easy and Faster
      </div>
      <p className="text-blue-100 text-center mt-2 text-sm max-w-xs">
        Discover and book hands-on workshops to learn new skills, connect with experts, and unleash your creativity. Join our community and start your learning journey today!
      </p>
    </div>
  );
};

export default AuthCard; 