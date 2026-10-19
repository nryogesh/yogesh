export const javaDocumentation = [
  {
    id: 'java-platform',
    category: 'Java Basics',
    title: 'Introduction: JDK, JRE, and JVM',
    keywords: 'platform bytecode compiler runtime development kit virtual machine',
    summary: 'Java source is compiled to bytecode. A Java Virtual Machine (JVM) runs that bytecode, while the Java Development Kit (JDK) supplies the compiler and tools used to build programs.',
    example: `// Source code is compiled, then run by a JVM
javac Hello.java
java Hello`,
    output: 'The JVM executes the compiled Hello class on the current platform.',
    mistake: 'The JVM does not compile Java source by itself. The JDK includes the compiler; a runtime environment supplies what is needed to run compiled code.',
    useCase: 'Use the JDK whenever you need to compile, run, or debug Java programs.',
  },
  {
    id: 'first-program',
    category: 'Java Basics',
    title: 'Installation and your first program',
    keywords: 'install setup javac main println hello world',
    summary: 'Install a JDK, confirm that java and javac are available, then save a class whose public class name matches its file name.',
    example: `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
    output: 'Hello, Java!',
    mistake: 'If a class is public, its name and source filename must match exactly, including capitalization (Hello.java for Hello).',
    useCase: 'This small entry point is a useful starting point for command-line tools and programming exercises.',
  },
  {
    id: 'variables-types',
    category: 'Java Basics',
    title: 'Variables and data types',
    keywords: 'primitive reference int long double boolean char String declaration',
    summary: 'A variable has a declared type and a name. Primitive types store simple values; reference types point to objects such as String.',
    example: `int attempts = 3;
double ratio = 0.75;
boolean ready = true;
String language = "Java";`,
    output: 'The variables hold 3, 0.75, true, and "Java" respectively.',
    mistake: 'Local variables must be assigned before they are read. Do not assume an uninitialized local variable receives a default value.',
    useCase: 'Choose a type that represents the values and range your calculation needs.',
  },
  {
    id: 'operators',
    category: 'Java Basics',
    title: 'Operators',
    keywords: 'arithmetic comparison logical assignment precedence modulo',
    summary: 'Operators combine or transform values. Arithmetic operators calculate, comparison operators produce booleans, and logical operators combine conditions.',
    example: `int count = 7;
boolean even = count % 2 == 0;
boolean inRange = count > 0 && count < 10;
System.out.println(inRange);`,
    output: 'true',
    mistake: 'Use == for primitive value comparison, but use equals() to compare String contents. Parenthesize mixed expressions when it improves clarity.',
    useCase: 'Operators are the building blocks of conditions, counters, and numeric calculations.',
  },
  {
    id: 'input-output',
    category: 'Java Basics',
    title: 'Input and output',
    keywords: 'Scanner System.out println input console keyboard',
    summary: 'System.out writes program output. Scanner can read token-based input from System.in; close resources when they are no longer needed.',
    example: `import java.util.Scanner;

Scanner scanner = new Scanner(System.in);
String name = scanner.nextLine();
System.out.println("Hello, " + name);`,
    output: 'For input Ada, prints: Hello, Ada',
    mistake: 'nextInt() leaves the line break behind; a following nextLine() may read that empty remainder. Read or consume the line deliberately.',
    useCase: 'Console input is convenient for small exercises and interactive command-line programs.',
  },
  {
    id: 'conditionals-loops',
    category: 'Java Basics',
    title: 'Conditional statements and loops',
    keywords: 'if else switch for while do iteration branch',
    summary: 'Use if or switch to choose a path. Use for, while, and do-while loops to repeat work while a condition or iteration rule applies.',
    example: `for (int i = 1; i <= 3; i++) {
    if (i % 2 == 0) {
        System.out.println(i + " is even");
    }
}`,
    output: '2 is even',
    mistake: 'Check loop bounds carefully: using < instead of <= is a common source of off-by-one errors. Ensure while loops can eventually stop.',
    useCase: 'Branches model decisions; loops process repeated inputs, ranges, or collection elements.',
  },
  {
    id: 'methods-arrays',
    category: 'Java Basics',
    title: 'Methods and arrays',
    keywords: 'function parameter return array index length',
    summary: 'Methods package reusable operations behind parameters and a return type. Arrays store a fixed-length sequence of values of one type.',
    example: `static int sum(int[] values) {
    int total = 0;
    for (int value : values) total += value;
    return total;
}

int result = sum(new int[] {2, 4, 6});`,
    output: 'result is 12',
    mistake: 'Array indices start at zero and end at length - 1. Accessing outside this range causes ArrayIndexOutOfBoundsException.',
    useCase: 'Use methods to name reusable logic and arrays when the number of elements is fixed.',
  },
  {
    id: 'classes-objects',
    category: 'Object-Oriented Programming',
    title: 'Classes and objects',
    keywords: 'class object instance field state behavior method',
    summary: 'A class describes fields and methods. An object is a particular instance with its own state.',
    example: `class Counter {
    int value;
    void increment() { value++; }
}

Counter counter = new Counter();
counter.increment();`,
    output: 'counter.value is 1',
    mistake: 'A class declaration describes a type; it does not create an object until you instantiate it.',
    useCase: 'Model related state and behavior together, such as a counter, user, or bank account.',
  },
  {
    id: 'constructors-this',
    category: 'Object-Oriented Programming',
    title: 'Constructors and this',
    keywords: 'initialize constructor parameter field this object',
    summary: 'A constructor initializes a new object and has the same name as its class. this refers to the current instance.',
    example: `class Point {
    final int x;
    Point(int x) { this.x = x; }
}

Point origin = new Point(0);`,
    output: 'origin.x is 0',
    mistake: 'Constructors have no return type—not even void. If you declare any constructor, Java will not add the no-argument constructor automatically.',
    useCase: 'Use constructors to establish required object state at creation time.',
  },
  {
    id: 'encapsulation',
    category: 'Object-Oriented Programming',
    title: 'Encapsulation',
    keywords: 'private public getter setter invariant access control',
    summary: 'Encapsulation keeps implementation details private and exposes controlled operations that protect an object’s valid state.',
    example: `class Thermostat {
    private int temperature;
    public int getTemperature() { return temperature; }
    public void setTemperature(int value) {
        if (value >= 0) temperature = value;
    }
}`,
    output: 'Values below zero are ignored; the field cannot be accessed directly from other classes.',
    mistake: 'Making every field public allows callers to bypass validation and makes later changes harder.',
    useCase: 'Use encapsulation to enforce invariants and keep APIs stable as implementations evolve.',
  },
  {
    id: 'inheritance-super',
    category: 'Object-Oriented Programming',
    title: 'Inheritance and super',
    keywords: 'extends superclass subclass override super constructor',
    summary: 'A subclass extends one superclass and can specialize its behavior. super refers to superclass members and constructors.',
    example: `class Animal {
    Animal(String name) { System.out.println(name); }
}
class Dog extends Animal {
    Dog() { super("Rex"); }
}`,
    output: 'Creating new Dog() prints Rex.',
    mistake: 'Java classes have single inheritance. Also, a super(...) constructor call must be the first statement in a constructor.',
    useCase: 'Use inheritance for a genuine “is-a” relationship with shared behavior; prefer composition for unrelated capabilities.',
  },
  {
    id: 'polymorphism',
    category: 'Object-Oriented Programming',
    title: 'Polymorphism',
    keywords: 'runtime dispatch overriding interface reference subtype',
    summary: 'A superclass or interface reference can point to different implementations. Overridden instance methods are selected at runtime.',
    example: `interface Speaker { String speak(); }
class Cat implements Speaker {
    public String speak() { return "meow"; }
}
Speaker pet = new Cat();
System.out.println(pet.speak());`,
    output: 'meow',
    mistake: 'The reference type controls which members are available at compile time; the object type determines the overridden method implementation.',
    useCase: 'Polymorphism lets calling code work with interchangeable implementations through one shared API.',
  },
  {
    id: 'abstraction-interfaces',
    category: 'Object-Oriented Programming',
    title: 'Abstraction and interfaces',
    keywords: 'abstract class interface implements contract default method',
    summary: 'Abstraction exposes a useful contract while hiding implementation details. Interfaces define behavior that unrelated classes can implement.',
    example: `interface Shape {
    double area();
}
class Square implements Shape {
    private final double side;
    Square(double side) { this.side = side; }
    public double area() { return side * side; }
}`,
    output: 'new Square(3).area() returns 9.0.',
    mistake: 'A concrete class must implement inherited abstract interface methods, and an implementation must be public.',
    useCase: 'Define interfaces at boundaries where multiple implementations should be usable in the same way.',
  },
  {
    id: 'strings-builder',
    category: 'Core Java',
    title: 'Strings and StringBuilder',
    keywords: 'String immutable concatenation mutable text equality',
    summary: 'String values are immutable. StringBuilder offers a mutable buffer for assembling text through repeated changes.',
    example: `StringBuilder message = new StringBuilder();
message.append("Hello");
message.append(", Java");
System.out.println(message.toString());`,
    output: 'Hello, Java',
    mistake: 'Use equals() to compare String contents; == compares object identity. Repeated concatenation in a large loop can create many temporary strings.',
    useCase: 'Use String for ordinary text and StringBuilder for repeated appends in a loop.',
  },
  {
    id: 'exception-handling',
    category: 'Core Java',
    title: 'Exception handling',
    keywords: 'try catch finally throw checked unchecked errors',
    summary: 'Exceptions report exceptional conditions. Use try/catch to handle errors you can recover from and try-with-resources to close resources.',
    example: `try {
    int value = Integer.parseInt("42");
    System.out.println(value);
} catch (NumberFormatException error) {
    System.out.println("Not a number");
}`,
    output: '42',
    mistake: 'Avoid catching Exception merely to silence errors. Catch the specific failure you can handle, and do not discard useful diagnostics.',
    useCase: 'Handle malformed user input, file failures, and other expected operational errors.',
  },
  {
    id: 'packages-access',
    category: 'Core Java',
    title: 'Packages and access modifiers',
    keywords: 'package import public protected private default namespace visibility',
    summary: 'Packages organize related types and prevent naming collisions. Access modifiers control where classes and members can be used.',
    example: `package example.geometry;

public class Circle {
    private final double radius;
    public Circle(double radius) { this.radius = radius; }
}`,
    output: 'The class belongs to example.geometry; its radius is private while its constructor is public.',
    mistake: 'A package declaration, when present, comes before imports and type declarations. Package names are case-sensitive.',
    useCase: 'Use packages to group modules and expose only the types that other parts of an application need.',
  },
  {
    id: 'wrappers-generics',
    category: 'Core Java',
    title: 'Wrapper classes and generics',
    keywords: 'Integer Boolean autoboxing type parameter generic collection',
    summary: 'Wrapper classes such as Integer represent primitive values as objects. Generics express the element type a class or method uses.',
    example: `List<Integer> scores = new ArrayList<>();
scores.add(95);
int first = scores.get(0);`,
    output: 'first is 95; Java automatically converts between int and Integer here.',
    mistake: 'Unboxing a null wrapper throws NullPointerException. Generic type arguments cannot be primitive types; use wrappers such as Integer.',
    useCase: 'Generics give collections and reusable APIs compile-time type checks without repetitive casts.',
  },
  {
    id: 'collections-framework',
    category: 'Core Java',
    title: 'Collections Framework',
    keywords: 'Collection Collections interface data structures iterable',
    summary: 'The Collections Framework provides interfaces and implementations for groups of objects, plus algorithms such as sorting and searching.',
    example: `List<String> names = new ArrayList<>();
names.add("Mina");
names.add("Bo");
Collections.sort(names);
System.out.println(names);`,
    output: '[Bo, Mina]',
    mistake: 'Collection is an interface for groups of elements; Collections is a utility class with static algorithms. They are different names.',
    useCase: 'Choose a collection by the operations and ordering guarantees your program needs.',
  },
  {
    id: 'list-set-map-queue-deque',
    category: 'Core Java',
    title: 'List, Set, Map, Queue, and Deque',
    keywords: 'ArrayList HashSet HashMap Queue ArrayDeque ordering keys values',
    summary: 'List keeps an ordered sequence, Set prevents duplicates, Map associates keys with values, Queue processes elements in order, and Deque supports both ends.',
    example: `List<String> list = new ArrayList<>();
Set<String> unique = new HashSet<>();
Map<String, Integer> counts = new HashMap<>();
Deque<Integer> ends = new ArrayDeque<>();`,
    output: 'Each variable is typed to an interface and backed by a suitable implementation.',
    mistake: 'Do not rely on HashMap or HashSet iteration order. Use an ordered implementation if iteration order is part of your requirement.',
    useCase: 'Use ArrayList for indexed sequences, HashSet for membership, HashMap for lookup, and ArrayDeque for queue/stack behavior.',
  },
  {
    id: 'file-handling',
    category: 'Core Java',
    title: 'File handling',
    keywords: 'Files Path readString writeString IOException try resources',
    summary: 'The java.nio.file API provides Path values and Files operations for reading and writing files. File operations can fail and report IOException.',
    example: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileExample {
    public static void main(String[] args) throws IOException {
        Path path = Path.of("notes.txt");
        Files.writeString(path, "Java notes");
        String text = Files.readString(path);
        System.out.println(text);
    }
}`,
    output: 'Java notes',
    mistake: 'File paths and permissions depend on the environment. Handle IOException rather than assuming a file operation always succeeds.',
    useCase: 'Use Path and Files for small text files, configuration, and straightforward file operations.',
  },
  {
    id: 'lambdas-streams',
    category: 'Core Java',
    title: 'Lambda expressions and streams',
    keywords: 'functional interface lambda filter map collect pipeline',
    summary: 'A lambda provides an implementation of a functional interface. Streams express a sequence of data transformations and terminal operations; Stream.toList() is available in Java 16 and later.',
    example: `List<Integer> values = List.of(1, 2, 3, 4);
List<Integer> doubled = values.stream()
    .filter(value -> value % 2 == 0)
    .map(value -> value * 2)
    .toList();
System.out.println(doubled);`,
    output: '[4, 8]',
    mistake: 'Intermediate stream operations are lazy; a terminal operation is needed to produce a result. A stream should not be reused after it is consumed.',
    useCase: 'Streams are useful for readable filter/map/reduce pipelines; use ordinary loops when they make control flow clearer.',
  },
  {
    id: 'array-operations',
    category: 'Java for DSA',
    title: 'Array operations',
    keywords: 'array traversal insert delete search index complexity',
    summary: 'Arrays provide constant-time indexed access and fixed capacity. Traversal is linear; inserting into the middle requires shifting later elements.',
    example: `int[] values = {4, 7, 9};
int targetIndex = 1;
for (int i = targetIndex; i < values.length - 1; i++) {
    values[i] = values[i + 1];
}`,
    output: 'After the shift, the first two values are 4 and 9 (the logical length must be tracked separately).',
    mistake: 'An array cannot shrink when an element is removed. Track a logical size or copy into a new array.',
    useCase: 'Arrays are a good fit when size is known and indexed access is important.',
    complexity: 'Access/update by index: O(1); scan: O(n); insert/delete in the middle: O(n) due to shifting.',
  },
  {
    id: 'string-problems',
    category: 'Java for DSA',
    title: 'String problems',
    keywords: 'character frequency palindrome substring StringBuilder complexity',
    summary: 'Strings are immutable sequences of characters. For character-by-character problems, use charAt or a character array, and define whether Unicode code points matter.',
    example: `String word = "level";
boolean palindrome = true;
for (int left = 0, right = word.length() - 1; left < right; left++, right--) {
    if (word.charAt(left) != word.charAt(right)) palindrome = false;
}
System.out.println(palindrome);`,
    output: 'true',
    mistake: 'Repeatedly building a new string inside a loop can add avoidable copying. Also, a Java char is a UTF-16 code unit, not always a complete Unicode character.',
    useCase: 'Two-pointer scans solve palindrome and reverse checks; frequency arrays or maps help with anagram problems.',
    complexity: 'The palindrome scan takes O(n) time and O(1) extra space for indexed access.',
  },
  {
    id: 'recursion',
    category: 'Java for DSA',
    title: 'Recursion',
    keywords: 'base case recursive call stack factorial complexity',
    summary: 'A recursive method solves a problem by calling itself on smaller input. A base case stops the calls.',
    example: `static int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
    output: 'factorial(5) returns 120.',
    mistake: 'Without a reachable base case, recursion can overflow the call stack. Deep inputs may need an iterative solution.',
    useCase: 'Recursion naturally describes tree traversal, divide-and-conquer, and backtracking.',
    complexity: 'This factorial example uses O(n) time and O(n) call-stack space.',
  },
  {
    id: 'search-sort',
    category: 'Java for DSA',
    title: 'Searching and sorting',
    keywords: 'linear search binary search Arrays.sort merge quick complexity',
    summary: 'Linear search checks items one at a time. Binary search repeatedly halves a sorted search interval. Sorting orders items for later processing.',
    example: `int[] sorted = {2, 5, 8, 12};
int index = Arrays.binarySearch(sorted, 8);
System.out.println(index);`,
    output: '2',
    mistake: 'Binary search requires sorted input. When implementing it, use a safe midpoint such as low + (high - low) / 2.',
    useCase: 'Sort before repeated ordered queries; use linear search when data is small or unsorted and only searched once.',
    complexity: 'Linear search: O(n). Binary search: O(log n). Comparison sorting is typically O(n log n); Arrays.sort behavior depends on the overload and element type.',
  },
  {
    id: 'linked-lists',
    category: 'Java for DSA',
    title: 'Linked lists',
    keywords: 'node next pointer singly doubly traversal complexity',
    summary: 'A linked list stores values in nodes connected by references. Unlike arrays, it does not require contiguous storage, but reaching an index requires traversal.',
    example: `class Node {
    int value;
    Node next;
    Node(int value) { this.value = value; }
}
Node head = new Node(10);
head.next = new Node(20);`,
    output: 'head points to 10, whose next node contains 20.',
    mistake: 'Save the next reference before changing links during reversal or deletion; otherwise the rest of the chain can become unreachable.',
    useCase: 'Linked nodes are useful when practicing pointer manipulation or when frequent insertion/removal at known nodes matters.',
    complexity: 'Search/index access: O(n). Insert/delete at the head or a known node: O(1), excluding the cost of finding that node.',
  },
  {
    id: 'stacks-queues',
    category: 'Java for DSA',
    title: 'Stacks and queues',
    keywords: 'LIFO FIFO push pop offer poll ArrayDeque complexity',
    summary: 'A stack is last-in, first-out; a queue is first-in, first-out. Deque supports both patterns and is commonly used instead of the legacy Stack class.',
    example: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
System.out.println(stack.pop());`,
    output: '2',
    mistake: 'Check whether an operation throws on empty input or returns a special value. For queues, offer/poll/peek avoid exception-based empty handling.',
    useCase: 'Stacks support undo, parsing, and DFS; queues support scheduling and breadth-first search.',
    complexity: 'ArrayDeque push/pop and queue-end operations are amortized O(1).',
  },
  {
    id: 'hashing',
    category: 'Java for DSA',
    title: 'Hashing',
    keywords: 'HashMap HashSet hashCode equals collision frequency lookup',
    summary: 'Hash tables use hash codes to find candidate buckets and equality to distinguish keys. HashMap and HashSet provide expected constant-time lookup.',
    example: `Map<String, Integer> frequency = new HashMap<>();
for (String word : List.of("a", "b", "a")) {
    frequency.merge(word, 1, Integer::sum);
}
System.out.println(frequency.get("a"));`,
    output: '2',
    mistake: 'Keys should have stable equals() and hashCode() values while stored. Equal objects must return equal hash codes.',
    useCase: 'Use hashing for counts, deduplication, membership checks, and mapping IDs to records.',
    complexity: 'Expected insert/search/delete: O(1); worst-case behavior can degrade with collisions.',
  },
  {
    id: 'trees-bst',
    category: 'Java for DSA',
    title: 'Trees and binary search trees',
    keywords: 'tree node traversal preorder inorder postorder BST complexity',
    summary: 'A tree represents hierarchical nodes. In a binary search tree, values in the left subtree are smaller and values in the right subtree are larger, according to its ordering rule.',
    example: `class TreeNode {
    int value;
    TreeNode left, right;
    TreeNode(int value) { this.value = value; }
}
static void inorder(TreeNode node) {
    if (node == null) return;
    inorder(node.left);
    System.out.println(node.value);
    inorder(node.right);
}`,
    output: 'Inorder traversal of a valid BST prints its values in sorted order.',
    mistake: 'An ordinary BST can become skewed. Do not assume logarithmic height unless the tree is balanced.',
    useCase: 'Trees model hierarchical data; BSTs support ordered lookup and traversal.',
    complexity: 'Traversal: O(n). BST search/insert: O(h), where h is height; balanced O(log n), skewed O(n).',
  },
  {
    id: 'heaps-priority-queues',
    category: 'Java for DSA',
    title: 'Heaps and priority queues',
    keywords: 'PriorityQueue min heap max heap comparator complexity',
    summary: 'A heap keeps the highest-priority element at its root. Java PriorityQueue is a min-heap by default; a comparator can reverse the priority.',
    example: `PriorityQueue<Integer> smallestFirst = new PriorityQueue<>();
smallestFirst.add(8);
smallestFirst.add(3);
System.out.println(smallestFirst.remove());`,
    output: '3',
    mistake: 'PriorityQueue iteration is not sorted order. Repeatedly remove elements to process them by priority.',
    useCase: 'Use a priority queue for top-k problems, event scheduling, and Dijkstra-style algorithms.',
    complexity: 'Peek: O(1); offer/remove head: O(log n); building from n values can be O(n).',
  },
  {
    id: 'graphs',
    category: 'Java for DSA',
    title: 'Graphs',
    keywords: 'adjacency list BFS DFS visited shortest path complexity',
    summary: 'A graph has vertices connected by edges. An adjacency list stores each vertex’s neighbors and is often space-efficient for sparse graphs.',
    example: `List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < 3; i++) graph.add(new ArrayList<>());
graph.get(0).add(1);
graph.get(1).add(2);`,
    output: 'The directed edges are 0 → 1 and 1 → 2.',
    mistake: 'Mark vertices visited when enqueuing or before descending, not only after processing, to avoid repeated work on cycles.',
    useCase: 'Graphs model roads, dependencies, networks, and relationships. BFS finds shortest paths in unweighted graphs.',
    complexity: 'BFS/DFS with adjacency lists: O(V + E) time and O(V) extra space.',
  },
  {
    id: 'backtracking',
    category: 'Java for DSA',
    title: 'Backtracking',
    keywords: 'choose explore undo permutations subsets complexity',
    summary: 'Backtracking explores a choice, recurses on the partial solution, then undoes the choice before trying another branch.',
    example: `static void subsets(int[] values, int index, List<Integer> path) {
    if (index == values.length) {
        System.out.println(path);
        return;
    }
    subsets(values, index + 1, path);
    path.add(values[index]);
    subsets(values, index + 1, path);
    path.remove(path.size() - 1);
}`,
    output: 'For [1, 2], the recursion visits [], [2], [1], and [1, 2].',
    mistake: 'Always undo mutations before returning to a sibling branch. Otherwise one candidate leaks state into another.',
    useCase: 'Use backtracking for permutations, combinations, constraint puzzles, and path enumeration.',
    complexity: 'Generating all subsets takes O(2^n) leaves and O(n) recursion depth, excluding output storage.',
  },
  {
    id: 'greedy-algorithms',
    category: 'Java for DSA',
    title: 'Greedy algorithms',
    keywords: 'greedy local choice proof interval scheduling complexity',
    summary: 'A greedy algorithm repeatedly takes a locally best-looking choice. It is correct only when that choice can be shown to lead to a global optimum.',
    example: `int[][] intervals = {{1, 3}, {2, 4}, {3, 5}};
Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
int count = 0;
int end = Integer.MIN_VALUE;
for (int[] interval : intervals) {
    if (interval[0] >= end) {
        count++;
        end = interval[1];
    }
}`,
    output: 'The interval-selection scan chooses 2 non-overlapping intervals.',
    mistake: 'A plausible local rule is not a proof. Test counterexamples and justify why an optimal solution can use the greedy choice.',
    useCase: 'Interval scheduling is a classic greedy problem when intervals are sorted by finish time.',
    complexity: 'Sorting n intervals takes O(n log n); the scan is O(n).',
  },
  {
    id: 'dynamic-programming',
    category: 'Java for DSA',
    title: 'Dynamic programming',
    keywords: 'DP memoization tabulation overlapping subproblems recurrence complexity',
    summary: 'Dynamic programming stores solutions to overlapping subproblems. Memoization caches recursive results; tabulation fills a table in dependency order.',
    example: `int[] dp = new int[n + 1];
dp[0] = 0;
if (n >= 1) dp[1] = 1;
for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
}`,
    output: 'For n = 6, dp[6] is 8.',
    mistake: 'Define the state and base cases before writing transitions. Incorrect update order can overwrite values needed later.',
    useCase: 'Use DP when a problem has overlapping subproblems and an optimal-substructure recurrence, such as Fibonacci or knapsack.',
    complexity: 'This Fibonacci tabulation takes O(n) time and O(n) space; a rolling pair reduces extra space to O(1).',
  },
]

export const javaDocumentationCategories = [
  'Java Basics',
  'Object-Oriented Programming',
  'Core Java',
  'Java for DSA',
]
