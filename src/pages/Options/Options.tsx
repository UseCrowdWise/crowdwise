import React from 'react';
import './Options.css';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  return <div className="OptionsContainer">
    <h1>{title} Page</h1>
    <h6 className="text-red-500">The color of this paragraph is defined using Tailwind.</h6>
  </div>;
};

export default Options;
