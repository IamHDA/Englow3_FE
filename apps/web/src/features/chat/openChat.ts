// What the friends screens import to start a conversation, and nothing else.
//
// "@/features/chat" is the barrel of the chat's own screens - the socket, the
// message list, the image upload. A wall or a friends list that only needs a
// "Message" button must not carry them: imported through the barrel, the chunk
// holding the socket was loaded by /friends and /people/[userId]. This entry
// reaches only the button and the little it needs (the open-chat mutation, a
// route, the error sentences), the way ./header does for the global header.
export { OpenChatButton } from "./components/views/OpenChatButton";
