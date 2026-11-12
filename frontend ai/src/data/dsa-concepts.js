export const CONCEPT_CATEGORIES = [
  { id: 'foundations', name: 'Java Foundations', level: 'Beginner' },
  { id: 'basic', name: 'Basic DSA', level: 'Beginner / Intermediate' },
  { id: 'intermediate', name: 'Intermediate DSA', level: 'Intermediate' },
  { id: 'advanced', name: 'Advanced DSA', level: 'Advanced' },
]

export const DSA_CONCEPTS = [
  // --- ARRAYS ---
  {
    id: 'array-declaration',
    topicId: 'arrays',
    topicName: 'Arrays',
    name: 'Array Declaration & Initialization',
    category: 'basic',
    level: 'Beginner',
    intro: 'An array in Java is a fixed-size, contiguous block of memory holding elements of the same data type.',
    definition: 'An indexed collection of data elements of identical type allocated sequentially in memory at fixed locations.',
    importance: 'Arrays form the bedrock of almost every other data structure (Strings, HashMaps, Heaps, Dynamic Arrays). Understanding zero-based indexing and memory continuity is essential for writing performant Java code.',
    realWorldApplications: ['Displaying a list of items in an e-commerce catalog', 'Pixel buffers in image rendering', 'Lookup tables and audio waveforms'],
    prerequisites: ['Java primitive types (int, double)', 'Variable declaration'],
    detailedExplanation: `In Java, arrays are objects stored on the heap. When you declare:
int[] arr = new int[5];
Java allocates memory for 5 consecutive integers (each 4 bytes, totaling 20 bytes). By default, all elements are zero-initialized.
Memory address formula: Address(arr[i]) = BaseAddress + (i * elementSize). This yields O(1) random access.`,
    javaImplementation: `public class ArrayBasics {
    public static void main(String[] args) {
        // Declaration and allocation
        int[] numbers = new int[5]; // defaults to {0, 0, 0, 0, 0}
        
        // Direct initialization with values
        int[] primes = {2, 3, 5, 7, 11};
        
        // Reading length and first/last elements
        System.out.println("Length: " + primes.length);
        System.out.println("First element: " + primes[0]);
        System.out.println("Last element: " + primes[primes.length - 1]);
    }
}`,
    lineByLineExplanation: [
      'Line 3: int[] numbers declares an array reference on the stack, new int[5] allocates 20 bytes on the heap.',
      'Line 6: Curly braces allow direct literal initialization with specific prime values.',
      'Line 9: numbers.length is a constant-time read-only field (not a method).',
      'Line 10-11: Zero-based indexing accesses indices 0 through length - 1.',
    ],
    dryRun: 'Array of size 5 allocated at BaseAddress 0x1000. Indices 0..4 each initialized to 0. Accessing primes[2] calculates 0x1000 + (2 * 4) = 0x1008, directly returning 5.',
    timeComplexity: 'Allocation: O(n) due to zeroing memory. Length read: O(1). Random access: O(1).',
    spaceComplexity: 'O(n) heap memory where n is the number of elements.',
    commonMistakes: ['ArrayIndexOutOfBoundsException: attempting to read arr[arr.length] instead of arr[arr.length - 1]', 'Assuming array length can be resized dynamically (Java arrays are strictly fixed size)'],
    examples: [
      { input: 'int[] arr = new int[4]', output: '[0, 0, 0, 0]', explanation: 'Four contiguous memory slots zero-initialized.' },
      { input: 'int[] arr = {10, 20, 30}', output: '[10, 20, 30]', explanation: 'Initialized directly with 3 integers.' },
    ],
    practiceQuestions: [
      'Declare and initialize an array of the first 10 Fibonacci numbers.',
      'What happens if you allocate new int[-1] in Java?',
    ],
    revisionNotes: 'Fixed size, contiguous memory, instant O(1) random access, zero-initialized by JVM.',
    visualizerType: 'array-declaration',
    presets: [
      { label: 'Size 5 (Default 0s)', values: [0, 0, 0, 0, 0] },
      { label: 'Initialized with Primes', values: [2, 3, 5, 7, 11] },
      { label: 'Ten Elements', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ],
  },

  {
    id: 'array-traversal',
    topicId: 'arrays',
    topicName: 'Arrays',
    name: 'Array Traversal & Scanning',
    category: 'basic',
    level: 'Beginner',
    intro: 'Traversal means visiting each element in the array sequentially from start to finish.',
    definition: 'Linear scan of all elements from index 0 to n - 1 to inspect, transform, or aggregate values.',
    importance: 'Most linear algorithms (finding maximum, computing sums, checking conditions) rely on clean array traversal.',
    realWorldApplications: ['Calculating total payroll from employee salaries', 'Scanning sensor readings for threshold alerts'],
    prerequisites: ['For-loops', 'Array indexing'],
    detailedExplanation: `In Java, traversal can be performed with standard index loops or enhanced for-each loops.
The index loop allows modifying elements in-place and knowing the current index. The enhanced for-each loop is cleaner for read-only scans.`,
    javaImplementation: `public class ArrayTraversal {
    public static int sumArray(int[] arr) {
        int total = 0;
        for (int i = 0; i < arr.length; i++) {
            total += arr[i]; // visit index i
        }
        return total;
    }
}`,
    lineByLineExplanation: [
      'Line 2: Accepts array parameter arr.',
      'Line 3: Accumulator initialized to 0.',
      'Line 4: Loop counter i iterates from 0 strictly less than arr.length.',
      'Line 5: Reads arr[i] in O(1) time and accumulates into total.',
    ],
    dryRun: 'For array [5, 10, 15]: i=0 (total=5), i=1 (total=15), i=2 (total=30). Loop exits at i=3.',
    timeComplexity: 'Time: O(n) visits all n elements once. Space: O(1) auxiliary.',
    spaceComplexity: 'O(1) extra space.',
    commonMistakes: ['Looping <= arr.length causing off-by-one boundary exception', 'Modifying loop variable i inside the body unpredictably'],
    examples: [
      { input: '[4, 8, 12, 16]', output: 'Sum: 50', explanation: 'Visits index 0 to 3, accumulating sum.' },
    ],
    practiceQuestions: ['Write a traversal to find the maximum value in an integer array.'],
    revisionNotes: 'Iterate 0 to length - 1. Time O(n), Space O(1).',
    visualizerType: 'array-traversal',
    presets: [
      { label: 'Sample [12, 45, 7, 23, 56]', values: [12, 45, 7, 23, 56] },
      { label: 'Ascending [1, 2, 3, 4, 5]', values: [1, 2, 3, 4, 5] },
    ],
  },

  {
    id: 'array-insertion',
    topicId: 'arrays',
    topicName: 'Arrays',
    name: 'Array Insertion & Shifting',
    category: 'basic',
    level: 'Beginner',
    intro: 'Inserting an element into a static array requires shifting subsequent elements to make room.',
    definition: 'Placing a new value at index k by shifting all elements from k to n - 1 one position to the right.',
    importance: 'Demonstrates why insertions into middle/start of arrays cost O(n) time, motivating data structures like Linked Lists.',
    realWorldApplications: ['Inserting a new high score into a ranked leaderboard', 'Priority queues implemented as sorted arrays'],
    prerequisites: ['Array traversal', 'Reverse loops'],
    detailedExplanation: `Because memory is contiguous, you cannot insert at index k without overwriting arr[k] unless you shift all items from the end backward:
arr[i + 1] = arr[i] for i = n - 1 down to k.
Only then can arr[k] be assigned the new value safely.`,
    javaImplementation: `public class ArrayInsertion {
    public static void insertAt(int[] arr, int size, int index, int value) {
        // Shift right from end to index
        for (int i = size - 1; i >= index; i--) {
            arr[i + 1] = arr[i];
        }
        arr[index] = value;
    }
}`,
    lineByLineExplanation: [
      'Line 4: Backward loop prevents overwriting elements before they are moved.',
      'Line 5: Moves element at i to i + 1.',
      'Line 7: Places new value into the freed slot at index.',
    ],
    dryRun: 'Array [10, 20, 30, 40, _], insert 25 at index 2: shift 40 to pos 4, 30 to pos 3. Now pos 2 is free. Write 25 at pos 2 -> [10, 20, 25, 30, 40].',
    timeComplexity: 'Best case: O(1) (insertion at end). Worst/Average: O(n) (shifting up to n elements).',
    spaceComplexity: 'O(1) in-place shifting.',
    commonMistakes: ['Shifting forward from left-to-right (overwrites all subsequent elements with the first shifted element!)', 'Forgetting that capacity must be pre-allocated.'],
    examples: [
      { input: 'arr = [1, 3, 4], insert 2 at index 1', output: '[1, 2, 3, 4]', explanation: 'Elements 3 and 4 shifted right; 2 placed at index 1.' },
    ],
    practiceQuestions: ['Implement dynamic array resizing when capacity is exhausted.'],
    revisionNotes: 'Shift from right to left, insert at index. Worst-case O(n) time.',
    visualizerType: 'array-insertion',
    presets: [
      { label: 'Insert 99 at index 2', values: [10, 20, 30, 40, 50], targetIndex: 2, insertValue: 99 },
      { label: 'Insert 5 at index 0 (Head)', values: [10, 20, 30], targetIndex: 0, insertValue: 5 },
    ],
  },

  {
    id: 'array-deletion',
    topicId: 'arrays',
    topicName: 'Arrays',
    name: 'Array Deletion & Left Shifting',
    category: 'basic',
    level: 'Beginner',
    intro: 'Deleting an element from an array requires shifting elements to the left to close the gap.',
    definition: 'Removing element at index k by copying element k + 1 into k, k + 2 into k + 1, and so on.',
    importance: 'Shows the symmetric O(n) cost of array deletions and why maintaining contiguous order has computational overhead.',
    realWorldApplications: ['Removing a cancelled task from a queue array', 'Deleting a contact from an address book list'],
    prerequisites: ['Array indexing', 'For-loops'],
    detailedExplanation: `When removing the element at index k, a gap is left. To maintain contiguous indexing:
for i = k to size - 2: arr[i] = arr[i + 1].
The effective size is decremented by 1.`,
    javaImplementation: `public class ArrayDeletion {
    public static void deleteAt(int[] arr, int size, int index) {
        for (int i = index; i < size - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr[size - 1] = 0; // clear last slot
    }
}`,
    lineByLineExplanation: [
      'Line 3: Loops forward starting from the deleted index.',
      'Line 4: Shifts each element left by copying arr[i + 1] into arr[i].',
      'Line 6: Clears trailing slot.',
    ],
    dryRun: 'Array [10, 20, 30, 40], delete index 1 (value 20): arr[1]=arr[2](30), arr[2]=arr[3](40). Result: [10, 30, 40, 0].',
    timeComplexity: 'Best: O(1) (deleting last element). Worst/Average: O(n).',
    spaceComplexity: 'O(1) in-place.',
    commonMistakes: ['Not updating effective logical size after deletion', 'Shifting out of bounds at size - 1'],
    examples: [
      { input: 'arr = [5, 10, 15, 20], delete index 2', output: '[5, 10, 20, 0]', explanation: '15 is deleted, 20 shifts left.' },
    ],
    practiceQuestions: ['Delete all occurrences of a target value in an array in O(n) time and O(1) space.'],
    revisionNotes: 'Shift from left to right starting at index. O(n) time.',
    visualizerType: 'array-deletion',
    presets: [
      { label: 'Delete index 2 (value 30)', values: [10, 20, 30, 40, 50], targetIndex: 2 },
      { label: 'Delete index 0 (First element)', values: [99, 1, 2, 3], targetIndex: 0 },
    ],
  },

  {
    id: 'array-reversal',
    topicId: 'arrays',
    topicName: 'Arrays',
    name: 'Array Reversal (Two Pointers)',
    category: 'basic',
    level: 'Beginner',
    intro: 'Reversing an array in-place swaps opposing elements until pointers meet at the center.',
    definition: 'In-place symmetrical swap using left pointer starting at 0 and right pointer starting at n - 1.',
    importance: 'The fundamental paradigm for Two Pointers techniques, used in palindrome checks, string reversals, and array rotations.',
    realWorldApplications: ['Undo operation history reversal', 'Signal processing reflection', 'Byte order endianness swapping'],
    prerequisites: ['Two pointers', 'Swapping technique'],
    detailedExplanation: `Initialize left = 0, right = arr.length - 1. While left < right:
1. Swap arr[left] and arr[right].
2. Increment left, decrement right.
This performs exactly n / 2 swaps.`,
    javaImplementation: `public class ArrayReversal {
    public static void reverse(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}`,
    lineByLineExplanation: [
      'Line 3: left at start (0), right at end (length - 1).',
      'Line 4: Continues until pointers cross at middle.',
      'Line 5-7: Standard 3-step swap using temp variable.',
      'Line 8-9: Advance left, retreat right.',
    ],
    dryRun: 'Array [1, 2, 3, 4, 5]: swap 1 & 5 -> [5, 2, 3, 4, 1]. left=1, right=3: swap 2 & 4 -> [5, 4, 3, 2, 1]. left=2, right=2: terminates.',
    timeComplexity: 'O(n) time (n/2 iterations).',
    spaceComplexity: 'O(1) extra space (in-place).',
    commonMistakes: ['Looping <= arr.length/2 with wrong indexing', 'Swapping back to original if loop condition is left < arr.length instead of left < right'],
    examples: [
      { input: '[10, 20, 30, 40]', output: '[40, 30, 20, 10]', explanation: 'Opposing elements swapped.' },
    ],
    practiceQuestions: ['Rotate an array right by k steps using 3 reversals.'],
    revisionNotes: 'Two pointers inwards, swap arr[left] and arr[right]. O(n) time, O(1) space.',
    visualizerType: 'array-reversal',
    presets: [
      { label: 'Odd Length [1, 2, 3, 4, 5]', values: [1, 2, 3, 4, 5] },
      { label: 'Even Length [10, 20, 30, 40]', values: [10, 20, 30, 40] },
    ],
  },

  // --- SEARCHING ---
  {
    id: 'binary-search-core',
    topicId: 'searching',
    topicName: 'Searching',
    name: 'Binary Search (Search Space & Mid)',
    category: 'basic',
    level: 'Beginner / Intermediate',
    intro: 'Binary search finds a target in a sorted array in logarithmic O(log n) time by halving search space.',
    definition: 'Divide-and-conquer algorithm comparing target against middle element, discarding half of search space each step.',
    importance: 'The gold standard for efficient searching. Unlocks binary search on answer, lower/upper bounds, and median algorithms.',
    realWorldApplications: ['Database B-tree indexing', 'Git bisect finding faulty commit', 'Dictionary word lookup'],
    prerequisites: ['Sorted array', 'Integer division'],
    detailedExplanation: `Set low = 0, high = n - 1. Calculate mid = low + (high - low) / 2 to avoid integer overflow.
- If arr[mid] == target: found!
- If arr[mid] < target: target must be in right half (low = mid + 1).
- If arr[mid] > target: target must be in left half (high = mid - 1).`,
    javaImplementation: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2; // Prevents overflow
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1; // Not found
    }
}`,
    lineByLineExplanation: [
      'Line 3: Search space spans index low to high.',
      'Line 5: (low + high) / 2 can overflow int if sum > 2^31 - 1; low + (high - low) / 2 is safe.',
      'Line 6: Found target at index mid.',
      'Line 7: Discard left half including mid.',
      'Line 8: Discard right half including mid.',
    ],
    dryRun: 'Array [-1, 0, 3, 5, 9, 12], target 9: low=0, high=5, mid=2 (arr[2]=3 < 9) -> low=3. low=3, high=5, mid=4 (arr[4]=9 == 9) -> return 4.',
    timeComplexity: 'Best: O(1). Worst/Average: O(log n). Halves search space each iteration.',
    spaceComplexity: 'O(1) iterative extra space.',
    commonMistakes: ['Using (low + high) / 2 causing integer overflow on large arrays', 'Writing low < high instead of low <= high (misses single-element search space)'],
    examples: [
      { input: 'arr = [2, 5, 8, 12, 16], target = 12', output: 'Index 3', explanation: 'Found in 2 comparisons.' },
    ],
    practiceQuestions: ['Find the first occurrence of an element in a sorted array with duplicates.'],
    revisionNotes: 'Must be sorted. Halve search space with mid. O(log n) time.',
    visualizerType: 'binary-search',
    presets: [
      { label: 'Target 9 in [-1, 0, 3, 5, 9, 12]', values: [-1, 0, 3, 5, 9, 12], target: 9 },
      { label: 'Target 16 in [2, 4, 6, 8, 10, 12, 14, 16]', values: [2, 4, 6, 8, 10, 12, 14, 16], target: 16 },
      { label: 'Target 7 (Not present)', values: [1, 3, 5, 8, 10], target: 7 },
    ],
  },

  // --- TWO POINTERS ---
  {
    id: 'two-pointers-opposite',
    topicId: 'two-pointers',
    topicName: 'Two Pointers',
    name: 'Two Pointers (Opposite Direction)',
    category: 'basic',
    level: 'Beginner / Intermediate',
    intro: 'Two pointers move toward each other from opposite ends of a sorted array to find pairs matching conditions in O(n) time.',
    definition: 'Left pointer moves rightward, right pointer moves leftward based on monotonic sum or comparison property.',
    importance: 'Reduces O(n^2) nested loop pair searching down to linear O(n) time without hash table memory overhead.',
    realWorldApplications: ['Two Sum in sorted lists', 'Container With Most Water', 'Trapping Rain Water'],
    prerequisites: ['Sorted arrays', 'Monotonicity'],
    detailedExplanation: `In a sorted array, if sum = arr[left] + arr[right]:
- If sum == target: pair found!
- If sum < target: to increase sum, increment left.
- If sum > target: to decrease sum, decrement right.`,
    javaImplementation: `public class TwoSumSorted {
    public static int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1}; // 1-based
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{-1, -1};
    }
}`,
    lineByLineExplanation: [
      'Line 3: Pointers placed at opposite boundaries of the sorted array.',
      'Line 5: Calculate sum of current pair.',
      'Line 6: Match found.',
      'Line 7: Sum too small, move left pointer right to increase value.',
      'Line 8: Sum too large, move right pointer left to decrease value.',
    ],
    dryRun: 'Numbers [2, 7, 11, 15], target 9: left=0(2), right=3(15) sum=17 > 9 -> right=2. left=0(2), right=2(11) sum=13 > 9 -> right=1. left=0(2), right=1(7) sum=9 == target -> return [1, 2].',
    timeComplexity: 'O(n) time, each element examined at most once.',
    spaceComplexity: 'O(1) extra space.',
    commonMistakes: ['Applying two pointers on unsorted array without sorting first', 'Incrementing right or decrementing left in reverse direction'],
    examples: [
      { input: '[1, 2, 4, 6, 10], target = 8', output: '[2, 4]', explanation: 'Indices 2 and 4 (values 2 and 6) sum to 8.' },
    ],
    practiceQuestions: ['3Sum: find all unique triplets in array that sum to zero.'],
    revisionNotes: 'Sorted array. Left goes right, right goes left. O(n) time, O(1) space.',
    visualizerType: 'two-pointers',
    presets: [
      { label: 'Target 9 in [2, 7, 11, 15]', values: [2, 7, 11, 15], target: 9 },
      { label: 'Target 14 in [1, 3, 5, 7, 9, 11]', values: [1, 3, 5, 7, 9, 11], target: 14 },
    ],
  },

  // --- SLIDING WINDOW ---
  {
    id: 'sliding-window-fixed',
    topicId: 'sliding-window',
    topicName: 'Sliding Window',
    name: 'Fixed-Size Sliding Window',
    category: 'basic',
    level: 'Intermediate',
    intro: 'Maintains a window of fixed size k, adding the incoming element and subtracting the outgoing element in O(1) time per step.',
    definition: 'Continuous subarray tracking of length k where sliding the window costs O(1) instead of recalculating O(k).',
    importance: 'Turns O(n * k) subarray brute force into an optimal O(n) linear scan.',
    realWorldApplications: ['Moving average in financial stock tickers', 'Packet throughput rate limiting', 'Audio signal convolution'],
    prerequisites: ['Arrays', 'Prefix sum intuition'],
    detailedExplanation: `1. Calculate the sum of the first k elements.
