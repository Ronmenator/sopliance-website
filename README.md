# SOPliance website

**Production launch is blocked until the Terms of Use, Privacy Policy, and Cookie Policy are approved and finalized.** See [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md). Development previews may continue; publishing drafts does not satisfy this requirement.

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

SOPliance.com domain settings are deferred until the final host is chosen. Upload the generated `dist/` directory to another static host. Retain the build command for automatic job updates. Set `baseUrl` to `https://sopliance.com/` and `indexable` to `true` in `site.config.json` at final launch, then rebuild. The build updates page indexing metadata and all generated URLs.

Logo: existing SOPliance brand asset. Team collaboration photo: Unsplash, https://images.unsplash.com/photo-1522071820081-009f0129c71c. Typography: DM Sans and Manrope via Google Fonts. Contact and applications open the visitor's email app; no messages or résumés are stored by the site.

## Accessibility checks

Run `node scripts/test-contrast.mjs` to verify the shared text, button, hover, icon, focus, and input-boundary color pairs. This check runs before publication. Both pages use solid backgrounds behind image text, visible keyboard focus, hidden decorative icons, and reduced-motion support.

A rendered text-color check verified 84 homepage text elements with the mobile navigation expanded and 25 careers text elements without contrast failures on 2026-10-24. Primary buttons measure 5.58:1 and their hover state 4.62:1. These targeted checks do not constitute a full accessibility conformance audit.


## Sitemap, crawler files, LLM references, and structured data

Every build generates these files in `dist/` and publishes them at the website base URL:

- `sitemap.xml`: canonical URLs for the homepage, careers, and three policy pages.
- `robots.txt`: crawl rules and the absolute sitemap location.
- `llms.txt`: company summary and links to machine-readable sources.
- `llms-full.txt`: expanded public page content and current position-description links.
- Markdown companions for all five pages: machine-readable page versions linked from each HTML page.
- `structured-data.json`: Schema.org Organization, WebSite, Service, WebPage, CollectionPage, and current position ItemList objects.
- `jobs.json`: the generated list of position documents.

Each built HTML page also contains canonical metadata and embedded JSON-LD. No JobPosting rich-result claims are generated from filenames, which lack verified employment details.

`site.config.json` controls the canonical base URL and indexing. The preview retains `noindex, nofollow`; creating a sitemap does not enable indexing. A robots file only controls crawling when served at the host root `/robots.txt`. The current GitHub Pages project URL is a subfolder, so its published robots file is ready for the final domain but does not control the entire github.io host.

Run `node scripts/test-metadata.mjs` after building to verify discovery files, JSON-LD references, sitemap URLs, LLM links, and preview indexing. This test runs in GitHub Actions before deployment.


## Website policy drafts

`terms.html`, `privacy.html`, and `cookies.html` are linked from all footers and included in sitemap, JSON-LD, and LLM output. These are company-review drafts, dated October 24, 2026, reflecting the current static site, GitHub Pages hosting, Google Fonts connections, email applications, Florida company location, and confirmed sharing of applicant résumés with client organizations. The owner selected an under-16 children's privacy threshold and two years from the last interaction for applications and correspondence on October 27, 2026; applications remain restricted to 18+. Implement the retention/disposal procedure and obtain appropriate legal review before treating these as final policies. Revisit the policies whenever hosting or tracking changes.
