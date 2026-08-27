"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
  BookOpen,
  Lock,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Level = "beginner" | "intermediate" | "advanced";

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Skill = {
  id: string;
  name: string;
  category: string;
};

type StudentSkill = {
  skill_id: string;
  proficiency: number;
  skill_level: Level | null;
};

type AssessmentHistory = {
  skill_id: string;
  assessment_level: Level;
  overall_score: number;
  passed: boolean;
};

const PASS_MARK = 70;

const LEVEL_INFO: Record<
  Level,
  {
    title: string;
    subtitle: string;
    color: string;
  }
> = {
  beginner: {
    title: "Beginner",
    subtitle: "Build your fundamentals",
    color: "emerald",
  },
  intermediate: {
    title: "Intermediate",
    subtitle: "Demonstrate practical knowledge",
    color: "amber",
  },
  advanced: {
    title: "Advanced",
    subtitle: "Demonstrate deeper expertise",
    color: "cyan",
  },
};

/*
|--------------------------------------------------------------------------
| HARD-CODED QUESTION BANK
|--------------------------------------------------------------------------
|
| For the prototype we keep questions here.
|
| Later:
|
| Skill Material
|      ↓
| AI Question Generator
|      ↓
| Same assessment UI
|
|--------------------------------------------------------------------------
*/

const QUESTION_BANK: Record<
  string,
  Record<Level, Question[]>
