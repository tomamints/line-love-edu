#!/usr/bin/env python3
"""
ブルームーンの画像を再度トリミング（より積極的に）
"""

from PIL import Image
import numpy as np

def find_content_bounds(img_array):
    """
    画像の実際のコンテンツ境界を見つける
    """
    # グレースケールに変換
    if len(img_array.shape) == 3:
        gray = np.mean(img_array, axis=2)
    else:
        gray = img_array
    
    # エッジ検出のための閾値（背景との差）
    threshold = 30
    
    # 各行・列の変化量を計算
    row_diff = np.max(gray, axis=1) - np.min(gray, axis=1)
    col_diff = np.max(gray, axis=0) - np.min(gray, axis=0)
    
    # コンテンツがある行・列を見つける
    content_rows = np.where(row_diff > threshold)[0]
    content_cols = np.where(col_diff > threshold)[0]
    
    if len(content_rows) > 0 and len(content_cols) > 0:
        return (
            content_cols[0],
            content_rows[0],
            content_cols[-1],
            content_rows[-1]
        )
    return None

def trim_blue_moon_aggressive():
    """
    blue-moon.jpgを積極的にトリミング
    """
    image_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/blue-moon.jpg"
    
    # 画像を開く
    img = Image.open(image_path)
    img_array = np.array(img)
    
    print(f"現在のサイズ: {img.size}")
    
    # コンテンツ境界を見つける
    bounds = find_content_bounds(img_array)
    
    if bounds:
        left, top, right, bottom = bounds
        
        # 少し余裕を持たせる
        margin = 10
        left = max(0, left - margin)
        top = max(0, top - margin)
        right = min(img.width - 1, right + margin)
        bottom = min(img.height - 1, bottom + margin)
        
        print(f"トリミング範囲: left={left}, top={top}, right={right}, bottom={bottom}")
        
        # トリミング
        cropped = img.crop((left, top, right + 1, bottom + 1))
        
        # 保存
        cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"新しいサイズ: {cropped.size}")
        print(f"削減: 左={left}px, 上={top}px, 右={img.width-right-1}px, 下={img.height-bottom-1}px")
    else:
        print("コンテンツ境界が見つかりませんでした")

if __name__ == "__main__":
    trim_blue_moon_aggressive()