2. For i from k to n - 1:
   sum = sum + arr[i] (add incoming) - arr[i - k] (remove outgoing).
   Track the maximum sum observed.`,
    javaImplementation: `public class MaxSubarraySum {
    public static int maxSum(int[] arr, int k) {
        if (arr.length < k) return 0;
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += arr[i];
        int maxSum = windowSum;
        for (int i = k; i < arr.length; i++) {
            windowSum += arr[i] - arr[i - k]; // Slide window in O(1)
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum;
    }
}`,
    lineByLineExplanation: [
      'Line 4-5: Compute initial window sum for indices 0 to k - 1.',
      'Line 7: Slide right by one element at a time.',
      'Line 8: Add new element arr[i] entering on right, drop arr[i - k] leaving on left.',
    ],
    dryRun: 'Array [2, 1, 5, 1, 3, 2], k = 3: initial window [2, 1, 5] sum=8. Next [1, 5, 1] sum=7. Next [5, 1, 3] sum=9 (max=9). Next [1, 3, 2] sum=6. Return 9.',
    timeComplexity: 'O(n) time linear pass.',
    spaceComplexity: 'O(1) constant extra memory.',
    commonMistakes: ['Recalculating window sum from scratch with nested loop', 'Off-by-one error on the outgoing element index (i - k)'],
    examples: [
      { input: 'arr = [1, 4, 2, 10, 23, 3, 1, 0, 20], k = 4', output: '39', explanation: 'Window [4, 2, 10, 23] has max sum 39.' },
    ],
    practiceQuestions: ['Find maximum number of vowels in a substring of given length k.'],
    revisionNotes: 'Fixed size k. Add right, subtract left. O(n) time, O(1) space.',
    visualizerType: 'sliding-window',
    presets: [
      { label: 'Window size 3 in [2, 1, 5, 1, 3, 2]', values: [2, 1, 5, 1, 3, 2], k: 3 },
      { label: 'Window size 4 in [1, 4, 2, 10, 23, 3, 1]', values: [1, 4, 2, 10, 23, 3, 1], k: 4 },
    ],
  },

  // --- LINKED LISTS ---
  {
    id: 'linked-list-structure',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    name: 'Linked List Node Structure & Traversal',
    category: 'basic',
    level: 'Beginner',
    intro: 'A singly linked list is a linear collection of data nodes linked by pointers rather than stored contiguously.',
    definition: 'Dynamic node structure containing data and a reference (next) to the following node, ending at null.',
    importance: 'Allows O(1) insertions and deletions at known positions without memory shifting, unlike static arrays.',
    realWorldApplications: ['Undo/Redo functionality in text editors', 'Browser back/forward navigation history', 'Memory block free lists in OS allocators'],
    prerequisites: ['Java references and objects'],
    detailedExplanation: `Each node object has two fields:
int val;
ListNode next;
To traverse, start at head: while (curr != null) { visit(curr); curr = curr.next; }`,
    javaImplementation: `public class LinkedListDemo {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }
    public static void printList(ListNode head) {
        ListNode curr = head;
        while (curr != null) {
            System.out.print(curr.val + " -> ");
            curr = curr.next;
        }
        System.out.println("null");
    }
}`,
    lineByLineExplanation: [
      'Line 2-5: Node definition with integer value and recursive next reference.',
      'Line 7: Start temporary pointer at head.',
      'Line 8: Loop runs until curr hits null (end of list).',
      'Line 10: Advance pointer using curr = curr.next.',
    ],
    dryRun: 'Nodes: [10|•] -> [20|•] -> [30|null]. curr starts at 10, advances to 20, advances to 30, advances to null, loop terminates.',
    timeComplexity: 'Traversal: O(n). Access by index: O(n) (no random access). Insertion/Deletion at head: O(1).',
    spaceComplexity: 'O(n) for node allocations + pointers.',
    commonMistakes: ['Losing reference to the rest of list by overwriting head or next prematurely', 'NullPointerException when accessing curr.next on a null reference'],
    examples: [
      { input: '1 -> 2 -> 3 -> null', output: 'Length: 3', explanation: 'Visits 1, 2, 3 in order.' },
    ],
    practiceQuestions: ['Find the middle node of a linked list using slow and fast pointers.'],
    revisionNotes: 'Non-contiguous memory, pointer based. O(n) access, O(1) head insertion.',
    visualizerType: 'linked-list',
    presets: [
      { label: '3 Nodes [10 -> 20 -> 30]', values: [10, 20, 30] },
      { label: '5 Nodes [1 -> 2 -> 3 -> 4 -> 5]', values: [1, 2, 3, 4, 5] },
    ],
  },

  {
    id: 'linked-list-reversal',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    name: 'Linked List Reversal',
    category: 'basic',
    level: 'Intermediate',
    intro: 'Reversing a singly linked list in-place by turning each next pointer backwards toward its predecessor.',
    definition: 'In-place pointer redirection using three pointers: prev, curr, and nextNode.',
    importance: 'A mandatory interview question and building block for palindrome lists and reverse in k-groups.',
    realWorldApplications: ['Reversing evaluation pipelines', 'Topological reverse order processing'],
    prerequisites: ['Linked list structure', 'Pointer manipulation'],
    detailedExplanation: `Set prev = null, curr = head.
