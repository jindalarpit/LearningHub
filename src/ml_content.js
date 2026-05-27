// ============================================================================
// ML LEARNING APP — CONTENT
// 16 modules, beginner → expert. Each has prose, animated diagrams, paper
// walkthroughs, concept grids, and quizzes with explanations.
// ============================================================================

export const MODULES = [
  // ==========================================================================
  // I. FOUNDATIONS
  // ==========================================================================
  {
    id: "foundations",
    num: "I",
    stage: "Foundations",
    name: "What ML Actually Is",
    tagline: "Before the transformers. Before the agents. The mental model.",
    readTime: "12 min",
    sections: [
      {
        kind: "prose",
        heading: "The one-sentence definition that interviewers want",
        body:
          "Machine learning is the practice of building programs whose behavior is not fully specified by code, but is instead shaped by data. You define a hypothesis space (what shapes the function can take), a loss function (how wrong a given function is on data), and an optimizer (how to search for less wrong functions). That's it. Everything else is engineering.",
      },
      {
        kind: "prose",
        heading: "The three learning regimes",
        body:
          "Supervised learning learns a mapping f: X → Y from labeled pairs. Unsupervised learning finds structure in X alone (clustering, density estimation, generative models). Reinforcement learning learns a policy π: state → action by receiving rewards over time. Modern LLMs use all three: self-supervised pretraining (unsupervised-ish), instruction tuning (supervised), RLHF/DPO (reinforcement).",
      },
      {
        kind: "diagram",
        heading: "The training loop",
        anim: "training-loop",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "If an interviewer asks you to 'walk through how a model is trained,' they want: data → forward pass → loss → backward pass (gradients) → optimizer step → repeat. They're checking whether you know that the loss function is separate from the optimizer, and whether you can name examples of each.",
      },
      {
        kind: "concepts",
        heading: "Core vocabulary",
        items: [
          { term: "Feature", def: "Measurable input to the model. Raw data rarely is this — feature engineering transforms it." },
          { term: "Label", def: "Ground-truth target. The y in supervised learning." },
          { term: "Loss function", def: "Scalar measuring wrongness. Examples: MSE (regression), cross-entropy (classification)." },
          { term: "Gradient descent", def: "Iterative optimization: move parameters opposite the gradient of the loss." },
          { term: "Overfitting", def: "Model memorizes training data, fails on new data. Fought with regularization, dropout, more data." },
          { term: "Generalization", def: "Performance on unseen data drawn from the same distribution as training data." },
          { term: "Bias / Variance", def: "Bias: systematic error from wrong assumptions. Variance: sensitivity to training data fluctuations. The classic tradeoff." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "You train a model on 100k examples and test accuracy is 95%. You collect 1M more examples, retrain, and test accuracy drops to 82%. What's the most likely cause?",
            choices: [
              "The model overfit the original 100k examples.",
              "The 1M new examples are from a different distribution than the original test set.",
              "More data always helps, this shouldn't happen.",
            ],
            answer: 1,
            explain:
              "Distribution shift is the most common real-world cause. The original test set came from the same narrow distribution as the 100k; scaling to 1M likely introduced new distributions the test set doesn't represent.",
          },
          {
            q: "Why is cross-entropy used for classification instead of MSE?",
            choices: [
              "Cross-entropy punishes confident wrong predictions much more strongly, which is what you want for probabilities.",
              "Cross-entropy is faster to compute than MSE.",
              "MSE doesn't work on one-hot encoded labels.",
            ],
            answer: 0,
            explain:
              "Cross-entropy grows unboundedly as a confident prediction diverges from the true class, producing much stronger gradients than MSE for classification — this gives better learning dynamics when outputs are probabilities.",
          },
        ],
      },
    ],
  },

  {
    id: "neural-nets",
    num: "II",
    stage: "Foundations",
    name: "Neural Networks in 10 Minutes",
    tagline: "Matrix multiplies and non-linearities. That's the whole trick.",
    readTime: "10 min",
    sections: [
      {
        kind: "prose",
        heading: "The entire idea",
        body:
          "A neural network is a stack of linear transformations interleaved with non-linear activation functions. Remove the non-linearities and the whole stack collapses into a single linear transformation — proof the non-linearities are doing the work. A layer is essentially y = activation(Wx + b), where W is a learned matrix and b is a learned bias vector.",
      },
      {
        kind: "diagram",
        heading: "A forward pass, one neuron at a time",
        anim: "neuron-flow",
      },
      {
        kind: "prose",
        heading: "Backpropagation, demystified",
        body:
          "Backprop is just the chain rule applied mechanically. The network defines a computation graph from input to loss. To compute how much each parameter affected the loss, you walk backwards through the graph, multiplying local derivatives. Modern frameworks (PyTorch, JAX) do this automatically via autograd — you define the forward pass, they derive the backward pass.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Be ready to explain why we need activation functions (to introduce non-linearity), what vanishing gradients are (deep networks where gradients shrink to zero in earlier layers), and why ReLU largely solved that problem (its derivative is 1 for positive inputs, so gradients pass through unchanged).",
      },
      {
        kind: "concepts",
        heading: "Key terms",
        items: [
          { term: "Layer", def: "One matrix multiply + bias + activation. Composed to form networks." },
          { term: "Activation", def: "Non-linear function applied element-wise. ReLU, GELU, Sigmoid, Tanh." },
          { term: "Backpropagation", def: "Chain-rule-based algorithm for computing gradients of loss w.r.t. every parameter." },
          { term: "Batch", def: "Group of examples processed together. Larger batches give smoother gradient estimates but diminishing returns and more memory." },
          { term: "Epoch", def: "One full pass over the training dataset." },
          { term: "Learning rate", def: "Step size for gradient descent. The single most sensitive hyperparameter." },
          { term: "Vanishing gradients", def: "In deep networks, gradients can shrink toward zero as they propagate backward, stalling learning in early layers." },
          { term: "Exploding gradients", def: "The opposite failure — gradients grow unboundedly, destabilizing training. Fought with gradient clipping." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Why does a deep linear network (no activations) learn nothing more than a shallow linear model?",
            choices: [
              "Because the composition of linear functions is itself a linear function. Stacking adds parameters but not expressiveness.",
              "Because gradients vanish in deep networks.",
              "Because you need dropout to make it work.",
            ],
            answer: 0,
            explain:
              "W₃·W₂·W₁·x is equivalent to some single matrix W'·x. Depth only buys you something when you interleave non-linearities between the linear layers.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // III. THE TRANSFORMER — DEEP MATH
  // ==========================================================================
  {
    id: "transformer",
    num: "III",
    stage: "Foundations",
    name: "The Transformer — Deep Math",
    tagline: "Attention Is All You Need, derived from first principles.",
    readTime: "50 min",
    paper: {
      title: "Attention Is All You Need",
      authors: "Vaswani et al., 2017",
      venue: "NeurIPS",
    },
    sections: [
      {
        kind: "prose",
        heading: "What problem attention solves",
        body:
          "Before transformers, sequence models (RNNs, LSTMs) processed tokens left-to-right, one at a time. Three problems: (1) long-range dependencies are diluted as information passes through many steps, (2) you can't parallelize — token N depends on token N-1, (3) the hidden state is a fixed-size bottleneck. Attention replaces the sequential recurrence with a direct, learned 'look up any previous token' operation. Every token computes its output by weighted-averaging all other tokens, where the weights are learned from content.",
      },

      // === The QKV trinity with dimensions ===
      {
        kind: "prose",
        heading: "Queries, Keys, Values — with dimensions",
        body:
          "Let X ∈ ℝ^(n×d_model) be the input: n tokens, each represented as a d_model-dim vector. We project X into three matrices via learned weight matrices:\n\n  Q = X · W_Q,  where W_Q ∈ ℝ^(d_model × d_k),  so  Q ∈ ℝ^(n × d_k)\n  K = X · W_K,  where W_K ∈ ℝ^(d_model × d_k),  so  K ∈ ℝ^(n × d_k)\n  V = X · W_V,  where W_V ∈ ℝ^(d_model × d_v),  so  V ∈ ℝ^(n × d_v)\n\nTypically d_k = d_v = d_model / h, where h is the number of heads. For Llama-2 7B: d_model = 4096, h = 32, so d_k = d_v = 128.\n\nThe three projections encode different questions: Q asks 'what am I looking for?', K advertises 'what do I represent?', V provides 'what content do I deliver if selected?'",
      },
      {
        kind: "math",
        heading: "The attention equation, formally",
        body:
          "Attention(Q, K, V) = softmax( Q · Kᵀ / √d_k ) · V\n\nDimensions walkthrough:\n\n  Q · Kᵀ    has shape (n × d_k) · (d_k × n) = (n × n)\n            — the full token-to-token similarity matrix\n\n  / √d_k    scalar scaling (more on this below)\n\n  softmax   applied row-wise, converts similarities to probabilities\n            each row sums to 1\n\n  · V       has shape (n × n) · (n × d_v) = (n × d_v)\n            — each output is a weighted sum of value vectors\n\nThe whole operation maps (n × d_model) → (n × d_v). Output token i depends on all input tokens through the attention weights row i.",
      },
      {
        kind: "diagram",
        heading: "Self-attention, visualized",
        anim: "attention",
      },

      // === Why sqrt(d) scaling ===
      {
        kind: "prose",
        heading: "Why divide by √d_k — the variance argument",
        body:
          "Assume the components of Q and K are independent random variables with mean 0 and variance 1 (a reasonable approximation after LayerNorm). For a single Q-K dot product:\n\n  q · k = Σᵢ qᵢ · kᵢ    (sum of d_k independent terms)\n\nEach term qᵢ · kᵢ has mean 0 and variance 1 (product of unit-variance independents). By the additivity of variance for independents:\n\n  Var(q · k) = d_k\n  Std(q · k) = √d_k\n\nWithout scaling, dot products have magnitude on the order of √d_k. For d_k = 128, that's ~11. Plug 11 into softmax and the distribution becomes near-one-hot — gradients through softmax vanish (the derivative softmax(x)·(1 − softmax(x)) is near zero at saturation). Dividing by √d_k brings the pre-softmax scores back to unit variance, keeping softmax in a gradient-friendly regime.\n\nThis one-character change is why transformers train at all at scale.",
      },

      // === Softmax gradient ===
      {
        kind: "math",
        heading: "Softmax gradient — the Jacobian",
        body:
          "Let s = softmax(z), where zⱼ are the pre-softmax scores. Then:\n\n  sⱼ = exp(zⱼ) / Σₖ exp(zₖ)\n\nThe Jacobian entry ∂sⱼ/∂zᵢ has two cases:\n\n  ∂sⱼ/∂zᵢ = sⱼ · (1 - sⱼ)    if i = j\n  ∂sⱼ/∂zᵢ = -sⱼ · sᵢ          if i ≠ j\n\nIn matrix form: J = diag(s) − s·sᵀ\n\nImplication: if any sⱼ is near 1 (saturated softmax), then sⱼ(1-sⱼ) ≈ 0 — gradients disappear. Any sⱼ near 0 also kills the off-diagonals involving it. The √d_k scaling exists specifically to prevent saturation.",
      },

      // === Causal mask ===
      {
        kind: "math",
        heading: "Causal masking — the math",
        body:
          "Decoder attention must not let token i 'see' tokens j > i (future tokens). Implementation: before the softmax, add a mask matrix M where:\n\n  M[i][j] = 0     if j ≤ i   (allowed)\n  M[i][j] = -∞    if j > i   (blocked)\n\nThen: scores = Q·Kᵀ / √d_k + M\n\nAfter softmax, exp(-∞) = 0, so blocked positions get exactly zero attention weight. Why -∞ and not just zeroing after softmax? Because softmax normalizes over all positions — if you zero out after, the remaining weights no longer sum to 1. Masking before softmax means the allowed positions re-normalize correctly.\n\nDuring training, the mask is a fixed upper-triangular matrix reused per batch. During inference with KV caching, the mask is trivial (the cache only contains prior tokens), so masking is often skipped at inference time for efficiency.",
      },

      // === RoPE ===
      {
        kind: "math",
        heading: "Rotary Position Embedding (RoPE) — the rotation math",
        body:
          "Vanilla self-attention is permutation-equivariant — swap tokens, swap outputs identically. We need position encoding. Sinusoidal (original paper) adds position-dependent vectors. Modern models use Rotary Position Embedding (RoPE), which multiplies Q and K by a position-dependent rotation matrix.\n\nFor 2D subvectors of Q (and K), RoPE applies:\n\n  R(θ_m) = [ cos(m·θ)  -sin(m·θ) ]\n           [ sin(m·θ)   cos(m·θ) ]\n\nwhere m is the token position and θ is a frequency chosen per dimension pair. Different dimension pairs use different frequencies (θ_i = 10000^(-2i/d)), creating a multi-frequency rotation.\n\nKey property: when you compute (R(θ_m)·qₘ)ᵀ · (R(θ_n)·kₙ), the result depends only on the relative position m−n, not absolute positions. That means:\n\n  qₘᵀ·kₙ after RoPE = f(qₘ, kₙ, m−n)\n\nThis relative-position property is why RoPE extrapolates better than absolute position embeddings: the model learns relative patterns that work regardless of absolute position. Used in Llama, PaLM, GPT-NeoX, most 2024+ models.",
      },

      // === Multi-head attention ===
      {
        kind: "math",
        heading: "Multi-head attention — concatenation math",
        body:
          "Running one attention means every token attends through one 'lens.' Multi-head splits the representation into h heads, runs attention independently, concatenates.\n\nFor head i ∈ {1, ..., h}:\n  Qᵢ = X · W_Qᵢ      W_Qᵢ ∈ ℝ^(d_model × d_k)\n  Kᵢ = X · W_Kᵢ      W_Kᵢ ∈ ℝ^(d_model × d_k)\n  Vᵢ = X · W_Vᵢ      W_Vᵢ ∈ ℝ^(d_model × d_v)\n\n  headᵢ = Attention(Qᵢ, Kᵢ, Vᵢ)   ∈ ℝ^(n × d_v)\n\nConcatenate across heads:\n  MultiHead(X) = Concat(head₁, ..., head_h) · W_O\n\nwhere W_O ∈ ℝ^(h·d_v × d_model) is an output projection bringing dimension back to d_model.\n\nTypical choice: d_k = d_v = d_model / h, making total params per attention block the same as single-head with d_k = d_model. You're splitting representation capacity across heads, not adding it. Different heads empirically learn different things: syntactic structure, co-reference, positional bias, copy-detection.",
      },

      // === Complexity ===
      {
        kind: "math",
        heading: "Complexity — FLOPs and memory",
        body:
          "For sequence length n, hidden dim d:\n\nFLOPs per attention layer:\n  Q·Kᵀ:     n²·d    (the quadratic term — the problem at long context)\n  softmax:  n²      (cheap)\n  ·V:       n²·d\n  Total:    O(n²·d)\n\nMemory per attention layer:\n  Attention matrix:  n²    (this is what Flash Attention attacks)\n  Q, K, V tensors:   n·d each\n\nFor n = 4096, d = 4096: attention matrix is 4096² = 16.7M entries per head per layer. At 32 heads × 32 layers × fp16: ~33 GB just for attention matrices. This is why naive attention can't serve long contexts — you can't hold the matrix in HBM.\n\nFFN complexity per layer (for completeness): O(n · d · d_ff) where d_ff ≈ 4·d, so 4·n·d². At n=4096, this actually dominates O(n²·d) until n > 4d (16384 for d=4096). Below that threshold, FFN is the bottleneck. Above, attention.",
      },

      // === Flash Attention ===
      {
        kind: "prose",
        heading: "Flash Attention — tiling the attention matrix",
        body:
          "Standard attention materializes the full n×n attention matrix in GPU HBM (high-bandwidth memory). This is both slow (HBM is 10× slower than on-chip SRAM) and memory-prohibitive. Flash Attention (Dao et al., 2022) never materializes the full matrix. It tiles Q, K, V into blocks and computes attention block-by-block, keeping intermediate values in on-chip SRAM.\n\nThe key trick is numerically stable online softmax. Computing softmax(Qᵢ·Kⱼᵀ) per-block naively would break normalization (softmax is a global operation). Flash Attention maintains running (max, sum) statistics per row and rescales as new blocks are processed:\n\n  m_new = max(m_old, m_block)\n  ℓ_new = exp(m_old − m_new) · ℓ_old + exp(m_block − m_new) · ℓ_block\n  O_new = (ℓ_old · exp(m_old − m_new) · O_old + exp(m_block − m_new) · O_block) / ℓ_new\n\nThis produces exactly the same output as full-matrix attention, bit-for-bit, with O(n) memory instead of O(n²) and 2–4× wall-clock speedup. Flash Attention 2 and 3 add more parallelism. Modern serving stacks (vLLM, TGI) use Flash Attention by default. If you don't know this, principal interviewers will probe.",
      },

      // === KV Cache math ===
      {
        kind: "math",
        heading: "KV cache math",
        body:
          "During autoregressive decoding, token t+1 attends over tokens 1...t. Recomputing Kⱼ and Vⱼ for all prior j at every step is wasteful — they don't change. The KV cache stores them.\n\nCache size per layer per request:\n  2 · n · h · d_k · bytes\n  (factor 2 for K and V, h heads, d_k per head, n tokens)\n\nFor Llama-2 70B:  h=64, d_k=128, 80 layers, fp16 (2 bytes)\n  Per token per layer: 2 · 64 · 128 · 2 = 32 KB\n  Per token all layers: 32 KB · 80 = 2.5 MB\n  Per 4k-token context: 2.5 MB · 4096 = 10 GB\n\n10 GB per request. At batch 8, that's 80 GB — more than an H100 has for weights + cache combined. This is why long-context serving is hard, and why MQA/GQA exist: they cut the KV cache dramatically.\n\nMQA (Multi-Query Attention): share K and V across all heads. Cache size drops to 2·n·d_k, a factor of h reduction. Quality loss is small (~1-2%).\n\nGQA (Grouped-Query Attention): compromise — groups of heads share K/V. Llama 3 uses g=8 groups, so cache drops by h/g = 8× with near-zero quality loss. Industry default in 2024+.",
      },

      // === Training dynamics ===
      {
        kind: "prose",
        heading: "Training dynamics — attention entropy and rank collapse",
        body:
          "Two failure modes specific to deep transformers.\n\nAttention entropy: early in training, attention distributions are roughly uniform (high entropy — the model hasn't learned what to attend to). As training progresses, heads become more peaked (low entropy). Heads that stay uniform through training are 'dead heads' — they've learned to be non-selective and contribute little. Some literature prunes these post-training. If entropy collapses to near-zero (one-hot attention) across all heads, the model has overcommitted and may have poor generalization.\n\nRank collapse: in very deep transformers without residual connections, the output rank decreases with depth — all tokens' representations converge to the same vector. Dong et al. (2021) proved this formally for attention-only transformers. Residual connections break this collapse: they ensure rank doesn't decrease below the input rank. This is why residuals are non-negotiable in deep transformers, not just a nice-to-have.",
      },
      {
        kind: "prose",
        heading: "Why pre-norm replaced post-norm",
        body:
          "Original transformer applied LayerNorm after the sublayer (post-norm): x + sublayer(LN(x))... wait, that's pre-norm. Original was LN(x + sublayer(x)) — post-norm.\n\nPost-norm has a known failure at scale: as depth increases, the magnitude of the residual stream grows, and post-norm's normalization fights against the residual signal. Training requires careful warmup schedules.\n\nPre-norm: x + sublayer(LN(x)). LayerNorm is applied to the sublayer input only, not the residual stream. The residual path is clean — representations can flow through all layers without being repeatedly normalized. This is vastly more stable at depth.\n\nEvery LLM after GPT-2 uses pre-norm. Some use RMSNorm (root-mean-square norm, drops the mean-subtraction term) for efficiency — used in Llama and T5. It's a ~10% compute saving with no measurable quality loss.",
      },

      // === Paper walkthrough ===
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — the critical claims",
        items: [
          {
            claim: "Attention alone, without recurrence or convolution, is sufficient.",
            note: "This was the bold bet. Prior work (Bahdanau 2014) added attention on top of RNNs. Vaswani et al. removed the RNN entirely.",
          },
          {
            claim: "Scaled dot-product attention: divide by √d_k before softmax.",
            note: "Without scaling, dot products grow with dimension, pushing softmax into saturated regions where gradients vanish. The variance argument derived above is why.",
          },
          {
            claim: "Positional encoding is added (not concatenated) to token embeddings.",
            note: "Since attention is permutation-invariant, we need some way to inject position. Sinusoidal encoding was chosen for its extrapolation properties. Modern models use RoPE — the relative-position property extrapolates much better.",
          },
          {
            claim: "Feedforward layer between attentions is a 2-layer MLP applied per-position.",
            note: "Attention mixes across tokens; the FFN mixes within each token's representation. They serve complementary roles. Often the FFN has 4× the hidden dimension — most of the parameters live here.",
          },
          {
            claim: "Layer normalization and residual connections are necessary.",
            note: "Without residuals, deep transformers suffer rank collapse and don't train. Modern architectures use pre-norm (more stable) and often RMSNorm (cheaper with same quality).",
          },
          {
            claim: "8 attention heads, d_model=512, 6 encoder + 6 decoder layers.",
            note: "The original paper's architecture is tiny by modern standards. Llama-3 70B has 80 layers, d_model=8192, 64 heads with GQA-8. The shape changed but the core equations are identical.",
          },
        ],
      },

      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Expect to derive the attention equation on a whiteboard. The rubric: write the QKV projections with dimensions, derive why √d_k (variance argument), show the causal mask with -∞, explain multi-head as capacity splitting, mention the O(n²) complexity and how Flash Attention / MQA address it. If you can do that in 10 minutes, you're at principal bar for the transformer fundamentals question. Bonus: mention pre-norm vs post-norm and RoPE vs sinusoidal — shows you've tracked what's changed since 2017.",
      },

      {
        kind: "concepts",
        heading: "Must-know terms",
        items: [
          { term: "Self-attention", def: "Each token attends to all tokens in the same sequence. Different from cross-attention where queries come from one sequence and keys/values from another." },
          { term: "Causal mask", def: "In decoders, tokens can only attend to previous tokens. Implemented by adding a -∞ upper-triangular matrix before softmax." },
          { term: "KV cache", def: "Storage of keys and values from previous decoding steps. Reduces per-token generation cost from O(n²) to O(n)." },
          { term: "Positional encoding", def: "Mechanism to inject token position into otherwise permutation-invariant attention. Sinusoidal, learned, or rotary (RoPE)." },
          { term: "RoPE", def: "Rotary Position Embedding. Rotates query/key vectors based on position. Gives relative-position sensitivity and extrapolates well." },
          { term: "Pre-norm vs post-norm", def: "Pre-norm (x + sublayer(LN(x))) is more stable at depth and used in all modern LLMs. Post-norm was the original formulation." },
          { term: "FFN / MLP block", def: "Position-wise 2-layer feedforward network, typically with 4× expansion. Holds most of the parameters." },
          { term: "Flash Attention", def: "Tiling algorithm that computes attention in O(n) memory and 2-4× faster than naive attention. Uses online softmax for numerical stability." },
          { term: "MQA / GQA", def: "Multi-Query / Grouped-Query Attention. Share K,V across heads (MQA) or head groups (GQA) to shrink KV cache. Standard in 2024+ models." },
          { term: "Rank collapse", def: "In deep attention-only networks without residuals, token representations converge to a single vector. Residuals prevent this." },
          { term: "RMSNorm", def: "Root-Mean-Square Norm — LayerNorm without mean subtraction. ~10% faster with no quality loss. Used in Llama, T5." },
        ],
      },

      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "A transformer decoder generates text autoregressively. Without a KV cache, what is the time complexity of generating a sequence of length n?",
            choices: ["O(n)", "O(n²)", "O(n³)", "O(n log n)"],
            answer: 2,
            explain:
              "Each of n generation steps recomputes attention over all previously generated tokens (O(n²) per step). Across n steps, total work is O(n³). The KV cache reduces this to O(n²) total because you only compute new keys/values for the newest token.",
          },
          {
            q: "Why specifically divide by √d_k (not d_k, not log d_k)?",
            choices: [
              "It's an empirical hyperparameter — √ happened to work best.",
              "The standard deviation of Q·K dot products is √d_k (from variance-additivity of independent unit-variance products). Dividing by √d_k normalizes variance back to 1.",
              "It matches the dimension of the softmax output.",
            ],
            answer: 1,
            explain:
              "The argument is statistical: if Q and K components are i.i.d. with variance 1, then Var(q·k) = d_k and Std(q·k) = √d_k. Dividing by √d_k keeps pre-softmax logits at unit scale, preventing softmax saturation and vanishing gradients.",
          },
          {
            q: "Why do all modern LLMs use pre-norm instead of the original post-norm formulation?",
            choices: [
              "Pre-norm is faster to compute.",
              "Pre-norm keeps the residual stream clean — representations flow through all layers without being repeatedly renormalized. Post-norm becomes unstable at depth and requires careful warmup schedules.",
              "Post-norm was proven incorrect.",
            ],
            answer: 1,
            explain:
              "Pre-norm: x + sublayer(LN(x)) — residual stream is not normalized, only the sublayer input. Post-norm: LN(x + sublayer(x)) — the residual is repeatedly normalized, which fights the signal at depth. Pre-norm scales; post-norm doesn't.",
          },
          {
            q: "Why does GQA (grouped-query attention) barely hurt quality while cutting the KV cache 8×?",
            choices: [
              "Most attention heads in MHA learn redundant Key/Value representations; sharing across groups is a mild regularizer.",
              "GQA uses bigger model dimensions to compensate.",
              "Quality actually does drop significantly; GQA is only used for cost.",
            ],
            answer: 0,
            explain:
              "Post-training analysis of MHA models shows many heads learn similar K/V projections. GQA acknowledges this redundancy explicitly — sharing K/V across grouped heads loses little information. Llama 3 uses h=32, groups=8, so 4 heads per K/V group. Cache drops by 4×, quality drops <1%.",
          },
          {
            q: "What problem does Flash Attention solve that naive attention doesn't?",
            choices: [
              "It computes a different mathematical operation that's faster.",
              "It computes exactly the same output, but avoids materializing the n×n attention matrix in HBM by tiling and using online softmax — O(n) memory instead of O(n²).",
              "It approximates attention with sparse patterns.",
            ],
            answer: 1,
            explain:
              "Flash Attention is bit-exact equivalent to naive attention. The innovation is purely about memory layout: tile Q, K, V, compute per-block in on-chip SRAM, maintain online softmax statistics. No approximation. Compare to sparse attention or Linformer which are approximations.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // IV. SCALING LAWS
  // ==========================================================================
  {
    id: "scaling-laws",
    num: "IV",
    stage: "Foundations",
    name: "Scaling Laws & Chinchilla",
    tagline: "How to spend compute. It's more counterintuitive than you think.",
    readTime: "15 min",
    paper: {
      title: "Scaling Laws for Neural Language Models (Kaplan et al., 2020) + Training Compute-Optimal LLMs (Chinchilla, Hoffmann et al., 2022)",
      authors: "Kaplan, Hoffmann et al.",
      venue: "OpenAI / DeepMind",
    },
    sections: [
      {
        kind: "prose",
        heading: "The Kaplan scaling laws (2020)",
        body:
          "Kaplan et al. showed that for a fixed compute budget, LLM loss follows a predictable power law in three variables: model size N, dataset size D, and compute C. Specifically, loss decreases smoothly and predictably as you scale any of these, and the curves are remarkably clean across orders of magnitude. The headline: if you know the loss at small scale, you can predict it at large scale with good accuracy.",
      },
      {
        kind: "prose",
        heading: "Chinchilla's correction (2022)",
        body:
          "Kaplan's conclusion was that under a fixed compute budget, you should scale model size faster than dataset size — larger models trained on proportionally less data. DeepMind's Chinchilla paper re-ran the experiment more carefully and arrived at the opposite conclusion: model size and dataset size should scale roughly equally. Their 70B Chinchilla, trained on 1.4T tokens, outperformed the 280B Gopher trained on 300B tokens despite being 4× smaller. The lesson: most pre-2022 models were severely undertrained.",
      },
      {
        kind: "diagram",
        heading: "Kaplan vs. Chinchilla — the crossover",
        anim: "scaling",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — what actually changed",
        items: [
          {
            claim: "Loss ~ compute^(-0.05) (Kaplan)",
            note: "Power-law relationship. Double compute → predictable loss reduction. This stability is why labs can plan multi-month training runs.",
          },
          {
            claim: "Optimal ratio: ~20 tokens per parameter (Chinchilla)",
            note: "Chinchilla found that for compute-optimal training, dataset size should be roughly 20× the parameter count. GPT-3 (175B) was trained on 300B tokens (~1.7× params) — dramatically undertrained by Chinchilla's rule.",
          },
          {
            claim: "Loss continues to improve even past 'training loss convergence'",
            note: "Unlike classical ML, more data keeps helping LLMs even when train and validation loss are nearly identical. This is partly why post-Chinchilla models keep scaling token counts.",
          },
          {
            claim: "Inference compute wasn't in the original equation",
            note: "Kaplan/Chinchilla optimized training compute. But a model that's cheaper to train but more expensive to serve might cost more over its lifetime. Modern practice: deliberately overtrain smaller models to reduce per-query inference cost (e.g., Llama 3's 15T tokens on an 8B model is well past Chinchilla-optimal).",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "You'll be asked: 'given X compute, how would you decide model size vs. data?' The sophisticated answer recognizes (a) Chinchilla's 20:1 rule as a starting point, (b) inference cost amortization pushing smaller, longer-trained models, (c) data quality as a confounding variable scaling laws don't capture, and (d) that real-world deployment constraints often dominate pure compute-optimality.",
      },
      {
        kind: "concepts",
        heading: "Key terms",
        items: [
          { term: "Scaling law", def: "Empirical relationship showing how loss varies with parameters, data, or compute. Usually power-law." },
          { term: "Compute-optimal", def: "The model size / data size ratio that minimizes loss for a fixed compute budget." },
          { term: "Chinchilla-optimal", def: "Training regime where tokens-per-parameter ≈ 20. Derived from Hoffmann et al. 2022." },
          { term: "Overtraining", def: "Deliberately training past compute-optimal to reduce inference cost per query. Common for deployed models." },
          { term: "Emergent abilities", def: "Capabilities (in-context learning, arithmetic) that appear discontinuously at certain scales. Contested — some say they're measurement artifacts." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "According to Chinchilla, if you have compute to train a 70B parameter model, roughly how many training tokens should you use?",
            choices: ["70 billion", "140 billion", "1.4 trillion", "14 trillion"],
            answer: 2,
            explain:
              "The Chinchilla rule: ~20 tokens per parameter. 70B × 20 = 1.4T tokens. This is exactly what Chinchilla itself used.",
          },
          {
            q: "Llama 3 8B was trained on 15T tokens — vastly more than Chinchilla's 20:1 rule (which would suggest ~160B tokens). Why?",
            choices: [
              "Meta ignored Chinchilla.",
              "Training compute is a one-time cost; inference compute is paid per query forever. Overtraining a smaller model reduces lifetime cost.",
              "The 20:1 rule only applies to models over 100B parameters.",
            ],
            answer: 1,
            explain:
              "Chinchilla optimized training FLOPs alone. For a model served to millions of users, inference dominates lifetime compute. Overtraining smaller models improves quality-per-inference-dollar even when it's inefficient during training.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // V. EMBEDDINGS (NEW)
  // ==========================================================================
  {
    id: "embeddings",
    num: "V",
    stage: "Foundations",
    name: "Embeddings Deep-Dive",
    tagline: "The hidden backbone of RAG, search, and recommendation.",
    readTime: "28 min",
    paper: {
      title: "Sentence-BERT (Reimers & Gurevych, 2019) + SimCSE (Gao et al. 2021) + E5 / BGE / Voyage model cards",
      authors: "community",
      venue: "EMNLP + arXiv",
    },
    sections: [
      {
        kind: "prose",
        heading: "What an embedding actually is",
        body:
          "An embedding is a dense vector that represents some object — a word, a sentence, a document, an image, a user — in a space where similarity of meaning maps to geometric closeness. The dimensionality (commonly 384, 768, 1024, 1536, 3072) is chosen to balance expressiveness against compute and memory. Good embeddings have a simple invariant: if two inputs mean similar things, their vectors have high cosine similarity. If they don't, low.",
      },
      {
        kind: "prose",
        heading: "Why sentence-level embeddings needed a new approach",
        body:
          "Vanilla BERT produces contextual token embeddings — one vector per token. Naive approaches to get a sentence embedding (pool the tokens, take [CLS]) perform terribly on semantic similarity tasks. Reimers & Gurevych (2019) introduced Sentence-BERT: a Siamese architecture that fine-tunes BERT to produce sentence embeddings where cosine similarity correlates with semantic similarity. This was the unlock that made modern retrieval possible.",
      },
      {
        kind: "prose",
        heading: "Contrastive learning — the core technique",
        body:
          "Modern embedding models are trained with contrastive objectives. You don't directly predict labels; you pull semantically similar pairs together and push dissimilar pairs apart in vector space. Given an anchor a, a positive p (semantically similar), and negatives n₁, n₂, ... (dissimilar), the model learns:\n\n  similarity(a, p) should be high\n  similarity(a, nᵢ) should be low for all i\n\nThe loss function is typically InfoNCE (a contrastive cross-entropy):\n\n  L = -log[ exp(sim(a,p)/τ) / (exp(sim(a,p)/τ) + Σᵢ exp(sim(a,nᵢ)/τ)) ]\n\nτ is a temperature hyperparameter. Smaller τ = sharper distinctions, larger τ = softer. The choice of negatives matters enormously — easy negatives (clearly unrelated) teach little; hard negatives (almost-similar) teach discrimination.",
      },
      {
        kind: "diagram",
        heading: "Contrastive learning in vector space",
        anim: "contrastive",
      },
      {
        kind: "prose",
        heading: "Triplet loss vs. InfoNCE vs. multiple-negatives",
        body:
          "Three common training objectives:\n\n1. Triplet loss: max(0, sim(a,n) − sim(a,p) + margin). Pushes a closer to p than to n by at least margin. Sensitive to margin choice, computationally cheap.\n\n2. InfoNCE (contrastive cross-entropy): normalizes over all negatives in the batch. Scales better — more negatives = better learning signal. Used by CLIP, Sentence-BERT, most modern models.\n\n3. Multiple-negatives ranking loss: treats every other sentence in the batch as a negative. Batch size becomes crucial — larger batch = more negatives. This is what Sentence-BERT and most 2022+ models actually use.\n\nInfoNCE with in-batch negatives is the dominant paradigm. Hard-negative mining adds curated hard negatives beyond the random batch.",
      },
      {
        kind: "prose",
        heading: "Training data for embeddings — the bigger lever than architecture",
        body:
          "Good embedding models are less about architecture and more about training data. Typical training data sources:\n\n• NLI (Natural Language Inference) pairs: entailment pairs as positives, contradictions as hard negatives. The original Sentence-BERT recipe.\n• Paraphrase corpora: MRPC, PAWS, Quora question pairs.\n• Retrieval pairs: MS MARCO (query → relevant passage), Natural Questions.\n• Synthetic data: LLMs generate query-document pairs (used in E5, BGE).\n• Web-scraped: title→body, question→answer from forums (Reddit, StackExchange).\n\nE5 and BGE (current open-source leaders) combine all of these with ~100M+ training pairs. Proprietary models (OpenAI text-embedding-3, Voyage, Cohere Embed v3) use similar recipes with more data. The model architectures are nearly identical — the data pipelines are the moat.",
      },
      {
        kind: "prose",
        heading: "Pooling strategies — how to get one vector from a sequence",
        body:
          "BERT-style models produce one vector per token. To get a sentence embedding, you need to pool.\n\n• [CLS] token: use the first token's representation. Works if fine-tuned, terrible otherwise.\n• Mean pooling: average all token embeddings (usually with attention-mask weighting). Most common and robust.\n• Max pooling: element-wise max across tokens. Rare, sometimes complementary.\n• Last-token pooling (decoder models): for causal LLMs used as embedders, the last token has seen the full sequence. Used by E5-Mistral, GTE-Qwen.\n\nMean pooling is the default for encoder-based embedders (BERT-based). Last-token is standard for decoder-based embedders (Mistral-based). Mixing them without intention causes quality regressions.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — milestones",
        items: [
          {
            claim: "Sentence-BERT (2019): Siamese architecture for sentence embeddings.",
            note: "Two BERT towers with shared weights process both inputs. Trained with triplet or classification loss on NLI. Turned unusable ~100ms/sentence BERT-based semantic search into ~1ms/sentence that actually worked.",
          },
          {
            claim: "SimCSE (2021): unsupervised contrastive learning with dropout as augmentation.",
            note: "Feed the same sentence through the model twice — the dropout-induced variation creates positive pairs. No labels needed. Surprisingly competitive with supervised methods. Shifted the field toward contrastive learning as the default objective.",
          },
          {
            claim: "E5 (2022): 'Text Embeddings by Weakly-Supervised Contrastive Pre-training'",
            note: "Microsoft's recipe. Large-scale weak supervision from mined web pairs + fine-tuning on curated data. Task-specific prefixes ('query: ...' vs 'passage: ...') improve asymmetric retrieval. E5 and E5-Mistral became open-source benchmarks to beat.",
          },
          {
            claim: "BGE (BAAI, 2023): hard negative mining at scale.",
            note: "BAAI's BGE models dominated MTEB leaderboards through late 2023. Their contribution: disciplined hard-negative mining — use an early-stage model to find near-misses, then train on those specifically. Outperformed much larger closed models.",
          },
          {
            claim: "Matryoshka Representation Learning (2022+)",
            note: "Train embeddings such that truncating to shorter prefixes (768 → 384 → 128) still preserves meaningful similarity. OpenAI's text-embedding-3 uses this. Operational benefit: one model serves multiple quality/cost tiers. Store the full 3072d vector; retrieve with 512d for speed, rerank with 3072d for quality.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Evaluating embedding models — MTEB and its limits",
        body:
          "MTEB (Massive Text Embedding Benchmark, Muennighoff et al. 2022) is the standard benchmark: ~60 tasks across classification, clustering, retrieval, reranking, and semantic similarity. It's the leaderboard everyone chases.\n\nKnown issues: MTEB overweights English retrieval; task-specific fine-tuning games the benchmark; the 'best MTEB score' model isn't necessarily best for your corpus. For production, always evaluate on your own data with your own queries. A model at rank 5 on MTEB may beat rank 1 on your specific domain because of vocabulary mismatch or domain-specific nuance.\n\nPractical evaluation: build a golden set of (query, relevant_doc) pairs from your corpus, score candidate models on recall@k and nDCG. The answer frequently differs from MTEB ordering.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When asked 'how would you choose an embedding model?': (1) establish whether symmetric (similarity) or asymmetric (query-passage) retrieval, (2) size vs. quality tradeoff — start with a small fast model (bge-small, e5-small), profile, upgrade only if necessary, (3) evaluate on golden set from YOUR corpus, not MTEB blindly, (4) consider Matryoshka dimensions for cost-quality tuning, (5) pin the version — re-embedding is expensive, so a model swap means re-indexing everything. Show you think about operational constraints, not just model quality.",
      },
      {
        kind: "concepts",
        heading: "Embedding vocabulary",
        items: [
          { term: "Contrastive learning", def: "Training objective that pulls similar pairs together and pushes dissimilar pairs apart in vector space. The core technique." },
          { term: "InfoNCE loss", def: "Contrastive cross-entropy. Most common embedding loss. Uses in-batch negatives as the denominator." },
          { term: "Hard negative mining", def: "Curating almost-similar-but-wrong examples as negatives. Teaches fine-grained discrimination." },
          { term: "Temperature (τ)", def: "InfoNCE hyperparameter. Controls sharpness of the distribution over similarities." },
          { term: "Siamese architecture", def: "Two encoders with shared weights process two inputs independently. Foundation of Sentence-BERT." },
          { term: "Bi-encoder vs. cross-encoder", def: "Bi-encoder embeds inputs separately (fast, used for retrieval). Cross-encoder scores pairs jointly (slow, used for reranking)." },
          { term: "Pooling", def: "Reducing a sequence of token embeddings to one vector. Mean, max, [CLS], last-token." },
          { term: "Matryoshka embeddings", def: "Embeddings trained so prefixes are themselves valid embeddings. Enables variable-dimension tradeoff." },
          { term: "Cosine similarity", def: "Dot product of unit-normalized vectors. Standard similarity metric for normalized embeddings." },
          { term: "MTEB", def: "Massive Text Embedding Benchmark. The standard leaderboard, with known domain-generalization caveats." },
          { term: "Asymmetric retrieval", def: "Query and passage are distributionally different (short vs. long, question vs. answer). May use task-specific prefixes." },
          { term: "Re-indexing cost", def: "Switching embedding models requires re-embedding your entire corpus. Often the largest operational cost in a RAG system." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "You're evaluating embedding models for a legal document retrieval system. The MTEB leaderboard says model A is 4% better than model B on average. Should you choose A?",
            choices: [
              "Yes — higher MTEB = better embeddings.",
              "Maybe — but evaluate both on a golden set built from your actual legal corpus. MTEB is dominated by general-domain tasks and may not reflect legal performance.",
              "No — never trust benchmarks.",
            ],
            answer: 1,
            explain:
              "MTEB is a general benchmark; legal is a specialized domain. Fine-grained legal distinctions may lean on vocabulary that general models handle poorly. Always validate on your target distribution. A model at #5 on MTEB may beat #1 on specialized legal retrieval.",
          },
          {
            q: "Why are in-batch negatives so important in contrastive learning?",
            choices: [
              "They're not — hand-curated negatives are always better.",
              "They provide free negatives (no extra labeling), and larger batch sizes mean more negatives, which directly improves discrimination. Batch size is a first-order hyperparameter.",
              "They speed up training.",
            ],
            answer: 1,
            explain:
              "Each batch element is a negative for every other element. A batch of 256 gives 255 negatives per example with zero labeling cost. Increasing batch size often provides larger quality gains than increasing model size. This is why embedding training runs use massive batches (4k-32k).",
          },
          {
            q: "You're planning to switch from OpenAI's text-embedding-ada-002 to text-embedding-3-large. What's the biggest operational cost?",
            choices: [
              "Learning the new API.",
              "Re-embedding your entire corpus. Embeddings from different models aren't comparable — you must re-embed everything and rebuild the index.",
              "Cost per call is higher for the new model.",
            ],
            answer: 1,
            explain:
              "Embeddings live in different vector spaces across models. You cannot mix — a query embedded by model A can't meaningfully retrieve documents embedded by model B. Switching models means re-processing every document you ever embedded, which at scale can take days and cost thousands of dollars.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // VI. FINE-TUNING & ALIGNMENT (NEW)
  // ==========================================================================
  {
    id: "alignment",
    num: "VI",
    stage: "Training",
    name: "Fine-Tuning & Alignment",
    tagline: "SFT, RLHF, DPO, LoRA — how raw LLMs become useful.",
    readTime: "32 min",
    paper: {
      title: "InstructGPT (Ouyang et al., 2022) + DPO (Rafailov et al., 2023) + LoRA (Hu et al., 2021)",
      authors: "community",
      venue: "arXiv / NeurIPS",
    },
    sections: [
      {
        kind: "prose",
        heading: "Why pretraining isn't enough",
        body:
          "A pretrained LLM predicts the next token given internet text. Ask it 'what is 2+2?' and it might continue 'what is 3+3? what is 4+4?' — because question lists are common on the internet. Getting it to actually answer requires teaching it the instruction-following pattern. This is the alignment problem: shaping a next-token predictor into a useful assistant.\n\nModern alignment has three stages: (1) Supervised Fine-Tuning (SFT) on high-quality instruction-response pairs, (2) Reward modeling from human preferences, (3) RL from that reward model (RLHF) or direct preference optimization (DPO). Plus parameter-efficient methods (LoRA, adapters) that make fine-tuning cheap.",
      },
      {
        kind: "diagram",
        heading: "The three-stage alignment pipeline",
        anim: "alignment",
      },
      {
        kind: "prose",
        heading: "Stage 1: Supervised Fine-Tuning (SFT)",
        body:
          "Take a pretrained base model and fine-tune on curated (prompt, response) pairs. The response is written by humans or other models. Loss is standard language modeling cross-entropy, but only on response tokens (the prompt is masked out of the loss).\n\nDataset quality matters massively here. Tens of thousands of high-quality examples outperform millions of mediocre ones. LIMA (Zhou et al., 2023) famously achieved strong results with just 1000 carefully curated examples. The production recipe usually combines: (a) professionally written responses, (b) distillation from a stronger model, (c) filtered instruction datasets (Alpaca, Dolly, OpenHermes).\n\nSFT alone produces an 'instruction-following' model but one that may still output unhelpful, unsafe, or dishonest content. That's what preference optimization addresses.",
      },
      {
        kind: "prose",
        heading: "Stage 2: Reward modeling from human preferences",
        body:
          "Humans label pairs of responses (A, B) to the same prompt: 'which is better?' You collect thousands to millions of such binary preferences. Train a reward model R(prompt, response) → scalar that predicts these preferences via Bradley-Terry:\n\n  P(A > B) = σ(R(p, A) - R(p, B))\n\nThe reward model is typically initialized from the SFT model itself, with a scalar output head replacing the LM head. Loss: predict the human-chosen response as higher-scored.\n\nWhy preferences over direct scores? Humans are terrible at absolute quality scoring (is this a 7 or an 8?) but excellent at relative comparisons. Preference data is cheaper to collect and lower-variance.",
      },
      {
        kind: "prose",
        heading: "Stage 3a: RLHF with PPO",
        body:
          "Use reinforcement learning to fine-tune the SFT model to maximize reward-model score. The standard algorithm is Proximal Policy Optimization (PPO), applied with a KL penalty to prevent the model from drifting too far from the SFT baseline:\n\n  objective = E[R(prompt, response)] - β·KL(π_current || π_SFT)\n\nβ is a critical hyperparameter. Too low: the model reward-hacks — produces responses the reward model loves but users don't (gibberish that scores high, repetition, length bias). Too high: almost no change from SFT.\n\nRLHF is finicky. Training can be unstable; reward hacking is omnipresent; reward models drift as policy improves (reward model trained on SFT-era responses may not generalize to the post-RLHF distribution). OpenAI, Anthropic, and Meta spend significant engineering effort on RLHF infrastructure.",
      },
      {
        kind: "prose",
        heading: "Stage 3b: DPO — the simpler alternative",
        body:
          "Direct Preference Optimization (Rafailov et al., 2023) is a remarkable theoretical result: you can achieve the same objective as RLHF without training an explicit reward model and without RL. DPO reformulates the RLHF objective as a supervised classification loss on preference pairs.\n\nThe key insight: the optimal RLHF policy has a closed-form relationship to the reward. Substitute that relationship into the preference model, and you get a supervised loss directly optimizing the policy:\n\n  L_DPO = -log σ( β·log(π_θ(y_w|x)/π_ref(y_w|x)) - β·log(π_θ(y_l|x)/π_ref(y_l|x)) )\n\nwhere y_w is preferred, y_l is rejected, π_ref is the reference (SFT) model. No reward model, no PPO, no RL loop. DPO is a supervised loss — far more stable and easier to tune than PPO.\n\nIn 2023-2024, DPO largely replaced PPO for open-source alignment. Llama 3 and Mistral use DPO variants. Anthropic's public statements suggest their pipeline has evolved past vanilla PPO but specifics are proprietary.",
      },
      {
        kind: "prose",
        heading: "PEFT: LoRA and the family",
        body:
          "Fine-tuning a 70B-parameter model requires storing 70B · 2 (fp16 weights) + 70B · 4 (fp32 gradients) + 70B · 4 × 2 (Adam momenta) = 1.4 TB of GPU memory. Infeasible for most teams.\n\nParameter-Efficient Fine-Tuning (PEFT) methods freeze the base model and train a small number of new parameters. Low-Rank Adaptation (LoRA, Hu et al., 2021) is the dominant technique:\n\nFor a weight matrix W ∈ ℝ^(d×d), don't train ΔW. Instead, decompose:\n\n  W + ΔW = W + B·A\n\nwhere A ∈ ℝ^(r×d), B ∈ ℝ^(d×r), and r << d (typically r=8, 16, 32). You train only A and B — that's 2·d·r parameters instead of d² per matrix. For d=4096, r=16: 131k params instead of 16.7M — a 128× reduction.\n\nLoRA applied to a 70B model fine-tunes ~1% of parameters. At inference, you can merge B·A back into W (zero overhead) or keep them separate (serve multiple adapters per base). The latter enables multi-tenant fine-tuning at scale.\n\nQLoRA (Dettmers et al., 2023) quantizes the frozen base to 4-bit while keeping LoRA adapters in fp16. You can fine-tune 70B models on a single 48GB GPU. This is the democratization lever that made open-source fine-tuning feasible.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — the canon",
        items: [
          {
            claim: "InstructGPT (2022): the RLHF blueprint for LLMs.",
            note: "Ouyang et al.'s recipe — SFT → reward model → PPO — became the standard pipeline. Showed GPT-3 + RLHF beats GPT-3.5× bigger without RLHF on human ratings. The paper ChatGPT was built on.",
          },
          {
            claim: "Constitutional AI (Anthropic, 2022): RLAIF instead of RLHF.",
            note: "Use LLMs themselves to generate preference data following a written 'constitution' (set of principles). Dramatically cheaper than human labeling and more scalable. Anthropic's Claude relies heavily on this approach.",
          },
          {
            claim: "LoRA (2021): fine-tune with 0.1% of parameters.",
            note: "The low-rank decomposition insight made adapter-based fine-tuning practical. Essentially every open-source fine-tuning recipe uses LoRA or QLoRA today.",
          },
          {
            claim: "DPO (2023): preference optimization without RL.",
            note: "Reformulates RLHF as a supervised loss. Simpler, more stable, often equal or better quality. 2024-onward default for open-source.",
          },
          {
            claim: "IPO, KTO, ORPO (2024): DPO variants addressing edge cases.",
            note: "Identity Preference Optimization (IPO) handles pure ranking without magnitude. Kahneman-Tversky Optimization (KTO) works with binary thumbs-up/down signals. ORPO merges SFT and preference optimization into one step. The field is actively iterating.",
          },
          {
            claim: "Constitutional AI and RLAIF scale alignment to settings where human labeling doesn't.",
            note: "When you need to align on domains humans can't easily judge (specialized technical content, multi-lingual), LLM-based feedback is often more consistent than crowd-sourced human labels.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "When to fine-tune vs. prompt",
        body:
          "Not every problem needs fine-tuning. Rough heuristic:\n\n• Fine-tune if: you need consistent style/format, you have ≥500 high-quality examples, the task is stable, and prompt engineering plateaued.\n• Prompt if: rapidly iterating, small task volume, user-facing (where fine-tune latency/cost may dominate), or knowledge is the issue (use RAG instead).\n• Fine-tune + RAG if: need both domain knowledge AND specific behavior. Fine-tune for behavior, RAG for facts.\n\nCommon mistake: fine-tuning to inject knowledge. Fine-tuning is poor at adding facts — the model may fit the training examples but fail to generalize the knowledge. Use RAG for knowledge; fine-tune for behavior.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Expect: 'walk me through how you'd align an LLM for X domain.' Principal answer: (1) curate 1-10k high-quality SFT examples (often synthetic from a strong model + human filter); (2) collect preference data (thumbs up/down in production is cheap); (3) choose DPO over PPO for stability; (4) apply with LoRA for efficiency; (5) evaluate on held-out preferences AND absolute quality metrics — not just preference win-rate, which can be gamed. Bonus: discuss reward hacking, the reference-model KL penalty, and whether fine-tuning is even the right tool (vs. RAG for knowledge problems).",
      },
      {
        kind: "concepts",
        heading: "Alignment vocabulary",
        items: [
          { term: "SFT (Supervised Fine-Tuning)", def: "Fine-tuning on (instruction, response) pairs with cross-entropy on the response tokens." },
          { term: "Reward model", def: "Predicts human preference between responses. Initialized from SFT, trained with Bradley-Terry loss on pairs." },
          { term: "RLHF", def: "Reinforcement Learning from Human Feedback. PPO against a reward model with KL penalty to SFT." },
          { term: "DPO", def: "Direct Preference Optimization. Supervised loss equivalent to RLHF's objective, no reward model needed." },
          { term: "KL penalty", def: "Regularizer in RLHF preventing policy drift from SFT. β hyperparameter controls strength." },
          { term: "Reward hacking", def: "Policy exploits reward model flaws — high reward, poor actual quality. The dominant RLHF failure mode." },
          { term: "LoRA", def: "Low-Rank Adaptation. Train low-rank matrices (B·A) added to frozen base weights. 100-1000× parameter reduction." },
          { term: "QLoRA", def: "LoRA + 4-bit quantization of base model. Enables fine-tuning large models on single GPUs." },
          { term: "PEFT", def: "Parameter-Efficient Fine-Tuning. Umbrella term for LoRA, adapters, prefix tuning, etc." },
          { term: "RLAIF / Constitutional AI", def: "Use AI-generated preferences instead of human. Scales to settings where human labeling is expensive or inconsistent." },
          { term: "Catastrophic forgetting", def: "Fine-tuning causes the model to lose capabilities from pretraining. Mitigated by LoRA (base frozen) and data mixing." },
          { term: "Reference model", def: "The SFT-stage model against which preference training regularizes. Prevents drift, defines baseline behavior." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Your LLM outputs look great on the reward model score but users rate them worse than the SFT baseline. Most likely cause?",
            choices: [
              "SFT model was better — stop training.",
              "Reward hacking: the policy found patterns the reward model scores highly (length, specific phrasings) but users don't actually prefer. Increase the KL penalty β or collect fresh preference data.",
              "Need a larger model.",
            ],
            answer: 1,
            explain:
              "The classic RLHF failure. Reward models are proxies; optimizing them hard finds proxy-specific hacks. Common patterns: length bias (longer = higher reward), hedging phrases, specific formatting. Fixes: stronger KL penalty, iteratively refreshing the reward model on new policy outputs, multiple reward models ensembled.",
          },
          {
            q: "Your team wants to fine-tune Llama-70B on 5k curated examples. GPU budget is one 80GB A100. What's the approach?",
            choices: [
              "Full fine-tuning on the A100.",
              "QLoRA: 4-bit quantize the base model (~35GB) + LoRA adapters (~500MB) + optimizer states. Fits comfortably.",
              "Use a smaller model.",
            ],
            answer: 1,
            explain:
              "Full fine-tuning 70B needs ~1.4TB memory. QLoRA reduces frozen base to 4-bit (~35GB), fine-tunes only LoRA adapters (~1% of params) in fp16. Fits on a single 48-80GB GPU. Single-digit-hour training runs become possible.",
          },
          {
            q: "Why did DPO largely replace PPO for open-source alignment in 2023-2024?",
            choices: [
              "DPO produces strictly better quality than PPO.",
              "DPO is a supervised loss equivalent to RLHF's objective — no reward model, no RL loop. Much simpler to implement, more stable training, tuneable in hours instead of days.",
              "PPO requires proprietary frameworks.",
            ],
            answer: 1,
            explain:
              "Quality is comparable, sometimes DPO wins, sometimes PPO does. The dominant factor is engineering simplicity: DPO is one supervised loss you can drop into standard training infra. PPO needs a reward model, an RL loop, careful value function handling, and is notoriously finicky. For smaller teams, DPO wins on practicality.",
          },
          {
            q: "Your product needs the LLM to cite internal policy documents when answering. Fine-tune or RAG?",
            choices: [
              "Fine-tune — teach the model the documents.",
              "RAG — retrieve relevant policy at query time and instruct the model to cite. Fine-tuning is poor at injecting specific facts and citations.",
              "Both are equivalent.",
            ],
            answer: 1,
            explain:
              "Classic distinction: RAG for knowledge, fine-tuning for behavior. Fine-tuning can memorize training examples but struggles to reliably recall specific facts verbatim. RAG retrieves exact source text at query time — reliable citation, easy updates, auditable provenance. Fine-tune the model's *style* of citing if needed, but RAG provides the content.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // VII. EVALUATION & BENCHMARKS (NEW)
  // ==========================================================================
  {
    id: "evaluation",
    num: "VII",
    stage: "Training",
    name: "Evaluation & Benchmarks",
    tagline: "If you can't measure it, you're not engineering.",
    readTime: "25 min",
    paper: {
      title: "MMLU (Hendrycks et al.) + HumanEval (Chen et al.) + HELM (Liang et al.) + LLM-as-judge (Zheng et al., 2023)",
      authors: "community",
      venue: "arXiv",
    },
    sections: [
      {
        kind: "prose",
        heading: "Why LLM evaluation is uniquely hard",
        body:
          "Traditional ML: accuracy, F1, AUC — clear objective metrics on fixed labels. LLMs: the output is open-ended text, correctness is often subjective, the same question has many good answers, and benchmarks get gamed within weeks of publication. Principal-level engineers need a layered eval strategy: automated benchmarks for baseline, task-specific evals for your use case, LLM-as-judge for scale, human review for the hard cases.",
      },
      {
        kind: "prose",
        heading: "The benchmark landscape",
        body:
          "General capability:\n• MMLU (Massive Multitask Language Understanding): 57 subjects, multiple-choice. Tests broad knowledge. Saturating fast — top models hit 90%+ and it stops discriminating.\n• BIG-Bench: 200+ diverse tasks. More varied than MMLU but harder to report cleanly.\n• MMLU-Pro (2024): harder version with 10-way MCQ and more reasoning.\n• GPQA: graduate-level science questions designed to be hard even with web search.\n\nReasoning:\n• GSM8K: grade-school math word problems. Chain-of-thought benchmark.\n• MATH: high-school math olympiad problems. Much harder.\n• BBH (BIG-Bench Hard): the hard subset of BIG-Bench.\n\nCoding:\n• HumanEval: 164 Python programming problems. The standard code-gen benchmark.\n• MBPP, SWE-Bench: larger-scale and more realistic coding tasks.\n\nLong-context:\n• Needle in a haystack: inject a fact into a long context, ask the model to retrieve it.\n• RULER: more sophisticated long-context evals.\n\nSafety/alignment:\n• TruthfulQA: measures whether models generate true vs. commonly-believed-but-false answers.\n• HarmBench, ToxiGen: adversarial/harmful prompt benchmarks.\n\nHolistic:\n• HELM (Stanford): standardized evaluation across 40+ scenarios, 7 metrics each. Aims to make model comparisons reproducible.",
      },
      {
        kind: "diagram",
        heading: "The evaluation pyramid",
        anim: "eval-pyramid",
      },
      {
        kind: "prose",
        heading: "Benchmark contamination — the elephant",
        body:
          "Models trained on scraped web data have often seen the benchmark test sets. This is benchmark contamination — a model scoring 95% on MMLU may have memorized much of it, not genuinely 'understood' the material. Signals of contamination: (1) dramatically better on widely-discussed benchmarks than on comparable private ones, (2) recognition of benchmark-specific phrasings, (3) chain-of-thought that name-drops test-set answers.\n\nMitigations: (a) hold out a fraction of the benchmark as private (done by HELM, SuperGLUE), (b) use dynamically-generated benchmarks (Dynabench), (c) evaluate on post-training-cutoff questions, (d) run private evals your model hasn't seen. Labs routinely run internal 'canary' benchmarks that never appear publicly for exactly this reason.",
      },
      {
        kind: "prose",
        heading: "LLM-as-judge — the scaling trick",
        body:
          "Human evaluation is the gold standard but doesn't scale. The hack: use a strong LLM (usually GPT-4 or Claude Opus) to judge outputs from a candidate model. Prompts are carefully crafted — e.g., 'Compare these two responses to the question. Which is more helpful, accurate, and concise? Explain then answer A, B, or tie.'\n\nMT-Bench and AlpacaEval use this pattern. It's cheap (~$0.01/judgment), fast, and correlates well with human preferences (~80-90% agreement in the Zheng et al. 2023 study).\n\nKnown biases: (1) position bias — judges favor the first response; mitigate by swapping order and averaging, (2) verbosity bias — judges prefer longer answers; calibrate with length-matched controls, (3) self-preference — models rate their own outputs higher; use a judge different from the candidates, (4) format bias — judges prefer markdown-formatted responses.\n\nDespite biases, LLM-as-judge is now standard for rapid iteration. Use it for development, human eval for release gates.",
      },
      {
        kind: "prose",
        heading: "Building your own eval harness",
        body:
          "Benchmark scores are starting points, not endpoints. For any production LLM system, you need a custom eval harness. Recipe:\n\n1. Golden set: 50-500 (query, expected) pairs representative of production traffic. Curated, not auto-generated. This is the oracle.\n\n2. Metrics: task-specific. For RAG: faithfulness (is the answer supported by retrieved context?), answer relevance, context precision. For chat: helpfulness, harmlessness, honesty (HHH). For code: unit test pass rate.\n\n3. Judge: usually LLM-as-judge with carefully validated prompts. Periodically spot-check against human ratings.\n\n4. CI/CD integration: run on every model version, surface regressions. Keep historical results — trendlines matter.\n\n5. Regression set: specific failure cases collected from production. Every new version must not regress these.\n\n6. Red-team set: adversarial prompts exposing known weaknesses. Used for safety regression.\n\nThis is infrastructure, not a one-off script. Principal-level work is treating eval as a first-class system.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — milestones",
        items: [
          {
            claim: "MMLU (Hendrycks et al., 2020): 57-subject multiple-choice benchmark.",
            note: "The de facto 'general knowledge' benchmark. Cheap to run (MCQ), broad coverage. Top models now score 88-92%; differences of 1-2 points are within noise. MMLU-Pro (2024) replaces it for modern model comparisons.",
          },
          {
            claim: "HumanEval (Chen et al., 2021): 164 hand-written Python problems.",
            note: "Each problem has a docstring and unit tests. Model writes function, evaluated by running tests. Pass@1, pass@10, pass@100 metrics. Contaminated in many modern training sets; SWE-Bench and LiveCodeBench are newer replacements.",
          },
          {
            claim: "HELM (Liang et al., 2022): holistic evaluation framework.",
            note: "Stanford's systematic approach — every model evaluated on the same 40+ scenarios with consistent methodology. Enables apples-to-apples comparison. Still the most rigorous standard for 'how does model X really compare.'",
          },
          {
            claim: "Chatbot Arena (LMSYS, 2023): crowd-sourced pairwise preference.",
            note: "Users submit a prompt, see two anonymous model responses, pick the better one. Elo ratings emerge from millions of comparisons. Considered the best proxy for 'real user preference' — less gameable than fixed benchmarks because the prompt distribution shifts continuously.",
          },
          {
            claim: "Zheng et al. (2023): 'Judging LLM-as-a-Judge.'",
            note: "Formal study validating LLM-as-judge — 80%+ agreement with human preferences. Identified and proposed mitigations for position, length, and self-preference biases. Cemented LLM-as-judge as a legitimate eval technique.",
          },
          {
            claim: "Ruler, Needle-in-Haystack (2024): long-context retrieval.",
            note: "Insert facts deep into long contexts, ask model to retrieve. Reveals that claimed context windows (1M tokens) often don't work well past 32k in practice. 'Lost in the middle' — info buried mid-context is often ignored.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "'How would you evaluate an LLM product?' Senior answer: pick benchmarks. Principal answer: distinguish pre-deployment (benchmarks, custom golden set, LLM-as-judge) from post-deployment (production feedback loops, thumbs up/down, regression sets), discuss which metrics matter for YOUR product (helpfulness ≠ safety ≠ honesty), explain benchmark contamination risks, propose a CI-integrated eval harness. Bonus: mention that user-observed metrics (retention, task completion) eventually dominate offline evals, and that eval-quality ultimately constrains product-quality.",
      },
      {
        kind: "concepts",
        heading: "Evaluation vocabulary",
        items: [
          { term: "Golden set", def: "Curated (input, expected output) pairs used as ground truth. The oracle against which systems are scored." },
          { term: "LLM-as-judge", def: "Using a strong LLM to score or compare other models' outputs. Cheap, scalable, with known biases." },
          { term: "Benchmark contamination", def: "Models having seen test sets during training. Invalidates benchmark scores; detectable via recognition patterns." },
          { term: "Pass@k", def: "Coding metric: probability of at least one of k samples passing unit tests." },
          { term: "nDCG", def: "Normalized Discounted Cumulative Gain. Rank-sensitive retrieval metric weighting top results more." },
          { term: "MTEB", def: "Massive Text Embedding Benchmark. Standard for embedding evaluation, 60+ tasks." },
          { term: "Chatbot Arena / LMSYS", def: "Crowd-sourced pairwise preference Elo ratings. Considered the best 'real-world preference' signal." },
          { term: "Position bias", def: "LLM judges favor whichever response is shown first. Mitigated by swap-and-average." },
          { term: "Length bias", def: "Judges prefer longer responses. Calibrated with length controls." },
          { term: "Regression set", def: "Specific failures collected from production, used to ensure new models don't re-introduce bugs." },
          { term: "Red-team set", def: "Adversarial prompts testing safety, alignment, and known weaknesses." },
          { term: "HELM / HEIM", def: "Stanford's holistic evaluation frameworks. Systematic, reproducible model comparison." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Your new model scores 92% on MMLU, up from 88% on the previous version. Users report it feels worse. What's likely?",
            choices: [
              "Users are wrong — MMLU says it's better.",
              "MMLU measures knowledge-MCQ; users care about helpfulness, response quality, conversational flow. Benchmark improvement doesn't guarantee product improvement. You need task-specific eval on your use case.",
              "You need more MMLU training data.",
            ],
            answer: 1,
            explain:
              "Classic mismatch between benchmark objectives and user experience. MMLU measures facts and MCQ reasoning; users experience helpfulness, tone, ability to follow complex instructions. Always evaluate on signals that match your product — benchmarks are at best proxies.",
          },
          {
            q: "You're using GPT-4 as a judge to compare candidate models. Scores are suspiciously aligned with a specific candidate. What's the most likely bias, and how do you fix it?",
            choices: [
              "Position bias; swap response order and average results.",
              "Self-preference bias if one candidate is also GPT-4-based; use a different judge model (e.g., Claude) or ensemble multiple judges.",
              "Both are possible; always check for position bias, and use non-competing judges when candidates include the judge's family.",
            ],
            answer: 2,
            explain:
              "Both biases are common. Position bias: judges favor response A over B when ordered AB. Fix with swap-and-average. Self-preference: GPT-4 judge favors GPT-4-based candidates. Fix by using a different family as judge, or ensembling multiple judges. In production eval, do both.",
          },
          {
            q: "You want to compare LLM A and B for your customer-support chatbot. Budget is limited. What's the best approach?",
            choices: [
              "Run HELM on both and pick the winner.",
              "Build a 100-query golden set from real customer-support transcripts, score both with LLM-as-judge on helpfulness and correctness, spot-check 20 with human review. Iterate the golden set as production issues surface.",
              "Deploy both and A/B test.",
            ],
            answer: 1,
            explain:
              "HELM is too general — may not predict customer-support quality. A/B is expensive and slow. A small curated golden set + LLM-as-judge hits the sweet spot: fast, cheap, representative, and the golden set itself becomes a durable asset. Human spot-checks validate the LLM judge. Iterate as you learn more.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // VIII. MIXTURE OF EXPERTS (NEW)
  // ==========================================================================
  {
    id: "moe",
    num: "VIII",
    stage: "Training",
    name: "Mixture of Experts",
    tagline: "Why Mixtral 8×7B matches GPT-3.5 with 12B active params.",
    readTime: "22 min",
    paper: {
      title: "Switch Transformer (Fedus et al., 2021) + Mixtral 8x7B (Jiang et al., 2024) + DeepSeek-V3 (2024)",
      authors: "community",
      venue: "JMLR / arXiv",
    },
    sections: [
      {
        kind: "prose",
        heading: "The core idea: conditional computation",
        body:
          "Dense transformers use every parameter for every token. This is wasteful — not every token needs every specialist pattern. Mixture of Experts (MoE) replaces the FFN block with a set of parallel FFNs ('experts'), plus a small router that decides which expert(s) to send each token to. Only the selected experts run for a given token.\n\nThe result: a model with N experts has N× the total parameters but activates only k experts per token (typically k=1 or 2). You pay the memory cost of a big model but the compute cost of a small one. Mixtral 8×7B has 47B total parameters but activates only ~12B per token — meaning quality of a 47B model at the inference cost of a 12B model.",
      },
      {
        kind: "diagram",
        heading: "The MoE routing mechanism",
        anim: "moe",
      },
      {
        kind: "prose",
        heading: "Routing — the key design choice",
        body:
          "For each token, a learned router (typically a single linear layer) produces scores over N experts:\n\n  scores = softmax(W_router · x)   where W_router ∈ ℝ^(N × d)\n\nTop-k routing: select the k experts with highest scores. Each selected expert processes the token; outputs are weighted by the router scores:\n\n  output = Σ_{i in top-k} score_i · expert_i(x)\n\nCommon choices:\n• Switch Transformer (top-1): single expert per token. Max efficiency, sometimes quality loss.\n• Mixtral, DeepSeek (top-2): two experts per token. Better quality, ~2× compute per token.\n• Top-k with k>2: diminishing returns; rarely seen in production.\n\nThe router is tiny (~0.1% of params) but critical. Bad routing = some experts overused (capacity-limited), others ignored (wasted params). Training has to explicitly regularize for balanced routing.",
      },
      {
        kind: "prose",
        heading: "Load balancing — the central engineering problem",
        body:
          "Without intervention, the router collapses to a few 'popular' experts — easier to route to ones the router already knows are good. Unpopular experts never get training signal, atrophy, and the model effectively becomes smaller than designed.\n\nFixes:\n\n1. Auxiliary load-balancing loss: add a term encouraging uniform routing across experts. Typical form:\n\n   L_aux = α · N · Σᵢ fᵢ · Pᵢ\n\n   where fᵢ is the fraction of tokens routed to expert i, Pᵢ is the average routing probability for expert i. α is a small coefficient (e.g., 0.01). Pushes f and P toward 1/N.\n\n2. Expert capacity: set a max number of tokens each expert can process per batch. Tokens above capacity are 'dropped' (their representation passes through unchanged) or re-routed. Fedus et al.'s Switch Transformer introduces capacity = (tokens_in_batch / N_experts) × capacity_factor, typically cf=1.25.\n\n3. Router z-loss: penalize large router logits to stabilize training (ST-MoE paper, Zoph et al. 2022).\n\n4. Expert parallelism: place different experts on different GPUs. Routing becomes an all-to-all communication. Non-trivial distributed systems engineering.\n\nDeepSeek-V2 and V3 introduced more sophisticated routing with shared experts (always active) plus fine-grained routed experts, achieving better balance than prior approaches.",
      },
      {
        kind: "prose",
        heading: "MoE vs. dense — the tradeoffs",
        body:
          "MoE wins:\n• Better quality per inference FLOP (compute budget).\n• Better scaling: total params can grow much faster than compute.\n• Task specialization: experts learn to handle different patterns (some math-y, some conversational).\n\nMoE loses:\n• More total params → more memory. Mixtral 47B needs 94GB at fp16 vs. 14B for a dense 7B. Memory-bandwidth-bound.\n• Harder to serve efficiently: variable expert load, all-to-all communication for expert parallelism.\n• Training is more complex: routing instability, load balancing, expert parallelism.\n• Fine-tuning is harder: small datasets can cause routing collapse.\n• Quality/active-param scaling plateaus: 8×7B better than 4×7B, but 16×7B isn't 2× better than 8×7B.\n\nPractical decision: MoE makes sense when you have aggregate memory to hold many experts (data centers with high-memory GPUs) but want low inference FLOPs per query. For on-device or memory-constrained serving, dense models remain simpler.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — key milestones",
        items: [
          {
            claim: "Shazeer et al. (2017): Outrageously Large Neural Networks.",
            note: "First practical MoE for language — 137B parameters in 2017, sparsely activated. Showed MoE could scale to then-unheard-of sizes. Introduced noisy top-k routing to break routing ties during training.",
          },
          {
            claim: "GShard (Google, 2020): MoE at Google scale.",
            note: "600B MoE model for translation. Introduced expert parallelism across TPU pods, systematic load-balancing loss. The infrastructure paper that made MoE production-viable.",
          },
          {
            claim: "Switch Transformer (Fedus et al., 2021): simplification to top-1.",
            note: "Showed top-1 routing (cheapest possible) still outperforms dense baselines at equivalent compute. 1.6T parameter model. Clean design that became the reference architecture.",
          },
          {
            claim: "GLaM (Google, 2022): MoE beats dense on quality-per-FLOP.",
            note: "1.2T MoE vs. 175B GPT-3. Similar quality, 1/3 the inference FLOPs. Demonstrated MoE as the efficient scaling path.",
          },
          {
            claim: "Mixtral 8×7B (Mistral, 2024): the open-source MoE that worked.",
            note: "First widely-adopted open-source MoE. 47B params, ~12B active, top-2 routing. Matches GPT-3.5 Turbo on many benchmarks at dramatically lower inference cost. Kicked off open-source MoE adoption.",
          },
          {
            claim: "DeepSeek-V2 / V3 (2024): fine-grained + shared experts.",
            note: "Separate 'always-on' shared experts from top-k routed experts. Many small experts (256+) for specialization, a few shared for common patterns. Better balance and quality than Mixtral-style. The 2024-2025 reference architecture.",
          },
          {
            claim: "Grok-1 (xAI, 2024): open-weight 314B MoE.",
            note: "Large-scale open release showing MoE's viability at GPT-4 scale. Top-2 of 8 experts per token. ~25% active params.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Expect: 'why does Mixtral 8×7B match GPT-3.5 with far less inference cost?' Strong answer covers: conditional computation basics, top-k routing mechanics, the distinction between total params (memory) and active params (compute), load-balancing challenges (and specific fixes — aux loss, capacity factor), tradeoffs (memory-bandwidth bottleneck, harder fine-tuning), and when MoE makes sense (data-center inference with aggregate memory) vs. when dense wins (edge deployment, small-batch serving). Bonus: discuss expert specialization as an interpretability angle — different experts handle different linguistic patterns.",
      },
      {
        kind: "concepts",
        heading: "MoE vocabulary",
        items: [
          { term: "Expert", def: "An FFN sub-network that specializes in a subset of inputs. MoE layers have N experts in parallel." },
          { term: "Router", def: "Small linear layer that scores tokens over experts and selects top-k to route to." },
          { term: "Top-k routing", def: "Select the k experts with highest router scores. k=1 (Switch) or k=2 (Mixtral, DeepSeek) most common." },
          { term: "Total vs. active parameters", def: "Total = all params in the model. Active = params used per token. MoE's key value prop: active << total." },
          { term: "Load-balancing loss", def: "Auxiliary term forcing uniform routing across experts. Prevents collapse to a few popular ones." },
          { term: "Expert capacity", def: "Max tokens per expert per batch. Excess tokens are dropped or rerouted. Typically capacity_factor × (tokens/N)." },
          { term: "Expert parallelism", def: "Placing different experts on different devices. Routing requires all-to-all communication." },
          { term: "Router z-loss", def: "Regularizer preventing router logits from growing too large. Stabilizes training (ST-MoE)." },
          { term: "Shared experts", def: "Always-on experts that handle every token, complementing routed experts. DeepSeek-V2 innovation." },
          { term: "Token dropping", def: "When an expert exceeds capacity, surplus tokens bypass the expert layer. Quality cost, predictability gain." },
          { term: "Routing collapse", def: "Training failure where most tokens route to few experts. Rest atrophy. Why load-balancing is essential." },
          { term: "Fine-grained MoE", def: "Many small experts (256+) vs. few large ones (8). Enables more specialization; harder to balance." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Mixtral 8×7B has 47B total parameters but is often described as having 12B active parameters per token. Explain the gap.",
            choices: [
              "Mistral is exaggerating marketing claims.",
              "Each token routes to 2 of 8 experts. Active params = non-MoE params (attention, norms, ~2B) + 2×(one expert's FFN, ~5B each) = ~12B. Total = all 8 experts' FFNs + shared params = ~47B.",
              "Mixtral uses model distillation.",
            ],
            answer: 1,
            explain:
              "The math: dense Mistral-7B FFN is ~5B params; Mixtral has 8 FFNs (~40B total) + 7B of shared attention/embedding/norms = ~47B. Top-2 routing: 2 of 8 FFNs run per token = ~10B FFN + 2B shared = ~12B active. You pay memory for 47B but compute for 12B.",
          },
          {
            q: "A colleague fine-tunes Mixtral on a small domain-specific dataset. Quality drops significantly. What's the likely cause?",
            choices: [
              "Fine-tuning is never a good idea for MoE.",
              "Routing collapse: the small dataset doesn't exercise all experts, so training drives tokens to a few popular ones. Unused experts degrade. Mitigate with load-balancing loss, LoRA on attention only (leaving experts frozen), or keeping router frozen.",
              "MoE models can't be fine-tuned at all.",
            ],
            answer: 1,
            explain:
              "MoE fine-tuning is notoriously fragile on small data. Small datasets can't exercise all 8 experts evenly. Common fixes: (1) freeze the router, (2) apply LoRA only to attention (not experts), (3) strengthen load-balancing loss, (4) use DeepSeek-style shared experts that always receive gradient. 'MoE is hard to fine-tune' is one of its real costs.",
          },
          {
            q: "You're choosing between a dense 30B model and a 8×4B MoE (32B total, ~8B active). Both deploy on the same hardware. Which is better for a latency-sensitive chatbot?",
            choices: [
              "Always MoE — smaller active params = faster.",
              "Depends on memory bandwidth. MoE has more total params (more memory to stream during decode), but fewer FLOPs. For batch=1 memory-bandwidth-bound serving, dense 30B may actually be faster than 32B MoE despite higher FLOPs.",
              "Always dense — simpler.",
            ],
            answer: 1,
            explain:
              "Counterintuitive but real: decode is memory-bandwidth-bound. MoE's lower FLOPs don't help if you're streaming 32B of weights through HBM anyway. Plus MoE's all-to-all routing adds communication latency. Dense is often faster at batch=1. MoE wins at high batch (compute-bound regime) and on quality-per-FLOP at scale.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // IX. ML SYSTEMS THINKING (previously V)
  // ==========================================================================
  {
    id: "ml-systems",
    num: "IX",
    stage: "Systems",
    name: "ML Systems Thinking",
    tagline: "The spine: Huyen + Sculley's technical debt.",
    readTime: "22 min",
    paper: {
      title: "Designing ML Systems (Chip Huyen) + Hidden Technical Debt in ML Systems (Sculley et al., 2015)",
      authors: "Huyen; Sculley et al.",
      venue: "O'Reilly / NeurIPS",
    },
    sections: [
      {
        kind: "prose",
        heading: "ML system ≠ ML model",
        body:
          "The model is 5% of an ML system. The other 95% is data collection, data validation, feature engineering, training infrastructure, model evaluation, monitoring, serving, experimentation platforms, and configuration. Sculley's famous diagram shows the ML code as a tiny box surrounded by a sea of infrastructure. Principal interviewers care about that sea, not about your loss function taste.",
      },
      {
        kind: "diagram",
        heading: "Sculley's diagram (the real picture)",
        anim: "sculley",
      },
      {
        kind: "prose",
        heading: "Huyen's four ML system components",
        body:
          "Chip Huyen's book organizes ML systems into four concerns: (1) data engineering — getting, validating, storing, and processing data; (2) model development — training, evaluation, experimentation; (3) deployment — serving models, A/B tests, canarying; (4) monitoring and continual learning — detecting drift, retraining. Each has its own failure modes. The book's core insight: most production ML failures aren't model problems, they're pipeline problems.",
      },
      {
        kind: "prose",
        heading: "Seven forms of ML technical debt (Sculley et al.)",
        body:
          "The landmark 2015 paper identifies seven categories: (1) boundary erosion — ML systems entangle dependencies that traditional code keeps separate; (2) data dependencies — changes upstream silently break downstream models; (3) feedback loops — model outputs become inputs to future training; (4) glue code — 95% of a typical ML system is plumbing; (5) pipeline jungles — ad-hoc data pipes accreting over time; (6) dead experimental code — branches kept 'just in case' that increase complexity; (7) configuration debt — hundreds of hyperparameters with unclear lineage.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — Sculley's key warnings",
        items: [
          {
            claim: "CACE: Changing Anything Changes Everything",
            note: "ML models learn joint distributions over all inputs. Changing one feature affects the importance of all others. There's no 'local' change. Implication: you need full-system retesting, not unit tests.",
          },
          {
            claim: "Correction cascades",
            note: "When a model is slightly wrong, teams often add a 'correction model' on top rather than fixing the base. Over time this stacks. The correction models themselves have biases, and the whole tower becomes impossible to reason about.",
          },
          {
            claim: "Undeclared consumers",
            note: "A model's outputs are often consumed by downstream systems the model's owners don't know about. Changing the model breaks them silently. Treat model outputs as public APIs with versioning.",
          },
          {
            claim: "Unstable data dependencies",
            note: "Your model depends on a feature from another team's table. That team refactors. Your model's behavior shifts — maybe not catastrophically, but invisibly. Pin data schemas; validate distributions.",
          },
          {
            claim: "Feedback loops (direct and hidden)",
            note: "Recommendation system trained on clicks: the model's recs influence what's clicked, which becomes training data, which shapes future recs. Some loops tighten over time (ads); others cause divergence (content moderation).",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When asked to 'design an ML system for X,' principal-level answers cover data flow first (where does data come from, how is it validated, what's the refresh cadence), then model concerns (eval criteria, A/B framework), then ops (monitoring, rollback, drift detection). If you jump to model architecture, you've signaled senior-level thinking, not principal.",
      },
      {
        kind: "concepts",
        heading: "Key terms",
        items: [
          { term: "Training/serving skew", def: "Difference between data as it appears in training vs. serving. Classic cause of production failures." },
          { term: "Feature store", def: "Centralized service for computing, serving, and versioning features. Reduces training/serving skew." },
          { term: "Data drift", def: "Input distribution changes over time. Your model's features are no longer representative." },
          { term: "Concept drift", def: "The relationship P(y|x) changes — same input should produce different output now. Harder than data drift." },
          { term: "Canary deployment", def: "Route a small % of traffic to the new model; roll back if metrics degrade." },
          { term: "Shadow deployment", def: "New model scores the same traffic as production but its outputs aren't served. Used for validation before rollout." },
          { term: "Continual learning", def: "Model retrains on fresh data on a cadence. Online, batch, or triggered by drift detection." },
          { term: "Feature leakage", def: "Including information in training that won't be available at inference time. Inflates offline metrics, breaks production." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Your fraud detection model has 99.2% accuracy in offline eval. Deployed in production, it's catching obvious fraud but missing a new pattern. Your training set is 6 months old. What's this called?",
            choices: [
              "Overfitting",
              "Concept drift — the definition of fraud has changed since training data was collected.",
              "Training/serving skew",
            ],
            answer: 1,
            explain:
              "The input distribution might be similar, but P(fraud|features) has changed — new fraud patterns exist that weren't in training. That's concept drift. Data drift would mean the features themselves look different.",
          },
          {
            q: "Which of these is a feedback loop problem, not a general ML problem?",
            choices: [
              "Model accuracy degrading on a fixed test set over time.",
              "Recommendation system steering users toward certain content, causing training data to over-represent that content, further strengthening the recommendation.",
              "Training loss plateauing.",
            ],
            answer: 1,
            explain:
              "Feedback loops are when model outputs influence future training data. Recommender systems are the canonical case — they shape user behavior, which shapes future training sets, which shapes future behavior.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // X. RAG ORIGINAL
  // ==========================================================================
  {
    id: "rag-original",
    num: "X",
    stage: "RAG",
    name: "RAG: The Original Paper",
    tagline: "Lewis et al., 2020 — where it all started.",
    readTime: "15 min",
    paper: {
      title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
      authors: "Lewis et al., 2020",
      venue: "NeurIPS",
    },
    sections: [
      {
        kind: "prose",
        heading: "The problem RAG solved",
        body:
          "Pre-trained language models store knowledge in their weights. This has three problems: (1) you can't update knowledge without retraining, (2) the model hallucinates when its internal knowledge is stale or missing, (3) there's no way to cite sources — the provenance is lost inside the parameters. RAG separates parametric knowledge (what the LLM knows from pretraining) from non-parametric knowledge (an external retrieval index). The LLM stays fixed; the index can be updated, swapped, or filtered arbitrarily.",
      },
      {
        kind: "prose",
        heading: "The original architecture",
        body:
          "Lewis et al. 2020 combined a dense retriever (DPR — Dense Passage Retrieval) with a generator (BART). Given a query, DPR embeds it, does approximate nearest neighbor search against a pre-embedded Wikipedia corpus, retrieves the top-k passages, and conditions BART on them to generate the answer. Two variants: RAG-Sequence (all passages condition one generation) and RAG-Token (each generated token can attend to different passages). The key innovation wasn't retrieval or generation individually — it was making them jointly trainable end-to-end.",
      },
      {
        kind: "diagram",
        heading: "The RAG pipeline, step by step",
        anim: "rag-pipeline",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — what Lewis et al. got right and wrong",
        items: [
          {
            claim: "Dense retrieval over sparse (BM25).",
            note: "At the time, BM25 was the retrieval workhorse. Lewis showed dense embeddings (learned, not term-based) matched or beat BM25 on question answering. Modern practice: hybrid — both.",
          },
          {
            claim: "End-to-end differentiability through marginalization.",
            note: "The key theoretical contribution. The retriever's 'choice' of passages is treated probabilistically; gradients flow back through both retriever and generator. In practice, most production RAG doesn't do this — retrieval and generation are trained separately.",
          },
          {
            claim: "Wikipedia-scale index (~21M passages).",
            note: "Ambitious for 2020. Modern enterprise corpora (millions of internal documents) are similar order; the engineering around freshness and access control is harder than scale.",
          },
          {
            claim: "RAG-Token vs RAG-Sequence tradeoff.",
            note: "RAG-Token is more flexible (can switch passages per-token) but complex. Nearly all modern systems use RAG-Sequence equivalents: retrieve once, stuff the prompt, generate. Simplicity wins.",
          },
          {
            claim: "The paper didn't address chunking, reranking, or filtering.",
            note: "These are the dominant concerns in production RAG today. The original paper treated retrieval as a solved problem; it isn't.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Expect to be asked why RAG instead of fine-tuning. The crisp answer: RAG gives you (1) fresh knowledge without retraining, (2) citations/provenance for compliance, (3) per-query access control, (4) cheap updates. Fine-tuning changes behavior and style; RAG changes knowledge. They solve different problems and often combine.",
      },
      {
        kind: "concepts",
        heading: "Key terms",
        items: [
          { term: "Parametric knowledge", def: "Knowledge encoded in model weights. Updated only by retraining." },
          { term: "Non-parametric knowledge", def: "Knowledge in an external index. Updated independently of the model." },
          { term: "Dense retrieval", def: "Retrieval via vector similarity over learned embeddings (e.g., DPR, sentence-transformers)." },
          { term: "Sparse retrieval", def: "Term-based retrieval (BM25, TF-IDF). Exact-match biased." },
          { term: "Hybrid retrieval", def: "Combine sparse + dense scores. Usually better than either alone." },
          { term: "ANN", def: "Approximate Nearest Neighbor search. Libraries: FAISS, HNSW, ScaNN." },
          { term: "RAG-Sequence vs RAG-Token", def: "Whether passages condition the whole generation or per-token. Sequence is standard." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Why does dense retrieval often beat BM25 on paraphrased queries?",
            choices: [
              "Dense retrieval is faster.",
              "Dense embeddings capture semantic similarity; BM25 relies on exact term overlap, which breaks under paraphrase.",
              "BM25 doesn't handle long documents.",
            ],
            answer: 1,
            explain:
              "BM25 scores 'How do I reset my password?' and 'password recovery steps' as nearly unrelated — few shared terms. Dense embeddings represent them similarly in semantic space. That's the core advantage.",
          },
          {
            q: "When would you choose fine-tuning over RAG?",
            choices: [
              "When you need the model to learn a new domain's style, tone, or behavior — not just access new facts.",
              "When you need fresh information.",
              "When you need citations.",
            ],
            answer: 0,
            explain:
              "RAG injects knowledge but doesn't change how the model responds. If you need the model to always respond in a specific style (legal, medical), follow a specific protocol, or generate in a way the base model doesn't, fine-tuning is required. Often both are used.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // XI. RAG MODERN
  // ==========================================================================
  {
    id: "rag-modern",
    num: "XI",
    stage: "RAG",
    name: "Modern RAG & the 2024 Survey",
    tagline: "Gao et al. 2024. What actually works in production.",
    readTime: "30 min",
    paper: {
      title: "Retrieval-Augmented Generation for Large Language Models: A Survey",
      authors: "Gao et al., 2024",
      venue: "arXiv",
    },
    sections: [
      {
        kind: "prose",
        heading: "The three eras of RAG",
        body:
          "Gao et al. organize RAG's evolution into three paradigms. Naive RAG: retrieve → stuff prompt → generate. Works for simple lookup. Advanced RAG: adds pre-retrieval (query rewriting, expansion) and post-retrieval (reranking, compression) stages. Handles ambiguous queries, irrelevant passages. Modular RAG: treats the pipeline as composable modules — retrievers, rerankers, generators, memory, routers — that can be rearranged per use case. This is where production systems live.",
      },
      {
        kind: "diagram",
        heading: "The production RAG pipeline",
        anim: "rag-advanced",
      },
      {
        kind: "prose",
        heading: "Chunking — the underrated problem",
        body:
          "How you split documents dominates retrieval quality. Fixed-size chunks (e.g., 512 tokens) are simple but cut through sentences and concepts. Recursive character splitting respects structure (paragraphs, headings). Semantic chunking uses embedding distances between sentences to find natural breaks. Late chunking embeds the full document first, then splits — preserving cross-chunk context in the embeddings. No single winner; it's domain-dependent. For structured docs (legal, medical), chunking by section headers often beats everything else.",
      },
      {
        kind: "prose",
        heading: "Rerankers — when top-k isn't enough",
        body:
          "Vector similarity is fast but coarse. A reranker is a more expensive model (often a cross-encoder) that scores query-passage relevance more precisely. Typical pattern: retrieve top-100 with a bi-encoder (fast), rerank to top-5 with a cross-encoder (slow, accurate). Cohere Rerank, bge-reranker, and Voyage rerankers are common. Skipping the reranker is the single biggest quality loss in naive RAG implementations.",
      },
      {
        kind: "prose",
        heading: "Query transformation",
        body:
          "Users ask terrible queries. Four techniques: (1) HyDE — Hypothetical Document Embeddings: ask the LLM to generate a fake answer, then embed and retrieve against that (the fake answer is often semantically closer to real answers than the question was). (2) Multi-query — generate N paraphrases, retrieve for each, union results. (3) Step-back prompting — ask the LLM to rewrite as a more general question first. (4) Query decomposition — break multi-part questions into sub-queries, answer each, then synthesize.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — the survey's key takeaways",
        items: [
          {
            claim: "Evaluation is still an open problem.",
            note: "Classical IR metrics (recall@k, nDCG) don't capture end-to-end RAG quality. LLM-as-judge (RAGAS, TruLens) is the dominant approach but has known biases. No consensus.",
          },
          {
            claim: "Retrieval augmentation isn't always helpful.",
            note: "Irrelevant retrieved passages can hurt generation quality. Self-RAG and similar approaches add a step where the model decides whether to retrieve at all.",
          },
          {
            claim: "Long-context models didn't kill RAG.",
            note: "As context windows hit 1M tokens, many predicted RAG was obsolete. In practice, long context is expensive, context-poisoning is real, and retrieval + small context often beats brute-force stuffing. RAG won the long-term bet.",
          },
          {
            claim: "Graph RAG and agentic RAG are the frontier.",
            note: "GraphRAG (Microsoft, 2024) builds knowledge graphs from the corpus and retrieves over structure. Agentic RAG loops: retrieve, evaluate, re-query, retrieve again. Both are heavier but handle multi-hop questions that flat RAG can't.",
          },
          {
            claim: "Embedding model choice matters enormously.",
            note: "OpenAI, Cohere, Voyage, BGE, and open-source embeddings vary 10-20% in retrieval quality on the same corpus. Re-embedding is expensive, so this is a commitment.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Principal-level RAG conversation covers: chunking strategy and why, embedding model choice, hybrid retrieval (sparse + dense), reranking, evaluation (RAGAS, golden datasets), freshness (how new docs get indexed), access control (per-query filtering at the vector DB level), and graceful degradation (what happens when retrieval returns nothing relevant). If you can sketch this end-to-end in 15 minutes, you're at the bar.",
      },
      {
        kind: "concepts",
        heading: "Production vocabulary",
        items: [
          { term: "Chunking", def: "Splitting documents into retrievable units. Fixed-size, recursive, semantic, late — tradeoffs per domain." },
          { term: "Reranker", def: "Second-stage scorer (usually cross-encoder) that refines top-k retrieval results. High accuracy, slower." },
          { term: "HyDE", def: "Hypothetical Document Embeddings. Generate a fake answer, embed it, retrieve against it." },
          { term: "Multi-query", def: "Generate several query paraphrases, retrieve for each, combine." },
          { term: "Cross-encoder vs. bi-encoder", def: "Bi-encoder: embeds query and passage separately. Fast. Cross-encoder: scores them jointly. Accurate but slow." },
          { term: "RAGAS / TruLens", def: "LLM-as-judge evaluation frameworks for RAG. Metrics: faithfulness, answer relevance, context precision/recall." },
          { term: "Self-RAG", def: "RAG variant where the model decides when to retrieve and reflects on retrieval quality." },
          { term: "GraphRAG", def: "Build a knowledge graph from the corpus; retrieve over graph structure. Better for multi-hop questions." },
          { term: "Hybrid search", def: "Combine sparse (BM25) and dense retrieval scores. Usually via Reciprocal Rank Fusion." },
          { term: "Metadata filtering", def: "Vector DB feature to filter by attributes (date, source, permissions) before/during ANN search." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Your production RAG system returns semantically similar but factually wrong passages. Users see hallucinated answers supported by irrelevant citations. Which fix attacks the root cause?",
            choices: [
              "Switch to a bigger LLM.",
              "Add a reranker stage after initial retrieval.",
              "Add a faithfulness check (LLM-as-judge) that verifies the generated answer is actually supported by retrieved passages — and abstains or re-retrieves if not.",
            ],
            answer: 2,
            explain:
              "Reranking helps but only re-orders what retrieval already found. If retrieval is getting semantically-similar-but-wrong passages, the generator can't save it. A faithfulness check catches the problem at generation time and forces the system to acknowledge low confidence rather than confabulate.",
          },
          {
            q: "HyDE works by:",
            choices: [
              "Embedding the query and retrieving against a cache of previously seen queries.",
              "Asking the LLM to generate a fake answer, embedding the fake answer, and retrieving documents similar to that.",
              "Using hypothesis testing to select the best passage.",
            ],
            answer: 1,
            explain:
              "HyDE — Hypothetical Document Embeddings. The insight: generated fake answers often look more like real answers (lexically and semantically) than questions do. So they're often better query vectors than the original question.",
          },
          {
            q: "A colleague proposes killing your RAG system now that you can fit 1M tokens in context. What's the best counterargument?",
            choices: [
              "Long context is expensive per query; retrieval is cheap. Cost scales with query volume.",
              "Long context models suffer from 'lost in the middle' — relevant info buried in the middle of huge contexts gets ignored.",
              "Freshness: context changes per query; retraining on 1M-token contexts doesn't solve index-update problems.",
              "All of the above.",
            ],
            answer: 3,
            explain:
              "All three are real. Long context doesn't remove the need for retrieval — it just moves the cost around and introduces new failure modes. RAG + medium context has been winning for two years and shows no sign of being replaced.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // XII. EFFICIENT INFERENCE
  // ==========================================================================
  {
    id: "inference",
    num: "XII",
    stage: "Serving",
    name: "Efficient Inference at Scale",
    tagline: "Pope et al. — the physics of serving LLMs.",
    readTime: "22 min",
    paper: {
      title: "Efficiently Scaling Transformer Inference",
      authors: "Pope et al., 2022",
      venue: "Google",
    },
    sections: [
      {
        kind: "prose",
        heading: "Why LLM serving is hard",
        body:
          "Training is about throughput: feed as much data as possible through the model per unit time. Serving is about latency and cost per request. The two regimes have opposite optimal configurations. A model that trains efficiently on TPUs/GPUs in giant batches may serve terribly to latency-sensitive users. LLMs complicate this further because generation is autoregressive — you can't batch within a single request, and batch sizes across requests vary per-token.",
      },
      {
        kind: "prose",
        heading: "The KV cache, again",
        body:
          "During generation, each new token attends to all prior tokens. Without caching, you'd recompute the keys and values for every prior token at every new step. The KV cache stores them. This is both a massive speedup and the dominant memory cost in long-context serving: cache size scales with (batch × sequence_length × num_layers × kv_hidden_dim × 2). A 70B model serving a 4k context in fp16 needs roughly 160MB of KV cache per request. At batch 32, that's 5GB — more than the model weights need per forward pass.",
      },
      {
        kind: "diagram",
        heading: "Prefill vs. decode — the two phases",
        anim: "prefill-decode",
      },
      {
        kind: "prose",
        heading: "Prefill vs. decode — two different problems",
        body:
          "Prefill processes the entire input prompt in one forward pass. It's compute-bound and parallelizes beautifully — all tokens at once, standard matrix multiplies. Decode generates one token at a time. It's memory-bandwidth-bound: you're moving model weights and KV cache from HBM to compute units, using them for one token, and moving on. Decode is where LLMs are slow. Most optimizations (continuous batching, speculative decoding, quantization) target decode.",
      },
      {
        kind: "prose",
        heading: "Continuous batching",
        body:
          "Classic batching: wait for N requests, batch them, run forward passes together until the longest finishes. Wasteful — shorter requests sit idle. Continuous (a.k.a. iteration-level) batching, introduced by Orca and popularized by vLLM: at each decode step, admit new requests, evict finished ones. Utilization jumps from ~30% to ~90%. This is why vLLM became the default serving stack.",
      },
      {
        kind: "prose",
        heading: "Quantization, distillation, speculative decoding",
        body:
          "Three main levers for faster inference. Quantization: store weights at lower precision (int8, int4) — 2-4× memory savings with small quality loss. Distillation: train a smaller model to mimic a larger one — much cheaper per query but one-time training cost. Speculative decoding: use a small draft model to propose several tokens; verify with the large model in parallel. Best of both worlds: large-model quality with draft-model speed on easy tokens. Used in production by Anthropic, OpenAI, Google.",
      },
      {
        kind: "paper-walk",
        heading: "Paper walkthrough — Pope et al. key insights",
        items: [
          {
            claim: "Inference is memory-bandwidth-bound, not compute-bound.",
            note: "Modern accelerators have far more FLOPs than bandwidth. For decode (batch=1, one token), you're constantly moving weights and barely using the compute. Batching and quantization target this directly.",
          },
          {
            claim: "Parallelism strategies differ for prefill and decode.",
            note: "Prefill benefits from tensor parallelism (split matmuls across devices). Decode with tight latency benefits more from pipeline parallelism or single-device hosting. Mixed strategies are common.",
          },
          {
            claim: "The arithmetic intensity ceiling.",
            note: "There's a roofline analysis showing that for very large models at batch 1, you cannot exceed a certain tokens/sec no matter how many devices you add — you're bandwidth-limited. This is the argument for smaller, distilled, quantized serving models.",
          },
          {
            claim: "MQA and GQA (multi-query / grouped-query attention).",
            note: "Share KV across attention heads. Cuts KV cache by 4-8× with minimal quality loss. Used in Llama 2/3, Mistral, most modern models. The single biggest architectural change for serving since the original transformer.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Expect: 'You need to serve Llama 70B at 50ms first-token latency and 30 tokens/sec throughput. How?' Answer structure: (1) quantize to int8 or int4 to fit on fewer GPUs; (2) tensor parallelism across 2-4 GPUs to meet latency; (3) continuous batching (vLLM/TGI) for throughput; (4) consider speculative decoding if latency is tight; (5) if you can't hit numbers, discuss distillation to a smaller model. Show you know the levers and when each applies.",
      },
      {
        kind: "concepts",
        heading: "Serving vocabulary",
        items: [
          { term: "Prefill", def: "Processing the input prompt. Compute-bound, parallelizable." },
          { term: "Decode", def: "Generating output tokens one at a time. Memory-bandwidth-bound." },
          { term: "Time to first token (TTFT)", def: "Latency from request arrival to first generated token. Dominated by prefill." },
          { term: "Inter-token latency (ITL)", def: "Time between successive generated tokens. Dominated by decode speed." },
          { term: "Continuous batching", def: "Iteration-level batching. Admit/evict requests per decode step. 2-3× throughput vs. static batching." },
          { term: "Tensor parallelism", def: "Split each matmul across multiple devices. Good for latency; needs fast interconnect (NVLink)." },
          { term: "Pipeline parallelism", def: "Different layers on different devices. Good for throughput; needs careful scheduling." },
          { term: "Quantization", def: "Lower precision weights (int8, int4, fp8). Memory/bandwidth win, small quality loss." },
          { term: "Speculative decoding", def: "Draft model proposes tokens; large model verifies in parallel. Latency win without quality loss." },
          { term: "Multi-query attention (MQA) / Grouped-query (GQA)", def: "Share KV across heads. Cuts cache size 4-8×." },
          { term: "PagedAttention", def: "vLLM's memory management trick — treats KV cache like OS virtual memory pages. Eliminates fragmentation." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Your inference workload has requests with very different prompt lengths (100 tokens to 10k tokens). Static batching gives terrible utilization. Why?",
            choices: [
              "Because batching doesn't work with varying lengths at all.",
              "Because the batch finishes only when the longest sequence finishes; short sequences wait idle inside a padded batch.",
              "Because static batching doesn't support causal attention.",
            ],
            answer: 1,
            explain:
              "Padding to the longest and waiting for the longest to finish = huge idle time on short requests. Continuous batching lets finished requests leave and new ones enter at every decode step, reclaiming that idle compute.",
          },
          {
            q: "A colleague wants to deploy Llama 70B on a single A100 (80GB). Why won't this work in fp16, and what's the fix?",
            choices: [
              "70B params × 2 bytes = 140GB weights alone — exceeds 80GB. Fix: quantize to int8 (70GB) or int4 (~35GB) to fit, or shard across 2 GPUs.",
              "The A100 is too slow; use an H100.",
              "You need more RAM.",
            ],
            answer: 0,
            explain:
              "Parameter count × bytes/param = memory for weights alone (before KV cache, activations, CUDA overhead). Int8 halves this; int4 quarters it. Quantization is the standard first lever for fitting big models on smaller hardware.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // XIII. PROMPT ENGINEERING
  // ==========================================================================
  {
    id: "prompting",
    num: "XIII",
    stage: "Agents",
    name: "Prompt Engineering",
    tagline: "Lilian Weng's canon — the patterns that reliably work.",
    readTime: "18 min",
    paper: {
      title: "Lilian Weng's blog — prompt engineering, agents, LLM-powered autonomous agents",
      authors: "Lilian Weng",
      venue: "lilianweng.github.io",
    },
    sections: [
      {
        kind: "prose",
        heading: "Why prompt engineering survives",
        body:
          "Early on, many predicted prompt engineering would become obsolete as models improved. Didn't happen. The reason: models got better at doing what you tell them precisely, which means the specificity of instructions matters more, not less. Modern prompt engineering is less 'magic phrases' and more structured communication of task, context, and constraints.",
      },
      {
        kind: "prose",
        heading: "The core techniques (ranked by impact)",
        body:
          "Few-shot prompting: show N examples of input→output. Works because LLMs do in-context learning — they pattern-match off examples. Chain-of-thought (CoT): ask the model to reason step by step before answering. Dramatically improves arithmetic and logic. Self-consistency: sample multiple CoT responses, take majority vote. Trades compute for accuracy. Structured output: force JSON or specific schemas via constrained decoding or tools. ReAct: interleave reasoning with actions (tool calls). The foundation for agents.",
      },
      {
        kind: "diagram",
        heading: "The ReAct loop (reasoning + acting)",
        anim: "react",
      },
      {
        kind: "prose",
        heading: "What doesn't work (and why people think it does)",
        body:
          "Pleas to the model ('please be careful,' 'this is important'): mostly placebo, model-dependent, and often a sign of an underspecified task. Role-playing prompts ('you are an expert cardiologist'): marginal effect in modern models; helped GPT-3.5 more than GPT-4. Threatening the model: empirically unreliable; works sometimes on older models. Extremely long system prompts: diminishing returns past ~500 tokens; the model weights attention across the context.",
      },
      {
        kind: "paper-walk",
        heading: "Walkthrough — Lilian Weng's key frameworks",
        items: [
          {
            claim: "Prompt = instruction + context + input + output format.",
            note: "Separating these four concerns makes prompts debuggable. If the model fails, you can identify which component is underspecified.",
          },
          {
            claim: "Chain-of-thought is conditional on scale.",
            note: "Wei et al. showed CoT helps big models but doesn't help (or hurts) small models. Below ~100B, the reasoning chains the model produces are often incoherent, leading to worse answers than direct prediction.",
          },
          {
            claim: "Tree-of-thoughts: explore multiple reasoning paths.",
            note: "Extension of CoT where the model generates multiple next-thoughts, evaluates them, and explores the best. Effective on puzzle-like problems (24 game, crosswords). Expensive — inference cost multiplied by branching factor.",
          },
          {
            claim: "Structured output via constrained decoding.",
            note: "Guidance, jsonformer, outlines libraries constrain next-token sampling to only valid JSON. Better than asking nicely and parsing — provably never produces invalid output.",
          },
          {
            claim: "Prompt injection is an unsolved security problem.",
            note: "Any user-controlled text in a prompt is an attack surface. Current mitigations (instruction hierarchy, input sanitization, output filters) are partial. Lilian Weng's adversarial attacks post surveys the landscape.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Don't be dismissive of prompt engineering ('just tricks'). Principal-level framing: prompt engineering is API design for LLMs. Structured prompts, versioned like code, tested against regression datasets, constrained for output validity — this is the production discipline. If you describe it that way, you're signaling the right maturity.",
      },
      {
        kind: "concepts",
        heading: "Core vocabulary",
        items: [
          { term: "Zero-shot", def: "Prompt the model with instructions only, no examples. Works for well-understood tasks." },
          { term: "Few-shot", def: "Include N examples in the prompt. Sets the pattern and format." },
          { term: "Chain-of-thought (CoT)", def: "Ask the model to reason step-by-step. 'Let's think step by step' is the classic trigger." },
          { term: "Self-consistency", def: "Sample multiple CoT responses, vote on answer. Trades compute for accuracy." },
          { term: "Tree-of-thoughts (ToT)", def: "Branch-and-evaluate reasoning. Expensive but effective on search-like problems." },
          { term: "ReAct", def: "Reasoning + Acting. Interleave thoughts with tool calls. Foundation for agents." },
          { term: "Constrained decoding", def: "Force output to match a grammar (JSON, regex). Better than asking and parsing." },
          { term: "Prompt injection", def: "Malicious instructions embedded in user input override system prompt. Hard to fully defend against." },
          { term: "In-context learning (ICL)", def: "Model learns from examples in the prompt without weight updates. Emergent behavior at scale." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "Your pipeline parses JSON output from an LLM and fails 2% of the time due to malformed output. What's the right fix?",
            choices: [
              "Add 'please respond only in valid JSON' to the prompt more forcefully.",
              "Use constrained decoding (e.g., outlines, guidance, or the API's JSON mode) to make malformed output impossible at the decoding layer.",
              "Retry on parse failures up to 5 times.",
            ],
            answer: 1,
            explain:
              "Constrained decoding enforces grammar at generation time — invalid tokens have zero probability. 'Please' and retries are patches, not fixes, and add latency and cost.",
          },
          {
            q: "Chain-of-thought improves accuracy on math problems for GPT-4 but not for a 1B-parameter model. Why?",
            choices: [
              "CoT requires specific pretraining data that small models lack.",
              "Small models generate incoherent reasoning chains, which mislead their own final answer. The reasoning capability emerges at scale.",
              "CoT only works with few-shot prompting.",
            ],
            answer: 1,
            explain:
              "Wei et al. 2022 showed CoT is an emergent capability. Below ~100B parameters, the 'reasoning' the model produces is often wrong in ways that derail the final answer. Direct prompting beats CoT for small models.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // XIV. AGENTIC AI
  // ==========================================================================
  {
    id: "agents",
    num: "XIV",
    stage: "Agents",
    name: "Agentic AI",
    tagline: "Beyond prompts. Systems that plan, act, and recover.",
    readTime: "25 min",
    paper: {
      title: "LLM Powered Autonomous Agents (Lilian Weng, 2023) + ReAct, Reflexion, Voyager literature",
      authors: "Lilian Weng + community",
      venue: "lilianweng.github.io",
    },
    sections: [
      {
        kind: "prose",
        heading: "What makes something an 'agent'",
        body:
          "An agent is an LLM that can take actions in the world (via tools), observe outcomes, and loop. The definition is elastic — some call a single tool call an agent; others require multi-step planning with memory. A useful working definition: a system where the control flow is determined by the LLM, not hard-coded. If you can draw the possible execution paths in advance, it's a workflow. If the LLM decides at each step what happens next, it's an agent.",
      },
      {
        kind: "prose",
        heading: "Lilian Weng's canonical agent components",
        body:
          "Four parts: (1) Planning — decompose goal into sub-tasks, often CoT or ToT. (2) Memory — short-term (context window) and long-term (vector stores, episodic logs). (3) Tools — function-calling APIs the agent can invoke: web search, code execution, file access. (4) Action loop — ReAct-style: think, act, observe, repeat until done or stuck. Every modern agent framework (LangGraph, AutoGPT, CrewAI, OpenAI Agents SDK) is some variation on this.",
      },
      {
        kind: "diagram",
        heading: "The agent loop in motion",
        anim: "agent-loop",
      },
      {
        kind: "prose",
        heading: "The hard problems",
        body:
          "Agents work surprisingly well on happy paths and fail spectacularly off them. Core challenges: (1) Error recovery — what happens when a tool fails, returns garbage, or gets stuck in a loop? (2) Long-horizon planning — as step count grows, error probability compounds. A 95%-reliable step over 20 steps is 36% reliable end-to-end. (3) Memory management — context fills, old tool outputs bloat, summarization loses fidelity. (4) Evaluation — how do you test an open-ended agent? (5) Cost — each 'thought' is a forward pass. Multi-step agents get expensive fast.",
      },
      {
        kind: "prose",
        heading: "The spectrum from workflow to autonomous agent",
        body:
          "Most production 'agentic' systems are actually constrained workflows with LLM steps. You specify the DAG; the LLM fills in specific decisions. More autonomy = more failure modes = more testing burden. The pragmatic answer is usually: maximize structure, minimize autonomy, give the LLM freedom only where its judgment is necessary. Fully autonomous agents (AutoGPT-style) are research projects, not production systems — for now.",
      },
      {
        kind: "paper-walk",
        heading: "Walkthrough — the key papers",
        items: [
          {
            claim: "ReAct (Yao et al. 2022): interleave reasoning and action.",
            note: "The foundational pattern. Each step has a Thought (reasoning), Action (tool call), Observation (result). The Thought lets the model reason about what to do next given observations so far.",
          },
          {
            claim: "Reflexion (Shinn et al. 2023): self-critique and retry.",
            note: "After a trajectory, the model writes a natural-language critique of its own performance, stored in memory, and uses it to guide the next attempt. Improves success on tasks the agent initially fails.",
          },
          {
            claim: "Voyager (Wang et al. 2023): lifelong learning in Minecraft.",
            note: "The agent builds a growing skill library — functions it has successfully written for prior goals. Retrieves relevant skills for new goals. Shows that accumulated tool/skill libraries compound.",
          },
          {
            claim: "Toolformer (Schick et al. 2023): teach the model when to call tools.",
            note: "Rather than always using tools, Toolformer fine-tunes on when a tool call helps. Relevant for cost/latency — most queries don't need tools.",
          },
          {
            claim: "Tree search agents.",
            note: "Language Agent Tree Search, AlphaCode-style approaches use MCTS over action sequences. Much more expensive, better on hard planning problems.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "Expect to be asked: 'design an agent for X.' The principal answer: (1) frame as workflow first, identify where LLM judgment is necessary; (2) specify tool interface explicitly (schemas, error handling); (3) decide memory strategy (buffer, summarization, retrieval); (4) define termination conditions and max-steps; (5) build evaluation harness with golden trajectories. If you launch into 'we'll use LangGraph' without the design thinking, you've shown tool familiarity but not system thinking.",
      },
      {
        kind: "concepts",
        heading: "Agentic vocabulary",
        items: [
          { term: "Tool use / function calling", def: "LLM outputs structured calls to external APIs. OpenAI's function calling, Anthropic's tool use." },
          { term: "ReAct", def: "Thought-Action-Observation loop. Foundational agent pattern." },
          { term: "Planner-Executor", def: "Two-LLM pattern: one plans (decomposes goal), another executes steps. Separates concerns." },
          { term: "Reflexion", def: "Self-critique after failure, retry with critique in memory." },
          { term: "Episodic memory", def: "Agent remembers past trajectories/experiences. Usually in a vector store." },
          { term: "Working memory", def: "Short-term state within a single trajectory. Lives in context window or scratchpad." },
          { term: "Skill library", def: "Accumulated successful functions/prompts the agent can reuse. Voyager-style." },
          { term: "Guardrails", def: "Safety constraints — input validation, output filtering, tool allowlists. Critical for production." },
          { term: "Human-in-the-loop", def: "Agent pauses for human approval before high-stakes actions. Standard for production." },
          { term: "MCP (Model Context Protocol)", def: "Anthropic's standard for connecting LLMs to tools, data sources. Industry-wide adoption 2024-2025." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "A multi-step agent fails silently in production 8% of the time — it completes but produces wrong output. What's the single most valuable addition?",
            choices: [
              "Switch to a better LLM.",
              "Add a verifier LLM that checks the final output against the original goal and flags failures. Log those trajectories for analysis.",
              "Add more tools.",
            ],
            answer: 1,
            explain:
              "Silent failures are the killer of production agents. A verifier step (even a separate cheap LLM call) catches them and feeds a debuggable trajectory log. Without verification, you only see failures when users complain.",
          },
          {
            q: "You're designing an agent that runs for 20+ steps. What's the biggest reliability concern?",
            choices: [
              "Running out of context window.",
              "Error compounding: a 95% success per step means ~36% overall success over 20 steps.",
              "The LLM getting bored.",
            ],
            answer: 1,
            explain:
              "Compounding error is the dominant failure mode in long agent trajectories. It's why workflow-style (pre-defined steps with LLM in small decision points) tends to beat fully autonomous agents for production use cases.",
          },
          {
            q: "When would you choose a workflow over an agent?",
            choices: [
              "When the control flow can be determined in advance and only specific decisions need LLM judgment.",
              "Always — agents are unreliable.",
              "Never — agents are more flexible.",
            ],
            answer: 0,
            explain:
              "Workflows are simpler, cheaper, more reliable, and easier to test. Reach for an agent only when the control flow genuinely can't be predetermined — open-ended research, debugging, creative tasks with branching paths.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // XV. ENTERPRISE RAG
  // ==========================================================================
  {
    id: "enterprise-rag",
    num: "XV",
    stage: "Production",
    name: "Enterprise RAG Architecture",
    tagline: "The parts no paper covers. Compliance, freshness, access control.",
    readTime: "22 min",
    sections: [
      {
        kind: "prose",
        heading: "What makes enterprise different",
        body:
          "Research RAG is: public corpus, no access control, batch indexing, clear eval metrics. Enterprise RAG is: private corpus, per-document permissions, streaming ingest, audit requirements, and evaluation that balances helpfulness against never leaking the wrong data. The research papers skip all of this. It's where principal-level engineering lives.",
      },
      {
        kind: "diagram",
        heading: "Reference enterprise RAG architecture",
        anim: "enterprise-rag",
      },
      {
        kind: "prose",
        heading: "Document ingestion — the unglamorous core",
        body:
          "Real enterprise data is messy: PDFs with tables, scanned documents, emails with threads, SharePoint sites with permissions, Confluence wikis with broken links. Ingestion pipeline stages: (1) source connectors — read from SharePoint, Google Drive, Confluence, S3, databases; (2) extraction — OCR, table extraction, layout-aware parsing (libraries like Unstructured, LlamaParse, Docling); (3) enrichment — extract metadata, entities, summaries; (4) chunking; (5) embedding; (6) indexing with permissions metadata. Each stage has failure modes. Most enterprise RAG projects fail at stage 1 or 2 long before the model matters.",
      },
      {
        kind: "prose",
        heading: "Access control — per-query filtering",
        body:
          "The killer requirement. A user queries 'what's our Q3 revenue forecast?' — the RAG system must retrieve only documents they're authorized to see. Two approaches: (1) Pre-filter — fetch user's permission set, filter the vector index before ANN search (most vector DBs support metadata filtering). (2) Post-filter — retrieve broadly, filter results by ACL afterward. Pre-filter is cheaper and safer; post-filter is a data leak waiting to happen if you forget a filter stage. Principle: retrieval must never return a document the user can't see, period. Verify this in eval.",
      },
      {
        kind: "prose",
        heading: "Freshness — how new documents show up",
        body:
          "Two patterns. Scheduled re-indexing: run the ingestion pipeline nightly; swap in new index atomically. Simple but stale. Streaming ingest: documents arrive via webhook or CDC (change data capture), get processed through a streaming pipeline (Kafka + consumers), indexed incrementally. Harder but gives near-real-time freshness. Choice depends on SLA. Banking compliance docs: nightly is fine. Customer support knowledge base: streaming.",
      },
      {
        kind: "prose",
        heading: "Evaluation in production",
        body:
          "Three eval layers. (1) Retrieval quality: given a golden query, does the right document rank in top-k? Classical IR metrics (recall@k). (2) End-to-end quality: given a golden Q&A pair, does the system produce the right answer? LLM-as-judge with RAGAS or similar. (3) Production metrics: thumbs up/down rate, abandonment rate, time-to-answer, citation click-through. No single metric is enough. Enterprise teams build eval harnesses as first-class infrastructure, not an afterthought.",
      },
      {
        kind: "prose",
        heading: "Observability and the failure taxonomy",
        body:
          "What goes wrong in production RAG, roughly in order of frequency: (1) retrieval returns nothing relevant — the document exists but isn't findable by this query; (2) retrieval returns semantically similar but factually wrong passages; (3) generation hallucinates despite good retrieval; (4) access control leak — user sees a document they shouldn't; (5) stale data — indexed version is out of date. Good observability logs queries, retrieved passages (with scores), generated answer, and user feedback. This is your debug loop.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When asked 'design a RAG system for internal enterprise search,' the senior answer covers retrieval and generation. The principal answer covers: ingestion pipeline design, ACL propagation (how permissions from source systems survive embedding and retrieval), re-indexing cadence and atomicity, eval harness, observability, graceful degradation when retrieval fails, and cost modeling (embedding costs, vector DB costs, LLM costs per query × query volume). Hit four of those seven unprompted and you're at bar.",
      },
      {
        kind: "concepts",
        heading: "Enterprise vocabulary",
        items: [
          { term: "ACL propagation", def: "Carrying access control metadata from source documents through to the vector index for per-query filtering." },
          { term: "CDC (Change Data Capture)", def: "Pattern for detecting and streaming changes from source systems. Enables near-real-time index updates." },
          { term: "Ingestion pipeline", def: "The series of stages that get raw documents into the vector index. Where most enterprise RAG projects fail." },
          { term: "Document registry", def: "Service tracking each document's source, version, permissions, and indexing state. Essential for debugging." },
          { term: "Golden dataset", def: "Curated question-answer pairs for regression testing. The foundation of RAG eval." },
          { term: "Retrieval audit log", def: "Record of what passages were retrieved for each query. Required for compliance in regulated industries." },
          { term: "Tenant isolation", def: "Multi-customer systems where one tenant's data must never leak to another. Usually implemented via per-tenant indexes or strict metadata filtering." },
          { term: "Semantic cache", def: "Cache LLM responses keyed by embedding similarity, not exact query match. Cuts cost on repeated/similar queries." },
          { term: "Guarded generation", def: "Post-generation checks (citation verification, toxicity, PII scanning) before returning to user." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "You're building RAG over a corpus where documents have per-user permissions. A user queries; your system retrieves 10 passages; you filter 3 they're not authorized to see; you pass the remaining 7 to the LLM. What's the risk?",
            choices: [
              "No risk — the filtered passages never reach the user.",
              "The retrieval itself may have been biased by the unauthorized content (if using late filtering), and if you ever log retrieved passages you may create a parallel unauthorized index in logs.",
              "The LLM may refuse to answer.",
            ],
            answer: 1,
            explain:
              "Post-filtering is a common pattern but has subtle failures. Audit logs, retry paths, debug endpoints, and LLM prompts have all been sources of leaks where 'filtered' content escaped. Pre-filter at the vector DB is the safe default.",
          },
          {
            q: "Your RAG system has 94% retrieval recall@10 in offline eval but users report 'the answer isn't in the system' on 30% of queries. What's the most likely explanation?",
            choices: [
              "The LLM is failing to use retrieved context.",
              "Your golden eval dataset doesn't match the distribution of real user queries. Users ask differently than your test set predicted.",
              "The vector DB is broken.",
            ],
            answer: 1,
            explain:
              "The 94%/30% gap almost always means the eval dataset is systematically different from production queries. Fix: sample real production queries, grade them, and expand the eval set. RAG eval is an ongoing distribution-matching exercise.",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // XVI. PRODUCTION ML
  // ==========================================================================
  {
    id: "production-ml",
    num: "XVI",
    stage: "Production",
    name: "Production ML: Monitoring & Drift",
    tagline: "Deploying is 5% of the job. Running for two years is the other 95%.",
    readTime: "18 min",
    sections: [
      {
        kind: "prose",
        heading: "What actually changes after deployment",
        body:
          "Day 1: your model has the accuracy you measured offline. Day 30: input distributions have shifted a little. Day 90: a source system changed its feature format silently. Day 180: a competitor changed behavior, users' queries changed. Day 365: the model is probably worse than a 6-month-old retrain. None of this is visible unless you measure it. Monitoring is the difference between a model that ages gracefully and one that silently decays.",
      },
      {
        kind: "diagram",
        heading: "What to monitor (and where it comes from)",
        anim: "monitoring",
      },
      {
        kind: "prose",
        heading: "Four layers of monitoring",
        body:
          "(1) Operational: latency, throughput, error rate, CPU/GPU utilization. Same as any service. (2) Data drift: are the inputs changing distribution? Detect via KS test, PSI (Population Stability Index), or embedding-space distance. (3) Concept drift: is the relationship between inputs and outputs changing? Harder — requires ground truth or proxy labels, which you often don't have. (4) Business metrics: the things you actually care about — conversion, revenue, support ticket resolution time. Tie these to model outputs so you catch regressions the ML metrics miss.",
      },
      {
        kind: "prose",
        heading: "The ground truth problem",
        body:
          "Most production ML systems don't know when they're wrong. Fraud detection: you learn you were wrong only when a user disputes a charge — weeks later. Medical diagnosis: maybe never. Search ranking: inferred from clicks, which are biased. This means most drift detection is indirect: you're detecting changes in input distribution and assuming model quality follows. Sometimes it doesn't (the inputs look fine but the relationship changed). Delayed-feedback systems need special care.",
      },
      {
        kind: "prose",
        heading: "Continual learning — the options",
        body:
          "Retraining strategies: (a) Scheduled retraining — weekly/monthly, simple, usually safe. (b) Triggered retraining — kick off when drift metric exceeds threshold. More responsive, more operational complexity. (c) Online learning — update weights on each example. Rare in production; unstable, hard to roll back. (d) Periodic fine-tuning — keep base frozen, fine-tune a small adapter on recent data. Good middle ground for LLMs. Whichever you pick: shadow-deploy before promoting, keep N previous versions available for rollback, version the training data alongside the model.",
      },
      {
        kind: "callout",
        heading: "Interview angle",
        body:
          "When asked 'how do you monitor a model in production,' do NOT say 'we track accuracy.' Go: operational metrics first, then distribution monitoring (with specific techniques — PSI, KL-div, embedding drift), then concept drift with its ground-truth caveats, then business metrics as the final arbiter. Add: eval harness that runs on a golden set against each candidate model, shadow deployments before promotion. That's a principal-level answer.",
      },
      {
        kind: "concepts",
        heading: "Vocabulary",
        items: [
          { term: "Data drift", def: "Input distribution P(X) shifts over time. Detectable via statistical tests or embedding distances." },
          { term: "Concept drift", def: "The relationship P(Y|X) shifts. Same inputs should now produce different outputs. Requires ground truth or proxy." },
          { term: "PSI (Population Stability Index)", def: "Common drift metric. Compares distributions in buckets. >0.2 usually means 'investigate.'" },
          { term: "KS test", def: "Kolmogorov-Smirnov. Nonparametric test for distributional difference between two samples." },
          { term: "Shadow deployment", def: "New model scores live traffic but its outputs aren't used. Gold standard for pre-deployment validation." },
          { term: "Canary deployment", def: "Route X% of traffic to new model, compare metrics, ramp up or roll back." },
          { term: "A/B test", def: "Split traffic between two model versions, measure business metric difference statistically." },
          { term: "Feedback delay", def: "Time between prediction and observing ground truth. Long delays make continual learning hard." },
          { term: "Model registry", def: "Service tracking trained model artifacts, lineage, performance metrics. Required for auditable ML." },
          { term: "Experiment tracking", def: "MLflow, Weights & Biases — log hyperparameters, metrics, artifacts per training run." },
        ],
      },
      {
        kind: "quiz",
        heading: "Check yourself",
        items: [
          {
            q: "A credit fraud model's input distribution (PSI) looks stable but fraud rate in production has doubled over a month. What's most likely happening?",
            choices: [
              "Data drift",
              "Concept drift — the relationship between features and fraud has changed (new fraud patterns), even though the features themselves look normal.",
              "Operational issue",
            ],
            answer: 1,
            explain:
              "Classic concept drift. Features P(X) are stable, but P(Y|X) has shifted — new fraud patterns look like normal transactions to the old model. PSI doesn't catch this; you need ground truth monitoring, which in fraud is unfortunately delayed.",
          },
          {
            q: "You want to deploy a new model. Which of these is the safest validation sequence?",
            choices: [
              "Train → offline eval → production (100%).",
              "Train → offline eval → shadow deploy (production traffic, outputs discarded, compared to prod) → canary (5% → 50% → 100%).",
              "Train → A/B test directly against prod.",
            ],
            answer: 1,
            explain:
              "Shadow + canary is the standard safe pattern. Shadow catches crashes and distribution mismatches without user exposure; canary catches performance regressions with limited blast radius. A/B tests are valid but don't catch catastrophic failures quickly enough.",
          },
        ],
      },
    ],
  },
];
