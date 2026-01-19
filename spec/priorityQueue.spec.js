import { PriorityQueue } from "../scripts/pathing/priorityQueue.mjs";

describe("Priority Queue tests.", function () {
    it("Priority Queue _leftIndex should give the left index of a root element.", function () {
        const tree = [1, 2, 3, 4, 5, 6, 7, 8];
        let priorityQueue = new PriorityQueue();
        priorityQueue.tree = tree;

        expect(priorityQueue._leftIndex(0)).toBe(1);
        expect(priorityQueue._leftIndex(1)).toBe(3);
        expect(priorityQueue._leftIndex(3)).toBe(7);
    });

    it("Priority Queue _rightIndex should give the right index of a root element", function () {
        const tree = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        let priorityQueue = new PriorityQueue();
        priorityQueue.tree = tree;

        expect(priorityQueue._rightIndex(0)).toBe(2);
        expect(priorityQueue._rightIndex(2)).toBe(6);
        expect(priorityQueue._rightIndex(6)).toBe(14);
    });

    it ("Priority Queue _makeHeap should apply the heap property to the given node and all sub-nodes.", function () {
        const tree = [8, 7, 6, 5, 4, 3, 2, 1];
        let priorityQueue = new PriorityQueue();
        priorityQueue.tree = tree;

        priorityQueue._makeHeap(0);

        //
        // Expected Tree:
        //               6
        //          7           2
        //       5   4         3   8
        //     1

        expect(priorityQueue.tree).toEqual([6, 7, 2, 5, 4, 3, 8, 1]);
    });

    it("Priority Queue _reheap modifies the heap so it satisfies the heap properties.", function () {
        
        const tree = [8, 7, 6, 5, 4, 3, 2, 1];
        let priorityQueue = new PriorityQueue();
        priorityQueue.tree = tree;

        console.log("_reheap test");
        priorityQueue._reheap();

        //
        // Expected Tree:
        //               1
        //          4           2
        //       5   8         3   6
        //     7

        expect(priorityQueue.tree).toEqual([1, 4, 2, 5, 8, 3, 6, 7]);
    })

    it("Priority queue push adds new elements to the priority queue while maintaining the heap property", function () {
        let priorityQueue = new PriorityQueue();
        priorityQueue.push(65);

        expect(priorityQueue.tree).toEqual([65]);

        priorityQueue.push(40);
        expect(priorityQueue.tree).toEqual([40, 65]);

        priorityQueue.push(49);
        expect(priorityQueue.tree).toEqual([40, 65, 49]);

        priorityQueue.push(100);
        expect(priorityQueue.tree).toEqual([40, 65, 49, 100]);

        priorityQueue.push(15);
        expect(priorityQueue.tree).toEqual([15, 40, 49, 100, 65])
    })
});
 