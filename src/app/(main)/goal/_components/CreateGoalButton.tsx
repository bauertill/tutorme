"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export function CreateGoalButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [goalText, setGoalText] = useState("");

  const utils = api.useUtils();
  const createGoal = api.goal.create.useMutation({
    onSuccess: (data) => {
      void utils.goal.all.invalidate();
      setIsOpen(false);
      router.push(`/goal/${data.id}`);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setGoalText("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>Create Goal</Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Learning Goal</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter your learning goal and we will help you achieve it.
        </DialogDescription>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createGoal.mutate({ name: goalText });
          }}
        >
          <Textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            className="mb-4"
            placeholder="Enter your learning goal..."
            rows={4}
            required
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={createGoal.isPending}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createGoal.isPending}>
              {createGoal.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
