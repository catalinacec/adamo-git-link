import Link from "next/link";
import Image from "next/image";
import { StatItem } from "@/types";

import { Button } from "../ui/Button";

interface CardStatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    StatItem {}

export const CardStat = (props: CardStatProps) => {
  const { title, value, href, hrefText, icon } = props;

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white px-8 py-10">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-adamo-sign-50 p-4">
          <Image
            src={icon}
            width={24}
            height={24}
            className="shrink-0"
            aria-hidden="true"
            alt=""
          />
        </div>
        <p className="text-lg font-bold text-adamo-sign-700">{value}</p>
      </div>

      <p className="mt-4 text-neutral-700">{title}</p>

      <Button asChild variant="secondary" className="mt-10">
        {/* <Link href={href}>{hrefText}</Link> */}
        {href
          ? (
            <Button asChild variant="secondary">
              <Link href={href}>{hrefText}</Link>
            </Button>
          )
          : hrefText // Si no hay href, renderiza el botón personalizado
        }
      </Button>
    </div>
  );
};
