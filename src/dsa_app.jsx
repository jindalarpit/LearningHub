import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// DATA: PATTERNS + PROBLEMS (with company tags + follow-ups)
// ============================================================================
// Tags: G = Google frequent, M = Microsoft frequent, G* / M* = Principal/Staff-level
// Followups: the typical 2nd-order question interviewers chain on top

const PATTERNS = [
  {
    id: "two-pointers",
    num: "I",
    name: "Two Pointers",
    tagline: "Two indices, one array, linear time.",
    when: "Sorted arrays, palindromes, pair-sum, in-place modification.",
    why: "Reduces nested O(n²) scans to O(n) by letting one pointer skip work the other already did.",
    complexity: { time: "O(n)", space: "O(1)" },
    problems: [
      { name: "Two Sum II (sorted)", diff: "Easy", lc: 167, tags: ["G", "M"] },
      { name: "Valid Palindrome", diff: "Easy", lc: 125, tags: ["M"] },
      { name: "3Sum", diff: "Medium", lc: 15, tags: ["G", "M"], followup: "Now return count of unique triplets, not the triplets themselves. Then extend to 4Sum without O(n⁴)." },
      { name: "Container With Most Water", diff: "Medium", lc: 11, tags: ["G"], followup: "Prove why moving the shorter wall is always correct — interviewer wants the invariant." },
      { name: "Remove Duplicates from Sorted Array", diff: "Easy", lc: 26, tags: ["M"] },
      { name: "Trapping Rain Water", diff: "Hard", lc: 42, tags: ["G", "M"], followup: "Trapping Rain Water II (2D matrix) — now it's heap + BFS, not two pointers." },
      { name: "Sort Colors (Dutch Flag)", diff: "Medium", lc: 75, tags: ["M"] },
      { name: "4Sum", diff: "Medium", lc: 18, tags: ["G"] },
    ],
    template: `// Template: converging two pointers on sorted array
int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return new int[]{left, right};
    else if (sum < target) left++;
    else right--;
}`,
  },
  {
    id: "sliding-window",
    num: "II",
    name: "Sliding Window",
    tagline: "Expand right, contract left, track state.",
    when: "Contiguous subarray/substring problems — max/min length, sum, distinct count.",
    why: "Instead of recomputing every window from scratch, maintain incremental state as the window moves.",
    complexity: { time: "O(n)", space: "O(k)" },
    problems: [
      { name: "Longest Substring Without Repeating Characters", diff: "Medium", lc: 3, tags: ["G", "M"], followup: "Now limit to k distinct characters (LC 340). Then unlimited distinct but at most k replacements." },
      { name: "Minimum Window Substring", diff: "Hard", lc: 76, tags: ["G", "M*"], followup: "What if the pattern has duplicates? What if the text is a stream?" },
      { name: "Longest Repeating Character Replacement", diff: "Medium", lc: 424, tags: ["G"] },
      { name: "Permutation in String", diff: "Medium", lc: 567, tags: ["M"] },
      { name: "Find All Anagrams in a String", diff: "Medium", lc: 438, tags: ["G", "M"] },
      { name: "Max Consecutive Ones III", diff: "Medium", lc: 1004, tags: ["G"] },
      { name: "Fruit Into Baskets", diff: "Medium", lc: 904, tags: ["G"] },
      { name: "Sliding Window Maximum", diff: "Hard", lc: 239, tags: ["G*", "M"], followup: "Monotonic deque is the trick. Now do sliding window median — requires two heaps." },
      { name: "Longest Subarray Sum ≤ K (with negatives)", diff: "Medium", lc: null, tags: ["M*"], followup: "Microsoft 2025 SSE question. Positive-only: sliding window. Negative-allowed: prefix sums + monotonic deque." },
    ],
    template: `// Template: variable-size window with hashmap state
Map<Character, Integer> count = new HashMap<>();
int left = 0, best = 0;
for (int right = 0; right < s.length(); right++) {
    count.merge(s.charAt(right), 1, Integer::sum);
    while (/* window invariant violated */) {
        count.merge(s.charAt(left), -1, Integer::sum);
        if (count.get(s.charAt(left)) == 0) count.remove(s.charAt(left));
        left++;
    }
    best = Math.max(best, right - left + 1);
}`,
  },
  {
    id: "binary-search",
    num: "III",
    name: "Binary Search",
    tagline: "Halve the search space every step.",
    when: "Sorted arrays, boundary finding, searching answer-space, peak finding.",
    why: "O(log n) vs. O(n). Real skill: recognizing non-obvious binary-searchable spaces.",
    complexity: { time: "O(log n)", space: "O(1)" },
    problems: [
      { name: "Binary Search", diff: "Easy", lc: 704, tags: ["M"] },
      { name: "Search in Rotated Sorted Array", diff: "Medium", lc: 33, tags: ["G", "M"], followup: "What if duplicates allowed (LC 81)? Worst case becomes O(n)." },
      { name: "Find First and Last Position", diff: "Medium", lc: 34, tags: ["M"] },
      { name: "Find Peak Element", diff: "Medium", lc: 162, tags: ["G"] },
      { name: "Search 2D Matrix", diff: "Medium", lc: 74, tags: ["M*"], followup: "Now matrix rows and cols sorted but not fully sorted (LC 240) — stepwise elimination, not binary search." },
      { name: "Koko Eating Bananas", diff: "Medium", lc: 875, tags: ["G", "M"] },
      { name: "Capacity to Ship Packages Within D Days", diff: "Medium", lc: 1011, tags: ["G"], followup: "Classic answer-space binary search. Now what if packages can't be split, and there are multiple ships?" },
      { name: "Median of Two Sorted Arrays", diff: "Hard", lc: 4, tags: ["G*", "M*"], followup: "O(log(min(m,n))) partition method. Interviewer will ask you to prove correctness of the partition invariant." },
      { name: "Split Array Largest Sum", diff: "Hard", lc: 410, tags: ["G*"] },
    ],
    template: `// Template: canonical binary search (lower bound)
int lo = 0, hi = nums.length;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;  // avoid overflow
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
}
return lo;  // first index >= target`,
  },
  {
    id: "bfs",
    num: "IV",
    name: "BFS (Graphs & Trees)",
    tagline: "Level-by-level traversal using a queue.",
    when: "Shortest path in unweighted graphs, level-order traversal, connected components.",
    why: "Guarantees shortest path in unweighted graphs because it explores all nodes at distance k before any at k+1.",
    complexity: { time: "O(V+E)", space: "O(V)" },
    problems: [
      { name: "Binary Tree Level Order Traversal", diff: "Medium", lc: 102, tags: ["M"] },
      { name: "Number of Islands", diff: "Medium", lc: 200, tags: ["G", "M"], followup: "Now grid is a stream (cells arrive one at a time) — use Union-Find (LC 305, Number of Islands II)." },
      { name: "Rotting Oranges", diff: "Medium", lc: 994, tags: ["G", "M"] },
      { name: "Word Ladder", diff: "Hard", lc: 127, tags: ["G*", "M"], followup: "Bidirectional BFS for huge word lists. Word Ladder II wants all paths — requires BFS + DFS." },
      { name: "Shortest Path in Binary Matrix", diff: "Medium", lc: 1091, tags: ["G"] },
      { name: "01 Matrix", diff: "Medium", lc: 542, tags: ["G", "M"], followup: "Multi-source BFS — add all 0s to queue at once. Why? Think about why single-source from each 1 is O(n²) of BFSes." },
      { name: "Open the Lock", diff: "Medium", lc: 752, tags: ["G"] },
      { name: "Clone Graph", diff: "Medium", lc: 133, tags: ["M"] },
    ],
    template: `// Template: BFS with visited set
Queue<int[]> queue = new ArrayDeque<>();
Set<String> visited = new HashSet<>();
queue.offer(new int[]{startRow, startCol, 0});  // row, col, distance
visited.add(startRow + "," + startCol);
int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
while (!queue.isEmpty()) {
    int[] cur = queue.poll();
    if (isTarget(cur)) return cur[2];
    for (int[] d : dirs) {
        int nr = cur[0]+d[0], nc = cur[1]+d[1];
        String key = nr + "," + nc;
        if (inBounds(nr,nc) && !visited.contains(key)) {
            visited.add(key);
            queue.offer(new int[]{nr, nc, cur[2]+1});
        }
    }
}`,
  },
  {
    id: "dfs",
    num: "V",
    name: "DFS & Backtracking",
    tagline: "Recurse deep, undo on return.",
    when: "Tree traversal, permutations/combinations/subsets, path existence, island counting.",
    why: "Exhaustive exploration with O(depth) memory. Backtracking prunes dead branches early.",
    complexity: { time: "O(b^d) worst case", space: "O(d)" },
    problems: [
      { name: "Number of Islands (DFS)", diff: "Medium", lc: 200, tags: ["G", "M"] },
      { name: "Subsets / Subsets II", diff: "Medium", lc: 78, tags: ["M"] },
      { name: "Permutations", diff: "Medium", lc: 46, tags: ["M"] },
      { name: "Combination Sum", diff: "Medium", lc: 39, tags: ["G", "M"], followup: "Combination Sum II (each number used once). Then Combination Sum IV (counting, not listing — DP problem in disguise)." },
      { name: "Word Search", diff: "Medium", lc: 79, tags: ["M"], followup: "Word Search II with N words — Trie + DFS. Google loves this combination." },
      { name: "N-Queens", diff: "Hard", lc: 51, tags: ["G*"] },
      { name: "Letter Combinations of a Phone Number", diff: "Medium", lc: 17, tags: ["G", "M"] },
      { name: "Palindrome Partitioning", diff: "Medium", lc: 131, tags: ["G"] },
      { name: "Restore IP Addresses", diff: "Medium", lc: 93, tags: ["M"] },
    ],
    template: `// Template: backtracking
void backtrack(List<Integer> path, int start, int[] nums) {
    result.add(new ArrayList<>(path));  // snapshot current state
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);           // choose
        backtrack(path, i + 1, nums); // explore
        path.remove(path.size() - 1); // un-choose (backtrack)
    }
}`,
  },
  {
    id: "heap",
    num: "VI",
    name: "Heap / Priority Queue",
    tagline: "Keep the top-k in O(log n).",
    when: "Top-k problems, k-way merge, scheduling, median finding.",
    why: "A heap maintains min/max in O(log n) insert, O(1) peek — ideal for streaming selection.",
    complexity: { time: "O(n log k)", space: "O(k)" },
    problems: [
      { name: "Kth Largest Element in an Array", diff: "Medium", lc: 215, tags: ["G", "M"], followup: "Interviewer: 'Solve in O(n) average.' Answer: Quickselect. Know both." },
      { name: "Top K Frequent Elements", diff: "Medium", lc: 347, tags: ["G", "M"], followup: "Now k is very large relative to n — sort by frequency. Now input is a stream — maintain heap + hashmap pointers." },
      { name: "Find Median from Data Stream", diff: "Hard", lc: 295, tags: ["G*", "M*"], followup: "Two heaps (max-heap of lower half, min-heap of upper half). Now add sliding window constraint → LC 480." },
      { name: "Merge k Sorted Lists", diff: "Hard", lc: 23, tags: ["G", "M"] },
      { name: "K Closest Points to Origin", diff: "Medium", lc: 973, tags: ["G", "M"] },
      { name: "Task Scheduler", diff: "Medium", lc: 621, tags: ["M"], followup: "Now tasks have dependencies — becomes topological sort with priorities." },
      { name: "Reorganize String", diff: "Medium", lc: 767, tags: ["G"] },
      { name: "Meeting Rooms II (heap variant)", diff: "Medium", lc: 253, tags: ["G", "M"] },
    ],
    template: `// Template: min-heap for top-k largest
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int n : nums) {
    minHeap.offer(n);
    if (minHeap.size() > k) minHeap.poll();  // evict smallest
}
return minHeap.peek();  // kth largest`,
  },
  {
    id: "dp-1d",
    num: "VII",
    name: "Dynamic Programming (1D)",
    tagline: "Optimal substructure, one-dimensional state.",
    when: "Sequence problems with overlapping subproblems.",
    why: "Trades O(2^n) recursion for O(n) by caching. State compression to O(1) often possible.",
    complexity: { time: "O(n)", space: "O(n) or O(1)" },
    problems: [
      { name: "Climbing Stairs", diff: "Easy", lc: 70, tags: ["M"] },
      { name: "House Robber", diff: "Medium", lc: 198, tags: ["M"] },
      { name: "House Robber II (circular)", diff: "Medium", lc: 213, tags: ["G"] },
      { name: "Coin Change", diff: "Medium", lc: 322, tags: ["G", "M"], followup: "Coin Change II (count combinations, not min count). Then: coins are unlimited but with fees per use." },
      { name: "Longest Increasing Subsequence", diff: "Medium", lc: 300, tags: ["G*", "M"], followup: "Google 2025: 'Find LIS with at most 1 swap allowed.' Track state: (i, used_swap_yes/no)." },
      { name: "Word Break", diff: "Medium", lc: 139, tags: ["G", "M"] },
      { name: "Decode Ways", diff: "Medium", lc: 91, tags: ["M"] },
      { name: "Maximum Subarray (Kadane)", diff: "Medium", lc: 53, tags: ["G", "M"], followup: "Circular max subarray (LC 918). Max subarray with at most k deletions." },
      { name: "Jump Game / Jump Game II", diff: "Medium", lc: 55, tags: ["G"] },
    ],
    template: `// Template: bottom-up 1D DP (house robber)
int prev2 = 0, prev1 = 0;
for (int n : nums) {
    int cur = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = cur;
}
return prev1;  // O(1) space`,
  },
  {
    id: "dp-2d",
    num: "VIII",
    name: "Dynamic Programming (2D)",
    tagline: "State is a matrix — grid DP, two sequences, intervals.",
    when: "Grid paths, two-string problems (LCS, edit distance), interval DP, knapsack.",
    why: "Many problems have state (i, j) — position in two sequences or coordinates in a grid.",
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    problems: [
      { name: "Unique Paths", diff: "Medium", lc: 62, tags: ["M"] },
      { name: "Longest Common Subsequence", diff: "Medium", lc: 1143, tags: ["G", "M"] },
      { name: "Edit Distance", diff: "Hard", lc: 72, tags: ["G*", "M"], followup: "Can you do it in O(min(m,n)) space? Yes — only need 2 rows." },
      { name: "0/1 Knapsack", diff: "Medium", lc: null, tags: ["G", "M"] },
      { name: "Longest Palindromic Subsequence", diff: "Medium", lc: 516, tags: ["G"] },
      { name: "Distinct Subsequences", diff: "Hard", lc: 115, tags: ["G*"] },
      { name: "Interleaving String", diff: "Medium", lc: 97, tags: ["M"] },
      { name: "Maximal Rectangle in Binary Matrix", diff: "Hard", lc: 85, tags: ["G*"], followup: "Google 2025 live question. Reduce each row to histogram → 'Largest Rectangle in Histogram' (monotonic stack)." },
      { name: "Regular Expression Matching", diff: "Hard", lc: 10, tags: ["G*"] },
    ],
    template: `// Template: 2D DP (edit distance)
int[][] dp = new int[m+1][n+1];
for (int i = 0; i <= m; i++) dp[i][0] = i;
for (int j = 0; j <= n; j++) dp[0][j] = j;
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
        if (s1.charAt(i-1) == s2.charAt(j-1)) dp[i][j] = dp[i-1][j-1];
        else dp[i][j] = 1 + Math.min(dp[i-1][j-1],
                                     Math.min(dp[i-1][j], dp[i][j-1]));
    }
}
return dp[m][n];`,
  },
  {
    id: "union-find",
    num: "IX",
    name: "Union-Find",
    tagline: "Amortized near-constant merging of sets.",
    when: "Connected components, cycle detection, Kruskal's MST, dynamic connectivity.",
    why: "Path compression + union by rank give O(α(n)) per operation — effectively constant.",
    complexity: { time: "O(α(n))", space: "O(n)" },
    problems: [
      { name: "Number of Connected Components", diff: "Medium", lc: 323, tags: ["G"] },
      { name: "Graph Valid Tree", diff: "Medium", lc: 261, tags: ["G"] },
      { name: "Redundant Connection", diff: "Medium", lc: 684, tags: ["G"] },
      { name: "Accounts Merge", diff: "Medium", lc: 721, tags: ["G", "M"] },
      { name: "Number of Islands II (streaming)", diff: "Hard", lc: 305, tags: ["G*"], followup: "Why does Union-Find beat BFS here? Because the grid is a stream — static BFS would redo work each step." },
      { name: "Most Stones Removed", diff: "Medium", lc: 947, tags: ["G"] },
      { name: "Satisfiability of Equality Equations", diff: "Medium", lc: 990, tags: ["G"] },
    ],
    template: `// Template: Union-Find with path compression + union by rank
int[] parent, rank;
int find(int x) {
    if (parent[x] != x) parent[x] = find(parent[x]);  // path compression
    return parent[x];
}
boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;  // already connected
    if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    if (rank[ra] == rank[rb]) rank[ra]++;
    return true;
}`,
  },
  {
    id: "intervals",
    num: "X",
    name: "Intervals & Greedy",
    tagline: "Sort, then sweep.",
    when: "Overlapping meetings, merge intervals, minimum rooms, jump games.",
    why: "Sorting by start or end reduces O(n²) pairwise checks to O(n log n) linear sweeps.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    problems: [
      { name: "Merge Intervals", diff: "Medium", lc: 56, tags: ["G", "M"] },
      { name: "Insert Interval", diff: "Medium", lc: 57, tags: ["G", "M"] },
      { name: "Non-overlapping Intervals", diff: "Medium", lc: 435, tags: ["G"] },
      { name: "Meeting Rooms II", diff: "Medium", lc: 253, tags: ["G", "M"], followup: "Two approaches: sweep line vs. min-heap. Be ready to explain when each wins." },
      { name: "Minimum Number of Arrows", diff: "Medium", lc: 452, tags: ["G"] },
      { name: "Car Pooling", diff: "Medium", lc: 1094, tags: ["G"] },
      { name: "Gas Station", diff: "Medium", lc: 134, tags: ["M"] },
      { name: "Employee Free Time", diff: "Hard", lc: 759, tags: ["G*"], followup: "Heap-of-intervals approach lets you handle streaming schedules from k employees." },
    ],
    template: `// Template: merge intervals
Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> merged = new ArrayList<>();
for (int[] cur : intervals) {
    if (merged.isEmpty() || merged.get(merged.size()-1)[1] < cur[0]) {
        merged.add(cur);
    } else {
        merged.get(merged.size()-1)[1] =
            Math.max(merged.get(merged.size()-1)[1], cur[1]);
    }
}
return merged.toArray(new int[0][]);`,
  },
  {
    id: "trie",
    num: "XI",
    name: "Trie (Prefix Tree)",
    tagline: "Character-by-character tree for string sets.",
    when: "Autocomplete, prefix search, word games, IP routing, DNA sequences.",
    why: "O(L) lookup instead of O(n·L) scanning. Google loves this pattern — it's in every 2025 loop.",
    complexity: { time: "O(L) per op", space: "O(Σ · N · L)" },
    problems: [
      { name: "Implement Trie", diff: "Medium", lc: 208, tags: ["G", "M"] },
      { name: "Add and Search Word", diff: "Medium", lc: 211, tags: ["G"], followup: "Wildcards ('.') force DFS over trie nodes, not just lookup." },
      { name: "Word Search II", diff: "Hard", lc: 212, tags: ["G*", "M*"], followup: "Google classic: board + N words. Trie + DFS with in-place visited marking. Ask about early termination when subtree empty." },
      { name: "Longest Word in Dictionary", diff: "Medium", lc: 720, tags: ["G"] },
      { name: "Replace Words", diff: "Medium", lc: 648, tags: ["G"] },
      { name: "Design Search Autocomplete", diff: "Hard", lc: 642, tags: ["G*"], followup: "Now scale to 10M queries/sec and 100M search history. Trie per shard, top-k cached at each node." },
      { name: "Stream of Characters", diff: "Hard", lc: 1032, tags: ["G*"] },
    ],
    template: `// Template: Trie node + insert/search
class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd;
}
class Trie {
    TrieNode root = new TrieNode();
    void insert(String w) {
        TrieNode n = root;
        for (char c : w.toCharArray()) {
            int i = c - 'a';
            if (n.children[i] == null) n.children[i] = new TrieNode();
            n = n.children[i];
        }
        n.isEnd = true;
    }
    boolean search(String w) {
        TrieNode n = root;
        for (char c : w.toCharArray()) {
            n = n.children[c - 'a'];
            if (n == null) return false;
        }
        return n.isEnd;
    }
}`,
  },
  {
    id: "monostack",
    num: "XII",
    name: "Monotonic Stack / Deque",
    tagline: "Stack that maintains sorted invariant.",
    when: "Next greater/smaller element, histogram problems, sliding window max.",
    why: "Converts O(n²) pairwise comparisons to O(n) by evicting dominated elements. Appears as a follow-up on many Google problems.",
    complexity: { time: "O(n)", space: "O(n)" },
    problems: [
      { name: "Next Greater Element I / II", diff: "Easy/Medium", lc: 496, tags: ["M"] },
      { name: "Daily Temperatures", diff: "Medium", lc: 739, tags: ["G", "M"] },
      { name: "Largest Rectangle in Histogram", diff: "Hard", lc: 84, tags: ["G*", "M*"], followup: "The sentinel trick (push 0 at end) eliminates the edge case of unclosed bars. Interviewers love when you use it." },
      { name: "Maximal Rectangle", diff: "Hard", lc: 85, tags: ["G*"] },
      { name: "Sliding Window Maximum", diff: "Hard", lc: 239, tags: ["G", "M"], followup: "Deque instead of stack. Front is max, evict from back when smaller than incoming." },
      { name: "Trapping Rain Water (stack variant)", diff: "Hard", lc: 42, tags: ["G"] },
      { name: "Sum of Subarray Minimums", diff: "Medium", lc: 907, tags: ["G*"] },
    ],
    template: `// Template: monotonic decreasing stack for "next greater element"
int[] nextGreater = new int[n];
Arrays.fill(nextGreater, -1);
Deque<Integer> stack = new ArrayDeque<>();  // holds indices
for (int i = 0; i < n; i++) {
    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
        nextGreater[stack.pop()] = nums[i];
    }
    stack.push(i);
}`,
  },
  {
    id: "linked-list",
    num: "XIII",
    name: "Linked List",
    tagline: "Pointers, pointers, pointers.",
    when: "In-place list manipulation, cycle detection, LRU caches, merging.",
    why: "Microsoft loves these — tests if you can reason about pointer mutation without getting confused.",
    complexity: { time: "O(n)", space: "O(1)" },
    problems: [
      { name: "Reverse Linked List", diff: "Easy", lc: 206, tags: ["M"], followup: "Recursive vs iterative. Reverse in groups of k (LC 25)." },
      { name: "Linked List Cycle (Floyd's)", diff: "Easy", lc: 141, tags: ["M"], followup: "MS 2025: detect cycle, find length, then break it. Tortoise + hare handles all three." },
      { name: "Linked List Cycle II (find start)", diff: "Medium", lc: 142, tags: ["M"] },
      { name: "Merge Two Sorted Lists", diff: "Easy", lc: 21, tags: ["M"] },
      { name: "Merge k Sorted Lists", diff: "Hard", lc: 23, tags: ["G", "M"] },
      { name: "Reorder List", diff: "Medium", lc: 143, tags: ["M"] },
      { name: "Copy List with Random Pointer", diff: "Medium", lc: 138, tags: ["G", "M"] },
      { name: "LRU Cache", diff: "Medium", lc: 146, tags: ["G*", "M*"], followup: "Microsoft's favorite. DLL + HashMap. Then: LFU cache (LC 460) — hash to frequency-bucket DLLs." },
      { name: "LFU Cache", diff: "Hard", lc: 460, tags: ["M*"] },
    ],
    template: `// Template: reverse a linked list iteratively
ListNode prev = null, cur = head;
while (cur != null) {
    ListNode next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
}
return prev;

// Template: Floyd's cycle detection (tortoise + hare)
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;  // cycle
}
return false;`,
  },
  {
    id: "topo-sort",
    num: "XIV",
    name: "Topological Sort",
    tagline: "Order nodes respecting dependencies.",
    when: "Course prerequisites, build systems, task scheduling, dependency resolution.",
    why: "Kahn's algorithm (BFS on in-degrees) detects cycles for free. Google asks this in infrastructure-flavored teams.",
    complexity: { time: "O(V+E)", space: "O(V+E)" },
    problems: [
      { name: "Course Schedule (can finish?)", diff: "Medium", lc: 207, tags: ["G", "M"] },
      { name: "Course Schedule II (return order)", diff: "Medium", lc: 210, tags: ["G", "M"] },
      { name: "Alien Dictionary", diff: "Hard", lc: 269, tags: ["G*"], followup: "Build graph from adjacent word pairs. Detect cycle = invalid ordering. Edge case: prefix issue ('abc' before 'ab' is invalid)." },
      { name: "Minimum Height Trees", diff: "Medium", lc: 310, tags: ["G"], followup: "Trim leaves iteratively — topological-flavored peeling." },
      { name: "Parallel Courses / Task Scheduler", diff: "Medium", lc: 1136, tags: ["G"] },
      { name: "Find All Possible Recipes", diff: "Medium", lc: 2115, tags: ["G"] },
    ],
    template: `// Template: Kahn's algorithm (BFS)
int[] inDegree = new int[n];
List<List<Integer>> adj = new ArrayList<>();
// ... populate adj and inDegree ...
Queue<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.offer(i);
List<Integer> order = new ArrayList<>();
while (!q.isEmpty()) {
    int node = q.poll();
    order.add(node);
    for (int nxt : adj.get(node)) {
        if (--inDegree[nxt] == 0) q.offer(nxt);
    }
}
return order.size() == n ? order : Collections.emptyList();  // cycle check`,
  },
];

