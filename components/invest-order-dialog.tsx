"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { StockPrice } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { R } from "@/components/ruby-text";
import { PixelBarChartIcon, PixelSeedlingIcon, PixelLightbulbIcon } from "@/components/pixel-icons";
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

const CATEGORIES = [
  { key: "index", label: "インデックス", desc: "初めての人におすすめ" },
  { key: "jp_stock", label: "🇯🇵 日本", desc: "" },
  { key: "us_stock", label: "🇺🇸 アメリカ", desc: "" },
] as const;

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
  const [activeCategory, setActiveCategory] = useState<string>("index");

  useEffect(() => {
    if (open) {
      loadStocks();
      setSelected(null);
      setAmount("");
      setError("");
      setSuccess(false);
      setActiveCategory("index");
    }
  }, [open]);

  async function loadStocks() {
    const { data } = await supabase
      .from("otetsudai_stock_prices")
      .select("*")
      .eq("is_preset", true)
      .order("category")
      .order("symbol");
    setStocks((data as StockPrice[]) || []);
  }

  const filteredStocks = stocks.filter((s) => s.category === activeCategory);

  async function handleSubmit() {
    if (!selected) {
      setError("銘柄を 選んでね");
      return;
    }
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 100) {
      setError("100円 以上 入力してね");
      return;
    }
    if (amountNum > investBalance) {
      setError(`増やすウォレットの 残高が 足りないよ（残り ¥${investBalance.toLocaleString()}）`);
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
        name: selected.name_ja || selected.name,
        amount: amountNum,
        order_type: "buy",
        status: "pending",
      });

    setLoading(false);
    if (insertError) {
      setError("送れませんでした。もう一度 試してね");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onClose();
      onCreated();
    }, 2000);
  }

  function formatPrice(stock: StockPrice): string {
    if (stock.price_jpy > 0) return `¥${stock.price_jpy.toLocaleString()}`;
    if (stock.price > 0) {
      if (stock.currency === "JPY") return `¥${stock.price.toLocaleString()}`;
      return `$${stock.price.toLocaleString()}`;
    }
    return "—";
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle><span className="flex items-center gap-1"><PixelSeedlingIcon size={18} /> <R k="株" r="かぶ" />を <R k="買" r="か" />いたい！</span></DialogTitle>
          <DialogDescription>
            <R k="増" r="ふ" />やすウォレットの お<R k="金" r="かね" />で <R k="株" r="かぶ" />を <R k="買" r="か" />えるよ
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="mb-3 flex justify-center"><PixelSeedlingIcon size={48} /></div>
            <p className="font-bold text-lg text-green-700">
              <R k="親" r="おや" />に お<R k="願" r="ねが" />いしたよ！
            </p>
            <p className="text-sm text-muted-foreground">
              <R k="承認" r="しょうにん" />を <R k="待" r="ま" />ってね
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 残高表示 */}
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-xs text-green-600"><R k="増" r="ふ" />やすウォレット <R k="残高" r="ざんだか" /></p>
              <p className="text-xl font-bold text-green-700">
                ¥{investBalance.toLocaleString()}
              </p>
            </div>

            {/* カテゴリタブ */}
            <div>
              <Label>カテゴリを <R k="選" r="えら" />ぼう</Label>
              <div className="flex gap-1.5 mt-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => { setActiveCategory(cat.key); setSelected(null); setError(""); }}
                    className={`flex-1 text-xs py-2 px-1 rounded-lg border transition-all ${
                      activeCategory === cat.key
                        ? "bg-green-100 border-green-400 font-bold text-green-800"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {CATEGORIES.find((c) => c.key === activeCategory)?.desc && (
                <p className="text-[10px] text-green-600 mt-1 text-center">
                  {CATEGORIES.find((c) => c.key === activeCategory)?.desc}
                </p>
              )}
            </div>

            {/* 銘柄選択 */}
            <div>
              <Label><R k="銘柄" r="めいがら" />を <R k="選" r="えら" />ぼう</Label>
              <div className="grid gap-2 mt-2">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => { setSelected(stock); setError(""); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selected?.symbol === stock.symbol
                        ? "bg-green-100 border-green-400 ring-2 ring-green-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{stock.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate">
                          {stock.name_ja || stock.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {stock.symbol}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {stock.description_kids}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold">{formatPrice(stock)}</p>
                      {stock.change_percent !== 0 && (
                        <p className={`text-[10px] font-semibold ${
                          stock.change_percent >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {stock.change_percent >= 0 ? "📈" : "📉"}{" "}
                          {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </button>
                ))}
                {filteredStocks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    この カテゴリの <R k="銘柄" r="めいがら" />は ありません
                  </p>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2 leading-relaxed">
                <span className="inline-flex items-start gap-1"><PixelLightbulbIcon size={14} /> <R k="買" r="か" />いたい <R k="株" r="かぶ" />が ないときは、おうちの <R k="人" r="ひと" />に <R k="伝" r="つた" />えるか <R k="相談" r="そうだん" />してね</span>
              </p>
            </div>

            {/* 金額入力 */}
            <div>
              <Label htmlFor="invest-amount">いくら <R k="投資" r="とうし" />する？（<R k="円" r="えん" />）</Label>
              <Input
                id="invest-amount"
                type="number"
                inputMode="numeric"
                min={100}
                step={100}
                max={investBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例: 500"
                className="mt-1 h-12 text-xl text-center"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                100<R k="円" r="えん" /> から <R k="投資" r="とうし" />できるよ
              </p>
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            <Button
              className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse"><R k="送" r="おく" />り<R k="中" r="ちゅう" />...</span>
              ) : (
                "親に お願いする"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