> = {
  "Data Structures & Algorithms": {
    beginner: [
      {
        id: 1,
        question:
          "What is the time complexity of accessing an element in an array by index?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        answer: 0,
        explanation:
          "Array elements can be accessed directly using their index, so the operation is O(1).",
      },
      {
        id: 2,
        question:
          "Which data structure follows the FIFO principle?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: 1,
        explanation:
          "FIFO means First In, First Out, which is the defining behavior of a queue.",
      },
      {
        id: 3,
        question:
          "Which data structure follows the LIFO principle?",
        options: ["Queue", "Array", "Stack", "Linked List"],
        answer: 2,
        explanation:
          "A stack follows Last In, First Out.",
      },
      {
        id: 4,
        question:
          "Which algorithm checks elements one by one until the target is found?",
        options: [
          "Binary Search",
          "Linear Search",
          "Merge Sort",
          "Heap Sort",
        ],
        answer: 1,
        explanation:
          "Linear search sequentially checks each element.",
      },
      {
        id: 5,
        question:
          "What does Big-O notation primarily describe?",
        options: [
          "Variable names",
          "Program output",
          "Algorithm growth rate",
          "Programming language",
        ],
        answer: 2,
        explanation:
          "Big-O describes how an algorithm's resource requirements grow as input size increases.",
      },
      {
        id: 6,
        question:
          "What is the first index of a zero-indexed array?",
        options: ["0", "1", "-1", "Depends on the language"],
        answer: 0,
        explanation:
          "In zero-indexed arrays, the first element is stored at index 0.",
      },
      {
        id: 7,
        question:
          "Which structure is commonly used to manage function calls?",
        options: ["Queue", "Stack", "Graph", "Heap"],
        answer: 1,
        explanation:
          "Function calls are managed using a call stack.",
      },
      {
        id: 8,
        question:
          "Which sorting algorithm repeatedly compares adjacent elements?",
        options: [
          "Bubble Sort",
          "Binary Search",
          "DFS",
          "Dijkstra",
        ],
        answer: 0,
        explanation:
          "Bubble sort repeatedly compares and swaps adjacent elements.",
      },
      {
        id: 9,
        question:
          "Which structure stores data as key-value pairs?",
        options: ["Stack", "Hash Map", "Queue", "Linked List"],
        answer: 1,
        explanation:
          "A hash map stores values associated with keys.",
      },
      {
        id: 10,
        question:
          "Which traversal visits the root before its children?",
        options: [
          "Inorder",
          "Postorder",
          "Preorder",
          "Level order only",
        ],
        answer: 2,
        explanation:
          "Preorder traversal visits Root → Left → Right.",
      },
    ],

    intermediate: [
      {
        id: 1,
        question:
          "What is the time complexity of binary search on a sorted array?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        answer: 1,
        explanation:
          "Binary search halves the search space at each step.",
      },
      {
        id: 2,
        question:
          "Which traversal is commonly used to find the shortest path in an unweighted graph?",
        options: ["DFS", "BFS", "Inorder", "Postorder"],
        answer: 1,
        explanation:
          "BFS explores nodes level by level and finds shortest paths in unweighted graphs.",
      },
      {
        id: 3,
        question:
          "What is the average lookup complexity of a well-designed hash table?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        answer: 2,
        explanation:
          "Average-case hash table lookup is O(1).",
      },
      {
        id: 4,
        question:
          "Which data structure is commonly used to implement a priority queue?",
        options: ["Heap", "Stack", "Array only", "Linked list only"],
        answer: 0,
        explanation:
          "A heap efficiently supports priority queue operations.",
      },
      {
        id: 5,
        question:
          "What is the typical time complexity of inserting at the head of a linked list?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        answer: 0,
        explanation:
          "Inserting at the head requires changing a constant number of pointers.",
      },
      {
        id: 6,
        question:
          "Which technique solves a problem by dividing it into smaller independent subproblems?",
        options: [
          "Divide and conquer",
          "Hashing",
          "Linear probing",
          "Greedy sorting",
        ],
        answer: 0,
        explanation:
          "Divide and conquer breaks a problem into smaller subproblems and combines their results.",
      },
      {
        id: 7,
        question:
          "Which tree property allows binary search trees to support ordered searching?",
        options: [
          "All nodes have two children",
          "Left subtree values are smaller and right subtree values are larger",
          "Every node is balanced",
          "The root is always the smallest",
        ],
        answer: 1,
        explanation:
          "The BST ordering property places smaller values on the left and larger values on the right.",
      },
      {
        id: 8,
        question:
          "What is recursion?",
        options: [
          "A loop without a condition",
          "A function calling itself",
          "Sorting an array",
          "Storing values in a queue",
        ],
        answer: 1,
        explanation:
          "Recursion occurs when a function calls itself to solve smaller instances of a problem.",
      },
      {
        id: 9,
        question:
          "Which sorting algorithm has average-case O(n log n) complexity?",
        options: [
          "Bubble Sort",
          "Merge Sort",
          "Linear Search",
          "Selection of minimum only",
        ],
        answer: 1,
        explanation:
          "Merge sort runs in O(n log n) time.",
      },
      {
        id: 10,
        question:
          "What is the purpose of a base case in recursion?",
        options: [
          "To increase recursion depth",
          "To stop recursive calls",
          "To sort the input",
          "To allocate a queue",
        ],
        answer: 1,
        explanation:
          "The base case provides the condition that stops recursion.",
      },
    ],

    advanced: [
      {
        id: 1,
        question:
          "Which algorithm is commonly used to find shortest paths from a source in a graph with non-negative edge weights?",
        options: [
          "Dijkstra's algorithm",
          "Binary Search",
          "Kruskal's algorithm only",
          "DFS",
        ],
        answer: 0,
        explanation:
          "Dijkstra's algorithm finds shortest paths from a source when edge weights are non-negative.",
      },
      {
        id: 2,
        question:
          "What is the main idea behind dynamic programming?",
        options: [
          "Always choose the largest value",
          "Store solutions to overlapping subproblems",
          "Avoid all recursion",
          "Use only graphs",
        ],
        answer: 1,
        explanation:
          "Dynamic programming stores solutions to overlapping subproblems to avoid repeated computation.",
      },
      {
        id: 3,
        question:
          "Which algorithm is commonly used to find a minimum spanning tree?",
        options: [
          "Kruskal's algorithm",
          "Binary Search",
          "BFS only",
          "Fibonacci Search",
        ],
        answer: 0,
        explanation:
          "Kruskal's algorithm builds a minimum spanning tree by selecting edges in increasing weight order.",
      },
      {
        id: 4,
        question:
          "What is the worst-case time complexity of quicksort?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
        answer: 3,
        explanation:
          "Poor pivot choices can produce partitions of size n-1 and 0, leading to O(n²).",
      },
      {
        id: 5,
        question:
          "What does memoization primarily improve in recursive algorithms?",
        options: [
          "It increases repeated calculations",
          "It stores previous results",
          "It removes all data structures",
          "It guarantees O(1)",
        ],
        answer: 1,
        explanation:
          "Memoization caches previously computed results.",
      },
      {
        id: 6,
        question:
          "Which problem is a classic example of dynamic programming?",
        options: [
          "Fibonacci with memoization",
          "Printing Hello World",
          "Reading one array element",
          "Variable declaration",
        ],
        answer: 0,
        explanation:
          "Fibonacci is a classic example because the recursive version has overlapping subproblems.",
      },
      {
        id: 7,
        question:
          "Which data structure is useful for efficiently implementing Dijkstra's algorithm?",
        options: [
          "Priority Queue",
          "Stack only",
          "Plain string",
          "Binary search only",
        ],
        answer: 0,
        explanation:
          "A priority queue efficiently retrieves the next minimum-distance vertex.",
      },
      {
        id: 8,
        question:
          "What is the purpose of a topological ordering?",
        options: [
          "Ordering vertices of a DAG according to dependencies",
          "Sorting an array randomly",
          "Finding duplicate strings",
          "Balancing a heap",
        ],
        answer: 0,
        explanation:
          "A topological ordering arranges vertices of a directed acyclic graph according to dependencies.",
      },
      {
        id: 9,
        question:
          "Which technique is particularly useful when a problem has optimal substructure and overlapping subproblems?",
        options: [
          "Dynamic Programming",
          "Linear Search",
          "Bubble Sort",
          "Simple traversal",
        ],
        answer: 0,
        explanation:
          "Dynamic programming is designed for optimal substructure with overlapping subproblems.",
      },
      {
        id: 10,
        question:
          "What is the space complexity of storing an adjacency matrix for a graph with V vertices?",
        options: ["O(V)", "O(log V)", "O(V²)", "O(1)"],
        answer: 2,
        explanation:
          "An adjacency matrix stores V × V possible relationships.",
      },
    ],
  },

  Java: {
    beginner: [
      {
        id: 1,
        question: "Which keyword is used to define a class in Java?",
        options: ["class", "define", "struct", "object"],
        answer: 0,
        explanation: "The class keyword declares a Java class.",
      },
      {
        id: 2,
        question:
          "Which method is the standard entry point of a Java application?",
        options: [
          "start()",
          "main()",
          "run()",
          "execute()",
        ],
        answer: 1,
        explanation:
          "Java applications conventionally start execution from public static void main(String[] args).",
      },
      {
        id: 3,
        question:
          "Which keyword creates a new object in Java?",
        options: ["create", "new", "object", "instance"],
        answer: 1,
        explanation:
          "The new keyword creates an object.",
      },
      {
        id: 4,
        question:
          "Which primitive type stores true or false?",
        options: ["boolean", "int", "char", "float"],
        answer: 0,
        explanation:
          "boolean stores true or false values.",
      },
      {
        id: 5,
        question:
          "Which symbol terminates most Java statements?",
        options: [".", ";", ":", ","],
        answer: 1,
        explanation:
          "Most Java statements end with a semicolon.",
      },
      {
        id: 6,
        question:
          "Which keyword is used to inherit from a class?",
        options: ["implements", "extends", "inherits", "super"],
        answer: 1,
        explanation:
          "A class extends another class using extends.",
      },
      {
        id: 7,
        question:
          "Which collection stores elements in key-value pairs?",
        options: ["ArrayList", "HashMap", "Stack", "Queue"],
        answer: 1,
        explanation:
          "HashMap stores key-value mappings.",
      },
      {
        id: 8,
        question:
          "Which keyword prevents a variable from being reassigned?",
        options: ["static", "final", "private", "fixed"],
        answer: 1,
        explanation:
          "A final variable cannot be reassigned after initialization.",
      },
      {
        id: 9,
        question:
          "Which access modifier allows access from anywhere?",
        options: ["private", "protected", "public", "package"],
        answer: 2,
        explanation:
          "public members can be accessed wherever the class is accessible.",
      },
      {
        id: 10,
        question:
          "Java source code is compiled into what?",
        options: [
          "Machine code only",
          "Bytecode",
          "HTML",
          "SQL",
        ],
        answer: 1,
        explanation:
          "Java source is compiled into bytecode executed by the JVM.",
      },
    ],

    intermediate: [
      {
        id: 1,
        question:
          "What is method overloading?",
        options: [
          "Same method name with different parameter lists",
          "Replacing a class",
          "Deleting a method",
          "Creating multiple packages",
        ],
        answer: 0,
        explanation:
          "Method overloading uses the same method name with different parameter lists.",
      },
      {
        id: 2,
        question:
          "Which interface is commonly used to define a task that returns a value?",
        options: [
          "Runnable",
          "Callable",
          "Serializable",
          "Cloneable",
        ],
        answer: 1,
        explanation:
          "Callable represents a task that can return a result and throw an exception.",
      },
      {
        id: 3,
        question:
          "Which collection does not allow duplicate elements?",
        options: ["List", "Set", "Map", "Array"],
        answer: 1,
        explanation:
          "Set collections do not allow duplicate elements.",
      },
      {
        id: 4,
        question:
          "What is encapsulation?",
        options: [
          "Bundling data and methods while controlling access",
          "Running multiple programs",
          "Sorting objects",
          "Creating threads only",
        ],
        answer: 0,
        explanation:
          "Encapsulation combines data and behavior and controls access to internal state.",
      },
      {
        id: 5,
        question:
          "Which exception must generally be handled or declared?",
        options: [
          "Checked exception",
          "RuntimeException only",
          "Error only",
          "Null value",
        ],
        answer: 0,
        explanation:
          "Checked exceptions must generally be caught or declared.",
      },
      {
        id: 6,
        question:
          "Which interface is commonly used for sorting objects?",
        options: [
          "Comparable",
          "Runnable",
          "Iterable",
          "Serializable",
        ],
        answer: 0,
        explanation:
          "Comparable defines a natural ordering for objects.",
      },
      {
        id: 7,
        question:
          "What does the JVM do?",
        options: [
          "Executes Java bytecode",
          "Writes Java source code",
          "Creates SQL tables",
          "Designs web pages",
        ],
        answer: 0,
        explanation:
          "The JVM executes Java bytecode.",
      },
      {
        id: 8,
        question:
          "Which keyword refers to the current object?",
        options: ["self", "current", "this", "object"],
        answer: 2,
        explanation:
          "this refers to the current object.",
      },
      {
        id: 9,
        question:
          "Which keyword is used to call a parent class constructor or member?",
        options: ["parent", "base", "super", "extends"],
        answer: 2,
        explanation:
          "super refers to the parent class.",
      },
      {
        id: 10,
        question:
          "Which collection provides fast indexed access?",
        options: [
          "ArrayList",
          "HashSet",
          "HashMap",
          "TreeSet",
        ],
        answer: 0,
        explanation:
          "ArrayList provides efficient indexed access.",
      },
    ],

    advanced: [
      {
        id: 1,
        question:
          "What is the main purpose of the Java Garbage Collector?",
        options: [
          "Compile source code",
          "Automatically reclaim unreachable objects",
          "Create threads",
          "Encrypt variables",
        ],
        answer: 1,
        explanation:
          "Garbage collection automatically reclaims memory from objects that are no longer reachable.",
      },
      {
        id: 2,
        question:
          "Which feature allows multiple tasks to execute concurrently?",
        options: [
          "Multithreading",
          "Encapsulation",
          "Inheritance only",
          "Packages",
        ],
        answer: 0,
        explanation:
          "Multithreading enables concurrent execution of tasks.",
      },
      {
        id: 3,
        question:
          "What does synchronized help control?",
        options: [
          "Access to shared resources between threads",
          "Class names",
          "Package names",
          "Compilation",
        ],
        answer: 0,
        explanation:
          "synchronized helps prevent unsafe concurrent access to shared state.",
      },
      {
        id: 4,
        question:
          "What is the purpose of an immutable object?",
        options: [
          "Its state cannot be changed after creation",
          "It always uses threads",
          "It cannot be instantiated",
          "It must be abstract",
        ],
        answer: 0,
        explanation:
          "An immutable object's state remains unchanged after creation.",
      },
      {
        id: 5,
        question:
          "Which Java feature allows a class to implement multiple contracts?",
        options: [
          "Multiple class inheritance",
          "Multiple interfaces",
          "Multiple constructors only",
          "Packages",
        ],
        answer: 1,
        explanation:
          "A Java class can implement multiple interfaces.",
      },
      {
        id: 6,
        question:
          "What problem can occur when two threads wait indefinitely for each other's locks?",
        options: ["Overflow", "Deadlock", "Compilation", "Casting"],
        answer: 1,
        explanation:
          "This situation is called deadlock.",
      },
      {
        id: 7,
        question:
          "What is a functional interface?",
        options: [
          "An interface with exactly one abstract method",
          "Any interface with many methods",
          "A class with no methods",
          "A package",
        ],
        answer: 0,
        explanation:
          "A functional interface has exactly one abstract method.",
      },
      {
        id: 8,
        question:
          "Which Java feature provides concise behavior using function-like syntax?",
        options: [
          "Lambda expressions",
          "Constructors",
          "Packages",
          "Enums only",
        ],
        answer: 0,
        explanation:
          "Lambda expressions provide concise implementations of functional interfaces.",
      },
      {
        id: 9,
        question:
          "What is reflection used for?",
        options: [
          "Inspecting and interacting with classes at runtime",
          "Sorting arrays",
          "Creating databases",
          "Rendering HTML",
        ],
        answer: 0,
        explanation:
          "Reflection allows runtime inspection and interaction with classes and members.",
      },
      {
        id: 10,
        question:
          "Which concept allows behavior to be selected dynamically based on the object's runtime type?",
        options: [
          "Runtime polymorphism",
          "Encapsulation",
          "Compilation",
          "Packaging",
        ],
        answer: 0,
        explanation:
          "Runtime polymorphism allows overridden methods to be selected dynamically.",
      },
    ],
  },

  Python: {
    beginner: [
      {
        id: 1,
        question:
          "Which symbol is commonly used to create a list in Python?",
        options: ["()", "[]", "{}", "<>"],
        answer: 1,
        explanation:
          "Square brackets create a list.",
      },
      {
        id: 2,
        question:
          "Which keyword defines a function?",
        options: ["function", "def", "fun", "define"],
        answer: 1,
        explanation:
          "Python uses def to define functions.",
      },
      {
        id: 3,
        question:
          "Which type stores key-value pairs?",
        options: ["List", "Tuple", "Dictionary", "Set"],
        answer: 2,
        explanation:
          "Dictionaries store key-value pairs.",
      },
      {
        id: 4,
        question:
          "Which keyword is used for a conditional branch?",
        options: ["if", "when", "condition", "check"],
        answer: 0,
        explanation:
          "Python uses if for conditional logic.",
      },
      {
        id: 5,
        question:
          "Which function returns the length of a sequence?",
        options: ["size()", "length()", "len()", "countall()"],
        answer: 2,
        explanation:
          "len() returns the number of items.",
      },
      {
        id: 6,
        question:
          "Which type is immutable?",
        options: ["List", "Tuple", "Dictionary", "Set"],
        answer: 1,
        explanation:
          "Tuples are immutable.",
      },
      {
        id: 7,
        question:
          "Which operator performs exponentiation?",
        options: ["^", "**", "//", "%%"],
        answer: 1,
        explanation:
          "** performs exponentiation.",
      },
      {
        id: 8,
        question:
          "Which keyword starts a loop over an iterable?",
        options: ["for", "loop", "iterate", "repeat"],
        answer: 0,
        explanation:
          "Python uses for to iterate over an iterable.",
      },
      {
        id: 9,
        question:
          "Which function displays output?",
        options: ["echo()", "print()", "display()", "write()"],
        answer: 1,
        explanation:
          "print() outputs values.",
      },
      {
        id: 10,
        question:
          "Which value represents the absence of a value?",
        options: ["empty", "null", "None", "void"],
        answer: 2,
        explanation:
          "Python uses None to represent the absence of a value.",
      },
    ],

    intermediate: [
      {
        id: 1,
        question:
          "What is a list comprehension?",
        options: [
          "A concise way to create lists",
          "A database query",
          "A class constructor",
          "A threading model",
        ],
        answer: 0,
        explanation:
          "List comprehensions provide a concise syntax for creating lists.",
      },
      {
        id: 2,
        question:
          "What does *args allow?",
        options: [
          "Multiple positional arguments",
          "Only one argument",
          "Only keyword arguments",
          "No arguments",
        ],
        answer: 0,
        explanation:
          "*args collects variable numbers of positional arguments.",
      },
      {
        id: 3,
        question:
          "What does **kwargs collect?",
        options: [
          "Positional arguments",
          "Keyword arguments",
          "Lists only",
          "Tuples only",
        ],
        answer: 1,
        explanation:
          "**kwargs collects variable numbers of keyword arguments.",
      },
      {
        id: 4,
        question:
          "What is a generator?",
        options: [
          "An object that produces values lazily",
          "A database",
          "A compiled Java class",
          "A GUI widget",
        ],
        answer: 0,
        explanation:
          "Generators produce values lazily, commonly using yield.",
      },
      {
        id: 5,
        question:
          "Which keyword handles exceptions?",
        options: ["catch", "try", "except-only", "handle"],
        answer: 1,
        explanation:
          "Python uses try together with except to handle exceptions.",
      },
      {
        id: 6,
        question:
          "What does a decorator generally do?",
        options: [
          "Modify or wrap a function/class",
          "Delete a function",
          "Compile Python",
          "Create a database",
        ],
        answer: 0,
        explanation:
          "Decorators wrap or modify callable behavior.",
      },
      {
        id: 7,
        question:
          "Which collection type automatically removes duplicates?",
        options: ["List", "Tuple", "Set", "String"],
        answer: 2,
        explanation:
          "Sets contain unique elements.",
      },
      {
        id: 8,
        question:
          "What is slicing used for?",
        options: [
          "Extracting portions of sequences",
          "Creating classes",
          "Opening files only",
          "Starting threads",
        ],
        answer: 0,
        explanation:
          "Slicing extracts portions of sequences such as lists and strings.",
      },
      {
        id: 9,
        question:
          "Which statement is commonly used to import a module?",
        options: ["include", "import", "using", "require"],
        answer: 1,
        explanation:
          "Python uses import.",
      },
      {
        id: 10,
        question:
          "What does `with open(...)` help with?",
        options: [
          "Automatic resource management",
          "Sorting files",
          "Creating arrays",
          "Compiling code",
        ],
        answer: 0,
        explanation:
          "The with statement helps manage resources such as file handles safely.",
      },
    ],

    advanced: [
      {
        id: 1,
        question:
          "What is the GIL in CPython?",
        options: [
          "A mechanism that limits execution of Python bytecode by multiple threads at once",
          "A database lock",
          "A compiler flag",
          "A package manager",
        ],
        answer: 0,
        explanation:
          "The Global Interpreter Lock in CPython limits concurrent execution of Python bytecode by multiple threads.",
      },
      {
        id: 2,
        question:
          "What is a context manager used for?",
        options: [
          "Managing setup and cleanup around a block",
          "Sorting dictionaries",
          "Compiling Python",
          "Creating classes only",
        ],
        answer: 0,
        explanation:
          "Context managers handle resource setup and cleanup.",
      },
      {
        id: 3,
        question:
          "Which protocol is used by `for` loops to iterate over objects?",
        options: [
          "Iterator protocol",
          "HTTP protocol",
          "Database protocol",
          "Rendering protocol",
        ],
        answer: 0,
        explanation:
          "Python iteration relies on the iterator protocol.",
      },
      {
        id: 4,
        question:
          "What is the purpose of `yield`?",
        options: [
          "Turn a function into a generator",
          "Delete a variable",
          "Import a package",
          "Raise a class",
        ],
        answer: 0,
        explanation:
          "yield produces values lazily and makes the function a generator.",
      },
      {
        id: 5,
        question:
          "What is monkey patching?",
        options: [
          "Changing attributes or behavior at runtime",
          "Sorting code",
          "Compiling modules",
          "Deleting packages",
        ],
        answer: 0,
        explanation:
          "Monkey patching modifies classes or objects at runtime.",
      },
      {
        id: 6,
        question:
          "What is a Python metaclass primarily involved in?",
        options: [
          "Controlling class creation",
          "Sorting lists",
          "Opening files",
          "Calling APIs",
        ],
        answer: 0,
        explanation:
          "Metaclasses customize how classes themselves are created.",
      },
      {
        id: 7,
        question:
          "What does `async` define?",
        options: [
          "A coroutine function",
          "A class",
          "A dictionary",
          "A thread",
        ],
        answer: 0,
        explanation:
          "async def defines a coroutine function.",
      },
      {
        id: 8,
        question:
          "Which keyword pauses a coroutine until an awaitable completes?",
        options: ["pause", "wait", "await", "yieldonly"],
        answer: 2,
        explanation:
          "await suspends coroutine execution until the awaited operation completes.",
      },
      {
        id: 9,
        question:
          "Why can multiprocessing help CPU-bound Python workloads in CPython?",
        options: [
          "Separate processes can execute on separate CPU cores",
          "It removes all memory usage",
          "It converts Python to SQL",
          "It guarantees O(1)",
        ],
        answer: 0,
        explanation:
          "Separate processes have separate interpreters and can execute CPU work in parallel.",
      },
      {
        id: 10,
        question:
          "What is the purpose of type hints?",
        options: [
          "Communicate expected types and assist tooling",
          "Force all runtime checks",
          "Compile Python to Java",
          "Replace functions",
        ],
        answer: 0,
        explanation:
          "Type hints document expected types and help static analysis and developer tooling.",
      },
    ],
  },

  "DBMS / SQL": {
    beginner: [
      {
        id: 1,
        question:
          "What does SQL stand for?",
        options: [
          "Structured Query Language",
          "Simple Query Logic",
          "System Question Language",
          "Structured Question List",
        ],
        answer: 0,
        explanation:
          "SQL stands for Structured Query Language.",
      },
      {
        id: 2,
        question:
          "Which command retrieves data from a table?",
        options: ["SELECT", "INSERT", "DELETE", "DROP"],
        answer: 0,
        explanation:
          "SELECT retrieves data.",
      },
      {
        id: 3,
        question:
          "Which command adds a row?",
        options: ["UPDATE", "INSERT", "SELECT", "ALTER"],
        answer: 1,
        explanation:
          "INSERT adds rows.",
      },
      {
        id: 4,
        question:
          "Which command modifies existing rows?",
        options: ["UPDATE", "CREATE", "SELECT", "DROP"],
        answer: 0,
        explanation:
          "UPDATE modifies existing records.",
      },
      {
        id: 5,
        question:
          "Which command removes rows?",
        options: ["REMOVE", "DELETE", "CLEAR", "ERASE"],
        answer: 1,
        explanation:
          "DELETE removes rows.",
      },
      {
        id: 6,
        question:
          "What uniquely identifies a row?",
        options: [
          "Primary key",
          "Foreign key only",
          "View",
          "Index name",
        ],
        answer: 0,
        explanation:
          "A primary key uniquely identifies records.",
      },
      {
        id: 7,
        question:
          "What does a foreign key represent?",
        options: [
          "A relationship to another table",
          "A password",
          "A table name",
          "A database server",
        ],
        answer: 0,
        explanation:
          "A foreign key references a key in another table.",
      },
      {
        id: 8,
        question:
          "Which clause filters rows?",
        options: ["WHERE", "ORDER", "GROUP", "FILTERBY"],
        answer: 0,
        explanation:
          "WHERE filters rows according to a condition.",
      },
      {
        id: 9,
        question:
          "Which clause sorts query results?",
        options: ["SORT", "ORDER BY", "ARRANGE", "GROUP BY"],
        answer: 1,
        explanation:
          "ORDER BY sorts query results.",
      },
      {
        id: 10,
        question:
          "Which SQL keyword creates a table?",
        options: ["MAKE", "CREATE", "NEW", "TABLE"],
        answer: 1,
        explanation:
          "CREATE TABLE creates a table.",
      },
    ],

    intermediate: [
      {
        id: 1,
        question:
          "What is a JOIN used for?",
        options: [
          "Combining related rows from tables",
          "Deleting databases",
          "Creating users",
          "Sorting one column only",
        ],
        answer: 0,
        explanation:
          "JOIN combines related data from multiple tables.",
      },
      {
        id: 2,
        question:
          "Which JOIN returns matching rows from both tables?",
        options: [
          "INNER JOIN",
          "FULL DELETE",
          "CROSS FILTER",
          "SINGLE JOIN",
        ],
        answer: 0,
        explanation:
          "INNER JOIN returns rows where the join condition matches.",
      },
      {
        id: 3,
        question:
          "What is normalization intended to reduce?",
        options: [
          "Data redundancy and anomalies",
          "Security",
          "Indexes",
          "Queries",
        ],
        answer: 0,
        explanation:
          "Normalization reduces redundancy and update anomalies.",
      },
      {
        id: 4,
        question:
          "Which clause groups rows for aggregate calculations?",
        options: ["GROUP BY", "ORDER BY", "WHERE", "JOIN BY"],
        answer: 0,
        explanation:
          "GROUP BY groups rows for aggregate functions.",
      },
      {
        id: 5,
        question:
          "Which function counts rows?",
        options: ["SUM", "COUNT", "TOTAL", "ROWS"],
        answer: 1,
        explanation:
          "COUNT counts rows or non-null values depending on its form.",
      },
      {
        id: 6,
        question:
          "Which clause filters groups after aggregation?",
        options: ["WHERE", "HAVING", "GROUP", "AFTER"],
        answer: 1,
        explanation:
          "HAVING filters grouped results.",
      },
      {
        id: 7,
        question:
          "What is an index primarily used for?",
        options: [
          "Improving query lookup performance",
          "Replacing tables",
          "Encrypting rows",
          "Deleting duplicates automatically",
        ],
        answer: 0,
        explanation:
          "Indexes can speed up data retrieval.",
      },
      {
        id: 8,
        question:
          "Which command changes table structure?",
        options: ["ALTER", "UPDATE", "SELECT", "CHANGE ROW"],
        answer: 0,
        explanation:
          "ALTER TABLE changes table structure.",
      },
      {
        id: 9,
        question:
          "What does ACID relate to?",
        options: [
          "Transaction properties",
          "Web design",
          "Indexes only",
          "Network protocols",
        ],
        answer: 0,
        explanation:
          "ACID describes important transaction properties.",
      },
      {
        id: 10,
        question:
          "Which operation combines query results vertically?",
        options: ["UNION", "JOIN", "MERGE ROW", "GROUP"],
        answer: 0,
        explanation:
          "UNION combines compatible result sets vertically.",
      },
    ],

    advanced: [
      {
        id: 1,
        question:
          "What does a database transaction isolation level control?",
        options: [
          "How concurrent transactions interact",
          "Table names",
          "Password length",
          "Column colors",
        ],
        answer: 0,
        explanation:
          "Isolation levels control the visibility and interaction of concurrent transactions.",
      },
      {
        id: 2,
        question:
          "What is a deadlock in a database?",
        options: [
          "Transactions waiting indefinitely for each other's resources",
          "A missing table",
          "A slow SELECT only",
          "A duplicate column",
        ],
        answer: 0,
        explanation:
          "A deadlock occurs when transactions wait on resources held by each other.",
      },
      {
        id: 3,
        question:
          "What is a composite index?",
        options: [
          "An index over multiple columns",
          "An index on one row",
          "A table copy",
          "A database backup",
        ],
        answer: 0,
        explanation:
          "A composite index contains multiple columns.",
      },
      {
        id: 4,
        question:
          "Why can too many indexes hurt write performance?",
        options: [
          "Indexes must also be maintained during writes",
          "Indexes delete rows",
          "Indexes disable SELECT",
          "Indexes remove primary keys",
        ],
        answer: 0,
        explanation:
          "INSERT, UPDATE, and DELETE operations may need to maintain affected indexes.",
      },
      {
        id: 5,
        question:
          "What is a query execution plan?",
        options: [
          "The database's strategy for executing a query",
          "A database password",
          "A table backup",
          "A schema diagram only",
        ],
        answer: 0,
        explanation:
          "An execution plan describes how the database intends to execute the query.",
      },
      {
        id: 6,
        question:
          "What is a window function useful for?",
        options: [
          "Calculations across related rows without collapsing them",
          "Deleting tables",
          "Creating users",
          "Encrypting columns",
        ],
        answer: 0,
        explanation:
          "Window functions calculate across related rows while preserving individual rows.",
      },
      {
        id: 7,
        question:
          "What is a common purpose of a materialized view?",
        options: [
          "Persisting query results for faster reads",
          "Deleting old rows",
          "Replacing transactions",
          "Creating passwords",
        ],
        answer: 0,
        explanation:
          "Materialized views persist query results and can improve read performance.",
      },
      {
        id: 8,
        question:
          "What is denormalization sometimes used for?",
        options: [
          "Improving read performance at the cost of redundancy",
          "Removing every index",
          "Preventing all transactions",
          "Eliminating tables",
        ],
        answer: 0,
        explanation:
          "Denormalization can reduce joins and improve reads while introducing redundancy.",
      },
      {
        id: 9,
        question:
          "What is a recursive CTE useful for?",
        options: [
          "Hierarchical or recursive queries",
          "Password hashing",
          "Creating indexes only",
          "Deleting schemas",
        ],
        answer: 0,
        explanation:
          "Recursive CTEs are useful for hierarchical data such as organizational trees.",
      },
      {
        id: 10,
        question:
          "What does database sharding generally mean?",
        options: [
          "Splitting data across multiple database nodes",
          "Deleting duplicate rows",
          "Adding one index",
          "Renaming tables",
        ],
        answer: 0,
        explanation:
          "Sharding distributes data across multiple database nodes.",
      },
    ],
  },

  "Web Development": {
    beginner: [
      {
        id: 1,
        question:
          "What does HTML primarily define?",
        options: [
          "Web page structure",
          "Database indexes",
          "Server memory",
          "Network routing",
        ],
        answer: 0,
        explanation:
          "HTML defines the structure and content of web pages.",
      },
      {
        id: 2,
        question:
          "What does CSS control?",
        options: [
          "Presentation and styling",
          "Database transactions",
          "Password hashing",
          "Server ports",
        ],
        answer: 0,
        explanation:
          "CSS controls presentation and visual styling.",
      },
      {
        id: 3,
        question:
          "Which language commonly provides browser-side behavior?",
        options: ["JavaScript", "SQL", "HTML only", "CSS only"],
        answer: 0,
        explanation:
          "JavaScript is commonly used for browser-side behavior.",
      },
      {
        id: 4,
        question:
          "Which HTML element creates a hyperlink?",
        options: ["<a>", "<linker>", "<url>", "<href>"],
        answer: 0,
        explanation:
          "The anchor element <a> creates hyperlinks.",
      },
      {
        id: 5,
        question:
          "What does HTTP stand for?",
        options: [
          "HyperText Transfer Protocol",
          "High Transfer Text Program",
          "Hyperlink Transfer Process",
          "Host Transfer Protocol",
        ],
        answer: 0,
        explanation:
          "HTTP stands for HyperText Transfer Protocol.",
      },
      {
        id: 6,
        question:
          "Which status code means Not Found?",
        options: ["200", "301", "404", "500"],
        answer: 2,
        explanation:
          "HTTP 404 means the requested resource was not found.",
      },
      {
        id: 7,
        question:
          "Which CSS property changes text color?",
        options: ["font-color", "color", "text-color", "foreground"],
        answer: 1,
        explanation:
          "The CSS color property sets text color.",
      },
      {
        id: 8,
        question:
          "Which protocol is commonly used to secure HTTP traffic?",
        options: ["HTTPS", "FTP", "SMTP", "SSH only"],
        answer: 0,
        explanation:
          "HTTPS is HTTP over TLS/SSL.",
      },
      {
        id: 9,
        question:
          "What is responsive design?",
        options: [
          "Design adapting to different screen sizes",
          "A faster database",
          "A server backup",
          "A programming language",
        ],
        answer: 0,
        explanation:
          "Responsive design adapts layouts to different devices and screen sizes.",
      },
      {
        id: 10,
        question:
          "What does a browser do?",
        options: [
          "Interprets and displays web content",
          "Creates databases automatically",
          "Compiles Java only",
          "Replaces servers",
        ],
        answer: 0,
        explanation:
          "A browser retrieves, interprets, and displays web content.",
      },
    ],

    intermediate: [
      {
        id: 1,
        question:
          "What is a REST API?",
        options: [
          "An API style commonly using HTTP resources and methods",
          "A CSS framework",
          "A database engine",
          "A compiler",
        ],
        answer: 0,
        explanation:
          "REST is an architectural style commonly implemented using HTTP resources and methods.",
      },
      {
        id: 2,
        question:
          "What does JSON commonly represent?",
        options: [
          "Structured data",
          "CSS styles only",
          "Binary machine code",
          "Database indexes",
        ],
        answer: 0,
        explanation:
          "JSON is a common format for structured data exchange.",
      },
      {
        id: 3,
        question:
          "Which HTTP method is commonly used to create a resource?",
        options: ["GET", "POST", "DELETE", "HEAD"],
        answer: 1,
        explanation:
          "POST is commonly used to submit data and create resources.",
      },
      {
        id: 4,
        question:
          "What is client-side rendering?",
        options: [
          "Rendering UI primarily in the browser",
          "Rendering only in SQL",
          "Rendering inside a database",
          "Rendering by DNS",
        ],
        answer: 0,
        explanation:
          "Client-side rendering generates or updates UI primarily in the browser.",
      },
      {
        id: 5,
        question:
          "What is CORS?",
        options: [
          "A browser security mechanism controlling cross-origin requests",
          "A database",
          "A CSS property",
          "A JavaScript loop",
        ],
        answer: 0,
        explanation:
          "CORS controls whether browser-based cross-origin requests are permitted.",
      },
      {
        id: 6,
        question:
          "What is a cookie commonly used for?",
        options: [
          "Storing small pieces of client-associated data",
          "Compiling Java",
          "Creating SQL tables",
          "Rendering CSS",
        ],
        answer: 0,
        explanation:
          "Cookies store small pieces of data associated with a website.",
      },
      {
        id: 7,
        question:
          "What is a frontend framework/library commonly used for?",
        options: [
          "Building interactive user interfaces",
          "Replacing DNS",
          "Encrypting disks",
          "Managing CPU hardware",
        ],
        answer: 0,
        explanation:
          "Frontend libraries/frameworks help build interactive user interfaces.",
      },
      {
        id: 8,
        question:
          "What does HTTP 401 generally indicate?",
        options: [
          "Authentication required or failed",
          "Success",
          "Not Found",
          "Server crashed only",
        ],
        answer: 0,
        explanation:
          "401 indicates that authentication is required or has not succeeded.",
      },
      {
        id: 9,
        question:
          "What is an API endpoint?",
        options: [
          "A network-accessible URL representing an API operation/resource",
          "A CSS selector",
          "A database password",
          "An HTML comment",
        ],
        answer: 0,
        explanation:
          "An endpoint is a URL through which an API exposes functionality or resources.",
      },
      {
        id: 10,
        question:
          "What does HTTPS protect primarily?",
        options: [
          "Data exchanged over the connection",
          "All server code automatically",
          "Database schema",
          "HTML structure",
        ],
        answer: 0,
        explanation:
          "HTTPS encrypts and authenticates communication between client and server.",
      },
    ],

    advanced: [
      {
        id: 1,
        question:
          "What is server-side rendering?",
        options: [
          "Generating HTML on the server before sending it to the client",
          "Rendering only with CSS",
          "Rendering inside SQL",
          "Rendering through DNS",
        ],
        answer: 0,
        explanation:
          "SSR generates HTML on the server and sends rendered content to the client.",
      },
      {
        id: 2,
        question:
          "What is hydration in modern web frameworks?",
        options: [
          "Attaching client-side behavior to server-rendered HTML",
          "Encrypting HTML",
          "Compressing images",
          "Creating database tables",
        ],
        answer: 0,
        explanation:
          "Hydration attaches client-side interactivity to server-rendered markup.",
      },
      {
        id: 3,
        question:
          "What is caching useful for?",
        options: [
          "Reducing repeated computation or network requests",
          "Deleting users",
          "Changing HTML syntax",
          "Replacing authentication",
        ],
        answer: 0,
        explanation:
          "Caching stores reusable results to improve performance.",
      },
      {
        id: 4,
        question:
          "What is code splitting?",
        options: [
          "Loading JavaScript in smaller chunks when needed",
          "Deleting JavaScript",
          "Splitting databases",
          "Splitting passwords",
        ],
        answer: 0,
        explanation:
          "Code splitting breaks application code into chunks that can be loaded as needed.",
      },
      {
        id: 5,
        question:
          "What is an XSS attack?",
        options: [
          "Injecting malicious script into content viewed by users",
          "Database replication",
          "A network cable failure",
          "A CSS optimization",
        ],
        answer: 0,
        explanation:
          "Cross-site scripting involves injecting malicious scripts into web content.",
      },
      {
        id: 6,
        question:
          "What is CSRF?",
        options: [
          "Tricking an authenticated browser into performing an unwanted action",
          "A database index",
          "A rendering technique",
          "A CSS vulnerability only",
        ],
        answer: 0,
        explanation:
          "CSRF tricks a user's authenticated browser into making an unwanted state-changing request.",
      },
      {
        id: 7,
        question:
          "What is a CDN?",
        options: [
          "A distributed network for serving content closer to users",
          "A database table",
          "A Java compiler",
          "A browser extension",
        ],
        answer: 0,
        explanation:
          "A CDN distributes content across locations to reduce latency.",
      },
      {
        id: 8,
        question:
          "What is optimistic UI?",
        options: [
          "Updating the interface before the server confirms the operation",
          "Disabling JavaScript",
          "Rendering only on the server",
          "Encrypting CSS",
        ],
        answer: 0,
        explanation:
          "Optimistic UI assumes an operation will succeed and updates the UI immediately.",
      },
      {
        id: 9,
        question:
          "What is WebSocket primarily useful for?",
        options: [
          "Persistent two-way communication",
          "Static HTML only",
          "Database backups",
          "CSS rendering",
        ],
        answer: 0,
        explanation:
          "WebSockets provide persistent two-way communication between client and server.",
      },
      {
        id: 10,
        question:
          "What is lazy loading?",
        options: [
          "Loading resources only when they are needed",
          "Deleting unused code",
          "Disabling caching",
          "Blocking all requests",
        ],
        answer: 0,
        explanation:
          "Lazy loading delays resource loading until it is needed.",
      },
    ],
  },
};

