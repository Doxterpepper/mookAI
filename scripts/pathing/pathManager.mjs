
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
    }
}

export class Node {
    constructor(position, value=null) {
        this.position = position;
        this.fromSource = 0;
        this.toDestination = 0;
        this.visited = false;
        this.movementCost = 1;
        this.value = value;
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
                    neighbors.push(node);
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
    static findPath(grid, point1, point2) {        //
        // https://en.wikipedia.org/wiki/A*_search_algorithm
        //
        // A* is pretty simple. It's a greedy search algorithm. So use a priority queue to track
        //  the next node to check. The priority queue is a min-heap that minimizes the function:
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
            return a.distanceToDestination() < b.distanceToDestination();
        }

        let frontier = new PriorityQueue(comparison);

        let startNode = grid.getNode(point1.x, point1.y);
        const finalNode = grid.getNode(point2.x, point2.y);
        frontier.push(startNode);

        while (frontier.length > 0) {
            const currentNode = frontier.pop();
            if (currentNode.x === finalNode.x && currentNode.y === finalNode.y) {
                //
                // Done. Return the amount of time spent getting here.
                // TODO: Unwind and return the _actual path_. Should be trivial once it's done.
                //
                return currentNode.fromSource;
            }
            //currentNode.visited = true;

            let neighborNodes = grid.neighborNodes(currentNode);
            // Go through each valid neighbor node and add it to the frontier.
            //
            // The distance from the source node is the distance from the previous node to this node.
            // 
            neighborNodes.forEach(neighbor => {
                neighbor.toDestination = neighbor.distanceTo(finalNode);
                //
                // Movement cost seems 5e specific. The idea is most movement will cost 5 ft
                // of movement, sometimes it's double movement for difficult terrain. This
                // should be customizable, and a new way to represent this in a more generic way
                // may be needed.
                //
                neighbor.fromSource = currentNode.fromSource + currentNode.movementCost;
                frontier.push(neighbor);
            })
        }
    }
}