While curr != null:
1. nextNode = curr.next (save forward link)
2. curr.next = prev (redirect link backward)
3. prev = curr (advance prev)
4. curr = nextNode (advance curr)
Return prev as new head.`,
    javaImplementation: `public class ReverseList {
    public static ListNode reverse(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextNode = curr.next; // save next
            curr.next = prev;              // reverse pointer
            prev = curr;                   // step prev
            curr = nextNode;               // step curr
        }
        return prev; // new head
    }
}`,
    lineByLineExplanation: [
      'Line 3: prev starts at null so the old head points to null as the new tail.',
      'Line 6: Critical: save nextNode before severing the link in line 7.',
      'Line 7: Redirect curr.next backward to prev.',
      'Line 8-9: Move both pointers forward by one node.',
      'Line 11: prev now references the former tail, which is the new head.',
    ],
    dryRun: 'List 1 -> 2 -> 3 -> null. Step 1: 1->null, prev=1. Step 2: 2->1->null, prev=2. Step 3: 3->2->1->null, prev=3. curr=null -> return 3.',
    timeComplexity: 'O(n) single pass.',
    spaceComplexity: 'O(1) in-place pointers.',
    commonMistakes: ['Forgetting to store curr.next before modifying curr.next, losing the remaining list forever', 'Returning curr instead of prev (curr is null at end)'],
    examples: [
      { input: '1 -> 2 -> 3 -> null', output: '3 -> 2 -> 1 -> null', explanation: 'All pointers reversed.' },
    ],
    practiceQuestions: ['Reverse a linked list between left and right position.'],
    revisionNotes: 'Three pointers: prev, curr, nextNode. O(n) time, O(1) space.',
    visualizerType: 'linked-list-reversal',
    presets: [
      { label: 'List [1 -> 2 -> 3 -> 4]', values: [1, 2, 3, 4] },
      { label: 'List [10 -> 20 -> 30]', values: [10, 20, 30] },
    ],
  },

  // --- STACKS & QUEUES ---
  {
    id: 'stack-operations',
    topicId: 'stacks',
    topicName: 'Stacks',
    name: 'Stack Push, Pop & LIFO Behavior',
    category: 'basic',
    level: 'Beginner',
    intro: 'A stack is a Last-In, First-Out (LIFO) linear data structure where elements are added and removed from the same end.',
    definition: 'LIFO structure providing O(1) push (insert onto top), pop (remove from top), and peek (inspect top).',
    importance: 'The fundamental engine behind the call stack in recursion, expression evaluation, syntax parsing, and browser back buttons.',
    realWorldApplications: ['Call stack in the JVM runtime', 'Syntax validation in compilers (matching parentheses)', 'Undo operation in graphic editors'],
    prerequisites: ['Arrays or Linked lists'],
    detailedExplanation: `In Java, you can use java.util.ArrayDeque or java.util.Stack for stack operations.