export default function AssessmentsPage() {
  const router = useRouter();

  const [studentId, setStudentId] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<
    AssessmentHistory[]
  >([]);

  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedLevel, setSelectedLevel] =
    useState<Level>("beginner");

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, number>
  >({});

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD CURRENT STUDENT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.push("/");
        return;
      }

      const userEmail =
        user.email?.toLowerCase() || "";

      const { data: student, error: studentError } =
        await supabase
          .from("students")
          .select("id,email,user_id")
          .or(
            `user_id.eq.${user.id},email.eq.${userEmail}`
          )
          .maybeSingle();

      if (studentError) throw studentError;

      if (!student) {
        throw new Error(
          "No student profile is connected to this account."
        );
      }

      setStudentId(student.id);

      /*
       * Load available skills
       */

      const { data: skillData, error: skillError } =
        await supabase
          .from("skills")
          .select("id,name,category")
          .order("name");

      if (skillError) throw skillError;

      const availableSkills =
        (skillData || []).filter(
          (skill) =>
            QUESTION_BANK[skill.name]
        );

      setSkills(availableSkills);

      // Select the skill passed from the Student Dashboard.
      // Example: /student/assessments?skill=Java
      const requestedSkill =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("skill")
          : null;

      const matchingSkill = requestedSkill
        ? availableSkills.find(
            (skill) =>
              skill.name.toLowerCase() ===
              requestedSkill.toLowerCase()
          )
        : null;

      if (availableSkills.length > 0) {
        setSelectedSkill(
          matchingSkill
            ? matchingSkill.name
            : availableSkills[0].name
        );
      }

      /*
       * Load current student skill levels
       */

      const { data: studentSkillData, error: studentSkillError } =
        await supabase
          .from("student_skills")
          .select(
            "skill_id,proficiency,skill_level"
          )
          .eq("student_id", student.id);

      if (studentSkillError) {
        console.error(
          "Could not load student skills:",
          studentSkillError
        );
      }

      const loadedStudentSkills =
        studentSkillData || [];

      setStudentSkills(loadedStudentSkills);

      /*
       * Assessment history is the authoritative source once the
       * student has actually taken assessments.
       */
      const {
        data: assessmentData,
        error: assessmentHistoryError,
      } = await supabase
        .from("assessments")
        .select(
          "skill_id,assessment_level,overall_score,passed"
        )
        .eq("student_id", student.id);

      if (assessmentHistoryError) {
        console.error(
          "Could not load assessment history:",
          assessmentHistoryError
        );
      }

      const loadedAssessmentHistory =
        (assessmentData || []).filter(
          (item) =>
            ["beginner", "intermediate", "advanced"].includes(
              item.assessment_level
            )
        ) as AssessmentHistory[];

      setAssessmentHistory(
        loadedAssessmentHistory
      );

      /*
       * If the student came from a dashboard skill button,
       * automatically select that skill and recommend its next
       * assessment level.
       */
      if (matchingSkill) {
        const levelRank: Record<Level, number> = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
        };

        const passedLevels =
          loadedAssessmentHistory.filter(
            (item) =>
              item.skill_id === matchingSkill.id &&
              item.passed
          );

        const highestPassed =
          passedLevels.length > 0
            ? passedLevels.reduce(
                (highest, item) =>
                  levelRank[item.assessment_level] >
                  levelRank[highest]
                    ? item.assessment_level
                    : highest,
                "beginner" as Level
              )
            : null;

        const currentSkill =
          loadedStudentSkills.find(
            (item) =>
              item.skill_id === matchingSkill.id
          );

        if (highestPassed === "beginner") {
          setSelectedLevel("intermediate");
        } else if (
          highestPassed === "intermediate"
        ) {
          setSelectedLevel("advanced");
        } else if (
          highestPassed === "advanced"
        ) {
          setSelectedLevel("advanced");
        } else if (
          currentSkill?.skill_level === "beginner"
        ) {
          setSelectedLevel("intermediate");
        } else if (
          currentSkill?.skill_level === "intermediate"
        ) {
          setSelectedLevel("advanced");
        } else if (
          currentSkill?.skill_level === "advanced"
        ) {
          setSelectedLevel("advanced");
        } else {
          setSelectedLevel("beginner");
        }
      }

    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load assessment system."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CURRENT QUESTIONS
  |--------------------------------------------------------------------------
  */

  const questions =
    selectedSkill &&
    QUESTION_BANK[selectedSkill]?.[selectedLevel]
      ? QUESTION_BANK[selectedSkill][selectedLevel]
      : [];

  const question = questions[currentQuestion];

  /*
  |--------------------------------------------------------------------------
  | CURRENT STUDENT LEVEL
  |--------------------------------------------------------------------------
  */

  const selectedSkillRecord = useMemo(() => {
    if (!selectedSkill) return null;

    const skill = skills.find(
      (item) => item.name === selectedSkill
    );

    if (!skill) return null;

    return (
      studentSkills.find(
        (item) => item.skill_id === skill.id
      ) || null
    );
  }, [
    selectedSkill,
    skills,
    studentSkills,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LEVEL ACCESS
  |--------------------------------------------------------------------------
  |
  | Higher assessments require the previous level to be passed.
  |
  | For the prototype:
  |
  | Beginner      → always available
  | Intermediate  → requires current level >= intermediate
  | Advanced      → requires advanced
  |
  | We will later replace this with actual assessment history.
  |--------------------------------------------------------------------------
  */

  function getHighestPassedLevel(
    skillId: string
  ): Level | null {
    const levelRank: Record<Level, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };

    const passed = assessmentHistory.filter(
      (item) =>
        item.skill_id === skillId &&
        item.passed
    );

    if (passed.length === 0) {
      return null;
    }

    return passed.reduce(
      (highest, item) =>
        levelRank[item.assessment_level] >
        levelRank[highest]
          ? item.assessment_level
          : highest,
      "beginner" as Level
    );
  }

  function levelIsUnlocked(level: Level) {
    if (level === "beginner") return true;

    if (!selectedSkill) return false;

    const skill = skills.find(
      (item) => item.name === selectedSkill
    );

    if (!skill) return false;

    const highestPassed =
      getHighestPassedLevel(skill.id);

    /*
     * Once a student has assessment history, levels unlock
     * strictly from previously passed assessments.
     */
    if (highestPassed) {
      if (level === "intermediate") {
        return (
          highestPassed === "beginner" ||
          highestPassed === "intermediate" ||
          highestPassed === "advanced"
        );
      }

      if (level === "advanced") {
        return (
          highestPassed === "intermediate" ||
          highestPassed === "advanced"
        );
      }
    }

    /*
     * Existing seeded student_skills levels are the prototype
     * starting baseline for students who have no assessment
     * history yet.
     */
    const currentLevel =
      selectedSkillRecord?.skill_level;

    if (level === "intermediate") {
      return (
        currentLevel === "beginner" ||
        currentLevel === "intermediate" ||
        currentLevel === "advanced"
      );
    }

    if (level === "advanced") {
      return (
        currentLevel === "intermediate" ||
        currentLevel === "advanced"
      );
    }

    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | START
  |--------------------------------------------------------------------------
  */

  function startAssessment() {
    setError("");

    if (!selectedSkill) {
      setError("Please select a skill.");
      return;
    }

    if (!levelIsUnlocked(selectedLevel)) {
      setError(
        `The ${LEVEL_INFO[
          selectedLevel
        ].title} assessment is locked for this skill. Pass the previous level first.`
      );
      return;
    }

    setAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setScore(0);
    setStarted(true);
  }

  /*
  |--------------------------------------------------------------------------
  | SELECT ANSWER
  |--------------------------------------------------------------------------
  */

  function chooseAnswer(answerIndex: number) {
    if (submitted) return;

    setAnswers((current) => ({
      ...current,
      [currentQuestion]: answerIndex,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function submitAssessment() {
    if (submitted || saving) return;

    setSaving(true);
    setError("");

    try {
      let correct = 0;

      questions.forEach((q, index) => {
        if (answers[index] === q.answer) {
          correct++;
        }
      });

      const finalScore = Math.round(
        (correct / questions.length) * 100
      );

      const passed = finalScore >= PASS_MARK;

      setScore(finalScore);
      setSubmitted(true);

      /*
       * ----------------------------------------------------------
       * SAVE ASSESSMENT RESULT
       * ----------------------------------------------------------
       */

      if (studentId) {
        const skillRecord = skills.find(
          (skill) => skill.name === selectedSkill
        );

        if (skillRecord) {
          const { error: assessmentError } =
            await supabase
              .from("assessments")
              .insert({
                student_id: studentId,
                skill_id: skillRecord.id,
                assessment_level: selectedLevel,
                overall_score: finalScore,
                passed,
              });

          if (assessmentError) {
            console.error(
              "Assessment save error:",
              assessmentError
            );
          } else {
            setAssessmentHistory(
              (current) => [
                ...current,
                {
                  skill_id: skillRecord.id,
                  assessment_level: selectedLevel,
                  overall_score: finalScore,
                  passed,
                },
              ]
            );
          }

          /*
           * --------------------------------------------------------
           * UPDATE STUDENT SKILL ONLY IF PASSED
           * --------------------------------------------------------
           *
           * A higher passed level replaces a lower level.
           *
           * A failed test does not magically increase the skill.
           * --------------------------------------------------------
           */

          if (passed) {
            const levelRank: Record<
              Level,
              number
            > = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
            };

            const existing =
              selectedSkillRecord;

            const existingRank =
              existing?.skill_level
                ? levelRank[
                    existing.skill_level
                  ]
                : 0;

            const newRank =
              levelRank[selectedLevel];

            /*
             * Update if this is a higher verified level,
             * or if the student is passing the same level
             * with a better score.
             */

            const shouldUpdate =
              newRank > existingRank ||
              (
                newRank === existingRank &&
                finalScore >
                  (existing?.proficiency || 0)
              );

            if (shouldUpdate) {
              const { error: updateError } =
                await supabase
                  .from("student_skills")
                  .update({
                    proficiency: finalScore,
                    skill_level: selectedLevel,
                    verification_status:
                      "verified",
                  })
                  .eq(
                    "student_id",
                    studentId
                  )
                  .eq(
                    "skill_id",
                    skillRecord.id
                  );

              if (updateError) {
                console.error(
                  "Student skill update error:",
                  updateError
                );
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save assessment result."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  function resetAssessment() {
    setStarted(false);
    setSubmitted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setError("");
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="flex items-center gap-3 text-emerald-400">

          <div className="h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />

          Loading assessments...

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR WITHOUT STUDENT
  |--------------------------------------------------------------------------
  */

  if (error && !studentId) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">

        <div className="max-w-xl mx-auto bg-red-950/30 border border-red-500/30 rounded-2xl p-6">

          <h1 className="text-xl font-bold text-red-400">
            Assessment unavailable
          </h1>

          <p className="text-slate-400 mt-2">
            {error}
          </p>

          <button
            onClick={() => router.push("/student")}
            className="mt-5 px-4 py-2 bg-slate-800 rounded-xl"
          >
            Back to Student Portal
          </button>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ASSESSMENT RESULT
  |--------------------------------------------------------------------------
  */

  if (submitted) {
    const passed = score >= PASS_MARK;

    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <header className="border-b border-slate-800 bg-slate-950/95">

          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">

                <GraduationCap className="h-5 w-5 text-slate-950" />

              </div>

              <div>

                <h1 className="font-bold">
                  Ayur
                  <span className="text-emerald-400">
                    Bridge
                  </span>
                </h1>

                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Skill Assessment
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                router.push("/student")
              }
              className="text-sm text-slate-400 hover:text-white"
            >
              Back to Dashboard
            </button>

          </div>

        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            {passed ? (
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center">

                <Trophy className="h-10 w-10 text-emerald-400" />

              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center">

                <XCircle className="h-10 w-10 text-red-400" />

              </div>
            )}

            <p className="text-xs uppercase tracking-widest text-slate-500 mt-6">
              {selectedSkill}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {LEVEL_INFO[selectedLevel].title} Assessment
            </h2>

            <div
              className={`text-6xl font-bold mt-8 ${
                passed
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {score}%
            </div>

            <p className="text-slate-400 mt-3">
              {passed
                ? `Congratulations! You passed the ${LEVEL_INFO[
                    selectedLevel
                  ].title} level.`
                : `You need ${PASS_MARK}% to pass this level.`}
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                <p className="text-xl font-bold">
                  {questions.length}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Questions
                </p>

              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                <p className="text-xl font-bold">
                  {Math.round(
                    (score / 100) *
                      questions.length
                  )}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Correct
                </p>

              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                <p
                  className={`text-xl font-bold ${
                    passed
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {passed
                    ? "PASSED"
                    : "FAILED"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Result
                </p>

              </div>

            </div>

            {error && (
              <div className="mt-5 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">

              <button
                onClick={resetAssessment}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>

              <button
                onClick={() =>
                  router.push("/student")
                }
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-bold"
              >
                <CheckCircle2 className="h-4 w-4" />
                Return to Skills
              </button>

            </div>

          </div>

          {/* REVIEW */}

          <div className="mt-8">

            <h3 className="text-xl font-bold mb-4">
              Answer Review
            </h3>

            <div className="space-y-3">

              {questions.map((q, index) => {

                const selected =
                  answers[index];

                const correct =
                  selected === q.answer;

                return (
                  <div
                    key={q.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >

                    <div className="flex gap-3">

                      {correct ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                      )}

                      <div>

                        <p className="font-semibold">
                          {index + 1}.{" "}
                          {q.question}
                        </p>

                        <p className="text-xs text-slate-500 mt-2">
                          Correct answer:{" "}
                          <span className="text-emerald-400">
                            {q.options[q.answer]}
                          </span>
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {q.explanation}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TAKE ASSESSMENT
  |--------------------------------------------------------------------------
  */

  if (started && question) {
    const progress = Math.round(
      ((currentQuestion + 1) /
        questions.length) *
        100
    );

    const selectedAnswer =
      answers[currentQuestion];

    const isLast =
      currentQuestion ===
      questions.length - 1;

    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <header className="border-b border-slate-800 bg-slate-950/95">

          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center">

                <Target className="h-5 w-5 text-slate-950" />

              </div>

              <div>

                <p className="font-bold">
                  {selectedSkill}
                </p>

                <p className="text-xs text-slate-500">
                  {LEVEL_INFO[selectedLevel].title} Assessment
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <Clock3 className="h-4 w-4" />

              10 Questions

            </div>

          </div>

        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* PROGRESS */}

          <div className="mb-8">

            <div className="flex justify-between text-xs text-slate-500 mb-2">

              <span>
                Question {currentQuestion + 1} of{" "}
                {questions.length}
              </span>

              <span>
                {progress}%
              </span>

            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          {/* QUESTION */}

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest">

              <BookOpen className="h-4 w-4" />

              {LEVEL_INFO[selectedLevel].title}

            </div>

            <h2 className="text-2xl font-bold leading-relaxed mt-5">
              {question.question}
            </h2>

            <div className="space-y-3 mt-7">

              {question.options.map(
                (option, index) => {

                  const selected =
                    selectedAnswer ===
                    index;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        chooseAnswer(index)
                      }
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        selected
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            selected
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </div>

                        <span
                          className={
                            selected
                              ? "text-white font-semibold"
                              : "text-slate-300"
                          }
                        >
                          {option}
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

            {error && (
              <div className="mt-5 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            {/* NAVIGATION */}

            <div className="flex justify-between gap-3 mt-8">

              <button
                disabled={currentQuestion === 0}
                onClick={() =>
                  setCurrentQuestion(
                    (current) =>
                      Math.max(
                        0,
                        current - 1
                      )
                  )
                }
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {!isLast ? (
                <button
                  disabled={
                    selectedAnswer ===
                    undefined
                  }
                  onClick={() =>
                    setCurrentQuestion(
                      (current) =>
                        Math.min(
                          questions.length -
                            1,
                          current + 1
                        )
                    )
                  }
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  disabled={
                    selectedAnswer ===
                      undefined ||
                    saving
                  }
                  onClick={
                    submitAssessment
                  }
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold"
                >
                  {saving
                    ? "Saving..."
                    : "Submit Assessment"}

                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}

            </div>

          </div>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ASSESSMENT SELECTION SCREEN
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950/95">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push("/student")
              }
              className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>

              <h1 className="font-bold text-xl">
                Skill Assessments
              </h1>

              <p className="text-xs text-slate-500">
                Demonstrate your CSE competency
              </p>

            </div>

          </div>

          <GraduationCap className="h-6 w-6 text-emerald-400" />

        </div>

      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="max-w-2xl mb-8">

          <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">
            AyurBridge Skill Intelligence
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Assess your skills
          </h2>

          <p className="text-slate-400 mt-2">
            Choose a CSE skill and demonstrate your
            competency level. Each assessment contains
            10 questions and requires {PASS_MARK}% to pass.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* SKILL SELECT */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="text-xl font-bold">
                1. Choose a Skill
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Select the skill you want to demonstrate.
              </p>

            </div>

            <span className="text-xs text-slate-500">
              {skills.length} available
            </span>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {skills.map((skill) => {

              const active =
                selectedSkill === skill.name;

              const record =
                studentSkills.find(
                  (item) =>
                    item.skill_id ===
                    skill.id
                );

              return (
                <button
                  key={skill.id}
                  onClick={() => {
                    setSelectedSkill(
                      skill.name
                    );

                    const highestPassed =
                      getHighestPassedLevel(
                        skill.id
                      );

                    if (
                      highestPassed ===
                      "beginner"
                    ) {
                      setSelectedLevel(
                        "intermediate"
                      );
                    } else if (
                      highestPassed ===
                      "intermediate"
                    ) {
                      setSelectedLevel(
                        "advanced"
                      );
                    } else if (
                      highestPassed ===
                      "advanced"
                    ) {
                      setSelectedLevel(
                        "advanced"
                      );
                    } else {
                      const currentSkill =
                        studentSkills.find(
                          (item) =>
                            item.skill_id ===
                            skill.id
                        );

                      if (
                        currentSkill?.skill_level ===
                        "beginner"
                      ) {
                        setSelectedLevel(
                          "intermediate"
                        );
                      } else if (
                        currentSkill?.skill_level ===
                        "intermediate"
                      ) {
                        setSelectedLevel(
                          "advanced"
                        );
                      } else if (
                        currentSkill?.skill_level ===
                        "advanced"
                      ) {
                        setSelectedLevel(
                          "advanced"
                        );
                      } else {
                        setSelectedLevel(
                          "beginner"
                        );
                      }
                    }

                    setError("");
                  }}
                  className={`text-left rounded-2xl border p-5 transition ${
                    active
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="font-bold">
                        {skill.name}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {skill.category}
                      </p>

                    </div>

                    {record && (
                      <span className="text-emerald-400 font-bold text-sm">
                        {record.proficiency}%
                      </span>
                    )}

                  </div>

                  {record?.skill_level && (
                    <div className="mt-4">

                      <span className="text-[11px] px-2 py-1 rounded-md bg-slate-800 text-slate-300 capitalize">
                        {record.skill_level}
                      </span>

                    </div>
                  )}

                </button>
              );
            })}

          </div>

        </section>

        {/* LEVEL */}

        <section className="mt-10">

          <div className="mb-4">

            <h3 className="text-xl font-bold">
              2. Choose Assessment Level
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Higher levels require demonstrated competency.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {(
              Object.keys(
                LEVEL_INFO
              ) as Level[]
            ).map((level) => {

              const info =
                LEVEL_INFO[level];

              const unlocked =
                levelIsUnlocked(level);

              const active =
                selectedLevel === level;

              return (
                <button
                  key={level}
                  disabled={!unlocked}
                  onClick={() => {
                    setSelectedLevel(
                      level
                    );
                    setError("");
                  }}
                  className={`text-left rounded-2xl border p-5 transition ${
                    !unlocked
                      ? "border-slate-800 bg-slate-950 opacity-50 cursor-not-allowed"
                      : active
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        unlocked
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-600"
                      }`}
                    >

                      {unlocked ? (
                        <Target className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}

                    </div>

                    {!unlocked && (
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest">
                        Locked
                      </span>
                    )}

                  </div>

                  <h4 className="font-bold text-lg mt-5">
                    {info.title}
                  </h4>

                  <p className="text-sm text-slate-500 mt-1">
                    {info.subtitle}
                  </p>

                  <div className="flex items-center justify-between mt-5">

                    <span className="text-xs text-slate-500">
                      10 questions
                    </span>

                    <span className="text-xs text-emerald-400 font-semibold">
                      Pass {PASS_MARK}%+
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* START */}

        <section className="mt-10">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">

            <div>

              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Selected Assessment
              </p>

              <h3 className="text-xl font-bold mt-1">
                {selectedSkill || "Choose a skill"}{" "}
                •{" "}
                {LEVEL_INFO[
                  selectedLevel
                ].title}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                10 questions • {PASS_MARK}% required to pass
              </p>

            </div>

            <button
              onClick={startAssessment}
              disabled={
                !selectedSkill ||
                !levelIsUnlocked(
                  selectedLevel
                )
              }
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold"
            >
              Start Assessment
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}