// ========================================
// تایپ‌های مشترک چت کاربران (v1.0.3.0 — گام ۴ و ۵)
// کلاینت (هوک/کامپوننت) و سرور (API) هر دو از این تایپ‌ها استفاده می‌کنند
// ========================================

/** واکنش کاربر جاری به پیام: 1 = لایک 👍 | -1 = دیسلایک 👎 | 0 = بدون واکنش */
export type ChatReactionType = 1 | -1 | 0;

/** نمایش یک پاسخ (تورفته زیر باکس پیام ریشه) */
export type ChatReplyView = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  authorName: string;
  likes: number;
  dislikes: number;
  myReaction: ChatReactionType;
};

/** نمایش یک پیام ریشه (باکس) + پاسخ‌های آن */
export type ChatMessageView = ChatReplyView & {
  replies: ChatReplyView[];
};

/** پاسخ GET /api/chat?page=N */
export type ChatListResult = {
  messages: ChatMessageView[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** پاسخ POST /api/chat/[messageId]/reaction */
export type ChatReactionResult = {
  likes: number;
  dislikes: number;
  myReaction: ChatReactionType;
};

/** سقف طول پیام — سرور و فرم ارسال هر دو رعایت می‌کنند */
export const CHAT_MAX_CONTENT = 500;
