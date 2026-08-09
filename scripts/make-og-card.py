"""Generate the 1200x630 social card from the profile master image.

Run with a Python that has pillow + fonttools[woff] available:
    python scripts/make-og-card.py
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONTS = PUBLIC / "fonts"
OUT = PUBLIC / "images" / "og-card.jpg"
PORTRAIT = ROOT / "assets-src" / "dp-master.jpg"

WIDTH, HEIGHT = 1200, 630
TEAL = (21, 96, 100)
TEAL_DEEP = (11, 47, 49)
CREAM = (244, 248, 248)
MUTED = (170, 200, 201)

NAME = "ATHREYA M R"
ROLE = "Front-end Architect"
TAGLINE = "Angular  ·  Micro Frontends  ·  SSR / SSG  ·  Web Performance"
DOMAIN = "athreya.codes"


def load_font(weight: int, size: int):
    """Montserrat ships as woff2 for the browser; convert in memory for PIL."""
    from io import BytesIO
    from PIL import ImageFont

    source = FONTS / f"montserrat-latin-{weight}-normal.woff2"
    font = TTFont(source, fontNumber=0)
    font.flavor = None
    buffer = BytesIO()
    font.save(buffer)
    buffer.seek(0)
    return ImageFont.truetype(buffer, size)


def circular_portrait(size: int) -> Image.Image:
    portrait = Image.open(PORTRAIT).convert("RGB")
    side = min(portrait.size)
    left = (portrait.width - side) // 2
    top = (portrait.height - side) // 2
    portrait = portrait.crop((left, top, left + side, top + side))
    portrait = portrait.resize((size, size), Image.LANCZOS)

    # Supersampled mask keeps the circle edge smooth at final scale.
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4, size * 4), fill=255)
    portrait.putalpha(mask.resize((size, size), Image.LANCZOS))
    return portrait


def build() -> None:
    card = Image.new("RGB", (WIDTH, HEIGHT), TEAL_DEEP)

    # Diagonal gradient wash so the flat teal does not look dead.
    gradient = Image.new("L", (WIDTH, HEIGHT))
    draw_gradient = ImageDraw.Draw(gradient)
    for x in range(0, WIDTH, 4):
        draw_gradient.rectangle((x, 0, x + 4, HEIGHT), fill=int(255 * (1 - x / WIDTH)))
    card = Image.composite(Image.new("RGB", (WIDTH, HEIGHT), TEAL), card, gradient)

    draw = ImageDraw.Draw(card)

    portrait_size = 340
    portrait_x, portrait_y = 96, (HEIGHT - portrait_size) // 2

    halo = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse(
        (
            portrait_x - 14,
            portrait_y - 14,
            portrait_x + portrait_size + 14,
            portrait_y + portrait_size + 14,
        ),
        fill=(255, 255, 255, 46),
    )
    card.paste(
        Image.alpha_composite(card.convert("RGBA"), halo.filter(ImageFilter.GaussianBlur(10))).convert("RGB"),
        (0, 0),
    )

    portrait = circular_portrait(portrait_size)
    card.paste(portrait, (portrait_x, portrait_y), portrait)

    text_x = portrait_x + portrait_size + 84
    draw.text((text_x, 196), NAME, font=load_font(600, 62), fill=CREAM)
    draw.text((text_x, 278), ROLE, font=load_font(500, 40), fill=MUTED)
    draw.line((text_x, 350, text_x + 96, 350), fill=MUTED, width=3)
    draw.text((text_x, 378), TAGLINE, font=load_font(400, 21), fill=MUTED)
    draw.text((text_x, 428), DOMAIN, font=load_font(500, 23), fill=CREAM)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    card.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024:.1f} kB)")


if __name__ == "__main__":
    build()
