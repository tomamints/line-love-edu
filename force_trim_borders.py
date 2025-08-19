#!/usr/bin/env python3
"""
デザインの枠も含めて強制的にトリミング
"""

from PIL import Image
import os

def force_trim_border(image_path, pixels_to_trim=50):
    """
    画像の周囲から指定ピクセル分を強制的にトリミング
    """
    img = Image.open(image_path)
    width, height = img.size
    
    filename = os.path.basename(image_path)
    print(f"\n処理中: {filename}")
    print(f"  元のサイズ: {img.size}")
    
    # 新しい境界を計算
    left = pixels_to_trim
    top = pixels_to_trim
    right = width - pixels_to_trim
    bottom = height - pixels_to_trim
    
    # トリミング
    if left < right and top < bottom:
        cropped = img.crop((left, top, right, bottom))
        
        # 保存
        cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"  新しいサイズ: {cropped.size}")
        print(f"  各辺から{pixels_to_trim}ピクセルをトリミング")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

def main():
    """
    特定のカードの枠を強制的にトリミング
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # 処理対象のファイルと各ファイルごとのトリミング量
    target_files = {
        "crescent-moon.jpg": 40,    # 三日月 - 黒い枠を削除
        "eclipse.jpg": 45,          # 月食 - ベージュの枠を削除
        "waning-gibbous.jpg": 35,   # 十六夜 - 黒い枠を削除
        "moon-smile.jpg": 45,       # 月の微笑み - ベージュと黒の二重枠を削除
    }
    
    processed_count = 0
    
    for filename, trim_pixels in target_files.items():
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            if force_trim_border(file_path, trim_pixels):
                processed_count += 1
        else:
            print(f"ファイルが見つかりません: {filename}")
    
    print(f"\n完了！ {processed_count}個のファイルをトリミングしました。")

if __name__ == "__main__":
    main()