-- 特別クエストを家族全体のイベントに統一（全児童から見えるように）
UPDATE otetsudai_tasks
SET assigned_child_id = NULL
WHERE is_special = true;

-- family_settings レコードが無い家族にデフォルト行を作成
INSERT INTO otetsudai_family_settings (family_id, special_quest_enabled, special_quest_star1_enabled, special_quest_star2_enabled, special_quest_star3_enabled)
SELECT id, true, true, true, true
FROM otetsudai_families
WHERE id NOT IN (SELECT family_id FROM otetsudai_family_settings);
