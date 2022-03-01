import React from "react";

import { GITHUB_REPOSITORY_LINK } from "../shared/constants";

export const HelpPanel = () => {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="prose relative grid gap-6 bg-white p-6">
        <div className="text-lg font-medium">Information</div>
        <div className="space-y-2">
          <div className="text-base text-indigo-600">How does it work?</div>
          <div>
            When you navigate to a web page, CrowdWise pulls relevant
            discussions about this web page from Hacker News and Reddit. You can
            click on these discussions and it will open in a new tab, where you
            can find counter-opinions and different perspectives.
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-base text-indigo-600">
            Open source and extensible
          </div>
          <div>
            To submit bugs or contribute to CrowdWise, visit our{" "}
            <a
              className="text-indigo-600 hover:underline"
              href={GITHUB_REPOSITORY_LINK}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub repository
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};
