import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { javaEvaluationCases } from '../data/evaluation-cases.js'

const COMPILATION_TIMEOUT_MS = 6000
const EXECUTION_TIMEOUT_MS = 4000
const MAX_SOURCE_BYTES = 64000

function parseCompileErrors(stderr) {
  if (!stderr) return []
  const lines = stderr.split('\n')
  const diagnostics = []
  const regex = /Solution\.java:(\d+):\s*error:\s*(.*)/
  for (let i = 0; i < lines.length; i += 1) {
    const match = regex.exec(lines[i])
    if (match) {
      const line = parseInt(match[1], 10)
      const message = match[2].trim()
      diagnostics.push({ line, message })
    }
  }
  return diagnostics
}

function parseRuntimeError(stderr, stdout) {
  const combined = `${stderr}\n${stdout}`
  const match = /(?:Exception in thread "[^"]*"\s+)?(java\.[a-zA-Z0-9_.]+(?:Exception|Error):[^\n]*)/i.exec(combined)
  if (match) return match[1].trim()
  const alt = /([a-zA-Z0-9_.]+(?:Exception|Error):[^\n]*)/i.exec(combined)
  if (alt) return alt[1].trim()
  return stderr.trim() || 'A runtime error occurred during execution.'
}

function normalizeOutput(val) {
  if (val === undefined || val === null) return ''
  if (typeof val === 'string') return val.trim()
  if (Array.isArray(val)) return JSON.stringify(val)
  return String(val).trim()
}

function valuesEqual(actual, expected) {
  const normActual = normalizeOutput(actual).replace(/\s+/g, '')
  const normExpected = normalizeOutput(expected).replace(/\s+/g, '')
  return normActual === normExpected
}

export class JavaRunner {
  static isJavacAvailable() {
    return new Promise((resolve) => {
      const proc = spawn('javac', ['-version'])
      proc.on('error', () => resolve(false))
      proc.on('close', (code) => resolve(code === 0))
    })
  }

  static buildHarnessCode(fixture, testCases) {
    const { methodName = 'solve', returnType = 'int', isStatic = false } = fixture

    return `
import java.util.*;
import java.io.*;

public class Harness {
    public static class ListNode {
        public int val;
        public ListNode next;
        public ListNode() {}
        public ListNode(int val) { this.val = val; }
        public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
        public static ListNode fromArray(int[] arr) {
            if (arr == null || arr.length == 0) return null;
            ListNode head = new ListNode(arr[0]);
            ListNode curr = head;
            for (int i = 1; i < arr.length; i++) {
                curr.next = new ListNode(arr[i]);
                curr = curr.next;
            }
            return head;
        }
        public static List<Integer> toList(ListNode head) {
            List<Integer> list = new ArrayList<>();
            ListNode curr = head;
            int limit = 10000;
            while (curr != null && limit-- > 0) {
                list.add(curr.val);
                curr = curr.next;
            }
            return list;
        }
    }

    public static class TreeNode {
        public int val;
        public TreeNode left;
        public TreeNode right;
        public TreeNode() {}
        public TreeNode(int val) { this.val = val; }
        public TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
        public static TreeNode fromArray(Integer[] arr) {
            if (arr == null || arr.length == 0 || arr[0] == null) return null;
            TreeNode root = new TreeNode(arr[0]);
            Queue<TreeNode> queue = new LinkedList<>();
            queue.offer(root);
            int i = 1;
            while (!queue.isEmpty() && i < arr.length) {
                TreeNode node = queue.poll();
                if (i < arr.length && arr[i] != null) {
                    node.left = new TreeNode(arr[i]);
                    queue.offer(node.left);
                }
                i++;
                if (i < arr.length && arr[i] != null) {
                    node.right = new TreeNode(arr[i]);
                    queue.offer(node.right);
                }
                i++;
            }
            return root;
        }
    }

    public static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) {
            return Arrays.toString((int[]) obj);
        }
        if (obj instanceof long[]) {
            return Arrays.toString((long[]) obj);
        }
        if (obj instanceof double[]) {
            return Arrays.toString((double[]) obj);
        }
        if (obj instanceof boolean[]) {
            return Arrays.toString((boolean[]) obj);
        }
        if (obj instanceof char[]) {
            return new String((char[]) obj);
        }
        if (obj instanceof Object[]) {
            return Arrays.deepToString((Object[]) obj);
        }
        if (obj instanceof ListNode) {
            return ListNode.toList((ListNode) obj).toString();
        }
        return String.valueOf(obj);
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        ${fixture.harnessDriverCode || JavaRunner.defaultDriverCode(fixture, testCases)}
    }
}
`
  }

