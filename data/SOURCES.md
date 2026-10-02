# Edge Weekly source list

*Edge Weekly: the AI week in Asia.* Vetted 2 October 2026 (HKT). Every feed URL marked "verified" was fetched from the box on that date and parsed as RSS or Atom (item count and latest item date recorded). Anything else is marked as no feed, blocked, stale, or unverified. No feed URL here is guessed. Machine-readable copy: `sources.csv`.

**Tiers.** core: read every week, high trust. secondary: read every week, filter for AI and Asia. signal only: used to spot or confirm stories, never cited alone.

## Top 10 to start milestone 1

1. **OpenAI News** (Global (US)): Official source for the most-covered lab's launches and policy moves. Feed: `https://openai.com/news/rss.xml`
2. **Google DeepMind Blog** (Global (UK/US)): Official Gemini and research announcements. Feed: `https://deepmind.google/blog/rss.xml`
3. **Anthropic News (unofficial mirror)** (Global (US)): Anthropic has no official feed; mirror is maintained but could stop, so also watch @AnthropicAI. Feed: `https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml`
4. **Hugging Face org release radar (Asian labs)** (CN, JP, KR, IN, SEA): One JSON API catches model releases from Asian labs that have no blog feed (DeepSeek, Qwen, Kimi, GLM, MiniMax and more). Feed: `https://huggingface.co/api/models?author={org}&sort=createdAt&direction=-1&limit=20`
5. **SCMP Tech** (HK, CN): Hong Kong's paper of record with the deepest English coverage of China and HK tech. Feed: `https://www.scmp.com/rss/36/feed`
6. **KrASIA** (CN, SEA): English arm of 36Kr; China and Southeast Asia tech business news. Feed: `https://console.kr-asia.com/feed`
7. **Rest of World** (Asia and Global South): High-quality reporting on tech outside the West, strong on Asia. Feed: `https://restofworld.org/feed/`
8. **Tech in Asia** (SEA, Asia): Pan-Asian startup and AI news, strong on Southeast Asia. Feed: `https://www.techinasia.com/feed`
9. **Recode China AI** (CN): Weekly analysis of Chinese AI companies, models and strategy. Feed: `https://recodechinaai.substack.com/feed`
10. **HK Digital Policy Office news** (HK): Official HK government AI and digital policy announcements. Feed: `https://www.digitalpolicy.gov.hk/en/news/latest/rss.data.xml`

Why this mix: 5 Asia news sources (SCMP, KrASIA, Rest of World, Tech in Asia, Recode China AI), one API that tracks model releases from Asian labs that have no blog feed (Hugging Face), the three most-covered global labs, and Hong Kong's digital policy office for the local angle. All ten feeds parsed cleanly on 2 October 2026. Anthropic's is a community mirror, so it's flagged as unofficial.

## 1. Primary sources: labs and companies (27)