push(x): places x on top.
pop(): removes and returns top element. Throws EmptyStackException if empty.
peek(): returns top element without removing it.`,
    javaImplementation: `import java.util.ArrayDeque;
import java.util.Deque;

public class StackDemo {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        
        System.out.println("Top element: " + stack.peek()); // 30
        System.out.println("Popped: " + stack.pop());       // removes 30
        System.out.println("New top: " + stack.peek());     // 20
    }
}`,
    lineByLineExplanation: [
      'Line 5: ArrayDeque is preferred over legacy Vector-based Stack class in Java.',
      'Line 6-8: Pushing 10, then 20, then 30 places 30 at top of stack.',
      'Line 10: peek() returns 30 without mutation.',
      'Line 11: pop() removes 30, exposing 20 as new top.',
    ],
    dryRun: 'Push 10 -> [10]. Push 20 -> [10, 20]. Push 30 -> [10, 20, 30]. Pop -> returns 30, stack is [10, 20].',
    timeComplexity: 'Push: O(1). Pop: O(1). Peek: O(1).',
    spaceComplexity: 'O(n) for n elements.',
    commonMistakes: ['Calling pop() or peek() on an empty stack without checking isEmpty() first', 'Using legacy java.util.Stack in multi-threaded code without realizing synchronized lock overhead'],
    examples: [
      { input: 'push(5), push(8), pop()', output: 'Returns 8', explanation: '8 was pushed last, so it pops first (LIFO).' },
    ],
    practiceQuestions: ['Implement a MinStack that retrieves the minimum element in O(1) time.'],
    revisionNotes: 'LIFO. All core operations O(1). Use ArrayDeque.',
    visualizerType: 'stack',
    presets: [
      { label: 'Push 10, 20, 30 then Pop', actions: ['push:10', 'push:20', 'push:30', 'pop', 'push:40'] },
      { label: 'Call Stack Simulation', actions: ['push:main()', 'push:foo()', 'push:bar()', 'pop', 'pop'] },
    ],
  },

  {
    id: 'queue-operations',
    topicId: 'queues',
    topicName: 'Queues',
    name: 'Queue Enqueue, Dequeue & FIFO Behavior',
    category: 'basic',
    level: 'Beginner',
    intro: 'A queue is a First-In, First-Out (FIFO) data structure where elements enter at the rear and exit from the front.',
    definition: 'FIFO structure with enqueue (offer at rear) and dequeue (poll from front) in O(1) time.',
    importance: 'Essential for breadth-first search (BFS), job scheduling, message brokers, and print queues.',
    realWorldApplications: ['Breadth-First Search (BFS) in trees and graphs', 'Printer queue spooler', 'Kafka/RabbitMQ message streaming'],
    prerequisites: ['Linked lists or circular arrays'],
    detailedExplanation: `In Java, java.util.Queue is an interface typically backed by LinkedList or ArrayDeque:
