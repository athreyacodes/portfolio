"""Regenerate the derived raster assets in public/images from their masters.

Run with a Python that has pillow (with AVIF support) available:
    python scripts/optimize-media.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
IMAGES = ROOT / "public" / "images"

# The portrait renders at 240 CSS px on desktop and 160 on mobile, so 480w
# covers every device pixel ratio the 581px master can actually serve.
PORTRAIT_WIDTHS = (240, 480)

# Company logos render at 28 CSS px tall; 84px covers 3x displays.
LOGO_HEIGHT = 84
LOGOS = ("mphasis", "mphasis-white-text", "mimecast-white")


def save_variants(
    image: Image.Image,
    stem: Path,
    *,
    lossless_png: bool,
    avif_quality: int,
    webp_quality: int,
) -> None:
    image.save(stem.with_suffix(".avif"), quality=avif_quality, speed=4)
    image.save(stem.with_suffix(".webp"), quality=webp_quality, method=6)
    if lossless_png:
        image.save(stem.with_suffix(".png"), optimize=True)
    else:
        image.convert("RGB").save(
            stem.with_suffix(".jpg"), quality=80, optimize=True, progressive=True
        )


def build_portrait() -> None:
    master = Image.open(SRC / "dp-master.jpg").convert("RGB")
    side = min(master.size)
    left = (master.width - side) // 2
    top = (master.height - side) // 2
    master = master.crop((left, top, left + side, top + side))

    # The portrait never renders larger than 240 CSS px, where quality 50 is
    # visually identical to 68 for roughly half the bytes on the LCP image.
    for width in PORTRAIT_WIDTHS:
        resized = master.resize((width, width), Image.LANCZOS)
        save_variants(
            resized,
            IMAGES / f"dp-{width}",
            lossless_png=False,
            avif_quality=50,
            webp_quality=72,
        )

    # Square portrait referenced by the Person JSON-LD. Only crawlers fetch it,
    # so it trades a little quality for weight.
    master.resize((581, 581), Image.LANCZOS).save(
        IMAGES / "dp-og.jpg", quality=72, optimize=True, progressive=True
    )


def build_logos() -> None:
    for name in LOGOS:
        source = SRC / "logo" / f"{name}.png"
        logo = Image.open(source).convert("RGBA")
        width = round(logo.width * LOGO_HEIGHT / logo.height)
        resized = logo.resize((width, LOGO_HEIGHT), Image.LANCZOS)
        # Logos are flat-colour marks with hard edges, so they hold up worse
        # than a photo under aggressive quantisation.
        save_variants(
            resized,
            IMAGES / "logo" / name,
            lossless_png=True,
            avif_quality=70,
            webp_quality=82,
        )


def build_background() -> None:
    """Tiling cloud texture. Dimensions must not change or the tile seam shifts.

    No WebP variant: for a large mostly-transparent texture WebP encodes larger
    than the source PNG, so offering it would hand some browsers a worse file.
    """
    source = IMAGES / "background" / "cloud3.png"
    cloud = Image.open(source).convert("RGBA")
    cloud.save(source.with_suffix(".avif"), quality=45, speed=4)


def report() -> None:
    total = 0
    for path in sorted(IMAGES.rglob("*")):
        if path.is_file():
            size = path.stat().st_size
            total += size
            print(f"{size:>8,}  {path.relative_to(IMAGES)}")
    print(f"{total:>8,}  TOTAL")


if __name__ == "__main__":
    build_portrait()
    build_logos()
    build_background()
    report()
