# SOPliance website

Working folder: `D:\websites\Sopliance`.
Preview: https://ronmenator.github.io/sopliance-website/

## Local preview

Requires Node.js 22 and Python 3:

```powershell
node scripts/build.mjs
python -m http.server 4173 --directory dist
```

Visit http://localhost:4173. Rebuild after changing positions. No npm installation is needed.

## Careers

Upload or delete job description files in `positions/` and commit to `main`. The GitHub Actions workflow generates the searchable careers list and publishes it with the website. Read [positions/README.md](positions/README.md) for supported formats and naming guidance. No outdated or sample positions are published.

## Publishing

Review changes, commit the relevant files, and push to `main`. The `Publish website` workflow builds only public website files into `dist/` and deploys them to GitHub Pages. The source `jobs.json` is an empty fallback; deployment generates its own from the positions folder.

## Final launch

SOPliance.com domain settings are deferred until the final host is chosen. Upload the generated `dist/` directory to another static host. Retain the build command for automatic job updates. Remove development `noindex` metadata from both pages when ready for search engines.

Logo: existing SOPliance brand asset. Infrastructure photo: Unsplash, https://images.unsplash.com/photo-1558494949-ef010cbdcc31. Typography: DM Sans and Manrope via Google Fonts. Contact and applications open the visitor's email app; no messages or résumés are stored by the site.
