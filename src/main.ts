import { AxiosResponse } from "axios";
import { DOMAIN, SLEEP_TIME } from "./config";
import { Account, Post, Requestor } from "./interfaces";
import { MastodonRequestor } from "./requestors/mastodon";
import { isRateLimitExceeded, log, sleep } from "./utils";

const mainProc = async (
  account: Account,
  requestor: Requestor<Account, Post>
) => {
  while (true) {
    log(`Fetch posts`);
    let posts = await requestor.fetchPostsByAccountId(account.id);
    if (posts.length === 0) {
      break;
    }

    while (posts.length > 0) {
      const post = posts.shift();
      if (!post) {
        continue;
      }

      log(`Post ID: ${post.id}`);
      log(`URI: ${post.uri}`);
      log(`Created at: ${post.created_at}`);
      log(`Visibility: ${post.visibility}`);

      if (post.reblog) {
        // ブースト解除
        log(`Text: ${post.reblog.content}`);
        log(`Unreblog`);
        await requestor.doUnreblogByPostId(post.reblog.id);
      } else {
        // 投稿の削除
        log(`Text: ${post.content}`);
        log(`Delete post`);
        await requestor.deletePostByPostId(post.id);
      }

      await sleep(SLEEP_TIME);
    }
  }
};

const main = async () => {
  const requestor = new MastodonRequestor();

  log(`DOMAIN: ${DOMAIN}`);
  log(`INTERVAL: ${SLEEP_TIME}`);

  // 投稿削除対象アカウントの取得
  const account = await requestor.fetchAuthenticateAccount();
  while (true) {
    try {
      await mainProc(account, requestor);
      return;
    } catch (e: any) {
      if (e.response && typeof e.response.status !== "undefined") {
        if (isRateLimitExceeded(e.response)) {
          // API呼出回数上限に到達した場合は、制限がリセットされるまで待つ
          const res = e.response as AxiosResponse;
          const now = new Date();
          const reset = new Date(res.headers["x-ratelimit-reset"]);
          const delay = reset.getTime() - now.getTime();
          const remaining = res.headers["x-ratelimit-remaining"];
          const limit = res.headers["x-ratelimit-limit"];

          log(`API呼出回数上限に到達 (${remaining} / ${limit})`);
          log(`処理再開予定日時: ${reset}`);

          await sleep(delay + 1000);
          continue;
        } else if (
          e.response.status === 502 ||
          e.response.status === 503 ||
          e.response.status === 504
        ) {
          // とりあえず待ってから再試行する
          const now = new Date();
          const reset = new Date();
          reset.setMinutes(reset.getMinutes() + 1);
          const delay = reset.getTime() - now.getTime();

          log(`エラー応答(${e.response.status})`);
          log(`処理再開予定日時: ${reset}`);

          await sleep(delay + 1000);
          continue;
        } else if (e.response.status === 404 || e.response.status === 410) {
          log("削除完了");
          return;
        }
      }

      log("回復不能なエラーが発生");
      if (e.response) {
        console.error(e);
        throw new Error(
          `status: ${e.response.status}; reason: ${e.response.statusText}`
        );
      }

      throw e;
    }
  }
};

try {
  main();
} catch (e: any) {
  log(e);
}
