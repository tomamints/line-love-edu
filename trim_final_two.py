#!/usr/bin/env python3
"""
new-moonとblood-moonの最終トリミング
"""

from PIL import Image
import os

def trim_image(image_path, trim_pixels, is_png=False):
    """
    画像をトリミング
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
        if is_png:
            cropped.save(image_path, 'PNG', optimize=True)
        else:
            cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"  新しいサイズ: {cropped.size}")
        print(f"  削減: {trim_pixels}ピクセル（全辺）")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

def main():
    """
    new-moonとblood-moonを追加トリミング
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # new-moon.png - もう少しトリミング
    new_moon_path = os.path.join(base_dir, "new-moon.png")
    if os.path.exists(new_moon_path):
        trim_image(new_moon_path, 20, is_png=True)  # 追加で20px
    
    # blood-moon.jpg - 白い端を削除
    blood_moon_path = os.path.join(base_dir, "blood-moon.jpg")
    if os.path.exists(blood_moon_path):
        trim_image(blood_moon_path, 25, is_png=False)  # 追加で25px
    
    print("\n完了！")

if __name__ == "__main__":
    main()