| Source | Tier | Region | Access | Feed or endpoint | Status | Paywall | Why |
|---|---|---|---|---|---|---|---|
| OpenAI News (top 10) | core | Global (US) | rss | `https://openai.com/news/rss.xml` | verified 2026-10-02; latest item 2026-10-01 | no | Official source for the most-covered lab's launches and policy moves. |
| Google DeepMind Blog (top 10) | core | Global (UK/US) | rss | `https://deepmind.google/blog/rss.xml` | verified 2026-10-02; latest 2026-09-30 | no | Official Gemini and research announcements. |
| Anthropic News (unofficial mirror) (top 10) | core | Global (US) | rss | `https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml` | verified 2026-10-02; latest 2026-10-01; UNOFFICIAL community scrape (Anthropic has no official feed). Backup: https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_news_rss.xml (also verified) | no | Anthropic has no official feed; mirror is maintained but could stop, so also watch @AnthropicAI. |
| Hugging Face org release radar (Asian labs) (top 10) | core | CN, JP, KR, IN, SEA | api | `https://huggingface.co/api/models?author={org}&sort=createdAt&direction=-1&limit=20` | verified 2026-10-02 for orgs deepseek-ai, Qwen, moonshotai, zai-org, MiniMaxAI, ByteDance-Seed, baidu, tencent, LGAI-EXAONE, naver-hyperclovax, kakaocorp, sarvamai, aisingapore, SakanaAI, stepfun-ai | no | One JSON API catches model releases from Asian labs that have no blog feed (DeepSeek, Qwen, Kimi, GLM, MiniMax and more). |
| Microsoft Research Blog | secondary | Global (US) | rss | `https://www.microsoft.com/en-us/research/feed/` | verified 2026-10-02; latest 2026-09-30. Note: blogs.microsoft.com/ai/feed/ returns 410 Gone; https://blogs.microsoft.com/feed/ (corporate, verified) is broader | no | Research and product AI news from Microsoft; corporate blog for big partnerships. |
| NVIDIA Newsroom releases | secondary | Global (US) | rss | `https://nvidianews.nvidia.com/releases.xml` | verified 2026-10-02; latest 2026-10-01. Also https://blogs.nvidia.com/feed/ (verified) | no | Chip and infrastructure news that shapes AI supply in Asia. |
| Meta AI Blog (unofficial mirror) | secondary | Global (US) | rss | `https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_meta_ai.xml` | verified 2026-10-02 but STALE (latest 2026-07-27); UNOFFICIAL. ai.meta.com/blog blocks bots (HTTP 400). Use @AIatMeta as primary signal | no | Llama and Meta AI launches; feed unreliable, rely on X. |
| Mistral AI News | secondary | Global (EU) | rss | `https://mistral.ai/news/rss` | verified 2026-10-02; latest 2026-09-28 | no | Leading non-US, non-China open model lab; useful comparison point. |
| Apple Machine Learning Research | secondary | Global (US) | rss | `https://machinelearning.apple.com/rss.xml` | verified 2026-10-02; latest 2026-10-01 | no | On-device AI research relevant to Asia's large iPhone markets. |
| Amazon Science | signal only | Global (US) | rss | `https://www.amazon.science/index.rss` | verified 2026-10-02; latest 2026-10-01 | no | AWS and Amazon AI research; occasional Asia cloud relevance. |
| Hugging Face Blog | secondary | Global | rss | `https://huggingface.co/blog/feed.xml` | verified 2026-10-02; latest 2026-10-02 | no | Open model ecosystem news, often first to explain Chinese open releases. |
| Alibaba (Alizila newsroom) | secondary | CN | rss | `https://www.alizila.com/feed/` | verified 2026-10-02; latest 2026-09-28. Qwen's old blog feed https://qwenlm.github.io/blog/index.xml is verified but STALE (latest 2025-09-22); new blog qwen.ai/blog has no feed | no | Alibaba's official English newsroom, covers Qwen and Alibaba Cloud AI. |
| Sakana AI | secondary | JP | rss | `https://sakana.ai/feed.xml` | verified 2026-10-02; latest 2026-10-02 | no | Japan's best-known frontier AI startup; strong research output. |
| Sarvam AI | secondary | IN | rss | `https://www.sarvam.ai/rss.xml` | verified 2026-10-02; latest 2026-09-29 | no | India's leading sovereign-model lab. |
| AI Singapore / SEA-LION | secondary | SEA | rss | `https://sea-lion.ai/feed/` | verified 2026-10-02; latest 2026-09-18. aisingapore.org/feed/ verified but STALE (latest 2025-09-02) | no | Southeast Asia's main regional language model programme. |
| Kakao Tech Blog | signal only | KR | rss | `https://tech.kakao.com/feed/` | verified 2026-10-02; latest 2026-10-01; Korean language | no | Korean AI product engineering from KakaoTalk's maker; needs translation. |
| Together AI Blog | signal only | Global (US) | rss | `https://www.together.ai/blog/rss.xml` | verified 2026-10-02; latest 2026-09-30 | no | Fast take-up of open models, often hosts Chinese open releases first in the US. |
| DeepSeek | core | CN | x + hf | `https://api-docs.deepseek.com/news (no feed: scrape)` | no feed found; covered by HF radar (deepseek-ai) and @deepseek_ai | no | Most-watched Chinese lab; releases land on HF and X first. |
| Moonshot AI (Kimi) | secondary | CN | x + hf | `https://www.moonshot.ai/ (no feed)` | no feed found; covered by HF radar (moonshotai) and @Kimi_Moonshot | no | Major Chinese model lab (Kimi); KrASIA reports it is preparing a Hong Kong IPO. |
| Zhipu / Z.ai (GLM) | secondary | CN | x + hf | `https://z.ai/ (no feed; z.ai/blog returns 404)` | no feed found; covered by HF radar (zai-org) and @Zai_org | no | Chinese GLM model family; frequent open-weight releases. |
| MiniMax | secondary | CN | x + hf | `https://www.minimax.io/news (no feed: scrape)` | no feed found; covered by HF radar (MiniMaxAI) and @MiniMax_AI | no | Chinese multimodal, video and agent models. |
| ByteDance Seed | secondary | CN | x + hf | `https://seed.bytedance.com/en/blog (no feed: scrape)` | no feed found; covered by HF radar (ByteDance-Seed) | no | ByteDance's research arm behind Doubao and Seedance. |
| Baidu | signal only | CN | x + hf | `https://ir.baidu.com/ (403 to bots; no feed)` | no feed found; covered by HF radar (baidu) and @Baidu_Inc | no | ERNIE models and robotaxi; investor relevance. |
| Tencent Hunyuan | secondary | CN | x + hf | `https://hunyuan.tencent.com/ (no feed)` | no feed found; covered by HF radar (tencent) and @TencentHunyuan | no | Tencent's model family, embedded in WeChat-scale products. |
| LG AI Research (EXAONE) | signal only | KR | hf | `https://www.lgresearch.ai/news (no feed: scrape)` | no feed found; covered by HF radar (LGAI-EXAONE) | no | Korea's main corporate frontier model lab. |
| Naver (HyperCLOVA X) | signal only | KR | hf | `https://clova.ai/en/tech-blog (no feed)` | no feed found; HF radar (naver-hyperclovax) quiet since 2025-12 | no | Korea's largest internet company's model; sovereign AI angle. |
| Samsung Newsroom | signal only | KR | scrape | `https://news.samsung.com/global/` | feed https://news.samsung.com/global/feed returns 403 to bots: unverified | no | Memory chips and Galaxy AI; feed blocked, cover through news outlets. |

