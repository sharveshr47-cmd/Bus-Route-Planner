import sys

MAX = 20
graph = []
n = 0

# Function to find minimum distance vertex
def min_distance(dist, visited):
    minimum = sys.maxsize
    min_index = -1

    for i in range(n):
        if not visited[i] and dist[i] <= minimum:
            minimum = dist[i]
            min_index = i
    return min_index

# Function to print path
def print_path(parent, j):
    if parent[j] == -1:
        print(j, end=" ")
        return
    print_path(parent, parent[j])
    print(j, end=" ")

# Dijkstra Algorithm
def dijkstra(src, dest):
    dist = [sys.maxsize] * n
    visited = [False] * n
    parent = [-1] * n

    dist[src] = 0

    for _ in range(n - 1):
        u = min_distance(dist, visited)
        visited[u] = True

        for v in range(n):
            if (not visited[v] and graph[u][v] != 0 and
                dist[u] != sys.maxsize and
                dist[u] + graph[u][v] < dist[v]):

                dist[v] = dist[u] + graph[u][v]
                parent[v] = u

    print("\nShortest Distance:", dist[dest])
    print("Path:", end=" ")
    print_path(parent, dest)
    print()

# Main program
n = int(input("Enter number of bus stops: "))

print("\nEnter adjacency matrix (distance between stops):")
for i in range(n):
    row = list(map(int, input().split()))
    graph.append(row)

src = int(input(f"\nEnter source stop (0 to {n - 1}): "))
dest = int(input(f"Enter destination stop (0 to {n - 1}): "))

dijkstra(src, dest)
