# Wisp DApp Registry

The community-maintained, multichain DApp directory consumed by Wisp Wallet. Developers can add a DApp by opening a pull request.

## Public endpoints

- Registry: `https://raw.githubusercontent.com/windvex/wisp-dapp-registry/main/registry.json`
- Chains: `https://raw.githubusercontent.com/windvex/wisp-dapp-registry/main/chains.json`
- Asset base: `https://raw.githubusercontent.com/windvex/wisp-dapp-registry/main/`

The `icon` fields are repository-relative paths. Consumers should resolve them against the asset base URL above and keep a cached copy of the last valid registry.

## Add a DApp

1. Fork this repository and create a branch.
2. Add a square PNG or WebP icon to `assets/dapps/<dapp-id>.png`. Keep it at or below 512 KB.
3. Add one entry to `registry.json`, sorted alphabetically by `id`.
4. Run `npm test`.
5. Open a pull request using the provided template.

Use one DApp per pull request. The DApp and developer URLs must use HTTPS. A reviewer may ask for domain or project-ownership proof. Each DApp lists only the chains it actually supports; a DApp can reference one chain or many chains.

Start new submissions with `featured: false` and `verified: false`. These values are controlled by registry maintainers. Being listed or verified confirms registry identity only; it is not a security audit or endorsement.

## Entry example

```json
{
  "id": "example-swap",
  "name": "Example Swap",
  "description": "Swap supported assets from a simple non-custodial interface.",
  "url": "https://example.com/",
  "icon": "assets/dapps/example-swap.png",
  "chains": ["vexEvm"],
  "categories": ["defi"],
  "developer": {
    "name": "Example Labs",
    "url": "https://example.com/"
  },
  "status": "active",
  "featured": false,
  "verified": false,
  "addedAt": "2026-07-16"
}
```

Available categories are `bridge`, `defi`, `explorer`, `games`, `governance`, `marketplace`, `nft`, `social`, `tools`, and `wallet`.

Supported chain IDs are defined in `chains.json`. The initial catalog includes VEX Native, VEX EVM, Ethereum, BNB Smart Chain, Chiliz, Base, Polygon, Arbitrum One, Optimism, TRON, Bitcoin, and Solana. A new chain can be proposed by adding its metadata and square icon in the same pull request as the first DApp that needs it.

## Validation

```sh
npm test
```

The dependency-free validator checks required fields, duplicate IDs and URLs, HTTPS URLs, supported chains and categories, asset paths and sizes, dates, and alphabetical ordering. GitHub Actions runs it on every pull request.

## License

MIT
