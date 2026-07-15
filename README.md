# Mish's 21st Birthday Site

A 3-page gold & white birthday site: landing/story intro, photo gallery, and a scratch-card message + wish wall.

## Before you send it to her

1. **Message** — open `message.html`, find `<p class="msg-text" id="hidden-message">` and replace the placeholder text with your real message.
2. **Photos** — drop image files into `assets/photos/` (e.g. `1.jpg`, `2.jpg`...). Open `gallery.html`, scroll to the `photos` array near the bottom, and set each `src` to your filename with a short `caption`. Until you add real files, gold placeholder tiles show instead so nothing looks broken.
3. **Music** — drop an mp3 at `assets/music/bg.mp3` (keep that exact filename, or update the `<source>` tag in each HTML file). It autoplays only after she taps the gold circle button bottom-right — browsers block autoplay with sound until there's a click, so that button is the play/pause control. Music position and play state carry across pages.

## Structure

```
index.html      landing / story intro
gallery.html    photo grid + lightbox
message.html    scratch-card reveal + wish wall
style.css       shared design tokens
script.js       shared behaviour (music, confetti, scratch card, wish wall)
assets/photos/  your photos go here
assets/music/   your bg.mp3 goes here
```

## Deploy (same workflow you already use)

```bash
git init
git add .
git commit -m "mish 21st birthday site"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then enable GitHub Pages on the repo (Settings → Pages → deploy from `main` branch, root folder). Your live link will be `https://<username>.github.io/<repo-name>/`.

## Notes

- The wish wall saves wishes in each visitor's own browser (`localStorage`) — there's no backend, so wishes aren't shared between devices. If you want a real shared wall later (everyone's wishes visible to everyone), that needs a small backend or a service like Firebase — happy to help set that up if you want it.
- Everything is responsive down to mobile since that's how she'll most likely open it.
