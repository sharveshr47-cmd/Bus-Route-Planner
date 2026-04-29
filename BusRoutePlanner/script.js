/**
 * BUS ROUTE PLANNER SYSTEM - FRONTEND ALGORITHM VISUALIZATION LOGIC
 * Implements Graph Traversal (BFS & Dijkstra) with real step-by-step animation.
 */

// ==========================================
// 1. GRAPH DATA STRUCTURE DEFINITION
// ==========================================
const stopNames = ['A', 'B', 'C', 'D', 'E', 'F'];

const nodes = [
    { id: 'A', label: 'A', x: 20, y: 30 },
    { id: 'B', label: 'B', x: 50, y: 15 },
    { id: 'C', label: 'C', x: 80, y: 30 },
    { id: 'D', label: 'D', x: 20, y: 70 },
    { id: 'E', label: 'E', x: 50, y: 85 },
    { id: 'F', label: 'F', x: 80, y: 70 }
];

const adjMatrix = [
    [0, 4, 0, 7, 0, 0], // Stop A connections
    [4, 0, 3, 0, 6, 0], // Stop B connections
    [0, 3, 0, 2, 0, 5], // Stop C connections
    [7, 0, 2, 0, 4, 0], // Stop D connections
    [0, 6, 0, 4, 0, 3], // Stop E connections
    [0, 0, 5, 0, 3, 0]  // Stop F connections
];

const edges = [];
for (let i = 0; i < stopNames.length; i++) {
    for (let j = i + 1; j < stopNames.length; j++) {
        if (adjMatrix[i][j] > 0) {
            edges.push({ source: stopNames[i], target: stopNames[j], weight: adjMatrix[i][j] });
        }
    }
}

// ==========================================
// 2. DOM ELEMENTS CACHING
// ==========================================
const DOM = {
    svgContainer: document.getElementById('map-container'),
    svgEdges: document.getElementById('edges-layer'),
    svgHighlights: document.getElementById('highlights-layer'),
    svgNodes: document.getElementById('nodes-layer'),
    busIcon: document.getElementById('bus-icon'),
    
    sourceSelect: document.getElementById('source'),
    destSelect: document.getElementById('destination'),
    btnBfs: document.getElementById('btn-bfs'),
    btnDijkstra: document.getElementById('btn-dijkstra'),
    btnReset: document.getElementById('btn-reset'),
    
    routeStatus: document.getElementById('route-status'),
    emptyState: document.querySelector('.empty-state'),
    dataState: document.querySelector('.data-state'),
    
    processOverlay: document.getElementById('process-overlay'),
    processText: document.getElementById('process-text'),
    processSteps: [
        document.getElementById('pstep-1'),
        document.getElementById('pstep-2'),
        document.getElementById('pstep-3')
    ],
    
    outSource: document.getElementById('out-source'),
    outDest: document.getElementById('out-dest'),
    outAlgo: document.getElementById('out-algo'),
    outTraversal: document.getElementById('out-traversal'),
    outChecked: document.getElementById('out-checked'),
    outRoute: document.getElementById('out-route'),
    outStops: document.getElementById('out-stops'),
    outDist: document.getElementById('out-dist'),
    outStatus: document.getElementById('out-status'),
    
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

let currentBusAnimation = null;
let animationTimeouts = [];
let currentPath = [];
let toastTimeout = null;

// ==========================================
// 3. INITIALIZATION & RENDERING
// ==========================================
function initGraph() {
    renderGraph();
    window.addEventListener('resize', () => {
        renderGraph();
        if (currentPath.length > 0) {
            drawFinalPath(currentPath, false); // Instant redraw
        }
    });
}

function renderGraph() {
    const width = DOM.svgContainer.clientWidth || 500;
    const height = DOM.svgContainer.clientHeight || 450;
    
    DOM.svgEdges.innerHTML = '';
    DOM.svgNodes.innerHTML = '';
    
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        const x1 = (sourceNode.x / 100) * width;
        const y1 = (sourceNode.y / 100) * height;
        const x2 = (targetNode.x / 100) * width;
        const y2 = (targetNode.y / 100) * height;
        
        // Base edge line with unique ID for algorithms to find
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'edge');
        line.setAttribute('id', `edge-${edge.source}-${edge.target}`); // ID required for scanning animation
        DOM.svgEdges.appendChild(line);
        
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', midX - 12);
        rect.setAttribute('y', midY - 12);
        rect.setAttribute('width', 24);
        rect.setAttribute('height', 24);
        rect.setAttribute('class', 'edge-weight-bg');
        DOM.svgEdges.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY + 5);
        text.setAttribute('class', 'edge-weight');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = edge.weight;
        
        DOM.svgEdges.appendChild(text);
    });
    
    nodes.forEach(node => {
        const cx = (node.x / 100) * width;
        const cy = (node.y / 100) * height;
        
        // Group containing circle and text with unique ID for traversal finding
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', `node-${node.id}`);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', 22);
        circle.setAttribute('class', 'node');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', cx);
        text.setAttribute('y', cy);
        text.setAttribute('class', 'node-text');
        text.textContent = node.label;
        
        group.appendChild(circle);
        group.appendChild(text);
        DOM.svgNodes.appendChild(group);
    });
}

