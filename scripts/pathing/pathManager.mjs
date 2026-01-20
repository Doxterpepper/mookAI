
/**
 * This is intended to replace the existing path management code. The existing code is
 * tightly coupled with foundry, and it would be nice to have a more generic algorithm that
 * does not directly depend on foundry APIs.
 *
 * The existing process is to use A* path search to find a potential path to the target.
 *
 * The problem I see right now is this. How does the system determine a destination? The
 * target itself cannot be traversed. So it should be some square within melee range of the
 * target, or within ranged distance. This is variable and could change depending on the target
 * or monster.
 *
 * Example, most player characters stand in a single square, in 5e DND, a square is 5 ft by 5ft.
 * Sometimes, a character could be large. Some races, or abilities could make a PC a large character
 * occupying 2x2 squares. Entering the player space is not a valid move, but how do we consider
 * good squares to enter? Maybe this should be part of the planning phase?
 *
 * For now, I will implement A* without any of this context. It will just be path to a destination.
 * The world info will be abstracted into some type, maybe a Grid, that knows if a square is traversable
 * or not. This can be constructed from Foundry APIs, but does not depend on them after construction.
 *
 * Again, the goal is to limit foundry API calls to very specific places so when they inevitably change,
 * there is ony one contained place to refactor.
 */

import { PriorityQueue } from "./priorityQueue.mjs";

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get the estimaged distance from this point to the other point. Using Manhattan geometry
     * since exactness isn't required. This is subject to change.
     * https://en.wikipedia.org/wiki/Taxicab_geometry
     * @param {Point} otherNode
     * @returns
     */
    distanceTo(otherNode) {
        return Math.abs(this.x - otherNode.x) + Math.abs(this.y - otherNode.y);
        //return Math.sqrt(Math.pow(this.x - otherNode.x, 2) + Math.pow(this.y - otherNode.y, 2)) // Euclidean distance.
    }
}

export class Node {
    constructor(position, value=null) {
        this.position = position;
        this.fromSource = NaN;
        this.toDestination = 0;
        this.visited = false;
        this.movementCost = 1;
        this.value = value;
        this.previousNode = null;
    }

    distanceToDestination() {
        return this.fromSource + this.toDestination;
    }

    traversable() {
        throw "abstract traversable."
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    distanceTo(destinationNode) {
        return this.position.distanceTo(destinationNode.position);
    }

    pathFrom() {
        let pathArr = [];
        let maxDepth = 15; // TODO: Smarter value, don't hardcode.
        let currentNode = this;
        while (maxDepth > 0 && currentNode !== null) {
            maxDepth--;
            
            pathArr.push(currentNode);
            currentNode = currentNode.previousNode;
        }
        if (maxDepth === 0) {
            console.log(pathArr)
            throw "Hit max depth!";
        }
        return pathArr;
    }
}

/**
 * Grid represents the game grid. I think this will be an abstract class
 * that includes an interface to whatever information is needed about the game board.
 *
 * Plan right now is to use the standard x and y coordinate system. x=0 and y=0 indicates
 * the top left square on the grid. y indicates the column, x indicates the row.
 */
export class Grid {
    constructor(gridArray, newNode) {
        this.grid = gridArray.map((row, rowIndex) => {
            return row.map((column, colIndex) => {
                return newNode(new Point(rowIndex, colIndex), column);
            })
        });
    }

    neighborNodes(node) {
        let neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }

                const indexX = node.x + i;
                const indexY = node.y + j;
                //
                // Skip if it's off the board, visited, or not traversable.
                //
                if (!this.checkBounds(indexX, indexY) ) {
                    continue;
                }

                const neighborNode = this.grid[indexX][indexY];

                if (!neighborNode.visited && neighborNode.traversable()) {
                    neighbors.push(neighborNode);
                }

            }
        }

        return neighbors;
    }

    checkBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.grid.length && y < this.grid[x].length;
    }

    getNode(x, y) {
        if (!this.checkBounds(x, y)) {
            return null;
        }

        return this.grid[x][y];
    }

    get height() {
        return this.grid.length;
    }

    get width() {
        if (this.grid.length > 0) {
            return this.grid[0].length;
        }
        return 0;
    }
}

