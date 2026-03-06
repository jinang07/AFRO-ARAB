from PIL import Image
import os
import sys

base_dir = r"c:\Users\Jinang Jain\OneDrive\Desktop\AABA_FINAL"
input_path = os.path.join(base_dir, 'frontend', 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher_foreground.png')
output_dir = os.path.join(base_dir, 'frontend', 'android', 'app', 'src', 'main', 'res', 'drawable')

os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, 'ic_stat_name.png')

try:
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[3] > 0:
            newData.append((255, 255, 255, item[3]))
        else:
            newData.append((255, 255, 255, 0))
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Successfully saved transparent white icon to {output_path}")
except Exception as e:
    print(f"Error: {e}")
