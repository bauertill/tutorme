import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  // TODO: allow multiline input
  const [inputValue, setInputValue] = useState("");

  const send = () => {
    onSend(inputValue);
    setInputValue("");
  };

  const onReturn = (event: KeyboardEvent<HTMLInputElement>) => {
    if (inputValue.trim() && event.key === "Enter") {
      send();
    }
  };

  return (
    <div className="relative flex w-full items-center">
      <Input
        placeholder="Enter question here..."
        onKeyDown={onReturn}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={disabled}
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