offer(e): inserts at rear.
poll(): retrieves and removes from front (returns null if empty).
peek(): inspects front without removing.`,
    javaImplementation: `import java.util.LinkedList;
import java.util.Queue;

public class QueueDemo {
    public static void main(String[] args) {
        Queue<String> queue = new LinkedList<>();
        queue.offer("Customer A");
        queue.offer("Customer B");
        queue.offer("Customer C");
        
        System.out.println("Serving: " + queue.poll()); // Customer A
        System.out.println("Next in line: " + queue.peek()); // Customer B
    }
}`,
    lineByLineExplanation: [
      'Line 5: Queue interface implemented using LinkedList.',
      'Line 6-8: Customers arrive in order A, B, C.',
      'Line 10: poll() removes Customer A first because Customer A arrived first.',
      'Line 11: Customer B is now at the front of the line.',
    ],
    dryRun: 'offer(A) -> [A]. offer(B) -> [A, B]. offer(C) -> [A, B, C]. poll() -> returns A, queue becomes [B, C].',
    timeComplexity: 'Offer: O(1). Poll: O(1). Peek: O(1).',
    spaceComplexity: 'O(n) for n elements.',
    commonMistakes: ['Using remove() instead of poll() which throws exception on empty queue', 'Confusing front and rear pointers in custom array queue'],
    examples: [
      { input: 'offer(1), offer(2), poll()', output: 'Returns 1', explanation: 'First element in is first element out (FIFO).' },
    ],
    practiceQuestions: ['Implement a Queue using two Stacks.'],
    revisionNotes: 'FIFO. Enqueue rear, dequeue front. O(1) operations.',
    visualizerType: 'queue',
    presets: [
      { label: 'Enqueue 1, 2, 3 then Dequeue', actions: ['offer:1', 'offer:2', 'offer:3', 'poll', 'offer:4'] },
      { label: 'BFS Queue Simulation', actions: ['offer:Node1', 'offer:Node2', 'poll', 'offer:Node3', 'offer:Node4'] },
    ],
  },

  // --- RECURSION & BACKTRACKING ---
  {
    id: 'recursion-callstack',
    topicId: 'recursion',
    topicName: 'Recursion',
    name: 'Recursive Call Stack & Base Cases',
    category: 'basic',
    level: 'Beginner / Intermediate',
    intro: 'Recursion is a programming technique where a method calls itself to solve smaller instances of the same problem.',
    definition: 'Function defined in terms of itself, terminating at base cases to avoid infinite call stack overflow.',
    importance: 'The foundation for tree traversals, divide and conquer, dynamic programming, and graph DFS.',
    realWorldApplications: ['DOM tree parsing in web browsers', 'File system directory walk', 'JSON / XML nested parsing'],
    prerequisites: ['Call stack', 'Functions and methods'],
    detailedExplanation: `Every recursive method must have:
