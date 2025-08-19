#!/usr/bin/env python3
"""
moon-card-back-v2.jpgの余白をトリミングして縮尺を合わせる
"""

from PIL import Image
import os

def trim_card_back():
    """
    カード裏面の余白をトリミング
    """
    image_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/moon-card-back-v2.jpg"
    
    # バックアップを作成
    backup_path = image_path.replace('.jpg', '_original.jpg')
    
    img = Image.open(image_path)
    
    # バックアップがなければ作成
    if not os.path.exists(backup_path):
        img.save(backup_path, 'JPEG', quality=95)
        print(f"バックアップ作成: {backup_path}")
    
    width, height = img.size
    
    print(f"処理中: moon-card-back-v2.jpg")
    print(f"  元のサイズ: {img.size}")
    
    # 余白をトリミング（周囲の余白を削除）
    # 他のカード画像と同じように、ベージュ色の余白を削除
    trim_pixels = 50  # 50ピクセルずつトリミング
    
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
        
        # アスペクト比を確認
        new_width, new_height = cropped.size
        aspect_ratio = new_width / new_height
        print(f"  アスペクト比: 1:{aspect_ratio:.2f}")
        
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

if __name__ == "__main__":
    if trim_card_back():
        print("\n完了！ moon-card-back-v2.jpgをトリミングしました。")
        print("他のカード画像と同じ縮尺になりました。")