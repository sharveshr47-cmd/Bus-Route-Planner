#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <limits.h>

/**
 * BUS ROUTE PLANNER SYSTEM - BACKEND C SIMULATION
 * Implements Graph Data Structure and Routing Algorithms
 */

#define MAX_STOPS 6
#define INF INT_MAX

// System Configuration: Bus Stop Identifiers
const char* stop_names[MAX_STOPS] = {"A", "B", "C", "D", "E", "F"};

// System Configuration: Weighted Adjacency Matrix representing distances between stops.
// Note: 0 signifies no direct route exists.
int graph[MAX_STOPS][MAX_STOPS] = {
    {0, 4, 0, 7, 0, 0}, // Connections from A
    {4, 0, 3, 0, 6, 0}, // Connections from B
    {0, 3, 0, 2, 0, 5}, // Connections from C
    {7, 0, 2, 0, 4, 0}, // Connections from D
    {0, 6, 0, 4, 0, 3}, // Connections from E
    {0, 0, 5, 0, 3, 0}  // Connections from F
};

/**
 * Helper utility to map string stop names to integer array indices
 */
int get_stop_index(const char* name) {
    for (int i = 0; i < MAX_STOPS; i++) {
        if (strcmp(stop_names[i], name) == 0) return i;
    }
    return -1; // Return -1 if not found
}

/**
 * Helper recursive function to construct and print the generated path from the parent array
 */
void print_path(int parent[], int j, int* stop_count) {
    // Base case: Reached the source node
    if (parent[j] == -1) {
        printf("%s", stop_names[j]);
        return;
    }
    // Recursive traversal
    print_path(parent, parent[j], stop_count);
    
    // Print current node
    printf(" -> %s", stop_names[j]);
    
    // Increment the edge count (which equates to number of stops excluding source)
    (*stop_count)++;
}

/**
 * CORE ALGORITHM 1: Breadth-First Search (BFS)
 * Purpose: Identifies the route with the absolute minimum number of stops/transfers.
 * It ignores the distance weights completely.
 */
void find_minimum_stops(int src, int dest) {
    bool visited[MAX_STOPS] = {false};
    int parent[MAX_STOPS];
    int queue[MAX_STOPS];
    int front = 0, rear = 0;

    // Initialization
    for (int i = 0; i < MAX_STOPS; i++) {
        parent[i] = -1;
    }

    visited[src] = true;
    queue[rear++] = src;

    // Queue-based BFS traversal
    while (front < rear) {
        int u = queue[front++];

        // Early termination if destination found
        if (u == dest) break;

        for (int v = 0; v < MAX_STOPS; v++) {
            // If connection exists and node is unvisited
            if (graph[u][v] > 0 && !visited[v]) {
                visited[v] = true;
                parent[v] = u;
                queue[rear++] = v;
            }
        }
    }

    // Output Handling
    if (!visited[dest]) {
        printf("\n========================================\n");
        printf("Route Status: NO ROUTE FOUND\n");
        printf("========================================\n");
        return;
    }

    printf("\n========================================\n");
    printf("ALGORITHM: Breadth-First Search (BFS)\n");
    printf("GOAL: Minimum Number of Stops\n");
    printf("========================================\n");
    
    int stop_count = 0;
    printf("Route Path: ");
    print_path(parent, dest, &stop_count);
    printf("\n");
    
    // Calculate total physical distance for the discovered BFS path
    int total_dist = 0;
    int curr = dest;
    while (parent[curr] != -1) {
        total_dist += graph[parent[curr]][curr];
        curr = parent[curr];
    }

    printf("Total Number of Stops: %d\n", stop_count);
    printf("Total Distance: %d units\n", total_dist);
    printf("Status: Optimal route successfully generated\n");
    printf("========================================\n");
}

/**
 * Utility for Dijkstra: Finds the unvisited vertex with the minimum distance value.
 */