## 2. Asia-focused news and newsletters (27)

| Source | Tier | Region | Access | Feed or endpoint | Status | Paywall | Why |
|---|---|---|---|---|---|---|---|
| SCMP Tech (top 10) | core | HK, CN | rss | `https://www.scmp.com/rss/36/feed` | verified 2026-10-02; latest 2026-10-02 (also 'Big Tech' feed /rss/320663/feed) | partial (metered) | Hong Kong's paper of record with the deepest English coverage of China and HK tech. |
| KrASIA (top 10) | core | CN, SEA | rss | `https://console.kr-asia.com/feed` | verified 2026-10-02; latest 2026-10-02 (kr-asia.com/feed returns 404) | no | English arm of 36Kr; China and Southeast Asia tech business news. |
| Rest of World (top 10) | core | Asia and Global South | rss | `https://restofworld.org/feed/` | verified 2026-10-02; latest 2026-10-01 | no | High-quality reporting on tech outside the West, strong on Asia. |
| Tech in Asia (top 10) | core | SEA, Asia | rss | `https://www.techinasia.com/feed` | verified 2026-10-02; latest 2026-10-02 | partial | Pan-Asian startup and AI news, strong on Southeast Asia. |
| Recode China AI (top 10) | core | CN | rss | `https://recodechinaai.substack.com/feed` | verified 2026-10-02; latest 2026-09-28 | freemium | Weekly analysis of Chinese AI companies, models and strategy. |
| Pandaily | secondary | CN | rss | `https://pandaily.com/feed/` | verified 2026-10-02; latest 2026-10-02 | no | Daily English coverage of Chinese tech launches. |
| TechNode | secondary | CN | rss | `https://technode.com/feed/` | verified 2026-10-02 with lenient parser (strict XML parse fails); latest 2026-10-02 | no | Long-running China tech outlet. |
| Nikkei Asia | secondary | JP, Asia | rss | `https://asia.nikkei.com/rss/feed/nar` | verified 2026-10-02 (50 items, no dates in feed); all-sections feed, no tech-only feed found | yes | Best Japan and pan-Asia business coverage; filter for AI. |
| The Information | secondary | Global, CN | rss | `https://www.theinformation.com/feed` | verified 2026-10-02; latest 2026-10-02; headlines only | yes | Scoops on Chinese and US AI companies; use headlines as leads, confirm elsewhere. |
| ChinaTalk | secondary | CN | rss | `https://www.chinatalk.media/feed` | verified 2026-10-02; latest 2026-10-01 | freemium | Deep China tech and policy analysis and interviews. |
| AI Proem | secondary | CN, Asia | rss | `https://aiproem.substack.com/feed` | verified 2026-10-02; latest 2026-09-30 | freemium | Asia-focused AI business newsletter. |
| ChinAI (Jeffrey Ding) | secondary | CN | rss | `https://chinai.substack.com/feed` | verified 2026-10-02; latest 2026-09-21 | freemium | Translations of Chinese AI writing; unique primary-language insight. |
| Hello China Tech (Poe Zhao) | secondary | CN | rss | `https://hellochinatech.com/feed` | verified 2026-10-02; latest 2026-10-02 | freemium | China tech analysis for investors and builders. |
| High Capacity (Kyle Chan) | signal only | CN | rss | `https://www.highcapacity.org/feed` | verified 2026-10-02; latest 2026-09-18 | freemium | China industrial and AI policy analysis. |
| Interconnected (Kevin Xu) | signal only | CN, US | rss | `https://interconnected.blog/rss/` | verified 2026-10-02; latest 2026-09-29 | freemium | US-China tech and investing perspective. |
| e27 | secondary | SEA | rss | `https://e27.co/feed/` | verified 2026-10-02; latest 2026-10-02 | no | Southeast Asia startup ecosystem news. |
| Inc42 | secondary | IN | rss | `https://inc42.com/feed/` | verified 2026-10-02; latest 2026-10-02 | partial | Indian startup and AI news. |
| MediaNama | secondary | IN | rss | `https://www.medianama.com/feed/` | verified 2026-10-02; latest 2026-10-01 | partial | Indian tech policy and regulation. |
| The Ken | signal only | IN, SEA | rss | `https://the-ken.com/feed/` | verified 2026-10-02; latest 2026-10-02 | yes | Paywalled long reads on Indian and SEA business; headlines as leads. |
| Korea Times Tech | secondary | KR | rss | `https://www.koreatimes.co.kr/www/rss/tech.xml` | verified 2026-10-02; latest 2026-10-02 | no | English Korean tech news (Korea JoongAng Daily returns 403 to bots). |
| Korea Herald (all news) | signal only | KR | rss | `https://www.koreaherald.com/rss/newsAll` | verified 2026-10-02; latest 2026-10-02; all sections | no | Korean business news; filter for AI. |
| The Bridge (Japan) | signal only | JP | rss | `https://thebridge.jp/en/feed` | verified 2026-10-02; latest 2026-10-02 | no | Japanese startup news in English. |
| CNA Business/Tech | secondary | SEA | rss | `https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936` | verified 2026-10-02; latest 2026-10-02; category 6936 is business (Singapore) | no | Singapore broadcaster; regional business and tech. |
| Business Times Singapore Tech | secondary | SEA | rss | `https://www.businesstimes.com.sg/rss/technology` | verified 2026-10-02; latest 2026-10-02 | partial | Singapore business daily's tech section, often covers China AI. |
| iThome (Taiwan) | signal only | TW | rss | `https://www.ithome.com.tw/rss` | verified 2026-10-02 (30 items); Traditional Chinese | no | Taiwan IT and chip supply chain; needs translation. |
| Caixin Global | signal only | CN | scrape | `https://www.caixinglobal.com/` | advertised feed https://gateway.caixin.com/api/data/global/feedlyRss.xml returns HTTP 406: unverified | yes | Respected Chinese business journalism; paywalled and no working feed. |
| DealStreetAsia | signal only | Asia | email | `https://www.dealstreetasia.com/` | feed https://www.dealstreetasia.com/feed/ disabled for bots (503): unverified; use newsletter | yes | AI funding and M&A across Asia; investor angle. |

