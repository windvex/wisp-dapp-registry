# Contributing

Thank you for helping expand the Wisp DApp Registry.

## Listing requirements

- The application must be reachable through a stable HTTPS URL.
- The submitted name, URL, chain support, and developer identity must be accurate.
- The `chains` array must contain every supported chain shown by Wisp and must not claim unsupported networks.
- The icon must be owned by the project or licensed for this use.
- The application must not impersonate another project, request seed phrases or private keys, distribute malware, or intentionally mislead users.
- One DApp must be submitted per pull request.

## Review process

Automated validation runs first. Maintainers then review the listing, website, ownership evidence, and user-safety signals. Maintainers may reject or remove listings that are abandoned, compromised, deceptive, illegal, or harmful.

Set `featured` and `verified` to `false` in community submissions. Maintainers decide these flags independently. Listing and verification are registry identity signals, not audits or guarantees.

If a required chain is missing from `chains.json`, add one chain entry and a square PNG or WebP icon under `assets/chains/`. Chain IDs must be canonical and entries must stay sorted by `id`.

By contributing, you confirm that the submitted information can be redistributed under this repository's license.
