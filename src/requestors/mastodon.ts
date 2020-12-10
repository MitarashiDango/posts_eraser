import { api } from "../api";
import {
  DOMAIN,
  EXCLUDE_REBLOGS,
  EXCLUDE_REPLIES,
  MAX_ID,
  MIN_ID,
} from "../config";
import { Account, Post, Requestor } from "../interfaces";

export class MastodonRequestor implements Requestor<Account, Post> {
  async fetchAuthenticateAccount() {
    const url = `https://${DOMAIN}/api/v1/accounts/verify_credentials`;
    const res = await api().get<Account>(url);
    return res.data;
  }

  async fetchPostsByAccountId(accountId: string) {
    const url = `https://${DOMAIN}/api/v1/accounts/${accountId}/statuses`;
    const params: { [key: string]: any } = {
      exclude_reblogs: EXCLUDE_REBLOGS,
      exclude_replies: EXCLUDE_REPLIES,
    };

    if (MIN_ID !== "") {
      params["min_id"] = MIN_ID;
    }

    if (MAX_ID !== "") {
      params["max_id"] = MAX_ID;
    }

    const res = await api().get<Post[]>(url, { params });
    return res.data;
  }

  async deletePostByPostId(postId: string) {
    const url = `https://${DOMAIN}/api/v1/statuses/${postId}`;
    await api().delete(url);
  }

  async doUnreblogByPostId(postId: string) {
    const url = `https://${DOMAIN}/api/v1/statuses/${postId}/unreblog`;
    await api().post(url);
  }
}