## 3. Global AI newsletters and outlets (17)

| Source | Tier | Region | Access | Feed or endpoint | Status | Paywall | Why |
|---|---|---|---|---|---|---|---|
| Import AI (Jack Clark) | core | Global | rss | `https://importai.substack.com/feed` | verified 2026-10-02; latest 2026-09-28 (mirror jack-clark.net/feed also verified) | no | Weekly research digest that regularly covers Chinese labs. |
| The Verge AI | secondary | Global (US) | rss | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` | verified 2026-10-02; latest 2026-10-02 | no | Broad consumer AI coverage; good catch-all. |
| TechCrunch AI | secondary | Global (US) | rss | `https://techcrunch.com/category/artificial-intelligence/feed/` | verified 2026-10-02; latest 2026-10-01 | no | Launches and funding; catch-all. |
| MIT Technology Review AI | secondary | Global | rss | `https://www.technologyreview.com/topic/artificial-intelligence/feed` | verified 2026-10-02; latest 2026-10-02 | partial | Explanatory pieces with good China coverage. |
| Ars Technica AI | secondary | Global (US) | rss | `https://arstechnica.com/ai/feed/` | verified 2026-10-02; latest 2026-10-01 | no | Careful, technical, sceptical reporting. |
| FT Artificial Intelligence | secondary | Global | rss | `https://www.ft.com/artificial-intelligence?format=rss` | verified 2026-10-02; latest 2026-10-02; headlines | yes | Strong China tech correspondents; headlines as leads. |
| Bloomberg Technology | signal only | Global | rss | `https://feeds.bloomberg.com/technology/news.rss` | verified 2026-10-02; latest 2026-10-02; headlines | yes | Market-moving scoops; headlines as leads. |
| Semafor (all sections) | signal only | Global | rss | `https://www.semafor.com/rss.xml` | verified 2026-10-02; latest 2026-10-02; no tech-only feed found | no | Tech newsletter content appears in the all-sections feed; filter for AI. |
| Interconnects (Nathan Lambert) | secondary | Global | rss | `https://www.interconnects.ai/feed` | verified 2026-10-02; latest 2026-09-22 | freemium | Best analysis of open models, including Chinese releases. |
| Latent Space / AINews | secondary | Global (US) | rss | `https://www.latent.space/feed` | verified 2026-10-02; latest 2026-10-02 (includes AINews daily recaps) | freemium | Daily AI engineering recap; good completeness check. |
| Simon Willison | secondary | Global | rss | `https://simonwillison.net/atom/everything/` | verified 2026-10-02; latest 2026-10-01 | no | Hands-on testing of new models and tools; reliable. |
| Ben's Bites | signal only | Global | rss | `https://www.bensbites.com/feed` | verified 2026-10-02; latest 2026-10-01 | no | Popular product-focused AI newsletter. |
| TLDR AI | signal only | Global | rss | `https://tldr.tech/api/rss/ai` | verified 2026-10-02; latest 2026-10-01 | no | Daily link roundup; useful to check nothing big was missed. |
| Last Week in AI | signal only | Global | rss | `https://lastweekin.ai/feed` | verified 2026-10-02; latest 2026-09-30 | no | Weekly roundup; same cadence as Edge Weekly, good cross-check. |
| One Useful Thing (Ethan Mollick) | signal only | Global | rss | `https://www.oneusefulthing.org/feed` | verified 2026-10-02; latest 2026-10-01 | no | AI at work for general professionals; matches the wider audience. |
| Epoch AI | signal only | Global | rss | `https://epochai.substack.com/feed` | verified 2026-10-02; latest 2026-09-28 | no | Data on compute, costs and trends; good for 'why it matters' context. |
| The Batch (DeepLearning.AI) | signal only | Global | email | `https://www.deeplearning.ai/the-batch/` | no feed found (/the-batch/feed/ 404): subscribe by email | no | Andrew Ng's weekly; email only. |