// Hot lists: top 15 per company, pointing to problems by lc number or name
const HOT_GOOGLE = [
  { name: "Longest Substring Without Repeating Characters", lc: 3, pattern: "sliding-window" },
  { name: "Word Search II", lc: 212, pattern: "trie", note: "Appears repeatedly in 2025 loops — Trie + DFS combo." },
  { name: "Trapping Rain Water", lc: 42, pattern: "two-pointers" },
  { name: "Median of Two Sorted Arrays", lc: 4, pattern: "binary-search" },
  { name: "Word Ladder", lc: 127, pattern: "bfs" },
  { name: "Alien Dictionary", lc: 269, pattern: "topo-sort" },
  { name: "Maximal Rectangle", lc: 85, pattern: "dp-2d", note: "Reported in Google 2025 onsite rounds." },
  { name: "Design Search Autocomplete", lc: 642, pattern: "trie" },
  { name: "Find Median from Data Stream", lc: 295, pattern: "heap" },
  { name: "Longest Increasing Subsequence", lc: 300, pattern: "dp-1d", note: "Often with a follow-up allowing 1 swap/modification." },
  { name: "Largest Rectangle in Histogram", lc: 84, pattern: "monostack" },
  { name: "Meeting Rooms II", lc: 253, pattern: "intervals" },
  { name: "Number of Islands II (streaming)", lc: 305, pattern: "union-find" },
  { name: "Employee Free Time", lc: 759, pattern: "intervals" },
  { name: "Sliding Window Maximum", lc: 239, pattern: "monostack" },
];

