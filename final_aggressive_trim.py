#!/usr/bin/env python3
"""
残っている白い角と端を最終的に積極的トリミング
"""

from PIL import Image
import os

def final_trim(image_path, trim_pixels):
    """
    画像の周囲から指定ピクセル分を最終トリミング
    """
    img = Image.open(image_path)
    width, height = img.size
    
    filename = os.path.basename(image_path)
    print(f"\n処理中: {filename}")
    print(f"  元のサイズ: {img.size}")
    
    # トリミング
    left = trim_pixels
    top = trim_pixels
    right = width - trim_pixels
    bottom = height - trim_pixels
    
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
    白い角が残っている画像を最終トリミング
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # 処理対象のファイルと各ファイルごとのトリミング量
    # 角の丸みと白い端を完全に削除
    target_files = {
        "blood-moon.jpg": 20,          # 白い角を削除
        "first-quarter.jpg": 25,       # 白い角を削除
        "full-moon.jpg": 25,           # 白い角を削除
        "moon-mirror.jpg": 20,         # 白い端を削除
        "moon-smile.jpg": 15,          # 下部の白を削除
        "moon-tears.jpg": 25,          # 白い端を削除
        "waning-crescent.jpg": 15,     # 下部の白を削除
    }
    
    processed_count = 0
    
    for filename, trim_pixels in target_files.items():
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            if final_trim(file_path, trim_pixels):
                processed_count += 1
        else:
            print(f"ファイルが見つかりません: {filename}")
    
    print(f"\n完了！ {processed_count}個のファイルを最終トリミングしました。")

if __name__ == "__main__":
    main()