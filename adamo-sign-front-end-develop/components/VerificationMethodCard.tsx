import Image from "next/image";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";
import { Verification } from "@/types";
import { useTranslations } from "next-intl";

const iconMap = {
  selfie: "/verificationIcons/selfie.svg",
  document: "/verificationIcons/document.svg",
  identity: "/verificationIcons/identity.svg",
  facial: "/verificationIcons/facial.svg",
  phone: "/verificationIcons/phone.svg",
  email: "/verificationIcons/email.svg",
};

interface Props extends Verification {
  variant?: "full" | "compact";
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const VerificationMethodCard = (props: Props) => {
  const { type, isPro, variant = "full" } = props;

  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-6 md:bg-neutral-50 md:p-6">
      <div className="grid grid-cols-[40px_1fr_40px] items-center gap-4 md:flex">
        <div
          className={cn(
            "inline-block rounded-2xl p-2.5",
            isPro ? "bg-adamo-id-100" : "bg-adamo-sign-100",
          )}
        >
          <Image width={20} height={20} src={iconMap[type]} alt="" />
        </div>
        <h5 className="truncate font-semibold text-neutral-700">
          {t(`verifications.${type}.title`)}
        </h5>

        {isPro ? (
          <p className="ml-auto rounded-2xl bg-adamo-pay-100 p-2 text-sm font-semibold">
            <span className="lg:hidden">Pro</span>
            <span className="hidden whitespace-nowrap lg:inline">Plan Pro</span>
          </p>
        ) : (
          <Switch
            className="ml-auto"
            checked={props.checked}
            onCheckedChange={props.onCheckedChange}
          />
        )}
      </div>
      {variant === "full" && (
        <p className="text-sm text-neutral-600">
          {t(`verifications.${type}.description`)}
        </p>
      )}
    </div>
  );
};
