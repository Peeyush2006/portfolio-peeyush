# Peeyush Tiwari — Developer Portfolio

A fast, animated, single-page portfolio for **Peeyush Tiwari** — AI Engineer, Python Developer, and Android Developer. Built from scratch with a vanilla web stack (no framework, no build step) and a heavy focus on interactive, "developer-OS" styled UI.

🔗 **Live site:** [portfoliopeeyush.netlify.app](https://portfoliopeeyush.netlify.app/)

---

## ✨ Features

- **Terminal boot loader** — an animated boot-sequence intro that sets the "developer OS" theme.
- **Layered animated background:**
  - A full-page **3D rotating wireframe geometry** field rendered with WebGL / Three.js (icosahedra, dodecahedra, octahedra, torus & torus-knot) with depth fog and mouse parallax.
  - An interactive **2D neural particle canvas** that connects points to the cursor.
  - Ambient **aurora glow orbs** and an animated **cyber grid** overlay.
- **Interactive 3D certification balls** — Three.js spheres textured with company logos, draggable and mouse-reactive.
- **Interactive developer ID card** with a synchronized drop-in animation and 3D tilt.
- **Custom cursor** with an easing trail.
- **Filterable project gallery** (AI & ML / Android / Web App / Automation).
- **Working contact form** powered by [Netlify Forms](https://docs.netlify.com/forms/setup/) — with a spam honeypot and a graceful fallback.
- **Responsive** layout with reduced-motion and mobile performance considerations.
- **SEO & social-ready** — Open Graph, Twitter Card, favicon, canonical, and theme-color meta tags.

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| Markup / Styling | HTML5, CSS3 (custom properties, animations) |
| Scripting | Vanilla JavaScript (ES6+) |
| 3D / Graphics | [Three.js](https://threejs.org/) r128, Canvas 2D API |
| Fonts | Outfit & JetBrains Mono (Google Fonts) |
| Forms | Netlify Forms |
| Hosting / CI | Netlify (auto-deploy from `main`) |

No bundler, package manager, or build step — the site runs directly from static files.

---

## 📁 Project Structure

```
portfolio-peeyush/
├── index.html      # Page markup, meta tags, and section content
├── style.css       # All styling, animations, and responsive rules
├── script.js       # Interactivity: loader, canvases, Three.js scenes, form, cursor
├── profile.jpg     # Profile photo (also used as the social share image)
└── README.md
```

---

## 🚀 Getting Started (Local Development)

Because it's a static site, you only need a simple local server to preview it.

```bash
# Clone the repository
git clone https://github.com/Peeyush2006/portfolio-peeyush.git
cd portfolio-peeyush

# Serve it locally (any static server works). For example, with Python:
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

> **Note:** The contact form uses **Netlify Forms**, which only processes submissions on the deployed Netlify site — locally, submitting the form will hit the graceful fallback message. Everything else works fully offline.

---

## 🌐 Deployment

The site is hosted on **Netlify** and deploys automatically:

1. Push to the `main` branch.
2. Netlify rebuilds and publishes within a minute or two.
3. Form submissions appear under **Netlify dashboard → Forms**. To receive them by email, add a notification under **Forms → Settings & notifications**.

---

## 📬 Contact

- **Email:** peeyushtiwari03@gmail.com
- **GitHub:** [@Peeyush2006](https://github.com/Peeyush2006)
- **Portfolio:** [portfoliopeeyush.netlify.app](https://portfoliopeeyush.netlify.app/)

---

<p align="center">Built with passion and a vanilla web stack. © 2026 Peeyush Tiwari.</p>
