import Link from "next/link";
import { StatDocItem } from "@/types";

import { Button } from "../ui/Button";

interface CardStatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    StatDocItem {}

export const CardStatDoc = (props: CardStatProps) => {
  const { title, description, href, buttonText, buttonVariant, icon } = props;

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white px-8 py-10">
      <div className="inline-block rounded-full bg-adamo-sign-50 p-4 text-adamo-sign-700">
        {icon}
      </div>

      <h4 className="mt-4 text-lg font-bold text-adamo-sign-700">{title}</h4>
      <p className="mt-4 text-neutral-400">{description}</p>

      <Button asChild variant={buttonVariant} className="mt-10">
        <Link href={href}>{buttonText}</Link>
      </Button>
    </div>
  );
};
