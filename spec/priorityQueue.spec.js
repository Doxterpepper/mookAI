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
    });

    it("Priority queue has the smallest value at the front", function () {
        let priorityQueue = new PriorityQueue();

        priorityQueue.push(10);

        expect(priorityQueue.front()).toBe(10);

        priorityQueue.push(11);
        expect(priorityQueue.front()).toBe(10);


        priorityQueue.push(25);
        expect(priorityQueue.front()).toBe(10);
    });

    it("Priority queue pop leaves the smallest value at the front", function () {
        
        let priorityQueue = new PriorityQueue();
        priorityQueue.tree = [1, 78, 8, 15, 25, 30];
        priorityQueue._reheap();
        
        let value = priorityQueue.pop();
        expect(value).toBe(1);


        value = priorityQueue.pop();
        expect(value).toBe(8);

        value = priorityQueue.pop();
        expect(value).toBe(15);

        value = priorityQueue.pop();
        expect(value).toBe(25);

        value = priorityQueue.pop();
        expect(value).toBe(30);

        value = priorityQueue.pop();
        expect(value).toBe(78);
    });

    it("Make heap with custom comparison function", function () {
        let createElement = value => {
            return {
                rank: 1,
                value: value
            }
        }

        let comparison = (a, b) => {
            return a.rank < b.rank;
        }

        let queue = new PriorityQueue(comparison);
        
        queue.push(createElement(1));

        let currentArr = queue.tree.map(el => el.value);
        expect(currentArr).toEqual([1]);

        queue.push(createElement(2));

        currentArr = queue.tree.map(el => el.value);
        expect(currentArr).toEqual([1, 2]);

        queue.push(createElement(3));

        currentArr = queue.tree.map(el => el.value);
        expect(currentArr).toEqual([1, 2, 3]);

        queue.push({
            rank: 0,
            value: 10
        })

        expect(queue.front().value).toBe(10);
        currentArr = queue.tree.map(el => el.value);
        expect(currentArr).toEqual([10, 1, 3, 2]);
    });

    it("Priority queue works a a FIFO queue when elements have the same rank", function () {
        let createElement = value => {
            return {
                rank: 1,
                value: value
            }
        }

        let comparison = (a, b) => {
            return a.rank < b.rank;
        }
        
        let queue = new PriorityQueue(comparison)
        for (let i = 0; i < 10; i++) {
            const element = createElement(i);
            queue.push(element);
        }

        const arr = queue.tree.map(el => el.value);
        expect(arr).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let i = 0; i < 10; i++) {
            const element = queue.pop();
            //console.log(queue.tree.map(el => el.value));
            expect(element.value).toBe(i);
        }
    });
});
 