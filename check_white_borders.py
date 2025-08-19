#!/usr/bin/env python3
"""
白い余白が残っている画像を検出
"""

from PIL import Image
import numpy as np
import os
import glob

def check_white_borders(image_path, threshold=200, edge_pixels=10):
    """
    画像の端に白い余白があるかチェック
    """
    img = Image.open(image_path)
    img_array = np.array(img)
    height, width = img_array.shape[:2]
    
    filename = os.path.basename(image_path)
    
    # 各辺の端のピクセルをチェック
    edges = {
        'top': img_array[:edge_pixels, :],
        'bottom': img_array[-edge_pixels:, :],
        'left': img_array[:, :edge_pixels],
        'right': img_array[:, -edge_pixels:]
    }
    
    white_edges = []
    for edge_name, edge_array in edges.items():
        # RGB値の平均が閾値以上なら白い余白と判定
        mean_color = np.mean(edge_array)
        if mean_color > threshold:
            white_edges.append(edge_name)
    
    if white_edges:
        print(f"{filename}: 白い余白あり - {', '.join(white_edges)}")
        # 各辺の平均色を表示
        for edge_name in white_edges:
            edge_array = edges[edge_name]
            mean_rgb = np.mean(edge_array.reshape(-1, 3), axis=0).astype(int)
            print(f"  {edge_name}: RGB{tuple(mean_rgb)}")
        return True
    
    return False

def main():
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # すべてのJPG画像をチェック
    jpg_files = glob.glob(os.path.join(base_dir, "*.jpg"))
    
    print("白い余白をチェック中...\n")
    
    files_with_white_borders = []
    
    for file_path in sorted(jpg_files):
        if "original" not in file_path:
            if check_white_borders(file_path):
                files_with_white_borders.append(os.path.basename(file_path))
                print()
    
    print("\n=== 結果 ===")
    if files_with_white_borders:
        print(f"白い余白がある画像: {len(files_with_white_borders)}枚")
        for filename in files_with_white_borders:
            print(f"  - {filename}")
    else:
        print("白い余白がある画像はありません")

if __name__ == "__main__":
    main()