// ==========================================
// 4. ALGORITHMS WITH INTELLIGENT ROUTE TRACKING
// ==========================================
function getStopIndex(stopLabel) {
    return stopNames.indexOf(stopLabel);
}

function solveBFS(src, dest) {
    const srcIdx = getStopIndex(src);
    const destIdx = getStopIndex(dest);
    
    let visited = new Array(stopNames.length).fill(false);
    let parent = new Array(stopNames.length).fill(-1);
    let queue = [];
    
    let trace = []; 
    let traversalOrder = []; 
    let edgesChecked = 0;
    
    // Stage 1 Tracing
    trace.push({ type: 'status', text: 'Initiating network search process...', step: 1 });
    trace.push({ type: 'set_endpoints', src: src, dest: dest });
    
    visited[srcIdx] = true;
    queue.push(srcIdx);
    
    trace.push({ type: 'visit', node: src });
    traversalOrder.push(src);
    
    trace.push({ type: 'status', text: 'Searching possible bus connections...', step: 1 });
    
    let found = false;
    
    while (queue.length > 0) {
        let u = queue.shift();
        
        if (u === destIdx) {
            found = true;
            break; 
        }
        
        trace.push({ type: 'status', text: `Checking neighboring stops from Station ${stopNames[u]}...`, step: 1 });
        
        for (let v = 0; v < stopNames.length; v++) {
            if (adjMatrix[u][v] > 0) {
                edgesChecked++;
                trace.push({ type: 'scan_edge', u: stopNames[u], v: stopNames[v] });
                trace.push({ type: 'checked_route', count: edgesChecked });
                
                if (!visited[v]) {
                    visited[v] = true;
                    parent[v] = u;
                    queue.push(v);
                    
                    trace.push({ type: 'visit', node: stopNames[v] });
                    traversalOrder.push(stopNames[v]);
                    
                    if (v === destIdx) {
                        trace.push({ type: 'status', text: `Destination Stop ${dest} successfully found!`, step: 1 });
                        found = true;
                        break;
                    }
                }
            }
        }
        if (found) break;
    }
    
    if (!found && !visited[destIdx]) return null;
    
    // Stage 2 Tracing
    trace.push({ type: 'status', text: 'Computing optimal route with Minimum Stops...', step: 2 });
    trace.push({ type: 'status', text: 'Comparing alternate travel paths...', step: 2 });
    
    let path = [];
    let curr = destIdx;
    let totalDist = 0;
    
    while (curr !== -1) {
        path.unshift(stopNames[curr]);
        if (parent[curr] !== -1) {
            totalDist += adjMatrix[parent[curr]][curr];
        }
        curr = parent[curr];
    }
    
    // Stage 3 Tracing
    trace.push({ type: 'status', text: 'Finalizing Optimal Route Output.', step: 3 });
    
    return { path, totalDist, stops: path.length, traversalOrder, trace, edgesChecked };
}

