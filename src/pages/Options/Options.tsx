import React from "react";
import { SettingsPanel } from "../../containers/SettingsPanel";

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  return (
    <div className="mx-auto w-64 pt-16">
      <SettingsPanel />
    </div>
  );
};

export default Options;
