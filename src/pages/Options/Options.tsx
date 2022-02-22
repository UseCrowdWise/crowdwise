import React from "react";
import { SettingsPanel } from "../../containers/SettingsPanel";

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  return (
    <div className="w-64 pt-16 mx-auto">
      <SettingsPanel />
    </div>
  );
};

export default Options;
