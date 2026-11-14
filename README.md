# Wisp DApp Registry

The community-maintained, multichain DApp directory consumed by Wisp Wallet. Developers can add a DApp by opening a pull request.

**The registry is discovery metadata, not a wallet permission system or an allowlist.**
Any safely opened HTTPS DApp can use Wisp Wallet's supported provider interfaces
without being listed or verified here. Users explicitly authorize account
connections and signing requests inside their wallet. Listing only controls
whether an app appears in Explore, plus its catalog description, supported-chain
badges, icon, and optional verified display badge. Removing an entry or marking
it inactive hides it from the directory; it does not block visiting its URL or
revoke user-granted wallet sessions. Provider security is independently enforced
by the wallet using exact origins, chain support, permissions, and user approval.
Developers use the WindStack SDK regardless of listing status.

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
  "supportedClients": ["android"],
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

## Client compatibility

Every entry declares `supportedClients: ["android"]`, `["telegram"]`, or
`["android", "telegram"]`. Consumers must reject entries missing client metadata and
filter by their client before exposing catalog data, including cached and bundled
snapshots. Unknown, missing, empty, or duplicate client values are invalid. A
registry identity badge does not establish runtime compatibility.

Android supports native WebView injection and EVM WalletConnect. Telegram uses
WindStack frame providers and the Wisp Telegram VEX transport; it cannot inject
an EIP-1193 provider into arbitrary third-party sites. A Telegram entry requires
evidence that the DApp implements a compatible frame or Telegram transport.
Merely loading a URL, exposing `window.ethereum`, or using Telegram WebApp APIs
is insufficient. Unproven compatibility stays Android-only.

The initial Telegram classification was audited against the production source:
Wind Assets (`web/src/wisp.js`), Wind DEX (`src/features/wallet/embedded.ts`),
Wind DEX Listing (`src/embedded.ts`, `src/WalletProvider.tsx`), Wind Explorer
(`src/features/wallet/wispEmbeddedProvider.ts`), Wind Launch and Wind Swap
(`src/features/wallet/wispEmbeddedProvider.ts`), Wisp Arena
(`apps/web/src/wisp.ts`), and Wisp Space Run (`src/services/wispWallet.js`).
These implement WindStack frame or Telegram handoff integration. This records
protocol integration evidence; it is not a claim that every transaction has
passed live QA. General EVM protocols, including PancakeSwap and Uniswap, remain
Android-only until equivalent Telegram integration is demonstrated.

`registry.json` is the sole maintained catalog. Telegram's bundled offline
snapshot must be copied from it when updating the catalog; it is never edited
as a separate list. All sources pass the same strict parser and client filter.
The additive `supportedClients` field keeps wire version 1 readable by published
Android APKs; cache/query revision 2 invalidates unclassified client data.
Neither registry membership nor this client filter grants wallet permissions.

## Catalog curation

Use canonical public application URLs and list only networks supported by both
the application and the client provider. Check current project documentation,
public service status, and wallet connection interfaces before adding entries.
Withdrawal-only or discontinued products must not be introduced as active apps.
Popularity and published audits do not establish that an application is risk-free;
`verified` continues to mean registry identity only.

Chiliz application URLs are linked from [Chiliz](https://www.chiliz.com/) and its
[staking documentation](https://docs.chiliz.com/learn/about-staking/stake-your-chz).
The catalog includes Kayen Finance and the official bridge and staking portal. Revoke.cash documents Chiliz in its [supported networks](https://revoke.cash/learn/faq).
These entries support Android; Telegram compatibility remains unproven.

Network metadata should follow current deployments, for example
[Pendle](https://docs.pendle.finance/pendle-v2-dev/Deployments),
[CoW Protocol](https://github.com/cowprotocol/cow-sdk), and
[Yearn](https://docs.yearn.fi/getting-started/guides/using-yearn-v3).
Consumers may use network metadata for search and filters without displaying
all networks on every catalog row. Project icons retain their respective owners'
branding; use public project assets or favicons rather than generated logos.