function solveDijkstra(src, dest) {
    const srcIdx = getStopIndex(src);
    const destIdx = getStopIndex(dest);
    
    let dist = new Array(stopNames.length).fill(Infinity);
    let sptSet = new Array(stopNames.length).fill(false);
    let parent = new Array(stopNames.length).fill(-1);
    
    let trace = [];
    let traversalOrder = [];
    let edgesChecked = 0;
    
    // Stage 1 Tracing
    trace.push({ type: 'status', text: 'Initiating network search process...', step: 1 });
    trace.push({ type: 'set_endpoints', src: src, dest: dest });
    
    dist[srcIdx] = 0;
    
    trace.push({ type: 'status', text: 'Searching possible bus connections by weighted distance...', step: 1 });
    
    for (let count = 0; count < stopNames.length; count++) {
        let u = -1;
        let min = Infinity;
        for (let v = 0; v < stopNames.length; v++) {
            if (!sptSet[v] && dist[v] <= min && dist[v] !== Infinity) {
                min = dist[v];
                u = v;
            }
        }
        
        if (u === -1) break;
        
        sptSet[u] = true;
        
        trace.push({ type: 'status', text: `Evaluating neighboring connections from Station ${stopNames[u]}...`, step: 1 });
        trace.push({ type: 'visit', node: stopNames[u] });
        traversalOrder.push(stopNames[u]);
        
        if (u === destIdx) {
            trace.push({ type: 'status', text: `Destination Stop ${dest} successfully found!`, step: 1 });
            break;
        }
        
        for (let v = 0; v < stopNames.length; v++) {
            if (!sptSet[v] && adjMatrix[u][v] > 0) {
                edgesChecked++;
                trace.push({ type: 'scan_edge', u: stopNames[u], v: stopNames[v] });
                trace.push({ type: 'checked_route', count: edgesChecked });
                
                if (dist[u] !== Infinity && dist[u] + adjMatrix[u][v] < dist[v]) {
                    dist[v] = dist[u] + adjMatrix[u][v];
                    parent[v] = u;
                }
            }
        }
    }
    
    if (dist[destIdx] === Infinity) return null;
    
    // Stage 2 Tracing
    trace.push({ type: 'status', text: 'Computing optimal route with Shortest Geographical Distance...', step: 2 });
    trace.push({ type: 'status', text: 'Comparing alternate travel paths distances...', step: 2 });
    
    let path = [];
    let curr = destIdx;
    while (curr !== -1) {
        path.unshift(stopNames[curr]);
        curr = parent[curr];
    }
    
    // Stage 3 Tracing
    trace.push({ type: 'status', text: 'Finalizing Optimal Route Output.', step: 3 });
    
    return { path, totalDist: dist[destIdx], stops: path.length, traversalOrder, trace, edgesChecked };
}

// ==========================================
// 5. ANIMATION ENGINE & UI UPDATES
// ==========================================
function clearAllAnimations() {
    animationTimeouts.forEach(clearTimeout);
    animationTimeouts = [];
    if (currentBusAnimation) clearTimeout(currentBusAnimation);
    
    DOM.svgHighlights.innerHTML = '';
    DOM.busIcon.classList.add('hidden');
    
    // Reset process steps UI
    DOM.processSteps.forEach(el => el.className = 'step pending');
    DOM.processText.textContent = '';
    
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('node-visited', 'node-pulse', 'node-highlight', 'node-source', 'node-dest');
    });
    document.querySelectorAll('.edge').forEach(e => {
        e.classList.remove('edge-scanned');
    });
}

