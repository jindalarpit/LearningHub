// System Design Learning App — Module Content
// Split into a separate file for maintainability.

export const MODULES = [
  // ==================== FRAMEWORK ====================
  {
    id: "framework",
    num: "I",
    stage: "Framework",
    name: "How to Attack Any HLD",
    tagline: "Same four-step structure works for everything from URL shortener to global payments.",
    readTime: "18 min",
    sections: [
      {
        kind: "prose",
        heading: "The four-step framework",
        body:
          "Senior interviewers don't grade your design — they grade your process. Most candidates jump to architecture before establishing what they're building. The four-step framework keeps you on rails: (1) Clarify requirements — functional, non-functional, scale; (2) Estimate capacity — QPS, storage, bandwidth; (3) High-level design — components, data flow, APIs; (4) Deep dive — pick the 2-3 most interesting subsystems and go deep. Skip step 1 and you'll design the wrong thing. Skip step 2 and your design won't withstand 'how does this work at 100M users.' Step 4 is where principal-level signal lives.",
      },
      {
        kind: "diagram",
        heading: "The HLD interview, visualized",
        anim: "hld-flow",
      },
      {
        kind: "prose",
        heading: "Step 1: Clarify requirements (5 min)",
        body:
          "Three buckets. Functional — what does the system do? List 4-6 core features; defer the rest. Non-functional — latency, availability, consistency, durability. Get specific: 'p99 < 200ms,' '99.99% available,' 'eventually consistent OK,' 'no data loss tolerated.' Scale — DAUs, QPS, data volume. Don't guess; ask. 'Twitter-scale' (300M DAU) and 'a small social app' (1M DAU) are different problems. Write requirements down somewhere visible — interviewers will check whether your design actually meets them.",
      },
      {
        kind: "prose",
        heading: "Step 2: Capacity estimation (5 min)",
        body:
          "Back-of-envelope numbers ground every later decision. The drill: DAU × actions/day = QPS_avg. QPS_peak ≈ 3-5× QPS_avg. Storage = items × size × retention. Bandwidth = QPS × payload size. Memorize: 1M seconds/day, 100K seconds in business hours, 10⁹ seconds = ~30 years. Common starting points: 1M DAU → ~12 QPS avg, 100M DAU → ~1200 QPS avg. Read:write ratios usually 100:1 to 10000:1 for social/content systems. State your assumptions out loud — interviewers will correct you if you're wildly off, which is useful information.",
      },
      {
        kind: "concepts",
        heading: "Capacity numbers to memorize",
        items: [
          { term: "L1 cache", def: "0.5 ns" },
          { term: "L2 cache", def: "7 ns" },
          { term: "Main memory (RAM)", def: "100 ns (~14× slower than L2)" },
          { term: "SSD random read", def: "100 μs (1000× slower than RAM)" },
          { term: "Round trip same datacenter", def: "0.5 ms" },
          { term: "Disk seek (HDD)", def: "10 ms" },
          { term: "Round trip cross-continent", def: "150 ms" },
          { term: "Bytes per second", def: "1 Gbps ≈ 125 MB/s" },
          { term: "Day", def: "86,400 seconds (~10⁵)" },
          { term: "Year", def: "3.15 × 10⁷ seconds" },
          { term: "1B requests/day", def: "≈ 12K QPS average, ~50K peak" },
          { term: "Tweet/post size", def: "~300 bytes text, ~500KB with media metadata" },
        ],
      },
      {
        kind: "prose",
        heading: "Step 3: High-level design (10-15 min)",
        body:
          "Draw boxes and arrows. Start with: client → load balancer → application servers → cache → database. Add components only when justified. Common additions: CDN for static content, message queue for async work, search index for queries by content, object store for blobs. Define APIs as you go — POST /resource, GET /resource/{id} — naming reveals which entities are first-class. Show the data flow for the 2-3 most important user actions end-to-end. If you've drawn 15 components in 5 minutes without explaining what they do, slow down.",
      },
      {
        kind: "prose",
        heading: "Step 4: Deep dive (15-20 min — where signal lives)",
        body:
          "Pick the genuinely interesting subsystems. For social: feed generation (push vs pull vs hybrid). For chat: message ordering and delivery guarantees. For payments: double-entry ledger and idempotency. Don't deep-dive everything — you can't, and trying signals lack of judgment. The interviewer will steer you. When they ask 'how would you handle X at 10× scale,' that's the cue to deepen, not start over. Principal-level dives address: failure modes, consistency model, capacity planning, monitoring, deployment strategy, cost. Senior dives stop at architecture.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "What separates Senior from Principal/Staff in HLD: Senior designs a working system. Principal designs a system AND articulates why this design vs. alternatives, what fails first under load, how to evolve it as scale grows 10x, what the operational cost looks like, and what they'd monitor. Whenever you make a choice, name the tradeoff out loud. 'I'm using consistent hashing here because rehashing on node addition would invalidate ~50% of cache entries; with consistent hashing, only 1/N invalidate.' That sentence is principal-level signal.",
      },
      {
        kind: "concepts",
        heading: "Common pitfalls",
        items: [
          { term: "Premature deep-dive", def: "Designing distributed consensus before clarifying requirements. Wastes time, may be unnecessary." },
          { term: "Ignoring failure modes", def: "Drawing a happy path. Always ask: what if this component dies? What if this network partition occurs?" },
          { term: "No capacity grounding", def: "Adding Kafka 'because we need a queue' without computing message volume. Maybe a DB poll is fine at your QPS." },
          { term: "Single global database", def: "Not addressing how it scales. Sharding strategy, read replicas, consistency model — at principal level these are required." },
          { term: "Hand-waving consistency", def: "Saying 'it's eventually consistent' without specifying convergence time, conflict resolution, or anomalies users see." },
          { term: "Forgetting cost", def: "Designing the perfect system that costs $50M/year for a 1M user product. Cost modeling separates senior from principal." },
        ],
      },
    ],
  },

  // ==================== FUNDAMENTALS ====================
  {
    id: "load-balancing",
    num: "II",
    stage: "Fundamentals",
    name: "Load Balancing",
    tagline: "L4 vs L7, sticky sessions, consistent hashing, the math of when each fails.",
    readTime: "20 min",
    sections: [
      {
        kind: "prose",
        heading: "What load balancers actually do",
        body:
          "A load balancer is a reverse proxy that distributes incoming requests across a pool of backend servers. Two layers: L4 (transport — TCP/UDP) and L7 (application — HTTP). L4 is faster and protocol-agnostic; it sees IP packets, can't read URLs or headers. L7 understands HTTP, can route by path, header, cookie — slower but vastly more flexible. Modern stacks usually have both: L4 (e.g., AWS NLB) at the edge for raw throughput, L7 (e.g., nginx, Envoy, ALB) inside for routing.",
      },
      {
        kind: "diagram",
        heading: "L4 vs L7 routing",
        anim: "load-balancer",
      },
      {
        kind: "prose",
        heading: "Algorithms — and when each breaks",
        body:
          "Round-robin: simple, breaks under heterogeneous backends (one slow server gets the same load as fast ones). Least-connections: routes to the server with fewest open connections; better for long-lived requests. Weighted round-robin: assign more requests to bigger boxes. Consistent hashing: routes by hash(key) to a stable backend; critical for caches and stateful services because adding/removing a node only invalidates 1/N of keys (vs ~50% for naive hashing). IP hash: routes by client IP — gives session affinity without cookies but breaks behind NATs.",
      },
      {
        kind: "diagram",
        heading: "Consistent hashing — the ring",
        anim: "consistent-hash",
      },
      {
        kind: "prose",
        heading: "Health checks and circuit breakers",
        body:
          "Active health checks: load balancer pings backends every N seconds; failing backends are pulled. Passive: monitor real request outcomes; eject backends with rising error rates. Both are needed — active catches dead servers, passive catches sick ones (responding but slowly). Outlier detection (Envoy/Istio): backend gets 5 consecutive failures → eject for 30s → re-add and observe. Circuit breakers prevent cascade: if a backend is degraded, fail fast at the LB rather than queueing requests behind it.",
      },
      {
        kind: "prose",
        heading: "Sticky sessions — when, and why to avoid",
        body:
          "Stickiness routes a user's requests to the same backend (via cookie or IP). It enables in-memory session storage, but at a cost: load imbalance (one server gets 1000 active users; another gets 100), and rolling deploys lose sessions. The modern answer: don't be sticky. Externalize session state to Redis or a cookie-based JWT. The backend becomes stateless and any LB algorithm works. Stickiness is a smell that points to undone work.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When asked 'how do you load balance,' the principal answer covers: (1) L4 vs L7 choice with reasoning; (2) algorithm choice with the failure mode you're avoiding; (3) health check strategy (active + passive); (4) what happens when an LB itself fails (active-active LBs behind anycast, BGP, or DNS). Bonus signal: discuss multi-region — global LB (e.g., GeoDNS, GSLB) routing to nearest healthy region, with regional LBs handling local distribution.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "L4 load balancer", def: "Routes by TCP/UDP info. Fast, protocol-agnostic. AWS NLB, HAProxy in TCP mode." },
          { term: "L7 load balancer", def: "Routes by HTTP details (path, headers). Flexible, slower. nginx, Envoy, AWS ALB." },
          { term: "Consistent hashing", def: "Maps keys to a ring of servers. Adding/removing a node invalidates only 1/N keys, not all." },
          { term: "Virtual nodes", def: "Each physical server gets multiple positions on the hash ring. Smoothes out load distribution." },
          { term: "Sticky session", def: "Pin a client to a specific backend. Enables stateful backends but causes imbalance and deploy pain." },
          { term: "Health check", def: "Periodic probe to verify backend is alive. HTTP 200 on /health is standard." },
          { term: "Connection draining", def: "When removing a backend, stop sending new requests but let in-flight ones complete." },
          { term: "Anycast", def: "Same IP advertised from multiple locations; BGP routes clients to nearest. Used for global LBs and DNS." },
          { term: "GSLB", def: "Global Server Load Balancer. Routes traffic across regions. Often DNS-based." },
        ],
      },
    ],
  },

  {
    id: "caching",
    num: "III",
    stage: "Fundamentals",
    name: "Caching",
    tagline: "Cache invalidation, the hardest problem. Write strategies, eviction, the thundering herd.",
    readTime: "22 min",
    sections: [
      {
        kind: "prose",
        heading: "Where caches live",
        body:
          "Five layers, in order from client to data: (1) Browser cache — HTTP cache headers, service workers. (2) CDN — global edge caches for static and increasingly dynamic content. (3) Client-side application cache — in-memory in the app process. (4) Distributed cache — Redis, Memcached. (5) Database query cache — increasingly out of favor (most modern DBs disable it). Each layer adds latency savings but complicates invalidation. The right answer is usually fewer layers, not more — every layer is a place where stale data can hide.",
      },
      {
        kind: "prose",
        heading: "Write strategies — the central tradeoff",
        body:
          "Cache-aside (lazy loading): app reads from cache; on miss, fetches from DB and populates cache. Simple, but first-read latency is bad and stale data lingers until TTL. Write-through: writes go to cache and DB synchronously. Reads are always fresh; writes are slower. Write-back (write-behind): writes go to cache only; flushed to DB asynchronously. Fastest writes; risk losing data if cache dies before flush. Write-around: writes bypass cache, go straight to DB. Good for write-heavy data rarely re-read.",
      },
      {
        kind: "diagram",
        heading: "Cache write strategies, compared",
        anim: "cache-strategies",
      },
      {
        kind: "prose",
        heading: "Eviction policies",
        body:
          "When the cache is full, who gets evicted? LRU (Least Recently Used): standard, works well for most workloads. LFU (Least Frequently Used): better when access patterns are stable but some items are timeless. FIFO: simple, often suboptimal. TTL-based: items expire after time T regardless of use. Real systems combine: Redis uses 'LRU-approximated' (samples N keys, evicts the oldest sampled); CDNs use TTL with revalidation. Allkeys-LRU vs volatile-LRU (only evict items with TTL set) is a Redis config decision worth knowing.",
      },
      {
        kind: "prose",
        heading: "The cache invalidation problems",
        body:
          "There are exactly two hard problems in computer science: cache invalidation, naming, and off-by-one errors. The classics: (1) Stale data — TTL hasn't expired but DB changed. Mitigation: invalidate on write, but propagation delay exists. (2) Thundering herd / cache stampede — popular key expires; thousands of concurrent requests all miss cache and hammer DB. Mitigations: probabilistic early expiration, request coalescing (one DB read for N concurrent misses), and serving stale while refreshing. (3) Cache penetration — queries for keys that don't exist hit DB every time. Mitigation: cache the absence (negative caching) or use a Bloom filter. (4) Hot key problem — one key gets disproportionate traffic, overloading the cache shard holding it. Mitigation: replicate hot keys, or move to a tier closer to client.",
      },
      {
        kind: "diagram",
        heading: "Thundering herd, in motion",
        anim: "thundering-herd",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When you add a cache to your design, name the strategy explicitly (cache-aside, write-through), state the consistency guarantee (eventually consistent with TTL T, or strong via invalidate-on-write), and identify the failure modes you're protecting against. Saying 'I'd add Redis here' is a junior answer. Saying 'I'd add a cache-aside Redis with 5-minute TTL, request coalescing for hot keys, and Bloom filter for negative caching to handle the read-heavy product catalog with occasional flash sales' is a principal answer.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Cache-aside", def: "App checks cache first; on miss, reads from DB and populates cache. Default pattern." },
          { term: "Write-through", def: "Writes go to cache AND DB synchronously. Reads always fresh; slower writes." },
          { term: "Write-back", def: "Writes go to cache; flushed to DB async. Fastest writes; durability risk." },
          { term: "Read-through", def: "App reads only from cache; cache fetches from DB on miss transparently." },
          { term: "TTL", def: "Time-to-live. Cached entry expires after this duration regardless of use." },
          { term: "Cache stampede", def: "Many concurrent requests miss the same expired key, hammering the DB." },
          { term: "Request coalescing", def: "First request to miss does the DB fetch; subsequent concurrent misses wait for it." },
          { term: "Negative caching", def: "Cache the fact that a key doesn't exist, to prevent repeated DB lookups for missing data." },
          { term: "Bloom filter", def: "Probabilistic data structure: tells you 'definitely not in set' or 'probably in set.' No false negatives." },
          { term: "Hot key", def: "A key with disproportionate traffic that overloads the shard holding it. Mitigated via replication." },
          { term: "CDN", def: "Content Delivery Network. Globally distributed cache for static (and increasingly dynamic) content." },
        ],
      },
    ],
  },

  {
    id: "databases",
    num: "IV",
    stage: "Fundamentals",
    name: "Databases — SQL vs NoSQL vs NewSQL",
    tagline: "Indexes, B-trees, LSM-trees, and choosing the right storage engine.",
    readTime: "25 min",
    sections: [
      {
        kind: "prose",
        heading: "The four families",
        body:
          "Relational (Postgres, MySQL): ACID, joins, schemas, vertical scaling primary, sharding hard. Default choice for most systems. Document (MongoDB, DynamoDB): schemaless documents, horizontal scaling native, weaker transactions. Good for hierarchical data, eventual consistency tolerable. Key-value (Redis, DynamoDB): simplest API, fastest, limited query model. Good for caches, sessions, simple lookups. Wide-column (Cassandra, HBase): row-key indexed, columns per row vary, eventually consistent, high write throughput. Good for time series, write-heavy workloads. NewSQL (CockroachDB, Spanner, YugabyteDB): ACID + horizontal scale via consensus on every write — pay for it in latency.",
      },
      {
        kind: "prose",
        heading: "B-tree vs LSM-tree — the storage engine divide",
        body:
          "Postgres, MySQL InnoDB, MongoDB WiredTiger: B-tree storage. Updates happen in place. Reads are fast (predictable disk locations). Writes amplify (page splits, fsync). Cassandra, RocksDB, LevelDB, BigTable: LSM-tree storage. Writes go to in-memory memtable + write-ahead log; flushed to immutable SSTables on disk. Background compaction merges SSTables. Writes are very fast (sequential I/O); reads can be slower (multiple SSTables to check, mitigated by Bloom filters). LSM is the right answer for write-heavy workloads (logs, time series, analytics ingestion). B-tree wins for balanced or read-heavy.",
      },
      {
        kind: "diagram",
        heading: "B-tree vs LSM-tree write paths",
        anim: "btree-lsm",
      },
      {
        kind: "prose",
        heading: "Indexing — the math of why it matters",
        body:
          "Without an index, finding a row is O(n) — full table scan. With a B-tree index on the column, it's O(log n). On a 1B-row table: scan = 1B operations; B-tree lookup = ~30 operations. That's 30 million times faster. The cost: indexes consume disk and slow writes (every write updates every relevant index). Composite indexes (multi-column) follow leftmost-prefix rule: an index on (a, b, c) accelerates queries filtering by a, by (a,b), by (a,b,c) — but not by b alone. Covering indexes include all columns needed by a query, avoiding a heap fetch. Hot interview topic.",
      },
      {
        kind: "prose",
        heading: "Transactions and isolation levels",
        body:
          "ACID: Atomicity (all or nothing), Consistency (constraints preserved), Isolation (concurrent transactions don't interfere visibly), Durability (committed data survives crashes). Isolation has standard levels: Read Uncommitted (dirty reads possible — never use), Read Committed (default in Postgres; no dirty reads but non-repeatable reads possible), Repeatable Read (snapshot isolation in Postgres; no non-repeatable reads but write skew possible), Serializable (full serial-equivalent execution; rare in practice due to cost). Most production systems run at Read Committed or Repeatable Read. The principal-level question: what anomalies does my isolation level allow, and does my application tolerate them?",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Don't say 'I'd use NoSQL because it scales.' Principal answer: 'Postgres scales fine to ~10TB and 100K QPS read-heavy with read replicas. We'd hit issues at that point and need to consider sharding, by which time we'd have learned access patterns and could choose between (a) Postgres + Citus / Vitess for sharding, (b) DynamoDB if access patterns are key-based, (c) Cassandra if write throughput dominates and we tolerate eventual consistency. We don't need a globally distributed Spanner-class DB unless we have multi-region strong consistency requirements.'",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "ACID", def: "Atomicity, Consistency, Isolation, Durability. Properties guaranteed by traditional RDBMS transactions." },
          { term: "BASE", def: "Basically Available, Soft state, Eventually consistent. NoSQL relaxation of ACID for scale." },
          { term: "B-tree", def: "Balanced tree storing keys in sorted order. Enables O(log n) lookups, range scans. Used by Postgres, MySQL InnoDB." },
          { term: "LSM-tree", def: "Log-structured merge tree. Writes go to memtable + WAL, flushed to SSTables, merged via compaction. Used by Cassandra, RocksDB." },
          { term: "WAL", def: "Write-Ahead Log. Append-only log of all changes, written before applying to data files. Enables crash recovery." },
          { term: "MVCC", def: "Multi-Version Concurrency Control. Readers see a snapshot; writers create new versions. Reads don't block writes (Postgres, Oracle)." },
          { term: "Isolation level", def: "How much concurrent transactions are isolated. Read Committed → Repeatable Read → Serializable." },
          { term: "Covering index", def: "Index that includes all columns a query needs, so the query is satisfied without a heap fetch." },
          { term: "Read replica", def: "Async copy of primary DB serving read queries. Scales reads; small replication lag." },
          { term: "Connection pool", def: "Pre-established DB connections reused across requests. Avoids per-request connect overhead." },
        ],
      },
    ],
  },

  {
    id: "sharding",
    num: "V",
    stage: "Fundamentals",
    name: "Sharding & Partitioning",
    tagline: "When a single DB isn't enough. Strategies, hot keys, the rebalance problem.",
    readTime: "20 min",
    sections: [
      {
        kind: "prose",
        heading: "When sharding becomes necessary",
        body:
          "Premature sharding is one of the most common over-designs. A single Postgres instance handles 10TB of data and 50K-100K QPS comfortably with vertical scaling and read replicas. Most systems never need sharding. You shard when: (a) the working set exceeds RAM and you can't add more, (b) write throughput exceeds what a single primary can handle, (c) regulatory or latency requirements demand data live in specific geographies. If you're sharding before hitting those, you're paying complexity costs without benefits.",
      },
      {
        kind: "prose",
        heading: "Sharding strategies",
        body:
          "Range-based: shard by ranges of a key (e.g., user IDs 0-1M on shard A, 1M-2M on shard B). Simple, supports range queries. Suffers hot spots if keys are non-uniform (sequential IDs put all writes on one shard). Hash-based: shard by hash(key). Distributes load evenly. Range queries become expensive (must hit all shards). Consistent hashing: hash both keys and shard IDs onto a ring. Adding a shard only moves 1/N keys instead of nearly all. Geographic: shard by region. Solves data residency; complicates cross-region queries. Directory-based: lookup service maps keys to shards. Most flexible, but the lookup service is a new dependency and potential bottleneck.",
      },
      {
        kind: "diagram",
        heading: "Sharding strategies, compared",
        anim: "sharding",
      },
      {
        kind: "prose",
        heading: "Choosing the shard key",
        body:
          "The single most important decision in a sharded system. A good shard key has: (1) high cardinality — many distinct values to distribute load. (2) Even distribution — values appear roughly uniformly. (3) Locality — queries you care about hit one shard, not all. user_id is a common winner — high cardinality, even distribution, most queries are for one user's data. Tweet timestamp is a poor shard key — sequential, all current writes hammer one shard. Geographic country is poor — uneven (US dominates), low cardinality. Composite keys (e.g., {tenant_id, user_id}) are common in multi-tenant SaaS.",
      },
      {
        kind: "prose",
        heading: "The rebalance problem",
        body:
          "When you add or remove shards, data must move. Range-based: split the busiest range into two and migrate half. Simple but painful — you're doing a coordinated migration. Hash-based with N shards: hashing changes mean ~all data moves. Catastrophic. Consistent hashing: only ~1/N keys move. The right answer for systems that need elastic shards. Vitess, DynamoDB, and Cassandra all use forms of consistent hashing for this reason. The rebalance itself is operationally complex — throttle the migration so it doesn't tank production traffic, ensure correctness during the transition (dual-write or stop-the-world windows), have a rollback plan.",
      },
      {
        kind: "prose",
        heading: "Cross-shard transactions — the limit of sharding",
        body:
          "Once data lives on multiple shards, atomic operations across shards become hard. Options: (1) Two-phase commit (2PC) — works, but blocks under failures and has terrible tail latency. (2) Sagas — multi-step compensable transactions; complex to implement correctly. (3) Avoid the problem — design data layout so transactions are within one shard. (4) Use a NewSQL DB that handles distributed transactions for you (Spanner, CockroachDB) — pays for it in latency on every write. Most successful sharded systems explicitly avoid cross-shard transactions through careful data modeling.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When asked 'how do you scale this DB,' the principal answer sequence: (1) Vertical scaling first — bigger box. (2) Read replicas next — handles read-heavy load with eventual consistency. (3) Functional sharding — split tables by domain (users DB, posts DB, payments DB). (4) Horizontal sharding — only when 1-3 are exhausted. State the shard key choice with reasoning, the rebalance strategy, and explicitly call out cross-shard operations you'll avoid by design. Mention 'we'd build this on Vitess / Citus / Spanner if cross-region needed' to show tool awareness.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Horizontal sharding", def: "Split rows of one logical table across multiple physical DBs by some key." },
          { term: "Vertical partitioning", def: "Split columns or tables by domain. Users DB separate from Posts DB." },
          { term: "Shard key", def: "The column whose value determines which shard a row lives on. Choice is critical." },
          { term: "Hot shard / hot key", def: "A shard receiving disproportionate load. Caused by non-uniform shard key distribution." },
          { term: "Resharding", def: "The act of changing the number of shards. Always operationally painful." },
          { term: "2PC (Two-phase commit)", def: "Distributed transaction protocol. Coordinator prepares all participants, then commits. Blocks under failures." },
          { term: "Saga", def: "Multi-step distributed transaction with compensating actions on failure. No global lock; eventual consistency." },
          { term: "Vitess", def: "MySQL sharding layer originally from YouTube. Adds query routing, online resharding." },
          { term: "Citus", def: "Postgres sharding extension. Distributes tables across nodes; supports parallel query execution." },
        ],
      },
    ],
  },

  {
    id: "replication",
    num: "VI",
    stage: "Fundamentals",
    name: "Replication & Consistency",
    tagline: "Single-leader, multi-leader, leaderless. CAP, PACELC, and the consistency menu.",
    readTime: "25 min",
    sections: [
      {
        kind: "prose",
        heading: "Why replicate",
        body:
          "Three reasons: durability (a copy survives if the primary's disk fails), availability (failover when primary dies), and read scaling (route reads to replicas). All three are valuable; the design tradeoffs differ. Synchronous replication waits for replicas to acknowledge before committing — preserves consistency but at latency and availability cost. Asynchronous replication acks immediately, propagates to replicas in background — fast and available, but loses recent writes on primary failure.",
      },
      {
        kind: "prose",
        heading: "Three replication topologies",
        body:
          "Single-leader: one primary takes writes, replicas are read-only copies. Simple, predictable, the default. Postgres, MySQL primary-replica, MongoDB primary, Redis. Multi-leader: multiple primaries, each accepts writes, sync among themselves. Used for multi-region active-active. Pain point: write conflicts (same row updated in two regions; resolution is application-defined). Leaderless: any node accepts writes; quorum protocols ensure consistency. Cassandra, DynamoDB, Riak. Read N replicas, write to W replicas; if R + W > N, reads see latest writes.",
      },
      {
        kind: "diagram",
        heading: "Replication topologies in motion",
        anim: "replication",
      },
      {
        kind: "prose",
        heading: "CAP — the original triangle",
        body:
          "Brewer's CAP theorem: in the presence of a network Partition, you choose either Consistency (all reads see latest write) or Availability (every request gets a response). You cannot have both during a partition. The 'CA' systems often advertised don't really exist — under partition, something must give. Most real systems are 'CP' (sacrifice availability for consistency, e.g., Spanner, ZooKeeper, etcd) or 'AP' (sacrifice consistency for availability, e.g., DynamoDB, Cassandra). CAP is somewhat dated and often misunderstood — it applies only during partitions. PACELC extends it usefully.",
      },
      {
        kind: "prose",
        heading: "PACELC — the better mental model",
        body:
          "Daniel Abadi's PACELC: in case of Partition, choose Availability or Consistency (the CAP part); Else, in normal operation, choose Latency or Consistency. Most systems make tradeoffs in normal operation too. DynamoDB: PA/EL — chooses availability under partition AND latency in normal operation (eventually consistent reads by default). Spanner: PC/EC — consistency under partition (becomes unavailable in some failure modes) AND consistency in normal operation (paid for in latency by TrueTime sync). Cassandra: PA/EL by default; configurable per-query. PACELC forces you to articulate the choice in normal operation, which is where most queries actually live.",
      },
      {
        kind: "prose",
        heading: "The consistency menu",
        body:
          "Strong consistency: every read sees the latest committed write. Linearizable. Expensive across regions. Eventual consistency: replicas converge eventually. Reads may be stale. Cheap, fast. Read-your-writes: you see your own writes immediately, but other users may see stale data. Often achieved via session affinity. Monotonic reads: successive reads from one client see progressively newer data, never older. Causal consistency: causally related writes are seen in order; concurrent writes can be in any order. Bounded staleness: reads are at most T seconds stale. Used by Cosmos DB; useful when 'eventually' is too vague.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Never just say 'we'll use eventual consistency.' Specify: read-your-writes for users seeing their own posts; eventual consistency with bounded staleness < 5 seconds for newsfeeds; strong consistency for financial transactions. Different parts of the same system can have different consistency guarantees, and articulating that is principal-level signal. Bonus: discuss conflict resolution explicitly — last-write-wins (lossy), CRDTs (mergeable types), or application-defined merge functions (e.g., shopping cart union).",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Sync replication", def: "Primary waits for replicas to ack before committing. Strong durability, higher latency." },
          { term: "Async replication", def: "Primary commits immediately, replicates in background. Faster, may lose recent writes on failover." },
          { term: "Replication lag", def: "Time difference between primary commit and replica visibility. Source of read-after-write anomalies." },
          { term: "Failover", def: "Promoting a replica to primary when the primary dies. Manual or automatic." },
          { term: "Split-brain", def: "Two nodes both believe they're primary, both accept writes. Data divergence. Quorum prevents this." },
          { term: "Quorum", def: "Minimum nodes that must agree. With N nodes, R reads + W writes > N gives consistency." },
          { term: "CAP theorem", def: "Under network partition, choose Consistency or Availability. Can't have both." },
          { term: "PACELC", def: "Extension of CAP. Under Partition: A vs C. Else (normal): Latency vs C. More descriptive of real systems." },
          { term: "Linearizability", def: "Strongest single-object consistency. Operations appear instantaneous and in real-time order." },
          { term: "Eventual consistency", def: "Replicas converge eventually if writes stop. No bound on convergence time without other guarantees." },
          { term: "CRDT", def: "Conflict-free Replicated Data Type. Mergeable types where concurrent updates always converge to same state." },
        ],
      },
    ],
  },

  {
    id: "consensus",
    num: "VII",
    stage: "Fundamentals",
    name: "Consensus & Coordination",
    tagline: "Paxos, Raft, ZooKeeper, etcd. How distributed systems agree on anything.",
    readTime: "22 min",
    sections: [
      {
        kind: "prose",
        heading: "What consensus is for",
        body:
          "Consensus is the problem of getting N machines to agree on a single value, even when some fail. It's the foundation under: leader election (which node is primary?), distributed locks (who holds this resource?), configuration management (what's the current cluster topology?), distributed transactions (commit or abort?). Most engineers don't write consensus algorithms — they use systems built on them: ZooKeeper, etcd, Consul. But understanding what consensus does and what it costs is principal-level knowledge.",
      },
      {
        kind: "prose",
        heading: "Why consensus is hard",
        body:
          "FLP impossibility (Fischer, Lynch, Paterson 1985): in an asynchronous network where any process can fail, no deterministic algorithm can solve consensus. This is a foundational result. Real algorithms work around it by adding assumptions: timeouts (eventually-synchronous models), leader election with terms, randomization. Paxos (Lamport, 1989) and Raft (Ongaro, 2014) both make the eventually-synchronous assumption — they assume the network eventually behaves long enough to make progress, and use leader-based approaches with quorum agreement.",
      },
      {
        kind: "diagram",
        heading: "Raft consensus, step by step",
        anim: "raft",
      },
      {
        kind: "prose",
        heading: "Raft, in 200 words",
        body:
          "Raft has three roles: leader, follower, candidate. Time is divided into terms; each term has at most one leader. (1) Leader election: when a follower's election timeout expires (no heartbeat from leader), it becomes a candidate, increments term, votes for itself, requests votes from peers. Majority of votes → becomes leader. (2) Log replication: leader appends entries to its log, sends AppendEntries RPCs to followers. When a majority have acknowledged, the entry is 'committed' and applied to state machine. (3) Safety: log entries are committed in order; a leader cannot overwrite committed entries; a node can only vote for a candidate whose log is at least as up-to-date as its own. These rules together ensure linearizable, strongly consistent agreement.",
      },
      {
        kind: "prose",
        heading: "Quorum math — why majorities matter",
        body:
          "With 2N+1 nodes, a quorum is N+1. Two quorums always intersect in at least one node. This intersection is what guarantees consistency: any two majority decisions share at least one node, so a node that participated in commit X cannot also participate in a contradictory commit Y. The system tolerates up to N failures while still making progress. 3 nodes tolerate 1 failure; 5 nodes tolerate 2. Adding more nodes increases fault tolerance but also increases latency (more nodes to wait for) — most production deployments use 3 or 5.",
      },
      {
        kind: "prose",
        heading: "Where consensus is used in real systems",
        body:
          "ZooKeeper (built on ZAB, similar to Multi-Paxos): used by Kafka, HBase, Hadoop for coordination — leader election, distributed locks, config. etcd (Raft): backbone of Kubernetes — stores all cluster state, with strong consistency. Consul: service discovery + key-value, Raft-based. Spanner / CockroachDB: per-shard Raft groups for distributed SQL. Kafka post-2021: replaced ZooKeeper with KRaft (its own Raft implementation). The pattern: consensus is rarely the user-facing system; it's the coordination substrate underneath. Most apps don't run consensus directly; they delegate to one of these systems.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When your design needs strong agreement (leader election, distributed lock, config), don't roll your own — name an existing system: 'I'd use etcd / ZooKeeper / Consul because we need a strongly-consistent coordination service and consensus from scratch is a 1-person-year project to get right.' If asked to explain Raft, hit: terms, leader election via majority vote, log replication via majority ack, safety properties (committed entries persist, log monotonic). Mention that 3 or 5 nodes is standard, that latency is bounded by majority round-trips, and that geographic distribution amplifies that latency.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Consensus", def: "N machines agreeing on a single value despite failures. Foundation for distributed coordination." },
          { term: "FLP impossibility", def: "Fischer-Lynch-Paterson: deterministic consensus is impossible in pure async networks with one failure. Real algos use timeouts." },
          { term: "Paxos", def: "Lamport's consensus algorithm. Notoriously hard to understand and implement correctly." },
          { term: "Raft", def: "Modern consensus algorithm designed for understandability. Leader-based, term-based, used by etcd, Consul, KRaft." },
          { term: "Quorum", def: "Minimum number of nodes that must agree. With 2N+1 nodes, quorum is N+1." },
          { term: "Leader election", def: "Picking one node to coordinate writes. Triggered when leader fails or is unreachable." },
          { term: "Term / epoch", def: "Monotonic counter incremented on each leader election. Disambiguates messages from past leaders." },
          { term: "ZooKeeper", def: "Apache coordination service. Used for leader election, distributed locks, config across large clusters." },
          { term: "etcd", def: "Distributed key-value store using Raft. Backbone of Kubernetes." },
          { term: "ZAB", def: "ZooKeeper Atomic Broadcast. ZooKeeper's consensus protocol, similar to Multi-Paxos." },
        ],
      },
    ],
  },

  {
    id: "queues",
    num: "VIII",
    stage: "Fundamentals",
    name: "Message Queues & Streams",
    tagline: "Kafka, RabbitMQ, SQS. At-least-once, exactly-once, ordering, the actual semantics.",
    readTime: "22 min",
    sections: [
      {
        kind: "prose",
        heading: "Why use a queue",
        body:
          "Three reasons. (1) Decoupling: producer doesn't need to know about consumers. Adding new consumers doesn't change producer code. (2) Asynchrony: slow operations (email, ML inference, video transcoding) don't block user requests. (3) Buffering: smooths out load spikes — burst arrives, queue absorbs it, consumers drain at sustainable rate. The cost: complexity. Now you have a new system to operate, a new failure mode (queue full / queue down), and new semantics to reason about (delivery guarantees, ordering, idempotency).",
      },
      {
        kind: "prose",
        heading: "Two paradigms — message queue vs log",
        body:
          "Message queue (RabbitMQ, ActiveMQ, SQS): messages are consumed and removed. One consumer per message (typically). Good for task queues. Distributed log (Kafka, Pulsar, Kinesis): messages are appended to an immutable log; consumers track their offset. Multiple independent consumers replay from any position. Good for event streams, fan-out, replay-after-bug. The mental model differs fundamentally: a queue is a buffer; a log is durable history. Modern systems lean log-style (Kafka) because it subsumes queue use cases and adds replay/multi-consumer.",
      },
      {
        kind: "diagram",
        heading: "Kafka partitioning and consumer groups",
        anim: "kafka",
      },
      {
        kind: "prose",
        heading: "Delivery guarantees — the actual semantics",
        body:
          "At-most-once: message may be lost; never delivered twice. Cheap. Used when occasional loss is fine (metrics samples). At-least-once: message is delivered, possibly more than once. Default for most queues. Consumers must be idempotent to handle duplicates. Exactly-once: looks ideal, almost always misleading. True exactly-once across producer-broker-consumer requires careful coordination: Kafka offers exactly-once semantics (EOS) within Kafka transactions, but if your consumer writes to an external system, you still need idempotency or 2PC. The honest engineer's answer: 'We use at-least-once + idempotent consumers.' That's the production pattern.",
      },
      {
        kind: "prose",
        heading: "Ordering — partition-level only",
        body:
          "Kafka guarantees ordering within a partition, not across partitions. If you need messages for the same entity (e.g., one user's events) ordered, partition by that key — all messages for user X go to the same partition, processed by one consumer in order. If you need global ordering, you need one partition — and you've capped your throughput at one consumer's rate. Most real systems accept partition-level ordering; if global ordering is required, use a different paradigm (or rethink the requirement, which usually relaxes).",
      },
      {
        kind: "prose",
        heading: "Backpressure and dead letter queues",
        body:
          "What happens when consumers can't keep up? Two failure modes. (1) Queue grows unboundedly — eventually OOMs, blocks producers, cascades. Mitigation: set max queue size; producers either block or fail-fast. (2) Poison messages — one bad message that consumers can never process; blocks the queue. Mitigation: dead letter queue (DLQ) — after N retries, the message is moved to a side queue for manual investigation, and processing continues. Every production message system needs a DLQ. Forgetting one is a common oncall pain.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When you add a queue, specify: (1) which system (Kafka for streams, SQS for simple task queues, RabbitMQ for complex routing). (2) Partitioning strategy and ordering requirement. (3) Delivery guarantee with idempotency plan. (4) Retry + DLQ policy. (5) Consumer scaling — adding consumers increases throughput up to partition count, then no more. Bonus signal: discuss exactly-once honestly. 'Kafka EOS works within Kafka. Crossing system boundaries, we use at-least-once + idempotent consumers via dedup keys.'",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "At-least-once", def: "Every message delivered, possibly multiple times. Requires idempotent consumers. Default in most queues." },
          { term: "Exactly-once", def: "Each message processed exactly once. Hard across system boundaries; usually requires idempotency anyway." },
          { term: "Idempotency", def: "Operation that can be applied multiple times with same effect. Critical for correctness with at-least-once delivery." },
          { term: "Partition", def: "Kafka's unit of parallelism. Messages within a partition are ordered; across partitions they aren't." },
          { term: "Consumer group", def: "Set of consumers cooperating to consume a topic. Kafka assigns partitions to consumers in the group." },
          { term: "Offset", def: "Consumer's position in a Kafka partition. Consumers commit offsets to remember progress." },
          { term: "Dead letter queue (DLQ)", def: "Side queue for messages that failed N retries. Prevents poison messages from blocking the main queue." },
          { term: "Backpressure", def: "Mechanism to slow producers when consumers can't keep up. Bounded queue + producer wait." },
          { term: "Topic / stream", def: "A category of messages. Partitioned for parallelism." },
          { term: "Producer / consumer", def: "Producer publishes messages; consumer reads and processes them." },
        ],
      },
    ],
  },
];

export const MODULES_PART_2 = []; // continued in next file
