#!/bin/bash

cd public/images/tarot-cards/

# まず一時的な名前に変更（重複を避けるため）
mv blood-moon.jpg temp_full-moon.jpg
mv blue-moon.jpg temp_moon-shadow.jpg
mv crescent-moon.jpg temp_last-quarter.jpg
mv eclipse.jpg temp_waning-gibbous.jpg
mv first-quarter.jpg temp_new-moon.jpg
mv full-moon.jpg temp_moon-mirror.jpg
mv last-quarter.jpg temp_moonlight.jpg
mv moon-mirror.jpg temp_eclipse.jpg
mv moon-shadow.jpg temp_waning-crescent.jpg
# moon-smile.jpg はそのまま（正しい）
mv moon-tears.jpg temp_waxing-gibbous.jpg
mv moonlight-2.jpg temp_blood-moon.jpg
mv moonlight.jpg temp_moon-tears.jpg
mv new-moon.jpg temp_first-quarter.jpg
mv super-moon.jpg temp_blue-moon.jpg
# waning-crescent.jpg は削除
rm -f waning-crescent.jpg
mv waning-gibbous.jpg temp_super-moon.jpg
mv waxing-gibbous.jpg temp_crescent-moon.jpg

# 正しい名前に変更
mv temp_full-moon.jpg full-moon.jpg           # 満月
mv temp_moon-shadow.jpg moon-shadow.jpg       # 月影
mv temp_last-quarter.jpg last-quarter.jpg     # 下弦の月
mv temp_waning-gibbous.jpg waning-gibbous.jpg # 十六夜月
mv temp_new-moon.jpg new-moon.jpg             # 新月
mv temp_moon-mirror.jpg moon-mirror.jpg       # 月の鏡
mv temp_moonlight.jpg moonlight.jpg           # 月光
mv temp_eclipse.jpg eclipse.jpg               # 月食
mv temp_waning-crescent.jpg waning-crescent.jpg # 暁月
# moon-smile.jpg はそのまま（月の微笑み）
mv temp_waxing-gibbous.jpg waxing-gibbous.jpg # 十三夜月
mv temp_blood-moon.jpg blood-moon.jpg         # ブラッドムーン
mv temp_moon-tears.jpg moon-tears.jpg         # 月の涙
mv temp_first-quarter.jpg first-quarter.jpg   # 上弦の月
mv temp_blue-moon.jpg blue-moon.jpg           # ブルームーン
mv temp_super-moon.jpg super-moon.jpg         # スーパームーン
mv temp_crescent-moon.jpg crescent-moon.jpg   # 三日月

echo "タロットカード画像の正しいリネームが完了しました"
ls -la *.jpg