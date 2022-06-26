import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React, { useEffect, useState } from "react";

import {
  BLACKLIST_STORAGE_KEY,
  StorageBlacklist,
  StorageSubdomainMap,
  useBlacklistSettingsStore,
} from "../providers/blacklist";
import { log } from "../utils/log";
import BlacklistUrl from "./BlacklistUrl";

interface Props {
  fontSizes: any;
}

const BlacklistContainer = ({ fontSizes }: Props) => {
  const [
    blacklistSettings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useBlacklistSettingsStore();

  const hostnames = blacklistSettings.hostnames;
  const fullUrls = blacklistSettings.fullUrls;
  const subdomains = blacklistSettings.subdomains;

  const setBlacklist = (
    newhostnames: string[],
    newFullUrls: string[],
    newSubdomains: string[]
  ) => {
    // const updateSubs = subdomainsAsListToMap(newSubdomains ?? subdomains);
    log.debug("new subdomains");
    log.debug(newSubdomains);
    const newBlacklist: StorageBlacklist = {
      hostnames: newhostnames ?? hostnames,
      fullUrls: newFullUrls ?? fullUrls,
      subdomains: newSubdomains,
    };
    log.debug("New blacklist - setting value:");
    log.debug(newBlacklist);
    setValueAll(newBlacklist);
  };

  const onHostnameDelete = (pos: number) => {
    log.debug(`Deleting hostname pos: ${pos}`);
    const newHostnames = hostnames.filter((_: any, idx: number) => idx !== pos);
    setBlacklist(newHostnames, fullUrls, subdomains);
  };

  const onFullUrlDelete = (pos: number) => {
    log.debug(`Deleting full URL pos: ${pos}`);
    const newUrls = fullUrls.filter((_: any, idx: number) => idx !== pos);
    setBlacklist(hostnames, newUrls, subdomains);
  };

  const onSubdomainDelete = (pos: number) => {
    log.debug(`Deleting subdomain pos: ${pos}`);
    const newSubdomains = subdomains.filter(
      (_: any, idx: number) => idx !== pos
    );
    log.debug(`Setting blacklist to new subdomains: [${newSubdomains}]`);
    setBlacklist(hostnames, fullUrls, newSubdomains);
  };

  if (!fontSizes || isLoadingStore) return null;

  return (
    <>
      <div className="pt-5 text-base font-medium">URL Blacklist </div>
      <div className="flex text-base flex-row flex-wrap space-x-3 font-">
        Blocked Sites
      </div>
      {hostnames.map((url: string, idx: number) => (
        <BlacklistUrl
          key={idx}
          url={url}
          position={idx}
          onDelete={onHostnameDelete}
        />
      ))}
      <div className="flex text-base flex-row flex-wrap space-x-3">
        Blocked URLs
      </div>
      {fullUrls.map((url: string, idx: number) => (
        <BlacklistUrl
          key={idx}
          url={url}
          position={idx}
          onDelete={onFullUrlDelete}
        />
      ))}

      <div className="flex text-base flex-row flex-wrap space-x-3">
        Blocked Domains
      </div>
      {subdomains.map((url: string, idx: number) => (
        <BlacklistUrl
          url={"*." + url}
          key={idx}
          position={idx}
          onDelete={onSubdomainDelete}
        />
      ))}
    </>
  );
};

export default BlacklistContainer;
