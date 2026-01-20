
import { PathManager, Point, Grid, Node } from "../scripts/pathing/pathManager.mjs";

import * as fs from 'fs';

class TextGrid {
    constructor(gridText) {
        this.gridText = gridText;
    }

    traversable(point) {
        return point.x >= 0 && point.y >= 0
            && point.x < this.gridText.length && point.y < this.gridText[this.x].length
            && this.gridText[point.x][point.y] != 'X'
    }
}

class TextNode extends Node {
    constructor(position, value) {
        super(position, value);
    }

    traversable() {
        return this.value === '.' || this.value === '#';
    }
}

describe("A* algorithm tests using a generic text representation of the board.",  function () {
    it("Find shortest path for simple 10x10 grid.", function () {
        //fs.readFile("monolitic.txt", "binary");

        const gridText = fs.readFileSync("./spec/map1.txt", "utf-8");

        const grid = new TextGrid(gridText);

        const startPoint = new Point(2, 2);
        const endPoint = new Point(7, 4);

        //const path = PathManager.findPath(grid, startPoint, endPoint);
    })
})

describe("Grid represents some underlying game board", function () {
    it("Create grid from text data", function () {
        const gridText = fs.readFileSync("./spec/map1.txt", "utf-8");
        const gridArray = gridText.split('\n').map(row => {
            return row.split(' ');
        })
        const grid = new Grid(gridArray, (position, value) => new TextNode(position, value));

        let gridNode = grid.getNode(0, 0);
        expect(gridNode?.value).toBe('.');
    })

    it("Check bounds of some point on the grid", function () {
        const gridText = fs.readFileSync("./spec/map1.txt", "utf-8");
        const gridArray = gridText.split('\n').map(row => {
            return row.split(' ');
        })
        const grid = new Grid(gridArray, (position, value) => new TextNode(position, value));
        expect(grid.checkBounds(-1, 0)).toBe(false);
        expect(grid.checkBounds(0, 0)).toBe(true);
        expect(grid.checkBounds(grid.width - 1, 0)).toBe(true);
        expect(grid.checkBounds(0, grid.height - 1)).toBe(true);
        expect(grid.checkBounds(0, grid.height)).toBe(false);
        expect(grid.checkBounds(grid.width, 0)).toBe(false);
        expect(grid.checkBounds(5, 5)).toBe(true);
    })

    it("Can get unvisited neighbors of a node", function () {
        const gridText = fs.readFileSync("./spec/map1.txt", "utf-8");
        const gridArray = gridText.split('\n').map(row => {
            return row.split(' ');
        })
        const grid = new Grid(gridArray, (position, value) => new TextNode(position, value));

        let neighbors = grid.neighborNodes(new Point(0, 0));
        expect(neighbors.length).toBe(3);

        // Check the right top corner.
        neighbors = grid.neighborNodes(new Point(0, grid.width - 1));
        expect(neighbors.length).toBe(3);

        // Check bottom right corner.
        neighbors = grid.neighborNodes(new Point(grid.height - 1, grid.width - 1));
        expect(neighbors.length).toBe(3);

        // Check bottom left corner.
        neighbors = grid.neighborNodes(new Point(grid.height - 1, 0));
        expect(neighbors.length).toBe(3);

        // Check top edge.
        neighbors = grid.neighborNodes(new Point(1, 0));
        expect(neighbors.length).toBe(5);

        // Check right edge.
        neighbors = grid.neighborNodes(new Point(1, grid.width - 1));
        expect(neighbors.length).toBe(5);

        // Check bottom edge.
        neighbors = grid.neighborNodes(new Point(grid.height - 1, 1));
        expect(neighbors.length).toBe(5);

        // Check left edge.
        neighbors = grid.neighborNodes(new Point(0, 1));
        expect(neighbors.length).toBe(5);

        // Off edge
        neighbors = grid.neighborNodes(new Point(2, 2));
        expect(neighbors.length).toBe(8);
    })

    it("Doesn't return visited nodes", function () {
        const gridText = fs.readFileSync("./spec/map1.txt", "utf-8");
        const gridArray = gridText.split('\n').map(row => {
            return row.split(' ');
        })
        const grid = new Grid(gridArray, (position, value) => new TextNode(position, value));

        const visited = grid.getNode(0, 1);
        visited.visited = true;

        let neighbors = grid.neighborNodes(new Point(0, 0));
        expect(neighbors.length).toBe(2);
    })

    it("Doesn't return non-traversable nodes", function () {
        const gridText = fs.readFileSync("./spec/map1.txt", "utf-8");
        const gridArray = gridText.split('\n').map(row => {
            return row.split(' ');
        })
        const grid = new Grid(gridArray, (position, value) => new TextNode(position, value));

        const visited = grid.getNode(0, 1);
        visited.value = 'X';

        let neighbors = grid.neighborNodes(new Point(0, 0));
        expect(neighbors.length).toBe(2);
    })
})

describe("Check point distances", function () {
    it ("Point distance (0,0) -> (0, 1)", function () {
        const point1 = new Point(0, 0);
        const point2 = new Point(0, 1);
        const distance = point1.distanceTo(point2);
        expect(distance).toBe(1);
    })

    it ("Point distance (0,0) -> (0, 5)", function () {
        const point1 = new Point(0, 0);
        const point2 = new Point(0, 5);
        const distance = point1.distanceTo(point2);
        expect(distance).toBe(5);
    })

    it ("Point distance (0,0) -> (1, 0)", function () {
        const point1 = new Point(0, 0);
        const point2 = new Point(1, 0);
        const distance = point1.distanceTo(point2);
        expect(distance).toBe(1);
    })

    it ("Point distance (0,0) -> (5, 0)", function () {
        const point1 = new Point(0, 0);
        const point2 = new Point(5, 0);
        const distance = point1.distanceTo(point2);
        expect(distance).toBe(5);
    })

    it ("Point distance (0,0) -> (5, 5)", function () {
        const point1 = new Point(0, 0);
        const point2 = new Point(5, 5);
        const distance = point1.distanceTo(point2);
        expect(distance).toBe(10);
    })
})