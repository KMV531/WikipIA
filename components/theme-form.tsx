"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useStore } from "@/Context/useStore";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export function ThemeForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const setTheme = useStore((state) => state.setTheme);

  const validateTheme = (theme: string) => {
    const regex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

    const trimmedTheme = theme.trim();

    if (trimmedTheme === "") {
      return "Le thème ne peut pas être vide.";
    }
    if (trimmedTheme.length < 3) {
      return "Le thème doit contenir au moins 3 caractères.";
    }
    if (!regex.test(trimmedTheme)) {
      return "Le thème ne doit contenir que des lettres (pas de chiffres ou symboles spéciaux).";
    }

    if (/^\d+$/.test(trimmedTheme)) {
      return "Le thème ne peut pas être composé uniquement de chiffres.";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const themeValue = formData.get("theme") as string;

    const errorMessage = validateTheme(themeValue);

    if (errorMessage) {
      toast.error(errorMessage, {
        description: "Oups !",
        style: { backgroundColor: "red", color: "#fff" },
      });
      return;
    }

    setTheme(themeValue.trim());

    toast.success("C'est parti !", {
      description: `Préparation des questions sur : ${themeValue}`,
      style: { backgroundColor: "green", color: "#fff" },
    });

    router.push("/questions");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-48 items-center justify-center rounded-md">
                <Image
                  src={"/Logos-wikipia.png"}
                  alt="WikiIA Logo"
                  width={500}
                  height={500}
                  priority
                />
              </div>
            </Link>
            <h1 className="text-xl font-bold">Choisis un thème</h1>
          </div>

          <Field>
            <FieldLabel htmlFor="theme">
              Quel thème veux-tu explorer ?
            </FieldLabel>
            <Input
              id="theme"
              name="theme"
              type="text"
              placeholder="Ex: Les dinosaures, l'espace..."
              autoComplete="off"
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full cursor-pointer">
              Continuer
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldSeparator />
      <FieldDescription className="px-6 text-center text-xs">
        Le thème détermine les pièges que l&apos;IA va te tendre.
      </FieldDescription>
    </div>
  );
}
