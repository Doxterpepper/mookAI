const pathing = require("./scripts/pathing/priorityQueue.mjs")

let priorityQueue = new pathing.PriorityQueue();

//
// 7, 6, 5, 4, 3, 2, 1
//
// floor(7 / 2) = 3
// root: 4
// left: null
// right: null
//
// root: 5
// left: 2
// right: 1
// swap - 
// 
priorityQueue.tree = [7, 6, 5, 4, 3, 2, 1];
priorityQueue._reheap();

console.log(priorityQueue.tree);

let start = Math.floor(priorityQueue.tree.length / 2);
for (let i = start; i >= 0; i--) {
    console.log("root - [" + i + "] - " + priorityQueue.tree[i]);
    const leftIndex = priorityQueue._leftIndex(i);
    const rightIndex = priorityQueue._rightIndex(i);
    console.log("left - [" + leftIndex + "] - " + priorityQueue.tree[leftIndex]);
    console.log("right - [" + rightIndex + "] - " + priorityQueue.tree[rightIndex]);
}

//priorityQueue.push(100);
//priorityQueue.push(5);
//priorityQueue.push(101);

//console.log(priorityQueue.tree)