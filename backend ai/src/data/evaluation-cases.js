export const javaEvaluationCases = {
  'pf-assignment-1': {
    title: 'Sum of Array Elements',
    topic: 'Programming Fundamentals',
    difficulty: 'beginner',
    entrypoint: 'Solution.sum(int[])',
    methodName: 'sum',
    starterCode: `class Solution {
    public int sum(int[] values) {
        int total = 0;
        for (int val : values) {
            total += val;
        }
        return total;
    }
}`,
    samples: [
      { input: { values: [3, 5, 7] }, expected: '15' },
      { input: { values: [1, 2, 3, 4, 5] }, expected: '15' },
    ],
    additional: [
      { input: { values: [] }, expected: '0' },
      { input: { values: [-4, 1, 2] }, expected: '-1' },
      { input: { values: [0, 0, 0] }, expected: '0' },
      { input: { values: [100, -50, 25] }, expected: '75' },
    ],
  },

  'pf-assignment-2': {
    title: 'Classify Values in One Pass',
    topic: 'Programming Fundamentals',
    difficulty: 'intermediate',
    entrypoint: 'Solution.classify(int[])',
    methodName: 'classify',
    starterCode: `class Solution {
    public int[] classify(int[] values) {
        // Return [negativeCount, zeroCount, positiveCount]
        int neg = 0, zero = 0, pos = 0;
        for (int v : values) {
            if (v < 0) neg++;
            else if (v == 0) zero++;
            else pos++;
        }
        return new int[]{neg, zero, pos};
    }
}`,
    samples: [
      { input: { values: [0, -2, 5, 0, -1] }, expected: '[2, 2, 1]' },
    ],
    additional: [
      { input: { values: [] }, expected: '[0, 0, 0]' },
      { input: { values: [-5, -10, -1] }, expected: '[3, 0, 0]' },
      { input: { values: [1, 2, 3] }, expected: '[0, 0, 3]' },
      { input: { values: [0, 0] }, expected: '[0, 2, 0]' },
    ],
  },

  'pf-assignment-3': {
    title: 'Longest Run of Equal Values',
    topic: 'Programming Fundamentals',
    difficulty: 'advanced',
    entrypoint: 'Solution.longestRun(int[])',
    methodName: 'longestRun',
    starterCode: `class Solution {
    public int longestRun(int[] values) {
        if (values == null || values.length == 0) return 0;
        int maxRun = 1, currentRun = 1;
        for (int i = 1; i < values.length; i++) {
            if (values[i] == values[i - 1]) {
                currentRun++;
                if (currentRun > maxRun) maxRun = currentRun;
            } else {
                currentRun = 1;
            }
        }
        return maxRun;
    }
}`,
    samples: [
      { input: { values: [4, 4, 2, 2, 2, 7] }, expected: '3' },
    ],
    additional: [
      { input: { values: [] }, expected: '0' },
      { input: { values: [5] }, expected: '1' },
      { input: { values: [1, 1, 1, 1] }, expected: '4' },
      { input: { values: [1, 2, 3, 4] }, expected: '1' },
    ],
  },

  'arrays-assignment-1': {
    title: 'Find Maximum Element',
    topic: 'Arrays',
    difficulty: 'beginner',
    entrypoint: 'Solution.findMax(int[])',
    methodName: 'findMax',
    starterCode: `class Solution {
    public int findMax(int[] values) {
        if (values.length == 0) return 0;
        int max = values[0];
        for (int i = 1; i < values.length; i++) {
            if (values[i] > max) {
                max = values[i];
            }
        }
        return max;
    }
}`,
    samples: [
      { input: { values: [2, 7, 1, 9, 4] }, expected: '9' },
      { input: { values: [-5, -2, -9] }, expected: '-2' },
    ],
    additional: [
      { input: { values: [42] }, expected: '42' },
      { input: { values: [1, 1, 1] }, expected: '1' },
      { input: { values: [-100, 0, 100] }, expected: '100' },
    ],
  },

  'arrays-assignment-2': {
    title: 'Rotate Array Right by K',
    topic: 'Arrays',
    difficulty: 'intermediate',
    entrypoint: 'Solution.rotate(int[], int)',
    methodName: 'rotate',
    starterCode: `class Solution {
    public void rotate(int[] values, int k) {
        if (values == null || values.length <= 1) return;
        k = k % values.length;
        reverse(values, 0, values.length - 1);
        reverse(values, 0, k - 1);
        reverse(values, k, values.length - 1);
    }
    private void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;
            start++;
            end--;
        }
    }
}`,
    samples: [
      { input: { values: [1, 2, 3, 4, 5], k: 2 }, expected: '[4, 5, 1, 2, 3]' },
    ],
    additional: [
      { input: { values: [1, 2, 3], k: 0 }, expected: '[1, 2, 3]' },
      { input: { values: [1, 2, 3], k: 3 }, expected: '[1, 2, 3]' },
      { input: { values: [-1, -100, 3, 99], k: 2 }, expected: '[3, 99, -1, -100]' },
    ],
  },

  'arrays-assignment-3': {
    title: 'Product of Array Except Self',
    topic: 'Arrays',
    difficulty: 'advanced',
    entrypoint: 'Solution.productExceptSelf(int[])',
    methodName: 'productExceptSelf',
    starterCode: `class Solution {
    public int[] productExceptSelf(int[] values) {
        int n = values.length;
        int[] result = new int[n];
        result[0] = 1;
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] * values[i - 1];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= right;
            right *= values[i];
        }
        return result;
    }
}`,
    samples: [
      { input: { values: [1, 2, 3, 4] }, expected: '[24, 12, 8, 6]' },
    ],
    additional: [
      { input: { values: [-1, 1, 0, -3, 3] }, expected: '[0, 0, 9, 0, 0]' },
      { input: { values: [2, 3] }, expected: '[3, 2]' },
    ],
  },

  'strings-assignment-1': {
    title: 'Valid Palindrome',
    topic: 'Strings',
    difficulty: 'beginner',
    entrypoint: 'Solution.isPalindrome(String)',
    methodName: 'isPalindrome',
    starterCode: `class Solution {
    public boolean isPalindrome(String s) {
        if (s == null) return true;
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`,
    samples: [
      { input: { s: 'racecar' }, expected: 'true' },
      { input: { s: 'hello' }, expected: 'false' },
    ],
    additional: [
      { input: { s: '' }, expected: 'true' },
      { input: { s: 'A man, a plan, a canal: Panama' }, expected: 'true' },
      { input: { s: '0P' }, expected: 'false' },
    ],
  },

  'strings-assignment-2': {
    title: 'First Unique Character in a String',
    topic: 'Strings',
    difficulty: 'intermediate',
    entrypoint: 'Solution.firstUniqChar(String)',
    methodName: 'firstUniqChar',
    starterCode: `class Solution {
    public int firstUniqChar(String s) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) {
            count[c - 'a']++;
        }
        for (int i = 0; i < s.length(); i++) {
            if (count[s.charAt(i) - 'a'] == 1) return i;
        }
        return -1;
    }
}`,
    samples: [
      { input: { s: 'swiss' }, expected: '1' },
      { input: { s: 'leetcode' }, expected: '0' },
    ],
    additional: [
      { input: { s: 'loveleetcode' }, expected: '2' },
      { input: { s: 'aabb' }, expected: '-1' },
    ],
  },

  'strings-assignment-3': {
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Strings',
    difficulty: 'advanced',
    entrypoint: 'Solution.lengthOfLongestSubstring(String)',
    methodName: 'lengthOfLongestSubstring',
    starterCode: `import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
    samples: [
      { input: { s: 'abcabcbb' }, expected: '3' },
      { input: { s: 'bbbbb' }, expected: '1' },
    ],
    additional: [
      { input: { s: 'pwwkew' }, expected: '3' },
      { input: { s: '' }, expected: '0' },
      { input: { s: 'au' }, expected: '2' },
    ],
  },

  'searching-assignment-1': {
    title: 'Binary Search in Sorted Array',
    topic: 'Searching',
    difficulty: 'beginner',
    entrypoint: 'Solution.binarySearch(int[], int)',
    methodName: 'binarySearch',
    starterCode: `class Solution {
    public int binarySearch(int[] values, int target) {
        int low = 0, high = values.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (values[mid] == target) return mid;
            else if (values[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`,
    samples: [
      { input: { values: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: '4' },
      { input: { values: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: '-1' },
    ],
    additional: [
      { input: { values: [5], target: 5 }, expected: '0' },
      { input: { values: [1, 3], target: 3 }, expected: '1' },
      { input: { values: [], target: 7 }, expected: '-1' },
    ],
  },

  'searching-assignment-2': {
    title: 'Find First Matching Index',
    topic: 'Searching',
    difficulty: 'beginner',
    entrypoint: 'Solution.findFirstMatch(int[], int)',
    methodName: 'findFirstMatch',
    starterCode: `class Solution {
    public int findFirstMatch(int[] values, int target) {
        for (int i = 0; i < values.length; i++) {
            if (values[i] == target) return i;
        }
        return -1;
    }
}`,
    samples: [
      { input: { values: [7, 3, 7, 2], target: 7 }, expected: '0' },
    ],
    additional: [
      { input: { values: [1, 2, 3, 4], target: 5 }, expected: '-1' },
      { input: { values: [4, 4, 4], target: 4 }, expected: '0' },
    ],
  },

  'searching-assignment-3': {
    title: 'First and Last Position in Sorted Array',
    topic: 'Searching',
    difficulty: 'advanced',
    entrypoint: 'Solution.searchRange(int[], int)',
    methodName: 'searchRange',
    starterCode: `class Solution {
    public int[] searchRange(int[] values, int target) {
        int first = findBound(values, target, true);
        int last = findBound(values, target, false);
        return new int[]{first, last};
    }
    private int findBound(int[] nums, int target, boolean isFirst) {
        int low = 0, high = nums.length - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) {
                ans = mid;
                if (isFirst) high = mid - 1;
                else low = mid + 1;
            } else if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return ans;
    }
}`,
    samples: [
      { input: { values: [5, 7, 7, 8, 8, 10], target: 8 }, expected: '[3, 4]' },
    ],
    additional: [
      { input: { values: [5, 7, 7, 8, 8, 10], target: 6 }, expected: '[-1, -1]' },
      { input: { values: [], target: 0 }, expected: '[-1, -1]' },
      { input: { values: [1], target: 1 }, expected: '[0, 0]' },
    ],
  },

  'sorting-assignment-1': {
    title: 'Bubble Sort In-Place',
    topic: 'Sorting',
    difficulty: 'beginner',
    entrypoint: 'Solution.bubbleSort(int[])',
    methodName: 'bubbleSort',
    starterCode: `class Solution {
    public void bubbleSort(int[] values) {
        int n = values.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (values[j] > values[j + 1]) {
                    int temp = values[j];
                    values[j] = values[j + 1];
                    values[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`,
    samples: [
      { input: { values: [64, 34, 25, 12, 22, 11, 90] }, expected: '[11, 12, 22, 25, 34, 64, 90]' },
    ],
    additional: [
      { input: { values: [5, 1, 4, 2, 8] }, expected: '[1, 2, 4, 5, 8]' },
      { input: { values: [1, 2, 3] }, expected: '[1, 2, 3]' },
      { input: { values: [] }, expected: '[]' },
    ],
  },

  'sorting-assignment-2': {
    title: 'Merge Two Sorted Arrays',
    topic: 'Sorting',
    difficulty: 'intermediate',
    entrypoint: 'Solution.merge(int[], int[])',
    methodName: 'merge',
    starterCode: `class Solution {
    public int[] merge(int[] first, int[] second) {
        int n = first.length, m = second.length;
        int[] res = new int[n + m];
        int i = 0, j = 0, k = 0;
        while (i < n && j < m) {
            if (first[i] <= second[j]) res[k++] = first[i++];
            else res[k++] = second[j++];
        }
        while (i < n) res[k++] = first[i++];
        while (j < m) res[k++] = second[j++];
        return res;
    }
}`,
    samples: [
      { input: { first: [1, 3, 5], second: [2, 3, 6] }, expected: '[1, 2, 3, 3, 5, 6]' },
    ],
    additional: [
      { input: { first: [], second: [1] }, expected: '[1]' },
      { input: { first: [1, 2], second: [] }, expected: '[1, 2]' },
      { input: { first: [5], second: [2] }, expected: '[2, 5]' },
    ],
  },

  'sorting-assignment-3': {
    title: 'Sort Colors (Dutch National Flag)',
    topic: 'Sorting',
    difficulty: 'advanced',
    entrypoint: 'Solution.sortColors(int[])',
    methodName: 'sortColors',
    starterCode: `class Solution {
    public void sortColors(int[] values) {
        int low = 0, mid = 0, high = values.length - 1;
        while (mid <= high) {
            if (values[mid] == 0) {
                int t = values[low]; values[low] = values[mid]; values[mid] = t;
                low++; mid++;
            } else if (values[mid] == 1) {
                mid++;
            } else {
                int t = values[high]; values[high] = values[mid]; values[mid] = t;
                high--;
            }
        }
    }
}`,
    samples: [
      { input: { values: [2, 0, 2, 1, 1, 0] }, expected: '[0, 0, 1, 1, 2, 2]' },
    ],
    additional: [
      { input: { values: [2, 0, 1] }, expected: '[0, 1, 2]' },
      { input: { values: [0] }, expected: '[0]' },
      { input: { values: [1] }, expected: '[1]' },
    ],
  },

  'linked-lists-assignment-1': {
    title: 'Reverse a Singly Linked List',
    topic: 'Linked Lists',
    difficulty: 'beginner',
    entrypoint: 'Solution.reverseList(ListNode)',
    methodName: 'reverseList',
    starterCode: `/**
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int val) { this.val = val; }
 * }
 */
class Solution {
    public Harness.ListNode reverseList(Harness.ListNode head) {
        Harness.ListNode prev = null;
        Harness.ListNode curr = head;
        while (curr != null) {
            Harness.ListNode nextNode = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextNode;
        }
        return prev;
    }
}`,
    samples: [
      { input: { values: [1, 2, 3, 4, 5] }, expected: '[5, 4, 3, 2, 1]' },
    ],
    additional: [
      { input: { values: [1, 2] }, expected: '[2, 1]' },
      { input: { values: [] }, expected: '[]' },
      { input: { values: [7] }, expected: '[7]' },
    ],
  },

  'linked-lists-assignment-2': {
    title: 'Reverse a Singly Linked List',
    topic: 'Linked Lists',
    difficulty: 'beginner',
    entrypoint: 'Solution.reverseList(ListNode)',
    methodName: 'reverseList',
    starterCode: `class Solution {
    public Harness.ListNode reverseList(Harness.ListNode head) {
        Harness.ListNode prev = null;
        Harness.ListNode curr = head;
        while (curr != null) {
            Harness.ListNode nextNode = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextNode;
        }
        return prev;
    }
}`,
    samples: [
      { input: { values: [1, 2, 3] }, expected: '[3, 2, 1]' },
    ],
    additional: [
      { input: { values: [] }, expected: '[]' },
      { input: { values: [10, 20] }, expected: '[20, 10]' },
    ],
  },

  'stacks-assignment-1': {
    title: 'Valid Parentheses',
    topic: 'Stacks',
    difficulty: 'beginner',
    entrypoint: 'Solution.isValid(String)',
    methodName: 'isValid',
    starterCode: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
    samples: [
      { input: { s: '()' }, expected: 'true' },
      { input: { s: '()[]{}' }, expected: 'true' },
      { input: { s: '(]' }, expected: 'false' },
    ],
    additional: [
      { input: { s: '([)]' }, expected: 'false' },
      { input: { s: '{[]}' }, expected: 'true' },
      { input: { s: '' }, expected: 'true' },
    ],
  },

  'stacks-assignment-2': {
    title: 'Next Greater Element I',
    topic: 'Stacks',
    difficulty: 'intermediate',
    entrypoint: 'Solution.nextGreaterElement(int[])',
    methodName: 'nextGreaterElement',
    starterCode: `import java.util.Stack;

class Solution {
    public int[] nextGreaterElement(int[] values) {
        int n = values.length;
        int[] result = new int[n];
        Stack<Integer> stack = new Stack<>();
        for (int i = n - 1; i >= 0; i--) {
            while (!stack.isEmpty() && stack.peek() <= values[i]) {
                stack.pop();
            }
            result[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(values[i]);
        }
        return result;
    }
}`,
    samples: [
      { input: { values: [2, 1, 2, 4, 3] }, expected: '[4, 2, 4, -1, -1]' },
    ],
    additional: [
      { input: { values: [1, 2, 3, 4] }, expected: '[2, 3, 4, -1]' },
      { input: { values: [4, 3, 2, 1] }, expected: '[-1, -1, -1, -1]' },
      { input: { values: [] }, expected: '[]' },
    ],
  },

  'recursion-assignment-1': {
    title: 'Sum Numbers from 1 to N',
    topic: 'Recursion',
    difficulty: 'beginner',
    entrypoint: 'Solution.sumToN(int)',
    methodName: 'sumToN',
    starterCode: `class Solution {
    public long sumToN(int n) {
        if (n <= 0) return 0;
        return n + sumToN(n - 1);
    }
}`,
    samples: [
      { input: { n: 4 }, expected: '10' },
      { input: { n: 1 }, expected: '1' },
    ],
    additional: [
      { input: { n: 0 }, expected: '0' },
      { input: { n: 10 }, expected: '55' },
      { input: { n: 100 }, expected: '5050' },
    ],
  },

  'trees-assignment-1': {
    title: 'Count Nodes in Binary Tree',
    topic: 'Trees',
    difficulty: 'beginner',
    entrypoint: 'Solution.countNodes(TreeNode)',
    methodName: 'countNodes',
    starterCode: `class Solution {
    public int countNodes(Harness.TreeNode root) {
        if (root == null) return 0;
        return 1 + countNodes(root.left) + countNodes(root.right);
    }
}`,
    samples: [
      { input: { values: [1, 2, 3, 4, 5, 6] }, expected: '6' },
      { input: { values: [] }, expected: '0' },
    ],
    additional: [
      { input: { values: [1] }, expected: '1' },
      { input: { values: [1, null, 2] }, expected: '2' },
    ],
  },

  'trees-assignment-3': {
    title: 'Binary Tree Level Order Traversal',
    topic: 'Trees',
    difficulty: 'advanced',
    entrypoint: 'Solution.levelOrder(TreeNode)',
    methodName: 'levelOrder',
    starterCode: `import java.util.*;

class Solution {
    public List<List<Integer>> levelOrder(Harness.TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<Harness.TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> currentLevel = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                Harness.TreeNode node = queue.poll();
                currentLevel.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(currentLevel);
        }
        return result;
    }
}`,
    samples: [
      { input: { values: [3, 9, 20, null, null, 15, 7] }, expected: '[[3], [9, 20], [15, 7]]' },
    ],
    additional: [
      { input: { values: [1] }, expected: '[[1]]' },
      { input: { values: [] }, expected: '[]' },
    ],
  },

  'two-sum': {
    title: 'Two Sum (Sorted Array)',
    topic: 'Two Pointers',
    difficulty: 'easy',
    entrypoint: 'Solution.twoSum(int[], int)',
    methodName: 'twoSum',
    starterCode: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{-1, -1};
    }
}`,
    samples: [
      { input: { numbers: [2, 7, 11, 15], target: 9 }, expected: '[1, 2]' },
      { input: { numbers: [2, 3, 4], target: 6 }, expected: '[1, 3]' },
    ],
    additional: [
      { input: { numbers: [-1, 0], target: -1 }, expected: '[1, 2]' },
      { input: { numbers: [1, 2, 3, 4, 4, 9, 56, 90], target: 8 }, expected: '[4, 5]' },
    ],
  },

  'climbing-stairs': {
    title: 'Climbing Stairs',
    topic: 'Dynamic Programming',
    difficulty: 'easy',
    entrypoint: 'Solution.climbStairs(int)',
    methodName: 'climbStairs',
    starterCode: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
    samples: [
      { input: { n: 2 }, expected: '2' },
      { input: { n: 3 }, expected: '3' },
    ],
    additional: [
      { input: { n: 1 }, expected: '1' },
      { input: { n: 4 }, expected: '5' },
      { input: { n: 5 }, expected: '8' },
    ],
  },

  'coin-change': {
    title: 'Coin Change',
    topic: 'Dynamic Programming',
    difficulty: 'medium',
    entrypoint: 'Solution.coinChange(int[], int)',
    methodName: 'coinChange',
    starterCode: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int coin : coins) {
            for (int i = coin; i <= amount; i++) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
    samples: [
      { input: { coins: [1, 2, 5], amount: 11 }, expected: '3' },
      { input: { coins: [2], amount: 3 }, expected: '-1' },
    ],
    additional: [
      { input: { coins: [1], amount: 0 }, expected: '0' },
      { input: { coins: [1, 5, 10, 25], amount: 30 }, expected: '2' },
    ],
  },
}