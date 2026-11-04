# SOPliance.com on GitHub Pages

Prepared November 4, 2026. Owner approved all three policies November 4, 2026. GitHub custom domain is configured; GoDaddy DNS change and HTTPS verification remain pending. Current live domain points to Azure; GitHub preview remains active.

## Verified production configuration

Before the domain switch, set site.config.json to:

```json
{
  "baseUrl": "https://sopliance.com/",
  "indexable": true
}
```

The production configuration was built and passed metadata checks locally, then restored to preview settings. Do not enable production indexing until the launch hold is resolved. Finalize effective dates and record approval in LAUNCH-CHECKLIST.md.

## Cutover sequence

1. Confirm policy approval, final effective dates, and actual GitHub-hosted privacy/cookie disclosures. Verify the domain under the GitHub account using GitHub's supplied TXT record where available.
2. Configure sopliance.com as the custom domain in repository Settings > Pages BEFORE pointing DNS to GitHub. This repository uses GitHub Actions; a CNAME source file is not required for that publishing method.
3. Publish the production configuration above and verify the successful workflow.
4. Replace apex website A records with all four records below, and replace the www CNAME. Check for conflicting website AAAA/ALIAS records. Preserve email MX, SPF, DKIM, DMARC, and other unrelated records.
5. Verify apex and www DNS, certificate issuance, Enforce HTTPS, redirect behavior, all five pages, position downloads, email links, sitemap.xml, robots.txt, llms.txt, llms-full.txt, and structured-data.json.
6. Confirm noindex is removed only after approval, and submit the final sitemap in the domain's search-console account if used. Keep the old hosting available until the switch is verified.

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | ronmenator.github.io |

With sopliance.com as the configured custom domain and correct DNS, GitHub redirects www to the apex. DNS propagation and certificate availability may take up to 24 hours.

Observed previous website records: apex A 20.49.104.10; www CNAME sopliance.azurewebsites.net. Recheck and save the complete DNS record set before making changes; these observations are not a complete rollback backup.

Official instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Cutover progress — November 4, 2026

- Owner production approval recorded.
- GitHub Pages custom domain set to sopliance.com using repository Pages API; confirmed returned cname.
- Production base URL and indexing enabled in source; all metadata checks pass.
- GoDaddy login required before DNS can be changed. Website DNS remains on Azure pending sign-in.
- GitHub currently reports no issued certificate and HTTPS enforcement unavailable for the new domain. Enable HTTPS after DNS/certificate validation.
