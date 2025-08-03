"use client";

import { COUNTRY_CODES } from "@/const/countryCodes";
import { Participant } from "@/types";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";

import { EditDocModal } from "../Modals/EditDocModal";
import {
  CancelIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronIcon,
  ClockIcon,
  CopyIcon,
  MailIcon,
  MoreIcon,
  NotificationIcon,
  TelegramIcon,
  WhatsappIcon,
} from "../icon";
import { ColIcon } from "../icon/flags";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";
import {
  Popover,
  PopoverContent,
  PopoverContentItem,
  PopoverTrigger,
} from "../ui/popover";

const iconMap: Record<string, string> = {
  selfie: "/verificationIcons/selfie.svg",
  document: "/verificationIcons/document.svg",
  identity: "/verificationIcons/identity.svg",
  facial: "/verificationIcons/facial.svg",
  phone: "/verificationIcons/phone.svg",
  email: "/verificationIcons/email.svg",
};

const verificationMap: Record<string, string> = {
  selfie: "Selfie",
  document: "Document",
  identity: "Identity",
  facial: "Facial",
  phone: "Phone",
  email: "Email",
};

interface CardParticipantProps extends Participant {
  index: number;
  variant?: "action" | "notification";
  verifications?: any;
  documentId?: string;
  onSendMethodChange?: (index: number, method: string) => void;
  onPhoneDataChange?: (
    index: number,
    countryCode: string,
    phone: string,
  ) => void;
  onRemove?: (index: number) => void;
  totalParticipants?: number;
  isSelf?: boolean;
  onClearSelf?: (index: number) => void;
  onSignAsSelf?: () => void;
}

