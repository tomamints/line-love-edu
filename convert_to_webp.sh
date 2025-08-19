#!/bin/bash

# タロットカード画像をWebP形式に変換

echo "=== タロットカード画像をWebP形式に変換 ==="
echo ""

# タロットカード画像のディレクトリ
TAROT_DIR="public/images/tarot-cards"

# JPGファイルを変換
for file in $TAROT_DIR/*.jpg; do
    if [[ -f "$file" && ! "$file" == *"original"* ]]; then
        filename=$(basename "$file" .jpg)
        output="$TAROT_DIR/$filename.webp"
        
        echo "変換中: $filename.jpg → $filename.webp"
        cwebp -q 85 "$file" -o "$output" 2>/dev/null
        
        # ファイルサイズを比較
        original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        webp_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        
        if [[ -n "$original_size" && -n "$webp_size" ]]; then
            reduction=$(( (original_size - webp_size) * 100 / original_size ))
            echo "  サイズ: $original_size bytes → $webp_size bytes (${reduction}%削減)"
        fi
    fi
done

# PNGファイルを変換
for file in $TAROT_DIR/*.png; do
    if [[ -f "$file" && ! "$file" == *"original"* ]]; then
        filename=$(basename "$file" .png)
        output="$TAROT_DIR/$filename.webp"
        
        echo "変換中: $filename.png → $filename.webp"
        cwebp -q 85 "$file" -o "$output" 2>/dev/null
        
        # ファイルサイズを比較
        original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        webp_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        
        if [[ -n "$original_size" && -n "$webp_size" ]]; then
            reduction=$(( (original_size - webp_size) * 100 / original_size ))
            echo "  サイズ: $original_size bytes → $webp_size bytes (${reduction}%削減)"
        fi
    fi
done

# カード裏面も変換
BACK_FILE="public/images/moon-card-back-v2.jpg"
if [[ -f "$BACK_FILE" ]]; then
    echo "変換中: moon-card-back-v2.jpg → moon-card-back-v2.webp"
    cwebp -q 85 "$BACK_FILE" -o "public/images/moon-card-back-v2.webp" 2>/dev/null
    
    original_size=$(stat -f%z "$BACK_FILE" 2>/dev/null || stat -c%s "$BACK_FILE" 2>/dev/null)
    webp_size=$(stat -f%z "public/images/moon-card-back-v2.webp" 2>/dev/null || stat -c%s "public/images/moon-card-back-v2.webp" 2>/dev/null)
    
    if [[ -n "$original_size" && -n "$webp_size" ]]; then
        reduction=$(( (original_size - webp_size) * 100 / original_size ))
        echo "  サイズ: $original_size bytes → $webp_size bytes (${reduction}%削減)"
    fi
fi

echo ""
echo "=== 変換完了 ==="
echo "注意: WebP画像を使用するには、JavaScriptとHTMLのパスを更新する必要があります"