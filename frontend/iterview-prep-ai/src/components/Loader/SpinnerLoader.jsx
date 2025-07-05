import React from "react";

const SpinnerLoader = () => {
  return (
    <div role="status">
      <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-white rounded-full animate-spin"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SpinnerLoader;
