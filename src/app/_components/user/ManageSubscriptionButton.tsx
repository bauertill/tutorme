"use client";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function ManageSubscriptionButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { data: subscription } = api.subscription.getSubscription.useQuery(
    !session?.user ? skipToken : undefined,
  );
  const { mutateAsync: createPortalUrl } =
    api.subscription.createPortalUrl.useMutation();
  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const url = await createPortalUrl();
    redirect(url);
  };

  if (!subscription) {
    return null;
  }

  return (
    <Button onClick={onClick} variant="outline" className="w-full">
      {children ?? <Trans i18nKey="manage_subscription" />}
    </Button>
  );
}
