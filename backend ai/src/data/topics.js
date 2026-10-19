import { assignmentExtensions } from './assignment-extensions.js'

const defaultLearningSequence = [
  { type: 'prerequisites', title: 'Prerequisites', description: 'Review the required foundations and confirm the learner is ready for the topic.' },
  { type: 'concept', title: 'Concept explanation', description: 'Explain the key idea in simple terms and relate it to the learner’s current level.' },
  { type: 'worked-example', title: 'Worked example and dry run', description: 'Walk through one example step by step to show the algorithm or data structure in action.' },
  { type: 'key-patterns', title: 'Key patterns', description: 'Highlight recognition clues, invariants, and common structure-based patterns.' },
  { type: 'reference-notes', title: 'Reference notes', description: 'Summarize important definitions, pitfalls, and complexity observations.' },
  { type: 'guided-practice', title: 'Guided practice', description: 'Solve one coached exercise with hints before the learner writes a full solution.' },
  { type: 'assignment', title: 'Assignment', description: 'Give the learner a small set of independent problems to solve on their own.' },
  { type: 'mastery-check', title: 'Mastery check', description: 'Confirm understanding through explanation, code review, or a short quiz.' },
  { type: 'revision', title: 'Revision or next topic', description: 'Review weak points and decide whether to revise the topic or move forward.' },
]

function buildTopicMetadata(topic, overrides = {}) {
  const assignments = (overrides.assignments || topic.assignments || []).map((assignment) => ({
    ...assignment,
    language: assignment.language || 'Java',
    edgeCases: [...(assignment.edgeCases || topic.edgeCases || [])],
  }))

  return {
    ...topic,
    ...overrides,
    assignments,
    examples: topic.examples || (Array.isArray(topic.assignments)
      ? topic.assignments.flatMap((assignment) => assignment.examples || [])
      : []),
    learningSequence: defaultLearningSequence.map((step) => ({
      ...step,
      id: `${topic.id}-${step.type}`,
    })),
    progressionRules: {
      allowSkip: true,
      requiresMastery: topic.prerequisites,
      masteryThreshold: 0.7,
    },
  }
}