export class PathManager {
    /**
     * Still very much drafting. Implementation of A* to find a path from point1 to point2 on
     * the given grid.
     *
     * TODO: Move this into the grid class. I think the Grid may be a good place to provide pathing.
     * @param {Grid} grid
     * @param {Point} point1
     * @param {Point} point2
     */
    static findPath(grid, point1, point2) {
        //
        // https://en.wikipedia.org/wiki/A*_search_algorithm
        //
        // A* is pretty simple. It's a greedy search algorithm. So use a priority queue to track
        // the next node to check. The priority queue is a min-heap that minimizes the function:
        //
        // f(n) = g(n) + h(n)
        //
        // where g(n) is the movement cost to get to node n, and h(n) is the estimated
        // movement cost to the destination.
        //
        // The intuition is to simply keep searching for nodes that are progressively closer to
        // the destination.
        //
        // The simplest function for h(n) is a straight line distance to the destination.
        //

        let comparison = (a, b) => {
            const aDistance = a.distanceToDestination();
            const bDistance = b.distanceToDestination();
            //
            // Treat NaN as infinity.
            // If a is NaN, then b < a
            // If b is NaN, then a < b
            //
            if (isNaN(aDistance)) {
                return false;
            } else if (isNaN(bDistance)) {
                return true;
            }

            return a.distanceToDestination() < b.distanceToDestination();
        }

        let frontier = new PriorityQueue(comparison);
        let nodesInFrontier = new Set(); // For tracking if a node is in the queue.

        let startNode = grid.getNode(point1.x, point1.y);
        const finalNode = grid.getNode(point2.x, point2.y);

        startNode.fromSource = 0;
        startNode.toDestination = startNode.distanceTo(finalNode);

        frontier.push(startNode);
        nodesInFrontier.add(startNode);

        while (frontier.length > 0) {
            const currentNode = frontier.pop();
            if (currentNode.x === finalNode.x && currentNode.y === finalNode.y) {
                //
                // Done. Return the amount of time spent getting here.
                // TODO: Unwind and return the _actual path_. Should be trivial once it's done.
                // Just track the previous node from the current node.
                //
                //return currentNode.fromSource;
                return currentNode.pathFrom();
            }

            let neighborNodes = grid.neighborNodes(currentNode);
            // Go through each valid neighbor node and add it to the frontier.
            //
            // The distance from the source node is the distance from the previous node to this node.
            //
            neighborNodes.forEach(neighbor => {
                //
                // Movement cost seems 5e specific. The idea is most movement will cost 5 ft
                // of movement, sometimes it's double movement for difficult terrain. This
                // should be customizable, and a new way to represent this in a more generic way
                // may be needed.
                //
                //
                // neighborToTotal may be NaN because neighbor.fromSource could be undefined (NaN).
                //
                const distanceToNeighbor = currentNode.fromSource + currentNode.movementCost; // TODO: Bad name
                neighbor.toDestination = neighbor.distanceTo(finalNode);
                const neighborTotal = neighbor.fromSource + neighbor.toDestination; // TODO: Also probably a bad name.

                //
                // If we find the travel cost from the current node to this neighbor is less than the known cost to this
                // neighbor then we've found the new cheapest path to the neighbor.
                //
                // If the neighborTotal is undefined, hence not being visited yet, then this is by default the shortest known
                // path to the neighbor.
                //
                if (isNaN(neighborTotal) || distanceToNeighbor < neighborTotal) {
                    neighbor.fromSource = distanceToNeighbor;
                    neighbor.previousNode = currentNode;
                    //
                    // Now add the neighbor to the queue if not already in it, if it's
                    // already in it, then reheap the queue.
                    //
                    if (nodesInFrontier.has(neighbor)) {
                        // TODO: Looks like reheap needs to be public?
                        frontier._reheap();
                    } else {
                        frontier.push(neighbor);
                        nodesInFrontier.add(neighbor);
                    }
                }
            })
        }
    }
}