#!/usr/bin/env python3
"""
残っている白い余白と枠を最終トリミング
"""

from PIL import Image
import os

def aggressive_trim(image_path, trim_amount):
    """
    画像の周囲から指定ピクセル分を積極的にトリミング
    """
    img = Image.open(image_path)
    width, height = img.size
    
    filename = os.path.basename(image_path)
    print(f"\n処理中: {filename}")
    print(f"  元のサイズ: {img.size}")
    
    # トリミング量（各辺で異なる場合がある）
    if isinstance(trim_amount, dict):
        left = trim_amount.get('left', 0)
        top = trim_amount.get('top', 0)
        right = width - trim_amount.get('right', 0)
        bottom = height - trim_amount.get('bottom', 0)
    else:
        # 全辺同じ場合
        left = trim_amount
        top = trim_amount
        right = width - trim_amount
        bottom = height - trim_amount
    
    # トリミング
    if left < right and top < bottom:
        cropped = img.crop((left, top, right, bottom))
        
        # 保存
        cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"  新しいサイズ: {cropped.size}")
        if isinstance(trim_amount, dict):
            print(f"  削減: 左={left}px, 上={top}px, 右={width-right}px, 下={height-bottom}px")
        else:
            print(f"  削減: {trim_amount}ピクセル（全辺）")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

def main():
    """
    白い余白が残っている画像を最終トリミング
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # 処理対象のファイルと各ファイルごとのトリミング量
    # より積極的にトリミング
    target_files = {
        "blue-moon.jpg": 35,           # 追加で35px
        "crescent-moon.jpg": 40,       # 追加で40px
        "moon-shadow.jpg": 35,         # 追加で35px
        "moon-smile.jpg": 30,          # 追加で30px
        "waning-crescent.jpg": 45,     # 追加で45px
        "moonlight.jpg": 35,           # 黒い枠を削除
    }
    
    processed_count = 0
    
    for filename, trim_pixels in target_files.items():
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            if aggressive_trim(file_path, trim_pixels):
                processed_count += 1
        else:
            print(f"ファイルが見つかりません: {filename}")
    
    print(f"\n完了！ {processed_count}個のファイルを追加トリミングしました。")

if __name__ == "__main__":
    main()