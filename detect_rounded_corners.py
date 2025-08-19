#!/usr/bin/env python3
"""
角が丸い画像や白い余白が残っている画像を詳しく検出
"""

from PIL import Image
import numpy as np
import os
import glob

def check_corners_and_edges(image_path, corner_size=20, threshold=200):
    """
    画像の四隅と端を詳しくチェック
    """
    img = Image.open(image_path)
    img_array = np.array(img)
    height, width = img_array.shape[:2]
    
    filename = os.path.basename(image_path)
    issues = []
    
    # 四隅をチェック（角が丸いか、白いか）
    corners = {
        'top-left': img_array[:corner_size, :corner_size],
        'top-right': img_array[:corner_size, -corner_size:],
        'bottom-left': img_array[-corner_size:, :corner_size],
        'bottom-right': img_array[-corner_size:, -corner_size:]
    }
    
    for corner_name, corner_array in corners.items():
        # 角のピクセルの平均色をチェック
        mean_color = np.mean(corner_array)
        if mean_color > threshold:  # 白っぽい
            mean_rgb = np.mean(corner_array.reshape(-1, 3), axis=0).astype(int)
            issues.append(f"{corner_name}: 白い角 RGB{tuple(mean_rgb)}")
    
    # 各辺の端を詳しくチェック（1ピクセルから5ピクセルまで）
    for edge_width in [1, 3, 5]:
        edges = {
            f'top-{edge_width}px': img_array[:edge_width, :],
            f'bottom-{edge_width}px': img_array[-edge_width:, :],
            f'left-{edge_width}px': img_array[:, :edge_width],
            f'right-{edge_width}px': img_array[:, -edge_width:]
        }
        
        for edge_name, edge_array in edges.items():
            mean_color = np.mean(edge_array)
            if mean_color > threshold:
                mean_rgb = np.mean(edge_array.reshape(-1, 3), axis=0).astype(int)
                issues.append(f"{edge_name}: RGB{tuple(mean_rgb)}")
    
    if issues:
        print(f"\n{filename}:")
        for issue in issues:
            print(f"  {issue}")
        return True
    
    return False

def main():
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # すべてのJPG画像をチェック
    jpg_files = glob.glob(os.path.join(base_dir, "*.jpg"))
    
    print("角の丸みと白い余白を詳しくチェック中...")
    print("=" * 50)
    
    problem_files = []
    
    for file_path in sorted(jpg_files):
        if "original" not in file_path:
            if check_corners_and_edges(file_path):
                problem_files.append(os.path.basename(file_path))
    
    print("\n" + "=" * 50)
    print("=== 結果 ===")
    if problem_files:
        print(f"問題がある画像: {len(problem_files)}枚")
        for filename in problem_files:
            print(f"  - {filename}")
    else:
        print("問題がある画像はありません")

if __name__ == "__main__":
    main()