import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { DE, US } from "country-flag-icons/react/3x2";

const LANGUAGES = {
  en: {
    Flag: US,
    name: "English",
  },
  de: {
    Flag: DE,
    name: "German",
  },
};

export function LanguageSelector() {
  const { userLanguage, setUserLanguage } = useStore();
  return (
    <div className="flex items-center gap-2">
      {Object.entries(LANGUAGES).map(([language, { Flag }]) => (
        <button
          key={language}
          onClick={(e) => {
            e.preventDefault();
            setUserLanguage(language);
          }}
          className={cn(
            "rounded-[4px] border border-transparent p-0.5 hover:border-muted",
            userLanguage === language &&
              "border border-muted-foreground hover:border-muted-foreground",
          )}
        >
          <Flag className="w-8" />
        </button>
      ))}
    </div>
  );
}
