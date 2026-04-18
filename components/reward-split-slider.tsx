"use client";

import { useState, useCallback } from "react";
import { R } from "@/components/ruby-text";
import { PixelPiggyIcon, PixelSeedlingIcon } from "@/components/pixel-icons";

/**
 * 報酬自動分配スライダー（UD対応）
 * 赤（つかう）・青（ためる）・緑（ふやす）の3色で視覚的に分配比率を表現
 *
 * save_ratio + invest_ratio <= 100
 * spend = 100 - save - invest
 */
type RewardSplitSliderProps = {
  saveRatio: number;
  investRatio: number;
  onChange: (save: number, invest: number) => void;
  disabled?: boolean;
};

export default function RewardSplitSlider({
  saveRatio,
  investRatio,
  onChange,
  disabled = false,
}: RewardSplitSliderProps) {
  const spendRatio = 100 - saveRatio - investRatio;

  const handleSaveChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSave = parseInt(e.target.value);
      // invest_ratio は現在値を維持、ただし合計100を超えないよう調整
      const maxInvest = 100 - newSave;
      const newInvest = Math.min(investRatio, maxInvest);
      onChange(newSave, newInvest);
    },
    [investRatio, onChange]
  );

  const handleInvestChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInvest = parseInt(e.target.value);
      const maxSave = 100 - newInvest;
      const newSave = Math.min(saveRatio, maxSave);
      onChange(newSave, newInvest);
    },
    [saveRatio, onChange]
  );

  return (
    <div className="space-y-4" role="group" aria-label="報酬の分配比率">
      {/* ビジュアルバー：3色で分配を視覚化 */}
      <div className="flex h-8 rounded-full overflow-hidden border-2 border-gray-200" aria-hidden="true">
        {spendRatio > 0 && (
          <div
            className="bg-red-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
            style={{ width: `${spendRatio}%` }}
          >
            {spendRatio >= 15 && `${spendRatio}%`}
          </div>
        )}
        {saveRatio > 0 && (
          <div
            className="bg-blue-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
            style={{ width: `${saveRatio}%` }}
          >
            {saveRatio >= 15 && `${saveRatio}%`}
          </div>
        )}
        {investRatio > 0 && (
          <div
            className="bg-green-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
            style={{ width: `${investRatio}%` }}
          >
            {investRatio >= 15 && `${investRatio}%`}
          </div>
        )}
      </div>

      {/* 凡例 + 数値表示 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white text-sm" aria-hidden="true">💰</div>
          <span className="text-xs font-bold text-red-600"><R k="使" r="つか" />う</span>
          <span className="text-lg font-bold text-red-700">{spendRatio}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center" aria-hidden="true"><PixelPiggyIcon size={16} /></div>
          <span className="text-xs font-bold text-blue-600"><R k="貯" r="た" />める</span>
          <span className="text-lg font-bold text-blue-700">{saveRatio}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center" aria-hidden="true"><PixelSeedlingIcon size={16} /></div>
          <span className="text-xs font-bold text-green-600"><R k="増" r="ふ" />やす</span>
          <span className="text-lg font-bold text-green-700">{investRatio}%</span>
        </div>
      </div>

      {/* スライダー */}
      <div className="space-y-3">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-1">
            <span className="w-5 h-5 rounded-full bg-blue-400 inline-flex items-center justify-center" aria-hidden="true"><PixelPiggyIcon size={10} /></span>
            <R k="貯" r="た" />める: {saveRatio}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={saveRatio}
            onChange={handleSaveChange}
            disabled={disabled}
            className="w-full h-3 rounded-full appearance-none cursor-pointer accent-blue-500 bg-blue-100"
            aria-label={`ためる（貯金）の割合: ${saveRatio}パーセント`}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-1">
            <span className="w-5 h-5 rounded-full bg-green-400 inline-flex items-center justify-center" aria-hidden="true"><PixelSeedlingIcon size={10} /></span>
            <R k="増" r="ふ" />やす: {investRatio}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={investRatio}
            onChange={handleInvestChange}
            disabled={disabled}
            className="w-full h-3 rounded-full appearance-none cursor-pointer accent-green-500 bg-green-100"
            aria-label={`ふやす（投資）の割合: ${investRatio}パーセント`}
          />
        </div>
      </div>

      {/* ヒント */}
      <p className="text-xs text-muted-foreground text-center">
        <R k="残" r="のこ" />り（<R k="使" r="つか" />うお<R k="金" r="かね" />）は <R k="自動" r="じどう" />で <R k="決" r="き" />まります
      </p>
    </div>
  );
}
