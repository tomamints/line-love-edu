#!/usr/bin/env python3
"""
タロットカード画像をWebP形式に変換して最適化
"""

from PIL import Image
import os
import glob

def convert_to_webp():
    """
    すべてのタロットカード画像をWebP形式に変換
    """
    base_dir = "/Users/shiraitouma/daniel/line-love-edu/public/images/tarot-cards"
    
    # すべてのJPGとPNG画像を取得
    image_files = glob.glob(os.path.join(base_dir, "*.jpg")) + glob.glob(os.path.join(base_dir, "*.png"))
    
    # originalは除外
    image_files = [f for f in image_files if "original" not in f]
    
    print("=== タロットカード画像をWebP形式に変換 ===\n")
    
    for image_path in sorted(image_files):
        filename = os.path.basename(image_path)
        name_without_ext = os.path.splitext(filename)[0]
        webp_path = os.path.join(base_dir, f"{name_without_ext}.webp")
        
        try:
            # 画像を開く
            img = Image.open(image_path)
            
            # RGBAに変換（透明度を保持）
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # WebP形式で保存（品質85、ロスレス圧縮なし）
            img.save(webp_path, 'WEBP', quality=85, method=6)
            
            # ファイルサイズを比較
            original_size = os.path.getsize(image_path)
            webp_size = os.path.getsize(webp_path)
            reduction = ((original_size - webp_size) / original_size) * 100
            
            print(f"✓ {filename} → {name_without_ext}.webp")
            print(f"  元: {original_size:,} bytes → WebP: {webp_size:,} bytes ({reduction:.1f}%削減)")
            
        except Exception as e:
            print(f"✗ {filename}: エラー - {e}")
    
    # カード裏面も変換
    back_path = "/Users/shiraitouma/daniel/line-love-edu/public/images/moon-card-back-v2.jpg"
    if os.path.exists(back_path):
        webp_path = back_path.replace('.jpg', '.webp')
        try:
            img = Image.open(back_path)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            img.save(webp_path, 'WEBP', quality=85, method=6)
            
            original_size = os.path.getsize(back_path)
            webp_size = os.path.getsize(webp_path)
            reduction = ((original_size - webp_size) / original_size) * 100
            
            print(f"\n✓ moon-card-back-v2.jpg → moon-card-back-v2.webp")
            print(f"  元: {original_size:,} bytes → WebP: {webp_size:,} bytes ({reduction:.1f}%削減)")
        except Exception as e:
            print(f"✗ moon-card-back-v2.jpg: エラー - {e}")
    
    print("\n=== 変換完了 ===")
    print("注意: WebP画像を使用するには、JavaScriptとHTMLのパスを更新する必要があります")

if __name__ == "__main__":
    convert_to_webp()