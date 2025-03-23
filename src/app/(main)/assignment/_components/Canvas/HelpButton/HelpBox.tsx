import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function HelpBox({ onClose }: { onClose?: () => void }) {
  const questions = [
    "How do I add two numbers?",
    "What's a number?",
    "I don't know how to do this problem at all, please send help.",
  ];
  return (
    <Card className="relative w-60 text-sm md:w-72 lg:w-80 xl:w-96">
      <Button
        className="absolute right-2 top-1"
        variant="ghost"
        size="icon"
        onClick={() => onClose?.()}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-4">
        <p>Are you stuck? Ask for help!</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 px-4 pb-4">
        <Input placeholder="Enter question here..." />
        {questions.map((question) => (
          <Button
            key={question}
            variant="outline"
            className="h-auto w-full whitespace-normal font-normal text-muted-foreground"
          >
            {question}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}