function runAlgorithmAnimation(result, algoName) {
    clearAllAnimations();
    
    DOM.routeStatus.textContent = 'Searching...';
    DOM.routeStatus.className = 'status-badge running';
    
    DOM.emptyState.classList.add('hidden');
    DOM.dataState.classList.add('hidden');
    DOM.processOverlay.classList.remove('hidden'); // Show processing stage
    
    let delay = 0;
    const stepTimeMs = 600; // Realistic delay for human viewing
    
    // 1. Play algorithmic trace visually
    result.trace.forEach(step => {
        let t = setTimeout(() => {
            if (step.type === 'status') {
                DOM.processText.textContent = step.text;
                DOM.processSteps.forEach((el, idx) => {
                    if (idx + 1 === step.step) el.className = 'step active';
                    else if (idx + 1 < step.step) el.className = 'step completed';
                });
            } 
            else if (step.type === 'set_endpoints') {
                const srcNode = document.getElementById(`node-${step.src}`);
                if (srcNode) srcNode.querySelector('.node').classList.add('node-source');
                const destNode = document.getElementById(`node-${step.dest}`);
                if (destNode) destNode.querySelector('.node').classList.add('node-dest');
            }
            else if (step.type === 'visit') {
                const nodeGroup = document.getElementById(`node-${step.node}`);
                if (nodeGroup) {
                    const circle = nodeGroup.querySelector('.node');
                    // Add visited class (keeps it yellow) and pulse animation
                    circle.classList.add('node-visited', 'node-pulse');
                    setTimeout(() => circle.classList.remove('node-pulse'), 500); 
                }
            } 
            else if (step.type === 'scan_edge') {
                let line = document.getElementById(`edge-${step.u}-${step.v}`) || document.getElementById(`edge-${step.v}-${step.u}`);
                if (line) {
                    line.classList.add('edge-scanned');
                    // Remove the animated dash class quickly so it flashes realistically
                    setTimeout(() => line.classList.remove('edge-scanned'), stepTimeMs - 50); 
                }
            }
        }, delay);
        animationTimeouts.push(t);
        delay += stepTimeMs;
    });
    
    // 2. Trigger final success UI after trace completes
    let tFinal = setTimeout(() => {
        DOM.processOverlay.classList.add('hidden');
        displayFinalResults(result, algoName);
    }, delay + 500);
    
    animationTimeouts.push(tFinal);
}

function displayFinalResults(result, algoName) {
    currentPath = result.path;
    
    DOM.dataState.classList.remove('hidden');
    
    DOM.routeStatus.textContent = 'Active Route';
    DOM.routeStatus.className = 'status-badge success';
    
    // Fill textual output accurately
    DOM.outSource.textContent = `Station ${result.path[0]}`;
    DOM.outDest.textContent = `Station ${result.path[result.path.length - 1]}`;
    DOM.outAlgo.textContent = algoName;
    DOM.outTraversal.textContent = result.traversalOrder.join(' → ');
    DOM.outChecked.textContent = `${result.edgesChecked} Paths Compared`;
    DOM.outStops.textContent = result.stops;
    DOM.outDist.textContent = `${result.totalDist} units`;
    
    DOM.outStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Route Successfully Generated';
    DOM.outStatus.className = 'value success-text';
    
    // Build path bubbles
    DOM.outRoute.innerHTML = '';
    result.path.forEach((node, index) => {
        const span = document.createElement('span');
        span.className = 'path-node';
        span.textContent = node;
        span.style.animationDelay = `${index * 0.1}s`;
        DOM.outRoute.appendChild(span);
        
        if (index < result.path.length - 1) {
            const arrow = document.createElement('i');
            arrow.className = 'fa-solid fa-arrow-right path-arrow';
            arrow.style.animationDelay = `${index * 0.1 + 0.05}s`;
            DOM.outRoute.appendChild(arrow);
        }
    });
    
    drawFinalPath(result.path, true);
}

function drawFinalPath(path, animate) {
    DOM.svgHighlights.innerHTML = '';
    
    const width = DOM.svgContainer.clientWidth;
    const height = DOM.svgContainer.clientHeight;
    let delay = 0;
    
    for (let i = 0; i < path.length; i++) {
        // Highlight nodes
        const nodeGroup = document.getElementById(`node-${path[i]}`);
        if (nodeGroup) {
            if (animate) {
                setTimeout(() => nodeGroup.querySelector('.node').classList.add('node-highlight'), delay);
            } else {
                nodeGroup.querySelector('.node').classList.add('node-highlight');
            }
        }
        
        // Draw permanent glowing final edge
        if (i < path.length - 1) {
            const sourceNode = nodes.find(n => n.id === path[i]);
            const targetNode = nodes.find(n => n.id === path[i+1]);
            
            const x1 = (sourceNode.x / 100) * width;
            const y1 = (sourceNode.y / 100) * height;
            const x2 = (targetNode.x / 100) * width;
            const y2 = (targetNode.y / 100) * height;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'edge-highlight');
            
            if (animate) {
                line.style.animationDelay = `${delay}ms`;
            } else {
                line.style.animation = 'none';
                line.style.strokeDashoffset = '0';
            }
            DOM.svgHighlights.appendChild(line);
            
            if (animate) delay += 600;
        }
    }
    
    if (animate) {
        animateBus(path);
    } else {
        const endNode = nodes.find(n => n.id === path[path.length - 1]);
        DOM.busIcon.style.left = `${(endNode.x / 100) * width}px`;
        DOM.busIcon.style.top = `${(endNode.y / 100) * height}px`;
    }
}

