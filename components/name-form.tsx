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
import Image from "next/image";
import { toast } from "sonner";

export function NameForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const setName = useStore((state) => state.setName);

  const validateName = (name: string) => {
    // Regex : Autorise Lettres (A-Z, a-z), Accents (À-ÿ), Espaces (\s) et Tirets (-)
    // Le ^ au début et le $ à la fin signifient "toute la chaîne doit correspondre"
    const regex = /^[a-zA-ZÀ-ÿ\s-]+$/;

    const trimmedName = name.trim();

    if (trimmedName === "") {
      return "Le nom ne peut pas être vide.";
    }
    if (trimmedName.length < 2) {
      return "Le nom doit contenir au moins 2 caractères.";
    }
    if (!regex.test(trimmedName)) {
      return "Le nom ne doit contenir que des lettres (pas de chiffres ou symboles spéciaux).";
    }

    // Optionnel : Empêcher uniquement des chiffres si la regex était plus souple
    if (/^\d+$/.test(trimmedName)) {
      return "Le nom ne peut pas être composé uniquement de chiffres.";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nameValue = formData.get("name") as string;

    const errorMessage = validateName(nameValue);

    if (errorMessage) {
      toast.error(errorMessage, {
        description: "Oups !",
        style: { backgroundColor: "red", color: "#fff" },
      });
      return;
    }

    setName(nameValue.trim());

    toast.success("C'est parti !", {
      description: `Préparation des questions pour : ${nameValue}`,
      style: { backgroundColor: "green", color: "#fff" },
    });

    router.push("/theme");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-48 items-center justify-center rounded-md">
                <Image
                  src={"/logo-no-bg.png"}
                  alt="WikiIA Logo"
                  width={500}
                  height={500}
                />
              </div>
            </a>
            <h1 className="text-xl font-bold">
              Commençons par faire connaissance
            </h1>
            <FieldDescription className="hidden">
              Commençons par faire connaissance
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">
              Comment veux-tu qu&apos;on t&apos;appelle ?
            </FieldLabel>
            <Input id="name" type="text" placeholder="Ton prénom" name="name" />
          </Field>
          <Field>
            <Button type="submit" className="cursor-pointer">
              Continuer
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldSeparator></FieldSeparator>
      <FieldDescription className="px-6 text-center">
        Ton prénom sera utilisé pour personnaliser ton expérience et rendre le
        quiz plus amusant !
      </FieldDescription>
    </div>
  );
}
