"""Reusable 40×15 mm fastener label. Requires Pillow; never sends a print job."""
import argparse
import math
from pathlib import Path
from xml.sax.saxutils import escape
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

def render(text, output):
    output.mkdir(parents=True, exist_ok=True)
    scale = 32
    canvas = Image.new('RGB', (40 * scale, 15 * scale), 'white')
    draw = ImageDraw.Draw(canvas)
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="40mm" height="15mm" viewBox="0 0 40 15">',
           '<title>' + escape(text) + ' — countersunk screw</title>', '<rect width="40" height="15" fill="white"/>']
    angle = math.radians(-38)
    def transform(x, y):
        return (7.0 + x * math.cos(angle) - y * math.sin(angle),
                7.5 + x * math.sin(angle) + y * math.cos(angle))
    def polygon(points, fill):
        pts = [transform(x,y) for x,y in points]
        draw.polygon([(round(x*scale),round(y*scale)) for x,y in pts], fill=fill)
        svg.append('<polygon points="'+' '.join(f'{x:.4f},{y:.4f}' for x,y in pts)+'" fill="'+fill+'"/>')
    # Broad flat head, conical underside, short blunt machine-screw shaft.
    polygon([(-3.15,-3.7),(3.15,-3.7),(3.15,-3.25),(1.5,-1.6),
             (1.5,3.25),(1.15,3.6),(-1.15,3.6),(-1.5,3.25),
             (-1.5,-1.6),(-3.15,-3.25)], 'black')
    # Clear negative-space thread grooves; deliberately simplified for thermal output.
    for y in [-0.9,0.15,1.2,2.25]:
        polygon([(-1.56,y),(1.56,y-0.62),(1.56,y-0.25),(-1.56,y+0.37)], 'white')
    size = 10.4
    while True:
        font = ImageFont.truetype(FONT, round(size*scale))
        box = font.getbbox(text)
        if (box[2]-box[0])/scale <= 24.2:
            break
        size -= 0.1
        if size < 5:
            raise ValueError('Text too long for this template')
    width = (box[2]-box[0])/scale
    x = 13.4 + (24.2-width)/2
    y = (15-(box[3]-box[1])/scale)/2
    draw.text((x*scale-box[0],y*scale-box[1]),text,font=font,fill='black')
    baseline = y + (font.getmetrics()[0]-box[1])/scale
    svg.append(f'<text x="{x:.4f}" y="{baseline:.4f}" font-family="Arial" font-weight="700" font-size="{round(size*scale)/scale:.4f}" fill="black">{escape(text)}</text>')
    svg.append('</svg>')
    (output/'label.svg').write_text('\n'.join(svg)+'\n')
    canvas.resize((960,360),Image.Resampling.LANCZOS).save(output/'label.png',dpi=(609.6,609.6))
    # Generic nominal 203 dpi draft; hardware printable width is set after model identification.
    small = canvas.convert('L').resize((320,120),Image.Resampling.LANCZOS).point(lambda p: 255 if p >= 160 else 0,mode='1')
    small.save(output/'label-203dpi.png',dpi=(203.2,203.2))
    print(f'{text}: {output}, 40×15 mm; PNG 960×360; monochrome draft 320×120')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--text',default='M3×6')
    parser.add_argument('--output',type=Path,default=ROOT/'labels/fasteners/m3x6-countersunk-black')
    args = parser.parse_args()
    render(args.text,args.output)