## 4. Policy and regulation (10)

| Source | Tier | Region | Access | Feed or endpoint | Status | Paywall | Why |
|---|---|---|---|---|---|---|---|
| HK Digital Policy Office news (top 10) | core | HK | rss | `https://www.digitalpolicy.gov.hk/en/news/latest/rss.data.xml` | verified 2026-10-02; latest 2026-10-02 | no | Official HK government AI and digital policy announcements. |
| HK Government press releases | secondary | HK | rss | `https://www.info.gov.hk/gia/rss/general_en.xml` | verified 2026-10-02; latest 2026-10-02; all departments, filter for AI | no | Catches AI items from any HK bureau (ITIB, InnoHK, Cyberport funding). |
| HKMA press releases | secondary | HK | rss | `https://www.hkma.gov.hk/eng/other-information/rss/rss_press-release.xml` | verified 2026-10-02; latest 2026-09-29 (circulars and insight feeds also verified) | no | GenAI sandbox and banking AI guidance in Hong Kong. |
| PCPD (Hong Kong privacy, PDPO) | secondary | HK | scrape | `https://www.pcpd.org.hk/` | no feed found: scrape media statements or check monthly | no | AI and personal data guidance under the PDPO. |
| Singapore IMDA | secondary | SEA | scrape | `https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches` | no feed found: scrape | no | AI Verify, model governance and SEA-LION funding. |
| Singapore PDPC | signal only | SEA | scrape | `https://www.pdpc.gov.sg/news-and-events` | no feed found: scrape | no | Data protection guidance affecting AI deployments. |
| China CAC (via DigiChina / China Law Translate) | secondary | CN | scrape | `https://www.cac.gov.cn/ (Chinese, no feed)` | no feed; DigiChina feed returns 0 items; China Law Translate advertises /en/feed/ but returned HTML: unverified | no | Generative AI filings and rules; rely on translations and news outlets. |
| Japan AI Safety Institute (J-AISI) | signal only | JP | scrape | `https://aisi.go.jp/` | no feed found: scrape (mostly Japanese) | no | Japan's AI safety and evaluation work. |
| Korea MSIT | signal only | KR | scrape | `https://www.msit.go.kr/eng/` | site failed TLS handshake from test box: unverified | no | Korea AI Basic Act implementation. |
| India MeitY / PIB | signal only | IN | rss | `https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3` | feed verified 2026-10-02 but returned Hindi items; English parameters unverified. meity.gov.in has no feed | no | IndiaAI Mission announcements. |

