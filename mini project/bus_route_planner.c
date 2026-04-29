#include <stdio.h>
#include <limits.h>

#define MAX 20

int graph[MAX][MAX], n;

// Function to find minimum distance vertex
int minDistance(int dist[], int visited[]) {
    int min = INT_MAX, min_index = -1;

    for (int i = 0; i < n; i++) {
        if (!visited[i] && dist[i] <= min) {
            min = dist[i];
            min_index = i;
        }
    }
    return min_index;
}

// Function to print path
void printPath(int parent[], int j) {
    if (parent[j] == -1) {
        printf("%d ", j);
        return;
    }
    printPath(parent, parent[j]);
    printf("%d ", j);
}

// Dijkstra Algorithm
void dijkstra(int src, int dest) {
    int dist[MAX], visited[MAX], parent[MAX];

    for (int i = 0; i < n; i++) {
        dist[i] = INT_MAX;
        visited[i] = 0;
        parent[i] = -1;
    }

    dist[src] = 0;

    for (int count = 0; count < n - 1; count++) {
        int u = minDistance(dist, visited);
        visited[u] = 1;

        for (int v = 0; v < n; v++) {
            if (!visited[v] && graph[u][v] &&
                dist[u] != INT_MAX &&
                dist[u] + graph[u][v] < dist[v]) {

                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }

    printf("\nShortest Distance: %d\n", dist[dest]);
    printf("Path: ");
    printPath(parent, dest);
    printf("\n");
}

int main() {
    int src, dest;

    printf("Enter number of bus stops: ");
    scanf("%d", &n);

    printf("\nEnter adjacency matrix (distance between stops):\n");
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &graph[i][j]);
        }
    }

    printf("\nEnter source stop (0 to %d): ", n - 1);
    scanf("%d", &src);

    printf("Enter destination stop (0 to %d): ", n - 1);
    scanf("%d", &dest);

    dijkstra(src, dest);

    return 0;
}
