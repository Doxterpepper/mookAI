
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
        this.tree.push(value);
        this._reheap();
    }

    pop() {
        const front = this.tree.shift();
        this._reheap();
        return front;
    }

    front() {
        if (this.tree.length > 0) {
            return this.tree[0];
        }

        return null;
    }

    /**
     * Get the left index of root element.
     * @param {number} root Index of the root element.
     * @returns 
     */
    _leftIndex(root) {
        const leftIndex = (root * 2) + 1;
        if (leftIndex >= this.tree.length) {
            return null;
        }

        return leftIndex;
    }

    /**
     * Get the index of the right child item of root index.
     * @param {number} root Get the right index for the given root element index.
     * @returns 
     */
    _rightIndex(root) {
        const rightIndex = (root * 2) + 2;
        if (rightIndex >= this.tree.length) {
            return null;
        }

        return rightIndex;
    }

    /**
     * Swap two elements of the heap.
     * @param {number} index1 Index of heap to swap with index2.
     * @param {number} index2 Index of heap to swap with index1.
     */
    _swap(index1, index2) {
        let temp = this.tree[index1];
        this.tree[index1] = this.tree[index2];
        this.tree[index2] = temp;
    }

    /**
     * Go over the heap and apply the heapify algorithm.
     */
    _reheap() {
        const startElement = Math.floor(this.tree.length / 2);
        for (let i = startElement; i >= 0; i--) {
            this._makeHeap(i);
        }

    }

    /**
     * Make a heap starting at index root.
     * @param {number} root Index of the root element to apply heap algorithm to.
     */
    _makeHeap(root) {
        const leftIndex = this._leftIndex(root);
        const rightIndex = this._rightIndex(root);

        const leftValue = this.tree[leftIndex]
        const rightValue = this.tree[rightIndex];
        let swapIndex = root;

        if (leftIndex < this.tree.length && leftValue && this.comparisonOperator(leftValue, this.tree[swapIndex])) {
            swapIndex = leftIndex;
        }

        if (rightIndex < this.tree.length && rightValue && this.comparisonOperator(rightValue, this.tree[swapIndex])) {
            swapIndex = rightIndex;
        }

        if (swapIndex != root) {
            this._swap(root, swapIndex);
            this._makeHeap(swapIndex);
        }
    }
}