function animateBus(path) {
    DOM.busIcon.classList.remove('hidden');
    const width = DOM.svgContainer.clientWidth;
    const height = DOM.svgContainer.clientHeight;
    
    const startNode = nodes.find(n => n.id === path[0]);
    DOM.busIcon.style.transition = 'none';
    DOM.busIcon.style.left = `${(startNode.x / 100) * width}px`;
    DOM.busIcon.style.top = `${(startNode.y / 100) * height}px`;
    
    void DOM.busIcon.offsetWidth; // Reflow
    
    DOM.busIcon.style.transition = 'left 0.6s ease-in-out, top 0.6s ease-in-out';
    
    let step = 1;
    function moveNext() {
        if (step >= path.length) return;
        const node = nodes.find(n => n.id === path[step]);
        DOM.busIcon.style.left = `${(node.x / 100) * width}px`;
        DOM.busIcon.style.top = `${(node.y / 100) * height}px`;
        
        step++;
        if (step < path.length) {
            currentBusAnimation = setTimeout(moveNext, 600);
        }
    }
    
    currentBusAnimation = setTimeout(moveNext, 100);
}

function displayNoRoute(algoName, src, dest) {
    DOM.processOverlay.classList.add('hidden');
    DOM.dataState.classList.remove('hidden');
    
    DOM.routeStatus.textContent = 'No Route';
    DOM.routeStatus.className = 'status-badge error';
    
    DOM.outSource.textContent = `Station ${src}`;
    DOM.outDest.textContent = `Station ${dest}`;
    DOM.outAlgo.textContent = algoName;
    DOM.outTraversal.textContent = "Execution halted - Graph Disconnected";
    DOM.outChecked.textContent = "0";
    DOM.outStops.textContent = '-';
    DOM.outDist.textContent = '-';
    
    DOM.outStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Route Unavailable';
    DOM.outStatus.className = 'value';
    DOM.outStatus.style.color = 'var(--danger)';
    
    DOM.outRoute.innerHTML = '<span style="color:var(--danger); font-weight: 500;">No continuous path connects these stops.</span>';
}

// ==========================================
// 6. EVENT HANDLERS & STARTUP
// ==========================================
function showToast(msg) {
    DOM.toastMessage.textContent = msg;
    DOM.toast.classList.remove('hidden');
    void DOM.toast.offsetWidth;
    DOM.toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => DOM.toast.classList.remove('show'), 3000);
}

function handleSearch(algoType) {
    const src = DOM.sourceSelect.value;
    const dest = DOM.destSelect.value;
    
    if (!src || !dest) return showToast("Please select both Source and Destination stops.");
    if (src === dest) return showToast("Source and Destination cannot be the same.");
    
    clearAllAnimations();
    
    let result, algoName;
    if (algoType === 'bfs') {
        result = solveBFS(src, dest);
        algoName = 'BFS (Minimum Transfers)';
    } else {
        result = solveDijkstra(src, dest);
        algoName = 'Dijkstra (Shortest Geographical Distance)';
    }
    
    if (result) {
        runAlgorithmAnimation(result, algoName);
    } else {
        // If no route, just show an instant failure
        DOM.emptyState.classList.add('hidden');
        DOM.processOverlay.classList.remove('hidden');
        DOM.processText.textContent = "Searching network...";
        setTimeout(() => {
            displayNoRoute(algoName, src, dest);
        }, 1000);
    }
}

DOM.btnBfs.addEventListener('click', () => handleSearch('bfs'));
DOM.btnDijkstra.addEventListener('click', () => handleSearch('dijkstra'));

DOM.btnReset.addEventListener('click', () => {
    DOM.sourceSelect.value = '';
    DOM.destSelect.value = '';
    currentPath = [];
    
    clearAllAnimations();
    DOM.processOverlay.classList.add('hidden');
    DOM.dataState.classList.add('hidden');
    DOM.emptyState.classList.remove('hidden');
    DOM.routeStatus.textContent = 'Idle';
    DOM.routeStatus.className = 'status-badge pending';
});

document.addEventListener("DOMContentLoaded", initGraph);
