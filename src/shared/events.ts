import { log } from "../utils/log";
import { EVENTS_HOST, KEY_INCOGNITO_MODE } from "./constants";
import { useSettingsStore } from "./settings";

export enum EventType {
  CLICK_SIDEBAR_FORUM_RESULT_TITLE = "click_sidebar_forum_result_title",
  CLICK_SIDEBAR_FORUM_RESULT_SUB_SOURCE = "click_sidebar_forum_result_sub_source",
  CLICK_SIDEBAR_FORUM_RESULT_AUTHOR = "click_sidebar_forum_result_author",
  CLICK_SIDEBAR_SEARCH_ON_GOOGLE = "click_sidebar_search_on_google",
  CLICK_SIDEBAR_RESULT_FEED_SETTING_ICON = "click_sidebar_result_feed_setting_icon",
  CLICK_SIDEBAR_SETTING_ICON = "click_sidebar_setting_icon",
  CLICK_SIDEBAR_HELP_ICON = "click_sidebar_help_icon",
  CLICK_SIDEBAR_SLACK_ICON = "click_sidebar_slack_icon",
  CHANGE_SETTING = "change_setting",
  LOAD_SIDEBAR = "load_sidebar",
  CLICK_OPEN_SIDEBAR = "click_open_sidebar",
  CLICK_CLOSE_SIDEBAR = "click_close_sidebar",
}

export const sendEventsToServer = async (payload: Map<string, any>) => {
  const headers = {
    "Content-Type": "application/json",
  };
  const response = await fetch(EVENTS_HOST, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    log.error(`Failed to send event: ${response}`);
  }
};

export const sendEventsToServerViaWorker = (
  payload: any,
  isIncognitoMode: boolean
) => {
  if (!isIncognitoMode) {
    chrome.runtime.sendMessage({ eventPayload: payload });
  }
};
