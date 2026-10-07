"""Create upload-ready editorial graphics; these are illustrations, not screenshots."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path(__file__).resolve().parent.parent/'product-hunt'
OUT.mkdir(exist_ok=True)
PAPER='#f4f0e7'; CREAM='#fbfaf5'; INK='#1e2b26'; GREEN='#315347'; CORAL='#d56c4e'; MUTED='#66736d'; LINE='#d8d6cc'
def font(size,kind='sans'):
    return ImageFont.truetype({'sans':'C:/Windows/Fonts/segoeui.ttf','serif':'C:/Windows/Fonts/georgia.ttf','han':'C:/Windows/Fonts/msyh.ttc','mono':'C:/Windows/Fonts/consola.ttf'}[kind],size)
def text(d,xy,s,size=24,color=INK,kind='sans',anchor=None): d.text(xy,s,font=font(size,kind),fill=color,anchor=anchor)
def base(n,title,sub):
    im=Image.new('RGB',(1270,760),PAPER); d=ImageDraw.Draw(im)
    text(d,(70,45),'漢',32,CORAL,'han'); text(d,(119,47),'Hànzi',30,INK,'serif')
    text(d,(1200,58),f'0{n} / EXPLORE YOUR CHINESE NAME',14,MUTED,'mono','ra')
    text(d,(70,123),title,49,INK,'serif'); text(d,(70,190),sub,23,MUTED)
    d.line((70,688,1200,688),fill=LINE,width=2)
    text(d,(70,711),'FREE · NO SIGN-UP · MADE FOR THE CURIOUS',14,MUTED,'mono')
    text(d,(1200,711),'chinesename.cc.cd',16,GREEN,'mono','ra')
    return im,d
def save(im,name): im.save(OUT/name,optimize=True)
# Icon master and thumbnail.
im=Image.new('RGB',(1024,1024),GREEN); d=ImageDraw.Draw(im)
d.ellipse((100,100,924,924),outline='#b7c4ae',width=3)
text(d,(512,485),'漢',535,PAPER,'han','mm'); d.ellipse((750,757,811,818),fill=CORAL)
save(im,'icon-1024.png'); save(im.resize((240,240),Image.Resampling.LANCZOS),'thumbnail-240.png')
# Hero image.
im,d=base(1,'Find a Chinese name that feels like you.','Chinese characters. Pinyin. Meaning. A little story behind every name.')
text(d,(74,298),'Not a translation.',45,INK,'serif'); text(d,(74,360),'A new way to introduce yourself.',29,GREEN)
for i,s in enumerate(['Enter your name.','Choose the feeling you want to carry.','Meet three possibilities.']):
    text(d,(78,444+i*47),f'0{i+1}',19,CORAL,'mono'); text(d,(127,441+i*47),s,25)
d.rounded_rectangle((823,265,1177,633),radius=7,fill=CREAM,outline=LINE,width=2)
text(d,(1000,392),'名',159,CORAL,'han','mm'); text(d,(1000,548),'YOUR NAME, IN ANOTHER WORLD',14,MUTED,'mono','mm')
save(im,'gallery-01-cover.png')
# Result example, clearly editorial.
im,d=base(2,'A name you can understand, not just copy.','Every option includes Mandarin pinyin, character meanings, and context.')
items=[('林知远','Lín Zhīyuǎn','Wisdom that reaches far',['林 · forest / surname','知 · to know','远 · far-reaching']),('周予安','Zhōu Yǔ’ān','Peace, freely given',['周 · Zhou / surname','予 · to give','安 · peace']),('沈明澈','Shěn Míngchè','Bright and clear-hearted',['沈 · Shen / surname','明 · bright','澈 · clear'])]
for i,(han,py,title,meaning) in enumerate(items):
    x=70+i*382; d.rounded_rectangle((x,265,x+360,628),radius=7,fill=CREAM,outline=LINE,width=2)
    text(d,(x+23,284),'EXAMPLE NAME',13,MUTED,'mono'); text(d,(x+180,373),han,65,GREEN,'han','mm')
    text(d,(x+180,432),py,23,CORAL,anchor='mm'); text(d,(x+23,470),title,22,INK,'serif')
    for j,line in enumerate(meaning):text(d,(x+23,516+j*30),line,18,MUTED)
save(im,'gallery-02-name-examples.png')
# Style controls illustration.
im,d=base(3,'Start with a feeling. Make it personal.','Choose the qualities you want your Chinese name to express.')
styles=['Modern','Elegant','Calm','Strong','Playful','Poetic','Warm','Bright','Thoughtful','Unique','Traditional','Natural']
for i,label in enumerate(styles):
    x=70+(i%4)*289; y=286+(i//4)*91; selected=label in ['Calm','Thoughtful','Natural']
    d.rounded_rectangle((x,y,x+268,y+65),radius=32,fill=GREEN if selected else CREAM,outline=GREEN if selected else LINE,width=2)
    text(d,(x+134,y+31),label,24,PAPER if selected else INK,anchor='mm')
text(d,(70,593),'Three options to explore. Copy a favorite. Generate more.',26,INK,'serif')
save(im,'gallery-03-personal-style.png')
# Culture feature.
im,d=base(4,'Your name is only the beginning.','Find your zodiac animal and explore its cultural story—without a birth time.')
d.rounded_rectangle((70,270,515,630),radius=7,fill=GREEN)
text(d,(292,373),'马',116,PAPER,'han','mm'); text(d,(292,478),'Horse · Mǎ',32,PAPER,'serif','mm'); text(d,(292,554),'MOVEMENT · INDEPENDENCE',16,'#b7c4ae','mono','mm')
text(d,(569,298),'Find your Chinese zodiac sign.',32,INK,'serif')
lines=['Start with your birth year.','Add month and day to confirm the','Lunar New Year boundary.','','Explore twelve animal symbols and','the 2026 Year of the Horse guide.']
for i,line in enumerate(lines):text(d,(571,365+i*35),line,24,MUTED)
text(d,(571,611),'CULTURE & REFLECTION, NOT PREDICTIONS',14,GREEN,'mono')
save(im,'gallery-04-zodiac.png')
# Wide social card, plus PH-sized images above.
im=Image.new('RGB',(1200,630),PAPER)
cover=Image.open(OUT/'gallery-01-cover.png'); cover.thumbnail((1200,630),Image.Resampling.LANCZOS)
im.paste(cover,((1200-cover.width)//2,(630-cover.height)//2)); save(im,'social-cover-1200x630.png')
print('Created',len(list(OUT.glob('*.png'))),'PNG assets in',OUT)
