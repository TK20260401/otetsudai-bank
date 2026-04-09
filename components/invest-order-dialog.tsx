"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { StockPrice } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  childId: string;
  walletId: string;
  investBalance: number;
  onCreated: () => void;
};

export function InvestOrderDialog({
  open,
  onClose,
  childId,
  walletId,
  investBalance,
  onCreated,
}: Props) {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [selected, setSelected] = useState<StockPrice | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadStocks();
      setSelected(null);
      setAmount("");
      setError("");
      setSuccess(false);
    }
  }, [open]);

  async function loadStocks() {
    const { data } = await supabase
      .from("otetsudai_stock_prices")
      .select("*")
      .eq("is_preset", true)
      .order("symbol");
    setStocks((data as StockPrice[]) || []);
  }

  async function handleSubmit() {
    if (!selected) {
      setError("めいがらを えらんでね");
      return;
    }
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 100) {
      setError("100えん いじょう にゅうりょくしてね");
      return;
    }
    if (amountNum > investBalance) {
      setError(`ふやすウォレットの ざんだかが たりないよ（のこり ¥${investBalance.toLocaleString()}）`);
      return;
    }

    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("otetsudai_invest_orders")
      .insert({
        child_id: childId,
        wallet_id: walletId,
        symbol: selected.symbol,
        name: selected.name,
        amount: amountNum,
        order_type: "buy",
        status: "pending",
      });

    setLoading(false);
    if (insertError) {
      setError("おくれませんでした。もういちど ためしてね");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onClose();
      onCreated();
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>🌱 かぶを かいたい！</DialogTitle>
          <DialogDescription>
            ふやすウォレットの おかねで かぶを かえるよ
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-3 animate-bounce">📈</div>
            <p className="font-bold text-lg text-green-700">
              おやに おねがいしたよ！
            </p>
            <p className="text-sm text-muted-foreground">
              しょうにんを まってね
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 残高表示 */}
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-xs text-green-600">ふやすウォレット ざんだか</p>
              <p className="text-xl font-bold text-green-700">
                ¥{investBalance.toLocaleString()}
              </p>
            </div>

            {/* 銘柄選択 */}
            <div>
              <Label>めいがらを えらぼう</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {stocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => { setSelected(stock); setError(""); }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left ${
                      selected?.symbol === stock.symbol
                        ? "bg-green-100 border-green-400 ring-2 ring-green-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{stock.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{stock.name}</p>
                      <p className="text-[10px] text-muted-foreground">{stock.symbol}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 金額入力 */}
            <div>
              <Label htmlFor="invest-amount">いくら とうしする？（えん）</Label>
              <Input
                id="invest-amount"
                type="number"
                inputMode="numeric"
                min={100}
                step={100}
                max={investBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="れい: 500"
                className="mt-1 h-12 text-xl text-center"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                100えん から とうしできるよ
              </p>
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            <Button
              className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">おくりちゅう...</span>
              ) : (
                "おやに おねがいする 📈"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
