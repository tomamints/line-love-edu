#!/usr/bin/env python3
"""
blood-moonの下部の白い部分を追加削除
"""

from PIL import Image
import os

def final_trim_bottom():
    """
    blood-moonの下部をさらにトリミング
    """
    image_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/blood-moon.jpg"
    
    img = Image.open(image_path)
    width, height = img.size
    
    print(f"処理中: blood-moon.jpg")
    print(f"  元のサイズ: {img.size}")
    
    # 下部をさらに30px削除
    bottom_extra_trim = 30
    
    left = 0
    top = 0
    right = width
    bottom = height - bottom_extra_trim
    
    if top < bottom:
        cropped = img.crop((left, top, right, bottom))
        
        # 保存
        cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"  新しいサイズ: {cropped.size}")
        print(f"  下部から追加で{bottom_extra_trim}px削除")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

if __name__ == "__main__":
    if final_trim_bottom():
        print("\n完了！ blood-moonの下部の白い部分を削除しました。")