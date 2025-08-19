#!/bin/bash

cd public/images/tarot-cards/

# 画像ファイルを新しい名前にリネーム
# 月相カード
mv Gemini_Generated_Image_1xn55l1xn55l1xn5.jpeg moon-smile.jpg      # 月の微笑み（三日月の顔）
mv Gemini_Generated_Image_35oy1235oy1235oy.jpeg crescent-moon.jpg   # 三日月
mv Gemini_Generated_Image_byial0byial0byia.jpeg new-moon.jpg        # 新月（暗い月）
mv Gemini_Generated_Image_ckttrvckttrvcktt.jpeg full-moon.jpg       # 満月
mv Gemini_Generated_Image_dkya1ldkya1ldkya.jpeg first-quarter.jpg   # 上弦の月
mv Gemini_Generated_Image_edrtoyedrtoyedrt.jpeg waxing-gibbous.jpg  # 十三夜月
mv Gemini_Generated_Image_getj9jgetj9jgetj.jpeg waning-gibbous.jpg  # 十六夜月
mv Gemini_Generated_Image_i1u57i1u57i1u57i.jpeg last-quarter.jpg    # 下弦の月
mv Gemini_Generated_Image_ika7stika7stika7.jpeg waning-crescent.jpg # 暁月

# 月の神秘カード
mv Gemini_Generated_Image_leqtn5leqtn5leqt.jpeg moonlight.jpg       # 月光
mv Gemini_Generated_Image_n86ny7n86ny7n86n.jpeg moon-shadow.jpg     # 月影
mv Gemini_Generated_Image_ncoatzncoatzncoa.jpeg moon-tears.jpg      # 月の涙
mv Gemini_Generated_Image_on1x2jon1x2jon1x.jpeg eclipse.jpg         # 月食
mv Gemini_Generated_Image_pp4wa2pp4wa2pp4w.jpeg super-moon.jpg      # スーパームーン
mv Gemini_Generated_Image_s85l7zs85l7zs85l.jpeg blue-moon.jpg       # ブルームーン
mv Gemini_Generated_Image_u3o3jgu3o3jgu3o3.jpeg moon-mirror.jpg     # 月の鏡
mv Gemini_Generated_Image_wjsg12wjsg12wjsg.jpeg blood-moon.jpg      # ブラッドムーン
mv Gemini_Generated_Image_yb8lmdyb8lmdyb8l.jpeg moonlight-2.jpg     # 予備

echo "タロットカード画像のリネームが完了しました"
ls -la *.jpg