const topicContent = {
  'programming-fundamentals': {
    learningObjectives: [
      'Write clear variables, loops, conditionals and functions in Java.',
      'Trace program execution and explain how values change across each instruction.',
      'Debug small logic errors by testing edge cases and reviewing control flow.',
    ],
    keyConcepts: ['variables', 'data types', 'loops', 'conditions', 'functions', 'scope', 'debugging'],
    lessonSections: [
      {
        title: 'Variables, values and control flow',
        explanation: 'A program is built from values stored in variables and decisions that decide which statements run. Start with one variable at a time and trace the state after each step.',
      },
      {
        title: 'Loops and functions',
        explanation: 'Loops repeat work without rewriting code, and functions break a task into reusable blocks. A function should do one clear job and return or update values predictably.',
      },
    ],
    workedExample: {
      title: 'Tracing a sum loop',
      steps: [
        'Start with total = 0.',
        'For each number in the list, add it to total.',
        'Keep the running total in sync with the loop index.',
        'After the loop, print the final total.',
      ],
      dryRun: 'For numbers [3, 5, 7], the total becomes 0 → 3 → 8 → 15.',
    },
    referenceNotes: [
      'Understand the difference between assignment and comparison operators.',
      'Write small examples first when you are unsure about loop boundaries or function returns.',
      'A function should be testable with a few inputs before you trust the implementation.',
    ],
    referenceLinks: [
      { label: 'Java Tutorials: Control Flow', url: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html', kind: 'optional' },
      { label: 'Java Tutorials: Classes and Objects', url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/index.html', kind: 'optional' },
    ],
    commonMistakes: ['Off-by-one loop errors', 'Using = instead of == in conditions', 'Changing loop variable in the wrong place', 'Forgetting to initialize accumulator variables'],
    edgeCases: ['Empty input', 'Single element', 'Negative numbers', 'Largest or smallest value appearing at the start or end'],
    complexityNote: 'Most beginner logic runs in O(n) time when you scan a list once, and O(1) extra space if you only store a few variables.',
    guidedPractice: [
      { question: 'Given an array of numbers, write a loop that finds the maximum value and explain the invariant you maintain.', hint: 'Keep a current maximum and compare every new number to it. If the new value is larger, replace the current maximum.' },
    ],
    assignments: [{
      id: 'pf-assignment-1',
      title: 'Sum of values with a loop',
      difficulty: 'beginner',
      description: 'Write a Java function that sums all values in an integer array and returns the total.',
      constraints: ['0 <= n <= 10^5', 'Values can be negative', 'Use a loop and avoid hardcoded answers'],
      examples: [{ input: '[3, 5, 7]', output: '15', explanation: 'The function adds each value in sequence.' }],
      learningObjectives: ['Use loops correctly', 'Track running totals accurately'],
      hints: ['Start with total = 0', 'Add each number to total inside the loop'],
      expectedComplexity: 'Time O(n), space O(1)',
      referenceSolution: 'Initialize a running sum and add each array element in a single pass.',
    }],
    quizzes: [{
      id: 'pf-quiz-1',
      questions: [
        { question: 'What is the main purpose of a function?', options: ['To store one variable forever', 'To group reusable logic', 'To print only once'], correctAnswer: 'To group reusable logic', explanation: 'Functions help us reuse logic and keep code understandable.' },
      ],
      answerKey: ['To group reusable logic'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  arrays: {
    learningObjectives: [
      'Explain how arrays store values by index and why they are random access structures.',
      'Iterate through arrays using loops and maintain correct boundaries.',
      'Recognize when array scanning, prefix/suffix logic, or two pointers is the right tool.',
    ],
    keyConcepts: ['indexing', 'length', 'contiguous memory', 'random access', 'iteration', 'in-place updates'],
    lessonSections: [
      {
        title: 'What arrays are',
        explanation: 'An array stores multiple values in a fixed-length sequence. Each element has an index, so reading a value by index is very fast.',
      },
      {
        title: 'Traversal and update patterns',
        explanation: 'Most array problems are solved by scanning all elements, updating a running value, or comparing a current item with the next one. Pay attention to bounds and how indices change.',
      },
    ],
    workedExample: {
      title: 'Finding the maximum value',
      steps: [
        'Set currentMax to the first element.',
        'Visit each element from left to right.',
        'If the current element is greater than currentMax, update currentMax.',
        'Return currentMax at the end.',
      ],
      dryRun: 'For [4, 9, 2, 7], currentMax becomes 4, then 9, then 9, then 9.',
    },
    referenceNotes: [
      'Arrays are zero-indexed in Java for most common access patterns.',
      'For a value from index i, the next element is at i + 1 and the previous at i - 1.',
      'When you change an array in place, be careful not to overwrite values you still need later.',
    ],
    referenceLinks: [
      { label: 'Java Arrays tutorial', url: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html', kind: 'optional' },
    ],
    commonMistakes: ['Looping one index too far', 'Checking the wrong boundary', 'Using stale values after updates', 'Forgetting to handle empty arrays'],
    edgeCases: ['Empty array', 'One element', 'Duplicate maximum values', 'Sorted versus unsorted input'],
    complexityNote: 'Access is O(1), traversal is O(n), and many array scans use O(1) extra space if they avoid extra arrays.',
    guidedPractice: [
      { question: 'Given an array, find the first index where the value is greater than the previous value. Explain how you know the answer is correct.', hint: 'Scan left to right and compare each element to the previous one. The first time it increases, you have found the answer.' },
    ],
    assignments: [{
      id: 'arrays-assignment-1',
      title: 'Second maximum element',
      difficulty: 'beginner',
      description: 'Return the second largest distinct value in an array without sorting the whole array, or -1 if fewer than two distinct values exist.',
      constraints: ['0 <= n <= 10^5', 'Elements may repeat', 'Use a single pass if possible'],
      examples: [{ input: '[12, 3, 8, 15, 7]', output: '12', explanation: 'The largest is 15 and the second largest distinct value is 12.' }],
      learningObjectives: ['Track running maxima correctly', 'Avoid sorting when a linear scan suffices'],
      hints: ['Keep two variables: largest and secondLargest', 'Update them carefully when a new value is larger than either'],
      expectedComplexity: 'Time O(n), space O(1)',
      referenceSolution: 'Track largest and secondLargest while scanning the array and update them only when the new value is greater than either of the stored values.',
    }],
    quizzes: [{
      id: 'arrays-quiz-1',
      questions: [
        { question: 'Which array property makes random access efficient?', options: ['The array is always sorted', 'Each element has an index', 'Arrays cannot be resized'], correctAnswer: 'Each element has an index', explanation: 'Indexing makes direct access possible in constant time.' },
      ],
      answerKey: ['Each element has an index'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  strings: {
    learningObjectives: [
      'Explain how strings are stored and why indexing works on characters.',
      'Use substring logic, comparison and scanning patterns in Java.',
      'Avoid common mistakes around empty strings, indexes and case sensitivity.',
    ],
    keyConcepts: ['character indexing', 'substring', 'immutability', 'prefix/suffix', 'character counts'],
    lessonSections: [
      {
        title: 'String basics',
        explanation: 'In Java, strings are sequences of characters. A string can be scanned left to right, compared to another string, or parsed for patterns.',
      },
      {
        title: 'Common string patterns',
        explanation: 'Repeated scanning, sliding windows and frequency counters are common in string problems. Many questions become easier when you identify the pattern of repeated characters or a substring property.',
      },
    ],
    workedExample: {
      title: 'Counting vowels',
      steps: [
        'Initialize a counter to 0.',
        'Iterate through each character.',
        'If the character is a vowel, increment the counter.',
        'Return the final count.',
      ],
      dryRun: 'For "hello", the iteration sees h, e, l, l, o and counts e and o.',
    },
    referenceNotes: [
      'String indexing is zero-based in Java.',
      'String comparisons should use equals() when checking content, not == when comparing reference identity.',
      'A substring may be empty, so always consider the boundary conditions.',
    ],
    referenceLinks: [
      { label: 'Java String API', url: 'https://docs.oracle.com/javase/8/docs/api/java/lang/String.html', kind: 'official' },
    ],
    commonMistakes: ['Using == to compare strings', 'Forgetting the last index boundary', 'Not checking empty strings', 'Mutating a string when a new builder is needed'],
    edgeCases: ['Empty string', 'Single character', 'Repeated characters', 'Case-sensitive input'],
    complexityNote: 'Scanning a string is usually O(n) time and O(1) extra space unless you count frequencies or create extra buffers.',
    guidedPractice: [
      { question: 'Write a method that counts how many vowels appear in a string. Explain how your loop decides whether a character is a vowel.', hint: 'Check each character one by one and compare it to a small set of vowels.' },
    ],
    assignments: [{
      id: 'strings-assignment-1',
      title: 'Check if a string is a palindrome',
      difficulty: 'beginner',
      description: 'Return true if a string reads the same forward and backward, ignoring case and non-alphanumeric characters.',
      constraints: ['0 <= s.length <= 10^5', 'Ignore non-alphanumeric characters and compare case-insensitively', 'Do not rely on reversing the entire string unless you justify it'],
      examples: [{ input: 'A man, a plan, a canal: Panama', output: 'true', explanation: 'Ignoring spaces and case, the string reads the same forward and backward.' }],
      learningObjectives: ['Compare characters at opposite ends', 'Identify normalization requirements'],
      hints: ['Use two pointers from the ends', 'Normalize one character at a time'],
      expectedComplexity: 'Time O(n), space O(1) if you only compare characters in place',
      referenceSolution: 'Use two pointers, skip non-alphanumeric characters, compare lowercase values, and move inward until the pointers meet.',
    }],
    quizzes: [{
      id: 'strings-quiz-1',
      questions: [
        { question: 'Which Java method compares string content?', options: ['==', 'compareToIgnoreCase()', 'equals()', 'hashCode()'], correctAnswer: 'equals()', explanation: 'equals() compares the actual content of the string values.' },
      ],
      answerKey: ['equals()'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  searching: {
    learningObjectives: [
      'Explain the invariant behind binary search.',
      'Recognize sorted input and midpoint updates.',
      'Choose the correct lower, upper and mid pointer boundaries for search problems.',
    ],
    keyConcepts: ['sorted space', 'midpoint', 'lower bound', 'upper bound', 'invariant'],
    lessonSections: [
      {
        title: 'Binary search idea',
        explanation: 'Binary search works because the search space is sorted. If the target is greater than the midpoint, it cannot appear on the left half; the same logic applies in reverse for smaller values.',
      },
      {
        title: 'Boundary logic',
        explanation: 'The hardest part is often the boundary conditions: what happens when the target is at the first or last index, or when the target is absent? A well-defined invariant simplifies this decision-making.',
      },
    ],
    workedExample: {
      title: 'Finding target 8 in [2, 4, 6, 8, 10, 12]',
      steps: [
        'Set low = 0 and high = 5.',
        'mid = 2, value = 6, target is larger, so move low to 3.',
        'mid = 4, value = 10, target is smaller, so move high to 3.',
        'mid = 3, value = 8, found.',
      ],
      dryRun: 'The search space shrinks by half each step, giving logarithmic time complexity.',
    },
    referenceNotes: [
      'Binary search requires sorted input or a property that preserves order.',
      'The invariant is: the answer, if it exists, remains within the current search range.',
      'Many problems are really binary search on a monotonic condition, not just a direct lookup.',
    ],
    referenceLinks: [
      { label: 'Binary Search on GeeksforGeeks', url: 'https://www.geeksforgeeks.org/binary-search/', kind: 'optional' },
    ],
    commonMistakes: ['Forgetting to update low or high', 'Choosing the wrong midpoint formula', 'Using the wrong condition when target is missing', 'Not handling duplicates correctly'],
    edgeCases: ['Target missing', 'Single element', 'Duplicate values', 'Target at left or right boundary'],
    complexityNote: 'Binary search usually runs in O(log n) time with O(1) extra space.',
    guidedPractice: [
      { question: 'Explain why binary search is not suitable for an unsorted list and what property the list must maintain.', hint: 'If the list is not ordered, the middle element does not tell you which half still matters.' },
    ],
    assignments: [{
      id: 'searching-assignment-1',
      title: 'Search insert position',
      difficulty: 'intermediate',
      description: 'Return the index where a target should be inserted into a sorted array while preserving order.',
      constraints: ['1 <= nums.length <= 10^5', 'nums is sorted in ascending order', 'The target may be absent'],
      examples: [{ input: 'nums = [1, 3, 5, 6], target = 5', output: '2', explanation: 'The target is already present at index 2.' }],
      learningObjectives: ['Use binary search boundaries correctly', 'Reason about insertion position logic'],
      hints: ['Track the first possible insertion point', 'Move the lower bound when the midpoint is smaller than the target'],
      expectedComplexity: 'Time O(log n), space O(1)',
      referenceSolution: 'Use low/high pointers and return low after narrowing the search range until the first valid insertion index is identified.',
    }],
    quizzes: [{
      id: 'searching-quiz-1',
      questions: [
        { question: 'Which property is required for binary search?', options: ['The data must be sorted', 'The array must be a queue', 'The values must be unique', 'The list must be empty'], correctAnswer: 'The data must be sorted', explanation: 'Binary search relies on sorted order to eliminate half of the search space each step.' },
      ],
      answerKey: ['The data must be sorted'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  sorting: {
    learningObjectives: [
      'Describe the goal of sorting and the distinct trade-offs between simple and efficient algorithms.',
      'Understand when insertion sort, merge sort and quicksort make sense.',
      'Use complexity reasoning to choose a sorting strategy for a given problem.',
    ],
    keyConcepts: ['comparisons', 'in-place sorting', 'stable order', 'merge', 'partition'],
    lessonSections: [
      {
        title: 'Why sorting matters',
        explanation: 'Sorting organizes data so that search, grouping and comparison tasks become easier. Many DSA problems become simpler once the data is in a predictable order.',
      },
      {
        title: 'Common sorting families',
        explanation: 'Simple sorts like insertion sort are easy to understand but slower on large input. Divide-and-conquer sorts such as merge sort reduce time complexity for larger arrays.',
      },
    ],
    workedExample: {
      title: 'Insertion sort on [5, 2, 4, 1]',
      steps: [
        'Take 2 and place it before 5.',
        'Take 4 and insert it before 5.',
        'Take 1 and insert it before all others.',
        'Result: [1, 2, 4, 5].',
      ],
      dryRun: 'Each new value is inserted into the sorted prefix, so the prefix remains ordered after each step.',
    },
    referenceNotes: [
      'Sorting is useful because it exposes order that supports binary search and pattern recognition.',
      'A stable sort preserves the relative order of equal values, which matters in some scenarios.',
      'If the input is already sorted or nearly sorted, simple methods may be sufficient.',
    ],
    referenceLinks: [
      { label: 'Sorting Algorithms Overview', url: 'https://www.geeksforgeeks.org/sorting-algorithms/', kind: 'optional' },
    ],
    commonMistakes: ['Confusing sort order with insertion order', 'Not considering dependencies on equal values', 'Assuming the fastest algorithm is always best for small arrays'],
    edgeCases: ['Already sorted input', 'Reverse-sorted input', 'Duplicate values', 'One-element arrays'],
    complexityNote: 'Insertion sort is O(n^2) worst case, while merge sort is O(n log n) and uses O(n) extra space.',
    guidedPractice: [
      { question: 'Explain why insertion sort can be efficient on almost-sorted arrays even though its worst case is quadratic.', hint: 'When the data is already close to order, only a few elements need to move each time.' },
    ],
    assignments: [{
      id: 'sorting-assignment-1',
      title: 'Sort an array using insertion sort',
      difficulty: 'beginner',
      description: 'Implement insertion sort and explain the invariant that keeps the prefix sorted after each insertion.',
      constraints: ['1 <= n <= 10^4', 'Sorting must be in ascending order', 'Use in-place updates where possible'],
      examples: [{ input: '[7, 2, 5, 1]', output: '[1, 2, 5, 7]', explanation: 'Each new item is inserted into its proper position in the sorted prefix.' }],
      learningObjectives: ['Understand sorted-prefix invariant', 'Use in-place comparison logic'],
      hints: ['Move larger values to the right until you find the right insertion point', 'Insert the current value into the sorted prefix'],
      expectedComplexity: 'Time O(n^2), space O(1)',
      referenceSolution: 'Use a nested loop; for each element, place it in the correct index in the sorted prefix by shifting larger values to the right.',
    }],
    quizzes: [{
      id: 'sorting-quiz-1',
      questions: [
        { question: 'Which sort is often chosen for small or nearly sorted arrays?', options: ['Insertion sort', 'Trie', 'Hashing', 'Disjoint set'], correctAnswer: 'Insertion sort', explanation: 'Insertion sort works well when the array is already almost sorted.' },
      ],
      answerKey: ['Insertion sort'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  'linked-lists': {
    learningObjectives: [
      'Explain how each node stores data and a pointer to the next node.',
      'Trace pointer updates when inserting or deleting at the front, middle or end.',
      'Reason about list invariants and pointer safety.',
    ],
    keyConcepts: ['nodes', 'next pointer', 'head/tail', 'insertion', 'deletion'],
    lessonSections: [
      {
        title: 'Linked list structure',
        explanation: 'Each node stores data and a reference to the next node. Unlike arrays, linked lists do not provide random access, so traversal is necessary to reach the target position.',
      },
      {
        title: 'Pointer safety',
        explanation: 'Before changing the next pointer, keep a reference to the node you are about to skip or reconnect. This prevents losing the rest of the list.',
      },
    ],
    workedExample: {
      title: 'Deleting the head node',
      steps: [
        'Save the current head in a temporary variable.',
        'Move head to head.next.',
        'Disconnect the old node and return the new head.',
      ],
      dryRun: 'If the list is 3 → 5 → 7, deleting the head makes the list 5 → 7.',
    },
    referenceNotes: [
      'Linked lists have O(n) traversal time and O(1) insertion at the head if you already have a pointer to the head.',
      'The next pointer is the crucial link; breaking it incorrectly can lose the rest of the list.',
      'A dummy head is often useful when the front of the list changes frequently.',
    ],
    referenceLinks: [
      { label: 'Linked List Introduction', url: 'https://www.geeksforgeeks.org/data-structures/linked-list/', kind: 'optional' },
    ],
    commonMistakes: ['Losing the rest of the list by overwriting next before saving it', 'Not handling null head', 'Confusing list length with index access'],
    edgeCases: ['Empty list', 'Single element', 'Delete the head', 'Insert at the end'],
    complexityNote: 'Traversal is O(n), insertion or deletion at the head is O(1), and random access is O(n).',
    guidedPractice: [
      { question: 'Explain what happens to the pointer chain when you insert a new node at the front of a singly linked list.', hint: 'Make the new node point to the current head before updating the head reference.' },
    ],
    assignments: [{
      id: 'linked-lists-assignment-1',
      title: 'Remove nth node from end',
      difficulty: 'intermediate',
      description: 'Delete the node that is nth from the end of a singly linked list without using extra array storage.',
      constraints: ['1 <= n <= list length', 'Use constant extra space'],
      examples: [{ input: '1 -> 2 -> 3 -> 4 -> 5, n = 2', output: '1 -> 2 -> 3 -> 5', explanation: 'The node 4 is removed from the end.' }],
      learningObjectives: ['Use a two-pointer approach', 'Reason about deletion without random access'],
      hints: ['Use a dummy node and a fast/slow pointer approach', 'Keep a pointer to the node before the target'],
      expectedComplexity: 'Time O(n), space O(1)',
      referenceSolution: 'Use a dummy head and advance a fast pointer n steps ahead, then move both pointers together until fast reaches the end; delete the slow.next node.',
    }],
    quizzes: [{
      id: 'linked-lists-quiz-1',
      questions: [
        { question: 'What is the main difference between an array and a linked list?', options: ['Linked lists support random access', 'Arrays do not store references', 'Arrays are contiguous while linked lists are node-based', 'Linked lists cannot be traversed'], correctAnswer: 'Arrays are contiguous while linked lists are node-based', explanation: 'Arrays use contiguous memory, while linked lists connect nodes through references.' },
      ],
      answerKey: ['Arrays are contiguous while linked lists are node-based'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  stacks: {
    learningObjectives: [
      'Explain the LIFO behavior of a stack and identify when it is the correct data structure.',
      'Use a stack for balance checks, recursion simulation and backtracking patterns.',
      'Reason about push/pop operations and stack underflow/overflow conditions.',
    ],
    keyConcepts: ['LIFO', 'push', 'pop', 'peek', 'stack overflow'],
    lessonSections: [
      {
        title: 'Stack behavior',
        explanation: 'A stack is a last-in-first-out structure: the most recently added item is processed first. This matches nested operations like function calls and balanced parentheses checks.',
      },
    ],
    workedExample: {
      title: 'Balanced parentheses',
      steps: [
        'Push opening brackets onto the stack.',
        'When a closing bracket arrives, check the top of the stack.',
        'If it matches, pop it; otherwise the expression is invalid.',
      ],
      dryRun: 'For "[( )]" the stack grows and shrinks in a balanced order.',
    },
    referenceNotes: [
      'A stack is ideal for handling nested items and undo-like behavior.',
      'If a closing bracket does not match the most recent opening bracket, the structure is invalid.',
    ],
    referenceLinks: [
      { label: 'Stack Data Structure', url: 'https://www.geeksforgeeks.org/stack-data-structure/', kind: 'optional' },
    ],
    commonMistakes: ['Checking the wrong top of stack', 'Forgetting to pop after a valid match', 'Not handling empty stack conditions'],
    edgeCases: ['Empty expression', 'Unmatched closing bracket', 'Nested mixed brackets'],
    complexityNote: 'Push and pop are O(1), and a stack uses O(n) space in the worst case.',
    guidedPractice: [
      { question: 'Why do we push opening brackets and pop on matching closing brackets?', hint: 'The stack keeps the most recent unmatched opening bracket available for immediate validation.' },
    ],
    assignments: [{
      id: 'stacks-assignment-1',
      title: 'Valid parentheses',
      difficulty: 'beginner',
      description: 'Return true if a string of parentheses is balanced.',
      constraints: ['0 <= s.length <= 10^5', 'Characters are limited to (), [], and {}'],
      examples: [{ input: '([{}])', output: 'true', explanation: 'Each opening bracket is matched by the most recent corresponding closing bracket.' }],
      learningObjectives: ['Match nested opening and closing symbols', 'Explain stack invariant'],
      hints: ['Push when you see an opening bracket', 'Pop when the top matches the closing bracket'],
      expectedComplexity: 'Time O(n), space O(n)',
      referenceSolution: 'Use a stack; for each bracket, push on openers and verify the top matches on closers; return false immediately if no match exists.',
    }],
    quizzes: [{
      id: 'stacks-quiz-1',
      questions: [
        { question: 'Which behavior defines a stack?', options: ['FIFO', 'LIFO', 'Random access', 'Balanced tree'], correctAnswer: 'LIFO', explanation: 'A stack removes the most recently added item first.' },
      ],
      answerKey: ['LIFO'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  queues: {
    learningObjectives: [
      'Explain FIFO order and its contrast with stack behavior.',
      'Apply queues to breadth-first traversal and scheduling problems.',
      'Understand how front and rear pointers are managed.',
    ],
    keyConcepts: ['FIFO', 'enqueue', 'dequeue', 'front', 'rear'],
    lessonSections: [
      {
        title: 'Queue behavior',
        explanation: 'A queue is first-in-first-out: the first item enqueued is the first item processed. This makes it suitable for waiting lines, BFS traversal and task scheduling.',
      },
    ],
    workedExample: {
      title: 'Processing tasks in order',
      steps: [
        'Enqueue tasks as they arrive.',
        'Dequeue the earliest task.',
        'Repeat until all tasks are processed.',
      ],
      dryRun: 'If tasks arrive as A, B, C, they leave in the same order A, B, C.',
    },
    referenceNotes: [
      'Queues are ideal when processing order matters.',
      'A circular queue avoids wasting space when the front advances repeatedly.',
    ],
    referenceLinks: [
      { label: 'Queue Data Structure', url: 'https://www.geeksforgeeks.org/queue-data-structure/', kind: 'optional' },
    ],
    commonMistakes: ['Reading from the wrong end', 'Forgetting to advance front or rear', 'Not handling empty or full queue states'],
    edgeCases: ['Empty queue', 'Single item', 'Repeated enqueue and dequeue'],
    complexityNote: 'Enqueue and dequeue are O(1) on average, with O(n) space for the stored items.',
    guidedPractice: [
      { question: 'Why is a queue a better fit than a stack for BFS?', hint: 'BFS explores nodes by level, so nodes discovered earlier should be processed before later ones.' },
    ],
    assignments: [{
      id: 'queues-assignment-1',
      title: 'Process jobs in arrival order',
      difficulty: 'beginner',
      description: 'Process a list of jobs in arrival order and explain how queue order affects output.',
      constraints: ['Jobs must be processed in order of arrival', 'The queue should preserve FIFO order'],
      examples: [{ input: 'Jobs = [A, B, C]', output: 'A, B, C', explanation: 'The earliest job is processed first, then the next one.' }],
      learningObjectives: ['Explain FIFO semantics', 'Model real-world scheduling with a queue'],
      hints: [
        'Model the waiting jobs with a first-in-first-out queue.',
        'Only remove a job after the item at the front has been processed.',
        'Trace the enqueue and dequeue order for the example before coding.',
      ],
      expectedComplexity: 'Time O(n), space O(n)',
      referenceSolution: 'Use a queue and process each job exactly once in the order it was enqueued.',
    }],
    quizzes: [{
      id: 'queues-quiz-1',
      questions: [
        { question: 'Which order does a queue preserve?', options: ['LIFO', 'FIFO', 'Random', 'Reverse order'], correctAnswer: 'FIFO', explanation: 'Queue operations process items in the same order they were added.' },
      ],
      answerKey: ['FIFO'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  recursion: {
    learningObjectives: [
      'Explain recursion as a function calling itself on a smaller subproblem.',
      'Write base cases correctly and avoid infinite recursion.',
      'Trace recursive calls and understand stack behavior.',
    ],
    keyConcepts: ['base case', 'recursive call', 'call stack', 'subproblem reduction'],
    lessonSections: [
      {
        title: 'Recursive thinking',
        explanation: 'A recursive solution splits a problem into a smaller version of itself. The base case stops the recursion before it repeats forever.',
      },
      {
        title: 'Call stack intuition',
        explanation: 'Each recursive call adds a new frame to the stack. Once the base case is reached, the frames unwind in reverse order, which is often where the final result is assembled.',
      },
    ],
    workedExample: {
      title: 'Factorial',
      steps: [
        'If n == 0 or 1, return 1.',
        'Otherwise return n * factorial(n - 1).',
        'The calls keep shrinking until the base case is reached.',
      ],
      dryRun: 'factorial(4) = 4 * factorial(3) = 4 * 3 * factorial(2) = 4 * 3 * 2 * 1 = 24.',
    },
    referenceNotes: [
      'Every recursive algorithm needs a base case and a smaller subproblem.',
      'Infinite recursion usually means the input does not move toward the base case.',
      'Recursion can be elegant, but iteration is often easier to debug in practice.',
    ],
    referenceLinks: [
      { label: 'Recursion in Java', url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html', kind: 'optional' },
    ],
    commonMistakes: ['Forgetting the base case', 'Reducing the problem incorrectly', 'Not understanding call-stack order'],
    edgeCases: ['n = 0', 'n = 1', 'Negative input', 'Very deep recursion'],
    complexityNote: 'Recursive calls add stack depth, so time complexity is typically the number of recursive calls and space complexity is O(h), where h is the recursion depth.',
    guidedPractice: [
      { question: 'What is the purpose of the base case in recursion?', hint: 'The base case prevents infinite repetition by telling the function when to stop calling itself.' },
    ],
    assignments: [{
      id: 'recursion-assignment-1',
      title: 'Fibonacci with recursion',
      difficulty: 'intermediate',
      description: 'Write a recursive function to compute the nth Fibonacci value and explain the recurrence relation.',
      constraints: ['0 <= n <= 30', 'Use recursion and define a clear base case'],
      examples: [{ input: 'n = 6', output: '8', explanation: 'The sequence is 0, 1, 1, 2, 3, 5, 8.' }],
      learningObjectives: ['Define recurrence clearly', 'Use base cases safely'],
      hints: ['The function should return the previous two values', 'Think about what happens when n is 0 or 1'],
      expectedComplexity: 'Time O(2^n) for the naive recursive version, space O(n) for the stack',
      referenceSolution: 'Use fib(n) = fib(n - 1) + fib(n - 2) for n > 1 and return 0 or 1 for the base cases.',
    }],
    quizzes: [{
      id: 'recursion-quiz-1',
      questions: [
        { question: 'What does a recursive function need in order to avoid infinite repetition?', options: ['A loop', 'A base case', 'A queue', 'A pointer'], correctAnswer: 'A base case', explanation: 'The base case ends the recursion once the problem is small enough.' },
      ],
      answerKey: ['A base case'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  trees: {
    learningObjectives: [
      'Describe tree nodes, root, children and traversal order.',
      'Apply DFS and BFS to solve path, counting and level-based tree problems.',
      'Explain the difference between binary tree structure and a search property.',
    ],
    keyConcepts: ['root', 'node', 'left/right child', 'depth', 'height', 'traversal'],
    lessonSections: [
      {
        title: 'Tree structure',
        explanation: 'Trees model hierarchical relationships, with a root that connects to child nodes. Binary trees have at most two children per node, which makes recursive traversal natural.',
      },
      {
        title: 'Traversal patterns',
        explanation: 'Depth-first traversal focuses on one branch deeply before moving on, while breadth-first traversal processes one level at a time. Each method is useful for different problem types.',
      },
    ],
    workedExample: {
      title: 'Tree traversal',
      steps: [
        'Start at the root.',
        'Visit the root, then left subtree, then right subtree for DFS preorder.',
        'For BFS, process level by level using a queue.',
      ],
      dryRun: 'For a tree with root 1 and children 2, 3, preorder is 1, 2, 3 and BFS order is 1, 2, 3.',
    },
    referenceNotes: [
      'A tree is a recursive structure: each subtree is itself a smaller tree.',
      'The height of a tree is the longest path from the root to a leaf node.',
      'A balanced tree keeps traversal and search efficient in many cases.',
    ],
    referenceLinks: [
      { label: 'Tree Data Structure', url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/', kind: 'optional' },
    ],
    commonMistakes: ['Confusing preorder, inorder and postorder', 'Not handling null children', 'Forgetting recursion base case'],
    edgeCases: ['Single-node tree', 'Skewed tree', 'Missing left or right child', 'Empty tree'],
    complexityNote: 'DFS and BFS are each O(n) for a tree, and tree recursion uses O(h) stack space where h is the height of the tree.',
    guidedPractice: [
      { question: 'Describe the difference between preorder and inorder traversal.', hint: 'Preorder visits the node before its children, while inorder visits the left subtree before the node and then the right subtree.' },
    ],
    assignments: [{
      id: 'trees-assignment-1',
      title: 'Maximum depth of a binary tree',
      difficulty: 'intermediate',
      description: 'Compute the maximum depth of a binary tree using recursion or an iterative stack.',
      constraints: ['Tree nodes are connected with left and right children', 'Depth is measured in nodes along the longest root-to-leaf path'],
      examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'The longest root-to-leaf path contains three nodes.' }],
      learningObjectives: ['Reason recursively about subtree depths', 'Use tree height intuition'],
      hints: ['Return 1 + max(leftDepth, rightDepth)', 'Handle null nodes as zero depth'],
      expectedComplexity: 'Time O(n), space O(h)',
      referenceSolution: 'Recursively compute the depth of each subtree and return 1 + max(leftDepth, rightDepth).',
    }],
    quizzes: [{
      id: 'trees-quiz-1',
      questions: [
        { question: 'Which traversal visits the node before both child subtrees?', options: ['Preorder', 'Inorder', 'Postorder', 'Level order'], correctAnswer: 'Preorder', explanation: 'Preorder visits the current node before traversing left and right children.' },
      ],
      answerKey: ['Preorder'],
    }],
    status: 'published',
    contentStatus: 'verified',
  },
  'binary-search-trees': {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  heaps: {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  hashing: {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  graphs: {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  backtracking: {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  greedy: {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  'dynamic-programming': {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  tries: {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
  'disjoint-set-union': {
    status: 'planned',
    contentStatus: 'needs-authoring',
    learningObjectives: [],
    keyConcepts: [],
    lessonSections: [],
    workedExample: null,
    referenceNotes: [],
    referenceLinks: [],
    commonMistakes: [],
    edgeCases: [],
    complexityNote: 'This topic still needs authoring.',
    guidedPractice: [],
    assignments: [],
    quizzes: [],
  },
}

export const dsaTopics = [
  'programming-fundamentals',
  'arrays',
  'strings',
  'linked-lists',
  'stacks',
  'queues',
  'searching',
  'sorting',
  'recursion',
  'backtracking',
  'trees',
  'binary-search-trees',
  'heaps',
  'hashing',
  'graphs',
  'greedy',
  'dynamic-programming',
  'tries',
  'disjoint-set-union',
].map((topicId) => {
  const assignments = [
    ...(topicContent[topicId]?.assignments || []),
    ...(assignmentExtensions[topicId] || []),
  ]
  const topic = {
    id: topicId,
    name: topicId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
    category: topicId.includes('search') || topicId.includes('sort') || topicId.includes('recursion') || topicId.includes('backtracking') || topicId.includes('greedy') || topicId.includes('dynamic') ? 'Algorithms' : 'Data Structures',
    level: ['programming-fundamentals', 'arrays', 'strings', 'stacks', 'queues', 'searching', 'sorting'].includes(topicId) ? 'beginner' : ['linked-lists', 'recursion', 'trees', 'binary-search-trees', 'heaps', 'hashing'].includes(topicId) ? 'intermediate' : 'advanced',
    prerequisites: topicId === 'programming-fundamentals' ? [] : topicId === 'arrays' ? ['programming-fundamentals'] : topicId === 'strings' ? ['programming-fundamentals'] : topicId === 'linked-lists' ? ['arrays'] : topicId === 'stacks' ? ['arrays'] : topicId === 'queues' ? ['arrays'] : topicId === 'searching' ? ['arrays'] : topicId === 'sorting' ? ['arrays'] : topicId === 'recursion' ? ['programming-fundamentals'] : topicId === 'backtracking' ? ['recursion'] : topicId === 'trees' ? ['arrays', 'recursion'] : topicId === 'binary-search-trees' ? ['trees'] : topicId === 'heaps' ? ['arrays'] : topicId === 'hashing' ? ['arrays'] : topicId === 'graphs' ? ['trees', 'queues', 'stacks'] : topicId === 'greedy' ? ['arrays'] : topicId === 'dynamic-programming' ? ['recursion', 'arrays'] : topicId === 'tries' ? ['strings'] : ['graphs'],
    description: topicId === 'programming-fundamentals' ? 'Core programming ideas such as variables, loops, conditions, functions and debugging.' : topicId === 'arrays' ? 'Ordered collections of values with indexed access.' : topicId === 'strings' ? 'Sequences of characters used for text processing and parsing.' : topicId === 'linked-lists' ? 'A list structure built from nodes that point to the next item.' : topicId === 'stacks' ? 'A last-in-first-out structure used in parsing and recursion.' : topicId === 'queues' ? 'A first-in-first-out structure used in breadth-first traversal and scheduling.' : topicId === 'searching' ? 'Methods for finding values quickly in data.' : topicId === 'sorting' ? 'Techniques for ordering data efficiently and predictably.' : topicId === 'recursion' ? 'Solving problems by reducing them to smaller subproblems.' : topicId === 'backtracking' ? 'Trying possibilities and undoing choices when a path fails.' : topicId === 'trees' ? 'Hierarchical structures with parent-child relationships.' : topicId === 'binary-search-trees' ? 'Trees that keep left-right ordering to speed up search operations.' : topicId === 'heaps' ? 'Priority structures where the highest or lowest value is easy to access.' : topicId === 'hashing' ? 'Fast lookup using hash functions and key-value mapping.' : topicId === 'graphs' ? 'Networks of nodes and connections used in many real-world problems.' : topicId === 'greedy' ? 'Choosing the locally best option in the hope that it leads to the optimal overall result.' : topicId === 'dynamic-programming' ? 'Breaking problems into overlapping subproblems and storing solutions to reuse them.' : topicId === 'tries' ? 'Tree-based structures used for prefix lookup and autocomplete.' : 'A union-find structure for efficiently tracking connected components.',
    ...topicContent[topicId],
    assignments,
  }

  return buildTopicMetadata(topic, {
    ...topicContent[topicId],
    assignments,
    status: topicContent[topicId]?.status || 'published',
    contentStatus: topicContent[topicId]?.contentStatus || 'verified',
  })
})

export function getTopicById(topicId) {
  return dsaTopics.find((topic) => topic.id === topicId) || null
}
