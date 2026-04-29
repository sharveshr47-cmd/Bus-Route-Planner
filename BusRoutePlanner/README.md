# Bus Route Planner System (Graph Data Structure)

A comprehensive, production-ready, end-to-end simulation of a smart public transportation navigation system. Built as a high-quality Data Structures academic mini-project, it accurately visualizes and computes optimal paths between bus stops utilizing fundamental graph algorithms.

## 🚀 Key Features

-   **Premium Dashboard UI**: Built with an attractive glassmorphism design, interactive gradients, and complete mobile responsiveness.
-   **Live Graph Visualization**: Dynamic, real-time rendering of graph nodes and edges via HTML5 SVG manipulation, complete with smooth visual path highlighting.
-   **Interactive Bus Simulation**: A visual map entity (bus icon) autonomously travels along the exact computed route sequence.
-   **Dual Search Strategy Engine**:
    -   **Minimum Stops (BFS)**: Unweighted traversal algorithm to locate the route requiring the fewest structural transfers.
    -   **Shortest Distance (Dijkstra)**: Weighted traversal algorithm optimizing for physical geographical distance via an Adjacency Matrix.
-   **Dual Implementation Architecture**:
    -   `backend_bus_route.c`: Command-line interface logic backend (C Simulation).
    -   `script.js`: Interactive visual frontend dashboard logic (Browser execution).

## 🛠️ Technology Stack Used

-   **Frontend**: HTML5, CSS3 (Variables, Animations, Flexbox/Grid layouts), Vanilla JavaScript (DOM Manipulation, SVG Node Drawing).
-   **Backend/Algorithms**: C Programming Language.
-   **Data Structure Engine**: Weighted Undirected Graph (Represented uniformly via Adjacency Matrices).

## 📂 Project Directory Structure

-   `index.html`: The core graphical user interface (GUI) structure.
-   `style.css`: All application styling, colors, glass elements, and keyframe animations.
-   `script.js`: Frontend algorithm execution, DOM state updates, and animation drivers.
-   `backend_bus_route.c`: The standalone compiled C program verifying algorithm parity.
-   `README.md`: This comprehensive project documentation.

## 🚌 Running the Interactive Web GUI

1.  Locate and open the `index.html` file using any modern web browser (Chrome, Edge, Firefox, Safari).
2.  No background server setup is required; execution is strictly client-side.
3.  Select both a **Source** and **Destination** stop from the input dropdowns.
4.  Trigger either calculation button: **Find Minimum Stops** or **Find Shortest Distance**.
5.  Observe the network map highlighting and mathematical summaries.

## 💻 Running the C Backend Engine

The robust C implementation proves the underlying mathematical calculations without graphical dependency.

1.  Open your operating system's terminal or command prompt.
2.  Navigate directly to the project directory.
3.  Compile the C source file utilizing GCC:
    ```bash
    gcc backend_bus_route.c -o bus_planner
    ```
4.  Execute the generated binary file:
    -   Windows Command: `bus_planner.exe`
    -   Linux/Mac Command: `./bus_planner`
5.  Adhere to the console prompts to test logic scenarios.

## 🗺️ Master Graph Data Matrix
The ecosystem relies on an identical graph loaded in both JavaScript and C, containing 6 structural stops (`A` through `F`).

```text
      A  B  C  D  E  F
   A  0  4  0  7  0  0
   B  4  0  3  0  6  0
   C  0  3  0  2  0  5
   D  7  0  2  0  4  0
   E  0  6  0  4  0  3
   F  0  0  5  0  3  0
```

## 🎓 Academic Concepts Demonstrated

This project serves as a perfect demonstration of applying theoretical structures to real-world scenarios:
-   **Graph Theory**: Formally modeling physical transport networks.
-   **Breadth-First Search (BFS)**: Handling unweighted shortest-path queries.
-   **Dijkstra's Algorithm**: Handling complex single-source weighted shortest path resolution.
-   **Algorithm Simulation Verification**: Producing identical outputs across different language environments.
