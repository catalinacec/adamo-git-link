"use client";

import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

import ContactSalesModal from "./ContactSalesModal";

import { useProfile } from "@/context/ProfileContext";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { EditIcon, TrashIcon } from "../icon";
import { Input } from "../ui/Input";
import { useToast } from "@/hooks/use-toast";

const VALID_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

interface FormData {
  name: string;
  lastName: string;
  email: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (payload: {
    name: string;
    surname: string;
    language: string;
    profileImage?: File;
  }) => void;
}

export const ProfileModal = ({ isOpen, onClose, onUpdate }: ProfileModalProps) => {
  const { profileImage, name, lastName, email } = useProfile();
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(profileImage);
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast();

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { name, lastName, email },
  });

  const t = useTranslations("ProfileModal");
  const tg = useTranslations("Global");

  const handleImageSelect = () => fileInputRef.current?.click();
  const handleImageDelete = () => {
    setFile(null);
    setPreview(null);
  };

  const handleContactSalesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContactSalesModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (f && VALID_IMAGE_TYPES.includes(f.type)) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      toast({
        title: t("invalidType", { defaultMessage: "Error al actualizar" }),
      });
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    onUpdate({
      name: data.name,
      surname: data.lastName,
      language: locale.startsWith("es") ? "es" : "en",
      profileImage: file ?? undefined,
    });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>
            <DialogDescription>
              <span className="sr-only"></span>
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="flex flex-col items-start gap-y-8">
              <div className="relative inline-block">
                <div className="relative h-[144px] w-[144px] overflow-hidden rounded-2xl">
                  <Image
                    unoptimized
                    src={preview || "/default-user.png"}
                    fill
                    className="object-cover"
                    alt=""
                  />
                </div>

                <input
                  type="file"
                  className="sr-only hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={VALID_IMAGE_TYPES.join(",")}
                />

                <div className="absolute -right-8 top-1/2 flex -translate-y-1/2 flex-col gap-4">
                  <Button variant="secondary" onClick={handleImageSelect}>
                    <EditIcon />
                  </Button>
                  <Button variant="secondaryError" onClick={handleImageDelete}>
                    <TrashIcon />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                <Input type="text" label={tg("firstName")} {...register("name")} />
                <Input type="text" label={tg("lastName")} {...register("lastName")} />
                <Input type="email" label={tg("email")} {...register("email")} disabled />

                <p className="text-neutral-700">
                  {t.rich("modalText", {
                    link: (chunks) => (
                      <button
                        type="button"
                        className="text-adamo-sign-500 underline hover:text-adamo-sign-600"
                        onClick={handleContactSalesClick}
                      >
                        {chunks}
                      </button>
                    ),
                  })}
                </p>
              </form>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              {tg("cancel")}
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>{tg("update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContactSalesModal
        isOpen={isContactSalesModalOpen}
        onClose={() => setIsContactSalesModalOpen(false)}
      />
    </>
  );
};
