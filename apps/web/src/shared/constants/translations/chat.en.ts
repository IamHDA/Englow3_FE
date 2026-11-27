import type { ChatTranslations } from "./chat";

// English, apart from the Vietnamese: it is loaded only for a reader who
// chose English (see LanguageContext), not with every page.
export const chatEn: ChatTranslations = {
  indicator: {
    label: "Messages",
    unreadOne: "Messages, {count} unread conversation",
    unreadOther: "Messages, {count} unread conversations",
  },
  list: {
    heading: "Messages",
    loadErrorTitle: "Could not load the list",
    loadErrorDescription:
      "The server did not answer. Try again in a few minutes.",
    retry: "Try again",
    emptyTitle: "No conversations yet",
    emptyDescription:
      "Message a friend from their profile page. The conversation will show up here.",
    emptyAction: "See friends",
    deletedUser: "Deleted user",
    youPrefix: "You: ",
    imagePreview: "Photo",
    recalledPreview: "Message recalled",
    unreadOne: "{count} unread message",
    unreadOther: "{count} unread messages",
  },
  pane: {
    backToList: "Back to messages",
    viewProfile: "View {name}'s profile",
    placeholderTitle: "Pick a conversation",
    placeholderDescription:
      "Choose a friend from the list to read and send messages.",
    thing: "conversation",
    notFoundDescription:
      "This conversation does not exist, or it is not yours.",
    notFoundBack: "Back to messages",
    emptyTitle: "Say hello",
    emptyDescription: "No messages yet. Send the first one to {name}.",
    loadingOlder: "Loading older messages…",
    typing: "{name} is typing…",
    seen: "Seen",
    today: "Today",
    yesterday: "Yesterday",
    messagesLabel: "Messages with {name}",
  },
  message: {
    recalled: "Message recalled",
    sending: "Sending…",
    failed: "Not sent",
    retry: "Send again",
    dismiss: "Remove",
    options: "Message options",
    recall: "Recall",
    recallTitle: "Recall this message?",
    recallBody:
      "The message disappears for both of you and cannot be restored.",
    recallConfirm: "Recall",
    recallCancel: "Keep it",
    imageAlt: "Image in the message",
    openImage: "Open the image in a new tab",
    recallFailedTitle: "Could not recall",
  },
  composer: {
    label: "Message",
    placeholder: "Type a message…",
    send: "Send",
    attach: "Attach an image",
    removeImage: "Remove the image",
    imagePreviewAlt: "Image about to be sent",
    hint: "Enter to send · Shift+Enter for a new line",
    tooLong: "A message can be at most {max} characters.",
    imageType: "Only JPEG, PNG or WebP images can be sent.",
    imageSize: "An image can be at most {max} MB.",
    imageEmpty: "This image file is empty.",
    lockedNotFriends:
      "You are no longer friends, so you cannot send messages. Earlier messages stay readable.",
    lockedPartnerGone:
      "This person deleted their account, so you cannot send messages. Earlier messages stay readable.",
  },
  connection: {
    reconnecting: "Reconnecting… You can still send messages.",
    failed:
      "New messages will not appear by themselves. Reload the page to reconnect.",
    failedTooManyConnections:
      "Messages are open in too many tabs or devices. Close some, then reload to use them here.",
    reload: "Reload",
  },
  learnersOnly: {
    title: "Messages are for learners",
    description:
      "Administration accounts do not send or receive messages. Staff never read learners' private messages.",
    action: "Back to administration",
  },
  openChat: {
    button: "Message",
    buttonFor: "Message {name}",
    errorTitle: "Could not open the conversation",
  },
  backendErrors: {
    CHAT_NOT_FRIENDS: "You are no longer friends.",
    CHAT_PARTNER_GONE: "This person deleted their account.",
    CHAT_CONVERSATION_NOT_FOUND: "This conversation could not be found.",
    CHAT_MESSAGE_ALREADY_RECALLED: "This message was already recalled.",
    CHAT_MESSAGE_NOT_FOUND: "This message could not be found.",
    CHAT_MESSAGE_NOT_SENDER: "Only the sender can recall a message.",
    CHAT_MESSAGE_EMPTY: "A message needs text or an image.",
    CHAT_MESSAGE_TOO_LONG: "The message is too long.",
    CHAT_IMAGE_NOT_UPLOADED:
      "The image has not finished uploading. Send it again.",
    CHAT_IMAGE_UPLOAD_NOT_FOUND: "The image expired. Choose it again.",
    CHAT_IMAGE_TYPE_NOT_ALLOWED: "Only JPEG, PNG or WebP images can be sent.",
    CHAT_IMAGE_TOO_LARGE: "The image is too large.",
    CHAT_CLIENT_ID_REUSED:
      "This message was already used in another conversation.",
    CHAT_LEARNERS_ONLY: "Messages are for learners.",
    CHAT_SELF: "You cannot message yourself.",
    CHAT_HISTORY_CURSOR_CONFLICT: "Could not load messages. Try again.",
    CHAT_READ_SEQ_INVALID: "Could not mark the conversation as read.",
    RATE_LIMITED: "You are doing that too fast. Try again in a few minutes.",
  },
  genericError: "Something went wrong. Please try again.",
};