const HOT_MS = [
  { name: "LRU Cache", lc: 146, pattern: "linked-list", note: "The signature Microsoft design-meets-DS question." },
  { name: "LFU Cache", lc: 460, pattern: "linked-list" },
  { name: "Linked List Cycle (+ length + break)", lc: 141, pattern: "linked-list", note: "Multi-part follow-up in MS SDE2/SSE rounds." },
  { name: "Longest Subarray Sum ≤ K (with negatives)", lc: null, pattern: "sliding-window", note: "MS SSE 2025 live question; handle negatives via prefix sums." },
  { name: "Reverse Linked List (+ reverse in k-groups)", lc: 206, pattern: "linked-list" },
  { name: "Search in Rotated Sorted Array", lc: 33, pattern: "binary-search" },
  { name: "Minimum Window Substring", lc: 76, pattern: "sliding-window" },
  { name: "Copy List with Random Pointer", lc: 138, pattern: "linked-list" },
  { name: "Merge k Sorted Lists", lc: 23, pattern: "linked-list" },
  { name: "Serialize/Deserialize Binary Tree", lc: 297, pattern: "dfs", note: "Classic MS round. DFS with sentinels for nulls." },
  { name: "Kth Largest Element", lc: 215, pattern: "heap" },
  { name: "Word Search", lc: 79, pattern: "dfs" },
  { name: "Producer-Consumer / Concurrency", lc: null, pattern: "linked-list", note: "MS interviewers pivot DSA rounds into OS/concurrency." },
  { name: "Number of Islands", lc: 200, pattern: "bfs" },
  { name: "Valid Parentheses + Min Remove to Make Valid", lc: 20, pattern: "monostack" },
];

// ============================================================================
// ANIMATIONS (same as before, plus Trie + Monotonic Stack + Linked List)
// ============================================================================

