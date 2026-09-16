"""Pack two 40×15 mm, 8 dpmm labels into one 40×30 mm feed unit without scaling.

Requires two explicit images; never silently fill an unused half with a duplicate.
Output is a candidate until the stock's physical pitch is verified in NIIMBOT.
"""
import argparse
from pathlib import Path
from PIL import Image


def compose(first: Path, second: Path, output: Path):
    labels = []
    for path in (first, second):
        with Image.open(path) as image:
            if image.size != (320, 120):
                raise ValueError(f'{path}: expected 320×120 pixels, got {image.size}; resample at the source, never during packing')
            if image.mode != '1':
                raise ValueError(f'{path}: expected a finished monochrome print raster (mode 1)')
            labels.append(image.copy())
    pair = Image.new('1', (320, 240), 1)
    pair.paste(labels[0], (0, 0))
    pair.paste(labels[1], (0, 120))
    output.parent.mkdir(parents=True, exist_ok=True)
    pair.save(output, dpi=(203.2, 203.2))
    with Image.open(output) as saved:
        assert saved.crop((0, 0, 320, 120)).tobytes() == labels[0].tobytes()
        assert saved.crop((0, 120, 320, 240)).tobytes() == labels[1].tobytes()
    print(f'{output}: 320×240 pixels; both halves preserved pixel-for-pixel; NO printing performed')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('first', type=Path)
    parser.add_argument('second', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    compose(args.first, args.second, args.output)
