#!/usr/bin/env python3
"""
ブルームーンの画像の左側余白を追加でトリミング
"""

from PIL import Image
import os

def trim_blue_moon():
    """
    blue-moon.jpgの左側の余白を追加でトリミング
    """
    image_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/blue-moon.jpg"
    
    # 画像を開く
    img = Image.open(image_path)
    width, height = img.size
    
    print(f"現在のサイズ: {width}x{height}")
    
    # 画像をRGBに変換
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # 左側の余白を検出（左端から内側に向かってスキャン）
    pixels = img.load()
    left_crop = 0
    
    # 左端から50ピクセル分をチェック
    for x in range(50):
        # 縦方向の中央付近をサンプリング
        sample_points = [height // 4, height // 2, height * 3 // 4]
        is_background = True
        
        for y in sample_points:
            pixel = pixels[x, y]
            # 青い背景色でない場合（コンテンツがある）
            if pixel[0] > 50 or pixel[1] > 50:  # R,Gチャンネルが高い = 青くない
                is_background = False
                break
        
        if not is_background:
            left_crop = max(0, x - 2)  # 2ピクセル余裕を持たせる
            break
    
    print(f"左側から{left_crop}ピクセルをトリミング")
    
    # 右側も少しトリミング（バランスを取るため）
    right_crop = min(left_crop // 2, 20)
    
    # トリミング
    cropped = img.crop((left_crop, 0, width - right_crop, height))
    
    # 保存
    cropped.save(image_path, 'JPEG', quality=95)
    
    print(f"新しいサイズ: {cropped.size}")
    print(f"削減: {left_crop + right_crop}x0 ピクセル")

if __name__ == "__main__":
    trim_blue_moon()