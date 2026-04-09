"use client";

import { useState } from "react";
import { PAYMENT_APPS, openPaymentApp, type PaymentApp } from "@/lib/deeplinks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;
  purpose: string;
  childName: string;
};

/**
 * 支出承認完了後に表示するダイアログ。
 * 外部決済アプリへのディープリンクを提供する。
 */
export function PaymentLinkDialog({
  open,
  onClose,
  amount,
  purpose,
  childName,
}: Props) {
  const [launched, setLaunched] = useState<string | null>(null);

  function handleLaunch(app: PaymentApp) {
    setLaunched(app.id);
    openPaymentApp(app, amount);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>おしはらいアプリをひらく</DialogTitle>
          <DialogDescription>
            {childName}の「{purpose}」（{amount.toLocaleString()}えん）が
            しょうにんされました。
            <br />
            おしはらいアプリをひらきますか？
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {PAYMENT_APPS.map((app) => (
            <Button
              key={app.id}
              variant="outline"
              className="w-full justify-start gap-3 h-14 text-base"
              onClick={() => handleLaunch(app)}
            >
              <span className="text-2xl">{app.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{app.name}</div>
                <div className="text-xs text-muted-foreground">
                  {app.description}
                </div>
              </div>
              {launched === app.id && (
                <span className="ml-auto text-emerald-600 text-sm">
                  きどうずみ ✓
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            あとで
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
