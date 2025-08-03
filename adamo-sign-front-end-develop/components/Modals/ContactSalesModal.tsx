"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Checkbox } from "@/components/ui/Checkbox";

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { services: string[]; message: string }) => void;
}

function ContactSalesModal({
  isOpen,
  onClose,
  onSubmit,
}: ContactSalesModalProps) {
  const t = useTranslations("ContactSalesModal");
  const tg = useTranslations("Global");

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const services = [
    { id: "adamo-pay", label: "Adamo Pay" },
    { id: "adamo-id", label: "Adamo ID" },
    { id: "adamo-risk", label: "Adamo Risk" },
  ];

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        services: selectedServices,
        message: message.trim(),
      });
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedServices([]);
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 sm:w-[90vw] lg:w-[808px] max-w-[90vw] sm:max-w-[90vw] lg:max-w-[808px] p-8 bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="justify-center text-gray-700 text-base font-bold font-['Open_Sans'] leading-normal">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="justify-center text-gray-500 text-base font-normal font-['Open_Sans'] leading-normal">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="self-stretch inline-flex flex-col justify-start items-start gap-14">
          {/* Services Selection */}
          <div className="self-stretch inline-flex justify-start items-start gap-8 sm:gap-10 lg:gap-12 flex-wrap sm:flex-nowrap lg:flex-nowrap content-start overflow-hidden">
            {services.map((service) => (
              <div key={service.id} className="flex justify-start items-center gap-3">
                <Checkbox
                  id={service.id}
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={(checked) =>
                    handleServiceChange(service.id, checked as boolean)
                  }
                  className="w-5 h-5"
                />
                <label
                  htmlFor={service.id}
                  className="justify-center text-gray-500 text-base font-normal font-['Open_Sans'] leading-normal cursor-pointer"
                >
                  {service.label}
                </label>
              </div>
            ))}
          </div>

          {/* Message Textarea */}
          <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
            <div className="self-stretch px-3 py-3.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
              <div className="flex-1 flex justify-start items-center gap-2">
                <div className="flex-1 flex justify-start items-start gap-1">
                  <textarea
                    placeholder={t("messagePlaceholder")}
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none resize-none min-h-[80px] text-gray-400 text-base font-normal font-['Open_Sans'] placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="inline-flex justify-start items-start gap-6">
            <button
              onClick={handleCancel}
              className="h-12 px-5 py-3 bg-violet-100 rounded-xl flex justify-center items-center gap-2 overflow-hidden"
            >
              <div className="text-center justify-center text-indigo-900 text-base font-semibold font-['Open_Sans'] leading-normal">
                {tg("cancel")}
              </div>
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedServices.length === 0}
              className="h-12 px-5 py-3 bg-indigo-900 rounded-xl flex justify-center items-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center justify-center text-white text-base font-semibold font-['Open_Sans'] leading-normal">
                {t("sendButton")}
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContactSalesModal;