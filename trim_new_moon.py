#!/usr/bin/env python3
"""
new-moon.pngの余白をトリミング
"""

from PIL import Image
import os

def trim_new_moon():
    """
    new-moon.pngの余白をトリミング
    """
    image_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/new-moon.png"
    
    # 画像を開く
    img = Image.open(image_path)
    width, height = img.size
    
    print(f"処理中: new-moon.png")
    print(f"  元のサイズ: {img.size}")
    print(f"  モード: {img.mode}")
    
    # PNG画像なので透明度を考慮
    if img.mode == 'RGBA':
        # RGBAの場合、透明度チャンネルも考慮
        img_rgba = img
    else:
        # RGBの場合はそのまま
        img_rgba = img.convert('RGBA')
    
    # 余白をトリミング（30ピクセル削除）
    trim_pixels = 30
    left = trim_pixels
    top = trim_pixels
    right = width - trim_pixels
    bottom = height - trim_pixels
    
    if left < right and top < bottom:
        cropped = img_rgba.crop((left, top, right, bottom))
        
        # PNGとして保存
        cropped.save(image_path, 'PNG', optimize=True)
        
        print(f"  新しいサイズ: {cropped.size}")
        print(f"  削減: {trim_pixels}ピクセル（全辺）")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

if __name__ == "__main__":
    if trim_new_moon():
        print("\n完了！ new-moon.pngをトリミングしました。")
    else:
        print("\nトリミングできませんでした。")