## 5. Research and signal sources (6)

| Source | Tier | Region | Access | Feed or endpoint | Status | Paywall | Why |
|---|---|---|---|---|---|---|---|
| arXiv cs.CL / cs.AI | signal only | Global | rss | `https://rss.arxiv.org/rss/cs.CL` | verified 2026-10-02 (cs.AI and cs.LG also verified; hundreds of items a day) | no | Raw research firehose; use only to confirm papers behind news. |
| Hugging Face Daily Papers | secondary | Global | api | `https://huggingface.co/api/daily_papers` | verified 2026-10-02 (JSON with upvotes). Unofficial RSS mirror https://papers.takara.ai/api/feed also verified | no | Community-upvoted papers; a quick way to spot notable Asian research. |
| Hugging Face trending models | secondary | Global | api | `https://huggingface.co/api/models?sort=trendingScore&limit=20` | verified 2026-10-02 | no | Shows which new models people are actually downloading. |
| GitHub trending (unofficial RSS) | signal only | Global | rss | `https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml` | verified 2026-10-02; latest 2026-10-01; UNOFFICIAL | no | Spots breakout open-source AI tools; no official feed exists. |
| LMArena / Arena leaderboard | signal only | Global | x + scrape | `https://lmarena.ai/leaderboard` | no feed found; follow @arena on X | no | Head-to-head model rankings; Papers with Code has shut down (redirects to HF Papers). |
| Artificial Analysis | signal only | Global | x + scrape | `https://artificialanalysis.ai/` | no feed found; follow @ArtificialAnlys | no | Independent price and speed benchmarks across Chinese and US models. |

## 6. Hacker News (signal only)

| Source | Endpoint | Status | Use |
|---|---|---|---|
| Hacker News (Algolia search API) | `https://hn.algolia.com/api/v1/search_by_date?tags=story&query={q}&numericFilters=points%3E{n},created_at_i%3E{unix}` | verified 2026-10-02 (e.g. query=deepseek, points>50 returned stories from 2026-09-26 to 2026-10-02; tags=front_page also works) | Best way to pull a week of high-scoring AI stories with keyword and points filters. |
| Hacker News (official Firebase API) | `https://hacker-news.firebaseio.com/v0/topstories.json (+ /v0/item/{id}.json, /v0/beststories.json)` | verified 2026-10-02 (500 top story ids, item lookup works) | Official, no key needed; use for current front page and comment counts. |
| Hacker News (hnrss.org) | `https://hnrss.org/newest?q=LLM+OR+DeepSeek+OR+Qwen&points=50` | verified 2026-10-02 (20 items). Also verified: https://hnrss.org/newest?q=AI&points=100, https://hnrss.org/frontpage?points=200, https://hnrss.org/best. Flaky: some calls returned TLS errors or 502, so retry | Zero-code keyword and points feeds; third-party service, so keep Algolia as the fallback. |

How to use it:
- Once a week, query Algolia for stories from the last 7 days (`created_at_i>` the window start) with points above about 100, across a keyword set: `DeepSeek`, `Qwen`, `Kimi`, `GLM`, `MiniMax`, `Hunyuan`, `China AI`, `Japan AI`, `Korea AI`, `India AI`, `Singapore AI`, plus a general `LLM` and `AI` pass at a higher threshold (about 200).
- Use the points and comment counts as a "did this break through" signal when ranking. An Asian lab release with 300 points on HN is a strong pick.
- **US skew:** HN's audience is mostly US and European developers. It over-weights developer tools and US companies, and under-covers Asian business, policy and consumer AI. Never use HN as the source of record. Link to the original article, and don't let missing HN attention lower an Asia story's rank.
- hnrss.org is a free third-party service and was flaky during testing (TLS errors and a 502 on some calls). Retry, and fall back to the Algolia API.

## 7. X (signal only)

Fabio's X connector is live and the handles below were confirmed through the X API (`get_users_by_usernames`) on 2 October 2026. Follower counts are rounded. The list leans towards Asian labs, researchers and journalists. Global labs are already covered by feeds.

