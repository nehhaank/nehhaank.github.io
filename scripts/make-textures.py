"""Generates the site's procedural images (no photos, no AI models).

Run: python3 scripts/make-textures.py  -> writes into src/assets/
"""
import numpy as np
from PIL import Image, ImageFilter

rng = np.random.default_rng(8)
OUT = 'src/assets/'


def fbm(h, w, octaves=5, base=4, aniso=(1, 1)):
    out = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        gh, gw = int(base * 2**o * aniso[0]) + 2, int(base * 2**o * aniso[1]) + 2
        g = rng.random((gh, gw))
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * np.asarray(img, float) / 255
        tot += amp
        amp *= 0.5
    return out / tot


def save(arr, name, q=82):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(OUT + name, quality=q)


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)


# 1. Mown grass, seen from above: stripes, blades, clover patches.
H, W = 900, 1600
blades = fbm(H, W, 6, 10, aniso=(1, 4))          # short blade texture
patch = fbm(H, W, 4, 3)
x = np.arange(W)[None, :]
stripe = (np.floor(x / 200) % 2)                     # mowing stripes 200 px wide
stripe = np.asarray(Image.fromarray((stripe * 255).astype(np.uint8).repeat(H, 0)).filter(ImageFilter.GaussianBlur(12)), float) / 255
dark, mid, light = hexrgb('#1a432c'), hexrgb('#1f4c32'), hexrgb('#285c3d')
t = 0.12 * blades + 0.18 * patch + 0.7 * stripe
t = (t - t.min()) / (t.max() - t.min())
img = np.where(t[..., None] < 0.5, dark + (mid - dark) * (t[..., None] / 0.5), mid + (light - mid) * ((t[..., None] - 0.5) / 0.5))
img += (rng.random((H, W, 1)) - 0.5) * 10
save(img, 'grass.jpg')

# 2. Focaccia crumb: golden top, dimples, oil sheen, rosemary.
H, W = 900, 900
n = fbm(H, W, 6, 5)
img = hexrgb('#e9b93a') * (0.82 + 0.3 * n[..., None])
yy, xx = np.mgrid[0:H, 0:W]
for _ in range(38):
    cy, cx, r = rng.integers(40, H - 40), rng.integers(40, W - 40), rng.integers(16, 34)
    d = np.sqrt((yy - cy) ** 2 + ((xx - cx) * 0.8) ** 2) / r
    m = np.clip(1 - d, 0, 1) ** 1.5
    img = img * (1 - 0.30 * m[..., None])
    hl = np.clip(1 - np.abs(d - 0.95) * 3, 0, 1) * (yy < cy)
    img += hl[..., None] * 18
for _ in range(18):
    cy, cx = rng.integers(30, H - 30), rng.integers(30, W - 30)
    a = rng.random() * np.pi
    L = rng.integers(14, 26)
    for s in np.linspace(-L / 2, L / 2, 60):
        py, px = int(cy + s * np.sin(a)), int(cx + s * np.cos(a))
        img[max(py - 2, 0):py + 2, max(px - 2, 0):px + 2] = hexrgb('#2f5a2c') + rng.random() * 20
salt = rng.random((H, W)) > 0.9985
img[salt] = [250, 246, 233]
img = np.asarray(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), float)
save(img, 'focaccia.jpg')

# 3. Wood end-grain/plank for the cot.
H, W = 900, 900
warp = fbm(H, W, 4, 2) * 18
yy, xx = np.mgrid[0:H, 0:W]
rings = np.sin(xx * 0.022 + warp * 0.35 + fbm(H, W, 4, 2, aniso=(4, 1)) * 5)
fine = fbm(H, W, 6, 10, aniso=(18, 1))
t = 0.55 + 0.16 * rings + 0.55 * (fine - 0.5)
light, darkw = hexrgb('#e8c98f'), hexrgb('#a8763d')
img = darkw + (light - darkw) * np.clip(t, 0, 1)[..., None]
save(img, 'wood.jpg')

# 4. Book edge: stacked ivory pages.
H, W = 900, 900
lines = fbm(H, W, 5, 3, aniso=(40, 1))
t = 0.86 + 0.14 * lines
img = hexrgb('#f6efd9') * t[..., None]
img[:, :, 2] -= 8
save(img, 'pages.jpg')
print('ok')
