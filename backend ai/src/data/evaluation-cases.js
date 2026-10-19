export const javaEvaluationCases = {
  'pf-assignment-1': {
    entrypoint: 'Solution.sum(int[])',
    starterCode: 'class Solution {\n    public int sum(int[] values) {\n        // Implement the sum.\n        return 0;\n    }\n}',
    samples: [
      { input: { values: [3, 5, 7] }, expected: 15 },
    ],
    additional: [
      { input: { values: [] }, expected: 0 },
      { input: { values: [-4, 1, 2] }, expected: -1 },
      { input: { values: [0, 0, 0] }, expected: 0 },
    ],
  },
}