export const CardParticipant = (props: CardParticipantProps) => {
  const {
    index,
    photo,
    firstName,
    lastName,
    email,
    docUrl,
    status,
    variant,
    verifications,
    documentId: _documentId,
    onRemove,
    onSendMethodChange,
    onPhoneDataChange,
    totalParticipants,
    isSelf,
    onClearSelf,
    onSignAsSelf,
  } = props;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const [sendMethod, setSendMethod] = useState("email");
  const [countryCode, setCountryCode] = useState("+57");
  const [phone, setPhone] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const countrySelectRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const t = useTranslations("DocumentStatus");
  const tsm = useTranslations("sendMethods");
  const tg = useTranslations();

  const hasVerifications =
    verifications && Object.values(verifications).some((v) => v);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copiado al portapapeles",
      });
    });
  };

  const handleNotification = () => {
    console.log(handleNotification.name);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
      if (
        countrySelectRef.current &&
        !countrySelectRef.current.contains(event.target as Node)
      ) {
        setIsCountrySelectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const generateBadge = (id: string) => {
    switch (id) {
      case "waiting":
        return (
          <Badge type="negative" variant="neutral">
            <ClockIcon />
            {t(id)}
          </Badge>
        );
      case "rejected":
        return (
          <Badge type="negative" variant="error">
            <CancelIcon />
            {t(id)}
          </Badge>
        );
      case "completed":
        return (
          <Badge type="negative" variant="success">
            <CheckCircleIcon />
            {t(id)}
          </Badge>
        );
      default:
        return null;
    }
  };

  const sendMethods = [
    {
      id: "email",
      label: tsm("email"),
      icon: <MailIcon size={20} />,
    },
    {
      id: "whatsapp",
      label: tsm("whatsapp"),
      icon: <WhatsappIcon size={20} />,
    },
    {
      id: "telegram",
      label: tsm("telegram"),
      icon: <TelegramIcon size={20} />,
    },
  ];

  return (
    <>
      <div className={cn("rounded-2xl bg-neutral-50 p-4")}>
        <div className="flex gap-8">
          <div className="hidden shrink-0 overflow-hidden rounded-lg md:block">
            <Image
              src={photo || "/participante-photo.png"}
              width={108}
              height={108}
              className="shrink-0"
              alt=""
            />
          </div>
          <div className="w-full">
            <div className="flex items-center gap-4 xs:gap-6">
              <div className="shrink-0 overflow-hidden rounded-lg md:hidden">
                <Image
                  src={photo || "/participante-photo.png"}
                  width={72}
                  height={72}
                  className="shrink-0"
                  alt=""
                />
              </div>

              <div className="flex flex-auto items-center justify-between md:py-3">
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:flex">
                  <h4 className="truncate font-bold text-neutral-700">
                    {firstName} {lastName}
                  </h4>
                  <p className="truncate text-neutral-400">
                    <span className="truncate">{email}</span>
                  </p>
                </div>

                {variant === "notification" && (
                  <div className="hidden md:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="medium"
                          onClick={handleNotification}
                        >
                          <NotificationIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>Enviar recordatorio de firma</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {variant === "action" && (
                  <div className="hidden md:block">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary" size="medium">
                          <MoreIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="hidden !w-max md:block"
                      >
                        <PopoverContentItem asChild>
                          <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            {tg("editParticipant")}
                          </button>
                        </PopoverContentItem>
                        {props.index > 0 && (
                          <PopoverContentItem
                            asChild
                            onClick={() => {
                              if (
                                isSelf &&
                                totalParticipants === 1 &&
                                onClearSelf
                              ) {
                                onClearSelf(index);
                              } else {
                                onRemove?.(index);
                              }
                            }}
                          >
                            <button type="button">
                              {tg("deleteParticipant")}
                            </button>
                          </PopoverContentItem>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            {variant === "action" && !isSelf && (
              <div className="self-stretch flex flex-col justify-start items-start gap-6 md:mt-2">
                {/* Verificaciones */}
                <div className="hidden md:flex flex-row flex-wrap gap-2 w-full">
                  {hasVerifications ? (
                    Object.entries(verifications).map(
                      ([key, value]) =>
                        value === true && (
                          <div
                            key={key}
                            className="inline-flex gap-2 rounded-full bg-neutral-100 px-2.5 py-2 text-neutral-700 ring-1 ring-neutral-200"
                          >
                            <Image
                              width={20}
                              height={20}
                              src={iconMap[key]}
                              alt=""
                            />{" "}
                            <span className="hidden md:inline">
                              {verificationMap[key]}
                            </span>
                          </div>
                        ),
                    )
                  ) : (
                    <div className="inline-flex gap-2 rounded-full bg-neutral-100 px-2.5 py-2 text-neutral-700 ring-1 ring-neutral-200">
                      {tg("noVerifications")}
                    </div>
                  )}
                </div>
                {/* Verificaciones Mobile */}
                <div className="self-stretch inline-flex justify-start items-center gap-2 flex-wrap content-center md:hidden mt-6">
                  {hasVerifications ? (
                    Object.entries(verifications).map(
                      ([key, value]) =>
                        value === true && (
                          <div
                            key={key}
                            className="px-2.5 py-2 bg-gray-100 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-2"
                          >
                            <Image
                              width={20}
                              height={20}
                              src={iconMap[key]}
                              alt=""
                            />
                          </div>
                        ),
                    )
                  ) : (
                    <div className="px-2.5 py-2 bg-gray-100 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-2">
                      {tg("noVerifications")}
                    </div>
                  )}
                </div>
                {/* Send Method Selector and Phone Input */}
                {!docUrl && variant === "action" && (
                  <div className="self-stretch flex flex-col md:inline-flex md:flex-row lg:inline-flex lg:flex-row justify-start items-start gap-6">
                    {/* Send Method Selector */}
                    <div className="self-stretch md:w-96 lg:w-96 inline-flex flex-col justify-start items-start gap-1">
                      <div className="relative w-full" ref={selectRef}>
                        <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsSelectOpen(!isSelectOpen);
                            }}
                            className={`self-stretch h-12 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-2 overflow-hidden`}
                          >
                            <div className="flex-1 flex justify-start items-center gap-2">
                              {
                                sendMethods.find(
                                  (method) => method.id === sendMethod,
                                )?.icon
                              }
                              <div className="flex-1 flex justify-start items-start">
                                <div className="justify-center text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                                  {
                                    sendMethods.find(
                                      (method) => method.id === sendMethod,
                                    )?.label
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="w-6 h-6 relative overflow-hidden">
                              <ChevronIcon size={24} />
                            </div>
                          </button>
                          {isSelectOpen && (
                            <div className="absolute top-full left-0 z-50 w-full bg-white rounded-lg shadow-[0px_2px_12px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start overflow-hidden">
                              {sendMethods.map((method, methodIndex) => (
                                <button
                                  type="button"
                                  key={method.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSendMethod(method.id);
                                    setIsSelectOpen(false);
                                    onSendMethodChange?.(index, method.id);
                                  }}
                                  className={`self-stretch px-5 py-3 ${
                                    sendMethod === method.id
                                      ? "bg-gray-50"
                                      : "hover:bg-gray-50"
                                  } ${
                                    methodIndex < sendMethods.length - 1
                                      ? "border-b border-gray-100"
                                      : ""
                                  } inline-flex justify-start items-center gap-3`}
                                >
                                  {method.icon}
                                  <div className="flex-1 justify-center text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                                    {method.label}
                                  </div>
                                  {sendMethod === method.id && (
                                    <div className="w-6 h-6 relative">
                                      <CheckIcon size={24} />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone Input for WhatsApp/Telegram */}
                      {(sendMethod === "whatsapp" ||
                        sendMethod === "telegram") && (
                        <div className="self-stretch md:flex-1 lg:flex-1 inline-flex justify-start items-center gap-2">
                          <div className="flex-1 flex justify-start items-start gap-2">
                            {/* Country Code Select */}
                            <div className="inline-flex flex-col justify-start items-start gap-1">
                              <div className="relative" ref={countrySelectRef}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsCountrySelectOpen(!isCountrySelectOpen);
                                  }}
                                  className={`h-12 px-3 py-1 bg-white rounded-lg outline outline-2 outline-offset-[-2px] inline-flex justify-start items-center gap-2 overflow-hidden ${
                                    isCountrySelectOpen
                                      ? "shadow-[0px_0px_0px_4px_rgba(62,71,132,0.25)] outline-indigo-300"
                                      : "outline-neutral-200"
                                  }`}
                                >
                                  <div className="flex justify-start items-center gap-2">
                                    <div className="flex justify-start items-center gap-1">
                                      {countryCode &&
                                      COUNTRY_CODES.find(
                                        (code) => code.value === countryCode,
                                      ) ? (
                                        <>
                                          <div className="w-5 h-4 flex-shrink-0">
                                            {(() => {
                                              const country = COUNTRY_CODES.find(
                                                (code) =>
                                                  code.value === countryCode,
                                              );
                                              if (country) {
                                                const IconComponent =
                                                  country.icon;
                                                return (
                                                  <IconComponent size={20} />
                                                );
                                              }
                                              return null;
                                            })()}
                                          </div>
                                          <span className="text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal">
                                            {countryCode}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="w-5 h-4 flex-shrink-0">
                                            <ColIcon size={20} />
                                          </div>
                                          <span className="text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal">
                                            +57
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="w-6 h-6 relative overflow-hidden">
                                    <ChevronIcon size={24} />
                                  </div>
                                </button>

                                {isCountrySelectOpen && (
                                  <div className="w-80 left-0 top-full absolute z-50 bg-white rounded-lg shadow-[0px_2px_12px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 inline-flex flex-col justify-start items-start overflow-hidden">
                                    {COUNTRY_CODES.map(
                                      (country, countryIndex) => {
                                        const IconComponent = country.icon;
                                        return (
                                          <button
                                            key={country.value}
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setCountryCode(country.value);
                                              setIsCountrySelectOpen(false);
                                              onPhoneDataChange?.(
                                                index,
                                                country.value,
                                                phone,
                                              );
                                            }}
                                            className={`self-stretch px-5 py-3 ${
                                              countryIndex <
                                              COUNTRY_CODES.length - 1
                                                ? "border-b border-gray-100"
                                                : ""
                                            } inline-flex justify-start items-center gap-3 hover:bg-gray-50`}
                                          >
                                            <div className="w-5 h-5 relative">
                                              <IconComponent size={20} />
                                            </div>
                                            <div className="justify-center text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal">
                                              {country.label}
                                            </div>
                                            <div className="flex-1 justify-center text-gray-400 text-base font-normal font-['Open_Sans'] leading-normal">
                                              {country.value}
                                            </div>
                                            {countryCode === country.value && (
                                              <div className="w-6 h-6 relative">
                                                <CheckIcon size={24} />
                                              </div>
                                            )}
                                          </button>
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Phone Number Input */}
                            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                              <div className="self-stretch h-12 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                                <div className="flex-1 flex justify-start items-center gap-2">
                                  <div className="flex-1 flex justify-start items-start gap-1">
                                    <input
                                      type="tel"
                                      placeholder="Ingresa el número"
                                      value={phone}
                                      onChange={(e) => {
                                        setPhone(e.target.value);
                                        onPhoneDataChange?.(
                                          index,
                                          countryCode,
                                          e.target.value,
                                        );
                                      }}
                                      className="w-full justify-center text-gray-700 text-base font-normal font-['Open_Sans'] leading-normal border-none outline-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {variant !== "action" && (
              <div className="mt-6 flex items-center gap-3 xs:gap-6 md:mt-2">
                {/* Si es el propio usuario, mostrar botón de firmar en vez de docUrl */}
                {isSelf && onSignAsSelf ? (
                  <Button type="button" onClick={onSignAsSelf}>
                    Firmar documento
                  </Button>
                ) : (
                  <Input
                    readOnly
                    value={docUrl}
                    iconRight={
                      <button
                        type="button"
                        onClick={() => handleCopy(String(docUrl))}
                      >
                        <CopyIcon />
                      </button>
                    }
                  />
                )}

                {variant === "notification" && (
                  <div className="md:hidden">
                    <Button variant="secondary" onClick={handleNotification}>
                      <NotificationIcon />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {variant === "action" && (
              <div className="mt-6 flex gap-4 md:hidden">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  {tg("editParticipant")}
                </Button>
                <Button
                  variant="secondaryError"
                  size="medium"
                  onClick={() => {
                    if (isSelf && totalParticipants === 1 && onClearSelf) {
                      onClearSelf(index);
                    } else {
                      onRemove?.(index);
                    }
                  }}
                >
                  {tg("delete")}
                </Button>
              </div>
            )}
            {status && (
              <div className="mt-4 rounded-xl bg-neutral-100 p-4">
                <div className="flex items-center gap-4">
                  {generateBadge(status.id)}
                  {status.id === "waiting" && (
                    <p className="hidden text-xs font-semibold md:block">
                      Aún no visualizó el documento.
                    </p>
                  )}
                  {status.timestamp && (
                    <p className="text-sm">{status.timestamp}</p>
                  )}
                </div>

                {status.helperText && (
                  <p className="mt-4 text-sm text-neutral-700">
                    <strong className="font-bold">Motivo de rechazo:</strong>
                    {status.helperText}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {variant === "action" && (
        <EditDocModal
          index={index}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEnter={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};