function TwoPointersAnim() {
  const arr = [-4, -1, -1, 0, 1, 2];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { l: 0, r: 5, note: "Start: left=0, right=5. Sum = -4+2 = -2. Too small, move left→" },
    { l: 1, r: 5, note: "left=1, right=5. Sum = -1+2 = 1. Too big, move right←" },
    { l: 1, r: 4, note: "left=1, right=4. Sum = -1+1 = 0. Match found!" },
    { l: 2, r: 4, note: "Continue: left=2, right=4. Sum = -1+1 = 0. Match (dedupe needed)" },
    { l: 3, r: 4, note: "left=3, right=4. Sum = 0+1 = 1. Too big, move right←" },
    { l: 3, r: 3, note: "Pointers meet. Done." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1600);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-array">
        {arr.map((v, i) => (
          <div key={i} className={`anim-cell ${i === f.l ? "ptr-l" : ""} ${i === f.r ? "ptr-r" : ""}`}>
            <div className="anim-val">{v}</div>
            <div className="anim-idx">{i}</div>
          </div>
        ))}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function SlidingWindowAnim() {
  const s = "abcabcbb";
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { l: 0, r: 0, set: "a", note: "right=0, add 'a'. Window: [a], size=1" },
    { l: 0, r: 1, set: "a,b", note: "right=1, add 'b'. Window: [ab], size=2" },
    { l: 0, r: 2, set: "a,b,c", note: "right=2, add 'c'. Window: [abc], size=3 ✓ max so far" },
    { l: 0, r: 3, set: "a,b,c", note: "right=3 is 'a' — duplicate! Shrink from left..." },
    { l: 1, r: 3, set: "b,c,a", note: "left=1, window: [bca], size=3" },
    { l: 1, r: 4, set: "b,c,a", note: "right=4 is 'b' — duplicate! Shrink..." },
    { l: 2, r: 4, set: "c,a,b", note: "left=2, window: [cab], size=3" },
    { l: 2, r: 5, set: "c,a,b", note: "right=5 is 'c' — duplicate! Shrink..." },
    { l: 3, r: 5, set: "a,b,c", note: "left=3, window: [abc], size=3" },
    { l: 3, r: 6, set: "a,b,c", note: "right=6 is 'b' — shrink past 'b'..." },
    { l: 5, r: 6, set: "c,b", note: "left=5, window: [cb], size=2" },
    { l: 5, r: 7, set: "c,b", note: "right=7 is 'b' — duplicate again..." },
    { l: 7, r: 7, set: "b", note: "left=7, window: [b]. Answer: 3" },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1300);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const chars = s.split("");
  return (
    <div className="anim-box">
      <div className="anim-array">
        {chars.map((c, i) => (
          <div key={i} className={`anim-cell ${i >= f.l && i <= f.r ? "in-window" : ""} ${i === f.l ? "ptr-l" : ""} ${i === f.r ? "ptr-r" : ""}`}>
            <div className="anim-val">{c}</div>
            <div className="anim-idx">{i}</div>
          </div>
        ))}
      </div>
      <div className="anim-sub">window set: {`{${f.set}}`}</div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function BinarySearchAnim() {
  const arr = [1, 4, 7, 11, 15, 19, 23, 27, 31, 35];
  const target = 23;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { lo: 0, hi: 9, mid: 4, note: "lo=0, hi=9, mid=4 → arr[4]=15. 15 < 23, search right half." },
    { lo: 5, hi: 9, mid: 7, note: "lo=5, hi=9, mid=7 → arr[7]=27. 27 > 23, search left half." },
    { lo: 5, hi: 6, mid: 5, note: "lo=5, hi=6, mid=5 → arr[5]=19. 19 < 23, search right." },
    { lo: 6, hi: 6, mid: 6, note: "lo=6, hi=6, mid=6 → arr[6]=23. Match! Return 6." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1800);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub" style={{ marginBottom: "12px" }}>
        searching for <span className="hi">{target}</span>
      </div>
      <div className="anim-array">
        {arr.map((v, i) => {
          const inRange = i >= f.lo && i <= f.hi;
          return (
            <div key={i} className={`anim-cell ${inRange ? "in-range" : "out-range"} ${i === f.mid ? "is-mid" : ""}`}>
              <div className="anim-val">{v}</div>
              <div className="anim-idx">{i}</div>
            </div>
          );
        })}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function BFSAnim() {
  const grid = [
    [0, 0, 0, 1, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ];
  const start = [0, 0];
  const target = [4, 4];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = React.useMemo(() => {
    const rows = grid.length, cols = grid[0].length;
    const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
    const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
    dist[start[0]][start[1]] = 0;
    const q = [[...start]];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const levels = [[[start[0], start[1]]]];
    while (q.length) {
      const [r, c] = q.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && dist[nr][nc] === -1) {
          dist[nr][nc] = dist[r][c] + 1;
          parent[nr][nc] = [r, c];
          if (!levels[dist[nr][nc]]) levels[dist[nr][nc]] = [];
          levels[dist[nr][nc]].push([nr, nc]);
          q.push([nr, nc]);
        }
      }
    }
    const path = [];
    let cur = [target[0], target[1]];
    while (cur) { path.push(cur); cur = parent[cur[0]][cur[1]]; }
    path.reverse();
    const cumulative = [];
    let acc = [];
    for (const lvl of levels) {
      acc = [...acc, ...lvl];
      cumulative.push({ visited: [...acc], path: null, note: `Level ${cumulative.length}: ${lvl.length} new cell(s) at distance ${cumulative.length}.` });
    }
    cumulative.push({ visited: acc, path, note: `Target reached. Shortest path = ${path.length - 1} steps.` });
    return cumulative;
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1100);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const visitedSet = new Set(f.visited.map((c) => `${c[0]},${c[1]}`));
  const pathSet = new Set((f.path || []).map((c) => `${c[0]},${c[1]}`));
  return (
    <div className="anim-box">
      <div className="grid-wrap">
        {grid.map((row, r) => (
          <div key={r} className="grid-row">
            {row.map((v, c) => {
              const key = `${r},${c}`;
              const isStart = r === start[0] && c === start[1];
              const isTarget = r === target[0] && c === target[1];
              const wall = v === 1;
              const visited = visitedSet.has(key);
              const onPath = pathSet.has(key);
              return (
                <div key={c} className={`grid-cell ${wall ? "wall" : ""} ${visited ? "visited" : ""} ${onPath ? "on-path" : ""} ${isStart ? "start" : ""} ${isTarget ? "target" : ""}`}>
                  {isStart ? "S" : isTarget ? "T" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function DFSAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { path: [], emitted: [[]], note: "Visit root []. Emit []. Explore children." },
    { path: [1], emitted: [[], [1]], note: "Include 1 → path=[1]. Emit [1]." },
    { path: [1, 2], emitted: [[], [1], [1, 2]], note: "Include 2 → path=[1,2]. Emit [1,2]." },
    { path: [1, 2, 3], emitted: [[], [1], [1, 2], [1, 2, 3]], note: "Include 3 → path=[1,2,3]. Emit." },
    { path: [1, 2], emitted: [[], [1], [1, 2], [1, 2, 3]], note: "Backtrack: remove 3." },
    { path: [1, 3], emitted: [[], [1], [1, 2], [1, 2, 3], [1, 3]], note: "Backtrack to [1], then include 3. Emit [1,3]." },
    { path: [1], emitted: [[], [1], [1, 2], [1, 2, 3], [1, 3]], note: "Backtrack: remove 3." },
    { path: [2], emitted: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2]], note: "Backtrack to root, include 2. Emit [2]." },
    { path: [2, 3], emitted: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3]], note: "Include 3 → emit [2,3]." },
    { path: [3], emitted: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]], note: "Backtrack, include 3 alone. Emit [3]." },
    { path: [], emitted: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]], note: "All branches explored. 2^n = 8 subsets." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1400);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">nums = [1,2,3]</div>
      <div className="dfs-path">current path: <span className="hi">[{f.path.join(", ")}]</span></div>
      <div className="dfs-emitted">
        <div className="dfs-label">emitted subsets:</div>
        <div className="dfs-emitted-list">
          {f.emitted.map((s, i) => <span key={i} className="dfs-emitted-item">[{s.join(",")}]</span>)}
        </div>
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function HeapAnim() {
  const stream = [5, 1, 9, 3, 7, 2, 8, 4];
  const k = 3;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = React.useMemo(() => {
    const frames = [];
    const heap = [];
    const sorted = () => [...heap].sort((a, b) => a - b);
    for (let i = 0; i < stream.length; i++) {
      const n = stream[i];
      heap.push(n);
      heap.sort((a, b) => a - b);
      if (heap.length > k) {
        const evicted = heap.shift();
        frames.push({ i, val: n, heap: sorted(), note: `Push ${n}. Size > ${k}. Evict smallest (${evicted}). Heap = [${sorted().join(",")}]` });
      } else {
        frames.push({ i, val: n, heap: sorted(), note: `Push ${n}. Heap = [${sorted().join(",")}]` });
      }
    }
    frames.push({ i: stream.length, val: null, heap: sorted(), note: `Stream done. Top of heap = ${sorted()[0]} → kth largest.` });
    return frames;
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1300);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">stream (processing left → right), k = {k}</div>
      <div className="anim-array">
        {stream.map((v, i) => (
          <div key={i} className={`anim-cell ${i < f.i ? "processed" : ""} ${i === f.i ? "ptr-r" : ""}`}>
            <div className="anim-val">{v}</div>
          </div>
        ))}
      </div>
      <div className="heap-wrap">
        <div className="anim-sub">min-heap (size ≤ {k}):</div>
        <div className="heap-cells">
          {f.heap.map((v, i) => (
            <div key={i} className={`heap-cell ${i === 0 ? "heap-root" : ""}`}>{v}</div>
          ))}
          {f.heap.length === 0 && <div className="heap-empty">empty</div>}
        </div>
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function DP1DAnim() {
  const nums = [2, 7, 9, 3, 1];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = React.useMemo(() => {
    const dp = new Array(nums.length).fill(0);
    const frames = [];
    frames.push({ i: -1, dp: [...dp], note: "dp[i] = max loot considering houses 0..i. Start with zeros." });
    for (let i = 0; i < nums.length; i++) {
      if (i === 0) dp[0] = nums[0];
      else if (i === 1) dp[1] = Math.max(nums[0], nums[1]);
      else dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
      const rule = i === 0 ? `dp[0] = nums[0] = ${nums[0]}` :
                   i === 1 ? `dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}` :
                   `dp[${i}] = max(dp[${i-1}]=${dp[i-1]}, dp[${i-2}]=${dp[i-2]} + ${nums[i]}) = ${dp[i]}`;
      frames.push({ i, dp: [...dp], note: rule });
    }
    frames.push({ i: nums.length - 1, dp: [...dp], note: `Answer: dp[${nums.length - 1}] = ${dp[nums.length - 1]}` });
    return frames;
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1500);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">nums (loot per house):</div>
      <div className="anim-array">
        {nums.map((v, i) => (
          <div key={i} className={`anim-cell ${i === f.i ? "ptr-r" : ""}`}>
            <div className="anim-val">{v}</div>
            <div className="anim-idx">{i}</div>
          </div>
        ))}
      </div>
      <div className="anim-sub">dp array:</div>
      <div className="anim-array">
        {f.dp.map((v, i) => (
          <div key={i} className={`anim-cell dp-cell ${i === f.i ? "is-mid" : ""}`}>
            <div className="anim-val">{v}</div>
            <div className="anim-idx">{i}</div>
          </div>
        ))}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function DP2DAnim() {
  const s1 = "ABCBDAB";
  const s2 = "BDCAB";
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = React.useMemo(() => {
    const m = s1.length, n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const frames = [{ i: -1, j: -1, dp: dp.map((r) => [...r]), note: "dp[i][j] = LCS of s1[0..i) and s2[0..j)." }];
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        const match = s1[i - 1] === s2[j - 1];
        frames.push({
          i, j, dp: dp.map((r) => [...r]),
          note: match
            ? `'${s1[i-1]}' == '${s2[j-1]}'. dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`
            : `'${s1[i-1]}' ≠ '${s2[j-1]}'. dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
        });
      }
    }
    frames.push({ i: m, j: n, dp: dp.map((r) => [...r]), note: `LCS length = dp[${m}][${n}] = ${dp[m][n]}` });
    return frames;
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 700);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">s1 = "{s1}", s2 = "{s2}"</div>
      <div className="dp2d-wrap">
        <table className="dp2d-table">
          <thead>
            <tr><th></th><th>∅</th>{s2.split("").map((c, j) => <th key={j}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {f.dp.map((row, i) => (
              <tr key={i}>
                <th>{i === 0 ? "∅" : s1[i - 1]}</th>
                {row.map((v, j) => (
                  <td key={j} className={`dp2d-cell ${i === f.i && j === f.j ? "is-mid" : ""} ${i <= f.i && (i < f.i || j <= f.j) && f.i >= 0 ? "filled" : ""}`}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function UnionFindAnim() {
  const n = 6;
  const edges = [[0, 1], [2, 3], [1, 2], [4, 5], [3, 4]];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = React.useMemo(() => {
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
      return x;
    };
    const frames = [{ parent: [...parent], edge: null, note: "Initial: each node is its own parent." }];
    for (const [a, b] of edges) {
      const ra = find(a), rb = find(b);
      if (ra !== rb) {
        parent[rb] = ra;
        frames.push({ parent: [...parent], edge: [a, b], note: `Union(${a}, ${b}): roots ${ra}, ${rb} → link ${rb} under ${ra}.` });
      } else {
        frames.push({ parent: [...parent], edge: [a, b], note: `Union(${a}, ${b}): already connected (cycle).` });
      }
    }
    return frames;
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1500);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const root = (i) => { let x = i; while (f.parent[x] !== x) x = f.parent[x]; return x; };
  const colors = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];
  return (
    <div className="anim-box">
      <div className="anim-sub">nodes + parent pointers</div>
      <div className="uf-wrap">
        {Array.from({ length: n }).map((_, i) => {
          const r = root(i);
          const col = colors[r % colors.length];
          const isEdgeNode = f.edge && (f.edge[0] === i || f.edge[1] === i);
          return (
            <div key={i} className={`uf-node ${isEdgeNode ? "uf-active" : ""}`} style={{ borderColor: col, color: col }}>
              <div className="uf-id">{i}</div>
              <div className="uf-par">↑ {f.parent[i]}</div>
            </div>
          );
        })}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function IntervalsAnim() {
  const raw = [[1, 3], [2, 6], [8, 10], [9, 11], [15, 18]];
  const sorted = [...raw].sort((a, b) => a[0] - b[0]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = React.useMemo(() => {
    const frames = [{ i: -1, merged: [], note: "Sort intervals by start time." }];
    const merged = [];
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      if (merged.length === 0 || merged[merged.length - 1][1] < cur[0]) {
        merged.push([...cur]);
        frames.push({ i, merged: merged.map((x) => [...x]), note: `[${cur[0]},${cur[1]}] doesn't overlap. Append.` });
      } else {
        const last = merged[merged.length - 1];
        last[1] = Math.max(last[1], cur[1]);
        frames.push({ i, merged: merged.map((x) => [...x]), note: `[${cur[0]},${cur[1]}] overlaps. Extend last to [${last[0]},${last[1]}].` });
      }
    }
    return frames;
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1500);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const maxEnd = 20;
  return (
    <div className="anim-box">
      <div className="anim-sub">sorted intervals:</div>
      <div className="interval-wrap">
        {sorted.map((iv, i) => (
          <div key={i} className="interval-row">
            <div className="interval-label">[{iv[0]},{iv[1]}]</div>
            <div className="interval-track">
              <div className={`interval-bar ${i === f.i ? "active" : ""} ${i < f.i ? "processed" : ""}`}
                   style={{ left: `${(iv[0] / maxEnd) * 100}%`, width: `${((iv[1] - iv[0]) / maxEnd) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="anim-sub" style={{ marginTop: "14px" }}>merged result:</div>
      <div className="interval-wrap">
        {f.merged.map((iv, i) => (
          <div key={i} className="interval-row">
            <div className="interval-label">[{iv[0]},{iv[1]}]</div>
            <div className="interval-track">
              <div className="interval-bar merged" style={{ left: `${(iv[0] / maxEnd) * 100}%`, width: `${((iv[1] - iv[0]) / maxEnd) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// NEW: Trie animation — inserting words, searching prefix
function TrieAnim() {
  const words = ["cat", "car", "cap", "dog"];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Build cumulative trie state per step
  const frames = React.useMemo(() => {
    // Trie as nested object for viz
    const root = { char: "•", children: {}, isEnd: false };
    const insert = (r, word) => {
      let n = r;
      const path = [];
      for (const c of word) {
        if (!n.children[c]) n.children[c] = { char: c, children: {}, isEnd: false };
        n = n.children[c];
        path.push(c);
      }
      n.isEnd = true;
      return path;
    };
    const clone = (n) => ({ char: n.char, isEnd: n.isEnd, children: Object.fromEntries(Object.entries(n.children).map(([k, v]) => [k, clone(v)])) });
    const frames = [{ tree: clone(root), highlight: [], note: "Empty trie. Root node is •." }];
    for (const w of words) {
      const path = insert(root, w);
      frames.push({ tree: clone(root), highlight: path, note: `Insert "${w}". Walk ${path.map(c => `'${c}'`).join(" → ")}, mark end.` });
    }
    // Search demo
    frames.push({ tree: clone(root), highlight: ["c", "a"], note: `Search prefix "ca": walk c → a. Both exist. Returns words starting with "ca" via subtree DFS.` });
    return frames;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1800);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const f = frames[step];

  // Render the tree recursively
  const renderNode = (node, depth, pathSoFar, isHighlighted) => {
    const childKeys = Object.keys(node.children).sort();
    return (
      <div className="trie-group" key={`${depth}-${pathSoFar}`}>
        <div className={`trie-node ${node.isEnd ? "trie-end" : ""} ${isHighlighted ? "trie-hi" : ""}`}>
          {node.char}
        </div>
        {childKeys.length > 0 && (
          <div className="trie-children">
            {childKeys.map((c) => {
              const nextPath = pathSoFar + c;
              const childHi = f.highlight.length > depth && f.highlight.slice(0, depth + 1).join("") === nextPath;
              return renderNode(node.children[c], depth + 1, nextPath, childHi);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="anim-box">
      <div className="anim-sub">inserting: {words.map(w => `"${w}"`).join(", ")}</div>
      <div className="trie-wrap">
        {renderNode(f.tree, 0, "", f.highlight.length === 0)}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// NEW: Monotonic Stack — next greater element
function MonoStackAnim() {
  const nums = [2, 1, 2, 4, 3, 1, 5];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  const frames = React.useMemo(() => {
    const frames = [];
    const n = nums.length;
    const result = new Array(n).fill(-1);
    const stack = []; // holds indices
    for (let i = 0; i < n; i++) {
      const popped = [];
      while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
        const idx = stack.pop();
        result[idx] = nums[i];
        popped.push(idx);
      }
      stack.push(i);
      frames.push({
        i,
        stack: [...stack],
        result: [...result],
        popped,
        note: popped.length > 0
          ? `i=${i} (val ${nums[i]}). Pop indices [${popped.join(",")}] — ${nums[i]} is their next greater. Push ${i}.`
          : `i=${i} (val ${nums[i]}). Stack top ${stack.length > 1 ? `val ${nums[stack[stack.length - 2]]}` : "empty"} ≥ ${nums[i]}. Just push ${i}.`,
      });
    }
    frames.push({
      i: n, stack: [...stack], result: [...result], popped: [],
      note: `Remaining stack [${stack.join(",")}] has no next greater. Result: [${result.join(",")}]`,
    });
    return frames;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1400);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const f = frames[step];

  return (
    <div className="anim-box">
      <div className="anim-sub">nums (scanning left → right):</div>
      <div className="anim-array">
        {nums.map((v, i) => (
          <div key={i} className={`anim-cell ${i === f.i ? "ptr-r" : ""} ${i < f.i ? "processed" : ""} ${f.popped.includes(i) ? "ptr-l" : ""}`}>
            <div className="anim-val">{v}</div>
            <div className="anim-idx">{i}</div>
          </div>
        ))}
      </div>
      <div className="anim-sub">monotonic decreasing stack (indices, top→right):</div>
      <div className="mono-stack">
        {f.stack.length === 0 && <div className="heap-empty">empty</div>}
        {f.stack.map((idx, i) => (
          <div key={i} className="mono-cell">
            <div className="mono-idx">i={idx}</div>
            <div className="mono-val">{nums[idx]}</div>
          </div>
        ))}
      </div>
      <div className="anim-sub">next greater element so far:</div>
      <div className="anim-array">
        {f.result.map((v, i) => (
          <div key={i} className={`anim-cell dp-cell ${v !== -1 ? "filled-cell" : ""}`}>
            <div className="anim-val">{v === -1 ? "—" : v}</div>
            <div className="anim-idx">{i}</div>
          </div>
        ))}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// NEW: Linked list — Floyd's cycle detection
function LinkedListAnim() {
  // 7 nodes, cycle starts at index 2 (nodes 4 -> 5 -> 6 -> 2)
  const n = 7;
  const cycleStart = 2;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  // next(i) returns the next node index; tail (6) wraps to cycleStart
  const next = (i) => (i === n - 1 ? cycleStart : i + 1);

  const frames = React.useMemo(() => {
    const frames = [];
    let slow = 0, fast = 0;
    frames.push({ slow, fast, note: "Init: both pointers at head (index 0)." });
    // iterate until slow == fast (they'll meet inside cycle)
    for (let k = 0; k < 20; k++) {
      slow = next(slow);
      fast = next(next(fast));
      frames.push({
        slow, fast,
        note: `Step ${k + 1}: slow→${slow}, fast→${fast}.${slow === fast ? " Meeting point! Cycle confirmed." : ""}`,
      });
      if (slow === fast) break;
    }
    return frames;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1300);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const f = frames[step];

  // Compute SVG layout — linear first, then wrap cycle under
  // Positions: nodes 0..cycleStart-1 on a line; cycleStart..n-1 form a horizontal oval below
  const width = 520;
  const nodePositions = [];
  const preCycleCount = cycleStart; // nodes 0..cycleStart-1
  const cycleCount = n - cycleStart;
  // Pre-cycle nodes on top row
  for (let i = 0; i < preCycleCount; i++) {
    nodePositions.push({ x: 30 + i * 70, y: 40 });
  }
  // Cycle nodes arranged in circle
  const cycleCenterX = 30 + preCycleCount * 70 + 90;
  const cycleCenterY = 110;
  const radius = 55;
  for (let i = 0; i < cycleCount; i++) {
    const angle = (i / cycleCount) * 2 * Math.PI - Math.PI / 2;
    nodePositions.push({
      x: cycleCenterX + Math.cos(angle) * radius,
      y: cycleCenterY + Math.sin(angle) * radius,
    });
  }

  return (
    <div className="anim-box">
      <div className="anim-sub">linked list with cycle (nodes shown as circles, arrows = .next):</div>
      <svg viewBox={`0 0 ${width} 200`} className="ll-svg" style={{ width: "100%", height: "auto", maxHeight: "260px" }}>
        {/* draw edges */}
        {Array.from({ length: n }).map((_, i) => {
          const from = nodePositions[i];
          const to = nodePositions[next(i)];
          return (
            <g key={`e-${i}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#8890a0" strokeWidth="1.5" markerEnd="url(#arrow)" />
            </g>
          );
        })}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#8890a0" />
          </marker>
        </defs>
        {/* draw nodes */}
        {nodePositions.map((pos, i) => {
          const isSlow = i === f.slow;
          const isFast = i === f.fast;
          const both = isSlow && isFast;
          const fill = both ? "#16a34a" : isSlow ? "#2563eb" : isFast ? "#d97706" : "#e4e7ec";
          const stroke = both ? "#16a34a" : isSlow ? "#2563eb" : isFast ? "#d97706" : "#c4c9d4";
          const textColor = (isSlow || isFast) ? "#ffffff" : "#1a1d24";
          return (
            <g key={`n-${i}`} style={{ transition: "all 0.4s ease" }}>
              <circle cx={pos.x} cy={pos.y} r="16" fill={fill} stroke={stroke} strokeWidth="2" />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={textColor} fontFamily="IBM Plex Mono, monospace">
                {i}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="ll-legend">
        <span className="ll-chip ll-slow">S slow (1 step)</span>
        <span className="ll-chip ll-fast">F fast (2 steps)</span>
        <span className="ll-chip ll-meet">meet → cycle</span>
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// NEW: Topological sort animation (Kahn's)
function TopoAnim() {
  // Graph: 0 → 1, 0 → 2, 1 → 3, 2 → 3, 3 → 4, 2 → 5
  const nodes = [0, 1, 2, 3, 4, 5];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [2, 5]];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  const frames = React.useMemo(() => {
    const n = nodes.length;
    const inDeg = new Array(n).fill(0);
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); inDeg[b]++; }
    const frames = [{ inDeg: [...inDeg], queue: [], order: [], removed: new Set(), note: "Compute in-degrees. Queue nodes with in-degree 0." }];
    const queue = [];
    for (let i = 0; i < n; i++) if (inDeg[i] === 0) queue.push(i);
    frames.push({ inDeg: [...inDeg], queue: [...queue], order: [], removed: new Set(), note: `Initial queue: [${queue.join(",")}] (no dependencies).` });
    const order = [];
    const removed = new Set();
    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      removed.add(node);
      const newlyZero = [];
      for (const nb of adj[node]) {
        inDeg[nb]--;
        if (inDeg[nb] === 0) { queue.push(nb); newlyZero.push(nb); }
      }
      frames.push({
        inDeg: [...inDeg], queue: [...queue], order: [...order], removed: new Set(removed),
        note: `Pop ${node}. Add to order. ${newlyZero.length > 0 ? `Neighbors [${newlyZero.join(",")}] now have in-degree 0 → enqueue.` : "No neighbors reached 0 yet."}`,
      });
    }
    frames.push({
      inDeg: [...inDeg], queue: [], order: [...order], removed: new Set(removed),
      note: `Done. Topological order: [${order.join(" → ")}]`,
    });
    return frames;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1500);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const f = frames[step];

  // Graph layout
  const pos = {
    0: { x: 60, y: 80 },
    1: { x: 170, y: 40 },
    2: { x: 170, y: 120 },
    3: { x: 280, y: 80 },
    4: { x: 390, y: 80 },
    5: { x: 280, y: 160 },
  };

  return (
    <div className="anim-box">
      <div className="anim-sub">DAG (arrows = dependencies, e.g. 0 must come before 1):</div>
      <svg viewBox="0 0 460 220" className="ll-svg" style={{ width: "100%", maxHeight: "260px" }}>
        <defs>
          <marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#8890a0" />
          </marker>
        </defs>
        {edges.map(([a, b], i) => {
          const from = pos[a], to = pos[b];
          const faded = f.removed.has(a);
          return (
            <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={faded ? "#c4c9d4" : "#5a6069"} strokeWidth="1.5" markerEnd="url(#arrow2)" />
          );
        })}
        {nodes.map((node) => {
          const p = pos[node];
          const isRemoved = f.removed.has(node);
          const inQueue = f.queue.includes(node);
          const fill = isRemoved ? "#d8dce4" : inQueue ? "#2563eb" : "#e4e7ec";
          const stroke = isRemoved ? "#c4c9d4" : inQueue ? "#2563eb" : "#8890a0";
          const text = isRemoved ? "#8890a0" : inQueue ? "#ffffff" : "#1a1d24";
          return (
            <g key={node}>
              <circle cx={p.x} cy={p.y} r="20" fill={fill} stroke={stroke} strokeWidth="2" />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={text} fontFamily="IBM Plex Mono, monospace">{node}</text>
              <text x={p.x} y={p.y - 28} textAnchor="middle" fontSize="10" fill="#5a6070" fontFamily="IBM Plex Mono, monospace">
                in: {f.inDeg[node]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="topo-row">
        <div className="topo-col">
          <div className="anim-sub">queue (FIFO):</div>
          <div className="heap-cells">
            {f.queue.length === 0 && <div className="heap-empty">empty</div>}
            {f.queue.map((v, i) => (<div key={i} className="heap-cell">{v}</div>))}
          </div>
        </div>
        <div className="topo-col">
          <div className="anim-sub">topological order:</div>
          <div className="heap-cells">
            {f.order.length === 0 && <div className="heap-empty">empty</div>}
            {f.order.map((v, i) => (<div key={i} className="heap-cell heap-root">{v}</div>))}
          </div>
        </div>
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

function AnimControls({ playing, setPlaying, step, setStep, total }) {
  return (
    <div className="anim-ctrls">
      <button className="ctrl-btn" onClick={() => setPlaying((p) => !p)}>{playing ? "❚❚ pause" : "▶ play"}</button>
      <button className="ctrl-btn" onClick={() => { setPlaying(false); setStep((s) => (s - 1 + total) % total); }}>← step</button>
      <button className="ctrl-btn" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % total); }}>step →</button>
      <div className="ctrl-progress">
        <span>frame {step + 1} / {total}</span>
        <div className="ctrl-bar"><div className="ctrl-fill" style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
      </div>
    </div>
  );
}

const ANIM_MAP = {
  "two-pointers": TwoPointersAnim,
  "sliding-window": SlidingWindowAnim,
  "binary-search": BinarySearchAnim,
  bfs: BFSAnim,
  dfs: DFSAnim,
  heap: HeapAnim,
  "dp-1d": DP1DAnim,
  "dp-2d": DP2DAnim,
  "union-find": UnionFindAnim,
  intervals: IntervalsAnim,
  trie: TrieAnim,
  monostack: MonoStackAnim,
  "linked-list": LinkedListAnim,
  "topo-sort": TopoAnim,
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function DSAApp({ theme = "dark" }) {
  const [view, setView] = useState("pattern"); // 'pattern' | 'hot-google' | 'hot-ms'
  const [active, setActive] = useState(PATTERNS[0].id);
  const [filter, setFilter] = useState("all"); // 'all' | 'google' | 'ms' | 'principal'
  const [done, setDone] = useState({});
  const [expandedFollowup, setExpandedFollowup] = useState({});
  const contentRef = useRef(null);

  const pattern = PATTERNS.find((p) => p.id === active);
  const Anim = ANIM_MAP[active];

  const totalProblems = PATTERNS.reduce((s, p) => s + p.problems.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  const toggleDone = (patId, probIdx) => {
    const key = `${patId}::${probIdx}`;
    setDone((d) => ({ ...d, [key]: !d[key] }));
  };

  const toggleFollowup = (patId, probIdx) => {
    const key = `${patId}::${probIdx}`;
    setExpandedFollowup((e) => ({ ...e, [key]: !e[key] }));
  };

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [active, view]);

  const filteredProblems = (probs) => {
    if (filter === "all") return probs;
    if (filter === "google") return probs.filter((p) => p.tags.some((t) => t.startsWith("G")));
    if (filter === "ms") return probs.filter((p) => p.tags.some((t) => t.startsWith("M")));
    if (filter === "principal") return probs.filter((p) => p.tags.some((t) => t.endsWith("*")));
    return probs;
  };

  return (
    <div className={`dsa-course ${theme}`}>
      <style>{CSS}</style>
      <div className="dsa-app">
        <div className="dsa-sub-header">
          <div className="dsa-progress">
            <span className="progress-num">{doneCount} / {totalProblems}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(doneCount / totalProblems) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="view-tabs">
          <button className={`view-tab ${view === "pattern" ? "active" : ""}`} onClick={() => setView("pattern")}>
            <span className="view-tab-num">14</span>
            <span>Patterns</span>
          </button>
          <button className={`view-tab ${view === "hot-google" ? "active" : ""}`} onClick={() => setView("hot-google")}>
            <span className="view-tab-num">G</span>
            <span>Google Hot 15</span>
          </button>
          <button className={`view-tab ${view === "hot-ms" ? "active" : ""}`} onClick={() => setView("hot-ms")}>
            <span className="view-tab-num">M</span>
            <span>Microsoft Hot 15</span>
          </button>
        </div>

        {view === "pattern" ? (
          <div className="layout">
            <aside className="sidebar">
              <div className="sidebar-label">filters</div>
              <div className="filter-row">
                {[
                  { k: "all", l: "All" },
                  { k: "google", l: "Google" },
                  { k: "ms", l: "MS" },
                  { k: "principal", l: "★ Principal" },
                ].map((f) => (
                  <button key={f.k} className={`filter-chip ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>
                    {f.l}
                  </button>
                ))}
              </div>
              <div className="sidebar-label" style={{ marginTop: "20px" }}>patterns</div>
              <nav>
                {PATTERNS.map((p) => {
                  const patDone = p.problems.reduce((s, _, i) => s + (done[`${p.id}::${i}`] ? 1 : 0), 0);
                  const allDone = patDone === p.problems.length;
                  return (
                    <button key={p.id} className={`nav-item ${active === p.id ? "active" : ""} ${allDone ? "done" : ""}`} onClick={() => setActive(p.id)}>
                      <span className="nav-num">{p.num}</span>
                      <span className="nav-name">
                        <span className="nav-title">{p.name}</span>
                        <span className="nav-count">{patDone}/{p.problems.length}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
              <div className="sidebar-footer">for Arpit J. · principal prep · v2</div>
            </aside>

            <main className="content" ref={contentRef}>
              <div className="pattern-head">
                <div className="pattern-num">{pattern.num}</div>
                <div>
                  <h1 className="pattern-name">{pattern.name}</h1>
                  <p className="pattern-tagline">{pattern.tagline}</p>
                </div>
              </div>

              <div className="meta-grid">
                <div className="meta-card">
                  <div className="meta-label">when to use</div>
                  <div className="meta-body">{pattern.when}</div>
                </div>
                <div className="meta-card">
                  <div className="meta-label">why it works</div>
                  <div className="meta-body">{pattern.why}</div>
                </div>
                <div className="meta-card">
                  <div className="meta-label">complexity</div>
                  <div className="meta-body">
                    <div><span className="k">time</span> {pattern.complexity.time}</div>
                    <div><span className="k">space</span> {pattern.complexity.space}</div>
                  </div>
                </div>
              </div>

              <section className="section">
                <div className="section-head">
                  <div className="section-num">01</div>
                  <h2 className="section-title">Visualize</h2>
                </div>
                <Anim key={active} />
              </section>

              <section className="section">
                <div className="section-head">
                  <div className="section-num">02</div>
                  <h2 className="section-title">Java Template</h2>
                </div>
                <pre className="code"><code>{pattern.template}</code></pre>
              </section>

              <section className="section">
                <div className="section-head">
                  <div className="section-num">03</div>
                  <h2 className="section-title">
                    Problems ({filteredProblems(pattern.problems).length}{filter !== "all" ? ` of ${pattern.problems.length}` : ""})
                  </h2>
                </div>
                <div className="problems">
                  {filteredProblems(pattern.problems).map((prob) => {
                    const origIdx = pattern.problems.indexOf(prob);
                    const key = `${pattern.id}::${origIdx}`;
                    const isDone = !!done[key];
                    const fuOpen = !!expandedFollowup[key];
                    return (
                      <div key={origIdx} className={`problem ${isDone ? "problem-done" : ""}`}>
                        <div className="problem-header">
                          <button className="check" onClick={() => toggleDone(pattern.id, origIdx)}>
                            {isDone ? "✓" : ""}
                          </button>
                          <div className="problem-main">
                            <div className="problem-name">
                              {prob.name}
                              {prob.lc && <span className="problem-lc">LC {prob.lc}</span>}
                            </div>
                            <div className="tag-row">
                              {prob.tags.map((t) => (
                                <span key={t} className={`tag tag-${t.toLowerCase().replace("*", "-star")}`}>
                                  {t === "G" ? "Google" : t === "M" ? "Microsoft" : t === "G*" ? "★ Google Principal" : t === "M*" ? "★ MS Principal" : t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={`diff diff-${prob.diff.toLowerCase().split("/")[0]}`}>{prob.diff}</div>
                          {prob.followup && (
                            <button className="followup-toggle" onClick={() => toggleFollowup(pattern.id, origIdx)} title="Show typical follow-up">
                              {fuOpen ? "−" : "↳"}
                            </button>
                          )}
                        </div>
                        {prob.followup && fuOpen && (
                          <div className="followup">
                            <div className="followup-label">typical follow-up</div>
                            <div className="followup-body">{prob.followup}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="bottom-nav">
                {PATTERNS.findIndex((p) => p.id === active) > 0 && (
                  <button className="nav-btn" onClick={() => {
                    const idx = PATTERNS.findIndex((p) => p.id === active);
                    setActive(PATTERNS[idx - 1].id);
                  }}>
                    ← {PATTERNS[PATTERNS.findIndex((p) => p.id === active) - 1].name}
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {PATTERNS.findIndex((p) => p.id === active) < PATTERNS.length - 1 && (
                  <button className="nav-btn" onClick={() => {
                    const idx = PATTERNS.findIndex((p) => p.id === active);
                    setActive(PATTERNS[idx + 1].id);
                  }}>
                    {PATTERNS[PATTERNS.findIndex((p) => p.id === active) + 1].name} →
                  </button>
                )}
              </div>
            </main>
          </div>
        ) : (
          <HotList list={view === "hot-google" ? HOT_GOOGLE : HOT_MS}
                   company={view === "hot-google" ? "Google" : "Microsoft"}
                   onJumpToPattern={(id) => { setActive(id); setView("pattern"); }} />
        )}
      </div>
    </div>
  );
}

function HotList({ list, company, onJumpToPattern }) {
  const intro = company === "Google"
    ? "Compiled from 2025–2026 interview reports on LeetCode Discuss, Blind, Hello Interview, and onsites.fyi. At L5+/L6+, expect these as the opening problem with a 2nd-order follow-up. Tries, streaming variants, and DP with added constraints (e.g., 'with 1 swap allowed') are the 2025 signature."
    : "Compiled from Microsoft SDE-2 / SSE / Principal loops (2025). Linked-list manipulation, LRU/LFU, and follow-up chains (cycle → length → break) dominate. Expect one round where DSA turns into concurrency/OS questions without warning.";

  return (
    <div className="hot-wrap">
      <div className="hot-head">
        <div className="hot-badge">{company}</div>
        <h1 className="hot-title">Top 15 Asked at {company}</h1>
        <p className="hot-intro">{intro}</p>
      </div>
      <div className="hot-list">
        {list.map((p, i) => {
          const pattern = PATTERNS.find((pat) => pat.id === p.pattern);
          return (
            <div key={i} className="hot-item">
              <div className="hot-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="hot-body">
                <div className="hot-name">
                  {p.name}
                  {p.lc && <span className="hot-lc">LC {p.lc}</span>}
                </div>
                {p.note && <div className="hot-note">{p.note}</div>}
                {pattern && (
                  <button className="hot-pattern" onClick={() => onJumpToPattern(p.pattern)}>
                    pattern: {pattern.name} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// CSS
// ============================================================================

const CSS = `

.dsa-course {
  --bg: #06080f;
  --bg-2: rgba(255,255,255,0.03);
  --bg-3: rgba(255,255,255,0.06);
  --line: rgba(255,255,255,0.08);
  --text: #e2e5ef;
  --text-dim: #8b90a0;
  --text-dimmer: #555a6e;
  --accent: #3b82f6;
  --accent-2: #10b981;
  --warn: #f59e0b;
  --danger: #ef4444;
  --google: #4285f4;
  --ms: #00a4ef;
  --mono: 'JetBrains Mono', ui-monospace, monospace;
  --serif: 'Inter', -apple-system, system-ui, sans-serif;
  --glass-blur: blur(16px) saturate(180%);
}

.dsa-course * { box-sizing: border-box; margin: 0; padding: 0; }

.dsa-course .dsa-app {
  background: transparent;
  color: var(--text);
  font-family: var(--serif);
  font-size: 14px;
  line-height: 1.55;
}
.dsa-course .dsa-app { display: flex; flex-direction: column; }

.dsa-course .dsa-sub-header {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 8px 32px; border-bottom: 1px solid var(--line);
  background: rgba(6,8,15,0.5);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}

.progress { display: flex; align-items: center; gap: 12px; }
.progress-num { font-size: 12px; color: var(--text-dim); font-weight: 600; font-family: var(--mono); }
.progress-bar { width: 140px; height: 4px; background: var(--bg-3); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); transition: width 0.3s ease; border-radius: 2px; }

.view-tabs {
  display: flex; gap: 0; border-bottom: 1px solid var(--line);
  background: rgba(6,8,15,0.5);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  padding: 0 32px; position: sticky; top: 65px; z-index: 9;
}
.view-tab {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; color: var(--text-dim);
  padding: 14px 20px; cursor: pointer; font-family: var(--mono);
  font-size: 12px; font-weight: 500; border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.view-tab:hover { color: var(--text); background: var(--bg-2); }
.view-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.view-tab-num {
  font-size: 18px; font-weight: 800; color: var(--accent); letter-spacing: -0.02em;
}

.layout { display: grid; grid-template-columns: 280px 1fr; flex: 1; min-height: 0; }

.sidebar {
  background: rgba(255,255,255,0.02);
  border-right: 1px solid var(--line); padding: 24px 0;
  position: sticky; top: 114px; height: calc(100vh - 114px);
  overflow-y: auto; display: flex; flex-direction: column;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}

.sidebar-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em;
  color: var(--text-dimmer); padding: 0 24px 12px; font-family: var(--mono);
}

.filter-row { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 20px; }
.filter-chip {
  background: var(--bg-3); border: 1px solid var(--line); color: var(--text-dim);
  font-family: var(--mono); font-size: 11px; padding: 4px 10px;
  border-radius: 12px; cursor: pointer; transition: all 0.2s;
}
.filter-chip:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
.filter-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 600; }

.sidebar nav { flex: 1; margin-top: 4px; }

.nav-item {
  display: flex; align-items: stretch; gap: 12px; width: 100%;
  padding: 12px 24px; background: none; border: none;
  color: var(--text-dim); text-align: left; cursor: pointer;
  font-family: inherit; font-size: 13px;
  border-left: 2px solid transparent; transition: all 0.2s;
}
.nav-item:hover { background: var(--bg-2); color: var(--text); }
.nav-item.active { background: rgba(59,130,246,0.06); color: var(--text); border-left-color: var(--accent); }
.nav-item.done .nav-title { color: var(--accent-2); }

.nav-num { color: var(--text-dimmer); font-size: 11px; font-weight: 600; padding-top: 2px; min-width: 20px; font-family: var(--mono); }
.nav-item.active .nav-num { color: var(--accent); }
.nav-name { display: flex; flex-direction: column; flex: 1; }
.nav-title { font-weight: 500; }
.nav-count { font-size: 10px; color: var(--text-dimmer); margin-top: 2px; font-family: var(--mono); }

.sidebar-footer {
  padding: 20px 24px; border-top: 1px solid var(--line);
  font-size: 10px; color: var(--text-dimmer); font-family: var(--mono);
}

.content { padding: 48px 64px 80px; max-width: 960px; width: 100%; overflow-y: auto; }

.pattern-head {
  display: flex; align-items: flex-start; gap: 24px; margin-bottom: 36px;
  padding-bottom: 32px; border-bottom: 1px solid var(--line);
}
.pattern-num {
  font-size: 72px; font-weight: 800;
  line-height: 0.85; color: var(--accent); letter-spacing: -0.03em;
  text-shadow: 0 0 40px rgba(59,130,246,0.2);
}
.pattern-name {
  font-size: 42px; font-weight: 700;
  line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 8px;
  background: linear-gradient(135deg, #e2e5ef 0%, #8b90a0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.pattern-tagline { font-size: 14px; color: var(--text-dim); font-style: italic; max-width: 560px; }

.meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 56px; }
.meta-card {
  background: var(--bg-2); border: 1px solid var(--line);
  border-radius: 12px; padding: 16px 18px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  transition: all 0.2s;
}
.meta-card:hover { background: var(--bg-3); border-color: rgba(255,255,255,0.12); }
.meta-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em;
  color: var(--text-dimmer); margin-bottom: 10px; font-family: var(--mono);
}
.meta-body { font-size: 13px; color: var(--text); line-height: 1.5; }
.meta-body .k { color: var(--text-dimmer); font-size: 11px; margin-right: 8px; text-transform: uppercase; font-family: var(--mono); }

.section { margin-bottom: 56px; }
.section-head {
  display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
  padding-bottom: 10px; border-bottom: 1px solid var(--line);
}
.section-num { font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 0.1em; }
.section-title { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }

/* Animations */
.anim-box {
  background: var(--bg-2); border: 1px solid var(--line); border-radius: 16px; padding: 28px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.anim-sub {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-dim); margin-bottom: 10px; font-family: var(--mono);
}
.anim-sub .hi { color: var(--accent); font-weight: 600; }

.anim-array { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
.anim-cell {
  width: 52px; height: 52px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: var(--bg-3); border: 1px solid var(--line); border-radius: 8px;
  font-weight: 600; transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.anim-val { font-size: 15px; }
.anim-idx { font-size: 9px; color: var(--text-dimmer); margin-top: 2px; font-family: var(--mono); }

.anim-cell.ptr-l { border-color: var(--accent); background: rgba(59,130,246,0.1); box-shadow: 0 0 12px rgba(59,130,246,0.15); }
.anim-cell.ptr-r { border-color: var(--warn); background: rgba(245,158,11,0.1); box-shadow: 0 0 12px rgba(245,158,11,0.15); }
.anim-cell.ptr-l.ptr-r { border-color: var(--accent-2); background: rgba(16,185,129,0.12); box-shadow: 0 0 12px rgba(16,185,129,0.15); }
.anim-cell.in-window { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.3); }
.anim-cell.in-range { background: var(--bg-3); opacity: 1; }
.anim-cell.out-range { opacity: 0.3; }
.anim-cell.is-mid { border-color: var(--accent); background: rgba(59,130,246,0.15); transform: translateY(-3px); box-shadow: 0 4px 16px rgba(59,130,246,0.2); }
.anim-cell.processed { opacity: 0.45; }
.anim-cell.dp-cell { background: var(--bg-3); }
.anim-cell.filled-cell { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.25); }

.anim-note {
  padding: 12px 14px; background: rgba(59,130,246,0.05); border-left: 2px solid var(--accent);
  font-size: 12px; line-height: 1.6; color: var(--text); margin-top: 16px;
  border-radius: 0 8px 8px 0; font-family: var(--mono); min-height: 44px;
}

.anim-ctrls {
  display: flex; align-items: center; gap: 10px;
  margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line);
}
.ctrl-btn {
  background: var(--bg-3); border: 1px solid var(--line); color: var(--text);
  font-family: var(--mono); font-size: 11px; padding: 6px 12px;
  border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.ctrl-btn:hover { background: rgba(59,130,246,0.1); border-color: var(--accent); color: var(--accent); }

.ctrl-progress { flex: 1; display: flex; flex-direction: column; gap: 4px; margin-left: 8px; }
.ctrl-progress span { font-size: 10px; color: var(--text-dim); font-family: var(--mono); }
.ctrl-bar { height: 3px; background: var(--bg-3); border-radius: 2px; overflow: hidden; }
.ctrl-fill { height: 100%; background: var(--accent); transition: width 0.3s; border-radius: 2px; }

/* Grid (BFS) */
.grid-wrap { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; width: fit-content; }
.grid-row { display: flex; gap: 4px; }
.grid-cell {
  width: 44px; height: 44px; background: var(--bg-3); border: 1px solid var(--line);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; transition: all 0.3s;
}
.grid-cell.wall { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
.grid-cell.visited { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); }
.grid-cell.on-path { background: rgba(59,130,246,0.15); border-color: var(--accent); box-shadow: 0 0 8px rgba(59,130,246,0.2); }
.grid-cell.start { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.grid-cell.target { background: var(--warn); color: var(--bg); border-color: var(--warn); }
.grid-cell.start.on-path, .grid-cell.target.on-path { box-shadow: 0 0 12px rgba(59,130,246,0.3); }

/* DFS */
.dfs-path {
  font-size: 14px; padding: 14px; background: var(--bg-3);
  border: 1px dashed var(--line); border-radius: 8px; margin-bottom: 14px; text-align: center;
}
.dfs-path .hi { color: var(--accent); font-weight: 700; font-size: 17px; }
.dfs-emitted { margin-bottom: 10px; }
.dfs-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-dim); margin-bottom: 8px; font-family: var(--mono); }
.dfs-emitted-list {
  display: flex; flex-wrap: wrap; gap: 6px; min-height: 50px;
  padding: 10px; background: var(--bg-3); border-radius: 8px;
}
.dfs-emitted-item {
  font-size: 12px; padding: 4px 8px; background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; color: var(--accent-2); font-weight: 500;
}

/* Heap */
.heap-wrap { margin-top: 18px; }
.heap-cells {
  display: flex; gap: 8px; min-height: 50px; padding: 12px;
  background: var(--bg-3); border: 1px dashed var(--line); border-radius: 8px;
  align-items: center; flex-wrap: wrap;
}
.heap-cell {
  width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
  background: var(--bg-2); border: 1px solid var(--line); border-radius: 8px;
  font-weight: 600; font-size: 14px; transition: all 0.3s;
}
.heap-cell.heap-root { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 10px rgba(59,130,246,0.2); }
.heap-empty { color: var(--text-dimmer); font-size: 11px; font-style: italic; }

/* DP2D */
.dp2d-wrap { overflow-x: auto; margin-bottom: 14px; }
.dp2d-table { border-collapse: collapse; font-size: 12px; margin: 0 auto; }
.dp2d-table th, .dp2d-table td {
  width: 36px; height: 36px; text-align: center;
  border: 1px solid var(--line); color: var(--text-dim); font-weight: 500;
}
.dp2d-table th { background: var(--bg-3); color: var(--text); font-size: 14px; font-weight: 700; }
.dp2d-cell { background: var(--bg-3); transition: all 0.3s; }
.dp2d-cell.filled { background: var(--bg-2); color: var(--text); }
.dp2d-cell.is-mid {
  background: rgba(59,130,246,0.15); color: var(--accent);
  font-weight: 700; box-shadow: inset 0 0 0 2px var(--accent);
}

/* Union-find */
.uf-wrap {
  display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 14px;
  justify-content: center; padding: 20px 10px; background: var(--bg-3); border-radius: 12px;
}
.uf-node {
  width: 72px; min-height: 68px; border: 2px solid var(--line);
  border-radius: 12px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  transition: all 0.4s; background: var(--bg-2);
}
.uf-node.uf-active { transform: scale(1.08); box-shadow: 0 0 16px rgba(59,130,246,0.2); }
.uf-id { font-size: 18px; font-weight: 700; }
.uf-par { font-size: 10px; color: var(--text-dim); font-family: var(--mono); }

/* Intervals */
.interval-wrap { display: flex; flex-direction: column; gap: 6px; }
.interval-row { display: flex; align-items: center; gap: 12px; }
.interval-label { width: 80px; font-size: 11px; color: var(--text-dim); text-align: right; font-family: var(--mono); }
.interval-track { flex: 1; height: 20px; background: var(--bg-3); border-radius: 6px; position: relative; }
.interval-bar {
  position: absolute; top: 3px; height: 14px; background: var(--text-dimmer);
  border-radius: 4px; transition: all 0.3s;
}
.interval-bar.active { background: var(--accent); box-shadow: 0 0 12px rgba(59,130,246,0.3); }
.interval-bar.processed { background: var(--accent-2); }
.interval-bar.merged { background: var(--accent); }

/* Trie */
.trie-wrap {
  padding: 20px; background: var(--bg-3); border-radius: 12px;
  display: flex; justify-content: center; overflow-x: auto; margin-bottom: 14px;
}
.trie-group { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.trie-node {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--bg-2); border: 2px solid var(--line);
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 13px; color: var(--text);
  transition: all 0.3s;
}
.trie-node.trie-end { border-color: var(--accent-2); color: var(--accent-2); box-shadow: 0 0 10px rgba(16,185,129,0.2); }
.trie-node.trie-hi { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 16px rgba(59,130,246,0.3); transform: scale(1.1); }
.trie-children { display: flex; gap: 12px; align-items: flex-start; }
.trie-children > .trie-group { position: relative; }
.trie-children > .trie-group::before {
  content: ""; position: absolute; top: -10px; left: 50%;
  width: 1px; height: 10px; background: var(--line); transform: translateX(-50%);
}

/* Mono stack */
.mono-stack {
  display: flex; gap: 8px; min-height: 60px; padding: 12px;
  background: var(--bg-3); border: 1px dashed var(--line);
  border-radius: 8px; align-items: center; margin-bottom: 14px;
}
.mono-cell {
  display: flex; flex-direction: column; align-items: center;
  background: var(--bg-2); border: 1px solid var(--line); border-radius: 6px;
  padding: 4px 8px; min-width: 40px;
}
.mono-idx { font-size: 9px; color: var(--text-dimmer); font-family: var(--mono); }
.mono-val { font-size: 14px; font-weight: 600; color: var(--accent); }

/* Linked list */
.ll-svg { background: var(--bg-3); border-radius: 12px; padding: 8px; margin-bottom: 8px; }
.ll-legend { display: flex; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.ll-chip {
  font-size: 10px; padding: 3px 8px; border-radius: 6px;
  text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; font-family: var(--mono);
}
.ll-chip.ll-slow { background: rgba(59,130,246,0.12); color: var(--accent); }
.ll-chip.ll-fast { background: rgba(245,158,11,0.12); color: var(--warn); }
.ll-chip.ll-meet { background: rgba(16,185,129,0.12); color: var(--accent-2); }

/* Topo */
.topo-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
.topo-col { display: flex; flex-direction: column; }

/* Code */
.code {
  background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 12px;
  padding: 20px 22px; overflow-x: auto; font-family: var(--mono);
  font-size: 13px; line-height: 1.65; color: var(--text); position: relative;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.code::before {
  content: "java"; position: absolute; top: 8px; right: 12px;
  font-size: 10px; color: var(--text-dimmer);
  text-transform: uppercase; letter-spacing: 0.12em; font-family: var(--mono);
}

/* Problems */
.problems { display: flex; flex-direction: column; gap: 2px; }
.problem {
  display: flex; flex-direction: column;
  background: var(--bg-2); border: 1px solid transparent;
  border-radius: 8px; transition: all 0.2s;
}
.problem:hover { border-color: var(--line); background: var(--bg-3); }
.problem-done { opacity: 0.55; }

.problem-header { display: flex; align-items: center; gap: 14px; padding: 12px 16px; }
.problem-done .problem-name { text-decoration: line-through; }

.check {
  width: 20px; height: 20px; border: 1px solid var(--line);
  background: var(--bg-3); border-radius: 4px; cursor: pointer;
  color: var(--accent); font-weight: 700; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.check:hover { border-color: var(--accent); box-shadow: 0 0 8px rgba(59,130,246,0.2); }
.problem-done .check { background: var(--accent); color: #fff; border-color: var(--accent); }

.problem-main { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.problem-name { font-size: 13px; font-weight: 500; }
.problem-lc { margin-left: 10px; font-size: 10px; color: var(--text-dimmer); font-weight: 600; letter-spacing: 0.05em; font-family: var(--mono); }

.tag-row { display: flex; gap: 6px; flex-wrap: wrap; }
.tag {
  font-size: 9px; padding: 2px 7px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; font-family: var(--mono);
}
.tag-g { background: rgba(66,133,244,0.12); color: var(--google); }
.tag-m { background: rgba(0,164,239,0.12); color: var(--ms); }
.tag-g-star { background: rgba(66,133,244,0.18); color: var(--google); border: 1px solid rgba(66,133,244,0.35); }
.tag-m-star { background: rgba(0,164,239,0.18); color: var(--ms); border: 1px solid rgba(0,164,239,0.35); }

.diff {
  font-size: 10px; padding: 3px 8px; border-radius: 6px;
  text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; font-family: var(--mono);
}
.diff-easy { background: rgba(16,185,129,0.12); color: var(--accent-2); }
.diff-medium { background: rgba(245,158,11,0.12); color: var(--warn); }
.diff-hard { background: rgba(239,68,68,0.12); color: var(--danger); }

.followup-toggle {
  width: 24px; height: 24px;
  background: var(--bg-3); border: 1px solid var(--line);
  color: var(--accent); border-radius: 6px; cursor: pointer;
  font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.followup-toggle:hover { border-color: var(--accent); background: rgba(59,130,246,0.08); }

.followup {
  padding: 12px 16px 14px 50px; margin-top: 0;
  border-top: 1px solid var(--line);
  background: rgba(59,130,246,0.03);
}
.followup-label {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em;
  color: var(--accent); font-weight: 700; margin-bottom: 6px; font-family: var(--mono);
}
.followup-body { font-size: 12px; color: var(--text); line-height: 1.6; }

/* Hot list */
.hot-wrap { max-width: 880px; margin: 0 auto; padding: 56px 64px 80px; width: 100%; }
.hot-head { margin-bottom: 40px; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
.hot-badge {
  display: inline-block; padding: 4px 10px; border-radius: 6px;
  background: var(--accent); color: #fff;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 16px; font-family: var(--mono);
}
.hot-title {
  font-size: 44px; font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 14px;
  background: linear-gradient(135deg, #e2e5ef, #8b90a0);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hot-intro { font-size: 13px; color: var(--text-dim); line-height: 1.7; max-width: 660px; }

.hot-list { display: flex; flex-direction: column; gap: 2px; }
.hot-item {
  display: flex; gap: 20px; padding: 18px 20px;
  background: var(--bg-2); border: 1px solid transparent; border-radius: 8px;
  transition: all 0.2s;
}
.hot-item:hover { border-color: var(--line); background: var(--bg-3); }
.hot-num {
  font-size: 24px; font-weight: 800;
  color: var(--accent); letter-spacing: -0.02em;
  min-width: 40px; padding-top: 2px;
}
.hot-body { flex: 1; }
.hot-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.hot-lc { margin-left: 10px; font-size: 10px; color: var(--text-dimmer); font-weight: 600; font-family: var(--mono); }
.hot-note {
  font-size: 12px; color: var(--text-dim); font-style: italic;
  margin-top: 6px; padding-left: 10px; border-left: 2px solid var(--accent);
}
.hot-pattern {
  background: none; border: none; color: var(--accent); cursor: pointer;
  font-family: var(--mono); font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.08em; margin-top: 10px; padding: 0;
}
.hot-pattern:hover { text-decoration: underline; }

.bottom-nav { display: flex; gap: 12px; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--line); }
.nav-btn {
  background: var(--bg-2); border: 1px solid var(--line); color: var(--text);
  font-family: var(--mono); font-size: 12px; padding: 10px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.nav-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(59,130,246,0.05); }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; top: 0; }
  .content { padding: 32px 24px; }
  .meta-grid { grid-template-columns: 1fr; }
  .pattern-num { font-size: 56px; }
  .pattern-name { font-size: 32px; }
  .hot-wrap { padding: 32px 24px; }
  .hot-title { font-size: 32px; }
  .view-tabs { padding: 0 16px; }
}

/* ═══ Light Theme ═══ */
.dsa-course.light {
  --bg: #f0f2f5;
  --bg-2: rgba(255,255,255,0.7);
  --bg-3: rgba(255,255,255,0.9);
  --line: rgba(0,0,0,0.08);
  --text: #1a1d24;
  --text-dim: #5a6070;
  --text-dimmer: #8890a0;
  --accent: #2563eb;
  --accent-2: #059669;
  --warn: #d97706;
  --danger: #dc2626;
  --google: #4285f4;
  --ms: #00a4ef;
}
.dsa-course.light .dsa-app { background: var(--bg); }
.dsa-course.light .dsa-sub-header { background: rgba(240,242,245,0.85); }
.dsa-course.light .sidebar { background: rgba(255,255,255,0.6); }
.dsa-course.light .view-tabs { background: rgba(240,242,245,0.9); }
.dsa-course.light .anim-box { background: rgba(255,255,255,0.7); }
.dsa-course.light .pattern-name {
  background: linear-gradient(135deg, #1a1d24 0%, #5a6070 100%);
  -webkit-background-clip: text; background-clip: text;
}
.dsa-course.light .code-block { background: #1e293b; color: #e2e5ef; }
.dsa-course.light .prob-row:hover { background: rgba(0,0,0,0.03); }
.dsa-course.light .hot-wrap { background: var(--bg); }
`;