| Handle | Who | Type | Region | Followers | Tier | Why |
|---|---|---|---|---|---|---|
| [@deepseek_ai](https://x.com/deepseek_ai) | DeepSeek | Asian lab | CN | 1.14M | core | Releases often appear here first. |
| [@Alibaba_Qwen](https://x.com/Alibaba_Qwen) | Qwen (Alibaba) | Asian lab | CN | 293K | core | Qwen model and tool launches. |
| [@Kimi_Moonshot](https://x.com/Kimi_Moonshot) | Kimi (Moonshot AI) | Asian lab | CN | 365K | core | Kimi model launches. |
| [@Zai_org](https://x.com/Zai_org) | Z.ai (Zhipu, GLM) | Asian lab | CN | 163K | secondary | GLM releases. |
| [@MiniMax_AI](https://x.com/MiniMax_AI) | MiniMax | Asian lab | CN | 125K | secondary | Multimodal and agent model launches. |
| [@TencentHunyuan](https://x.com/TencentHunyuan) | Tencent Hunyuan | Asian lab | CN | 53K | secondary | Tencent model releases. |
| [@StepFun_ai](https://x.com/StepFun_ai) | StepFun | Asian lab | CN | 15K | signal only | Smaller Chinese lab with notable open models. |
| [@SakanaAILabs](https://x.com/SakanaAILabs) | Sakana AI | Asian lab | JP | 141K | secondary | Japan's leading frontier startup. |
| [@SarvamAI](https://x.com/SarvamAI) | Sarvam | Asian lab | IN | 86K | secondary | India's sovereign model lab. |
| [@hardmaru](https://x.com/hardmaru) | David Ha (Sakana AI CEO) | Asian lab researcher | JP | 439K | secondary | Research and Japan AI ecosystem commentary. |
| [@JustinLin610](https://x.com/JustinLin610) | Junyang Lin | Asian lab researcher | CN | 94K | signal only | Long-time Qwen lead; bio now says 'building p7k', so check his current role. |
| [@kaifulee](https://x.com/kaifulee) | Kai-Fu Lee | Asian AI leader | CN | 1.33M | signal only | 01.AI and Sinovation; China AI industry view. |
| [@EleanorOlcott](https://x.com/EleanorOlcott) | Eleanor Olcott (FT) | Journalist | CN | 10K | secondary | FT China tech correspondent in Beijing. |
| [@ZeyiYang](https://x.com/ZeyiYang) | Zeyi Yang (NYT) | Journalist | CN | 16K | secondary | China and science reporting. |
| [@SCMPTech](https://x.com/SCMPTech) | SCMP Tech | Journalist/outlet | HK | 3.6K | secondary | SCMP tech desk. |
| [@restofworld](https://x.com/restofworld) | Rest of World | Journalist/outlet | Asia | 72K | signal only | Non-Western tech reporting. |
| [@poezhao0605](https://x.com/poezhao0605) | Poe Zhao | Analyst | CN | 9.7K | secondary | China tech for investors and builders. |
| [@kevinsxu](https://x.com/kevinsxu) | Kevin S. Xu | Analyst/investor | CN, US | 18K | secondary | US-China tech and investing. |
| [@jjding99](https://x.com/jjding99) | Jeffrey Ding (ChinAI) | Researcher | CN | 9.8K | secondary | Chinese-language AI sources in translation. |
| [@kyleichan](https://x.com/kyleichan) | Kyle Chan (Brookings) | Researcher | CN | 51K | secondary | China AI, chips and industrial policy. |
| [@mattsheehan88](https://x.com/mattsheehan88) | Matt Sheehan (Carnegie) | Researcher | CN | 18K | secondary | China AI regulation expert. |
| [@ruima](https://x.com/ruima) | Rui Ma (Tech Buzz China) | Analyst | CN | 81K | secondary | China consumer AI and tech trends. |
| [@jordanschneider](https://x.com/jordanschneider) | Jordan Schneider (ChinaTalk) | Analyst | CN | 58K | signal only | China tech policy and interviews. |
| [@ZhihuFrontier](https://x.com/ZhihuFrontier) | Zhihu Frontier | Community | CN | 12K | signal only | Brings Chinese AI community discussion into English. |
| [@arena](https://x.com/arena) | Arena (LMArena) | Benchmark | Global | 232K | signal only | Leaderboard moves when new Asian models land. |

Optional, use with care: [@teortaxesTex](https://x.com/teortaxesTex) (77K, a very fast DeepSeek watcher, but openly partisan) and [@tphuang](https://x.com/tphuang) (37K, China tech, opinionated). Global extras if budget allows: @karpathy, @simonw, @natolambert, @jackclarkSF, @_akhaliq (papers), @ArtificialAnlys (benchmarks). Handles that did not resolve: `MiniMax__AI` (the correct one is `MiniMax_AI`), `jordanschnyc`, `Nikkei_Asia` (the correct one is `NikkeiAsia`), `KrASIA` and `ChinaTalkMedia`.

**How to pull it.** Put the accounts in one private X List and read the list's posts once a week. That's cheaper and simpler than reading 25 separate timelines, and it needs no user lookups because the IDs are already known. Then run a few recent searches. Recent search covers the last 7 days, which matches the weekly window. Suggested queries (standard v2 operators):
1. `(DeepSeek OR Qwen OR Kimi OR GLM OR MiniMax OR Hunyuan OR Doubao OR ERNIE OR StepFun) (release OR launch OR "open source" OR "open weights") -is:retweet -is:reply lang:en`
2. `("Hong Kong" OR HKMA OR Cyberport OR HKSTP OR "Digital Policy Office") (AI OR "generative AI" OR LLM) -is:retweet lang:en`
3. `(Singapore OR IMDA OR "SEA-LION" OR Indonesia OR Vietnam OR Malaysia OR Sarvam OR IndiaAI) ("AI model" OR LLM OR "generative AI") -is:retweet lang:en`
4. `(Sakana OR SoftBank OR EXAONE OR HyperCLOVA OR Kakao OR "SK hynix") (AI OR LLM) -is:retweet lang:en`
5. Optional Chinese-language pass: `(大模型 OR 开源模型) (发布 OR 开源) -is:retweet lang:zh` (needs translation; signal only)

**Cost and limits** (from the X API pricing page at docs.x.com, fetched 2 October 2026; prices can change):
- Pay per use, no subscription. Credits are bought upfront.
- Reading a post costs $0.005, a user lookup $0.010, and list posts $0.005 per post.
- Creating a list costs $0.010 and each list change $0.005, so setting up a 25-member list is roughly $0.14 one-off.
- The same post returned more than once in a UTC day is billed once.
- Monthly cap of 3 million post reads (not a constraint here).
- Posting to X costs $0.015, or **$0.200 if the post contains a URL**. That matters if Edge Weekly auto-posts links.
- Estimate (my assumption, not a quote): capping the weekly list read at about 500 posts and the 5 searches at about 50 posts each comes to about 750 reads a week, or roughly $3.75 a week and $15 to $16 a month. Tighter caps (300 list posts, 20 per search) bring it to about $8 a month. This was not in the earlier rebuild plan's cost estimate, so add it.
- Fabio's connected X account currently shows $26.70 in free credit, valid until 6 September 2027. At the tighter caps that covers about 3 months.

## Notable gaps
- **No feeds from most Chinese labs:** DeepSeek, Moonshot, Zhipu, MiniMax, ByteDance Seed, Baidu and Tencent have no working feeds. Qwen's new blog has none either, and its old feed has been stale since September 2025. Covered by the Hugging Face org API and X, which catch model releases but not business news.
- **Mainland Chinese-language media:** not included (for example 36Kr, Jiqizhixin, QbitAI). The English intermediaries above (KrASIA, Pandaily, ChinAI, Recode China AI) partly fill this. Adding one or two Chinese-language sources with translation would make Edge Weekly much stronger.
- **Japan and Korea are thin:** there's no Nikkei tech-only feed (only the all-sections feed, with no dates), Korea JoongAng Daily blocks bots (403), and Samsung's newsroom blocks bots. Japanese-language tech media is missing.
- **Regulators rarely publish feeds:** PCPD, IMDA, PDPC, CAC, Japan's AISI, Korea's MSIT and MeitY have none that I could verify. Plan a small page scraper or a monthly manual check. Hong Kong is well covered (Digital Policy Office, HKMA and government press release feeds all verified).
- **Paywalled:** Nikkei Asia, The Information, FT, Bloomberg, The Ken, Caixin, DealStreetAsia. Use their headlines as leads and confirm the story elsewhere before citing.
- **Broken, blocked, empty or stale:**
  - Caixin's advertised feed returns 406.
  - DealStreetAsia's feed is disabled for bots.
  - Analytics India Magazine's feed returns HTML.
  - China Law Translate's feed returned HTML.
  - DigiChina's feed has 0 items.
  - The Synced and SemiAnalysis feeds are stale (latest items August and September 2025), so neither is listed as active.
- **No feeds at all:** LMArena and Artificial Analysis (follow them on X). Papers with Code has shut down and now redirects to Hugging Face Papers.
- **Unofficial mirrors:** the Anthropic and Meta AI feeds are community scrapes on GitHub, and GitHub trending is an unofficial RSS. Any of them could stop without notice, so monitor how many items each source delivers per day.

## Maintenance
- Store sources in the `sources` table with tier, region and status. Alert when a feed returns errors or no new items for 14 days.
- Re-run the feed checker (`feedcheck/check.py` on the box) monthly.
- Review tiers every quarter, using which sources actually ended up in published editions.
