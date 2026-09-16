"""Compose a GPT Image illustration with exact typography for the 40×15 mm roll."""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'labels/fasteners/m3x6-countersunk-black'
source = Image.open(OUT/'screw-gpt-image.png').convert('RGBA')
white = Image.new('RGBA',source.size,'white')
white.alpha_composite(source)
icon = white.convert('RGB')
ink = icon.convert('L').point(lambda p: 255 if p < 180 else 0)
icon = icon.crop(ink.getbbox())
scale = 32
canvas = Image.new('RGB',(40*scale,15*scale),'white')
icon.thumbnail((10*scale,10*scale),Image.Resampling.LANCZOS)
canvas.paste(icon,(round(2.2*scale+(10*scale-icon.width)/2),round((15*scale-icon.height)/2)))
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',round(10.4*scale))
draw = ImageDraw.Draw(canvas)
text='M3×6'
b=font.getbbox(text)
x=13.4*scale+(24.2*scale-(b[2]-b[0]))/2
y=(15*scale-(b[3]-b[1]))/2
draw.text((x-b[0],y-b[1]),text,font=font,fill='black')
canvas.resize((960,360),Image.Resampling.LANCZOS).save(OUT/'label-v2.png',dpi=(609.6,609.6))
small=canvas.convert('L').resize((320,120),Image.Resampling.LANCZOS).point(lambda p:255 if p>=160 else 0,mode='1')
small.save(OUT/'label-v2-203dpi.png',dpi=(203.2,203.2))
print('Composed label-v2.png and label-v2-203dpi.png')