1. Base Case: stops recursion and returns directly without further calls.
2. Recursive Step: breaks problem into smaller subproblems and calls itself.
Each call pushes a frame onto JVM stack with its own parameters and local variables.`,
    javaImplementation: `public class FactorialRecursion {
    public static long factorial(int n) {
        // Base case
        if (n <= 1) return 1;
        // Recursive step
        return n * factorial(n - 1);
    }
}`,
    lineByLineExplanation: [
      'Line 4: Base case stops when n reaches 1 or 0, preventing stack overflow.',
      'Line 6: Method calls factorial(n - 1), waiting for result to multiply with n.',
    ],
    dryRun: 'factorial(3): calls fact(2) -> calls fact(1). fact(1) returns 1. fact(2) calculates 2 * 1 = 2. fact(3) calculates 3 * 2 = 6. Result: 6.',
    timeComplexity: 'O(n) time, n stack frames created.',
    spaceComplexity: 'O(n) space on JVM call stack.',
    commonMistakes: ['Missing base case causing StackOverflowError', 'Incorrect reduction step where parameter does not converge toward base case'],
    examples: [
      { input: 'n = 4', output: '24', explanation: '4 * 3 * 2 * 1 = 24.' },
    ],
    practiceQuestions: ['Implement Fibonacci with recursion and analyze its call tree.'],
    revisionNotes: 'Base case + reduction step. Uses JVM stack. O(n) space.',
    visualizerType: 'recursion',
    presets: [
      { label: 'Factorial(4)', n: 4, type: 'factorial' },
      { label: 'Fibonacci(4)', n: 4, type: 'fibonacci' },
    ],
  },

  // --- TREES & BST ---
  {
    id: 'tree-traversals',
    topicId: 'trees',
    topicName: 'Trees',
    name: 'Binary Tree Traversals (Inorder, Preorder, Postorder)',
    category: 'intermediate',
    level: 'Intermediate',
    intro: 'Tree traversal visits every node in a hierarchical binary tree in a systematic order.',
    definition: 'Depth-first traversals: Preorder (Root, Left, Right), Inorder (Left, Root, Right), Postorder (Left, Right, Root).',
    importance: 'Inorder traversal of a Binary Search Tree (BST) visits nodes in strictly ascending sorted order!',
    realWorldApplications: ['Compilers evaluating syntax expression trees', 'Rendering hierarchical UI component trees', 'Database query execution trees'],
    prerequisites: ['Recursion', 'Tree node structures'],
    detailedExplanation: `For any subtree at root:
- Preorder: Visit root, traverse left, traverse right. (Used for copying/serializing trees).
- Inorder: Traverse left, visit root, traverse right. (Yields sorted order in BST).
- Postorder: Traverse left, traverse right, visit root. (Used for deleting/freeing trees and bottom-up calculations like tree height).`,
    javaImplementation: `public class TreeTraversals {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }
    public static void inorder(TreeNode root) {
        if (root == null) return;
        inorder(root.left);
        System.out.print(root.val + " ");
        inorder(root.right);
    }
}`,
    lineByLineExplanation: [
      'Line 7: Base case: null node returns immediately.',
      'Line 8: Recurse fully on left child subtree.',
      'Line 9: Visit current root node value.',
      'Line 10: Recurse fully on right child subtree.',
    ],
    dryRun: 'Tree root 2, left 1, right 3: inorder calls left(1) -> prints 1. Visits root -> prints 2. Calls right(3) -> prints 3. Output: 1 2 3.',
    timeComplexity: 'O(n) time visits every node once.',
    spaceComplexity: 'O(h) space where h is tree height (O(log n) balanced, O(n) skewed).',
    commonMistakes: ['Forgetting null check at start of recursive traversal', 'Confusing preorder and postorder visit timings'],
    examples: [
      { input: 'BST: root 4, left 2, right 5', output: 'Inorder: 2, 4, 5', explanation: 'Sorted order.' },
    ],
    practiceQuestions: ['Implement Level-Order (BFS) traversal using a Queue.'],
    revisionNotes: 'Inorder (L-Root-R), Preorder (Root-L-R), Postorder (L-R-Root). Inorder of BST is sorted.',
    visualizerType: 'tree-traversal',
    presets: [
      { label: 'BST [4, 2, 6, 1, 3, 5, 7]', values: [4, 2, 6, 1, 3, 5, 7] },
      { label: 'Simple Tree [1, 2, 3]', values: [1, 2, 3] },
    ],
  },

  // --- DYNAMIC PROGRAMMING ---
  {
    id: 'dp-memoization-tabulation',
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    name: 'DP: Overlapping Subproblems & Tabulation',
    category: 'advanced',
    level: 'Intermediate / Advanced',
    intro: 'Dynamic Programming solves complex problems by breaking them down into overlapping subproblems and storing results to avoid recomputation.',
    definition: 'Optimization over plain recursion through Memoization (top-down cache) or Tabulation (bottom-up table).',
    importance: 'Transforms exponential O(2^n) recursion into polynomial O(n) or O(n * k) linear solutions.',
    realWorldApplications: ['GPS shortest route computation', 'Diff tools comparing git file revisions', 'Resource allocation and financial portfolio optimization'],
    prerequisites: ['Recursion', 'Arrays'],
    detailedExplanation: `Two key properties required:
1. Optimal Substructure: optimal solution to problem contains optimal solutions to subproblems.
2. Overlapping Subproblems: same subproblems are solved repeatedly in naive recursion.
Bottom-up Tabulation constructs an array dp[]:
dp[i] represents solution for subproblem of size i. State transition: dp[i] = dp[i-1] + dp[i-2].`,
    javaImplementation: `public class ClimbingStairsDP {
    public static int climbStairs(int n) {
        if (n <= 2) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2]; // State transition
        }
        return dp[n];
    }
}`,
    lineByLineExplanation: [
      'Line 3: Base cases for 1 step (1 way) and 2 steps (2 ways).',
      'Line 4: dp table of size n + 1 holds subproblem answers.',
      'Line 7: State transition computes dp[i] from already solved dp[i-1] and dp[i-2].',
      'Line 9: Returns the optimal answer for n.',
    ],
    dryRun: 'For n = 5: dp[1]=1, dp[2]=2. dp[3] = 1+2 = 3. dp[4] = 2+3 = 5. dp[5] = 3+5 = 8. Output: 8 ways.',
    timeComplexity: 'Time: O(n) single loop. (Versus O(2^n) naive recursion).',
    spaceComplexity: 'O(n) for dp table, optimizable to O(1) using two variables.',
    commonMistakes: ['Incorrect base case initialization in DP array', 'Off-by-one table size (using new int[n] instead of new int[n + 1])'],
    examples: [
      { input: 'n = 4', output: '5 ways', explanation: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2.' },
    ],
    practiceQuestions: ['Solve Coin Change problem: minimum coins needed to make amount.'],
    revisionNotes: 'Overlapping subproblems + optimal substructure. Bottom-up table O(n) time.',
    visualizerType: 'dp-table',
    presets: [
      { label: 'Climbing Stairs (n = 6)', n: 6 },
      { label: 'Coin Change [1, 2, 5] Amount = 7', coins: [1, 2, 5], amount: 7 },
    ],
  },
]
