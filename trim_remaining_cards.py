#!/usr/bin/env python3
"""
残りのタロットカード画像の余白を積極的にトリミング
"""

from PIL import Image
import numpy as np
import os

def detect_border_color(img_array):
    """
    画像の枠の色を検出（四隅の色から判定）
    """
    h, w = img_array.shape[:2]
    
    # 四隅の色を取得
    corners = [
        img_array[0, 0],           # 左上
        img_array[0, w-1],         # 右上
        img_array[h-1, 0],         # 左下
        img_array[h-1, w-1]        # 右下
    ]
    
    # 最も一般的な色を枠の色とする
    return np.mean(corners, axis=0).astype(int)

def find_content_bounds_aggressive(img_array, border_color, tolerance=40):
    """
    画像の実際のコンテンツ境界を見つける（より積極的に）
    """
    h, w = img_array.shape[:2]
    
    # 各ピクセルと枠色との差を計算
    diff = np.sqrt(np.sum((img_array - border_color) ** 2, axis=2))
    
    # コンテンツがあるピクセルを見つける
    content_mask = diff > tolerance
    
    # 各行・列にコンテンツがあるか確認
    content_rows = np.any(content_mask, axis=1)
    content_cols = np.any(content_mask, axis=0)
    
    # コンテンツの境界を見つける
    rows = np.where(content_rows)[0]
    cols = np.where(content_cols)[0]
    
    if len(rows) > 0 and len(cols) > 0:
        return cols[0], rows[0], cols[-1], rows[-1]
    
    return None

def trim_card(image_path):
    """
    個別のカード画像をトリミング
    """
    img = Image.open(image_path)
    img_array = np.array(img)
    
    filename = os.path.basename(image_path)
    print(f"\n処理中: {filename}")
    print(f"  元のサイズ: {img.size}")
    
    # 枠の色を検出
    border_color = detect_border_color(img_array)
    print(f"  検出された枠色: RGB{tuple(border_color)}")
    
    # コンテンツ境界を見つける
    bounds = find_content_bounds_aggressive(img_array, border_color)
    
    if bounds:
        left, top, right, bottom = bounds
        
        # 少し余裕を持たせる（1-2ピクセル）
        margin = 2
        left = max(0, left - margin)
        top = max(0, top - margin)
        right = min(img.width - 1, right + margin)
        bottom = min(img.height - 1, bottom + margin)
        
        # トリミング幅を確認
        crop_left = left
        crop_top = top
        crop_right = img.width - right - 1
        crop_bottom = img.height - bottom - 1
        
        # 実際にトリミングする価値があるか確認（10ピクセル以上の余白がある場合のみ）
        if crop_left > 10 or crop_top > 10 or crop_right > 10 or crop_bottom > 10:
            cropped = img.crop((left, top, right + 1, bottom + 1))
            
            # 保存
            cropped.save(image_path, 'JPEG', quality=95)
            
            print(f"  新しいサイズ: {cropped.size}")
            print(f"  削減: 左={crop_left}px, 上={crop_top}px, 右={crop_right}px, 下={crop_bottom}px")
            return True
        else:
            print(f"  余白が少ないためスキップ（左={crop_left}, 上={crop_top}, 右={crop_right}, 下={crop_bottom}）")
            return False
    else:
        print("  コンテンツ境界が見つかりませんでした")
        return False

def main():
    """
    指定されたカードを処理
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # 処理対象のファイル
    target_files = [
        "crescent-moon.jpg",   # 三日月
        "eclipse.jpg",         # 月食
        "waning-gibbous.jpg",  # 十六夜
        "moon-smile.jpg",      # 月の微笑み
        "moonlight.jpg"        # 月光
    ]
    
    processed_count = 0
    
    for filename in target_files:
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            if trim_card(file_path):
                processed_count += 1
        else:
            print(f"ファイルが見つかりません: {filename}")
    
    print(f"\n完了！ {processed_count}個のファイルをトリミングしました。")

if __name__ == "__main__":
    main()