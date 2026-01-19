
/**
 * Priority queue for use in A* path search algorithm.
 * 
 * Priority queue is implemented as a heap with a customizable comparison function.
 * 
 * There should be no foundryvtt API calls in this so it can be unit tested.
 */

export class PriorityQueue {
    constructor(comparisonOperator = (left, right) => { return left < right })
    {
        this.comparisonOperator = comparisonOperator;
        this.tree = [];
    }

    push(value) {

    }

    pop() {
        //
        // Heap removal algorithm:
        // 1. Get the front item.
        // 2. Swap the first and last item of the array.
        // 3. Pop the last item of the array.
        // 4. Run the heap algorithm to satisfy the heap properties.
        // 5. Return the front item.
        //
        const front = this.tree[0]
        this.tree[0] = this.tree[this.tree.length - 1];
        this.tree.pop();

        //
        // heapify
        //

        return front;
    }

    front() {
    }

    _leftIndex(root) {
        const leftIndex = root * 2 + 1;
        if (leftIndex >= this.tree.length) {
            return null;
        }

        return this.tree[leftIndex];
    }

    _rightIndex(root) {
        const rightIndex = root * 2 + 2;
        if (rightIndex >= this.tree.length) {
            return null;
        }

        return this.tree[rightIndex];
    }

    _makeHeap(root) {
    }
}
