#!/usr/bin/env python3
"""
last-quarterとmoon-shadowの枠をトリミング
"""

from PIL import Image
import os

def trim_card_borders(image_path, trim_pixels):
    """
    画像の周囲から指定ピクセル分をトリミング
    """
    img = Image.open(image_path)
    width, height = img.size
    
    filename = os.path.basename(image_path)
    print(f"\n処理中: {filename}")
    print(f"  元のサイズ: {img.size}")
    
    # 新しい境界を計算
    left = trim_pixels
    top = trim_pixels
    right = width - trim_pixels
    bottom = height - trim_pixels
    
    # トリミング
    if left < right and top < bottom:
        cropped = img.crop((left, top, right, bottom))
        
        # 保存
        cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"  新しいサイズ: {cropped.size}")
        print(f"  削減: {trim_pixels}ピクセル（全辺）")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

def main():
    """
    last-quarterとmoon-shadowをトリミング
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # 処理対象のファイルと各ファイルごとのトリミング量
    target_files = {
        "last-quarter.jpg": 45,    # 下弦の月 - 黒とベージュの二重枠を削除
        "moon-shadow.jpg": 40,     # 月影 - 黒い枠を削除
    }
    
    processed_count = 0
    
    for filename, trim_pixels in target_files.items():
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            if trim_card_borders(file_path, trim_pixels):
                processed_count += 1
        else:
            print(f"ファイルが見つかりません: {filename}")
    
    print(f"\n完了！ {processed_count}個のファイルをトリミングしました。")

if __name__ == "__main__":
    main()