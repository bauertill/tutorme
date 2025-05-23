import { Latex } from "@/app/_components/richtext/Latex";
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
        <Latex>{message.content}</Latex>
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="whitespace-pre-wrap">
      <Latex>{message.content}</Latex>
    </div>
  );
}
