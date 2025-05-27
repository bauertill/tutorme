"use client";
import { Latex } from "@/app/_components/richtext/Latex";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Message } from "@/core/help/types";
import { ThumbsDown } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

export default function MessageList({
  messages,
  onThumbsDown,
}: {
  messages: Message[];
  onThumbsDown: (messageId: string) => void;
}) {
  return (
    <div className="flex select-text flex-col gap-2 [-webkit-user-select:text]">
      {messages.map((message, idx, { length }) => (
        <Fragment key={message.id}>
          {message.role === "user" ? (
            <UserMessage message={message} />
          ) : (
            <AssistantMessage
              message={message}
              showThumbs={idx === length - 1}
              onThumbsDown={onThumbsDown}
            />
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

function AssistantMessage({
  message,
  showThumbs,
  onThumbsDown,
}: {
  message: Message;
  showThumbs: boolean;
  onThumbsDown: (messageId: string) => void;
}) {
  const { t } = useTranslation();
  const handleThumbsDown = () => {
    onThumbsDown(message.id);
  };

  return (
    <div className="whitespace-pre-wrap">
      <Latex>{message.content}</Latex>
      {showThumbs && (
        <TooltipProvider delayDuration={0}>
          <div className="flex gap-1 pt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleThumbsDown}
                  className="group rounded p-1 transition-colors hover:bg-muted"
                  aria-label="Thumbs down"
                >
                  <ThumbsDown className="h-3 w-3 text-muted-foreground group-hover:text-red-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t("badResponseButton")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
