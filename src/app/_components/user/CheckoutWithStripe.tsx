"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export function CheckoutWithStripe() {
  const { mutateAsync: createCheckoutUrl, isPending } =
    api.subscription.createCheckoutUrl.useMutation();
  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const url = await createCheckoutUrl();
    redirect(url);
  };
  return (
    <Button onClick={onClick} disabled={isPending}>
      Upgrade Now
      {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}
