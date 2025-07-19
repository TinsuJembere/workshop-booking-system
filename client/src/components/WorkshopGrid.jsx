import React from "react";
import WorkshopCard from "./WorkshopCard";

const WorkshopGrid = ({ workshops }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {workshops.map((workshop) => (
        <WorkshopCard key={workshop.id} workshop={workshop} />
      ))}
    </div>
  );
};

export default WorkshopGrid; 