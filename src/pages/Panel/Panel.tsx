import React from 'react';
import './Panel.css';

const Panel: React.FC = () => {
  return (
    <div className="container">
      <h1>Dev Tools Panel</h1>
      <h6 className="text-red-500">The color of this paragraph is defined using Tailwind.</h6>
    </div>
  );
};

export default Panel;
