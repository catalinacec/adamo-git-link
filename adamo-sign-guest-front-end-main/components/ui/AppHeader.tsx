import Image from "next/image";
import Link from "next/link";

import LangDropdown from "./LangDropdown";

export const AppHeader = () => {
  return (
    <div className="bg-adamo-sign-600">
      <div className="max-w-[1264px] mx-auto px-6 flex items-center justify-between py-4 ">
        <Link href="/">
          <Image
            src="/adamo-logo.svg"
            alt="AdamoSign Company logo"
            width={120}
            height={24}
            role="img"
            priority
          />
        </Link>
        <div>
          <LangDropdown />
        </div>
      </div>
    </div>
  );
};
