import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UploadUserProblems({ onSuccess }: { onSuccess?: () => void }) {
  const handleClick = () => {
    toast.info(
      "Upload functionality is being reimplemented for the new structure. Please use 'Create new assignment' instead.",
    );
    if (onSuccess) onSuccess();
  };

  return (
    <Button onClick={handleClick} variant="outline" className="w-full">
      📤 Upload Problems (Coming Soon)
    </Button>
  );
}
