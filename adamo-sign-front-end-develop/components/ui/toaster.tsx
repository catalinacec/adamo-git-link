"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="flex items-start justify-center p-4 pointer-events-auto">
        <ToastProvider>
          {toasts.map(function ({ id, title, description, action, ...props }) {
            return (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
              </Toast>
            );
          })}
          <ToastViewport />
        </ToastProvider>
      </div>
    </div>
  );
}