  static defaultDriverCode(fixture, testCases) {
    const { methodName, entrypoint } = fixture
    const lines = []

    testCases.forEach((tc, idx) => {
      lines.push(`
        try {
            System.out.println("---CASE_START:${idx}---");
            long _start = System.nanoTime();
            ${JavaRunner.generateCaseInvocation(fixture, tc, idx)}
            long _time = (System.nanoTime() - _start) / 1000000;
            System.out.println("TIME_MS:" + _time);
            System.out.println("---CASE_END:${idx}---");
        } catch (Throwable _ex) {
            System.out.println("ERROR:" + _ex.getClass().getName() + ": " + _ex.getMessage());
            System.out.println("---CASE_END:${idx}---");
        }
      `)
    })

    return lines.join('\n')
  }

  static generateCaseInvocation(fixture, tc, idx) {
    const { entrypoint, methodName } = fixture
    const input = tc.input

    if (entrypoint === 'Solution.sum(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        int res = sol.sum(vals);
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.classify(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        int[] res = sol.classify(vals);
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.longestRun(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        int res = sol.longestRun(vals);
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.findMax(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        int res = sol.findMax(vals);
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.rotate(int[], int)') {
      const arrStr = (input.values || []).join(',')
      const k = input.k ?? 0
      return `
        int[] vals = new int[]{${arrStr}};
        sol.rotate(vals, ${k});
        System.out.println("OUTPUT:" + serialize(vals));
      `
    }

    if (entrypoint === 'Solution.productExceptSelf(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        int[] res = sol.productExceptSelf(vals);
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.isPalindrome(String)') {
      const str = JSON.stringify(input.s ?? '')
      return `
        boolean res = sol.isPalindrome(${str});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.firstUniqChar(String)') {
      const str = JSON.stringify(input.s ?? '')
      return `
        int res = sol.firstUniqChar(${str});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.lengthOfLongestSubstring(String)') {
      const str = JSON.stringify(input.s ?? '')
      return `
        int res = sol.lengthOfLongestSubstring(${str});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.binarySearch(int[], int)') {
      const arrStr = (input.values || []).join(',')
      const target = input.target ?? 0
      return `
        int[] vals = new int[]{${arrStr}};
        int res = sol.binarySearch(vals, ${target});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.findFirstMatch(int[], int)') {
      const arrStr = (input.values || []).join(',')
      const target = input.target ?? 0
      return `
        int[] vals = new int[]{${arrStr}};
        int res = sol.findFirstMatch(vals, ${target});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.searchRange(int[], int)') {
      const arrStr = (input.values || []).join(',')
      const target = input.target ?? 0
      return `
        int[] vals = new int[]{${arrStr}};
        int[] res = sol.searchRange(vals, ${target});
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.bubbleSort(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        sol.bubbleSort(vals);
        System.out.println("OUTPUT:" + serialize(vals));
      `
    }

    if (entrypoint === 'Solution.merge(int[], int[])') {
      const arr1 = (input.first || []).join(',')
      const arr2 = (input.second || []).join(',')
      return `
        int[] a = new int[]{${arr1}};
        int[] b = new int[]{${arr2}};
        int[] res = sol.merge(a, b);
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.sortColors(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        sol.sortColors(vals);
        System.out.println("OUTPUT:" + serialize(vals));
      `
    }

    if (entrypoint === 'Solution.reverseList(ListNode)') {
      const arrStr = (input.values || []).join(',')
      return `
        ListNode head = ListNode.fromArray(new int[]{${arrStr}});
        ListNode res = sol.reverseList(head);
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.hasCycle(ListNode)') {
      const arrStr = (input.values || []).join(',')
      const pos = input.pos ?? -1
      return `
        ListNode head = ListNode.fromArray(new int[]{${arrStr}});
        if (${pos} >= 0) {
            ListNode curr = head, cycleEntry = null;
            int idx = 0;
            while (curr.next != null) {
                if (idx == ${pos}) cycleEntry = curr;
                curr = curr.next;
                idx++;
            }
            if (cycleEntry != null) curr.next = cycleEntry;
        }
        boolean res = sol.hasCycle(head);
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.isValid(String)') {
      const str = JSON.stringify(input.s ?? '')
      return `
        boolean res = sol.isValid(${str});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.nextGreaterElement(int[])') {
      const arrStr = (input.values || []).join(',')
      return `
        int[] vals = new int[]{${arrStr}};
        int[] res = sol.nextGreaterElement(vals);
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.sumToN(int)') {
      const n = input.n ?? 0
      return `
        long res = sol.sumToN(${n});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.countNodes(TreeNode)') {
      const arrStr = (input.values || []).map((x) => (x === null ? 'null' : String(x))).join(',')
      return `
        TreeNode root = TreeNode.fromArray(new Integer[]{${arrStr}});
        int res = sol.countNodes(root);
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.levelOrder(TreeNode)') {
      const arrStr = (input.values || []).map((x) => (x === null ? 'null' : String(x))).join(',')
      return `
        TreeNode root = TreeNode.fromArray(new Integer[]{${arrStr}});
        List<List<Integer>> res = sol.levelOrder(root);
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    if (entrypoint === 'Solution.climbStairs(int)') {
      const n = input.n ?? 0
      return `
        int res = sol.climbStairs(${n});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.coinChange(int[], int)') {
      const coins = (input.coins || []).join(',')
      const amount = input.amount ?? 0
      return `
        int[] c = new int[]{${coins}};
        int res = sol.coinChange(c, ${amount});
        System.out.println("OUTPUT:" + res);
      `
    }

    if (entrypoint === 'Solution.twoSum(int[], int)') {
      const arrStr = (input.numbers || input.values || []).join(',')
      const target = input.target ?? 0
      return `
        int[] vals = new int[]{${arrStr}};
        int[] res = sol.twoSum(vals, ${target});
        System.out.println("OUTPUT:" + serialize(res));
      `
    }

    // Generic fallback invocation
    return `
      System.out.println("OUTPUT:0");
    `
  }

  static async compileAndExecute({ source, harnessSource }) {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'dsa-eval-'))
    try {
      await writeFile(path.join(tmpDir, 'Solution.java'), source)
      await writeFile(path.join(tmpDir, 'Harness.java'), harnessSource)

      // Step 1: Compile
      const compileResult = await new Promise((resolve) => {
        const javac = spawn('javac', ['-encoding', 'UTF-8', '-d', '.', 'Solution.java', 'Harness.java'], { cwd: tmpDir })
        let stderr = ''
        let timedOut = false
        const timer = setTimeout(() => {
          timedOut = true
          javac.kill('SIGKILL')
        }, COMPILATION_TIMEOUT_MS)

        javac.stderr.on('data', (d) => { stderr += d.toString('utf8') })
        javac.on('error', (err) => {
          clearTimeout(timer)
          resolve({ ok: false, error: err.message, timedOut: false })
        })
        javac.on('close', (code) => {
          clearTimeout(timer)
          if (timedOut) resolve({ ok: false, timedOut: true, stderr: 'Compilation timed out.' })
          else resolve({ ok: code === 0, code, stderr })
        })
      })

      if (!compileResult.ok) {
        const diagnostics = parseCompileErrors(compileResult.stderr)
        return {
          status: 'Compilation Error',
          passed: false,
          feedback: 'Compilation failed. Please fix the compiler diagnostics listed below.',
          diagnostics,
          rawError: compileResult.stderr || 'Compilation failed.',
        }
      }

      // Step 2: Execute
      const execResult = await new Promise((resolve) => {
        const java = spawn('java', ['-Xmx128m', '-XX:+TieredCompilation', '-XX:TieredStopAtLevel=1', '-cp', '.', 'Harness'], { cwd: tmpDir })
        let stdout = ''
        let stderr = ''
        let timedOut = false
        const timer = setTimeout(() => {
          timedOut = true
          java.kill('SIGKILL')
        }, EXECUTION_TIMEOUT_MS)

        java.stdout.on('data', (d) => { stdout += d.toString('utf8') })
        java.stderr.on('data', (d) => { stderr += d.toString('utf8') })
        java.on('error', (err) => {
          clearTimeout(timer)
          resolve({ ok: false, error: err.message, timedOut: false, stdout, stderr })
        })
        java.on('close', (code) => {
          clearTimeout(timer)
          if (timedOut) {
            resolve({ ok: false, timedOut: true, stdout, stderr })
          } else {
            resolve({ ok: code === 0, code, stdout, stderr })
          }
        })
      })

      if (execResult.timedOut) {
        return {
          status: 'Time Limit Exceeded',
          passed: false,
          feedback: `Your program exceeded the ${EXECUTION_TIMEOUT_MS / 1000}s time limit. Check for infinite loops or inefficient recursion.`,
          diagnostics: [],
        }
      }

      if (!execResult.ok && !execResult.stdout.includes('---CASE_START:')) {
        const errorMsg = parseRuntimeError(execResult.stderr, execResult.stdout)
        return {
          status: 'Runtime Error',
          passed: false,
          feedback: `Your program threw a runtime error: ${errorMsg}`,
          error: errorMsg,
          rawError: execResult.stderr,
          diagnostics: [],
        }
      }

      return {
        status: 'EXECUTED',
        stdout: execResult.stdout,
        stderr: execResult.stderr,
      }
    } finally {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    }
  }

  static parseCaseOutputs(stdout, testCases) {
    const results = []
    for (let i = 0; i < testCases.length; i += 1) {
      const startMarker = `---CASE_START:${i}---`
      const endMarker = `---CASE_END:${i}---`
      const startIdx = stdout.indexOf(startMarker)
      const endIdx = stdout.indexOf(endMarker)

      if (startIdx === -1 || endIdx === -1) {
        results.push({
          index: i + 1,
          visibility: testCases[i].visibility || 'sample',
          input: testCases[i].input,
          expected: testCases[i].expected,
          actual: 'Execution did not complete',
          passed: false,
          error: 'Process crashed before completing this test case',
        })
        continue
      }

      const caseBlock = stdout.substring(startIdx + startMarker.length, endIdx).trim()
      let actual = ''
      let error = null
      let timeMs = 0

      const outMatch = /^OUTPUT:(.*)$/m.exec(caseBlock)
      if (outMatch) actual = outMatch[1].trim()

      const errMatch = /^ERROR:(.*)$/m.exec(caseBlock)
      if (errMatch) error = errMatch[1].trim()

      const timeMatch = /^TIME_MS:(\d+)$/m.exec(caseBlock)
      if (timeMatch) timeMs = parseInt(timeMatch[1], 10)

      const passed = !error && valuesEqual(actual, testCases[i].expected)

      results.push({
        index: i + 1,
        visibility: testCases[i].visibility || 'sample',
        input: testCases[i].input,
        expected: testCases[i].expected,
        actual: error ? `Error: ${error}` : actual,
        passed,
        error,
        timeMs,
      })
    }
    return results
  }

  static async run({ assignmentId, source, customInput = null }) {
    if (!source || typeof source !== 'string' || !source.trim()) {
      return { status: 'Compilation Error', passed: false, feedback: 'Source code cannot be empty.' }
    }

    const fixture = javaEvaluationCases[assignmentId]
    if (!fixture) {
      return { status: 'Internal Error', passed: false, feedback: `No evaluation cases configured for ${assignmentId}` }
    }

    const casesToRun = customInput
      ? [{ visibility: 'custom', input: customInput, expected: '' }]
      : fixture.samples.map((c, i) => ({ visibility: 'sample', ...c }))

    const harnessSource = JavaRunner.buildHarnessCode(fixture, casesToRun)
    const exec = await JavaRunner.compileAndExecute({ source, harnessSource })

    if (exec.status !== 'EXECUTED') {
      return exec
    }

    const results = JavaRunner.parseCaseOutputs(exec.stdout, casesToRun)
    const passed = results.every((r) => r.passed)

    return {
      status: passed ? 'Accepted' : 'Run Completed',
      passed,
      results,
      stdout: exec.stdout,
      feedback: customInput
        ? `Output: ${results[0]?.actual || 'No output'}`
        : `${results.filter((r) => r.passed).length}/${results.length} sample test cases matched.`,
    }
  }

  static async evaluate({ assignmentId, source }) {
    if (!source || typeof source !== 'string' || !source.trim()) {
      return { status: 'Compilation Error', passed: false, feedback: 'Source code cannot be empty.' }
    }

    const fixture = javaEvaluationCases[assignmentId]
    if (!fixture) {
      return { status: 'Internal Error', passed: false, feedback: `No evaluation cases configured for ${assignmentId}` }
    }

    const allCases = [
      ...fixture.samples.map((c) => ({ visibility: 'sample', ...c })),
      ...(fixture.additional || []).map((c) => ({ visibility: 'additional', ...c })),
    ]

    const harnessSource = JavaRunner.buildHarnessCode(fixture, allCases)
    const exec = await JavaRunner.compileAndExecute({ source, harnessSource })

    if (exec.status !== 'EXECUTED') {
      return exec
    }

    const results = JavaRunner.parseCaseOutputs(exec.stdout, allCases)
    const sampleResults = results.filter((r) => r.visibility === 'sample')
    const additionalResults = results.filter((r) => r.visibility === 'additional')

    const samplePassed = sampleResults.filter((r) => r.passed).length
    const additionalPassed = additionalResults.filter((r) => r.passed).length
    const totalPassed = results.filter((r) => r.passed).length
    const allPassed = totalPassed === allCases.length

    let status = 'Accepted'
    let feedback = 'Accepted! All test cases passed successfully.'

    if (!allPassed) {
      const firstError = results.find((r) => r.error)
      if (firstError) {
        status = 'Runtime Error'
        feedback = `Runtime Error on Test Case ${firstError.index}: ${firstError.error}`
      } else {
        status = 'Wrong Answer'
        const firstFailed = results.find((r) => !r.passed)
        if (firstFailed) {
          feedback = `Wrong Answer on Test Case ${firstFailed.index}: Expected ${JSON.stringify(firstFailed.expected)}, but got ${JSON.stringify(firstFailed.actual)}.`
        } else {
          feedback = 'Some test cases did not pass. Check edge cases and constraints.'
        }
      }
    }

    return {
      status,
      passed: allPassed,
      totalTests: allCases.length,
      passedTests: totalPassed,
      sampleTests: { passed: samplePassed, total: sampleResults.length },
      additionalTests: { passed: additionalPassed, total: additionalResults.length },
      additionalTestsPassed: additionalPassed === additionalResults.length,
      results: sampleResults, // only expose sample details to user, additional is hidden
      feedback,
      executionTimeMs: Math.max(...results.map((r) => r.timeMs || 0), 2),
    }
  }
}
