export const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: "Let's make binary search feel intuitive instead of memorizing the code. The key idea is to repeatedly eliminate half of a sorted search space.",
    detail: 'Imagine looking for a word in a dictionary: you open near the middle, decide which half can contain it, and repeat.',
    code: `function binarySearch(numbers, target) {\n  let left = 0\n  let right = numbers.length - 1\n\n  while (left <= right) {\n    const middle = Math.floor((left + right) / 2)\n    if (numbers[middle] === target) return middle\n    if (numbers[middle] < target) left = middle + 1\n    else right = middle - 1\n  }\n\n  return -1\n}`,
    question: 'What lets us safely discard half of the array after each comparison?',
  },
  {
    id: 2,
    role: 'user',
    content: 'Because the array is sorted, so every value on one side of the middle is either too small or too large.',
  },
  {
    id: 3,
    role: 'assistant',
    content: 'Exactly. That sorted order is the contract binary search needs. Next, we can focus on the boundary rules that prevent off-by-one errors.',
  },
]

export const quickReplies = {
  'Get a hint': 'Start by naming the invariant: everything outside your left and right pointers has already been ruled out.',
  'Explain simpler': 'Binary search is a guessing game with a sorted list. Guess the middle, keep the half that could still contain the answer, and repeat.',
  'Give an example': 'For [3, 8, 12, 17, 21] and target 17, check 12 first, discard the left half, then check 17. Two comparisons instead of five.',
  'Practice problem': 'Try this: find the first position where a sorted array is greater than or equal to a target. Tell me what your pointers mean before writing code.',
}
