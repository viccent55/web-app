// 浏览推荐信息
export interface ExploreFeedInfo {
  id: number; // ID
  title: string; // 标题
  isPic: boolean; // 是否图片
  mediaUrl: string; // 媒体地址
  authorName: string; // 作者名称
  authorAvatarUrl: string; // 作者头像
  likeCount: number; // 点赞数
  isLiked: boolean; // 是否点赞
  mode: number; // 模式
  url: string; // URL
  link: string;
}

// 用户信息
export interface UserInfo {
  id: number; // 用户ID
  nickname: string; // 用户名
  avatar: string; // 用户头像
  isFollow: boolean;
}

// 用户详情信息
export interface UserDetailInfo extends UserInfo {
  avatar: string;
  nickname: string;
  email: number;
  slogan: number;
  inviter: number;
  invite_code: string;
  status: boolean;
  last_login: number;
  created_at: string;
  updated_at: string;
  invite_count: number;
  mode: number;
  subscribed: number;
  visitor: string;
}

// 日期信息
export interface DateInfo {
  date: string;
  location: string;
}

// 操作信息
export interface ActionInfo {
  commentCount: number; // 评论数
  like_count: number; // 点赞数
  collect_count?: number; // 收藏数
  isLike?: boolean; // 是否点赞
  isStar?: boolean; // 是否收藏
}

// 媒体信息
export interface MediaInfo {
  videoUrl?: string; // 视频地址
  imageUrl: any[]; // 图片地址
}

// 评论信息
export interface CommentInfo {
  id: string; // ID
  author: UserInfo; // 作者信息
  content: string; // 内容
  date: DateInfo; // 日期信息
  action: ActionInfo; // 操作信息
  replyTo?: string; // 被回复者名称
}

// 文章信息
export interface ArticleInfo extends CommentInfo {
  title: string; // 标题
  mediaInfo: MediaInfo; // 媒体信息
  totalCommentCount: number; // 总评论数
}

// 评论块信息
export interface CommentBlockInfo {
  commentList: CommentInfo[]; // 评论列表
  totalCommentCount: number; // 总评论数
}

// 笔记信息
export interface NoteDetailInfo {
  article: ArticleInfo; // 文章
  commentBlocks: CommentBlockInfo[]; // 评论块列表
}

////////////////////////////////////////////////////////////////////////////////
// 通知信息
////////////////////////////////////////////////////////////////////////////////

// 通知-评论信息
export interface NotificationInfo {
  id: string; // ID
  user: UserInfo; // 评论者信息
  hint: string; // 提示信息
  time: string; // 日期信息
  content?: string; // 评论内容
  extra?: {
    id: string; // 笔记ID
    extraUrl: string; // 跳转链接
    quote?: string; // 引用内容
  };
}

////////////////////////////////////////////////////////////////////////////////
// 会员中心信息
////////////////////////////////////////////////////////////////////////////////

// 我的评论信息
export interface MyCommentInfo {
  id: string; // 评论ID
  content: string; // 评论内容
  noteId: string; // 笔记ID
  noteTitle: string; // 笔记标题
  noteCover: string; // 笔记封面
  createTime: string; // 创建时间
  likeCount: number; // 点赞数
  replyCount: number; // 回复数
}

// 我的收藏信息
export interface MyCollectionInfo {
  id: string; // 收藏ID
  noteId: string; // 笔记ID
  noteTitle: string; // 笔记标题
  noteCover: string; // 笔记封面
  authorName: string; // 作者名称
  authorAvatar: string; // 作者头像
  collectTime: string; // 收藏时间
  likeCount: number; // 点赞数
}

// 我的点赞信息
export interface MyLikeInfo {
  id: string; // 点赞ID
  noteId: string; // 笔记ID
  noteTitle: string; // 笔记标题
  noteCover: string; // 笔记封面
  authorName: string; // 作者名称
  authorAvatar: string; // 作者头像
  likeTime: string; // 点赞时间
}

// 系统消息信息
export interface SystemMessageInfo {
  id: string; // 消息ID
  type: "welcome" | "comment_approved" | "system_notice" | "account_update"; // 消息类型
  title: string; // 消息标题
  content: string; // 消息内容
  createTime: string; // 创建时间
  isRead: boolean; // 是否已读
  icon?: string; // 消息图标
}

// 会员中心数据
export interface MemberCenterInfo {
  userInfo: UserDetailInfo; // 用户信息
  myComments: MyCommentInfo[]; // 我的评论
  myCollections: MyCollectionInfo[]; // 我的收藏
  myLikes: MyLikeInfo[]; // 我的点赞
  systemMessages: SystemMessageInfo[]; // 系统消息
}
