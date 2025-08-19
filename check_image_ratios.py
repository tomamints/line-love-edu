#!/usr/bin/env python3
"""
すべてのタロットカード画像の縦横比を確認
"""

from PIL import Image
import os
import glob

def check_all_ratios():
    """
    すべての画像の縦横比を確認
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # すべてのJPGとPNG画像を取得
    image_files = glob.glob(os.path.join(base_dir, "*.jpg")) + glob.glob(os.path.join(base_dir, "*.png"))
    
    # originalは除外
    image_files = [f for f in image_files if "original" not in f]
    
    ratios = []
    
    print("=== タロットカード画像の縦横比 ===\n")
    print(f"{'ファイル名':<30} {'サイズ':<15} {'縦横比（幅:高さ）':<15}")
    print("-" * 60)
    
    for image_path in sorted(image_files):
        filename = os.path.basename(image_path)
        img = Image.open(image_path)
        width, height = img.size
        ratio = width / height
        
        ratios.append(ratio)
        
        print(f"{filename:<30} {width}x{height:<15} 1:{1/ratio:.2f}")
    
    # カード裏面も確認
    back_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/moon-card-back-v2.jpg"
    if os.path.exists(back_path):
        img = Image.open(back_path)
        width, height = img.size
        ratio = width / height
        ratios.append(ratio)
        print(f"{'moon-card-back-v2.jpg':<30} {width}x{height:<15} 1:{1/ratio:.2f}")
    
    print("\n=== 統計 ===")
    avg_ratio = sum(ratios) / len(ratios)
    min_ratio = min(ratios)
    max_ratio = max(ratios)
    
    print(f"平均縦横比: 1:{1/avg_ratio:.2f}")
    print(f"最小縦横比: 1:{1/min_ratio:.2f}")
    print(f"最大縦横比: 1:{1/max_ratio:.2f}")
    
    print("\n=== 現在のCSS設定 ===")
    print("カード表示サイズ: 150x215px (縦横比 1:1.43)")
    print("スマホ: 120x160px (縦横比 1:1.33)")
    
    print("\n=== 推奨 ===")
    # 最も一般的な縦横比を見つける
    common_ratio = 1/avg_ratio
    if 1.4 <= common_ratio <= 1.5:
        print("推奨縦横比: 2:3 (1:1.5)")
        print("推奨カードサイズ: 150x225px または 100x150px")
    elif 1.3 <= common_ratio < 1.4:
        print("推奨縦横比: 3:4 (1:1.33)")  
        print("推奨カードサイズ: 150x200px または 120x160px")
    else:
        print(f"画像の平均縦横比は 1:{common_ratio:.2f}")
        print(f"推奨カードサイズ: 150x{int(150*common_ratio)}px")

if __name__ == "__main__":
    check_all_ratios()