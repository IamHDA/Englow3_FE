import type { FriendsTranslations } from "./friends";

// English, apart from the Vietnamese: it is loaded only for a reader who
// chose English (see LanguageContext), not with every page.
export const friendsEn: FriendsTranslations = {
  pageTitle: "Friends",
  sections: {
    friends: "Friends",
    requests: "Requests received",
    sent: "Requests sent",
    blocked: "Blocked",
  },
  navLabel: "Friends sections",
  actions: {
    add: "Add friend",
    cancel: "Cancel request",
    accept: "Accept",
    decline: "Decline",
    friends: "Friends",
    unfriend: "Unfriend",
    block: "Block",
    unblock: "Unblock",
    editProfile: "Edit profile",
    friendsPage: "Friends",
    moreFor: "More options for {name}",
    friendMenuFor: "Friends with {name}",
  },
  success: {
    send: "Friend request sent.",
    accept: "You are now friends.",
    decline: "Request declined.",
    cancel: "Request cancelled.",
    unfriend: "Friend removed.",
    block: "Blocked.",
    unblock: "Unblocked.",
    nowFriends: "You are now friends.",
  },
  actionErrorTitle: "That did not work",
  confirm: {
    unfriend: {
      title: "Unfriend {name}?",
      body: "You will no longer be friends. You can send a new request at any time.",
      confirmLabel: "Unfriend",
      cancelLabel: "Keep friend",
    },
    block: {
      title: "Block {name}?",
      body: "Neither of you will see the other's profile or be able to send the other a request. If you are friends, or a request is waiting, it is removed. You can unblock at any time.",
      confirmLabel: "Block",
      cancelLabel: "Do not block",
    },
  },
  backendErrors: {
    FRIEND_REQUEST_NOT_ALLOWED: "A request cannot be sent to this person.",
    ALREADY_FRIENDS: "You are already friends.",
    SEARCH_TERM_TOO_SHORT: "Type at least {min} characters.",
    FRIENDSHIP_LEARNERS_ONLY: "Friends are for learners.",
    FRIENDSHIP_NOT_FOUND: "You are no longer friends.",
    FRIENDSHIP_NOT_ACCEPTED: "You are not friends yet.",
    FRIEND_REQUEST_NOT_FOUND: "This request no longer exists.",
    FRIEND_REQUEST_NOT_PENDING: "This request has already been answered.",
    FRIEND_REQUEST_NOT_ADDRESSEE:
      "Only the person who was asked can accept a request.",
    FRIENDSHIP_SELF: "You cannot befriend yourself.",
    BLOCK_SELF: "You cannot block yourself.",
    LEARNER_NOT_FOUND: "This learner could not be found.",
  },
  genericError: "Something went wrong. Please try again.",
  list: {
    loadErrorTitle: "Could not load the list",
    loadErrorDescription:
      "The server did not answer. Try again in a few minutes.",
    retry: "Try again",
    friendsEmptyTitle: "You have no friends yet",
    friendsEmptyDescription: "Search for someone by name to send a request.",
    friendsEmptyAction: "Find friends",
    countOne: "{count} person",
    countOther: "{count} people",
    incomingEmptyTitle: "No requests",
    incomingEmptyDescription: "Friend requests you receive will show up here.",
    outgoingEmptyTitle: "You have not sent any requests",
    outgoingEmptyDescription:
      "Requests you have sent and that are waiting for an answer will show up here.",
    blockedEmptyTitle: "You have not blocked anyone",
    blockedEmptyDescription:
      "People you block show up here so you can unblock them.",
    friendsSince: "Friends since",
    requestReceived: "Request received on",
    requestSent: "You sent it on",
    blockedSince: "Blocked since",
  },
  search: {
    title: "Find learners",
    label: "Search learners by name",
    placeholder: "Search learners by name…",
    clear: "Clear search",
    tooShort: "Type at least {min} characters.",
    promptTitle: "Find learners by name",
    promptDescription:
      "Type a learner's display name to send a friend request.",
    resultsOne: "{count} result for “{term}”",
    resultsOther: "{count} results for “{term}”",
    emptyTitle: "No learners match",
    emptyDescription: "Search by display name, or try a shorter term.",
    loadErrorTitle: "Could not search",
  },
  learnersOnly: {
    title: "Friends are for learners",
    description:
      "Administration accounts do not send or receive friend requests. Your profile page is still visible to everyone.",
    action: "Back to administration",
  },
  wall: {
    backLabel: "Back to home",
    fallbackName: "this person",
    thing: "user",
    notFoundDescription:
      "This user does not exist, or the link is wrong. Try finding them by name.",
    unavailableTitle: "This page is not available",
    unavailableDescription: "You cannot view this page right now.",
    staffBadge: "Staff",
    joined: "Joined",
    friendCountOne: "{count} friend",
    friendCountOther: "{count} friends",
    profileErrorTitle: "Could not load the profile",
    profileErrorDescription:
      "The server did not answer. Try again in a few minutes.",
    retry: "Try again",
  },
  requestBadge: {
    labelOne: "{count} friend request waiting",
    labelOther: "{count} friend requests waiting",
  },
};
