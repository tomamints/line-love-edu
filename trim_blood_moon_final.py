#!/usr/bin/env python3
"""
blood-moonの上下の白い部分を完全に削除
"""

from PIL import Image
import numpy as np
import os

def analyze_edges(image_path):
    """
    画像の端を詳しく分析
    """
    img = Image.open(image_path)
    img_array = np.array(img)
    height, width = img_array.shape[:2]
    
    print(f"画像サイズ: {width}x{height}")
    
    # 上端と下端の色を詳しくチェック
    edges_to_check = [
        ('上端1px', img_array[0, :]),
        ('上端5px平均', np.mean(img_array[:5, :], axis=0)),
        ('上端10px平均', np.mean(img_array[:10, :], axis=0)),
        ('下端1px', img_array[-1, :]),
        ('下端5px平均', np.mean(img_array[-5:, :], axis=0)),
        ('下端10px平均', np.mean(img_array[-10:, :], axis=0)),
    ]
    
    for name, edge_data in edges_to_check:
        mean_color = np.mean(edge_data, axis=0).astype(int)
        print(f"{name}: RGB{tuple(mean_color)}")
        if np.mean(mean_color) > 200:  # 白っぽい
            print(f"  → 白い部分検出！")

def aggressive_trim_blood_moon():
    """
    blood-moonの上下を積極的にトリミング
    """
    image_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/blood-moon.jpg"
    
    img = Image.open(image_path)
    width, height = img.size
    
    print(f"\n処理中: blood-moon.jpg")
    print(f"  元のサイズ: {img.size}")
    
    # 上下を多めにトリミング、左右は少なめに
    top_trim = 35      # 上を35px削除
    bottom_trim = 30   # 下を30px削除
    side_trim = 15     # 左右を15px削除
    
    left = side_trim
    top = top_trim
    right = width - side_trim
    bottom = height - bottom_trim
    
    if left < right and top < bottom:
        cropped = img.crop((left, top, right, bottom))
        
        # 保存
        cropped.save(image_path, 'JPEG', quality=95)
        
        print(f"  新しいサイズ: {cropped.size}")
        print(f"  削減: 上={top_trim}px, 下={bottom_trim}px, 左右={side_trim}px")
        return True
    else:
        print(f"  画像が小さすぎてトリミングできません")
        return False

def main():
    """
    blood-moonの白い部分を完全に削除
    """
    print("=== 現在の状態を分析 ===")
    analyze_edges("/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/blood-moon.jpg")
    
    print("\n=== トリミング実行 ===")
    if aggressive_trim_blood_moon():
        print("\n完了！ blood-moonの白い部分を削除しました。")
        
        print("\n=== トリミング後の状態 ===")
        analyze_edges("/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards/blood-moon.jpg")

if __name__ == "__main__":
    main()