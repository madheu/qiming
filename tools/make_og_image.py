"""Renders the 1200x630 social share (OG) card for the Chinese name generator."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER = (244, 240, 231)
CREAM = (251, 250, 245)
INK = (30, 43, 38)
MUTED = (102, 115, 109)
GREEN = (49, 83, 71)
CORAL = (213, 108, 78)
LINE = (216, 214, 204)

SERIF_BOLD = "C:/Windows/Fonts/georgia.ttf"
SERIF = "C:/Windows/Fonts/georgia.ttf"
HAN = "C:/Windows/Fonts/msyh.ttc"
MONO = "C:/Windows/Fonts/consola.ttf"

# Shown in the card footer. Change this once the live domain is settled.
SITE_URL = "qiming.pages.dev"


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


img = Image.new("RGB", (W, H), PAPER)
draw = ImageDraw.Draw(img)

# --- background texture: faint oversized 你好 watermark -------------------
wm = font(HAN, 400)
draw.text((W + 130, H + 120), "你", font=wm, fill=(240, 235, 225), anchor="rs")

# --- left column ---------------------------------------------------------
M = 84

f_eyebrow = font(MONO, 17)
draw.ellipse([M, 82, M + 10, 92], fill=CORAL)
draw.text((M + 24, 74), "HÀNZI  ·  CHINESE NAME GENERATOR", font=f_eyebrow, fill=MUTED)

f_head = font(SERIF_BOLD, 68)
f_head_i = font(SERIF, 68)
head_lines = [
    [("Find a Chinese", INK)],
    [("name that ", INK), ("feels", CORAL)],
    [("like you.", INK)],
]
y = 150
line_h = 84
for segments in head_lines:
    x = M
    for text, color in segments:
        fnt = f_head_i if color == CORAL else f_head
        draw.text((x, y), text, font=fnt, fill=color)
        x += draw.textlength(text, font=fnt)
    y += line_h

# coral underline accent under the headline
draw.line([M, y + 6, M + 92, y + 6], fill=CORAL, width=3)

# --- sub copy ------------------------------------------------------------
f_sub = font("C:/Windows/Fonts/msyh.ttc", 19)
f_sub = font(MONO, 18)
sub_lines = [
    "Not a translation. A name chosen for its",
    "sound, meaning, and the person you are.",
]
sy = y + 44
for line in sub_lines:
    draw.text((M, sy), line, font=f_sub, fill=MUTED)
    sy += 30

# --- footer rule + brand -------------------------------------------------
draw.line([M, H - 92, W - M, H - 92], fill=LINE, width=1)
f_brand = font("C:/Windows/Fonts/msyh.ttc", 26)
draw.text((M, H - 66), "漢", font=f_brand, fill=CORAL)
draw.text((M + 40, H - 60), "Hànzi", font=font(SERIF_BOLD, 22), fill=INK)

f_url = font(MONO, 17)
draw.text((W - M, H - 58), SITE_URL, font=f_url, fill=MUTED, anchor="ra")

# --- right column: rotating character stage ------------------------------
cx, cy, R = 918, 292, 138

# tilted orbit rings on their own layer so they can be rotated
rings = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(rings)
rd.ellipse([cx - R - 34, cy - R + 12, cx + R + 6, cy + R - 46], outline=CORAL + (110,), width=2)
rd.ellipse([cx - R + 12, cy - R - 30, cx + R + 52, cy + R + 30], outline=GREEN + (70,), width=2)
rings = rings.rotate(-16, center=(cx, cy), resample=Image.BICUBIC)
img.paste(Image.alpha_composite(img.convert("RGBA"), rings).convert("RGB"), (0, 0))
draw = ImageDraw.Draw(img)

# halo + solid disc
draw.ellipse([cx - R, cy - R, cx + R, cy + R], fill=PAPER, outline=CORAL, width=2)

f_han_big = font(HAN, 158)
draw.text((cx, cy - 4), "名", font=f_han_big, fill=CORAL, anchor="mm")

# satellite characters
f_sat = font(HAN, 40)
for text, (sx, sy_), color in [
    ("安", (cx - 78, cy - 158), GREEN),
    ("知", (cx + 104, cy - 116), CORAL),
    ("明", (cx - 150, cy + 74), GREEN),
    ("远", (cx + 132, cy + 92), CORAL),
]:
    draw.text((sx, sy_), text, font=f_sat, fill=color, anchor="mm")

# caption
f_cap = font(MONO, 15)
draw.text((cx, cy + R + 66), "A NAME IN MOTION", font=f_cap, fill=MUTED, anchor="mm")

img.save("og-image.png", "PNG", optimize=True)
print("wrote og-image.png", img.size)
