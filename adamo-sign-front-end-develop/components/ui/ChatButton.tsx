import { useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { CancelFilledIcon } from "../icon";

function ChatButton() {
  const [open, setOpen] = useState(true);
  const t = useTranslations("ChatButton");

  return (
    <div className="fixed bottom-[72px] right-6 z-20 inline-flex md:bottom-24 md:right-8">
      {open && (
        <div className="absolute bottom-[calc(100%+32px)] right-0 w-[308px] rounded-2xl bg-adamo-sign-100 p-4">
          <p className="text-sm">{t("text")}</p>

          <div
            aria-hidden
            className="absolute -bottom-[22px] right-6 inline-block"
          >
            <Image src="/float-corner.svg" width={44} height={44} alt="" />
          </div>

          <button
            type="button"
            className="absolute -right-2 -top-2"
            onClick={() => setOpen(false)}
          >
            <CancelFilledIcon className="text-neutral-700" />
          </button>
        </div>
      )}
      <Link
        href="https://wa.me/"
        type="button"
        className="inline-block rounded-full bg-[#E5EFFF] p-4"
        target="_blank"
      >
        <Image
          unoptimized
          src="/whatsapp-button.png"
          width={56}
          height={56}
          alt=""
          quality={100}
        />
      </Link>
    </div>
  );
}

export default ChatButton;