int min_distance(int dist[], bool sptSet[]) {
    int min = INF;
    int min_index = -1;
    
    for (int v = 0; v < MAX_STOPS; v++) {
        if (sptSet[v] == false && dist[v] <= min && dist[v] != INF) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

/**
 * CORE ALGORITHM 2: Dijkstra's Shortest Path Algorithm
 * Purpose: Identifies the route with the shortest physical geographical distance.
 * It strictly adheres to adjacency matrix edge weights.
 */
void find_shortest_distance(int src, int dest) {
    int dist[MAX_STOPS];     // Holds shortest distance from src to i
    bool sptSet[MAX_STOPS];  // True if vertex is included in shortest path tree
    int parent[MAX_STOPS];   // Array to store shortest path tree

    // Initialization
    for (int i = 0; i < MAX_STOPS; i++) {
        dist[i] = INF;
        sptSet[i] = false;
        parent[i] = -1;
    }

    dist[src] = 0; // Distance of source vertex from itself is always 0

    // Find shortest path for all vertices
    for (int count = 0; count < MAX_STOPS - 1; count++) {
        // Pick minimum distance vertex
        int u = min_distance(dist, sptSet);
        
        // Disconnected graph safeguard: no reachable unvisited vertices left
        if (u == -1) break; 
        
        sptSet[u] = true; // Mark picked vertex as processed
        
        // Optimization: Early exit if we have solidified the shortest path to destination
        if (u == dest) break;

        // Update dist value of adjacent vertices
        for (int v = 0; v < MAX_STOPS; v++) {
            if (!sptSet[v] && graph[u][v] > 0 && dist[u] != INF && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }

    // Output Handling
    if (dist[dest] == INF) {
        printf("\n========================================\n");
        printf("Route Status: NO ROUTE FOUND\n");
        printf("========================================\n");
        return;
    }

    printf("\n========================================\n");
    printf("ALGORITHM: Dijkstra's Algorithm\n");
    printf("GOAL: Shortest Distance\n");
    printf("========================================\n");

    int stop_count = 0;
    printf("Route Path: ");
    print_path(parent, dest, &stop_count);
    printf("\n");

    printf("Total Number of Stops: %d\n", stop_count);
    printf("Total Distance: %d units\n", dist[dest]);
    printf("Status: Optimal route successfully generated\n");
    printf("========================================\n");
}

int main() {
    printf("========================================\n");
    printf("  BUS ROUTE PLANNER SYSTEM ENGINE\n");
    printf("========================================\n");
    printf("Available System Stops: A, B, C, D, E, F\n");

    char src_str[10], dest_str[10];
    
    // Interactive Event Loop
    while (1) {
        printf("\nEnter Source Stop (or 'Q' to quit): ");
        if (scanf("%9s", src_str) != 1) break;
        if (strcmp(src_str, "Q") == 0 || strcmp(src_str, "q") == 0) break;

        printf("Enter Destination Stop: ");
        if (scanf("%9s", dest_str) != 1) break;

        int src = get_stop_index(src_str);
        int dest = get_stop_index(dest_str);

        // Validation Checks
        if (src == -1 || dest == -1) {
            printf("Error: Invalid stop name entered. Please use strictly A, B, C, D, E, or F.\n");
            continue;
        }

        if (src == dest) {
            printf("Error: Source and Destination cannot be the same stop.\n");
            continue;
        }

        printf("\nSelect Routing Algorithm:\n");
        printf("1. Find Minimum Number of Stops (BFS)\n");
        printf("2. Find Shortest Geographical Distance (Dijkstra)\n");
        printf("Choice: ");
        
        int choice;
        if (scanf("%d", &choice) != 1) {
             printf("Error: Invalid input format.\n");
             // Clean input buffer to prevent infinite loop
             int c;
             while ((c = getchar()) != '\n' && c != EOF);
             continue;
        }

        // Logic branching
        if (choice == 1) {
            find_minimum_stops(src, dest);
        } else if (choice == 2) {
            find_shortest_distance(src, dest);
        } else {
            printf("Error: Invalid algorithm choice selected.\n");
        }
    }

    printf("\nSystem shutting down cleanly. Goodbye!\n");
    return 0;
}
