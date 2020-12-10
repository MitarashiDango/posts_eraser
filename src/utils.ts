import { AxiosResponse } from "axios";
import { Logger } from "./logger";
import { MastodonRequestor } from "./requestors/mastodon";

export const sleep = async (time: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), time));

export const log = (text: string) => {
  console.log(text);
  Logger.info(text);
};

export const isRateLimitExceeded = (res: AxiosResponse) => res.status === 429;

export const getRequestorByName = (name: string) => {
  if (name === "mastodon") {
    return new MastodonRequestor();
  }

  throw new Error(`Requestor "${name}" is undefined.`);
};
