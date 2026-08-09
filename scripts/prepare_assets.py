"""Prepare official Unity & Hope web brand assets from supplied client files."""

from io import BytesIO
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-material"
BRAND = ROOT / "public" / "brand"
IMAGES = ROOT / "public" / "images"


def content_bbox(image: Image.Image, threshold: int = 247):
    rgb = image.convert("RGB")
    bg = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, bg).convert("L")
    mask = diff.point(lambda value: 255 if value > (255 - threshold) else 0)
    return mask.getbbox()


def transparent_white(image: Image.Image):
    rgba = image.convert("RGBA")
    pixels = []
    for red, green, blue, alpha in rgba.getdata():
        minimum = min(red, green, blue)
        if minimum > 248:
            pixels.append((red, green, blue, 0))
        elif minimum > 238:
            softened = int(alpha * (248 - minimum) / 10)
            pixels.append((red, green, blue, softened))
        else:
            pixels.append((red, green, blue, alpha))
    rgba.putdata(pixels)
    return rgba


def fit_square(image: Image.Image, size: int, padding: int = 28):
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    usable = size - padding * 2
    fitted = ImageOps.contain(image.convert("RGBA"), (usable, usable), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
    return canvas


def load_font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def main():
    BRAND.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)

    logo = Image.open(SOURCE / "Logo.jpeg").convert("RGB")
    bbox = content_bbox(logo)
    if not bbox:
        raise RuntimeError("Unable to identify logo artwork")
    left, top, right, bottom = bbox
    pad = 24
    crop = logo.crop((max(0, left - pad), max(0, top - pad), min(logo.width, right + pad), min(logo.height, bottom + pad)))
    crop.save(BRAND / "unity-hope-logo.png", optimize=True)
    crop.save(BRAND / "unity-hope-logo.webp", "WEBP", quality=92, method=6)
    transparent_white(crop).save(BRAND / "unity-hope-logo-transparent.png", optimize=True)

    # The official emblem occupies the upper portion of the original logo.
    mark_source = logo.crop((220, 54, 865, 625))
    mark_bbox = content_bbox(mark_source)
    if mark_bbox:
        mark_source = mark_source.crop(mark_bbox)
    mark = transparent_white(mark_source)
    fit_square(mark, 768, 48).save(BRAND / "unity-hope-mark.png", optimize=True)

    for size, filename in [
        (32, "favicon-32x32.png"),
        (192, "favicon-192x192.png"),
        (180, "apple-touch-icon.png"),
    ]:
        icon = fit_square(mark, size, max(2, size // 16))
        background = Image.new("RGBA", (size, size), "white")
        background.alpha_composite(icon)
        background.convert("RGB").save(ROOT / "public" / filename, optimize=True)

    favicon = fit_square(mark, 64, 4)
    favicon.save(ROOT / "public" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    home = Image.open(SOURCE / "Website Home.jpeg").convert("RGB")
    hero = home.crop((530, 0, home.width, 405))
    hero.save(IMAGES / "unity-hope-hero.webp", "WEBP", quality=92, method=6)

    brochure_reader = PdfReader(SOURCE / "unity and hope brochure.pdf")
    brochure_images = [Image.open(BytesIO(item.data)).convert("RGB") for item in brochure_reader.pages[0].images]
    brochure_photo = min(
        (image for image in brochure_images if image.width > 500 and image.height > 400),
        key=lambda image: abs((image.width / image.height) - 1.4),
    )
    brochure_photo.save(IMAGES / "brochure-caregiver.webp", "WEBP", quality=90, method=6)

    for source_image in IMAGES.glob("*.jpg"):
        try:
            web_image = Image.open(source_image).convert("RGB")
        except Exception:
            continue
        if web_image.width > 1600:
            target_height = round(web_image.height * (1600 / web_image.width))
            web_image = web_image.resize((1600, target_height), Image.Resampling.LANCZOS)
        web_image.save(source_image.with_suffix(".webp"), "WEBP", quality=84, method=6)

    # Branded social preview built from supplied client artwork.
    og = Image.new("RGB", (1200, 630), "#fff9ed")
    hero_fill = ImageOps.fit(hero, (610, 630), Image.Resampling.LANCZOS, centering=(0.54, 0.42))
    og.paste(hero_fill, (590, 0))
    shade = Image.new("RGBA", og.size, (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    shade_draw.rectangle((550, 0, 800, 630), fill=(255, 249, 237, 40))
    og = Image.alpha_composite(og.convert("RGBA"), shade)
    mark_small = fit_square(mark, 170, 8)
    og.alpha_composite(mark_small, (48, 38))
    draw = ImageDraw.Draw(og)
    heading = load_font(61, True)
    body = load_font(28)
    draw.text((55, 220), "Compassionate Care.", font=heading, fill="#30105B")
    draw.text((55, 292), "Right at Home.", font=heading, fill="#C8890A")
    draw.line((55, 385, 485, 385), fill="#D59A19", width=5)
    draw.text((55, 415), "Non-medical home care serving", font=body, fill="#21182A")
    draw.text((55, 454), "Montgomery County and surrounding areas.", font=body, fill="#21182A")
    draw.rounded_rectangle((55, 520, 445, 585), radius=30, fill="#30105B")
    draw.text((92, 536), "937-221-9764", font=load_font(30, True), fill="white")
    og.convert("RGB").save(ROOT / "public" / "og.jpg", quality=92, optimize=True)


if __name__ == "__main__":
    main()
