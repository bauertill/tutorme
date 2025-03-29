import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

export default function TextInput({
  disabled,
  onSend,
  isLoading,
}: {
  disabled: boolean;
  isLoading: boolean;
  onSend: (question: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();

  const send = () => {
    onSend(inputValue);
    setInputValue("");
  };

  const onReturn = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (inputValue.trim() && event.key === "Enter") {
      send();
    }
  };

  return (
    <div className="relative flex w-full items-center">
      <Textarea
        placeholder={t("enter_question_here")}
        onKeyDown={onReturn}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={disabled}
        className={cn(
          "h-auto max-h-[100px] min-h-[10px] resize-none overflow-hidden overflow-y-auto pr-8",
          "[scrollbar-color:hsl(var(--muted-foreground))_transparent]",
          "[scrollbar-width:thin]",
        )}
        style={{ height: "auto" }}
        rows={1}
        onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight + 2}px`;
        }}
      />
      {isLoading ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <Button
          variant="default"
          size="icon"
          onClick={() => send()}
          className="absolute right-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
          disabled={disabled || inputValue.trim() === ""}
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
