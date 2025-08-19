#!/usr/bin/env python3
"""
タロットカード画像の余白を自動的にトリミングするスクリプト
"""

from PIL import Image
import os
import glob

def trim_whitespace(image_path, fuzz=10):
    """
    画像の余白（ベージュ色の枠）をトリミング
    
    Args:
        image_path: 画像ファイルのパス
        fuzz: 色の許容誤差（0-255）
    """
    img = Image.open(image_path)
    
    # 画像をRGBAに変換（透明度を扱うため）
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 画像のピクセルデータを取得
    pixels = img.load()
    width, height = img.size
    
    # 左上のピクセルの色を背景色とする（ベージュ色の枠）
    bg_color = pixels[0, 0]
    
    # トリミング範囲を見つける
    left = width
    top = height
    right = 0
    bottom = 0
    
    for x in range(width):
        for y in range(height):
            pixel = pixels[x, y]
            # 背景色と異なるピクセルを見つける
            if not all(abs(pixel[i] - bg_color[i]) <= fuzz for i in range(min(len(pixel), len(bg_color)))):
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)
    
    # 少し余裕を持たせる（完全にトリミングしすぎないように）
    margin = 2
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(width - 1, right + margin)
    bottom = min(height - 1, bottom + margin)
    
    # トリミング
    if left < right and top < bottom:
        cropped = img.crop((left, top, right + 1, bottom + 1))
        return cropped
    else:
        return img

def process_tarot_cards():
    """
    tarot-cardsディレクトリ内のすべての画像を処理
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # バックアップディレクトリを作成
    backup_dir = os.path.join(base_dir, "original_backup")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    # すべてのJPGとPNG画像を処理
    image_patterns = ["*.jpg", "*.jpeg", "*.png"]
    
    for pattern in image_patterns:
        for image_path in glob.glob(os.path.join(base_dir, pattern)):
            filename = os.path.basename(image_path)
            
            # originalバックアップは処理しない
            if "original" in filename or "backup" in filename:
                continue
                
            print(f"処理中: {filename}")
            
            try:
                # バックアップを作成
                backup_path = os.path.join(backup_dir, filename)
                if not os.path.exists(backup_path):
                    img = Image.open(image_path)
                    img.save(backup_path)
                    print(f"  バックアップ作成: {backup_path}")
                
                # 画像をトリミング
                trimmed = trim_whitespace(image_path)
                
                # 元のファイルを上書き保存
                if image_path.lower().endswith('.png'):
                    trimmed.save(image_path, 'PNG')
                else:
                    # JPEGの場合はRGBに変換
                    if trimmed.mode == 'RGBA':
                        rgb_img = Image.new('RGB', trimmed.size, (26, 26, 46))  # 背景色
                        rgb_img.paste(trimmed, mask=trimmed.split()[3] if len(trimmed.split()) == 4 else None)
                        trimmed = rgb_img
                    trimmed.save(image_path, 'JPEG', quality=95)
                
                # サイズ情報を表示
                original = Image.open(backup_path)
                print(f"  元のサイズ: {original.size}")
                print(f"  新しいサイズ: {trimmed.size}")
                print(f"  削減: {original.size[0] - trimmed.size[0]}x{original.size[1] - trimmed.size[1]} ピクセル")
                
            except Exception as e:
                print(f"  エラー: {e}")
    
    print("\n完了！バックアップは original_backup フォルダに保存されています。")

if __name__ == "__main__":
    process_tarot_cards()