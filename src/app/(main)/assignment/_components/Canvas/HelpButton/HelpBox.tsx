import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

export default function HelpBox({ onClose }: { onClose?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between gap-2">
          Help
          <Button variant="ghost" size="icon" onClick={() => onClose?.()}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Help</p>
      </CardContent>
    </Card>
  );
}
