export interface Account {
  id: string;
}

export interface Post {
  id: string;
  reblog?: Post | null;
  content: string;
}

export interface Requestor<AT, PT> {
  fetchAuthenticateAccount: () => Promise<AT>;
  fetchPostsByAccountId: (accountId: string) => Promise<PT[]>;
  deletePostByPostId: (postId: string) => Promise<void>;
  doUnreblogByPostId: (postId: string) => Promise<void>;
}
