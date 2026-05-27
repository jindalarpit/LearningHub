// System Design — Case Study Modules

export const CASE_STUDIES = [
  // ==================== GENERIC CASE STUDIES ====================
  {
    id: "url-shortener",
    num: "IX",
    stage: "Generic Case Studies",
    name: "URL Shortener (TinyURL)",
    tagline: "The classic warm-up. Don't underestimate it.",
    readTime: "20 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: shorten a long URL to a short one (e.g., bit.ly/abc123). Redirect short → long with HTTP 301/302. Optional: custom aliases, expiration, click analytics. Non-functional: redirect latency p99 < 100ms, 99.99% availability (URLs must always resolve), URLs are immutable once created. Scale: assume 100M new URLs/day (~1.2K writes/sec average, ~5K peak), 10B redirects/day (~120K reads/sec average, ~500K peak). Read:write ratio = 100:1. Storage: 100M URLs/day × 365 days × 5 years × ~500 bytes/record ≈ 90 TB.",
      },
      {
        kind: "prose",
        heading: "The short code generation problem",
        body:
          "Three approaches. (1) Hash the long URL with MD5/SHA, take first 7 chars, base62-encode. Problem: collisions. Two different URLs hashing to the same prefix means one redirect goes wrong. Need to detect and rehash. (2) Counter + base62: maintain a global counter, encode as base62. 7 chars in base62 = 62⁷ ≈ 3.5 trillion URLs. Problem: counter is a global hot spot. Mitigation: each app server pre-allocates ranges of IDs (e.g., counter chunks of 10000) from a coordinator. (3) Random + collision check: generate 7 random base62 chars, attempt insert; on conflict, retry. Probability of collision per attempt at low fill: ~1/(62⁷). Production systems usually combine: counter-allocated ranges per region.",
      },
      {
        kind: "diagram",
        heading: "URL shortener architecture",
        anim: "url-shortener",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "Bitly", note: "Counter-based with base62. Heavy investment in real-time analytics — separate event pipeline (Kafka → analytics store) for click tracking. Source: Bitly engineering blog." },
          { company: "Twitter t.co", note: "All Twitter URLs go through t.co for security scanning + tracking. Decoupled from URL shortening — focus is on click-time decoration, not just redirection." },
          { company: "Google goo.gl (deprecated 2018)", note: "Was deprecated in favor of Firebase Dynamic Links. Lesson: even simple services have lifecycle considerations and ecosystem decisions, not just technical ones." },
        ],
      },
      {
        kind: "prose",
        heading: "Caching is everything",
        body:
          "Read:write 100:1 means redirects dominate. Hot URLs (a few celebrity tweets) drive most traffic. Strategy: (1) CDN edge cache for the redirect itself — many shorteners do this, with TTL aligned to URL expiration. CDN cache hit = ~5ms latency from anywhere globally. (2) Distributed cache (Redis) layer between app and DB — even 50% hit rate cuts DB load in half. (3) DB only for cache misses and writes. With this, the DB sees maybe 1-5K QPS instead of 500K, easily handled by a single Postgres or sharded MySQL.",
      },
      {
        kind: "prose",
        heading: "Storage choice",
        body:
          "Schema is trivial: short_code (PK) → long_url, created_at, user_id, expires_at. Access pattern is exclusively key lookup by short_code. Could use: (a) Postgres — works fine to ~500GB; sharded by short_code beyond. (b) DynamoDB — natural fit, key-value access pattern, scales horizontally automatically. (c) Cassandra — write-heavy fine, but we're read-heavy, so overkill. The principal answer: 'I'd use DynamoDB or sharded MySQL by short_code, with Redis cache in front. Postgres if traffic is moderate; the real engineering is in the cache and CDN, not the DB.'",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "URL shortener is deceptively simple. Junior candidates jump to 'use a hash function, store in DB.' Senior covers caching and capacity. Principal addresses: counter coordination across regions, the read:write asymmetry justifying CDN investment, what happens when a celebrity tweet drives 1M QPS to one URL (hot key — replicate to all caches), abuse prevention (URLs that point to malware — security scanning at write time), and how analytics tracking integrates without slowing down redirects (async event pipeline, never block the redirect).",
      },
    ],
  },

  {
    id: "news-feed",
    num: "X",
    stage: "Generic Case Studies",
    name: "News Feed (Twitter, Facebook)",
    tagline: "Push vs pull vs hybrid. Why the right answer changes with scale.",
    readTime: "30 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: users post; users see a chronological (or ranked) feed of posts from people they follow. Like, comment, retweet. Non-functional: feed load p99 < 500ms, post-to-feed visibility < 5 seconds for active users, eventual consistency OK. Scale: 300M DAU, average 200 follows per user, 5 posts per user per day. Read:write ratio 1000:1 (feed loads dominate). The interesting design question: how do you generate a personalized feed for 300M users when the underlying data is petabytes of posts?",
      },
      {
        kind: "prose",
        heading: "Push vs pull — the central tradeoff",
        body:
          "Push (fan-out on write): when user A posts, immediately copy the post into the feeds of all of A's followers. Read is then a simple key-value lookup of A's pre-computed feed. Reads are O(1) and fast. The problem: celebrities. A user with 100M followers posting once requires 100M feed inserts. Storage cost is also large — every post is stored once per follower. Pull (fan-out on read): when user X loads their feed, query all of X's followees, get their recent posts, merge. Reads are expensive (200 queries + merge); writes are O(1). The problem: feed load latency, which dominates QPS. Hybrid (the actual answer): push for normal users, pull for celebrities. When loading X's feed, fetch the pre-computed push feed AND query celebrity followees on the fly, merge. Twitter, Facebook, Instagram all use hybrid variants.",
      },
      {
        kind: "diagram",
        heading: "Push vs Pull vs Hybrid feed generation",
        anim: "feed-generation",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "Twitter", note: "Hybrid model. Uses Redis-based timeline cache per user. Most posts are pushed via fan-out; celebrities are pulled at read time. Sources: 'The Infrastructure Behind Twitter' (2017 talks), Manhattan key-value store paper." },
          { company: "Facebook", note: "More on the pull side, with extensive caching at multiple layers. Uses TAO (graph cache over MySQL) for the social graph and post lookups. Source: 'TAO: Facebook's Distributed Data Store for the Social Graph' (USENIX 2013)." },
          { company: "Instagram", note: "Hybrid. Uses Cassandra for feed data, Redis for caching. Celebrity threshold tuned over time as posting patterns evolved. Source: Instagram engineering blog." },
          { company: "LinkedIn", note: "Uses Apache Samza for stream processing of social signals into the feed. Heavy on ranking (relevance, not just chronological). Source: 'LinkedIn's Feed Ranking' engineering posts." },
        ],
      },
      {
        kind: "prose",
        heading: "Ranking — when chronological isn't enough",
        body:
          "Modern feeds aren't chronological. They're ranked by predicted engagement (will this user click, like, share?). Architecture: (1) candidate generation — pull a few thousand recent posts the user might see (from follow graph, interests, viral content). (2) Ranking — score each candidate with an ML model (engagement prediction). (3) Re-ranking — apply business rules (diversity, integrity filters, recency boost). (4) Slice off top N for the feed. The ranking model is itself an ML system with its own infrastructure: feature store, model serving, online evaluation, A/B testing framework. Often the largest engineering investment in modern feeds.",
      },
      {
        kind: "prose",
        heading: "Storage — TAO-style social graph",
        body:
          "The social graph (who follows whom) is the read-hot path. Naive approach: a 'follows' table in MySQL. Reads: 'who does user X follow?' becomes a SELECT on indexed user_id — fine at small scale, brutal at 300M users with 200 average follows = 60B edges, queried billions of times per day. Production systems put a graph cache layer (TAO at Facebook, similar at others) over the underlying DB. The cache stores edges and inverted indices (followers-of, followees-of), invalidated on writes. Reads are 99% cache hits at p99 < 5ms. The DB is the durable backing store; the cache is the QPS-handling tier.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Feed design is a senior-vs-principal litmus test. Senior describes push or pull. Principal addresses: hybrid with a celebrity threshold (and how that threshold is tuned), graph cache layer (TAO-style), ranking pipeline as a separate ML system, integrity filters, the cold-start problem for new users (they have no follow graph), and the operational complexity of fan-out under bursty patterns (a celebrity post creates a write storm). Mention specific systems if relevant — 'this is what TAO solves at Facebook.'",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Fan-out on write (push)", def: "On post, replicate to all followers' feeds. Reads are fast; writes are expensive." },
          { term: "Fan-out on read (pull)", def: "On feed load, query followees and merge. Writes are cheap; reads are expensive." },
          { term: "Hybrid fan-out", def: "Push for normal users, pull for celebrities. Threshold tuned per system." },
          { term: "Timeline cache", def: "Per-user pre-computed feed in Redis or similar. Fast feed loads." },
          { term: "TAO", def: "Facebook's social graph cache. Read-through over MySQL with inverse indexing." },
          { term: "Candidate generation", def: "First stage of ranking: gather posts the user might see." },
          { term: "Ranking model", def: "ML model predicting engagement per candidate post. Drives ordering." },
        ],
      },
    ],
  },

  {
    id: "chat-system",
    num: "XI",
    stage: "Generic Case Studies",
    name: "Chat (WhatsApp, Messenger)",
    tagline: "WebSockets, message ordering, delivery receipts, end-to-end encryption.",
    readTime: "28 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: 1:1 chat with text, images, video; group chats up to N members; presence (online/offline); message read receipts; message ordering. Non-functional: message delivery p99 < 300ms; messages must not be lost; ordering preserved per conversation; works on flaky mobile networks. Scale: WhatsApp has 2B users, ~100B messages/day. ~1.2M messages/sec average, ~5M peak. Storage: most messages aren't stored long-term server-side (E2E encrypted, delivered then deleted), but media is.",
      },
      {
        kind: "prose",
        heading: "Connection model — WebSockets vs polling",
        body:
          "Real-time chat needs server-push: when message arrives for user X, deliver immediately, not on next poll. Three options. (1) Long polling: client opens a request, server holds it until message arrives or timeout. Simple, works through firewalls; high overhead. (2) Server-Sent Events (SSE): one-way server-to-client over HTTP. Good for notifications. (3) WebSockets: bidirectional, persistent. The standard for chat. Connection management becomes a real problem — at 100M concurrent WebSocket connections, you need 100K+ servers (each handles ~1M connections at most). Connection-handling tier (Erlang/Elixir or Go) is decoupled from message routing.",
      },
      {
        kind: "diagram",
        heading: "Chat message delivery, end to end",
        anim: "chat",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "WhatsApp", note: "Built on Erlang for connection management — a single server handles ~1M concurrent connections due to BEAM's lightweight process model. End-to-end encrypted via Signal protocol. Post-delivery, server doesn't store plaintext. Sources: '1 million concurrent connections' WhatsApp talks; Signal protocol paper." },
          { company: "Facebook Messenger", note: "MQTT (lightweight pub-sub) for client-server. HBase for message storage (write-heavy LSM). Source: 'Messenger Technical Talk', Facebook engineering blog." },
          { company: "Slack", note: "Different model — workplace chat with persistent message history. Uses Vitess-sharded MySQL for messages. Real-time via WebSockets. Source: Slack engineering blog series on architecture." },
          { company: "Discord", note: "Cassandra for message storage (later migrated to ScyllaDB for performance). Elixir for connection handling. Source: 'How Discord Stores Trillions of Messages' (2023 blog post)." },
        ],
      },
      {
        kind: "prose",
        heading: "Message ordering — the partition key matters",
        body:
          "Per-conversation ordering is required (you must see Alice's three messages in order). Cross-conversation ordering doesn't matter (Alice's chat with Bob is independent of Alice's chat with Carol). Solution: partition by conversation_id. All messages for a given conversation flow through the same partition (Kafka topic, sharded DB row, etc.) and are processed in order. Within a partition, append-only with monotonic timestamps or sequence numbers. Group chats: same approach, conversation_id is the group ID. Cross-region complications: clock skew. Use vector clocks or hybrid logical clocks (HLC) if multiple regions can concurrently process messages for the same conversation.",
      },
      {
        kind: "prose",
        heading: "Delivery semantics — sent, delivered, read",
        body:
          "Three states: sent (server received from sender), delivered (server pushed to recipient's device), read (recipient viewed). Each is a separate ack flowing back through the system. Sent ack: synchronous, returned to sender on POST. Delivered ack: pushed back to sender when recipient's device acknowledges WebSocket delivery. Read ack: triggered by client when message enters viewport. Each transition is an event in a stream — useful for analytics and the 'two blue checkmarks' UX. The three-stage flow is what makes chat feel responsive on flaky networks: sender sees 'sent' immediately even if recipient is offline.",
      },
      {
        kind: "prose",
        heading: "End-to-end encryption — Signal protocol",
        body:
          "WhatsApp, Signal, Messenger (optional), iMessage all use variants of the Signal protocol. Key properties: forward secrecy (compromise of long-term key doesn't reveal past messages), break-in recovery (if a session key is compromised, future messages are still safe), deniability. Mechanism: Double Ratchet algorithm — combines Diffie-Hellman key exchanges with symmetric ratcheting. Server never sees plaintext; can't read messages even under subpoena. The architectural implication: server-side features (search, smart replies, abuse detection) become impossible in pure E2EE without on-device compute or homomorphic tricks. This is a real product tradeoff, not just a technical one.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Chat at principal level covers: connection handling tier separated from message routing; WebSocket scaling math (connections per server, total servers needed); per-conversation partition key; explicit delivery semantics with the three-stage flow; ordering guarantees and what they don't cover (cross-conversation); E2EE tradeoffs (you give up server-side analytics for privacy). Mention specific tech where relevant — 'I'd build the connection tier in Erlang/Elixir or Go for lightweight connection handling, with a separate message-routing tier in whatever language matches the rest of the org's stack.'",
      },
    ],
  },

  {
    id: "ride-sharing",
    num: "XII",
    stage: "Generic Case Studies",
    name: "Ride-Sharing (Uber, Lyft)",
    tagline: "Geospatial indexing, real-time matching, surge pricing, the dispatch problem.",
    readTime: "28 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: rider requests ride at location L; system finds nearest driver, sends offer, on accept dispatches driver. Track ride in real-time. Calculate ETA. Surge pricing in high-demand areas. Non-functional: matching latency p99 < 5 seconds, location updates from drivers every 4-5 seconds, 99.9% availability. Scale: ~100M rides/day globally, ~5M concurrent active drivers at peak, ~1M location updates/sec. The hard problems: real-time geospatial query at scale, supply-demand matching, surge pricing models.",
      },
      {
        kind: "prose",
        heading: "Geospatial indexing — H3 vs S2 vs geohash",
        body:
          "Need: 'find all drivers within 2km of point P.' Naive scan of 5M drivers is hopeless. Three established approaches. (1) Geohash: divide the world into a grid; each cell has a string ID. Rectangular cells, varying size by latitude (degenerate near poles). (2) Google S2: hierarchical sphere subdivision. More uniform than geohash. Used by Google Maps. (3) Uber H3: hexagonal grid. Hexagons have uniform neighbor distances (squares have diagonal vs side ambiguity). Uber open-sourced H3 specifically for ride-matching. Query becomes: 'find drivers in this hex cell + neighbors,' which is O(log N) with proper indexing.",
      },
      {
        kind: "diagram",
        heading: "Hexagonal geospatial indexing (H3-style)",
        anim: "geo-index",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "Uber", note: "Built H3 hexagonal grid system, open-sourced in 2018. Dispatch service called 'DISCO' (DISpatch & COordination). Heavy investment in Cassandra for trip data, schemaless storage, Apache Flink for stream processing. Sources: 'H3: Uber's Hexagonal Hierarchical Spatial Index' blog, 'Engineering the Architecture Behind Uber's New Driver App'." },
          { company: "Lyft", note: "Uses S2 cells. Heavy use of Envoy (which Lyft created). Real-time geospatial via Redis + custom in-memory indices. Source: Lyft engineering blog on dispatch." },
          { company: "DoorDash", note: "Same class of problem (delivery drivers, restaurants, customers). Uses geohash-based indexing with custom optimizations. Source: DoorDash engineering blog." },
        ],
      },
      {
        kind: "prose",
        heading: "Driver location ingestion — the write-heavy path",
        body:
          "Each driver pings location every 4-5 seconds. 5M drivers × 1 update / 4 sec = 1.25M writes/sec. Two destinations: (1) The 'current location' state — only the latest matters, used for matching. Stored in Redis or in-memory geo index, sharded by hex cell. (2) The historical trajectory — for billing, fraud, analytics. Streamed to Kafka, archived to S3 / data lake. Critical to separate these: the matching path can't tolerate the latency of writing to durable storage. In-memory current state is updated every ping; history is buffered and async.",
      },
      {
        kind: "prose",
        heading: "The matching algorithm",
        body:
          "When a rider requests, the dispatch service: (1) finds candidate drivers in nearby hex cells (typically 5-20 candidates). (2) Computes per-driver score: distance, ETA accounting for traffic, driver acceptance history, fairness considerations. (3) Sends offer to top driver; if rejected/timeout (~10s), offers next. Modern systems use 'batch matching': accumulate ride requests over a small window (5-10 seconds), then solve as a global optimization problem (Hungarian algorithm or variants) for better global outcomes. Pure greedy nearest-driver is suboptimal — sometimes assigning a slightly farther driver to one rider lets another rider get a much closer one.",
      },
      {
        kind: "prose",
        heading: "Surge pricing — supply/demand signal",
        body:
          "When a hex cell has more requests than available drivers, prices increase. Two functions of surge: (1) demand suppression — at higher prices, some riders defer or use alternatives. (2) Supply attraction — drivers move toward surge zones. The math is essentially supply-demand equilibrium computed per hex cell on a rolling window. Updated every minute or so. Architecturally, surge multipliers are a separate read-optimized service queried at fare calculation time. Pricing decisions are auditable (regulators care) — every fare component is logged with the inputs that produced it.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Ride-sharing in interviews tests: geospatial expertise (H3/S2/geohash, with explanation), separation of write paths (current state vs history), matching algorithm (greedy vs batch optimization), surge pricing as a separate service, and end-to-end ride lifecycle (state machine: requested → matched → en-route → started → completed → paid). Bonus signal: discuss multi-region considerations (rider in Bangalore matched with drivers in Bangalore, not Mumbai), data residency (some countries require trip data stay in-country), and how A/B testing works on a real-time matching system (concurrent algorithms running side by side, rider/driver pools partitioned).",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Geohash", def: "String encoding of lat/lon into hierarchical cells. Rectangular, distorts at poles." },
          { term: "S2 cells", def: "Google's spherical hierarchical indexing. More uniform than geohash. Used by Google Maps, Lyft." },
          { term: "H3", def: "Uber's hexagonal hierarchical spatial index. Open source. Hexagons have uniform neighbor distance." },
          { term: "DISCO", def: "Uber's DISpatch & COordination service. Real-time matching engine." },
          { term: "Batch matching", def: "Accumulate ride requests in a window, solve globally for better outcomes than greedy nearest-driver." },
          { term: "Surge multiplier", def: "Price coefficient applied in high-demand cells. Suppresses demand, attracts supply." },
          { term: "ETA prediction", def: "Estimated time of arrival. ML model over historical trip data + current traffic." },
          { term: "Trip state machine", def: "States: requested → matched → en-route → started → completed → paid. Transitions are events." },
        ],
      },
    ],
  },

  {
    id: "video-streaming",
    num: "XIII",
    stage: "Generic Case Studies",
    name: "Video Streaming (YouTube, Netflix)",
    tagline: "ABR, CDN strategy, encoding pipelines, the long tail.",
    readTime: "25 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: upload video; transcode for multiple resolutions/codecs; stream on-demand to clients globally with adaptive bitrate; recommendations; comments/likes. Non-functional: video start time < 2 sec, rebuffer ratio < 1%, 99.99% uptime. Scale: YouTube has 2B users, 1B hours watched per day, 500 hours uploaded per minute. Bandwidth dominates — terabytes per second served at peak. The interesting design: encoding pipeline economics, CDN strategy, and the long-tail content problem.",
      },
      {
        kind: "prose",
        heading: "The encoding pipeline",
        body:
          "User uploads a video — say, 4K at 30fps. Server can't just serve the original file: most viewers are on phones with slower connections, different codecs, varying screens. Pipeline: (1) ingest — upload to object store (S3, GCS). (2) Transcode fan-out — for each output (e.g., 2160p, 1080p, 720p, 480p, 360p, 240p × {H.264, H.265, VP9, AV1}), launch a transcoding job. 6 resolutions × 4 codecs = 24 jobs per video. (3) Each transcode segments the video into 2-10 second chunks, stores each chunk separately. (4) Generate manifest file (HLS or DASH) listing chunks. (5) Push to CDN. The economics: encoding is expensive (~real-time on big videos), but you only pay it once. Streaming is paid every view. Encoding cost amortizes over views.",
      },
      {
        kind: "diagram",
        heading: "Adaptive bitrate streaming (HLS/DASH)",
        anim: "abr",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "YouTube", note: "Custom CDN (Google Edge Network) with massive ISP peering. AV1 codec adoption to reduce bandwidth. Encoding at scale uses Google's data centers. Source: 'Inside YouTube's Video Infrastructure' talks, Google engineering blog." },
          { company: "Netflix", note: "Open Connect — custom CDN appliances co-located inside ISP networks. Per-title encoding (different bitrates per video based on content complexity). Sources: Netflix Tech Blog, 'Open Connect: Netflix's CDN'." },
          { company: "Twitch (live streaming)", note: "Different problem — sub-second latency required. Custom RTMP/WebRTC-based ingest, transcoded in real-time. Source: Twitch engineering blog." },
          { company: "TikTok", note: "Aggressively pre-fetches likely next videos based on viewing patterns. Recommendation system is the core competency, not the streaming stack itself." },
        ],
      },
      {
        kind: "prose",
        heading: "Adaptive bitrate (ABR) — the client-side magic",
        body:
          "The reason video streaming works on terrible networks. Server publishes the video at multiple bitrates (e.g., 5 Mbps, 2 Mbps, 800 Kbps, 400 Kbps) as separate chunked streams. Client downloads chunks, measuring throughput as it goes. If throughput drops, switch to a lower bitrate for the next chunk. If throughput is high and buffer is full, switch up. Algorithms: BBA, BOLA, MPC. Each chunk is independently decodable, so switching is seamless. The client owns this logic — server just makes options available via the manifest. This is what HLS and DASH protocols enable.",
      },
      {
        kind: "prose",
        heading: "CDN strategy — the bandwidth multiplier",
        body:
          "Without CDN, every viewer fetches from origin. With CDN, popular videos are served from edges close to users — single-digit ms latency, no origin load. For Netflix-class scale, content origin → tier-1 ISP peering → tier-2 → user. The 'cache hit ratio' at the edge dominates economics. Long-tail content (videos rarely watched) stays at origin or regional caches; head content (popular) is replicated globally. Pre-positioning: Netflix copies new releases to all Open Connect boxes during off-peak hours, so that when 30M people watch the new season Friday night, no fetch from origin is needed.",
      },
      {
        kind: "prose",
        heading: "The long-tail problem",
        body:
          "YouTube hosts billions of videos, but most viewing is concentrated on the head. Long-tail (rarely watched) videos clog storage and waste encoding budget if pre-encoded into 24 variants each. Solution: tiered encoding. (1) On upload, encode only the most common variants (720p, 360p × H.264). (2) Lazily encode additional variants on first view ('cold start' acceptable for niche content). (3) Aggressively pre-encode all variants for high-momentum content (creator-uploaded videos that gain views fast). (4) Cold storage: rarely watched videos move to cheap object storage (Glacier-class), with multi-second retrieval time accepted for rare playback. Storage and encoding economics force these tiers — pure 'encode everything to everything' would cost orders of magnitude more.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Video streaming at principal level: encoding pipeline as a fan-out batch system; ABR with client-side decision-making; CDN strategy with hit-ratio economics; long-tail tiering; live vs. on-demand differences (live needs sub-second latency — different stack); cost modeling (bandwidth is by far the biggest cost — discuss it). If asked about live streaming specifically, mention the WebRTC vs HLS-LL tradeoff (WebRTC sub-second but harder to scale; HLS-LL ~3s but uses standard CDN).",
      },
    ],
  },

  // ==================== BANKING/FINTECH ====================
  {
    id: "payments",
    num: "XIV",
    stage: "Banking & Fintech",
    name: "Real-Time Payments",
    tagline: "Idempotency, the saga pattern, double-entry, and why everything is async.",
    readTime: "30 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: user A sends money to user B via UPI / instant transfer. Funds move from A's bank to B's bank in seconds. Confirmations to both parties. Reconciliation with banks at end of day. Non-functional: latency p99 < 5 seconds end-to-end (regulators care: UPI mandates ~10s timeouts), 99.99%+ availability (downtime = lost transactions = regulatory pain), strong consistency on funds (NEVER double-spend), full auditability for 10+ years. Scale: UPI processed 18 billion transactions in November 2024 — ~7K TPS average, peaks 25K+ TPS. Real-time payments (RTP, FedNow in US, Faster Payments in UK) have similar scale.",
      },
      {
        kind: "prose",
        heading: "The double-entry ledger — non-negotiable",
        body:
          "Every monetary movement is recorded as two entries: a debit on one account and a credit on another, equal in amount. This is fundamental to accounting and absolute in financial systems. Why: it's impossible to lose money in a true double-entry system without it being detectable — every account balance is sum(credits) - sum(debits), and the global sum across all accounts is always zero. Implementation: each transaction creates ≥ 2 ledger entries atomically. Database choice is critical: must support strong consistency and ACID transactions. Postgres, MySQL, CockroachDB, or specialized ledger databases (TigerBeetle) — never anything eventually consistent for the ledger itself.",
      },
      {
        kind: "diagram",
        heading: "Double-entry ledger entries",
        anim: "ledger",
      },
      {
        kind: "prose",
        heading: "Idempotency — the central correctness mechanism",
        body:
          "Networks fail, retries happen, duplicates are inevitable. If a user retries a payment that already succeeded (but the response was lost), you must NOT double-charge. Solution: every payment request carries a client-generated idempotency key (UUID). Server stores key + result. On retry with the same key: return the original result, don't re-execute. Storage: idempotency keys are kept for the request's natural retry window (24-48 hours typically), then archived. Without idempotency, duplicate payments are catastrophic — and they will happen, because mobile networks. Every fintech payment API (Stripe, Razorpay, UPI rails) requires idempotency keys.",
      },
      {
        kind: "prose",
        heading: "The saga pattern — distributed transactions without 2PC",
        body:
          "A payment touches multiple systems: sender's bank (debit), receiver's bank (credit), fraud check, KYC verification, regulatory reporting, accounting ledger. Traditional 2PC across these is impossible (different orgs, no shared coordinator). The saga pattern: model the transaction as a sequence of local transactions, each with a compensating action if a later step fails. Example: (1) Debit A's account, (2) credit B's account, (3) emit confirmation. If step 2 fails: compensate step 1 by crediting A back. Sagas are eventually consistent — there's a moment where money is 'in flight,' visible in neither account or both. Application logic must handle this state.",
      },
      {
        kind: "diagram",
        heading: "Saga pattern in payments",
        anim: "saga",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "UPI (India)", note: "Run by NPCI. Two-bank coordination: user's bank (PSP) and receiver's bank communicate via NPCI's central switch. Strict 4-tier architecture: customer apps → PSPs → NPCI switch → banks. Source: NPCI technical specifications, RBI publications." },
          { company: "Stripe", note: "Idempotency keys mandatory on writes. Every API call has request_id; servers store result for 24 hours. Heavy use of Postgres with strict transaction discipline. Source: Stripe engineering blog (especially 'Designing robust and predictable APIs with idempotency')." },
          { company: "PayPal", note: "Transition from Java monolith to microservices was famously painful — distributed transactions across formerly co-located code became sagas. Source: PayPal engineering posts on architecture evolution." },
          { company: "TigerBeetle", note: "Specialized double-entry ledger DB. Designed exclusively for financial transactions. Open source. Demonstrates how purpose-built systems beat general DBs at this — millions of TPS on commodity hardware via deterministic processing. Source: tigerbeetle.com." },
        ],
      },
      {
        kind: "prose",
        heading: "Reconciliation — catching errors after the fact",
        body:
          "Even with all the above, errors leak. End-of-day reconciliation: compare your ledger to your bank's reported balance. They MUST match. If they don't, there's a missing or duplicated transaction. Reconciliation pipelines are batch jobs running on settled data, comparing your debits/credits against bank statements. Mismatches generate exception reports for ops investigation. Most large banks have entire teams owning reconciliation. The fact that errors do happen, despite all the preventive engineering, is why this is mandatory. The goal isn't perfection — it's detectable imperfection that can be fixed.",
      },
      {
        kind: "prose",
        heading: "Regulatory and audit requirements",
        body:
          "Every transaction must be auditable for 7-10 years (varies by jurisdiction). Audit data: who, what, when, why, on whose authority, with what idempotency key, resulting in which ledger entries. Stored immutably (append-only audit log, often in object storage). Reportable to regulators on demand. AML (anti-money-laundering) reporting: transactions exceeding thresholds, suspicious patterns flag and report to authorities. Sanctions screening: every transaction checked against OFAC / sanctions lists in real-time. These aren't optional features — they're the price of operating. Architecturally: audit pipeline runs alongside the main payment flow, never in its critical path (audit failures shouldn't block payments — but unaudited payments are a fineable offense).",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Banking is your domain — lean into it. Principal-level signals: explicit double-entry with the math; idempotency keys with TTL; saga pattern with named compensations; reconciliation as a peer to the main flow, not an afterthought; regulatory compliance as architectural, not bolt-on. Mention specific systems where appropriate (UPI's NPCI switch architecture, FedNow's design). Discuss the operational reality: payment systems are inspected; their architecture is reviewed by regulators; engineering choices have audit implications. This is exactly the kind of detail principal interviewers want to hear from a banking-domain candidate.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Double-entry bookkeeping", def: "Every transaction = debit + credit of equal amount. Foundational to accounting." },
          { term: "Idempotency key", def: "Client-generated unique ID. Server stores key + result; retries return cached result, don't re-execute." },
          { term: "Saga pattern", def: "Distributed transaction as sequence of local txns with compensating actions. Eventually consistent." },
          { term: "Compensation", def: "The reverse action for a saga step (e.g., refund to undo a debit). Domain-specific." },
          { term: "Reconciliation", def: "End-of-day comparison of internal ledger to external (bank) reports. Catches lost/duplicated transactions." },
          { term: "Settlement", def: "The actual movement of funds between banks (often net at end-of-day, vs. real-time clearing of the user-facing transfer)." },
          { term: "AML / KYC", def: "Anti-Money-Laundering / Know-Your-Customer. Identity verification + transaction monitoring required by regulators." },
          { term: "OFAC screening", def: "Real-time check of transaction parties against US sanctions lists. Block on hit." },
          { term: "TigerBeetle", def: "Open-source ledger DB designed for high-throughput double-entry transactions." },
        ],
      },
    ],
  },

  {
    id: "fraud-detection",
    num: "XV",
    stage: "Banking & Fintech",
    name: "Fraud Detection Pipeline",
    tagline: "Real-time scoring, feature stores, the precision-recall game.",
    readTime: "25 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: every payment is scored for fraud risk in real-time. High-risk: block. Medium-risk: step-up authentication (OTP). Low-risk: pass through. Continuously learn from outcomes (chargebacks, disputes). Non-functional: scoring latency p99 < 50ms (in payment critical path), false positive rate low (legit users blocked is bad UX), recall of actual fraud high. Scale: at 10K TPS payment volume, fraud must score 10K decisions/sec. The interesting tension: ML needs lots of features and complex models for accuracy; payment latency budget is brutal.",
      },
      {
        kind: "prose",
        heading: "Two systems: real-time scoring and offline training",
        body:
          "Standard ML production architecture, but with the latency budget of a payment system. Online inference path: feature lookup → model scoring → decision. Sub-50ms p99. Offline training path: batch features computed nightly, models retrained weekly on historical data + recent labels. The challenge: features used at inference time must match features used at training time exactly. Solved by a feature store — single source of truth for feature definitions, used by both batch (training) and online (inference) pipelines.",
      },
      {
        kind: "diagram",
        heading: "Real-time fraud scoring architecture",
        anim: "fraud",
      },
      {
        kind: "prose",
        heading: "Features — the hard part",
        body:
          "Three feature time scales. (1) Static profile features: KYC data, account age, country. Slow-changing, cached aggressively. (2) Recent behavior features: count of transactions in last 24h, average transaction size, distinct merchants, geo distance from last transaction. Computed on streaming aggregates (Flink, Kafka Streams) or near-real-time (Redis with TTL). (3) Real-time signals: device fingerprint, IP reputation, time of day. Captured at request time. Feature retrieval at inference is the latency bottleneck — 100+ features fetched in parallel from feature store, must complete in ~10ms. Feast, Tecton, or in-house feature stores handle this.",
      },
      {
        kind: "prose",
        heading: "The feedback loop — and its pain",
        body:
          "Ground truth for 'was this fraud?' arrives 30-90 days later (chargeback window). The model trains on data that's 1-3 months old. Features may have drifted; fraud patterns evolve faster. Mitigation: rapid feature iteration based on hypothesis (analysts spot a pattern; new feature deployed within days), regular retraining cadence, monitoring of intermediate metrics (model score distribution, decision rates by segment). The deeper pain: false positives are visible immediately (customer complains they were blocked); false negatives are invisible until weeks later. The system is biased toward over-blocking, with continuous reviewer effort to catch this.",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "Stripe Radar", note: "Real-time fraud scoring inline with every payment. ML models updated continuously. Open about architecture: feature store for online/offline parity. Source: Stripe Radar engineering blog." },
          { company: "PayPal", note: "Pioneers in fraud detection ML — kernel methods and neural nets in production since early 2000s. Source: 'PayPal Fraud Detection at Scale' technical talks." },
          { company: "Razorpay (India)", note: "Real-time fraud + AI/ML for ~3M+ daily transactions. Lean engineering team relies on feature stores and rapid iteration. Source: Razorpay engineering blog." },
          { company: "Uber", note: "Michelangelo platform supports many ML use cases including fraud (driver fraud, fake rides). Sources: 'Meet Michelangelo: Uber's Machine Learning Platform' (2017)." },
        ],
      },
      {
        kind: "prose",
        heading: "Rules + ML — both, not either",
        body:
          "Pure ML systems are great at detecting subtle patterns but bad at hard rules ('always block transactions over $50K from unverified accounts'). Pure rules can't adapt. Production fraud systems are layered: (1) Hard rules first — sanity checks, regulatory requirements (sanctions screening), fail-fast bans. (2) ML models second — score the gray-area transactions. (3) Post-decision review — human analysts inspect borderline cases, label them, feed back into training. Rules engines (Drools, custom DSLs) coexist with model serving. Both must run within the sub-50ms latency budget — rules are cheap, models must be small or quantized.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Fraud detection is a great vehicle for showing ML systems thinking applied to a high-stakes domain. Principal signals: precision-vs-recall articulation (false positive cost vs. false negative cost — they're not symmetric); feature store as the parity mechanism between training and serving; the labeled-data delay problem and how you cope; layered rules+ML; explicit monitoring of model decisions in production (concept drift alarms, demographic parity checks for fairness). Bonus: discuss the regulatory dimension — fraud models in lending and credit may need explainability for adverse-action notices.",
      },
    ],
  },

  // ==================== AI/ML INFRASTRUCTURE ====================
  {
    id: "feature-store",
    num: "XVI",
    stage: "AI/ML Infrastructure",
    name: "Feature Store",
    tagline: "The single source of truth for ML features. Online + offline parity.",
    readTime: "20 min",
    sections: [
      {
        kind: "prose",
        heading: "The problem feature stores solve",
        body:
          "The single biggest cause of ML production failures: training-serving skew. Features computed in training (batch SQL over historical data) silently differ from features computed at inference (real-time service code). Model trained on subtly wrong features → model deployed → predictions are off → no one knows why. Feature store: a single registry where feature definitions live as code. Both batch training pipelines AND online inference services read features from this store. Same definition, same computation, no drift.",
      },
      {
        kind: "prose",
        heading: "Architecture — two stores, one definition",
        body:
          "A feature store has three components. (1) Feature definitions — code expressing how each feature is computed (e.g., 'user_avg_transaction_amount_30d = avg(amount) over user's last 30 days of transactions'). (2) Offline store — historical data. Big DB or data warehouse (Snowflake, BigQuery, S3 + Parquet). Used for training. (3) Online store — current values. Low-latency KV store (Redis, DynamoDB). Used for inference. The magic: one definition feeds both stores via a materialization pipeline. Backfill jobs compute historical values into the offline store; streaming jobs keep the online store fresh.",
      },
      {
        kind: "diagram",
        heading: "Feature store architecture",
        anim: "feature-store",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "Uber Michelangelo", note: "First widely-known feature store (2017). Custom-built. Inspired the open-source movement. Source: 'Meet Michelangelo: Uber's Machine Learning Platform'." },
          { company: "Airbnb Zipline", note: "Internal feature store for batch and streaming features. Heavily integrated with their data platform. Source: 'Zipline – A Declarative Feature Engineering Framework' (Airbnb)." },
          { company: "Feast (open source)", note: "Originally Gojek/Tecton, now open source. Most widely adopted open-source feature store. Source: feast.dev, GitHub." },
          { company: "Tecton", note: "Commercial feature store, founded by ex-Uber Michelangelo team. SaaS offering. Source: tecton.ai." },
        ],
      },
      {
        kind: "prose",
        heading: "Point-in-time correctness — the subtle correctness bug",
        body:
          "Training data has a label (was this transaction fraud?) that was determined some time after the transaction. Features must reflect what was known at the time of the transaction, not future leakage. Example: 'user's lifetime fraud count' as of transaction T must NOT include fraud detected after T. Otherwise the model trains on the future and looks great offline, fails in production. Feature stores must support point-in-time joins: 'give me the value of feature F as of time T for entity E.' This is non-trivial — naive 'select latest' joins leak future data. Most feature store mistakes lurk here.",
      },
      {
        kind: "prose",
        heading: "Features as a product",
        body:
          "At maturity, feature stores become products with their own consumers (data scientists, model owners). Features have owners, SLAs, documentation, versioning, deprecation cycles. New feature → reviewed for quality → registered → backfilled → available. Stale features (not used in any model for 6 months) are flagged for deletion. Feature ownership becomes its own discipline at large companies. The feature store team is responsible for the platform; feature owners are responsible for their specific features. This separation is what makes 1000+ feature catalogs sustainable.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "If the design involves ML, mention a feature store. Principal signals: explain training-serving skew as the problem; describe online + offline + materialization; mention point-in-time correctness explicitly (this is the subtle one juniors miss); discuss governance (feature ownership, SLAs, deprecation). Bonus: mention specific systems — Feast for open source, Tecton for managed, in-house at Uber/Airbnb scale. State when a feature store is overkill: simple ML systems with 5 features and one model don't need this; the cost is justified above ~50 features and ~5 models.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Training-serving skew", def: "Features differ between training and inference. Causes silent model failures." },
          { term: "Online store", def: "Low-latency KV store for current feature values, used at inference time." },
          { term: "Offline store", def: "Historical feature values for training. Big data warehouse (Snowflake, BigQuery, S3+Parquet)." },
          { term: "Materialization", def: "Pipeline that computes feature values and writes them to online and offline stores." },
          { term: "Point-in-time join", def: "Retrieving feature values as they were at a specific historical time. Prevents future-data leakage." },
          { term: "Feature transformation", def: "Code that computes a feature from raw data. Single source of truth across pipelines." },
          { term: "Feast", def: "Open-source feature store. Originally from Gojek, now widely adopted." },
          { term: "Michelangelo", def: "Uber's internal ML platform; pioneered the feature store concept." },
        ],
      },
    ],
  },

  {
    id: "model-serving",
    num: "XVII",
    stage: "AI/ML Infrastructure",
    name: "Model Serving Platform",
    tagline: "From notebook to production traffic. Versioning, autoscaling, A/B.",
    readTime: "22 min",
    sections: [
      {
        kind: "prose",
        heading: "Requirements",
        body:
          "Functional: trained models are deployed as services, callable via HTTP/gRPC. Multiple models, multiple versions per model. A/B testing between versions. Canary rollouts. Autoscaling based on QPS. Non-functional: inference latency p99 by SLA (5ms-500ms depending on model), throughput, isolation between models (one slow model doesn't tank others), GPU sharing where applicable. Scale: at large fintechs, 100+ models in production, each with multiple versions, billions of inferences per day. Generic platforms: KServe, Seldon, BentoML, Triton, SageMaker.",
      },
      {
        kind: "prose",
        heading: "The serving stack — inside one model",
        body:
          "A model server has: (1) Model loader — pulls model artifacts (weights, vocab, etc.) from a registry. (2) Pre-processing — converts request features into model input tensors (tokenization, normalization). (3) Inference engine — the actual forward pass. PyTorch, TensorFlow Serving, ONNX Runtime, NVIDIA Triton (multi-framework), TensorRT (NVIDIA-optimized). (4) Post-processing — transforms model output (logits) into business response (predicted class + probability). (5) Logging — request, features, prediction, latency. Each step costs latency budget. Tight SLAs (5ms) mean optimizing all five.",
      },
      {
        kind: "diagram",
        heading: "Model serving infrastructure",
        anim: "model-serving",
      },
      {
        kind: "prose",
        heading: "The model registry",
        body:
          "Models have lifecycles. Trained → evaluated → staging → production → deprecated. Each stage transition is auditable. Registry components: model artifact (weights file), metadata (training data version, hyperparams, owner, metrics), version, lineage (which dataset, which features, which code commit). Used by: training pipeline (writes), serving platform (reads), governance (audits). MLflow, Weights & Biases, SageMaker Model Registry, in-house systems. The registry is the source-of-truth integration point between training and serving — without it, you have ad-hoc artifacts and reproducibility nightmares.",
      },
      {
        kind: "case-study",
        heading: "How real systems do it",
        items: [
          { company: "Uber Michelangelo", note: "Full ML platform: feature store + training + model registry + serving. One of the most complete public ML platforms. Source: 'Michelangelo' Uber engineering blog." },
          { company: "Meta FBLearner Flow", note: "ML workflow platform powering Meta's recommendations, ads, integrity. Source: Meta engineering blog." },
          { company: "Airbnb Bighead", note: "End-to-end ML platform. Includes model serving with A/B framework. Source: 'Bighead: Airbnb's End-to-End Machine Learning Platform' (KDD 2019)." },
          { company: "Open source: KServe + Triton", note: "Kubernetes-native model serving (KServe, formerly KFServing) layered on inference engines (Triton). Cloud-vendor-neutral. Source: kserve.github.io." },
        ],
      },
      {
        kind: "prose",
        heading: "Autoscaling under variable load",
        body:
          "Inference QPS varies — flash sales drive spikes; weekends are quieter. Static provisioning either over-pays or under-serves. Autoscaling tradeoffs: scale up too slow → request queueing → latency spikes. Scale up too aggressive → over-pay. Common pattern: scale on a leading indicator (request queue depth, CPU/GPU utilization > threshold) with hysteresis (don't oscillate). Cold-start is the pain — loading a 7B parameter model takes 10-30 seconds; spikes faster than that aren't absorbed. Mitigations: (a) keep warm pool of pre-loaded replicas. (b) Smaller models (or distilled) where latency-sensitive. (c) Predict load from periodic patterns and pre-scale.",
      },
      {
        kind: "prose",
        heading: "A/B testing inference",
        body:
          "When deploying model v2 over v1, route % of traffic to v2 via the inference router. Compare metrics: business outcome (conversion, revenue), model metrics (precision, recall on labels that arrive later), system metrics (latency, error rate). Statistical significance requires meaningful traffic — for a small effect, weeks of data. Important detail: don't randomize per request, randomize per user/session. Otherwise the same user sees both models in one session, which corrupts both the experience and the measurement. Multi-arm bandits (instead of fixed splits) accelerate decisions when you don't need rigorous A/B but want fastest convergence.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Model serving in interviews tests whether you've actually shipped ML. Principal signals: model registry as the integration point; serving stack components (pre/post-processing, inference, logging); autoscaling with cold-start awareness; A/B testing with proper randomization (per user, not per request); shadow deployment (new model scores traffic but outputs aren't used — for validation pre-rollout); GPU sharing and batching for throughput when latency tolerates. Mention specific tools — Triton for high-perf inference, KServe for K8s-native, SageMaker for AWS-managed.",
      },
    ],
  },

  {
    id: "vector-db",
    num: "XVIII",
    stage: "AI/ML Infrastructure",
    name: "Vector Database",
    tagline: "ANN search, HNSW, the nearest-neighbor revolution.",
    readTime: "20 min",
    sections: [
      {
        kind: "prose",
        heading: "Why vector DBs exist",
        body:
          "Modern ML produces embeddings — dense vectors representing meaning. Search by similarity (cosine distance, dot product) is the core operation: 'find vectors most similar to query Q.' At small scale (10K vectors), in-memory linear scan is fine. At scale (millions to billions), exact search is too slow. ANN (Approximate Nearest Neighbor) algorithms trade ~1% accuracy for orders-of-magnitude speedup. Vector DBs package ANN with the operational concerns: persistence, sharding, replication, filtering by metadata, hybrid search (vector + keyword).",
      },
      {
        kind: "prose",
        heading: "ANN algorithms — what's actually inside",
        body:
          "Three families. (1) Tree-based: KD-tree, Annoy. Build a tree partitioning vector space. Search by descending. Works in low dimensions; degrades in 100+ dim (curse of dimensionality). (2) Hashing-based: LSH (Locality-Sensitive Hashing). Hash similar vectors to same bucket. Memory-efficient, OK accuracy. (3) Graph-based: HNSW (Hierarchical Navigable Small World). Build a multi-layer graph; search top-down with greedy navigation. State of the art for high-dim (768, 1536, 3072) embeddings — what most modern vector DBs use. (4) Quantization: PQ (Product Quantization) compresses vectors to fewer bytes (e.g., 768-dim float = 3KB → 96 bytes). Combined with HNSW for memory + speed.",
      },
      {
        kind: "diagram",
        heading: "HNSW search, layer by layer",
        anim: "hnsw",
      },
      {
        kind: "prose",
        heading: "The query — beyond pure similarity",
        body:
          "Pure 'find nearest k' is rare in production. Real queries combine vector similarity with metadata filters: 'find docs similar to query AND author=X AND date > Y AND tenant_id=Z.' This is the 'pre-filter vs post-filter' decision. Pre-filter: apply metadata filter first, then vector search on the filtered subset. Cheap filter on large data → fast. Restrictive filter (only 100 docs match) → degenerates to small-set search. Post-filter: run vector search on full set, filter results. Always works, but wastes compute on filtered-out vectors. Modern vector DBs (Pinecone, Weaviate, Qdrant, Milvus) support both, with cost-based optimizers picking per query. Hybrid search: combine vector score with BM25 keyword score (RRF — Reciprocal Rank Fusion). Critical for production RAG.",
      },
      {
        kind: "case-study",
        heading: "Vector DB landscape",
        items: [
          { company: "Pinecone", note: "Fully managed SaaS. Closed-source. Heavy investment in metadata filtering, hybrid search. Source: pinecone.io engineering blog." },
          { company: "Weaviate", note: "Open source. HNSW-based. Strong on hybrid search and modular vectorizers. Source: weaviate.io." },
          { company: "Qdrant", note: "Open source, written in Rust. Fast HNSW. Strong filtering capabilities. Source: qdrant.tech." },
          { company: "Milvus", note: "Open source, originally from Zilliz. Very scalable, supports billions of vectors. Source: milvus.io." },
          { company: "pgvector (Postgres extension)", note: "Postgres + vector search. Small-medium scale, integrates with existing OLTP. Default for many — start here, migrate to specialized DB if needed. Source: github.com/pgvector/pgvector." },
        ],
      },
      {
        kind: "prose",
        heading: "When NOT to use a vector DB",
        body:
          "If your corpus has < 100K vectors and you're not latency-critical, in-process FAISS or pgvector is enough. Adding a separate distributed system has operational cost. The ROI for a dedicated vector DB starts above ~1M vectors AND high QPS AND tight latency. Below that threshold, the simpler stack wins. The mistake: deploying Pinecone / Milvus for a 50K-document RAG demo. The right answer there is pgvector or even sqlite-vss. Reach for distributed vector DBs at production scale, not proof-of-concept stage.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When designing RAG or semantic search, mention: (1) Embedding model choice (and its dimensionality — affects storage and ANN cost). (2) ANN algorithm — HNSW is the default for modern, give the layer-skip intuition if asked to go deeper. (3) Quantization tradeoffs. (4) Pre-filter vs post-filter for metadata. (5) Hybrid search via RRF. (6) Sharding strategy at billion-scale. Bonus: mention that you'd start with pgvector and migrate to a specialized DB only when warranted by scale — this signals operational pragmatism.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "ANN", def: "Approximate Nearest Neighbor. Trade ~1% accuracy for huge speedup over exact search." },
          { term: "HNSW", def: "Hierarchical Navigable Small World. Multi-layer graph for ANN. State-of-art for high-dim." },
          { term: "Quantization (PQ)", def: "Compress vectors to fewer bytes. Combined with HNSW for memory savings." },
          { term: "Hybrid search", def: "Combine vector similarity with keyword (BM25). Better recall than either alone." },
          { term: "RRF", def: "Reciprocal Rank Fusion. Standard way to merge multiple ranked lists into one." },
          { term: "Pre-filter / post-filter", def: "Apply metadata filter before or after ANN search. Tradeoff per query." },
          { term: "Embedding", def: "Dense vector representation produced by an ML model (text encoder, image encoder, etc.)." },
          { term: "Cosine similarity", def: "Standard measure of similarity between vectors. Equivalent to normalized dot product." },
          { term: "pgvector", def: "Postgres extension for vector search. Good starting point at moderate scale." },
        ],
      },
    ],
  },

  {
    id: "rag-infra",
    num: "XIX",
    stage: "AI/ML Infrastructure",
    name: "RAG Infrastructure at Scale",
    tagline: "Beyond the demo. Ingestion, freshness, ACL, eval.",
    readTime: "25 min",
    sections: [
      {
        kind: "prose",
        heading: "What 'production RAG' actually means",
        body:
          "A demo RAG: load PDFs, chunk, embed, store in a vector DB, retrieve, generate. 30 lines of LangChain. Production RAG: ingestion pipeline from heterogeneous sources, ACL propagation per user, freshness < 1 hour, evaluation harness, monitoring, observability, cost controls, prompt caching, fallback strategies. The gap is enormous. Most enterprise RAG projects fail not at the model layer but at the pipeline layer.",
      },
      {
        kind: "prose",
        heading: "The ingestion pipeline",
        body:
          "Real corpora are messy. SharePoint with permissions, Confluence with HTML, PDFs with tables, emails with threads, SQL data, scanned documents. Pipeline stages: (1) Source connectors — pull from each system, with auth and rate limits. (2) Extraction — OCR, table extraction, layout-aware parsing (Unstructured, LlamaParse, Docling). (3) Enrichment — extract metadata (author, date, source, type), entities, summary. (4) Chunking — by section, by semantic boundary, by fixed size. (5) Embedding — batched calls to embedding API. (6) Indexing — write to vector DB with full metadata, including ACL info. (7) Notifying downstream of new documents. Most enterprise RAG failures happen in stages 2-3 (extraction quality) before the model is even involved.",
      },
      {
        kind: "diagram",
        heading: "Production RAG architecture",
        anim: "rag-prod",
      },
      {
        kind: "prose",
        heading: "ACL propagation — the hard requirement",
        body:
          "Enterprise: documents have permissions. User X queries; only X's authorized documents must be retrieved. Two approaches. (1) Pre-filter: lookup user's allowed doc IDs / groups, filter vector DB query by metadata (vector_db.filter('group_id', 'in', user_groups)). Safe, but fast lookup of user's allowed set is required (cached). (2) Post-filter: retrieve broadly, then filter by ACL afterwards. Risk: if you ever log retrieved-but-filtered documents, you've created a parallel unauthorized index. Pre-filter is the safe default. The hard work is propagating ACLs from source systems through ingestion to vector DB metadata, AND keeping them in sync as permissions change in source.",
      },
      {
        kind: "prose",
        heading: "Freshness — incremental indexing",
        body:
          "Two patterns. (1) Scheduled rebuild: nightly batch job re-indexes everything. Simple, can be hours stale. Acceptable for compliance docs that change rarely. (2) Streaming ingest: source systems publish change events (CDC — Change Data Capture, or webhooks); pipeline consumes, processes, indexes incrementally. Near-real-time, more complex. Use scheduled where staleness is OK; streaming where < 1 hour matters (helpdesk knowledge, internal wikis with high churn). Operational reality: scheduled is most common for v1, streaming added later when business demands it.",
      },
      {
        kind: "prose",
        heading: "Evaluation — without it, you're flying blind",
        body:
          "RAG eval has three layers. (1) Retrieval quality: given a golden query, does the right document rank in top-k? Standard IR metrics (recall@k, nDCG@k). (2) End-to-end quality: given a golden Q&A pair, is the generated answer correct, faithful, complete? LLM-as-judge (RAGAS framework, TruLens) for scale, human eval for ground truth. (3) Production metrics: thumbs up/down rate, follow-up question rate (often a sign of incomplete answer), abandonment rate. Building a 'golden set' of 100-500 query-answer pairs is the most valuable single artifact for any RAG project. Without it, you have no idea whether changes help or hurt.",
      },
      {
        kind: "case-study",
        heading: "Production RAG in practice",
        items: [
          { company: "GitHub Copilot for PRs", note: "RAG over codebase + docs + previous PRs. Streaming ingest, very strong eval (suggested reviews tested for quality). Sources: GitHub engineering blog." },
          { company: "Notion AI", note: "RAG over user's workspace docs. Per-user permissions. Heavy investment in chunking strategy (Notion docs are deeply structured). Source: Notion engineering posts." },
          { company: "Glean", note: "Enterprise search/RAG over 100+ source connectors. ACL propagation is core differentiator. Source: glean.com engineering blog." },
          { company: "Microsoft Copilot for M365", note: "RAG over Outlook, Teams, SharePoint, OneDrive. Permissions inherited from Microsoft Graph. Source: Microsoft tech blogs." },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Banking/enterprise context (your domain) leans hard into ACL, audit, and eval. Principal signals: ingestion pipeline as separate stages with explicit failure modes; ACL propagation pre-filter (call out the post-filter pitfall); freshness as a tuned tradeoff; evaluation harness as first-class infrastructure; observability (log queries + retrieved + generated, tied to user feedback). Mention specific tools — Unstructured/LlamaParse for extraction, Feast/Tecton for features (if features are involved), pgvector/Pinecone for vectors, RAGAS for eval. End-to-end thinking is what separates principal from senior here.",
      },
    ],
  },

  {
    id: "agent-platform",
    num: "XX",
    stage: "AI/ML Infrastructure",
    name: "Agent Platform",
    tagline: "Tool-using LLMs at scale. Orchestration, memory, guardrails.",
    readTime: "22 min",
    sections: [
      {
        kind: "prose",
        heading: "Beyond chat — what agent platforms enable",
        body:
          "Chat is one LLM call per turn. Agent: LLM iterates, calling tools, observing results, re-deciding. Examples: deep research (search → read → search again → synthesize), coding agents (read code → write code → test → fix), customer support (look up account → check policy → execute action). Agents need infrastructure: tool registry, execution sandbox, memory store, orchestration, guardrails, observability. This is what Anthropic's Claude Code, OpenAI's Operator, and enterprise tools like LangGraph Platform / CrewAI try to provide.",
      },
      {
        kind: "prose",
        heading: "Architecture — components",
        body:
          "(1) Orchestrator: the loop driver. Implements ReAct, Plan-and-Execute, or graph-based control flow (LangGraph). (2) Tool registry: catalog of available tools (search, code execution, DB query, API call). MCP (Model Context Protocol) is the emerging standard. (3) Tool execution sandbox: tools run in isolated environments. Code execution especially needs strong isolation (containers, VMs, gVisor). (4) Memory: short-term (current trajectory) in context window; long-term (past sessions, learned facts) in vector DB or KV store. (5) Guardrails: input validation, output filtering, tool allow/deny lists, rate limits, cost caps. (6) Observability: full trajectory logging, replayable, attributable.",
      },
      {
        kind: "diagram",
        heading: "Agent platform architecture",
        anim: "agent-platform",
      },
      {
        kind: "prose",
        heading: "The control flow problem",
        body:
          "Pure 'LLM decides everything' (AutoGPT-style fully autonomous) is unreliable beyond a few steps. Pure scripted workflow (every step pre-defined) loses flexibility. The principle: maximize structure, minimize autonomy. Use LLM judgment only where genuinely needed; everything else is code. LangGraph and similar libraries express this as a directed graph of nodes (some LLM, some deterministic), with explicit edges. The LLM picks the next edge from the available transitions, but doesn't invent new control flow. Result: predictable systems with LLM-driven decisions at the right granularity.",
      },
      {
        kind: "prose",
        heading: "The cost and latency problem",
        body:
          "Each LLM call costs money and latency. A 10-step agent is 10x both. Mitigations: (1) Smaller model for orchestration, larger only where needed (router pattern). (2) Aggressive prompt caching — Claude/Anthropic prompt caching reuses identical prefixes, reducing cost ~90% for repeat calls with same system prompt. (3) Parallel tool calls — issue independent tool calls concurrently, not sequentially. (4) Cap max steps and token budget per task — prevent runaway agents. (5) Cost-aware planning — smaller cheaper sub-tasks before invoking expensive tools. (6) Result caching — same query in last hour? Return cached result.",
      },
      {
        kind: "prose",
        heading: "Guardrails and safety",
        body:
          "An agent with code execution and a credit card can do real damage. Production guardrails: (1) Tool allow-lists per agent role (the customer-support agent can read accounts but not transfer funds). (2) Spend caps: $X per task, $Y per day. (3) Action approval for high-stakes operations (human-in-the-loop). (4) Output filters: PII redaction, toxic content blocking, prompt-injection mitigation. (5) Sandbox: code execution in isolated VMs; no network access by default; egress through allow-listed proxies. (6) Audit trail: every action logged, traceable to user request and agent state. The agent's autonomy is bounded by these guardrails — and good guardrails are themselves complex systems.",
      },
      {
        kind: "case-study",
        heading: "Agent platforms in practice",
        items: [
          { company: "Anthropic Claude Code", note: "Agentic coding. Tool registry, sandboxed bash, file editing. MCP for extensibility. Built into a CLI for developer use. Source: Anthropic blog, Claude Code docs." },
          { company: "Devin (Cognition AI)", note: "Autonomous SWE agent. Sandboxed dev environment, browser, code editor. Heavy investment in eval (SWE-bench). Source: cognition.ai blog." },
          { company: "LangGraph Platform", note: "Hosted runtime for graph-based agents. Persistent state, streaming, observability. Source: langchain.com / langgraph docs." },
          { company: "Anthropic MCP (Model Context Protocol)", note: "Open protocol for connecting LLMs to tools, data, and capabilities. Standard for tool registries across providers. Source: modelcontextprotocol.io." },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Agent platforms are bleeding edge — interviewers know less, you can shape the discussion. Principal signals: name the components (orchestrator, tools, memory, guardrails); discuss control-flow tradeoffs (workflow vs agent); explicit cost/latency mitigation; safety as architectural, not bolt-on; evaluation challenges (open-ended trajectories are hard to grade). Bonus: discuss emerging standards (MCP), the multi-agent coordination problem, and how this evolves over the next 2-3 years (your CTO-track perspective).",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Tool use / function calling", def: "LLM outputs structured calls to external APIs. Foundational primitive." },
          { term: "ReAct", def: "Thought-Action-Observation loop. Original agent pattern (Yao 2022)." },
          { term: "MCP (Model Context Protocol)", def: "Anthropic's open protocol for tool/data integration with LLMs. Industry adoption growing rapidly." },
          { term: "Orchestrator", def: "The loop driver that decides next action, calls tools, processes observations." },
          { term: "Sandbox", def: "Isolated execution environment for tool calls (especially code execution). Container, VM, or gVisor." },
          { term: "Guardrail", def: "Safety constraint: input validation, output filter, tool allow-list, rate limit, spend cap." },
          { term: "Prompt caching", def: "Reuse computation for identical prompt prefixes. ~90% cost reduction on repeat calls." },
          { term: "Trajectory", def: "Full sequence of agent's thoughts, actions, observations for one task. Logged for replay/debug." },
          { term: "Human-in-the-loop", def: "Pause for human approval before high-stakes actions. Standard for production." },
        ],
      },
    ],
  },
];
