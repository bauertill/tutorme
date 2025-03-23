import { type Message } from "@/core/help/types";
import { Fragment } from "react";

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((message) => (
        <Fragment key={message.id}>
          {message.role === "user" ? (
            <UserMessage message={message} />
          ) : (
            <AssistantMessage message={message} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[calc(100%-2rem)] rounded-md bg-muted p-2">
        {message.content}
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  return <div className="whitespace-pre-wrap">{message.content}</div>;
}
