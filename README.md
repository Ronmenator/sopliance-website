# SOPliance website

Website working folder: `D:\websites\Sopliance`.

## Temporary hosting

GitHub Pages publishes the root of the `main` branch automatically after each push.
Preview URL: https://ronmenator.github.io/sopliance-website/

The initial site is plain HTML with no build dependencies. Open `index.html` locally to preview it.
Use relative asset links so the site works under the GitHub Pages repository path and on a future host.

## Publish updates

Review changes, commit, and push to `main`:

```powershell
git status
git add <files-to-publish>
git commit -m "Describe website changes"
git push
```

## Final hosting

SOPliance.com DNS and custom-domain settings are intentionally deferred until the final hosting provider is chosen.
The site can be moved by uploading the static website files to that provider.
Remove the development `noindex` meta tag when the final site is ready for search engines.
Keep credentials and private client information out of website files.
