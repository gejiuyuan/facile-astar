'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _a;
const keyBuffer = new ArrayBuffer(16);
const keyBufferAsFloat64 = new Float64Array(keyBuffer);
const keyBufferAsInt32 = new Int32Array(keyBuffer);
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        keyBufferAsFloat64[0] = x;
        keyBufferAsFloat64[1] = y;
        this._hashed = keyBufferAsInt32[0] ^ keyBufferAsInt32[1] ^ keyBufferAsInt32[2] ^ keyBufferAsInt32[3];
    }
    get hashCode() {
        return this._hashed;
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    get length() {
        return Math.sqrt(this.dot(this));
    }
    sin() {
        return this.y / this.length;
    }
    cos() {
        return this.x / this.length;
    }
    sub(vec) {
        return new Vector2(this.x - vec.x, this.y - vec.y);
    }
    add(vec) {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }
    scale(sx, sy) {
        return new Vector2(this.x * sx, this.y * sy);
    }
    angle(refPoint) {
        return Math.atan2(this.y - refPoint.y, this.x - refPoint.x);
    }
    angleD(refPoint) {
        return Angle.toDegree(this.angle(refPoint));
    }
    distance1(point) {
        return Vector.hypot(point.x - this.x, point.y - this.y);
    }
    distance2(point) {
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        return dx * dx + dy * dy;
    }
    rotate(refPoint, radian) {
        const cos = Math.cos(radian);
        const sin = Math.sin(radian);
        const dx = this.x - refPoint.x;
        const dy = this.y - refPoint.y;
        const x = dx * cos + dy * -sin;
        const y = dx * sin + dy * cos;
        return refPoint.add(new Vector2(x, y));
    }
    rotateD(refPoint, degree) {
        return this.rotate(refPoint, Angle.toRadian(degree));
    }
    equal(point) {
        return point.x === this.x && point.y === this.y;
    }
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
    bbox() {
        return new BBox2(this.x, this.x, this.y, this.y);
    }
    toString() {
        return `Vector2 [X="${this.x}", Y="${this.y}"]`;
    }
}
_a = Vector2;
Vector2.ORIGIN = new _a(0, 0);
class Vector {
    static hypot(x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
        if (y > x) {
            y ^= x;
            x ^= y;
            y ^= x;
        }
        if (x === 0) {
            return y;
        }
        const t = y / x;
        return x * Math.sqrt(1 + t * t);
    }
}
class Angle {
    static toDegree(radian) {
        return (radian * 180) / Math.PI;
    }
    static toRadian(degree) {
        return (degree / 180) * Math.PI;
    }
}
class BBox2 {
    constructor(minX, maxX, minY, maxY) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }
    isContain(point) {
        return this.isContainX(point.x) && this.isContainY(point.y);
    }
    isContainX(x) {
        return x >= this.minX && x <= this.maxX;
    }
    isContainY(y) {
        return y >= this.minY && y <= this.maxY;
    }
}
class BBox2Factory {
    constructor() {
        this.init();
    }
    extend1(bbox) {
        this.minX = Math.min(this.minX, bbox.minX);
        this.maxY = Math.max(this.maxX, bbox.maxX);
        this.minY = Math.min(this.minY, bbox.minY);
        this.maxY = Math.max(this.maxX, bbox.maxY);
        return this;
    }
    extend2(point) {
        this.minX = Math.min(this.minX, point.x);
        this.maxX = Math.max(this.maxX, point.x);
        this.minY = Math.min(this.minY, point.y);
        this.maxY = Math.max(this.maxY, point.y);
        return this;
    }
    extend3(points) {
        for (let i = 0; i < points.length; i++) {
            this.extend2(points[i]);
        }
        return this;
    }
    extend4(minX, maxX, minY, maxY) {
        this.minX = Math.min(this.minX, minX);
        this.maxX = Math.max(this.maxX, maxX);
        this.minY = Math.min(this.minY, minY);
        this.maxY = Math.max(this.maxY, maxY);
        return this;
    }
    extend5(space) {
        if (space < 0) {
            const scale2 = space * 2;
            if (scale2 < this.minX - this.maxX || scale2 < this.minY - this.maxY) {
                return this;
            }
        }
        this.minX -= space;
        this.maxX += space;
        this.minY -= space;
        this.maxY += space;
        return this;
    }
    init() {
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.minY = Number.POSITIVE_INFINITY;
        this.maxY = Number.NEGATIVE_INFINITY;
    }
    valid() {
        return [
            this.minX,
            this.maxX,
            this.minY,
            this.maxY
        ].every(Number.isFinite);
    }
    build() {
        return new BBox2(this.minX, this.maxX, this.minY, this.maxY);
    }
}
class DoublyLinkedListNode {
    constructor(value) {
        this.value = value;
        this.previous = null;
        this.next = null;
    }
}
class DoublyLinkedList {
    constructor() {
        this.map = new Map();
        this.head = null;
        this.tail = null;
    }
    get size() {
        return this.map.size;
    }
    insertBefore(node, value) {
        // 如果要插入的节点本身就存在此列表中，则需要先删除，再插入
        if (this.map.has(value)) {
            this.delete(value);
        }
        const newNode = new DoublyLinkedListNode(value);
        this.map.set(value, newNode);
        if (node === null) {
            if (this.head === node) {
                this.head = newNode;
            }
            if (this.tail === node) {
                this.tail = newNode;
            }
        }
        else {
            if (this.head === node) {
                this.head = newNode;
            }
            if (newNode.previous = node.previous) {
                newNode.previous.next = newNode;
            }
            newNode.next = node;
            node.previous = newNode;
        }
        return newNode;
    }
    insertAfter(node, value) {
        if (this.map.has(value)) {
            this.delete(value);
        }
        const newNode = new DoublyLinkedListNode(value);
        this.map.set(value, newNode);
        if (node === null) {
            if (this.head === node) {
                this.head = newNode;
            }
            if (this.tail === node) {
                this.tail = newNode;
            }
        }
        else {
            if (this.tail === node) {
                this.tail = newNode;
            }
            if (newNode.next = node.next) {
                newNode.next.previous = newNode;
            }
            newNode.previous = node;
            node.next = newNode;
        }
        return newNode;
    }
    shift(value) {
        return this.insertBefore(this.head, value);
    }
    push(value) {
        return this.insertAfter(this.tail, value);
    }
    delete(node) {
        if (!(node instanceof DoublyLinkedListNode)) {
            const realNode = this.map.get(node);
            if (!realNode) {
                return;
            }
            node = realNode;
        }
        this.map.delete(node.value);
        if (node.next === null && node.previous === null) {
            this.head = null;
            this.tail = null;
            return;
        }
        if (node.next) {
            if (!(node.next.previous = node.previous)) {
                this.head = node.next;
            }
        }
        if (node.previous) {
            if (!(node.previous.next = node.next)) {
                this.tail = node.previous;
            }
        }
    }
    toArray() {
        const nodes = [];
        let currentNode = this.head;
        while (currentNode) {
            nodes.push(currentNode);
            currentNode = currentNode.next;
        }
        return nodes;
    }
    fromArray(array) {
        for (let i = 0; i < array.length; i++) {
            this.push(array[i]);
        }
        return this;
    }
    reverse() {
        let currentNode = this.head;
        let previousNode = null;
        let nextNode = null;
        while (currentNode) {
            nextNode = currentNode.next;
            previousNode = currentNode.previous;
            currentNode.next = previousNode;
            currentNode.previous = nextNode;
            previousNode = currentNode;
            currentNode = nextNode;
        }
        this.tail = this.head;
        this.head = previousNode;
        return this;
    }
}
class AbstractPriorityQueue extends DoublyLinkedList {
    constructor(comparator) {
        super();
        this.comparator = comparator;
    }
    insert(value) {
        const { _insert } = this;
        _insert && _insert(value);
        let currentNode = this.head;
        if (!currentNode) {
            return this.insertBefore(currentNode, value);
        }
        do {
            if (this.comparator(value, currentNode.value)) {
                return this.insertBefore(currentNode, value);
            }
            currentNode = currentNode.next;
        } while (currentNode);
        return this.insertAfter(this.tail, value);
    }
    poll() {
        let minPriorityNode = this.head;
        if (minPriorityNode) {
            const { _poll } = this;
            const res = [];
            let currentNode = minPriorityNode;
            do {
                res.push(currentNode);
                this.delete(currentNode);
                _poll && _poll(currentNode.value);
            } while (currentNode.next && (currentNode = currentNode.next) && this.comparator(currentNode.value, minPriorityNode.value));
            return res;
        }
        return null;
    }
}
class Comparator {
    constructor(compareFunc) {
        this.compareFunc = compareFunc;
        this.equal = (...args) => {
            return this.compareFunc(...args) === 0;
        };
        this.lessThan = (...args) => {
            return this.compareFunc(...args) < 0;
        };
        this.greaterThan = (...args) => {
            return this.compareFunc(...args) > 0;
        };
        this.lessOrEqualThan = (...args) => {
            return this.equal(...args) || this.lessThan(...args);
        };
    }
}
function isUndef(value) {
    return value === void 0 || value === null;
}
function extend(obj1, obj2) {
    for (const key in obj1) {
        if (isUndef(obj1[key])) {
            obj1[key] = obj2[key];
        }
    }
    return obj1;
}
const EMPTY_ARRAY = Object.freeze(new Array());

const comparator = new Comparator((n1, n2) => n1.F - n2.F).lessOrEqualThan;
class RoutePointNode extends Vector2 {
    constructor(x, y) {
        super(x, y);
        this.parent = null;
        this.G = 0;
        this.H = 0;
        this.key = `${x}|${y}`;
    }
    get F() {
        return this.G + this.H;
    }
    ;
    updateG(newG) {
        this.G = newG || RoutePointNode.calcG(this, this.parent);
    }
    updateH(end) {
        this.H = RoutePointNode.calcH(this, end);
    }
    static calcG(node, mayBeParent) {
        return (node.x === mayBeParent.x || node.y === mayBeParent.y ? 10 : 14) + mayBeParent.G;
    }
    static calcH(start, end) {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }
}
exports.RouteType = void 0;
(function (RouteType) {
    RouteType["all"] = "all";
    RouteType["diagonal"] = "diagonal";
    RouteType["orthometric"] = "orthometric";
})(exports.RouteType || (exports.RouteType = {}));
const defaultSearchOption = {
    step: 10,
    routeType: exports.RouteType.all,
};
class OpenListPriorityQueue extends AbstractPriorityQueue {
    constructor() {
        super(comparator);
        this.pointKeyMap = new Map();
        this._insert = (pointNode) => {
            this.pointKeyMap.set(pointNode.key, pointNode);
        };
        this._poll = (pointNode) => {
            this.pointKeyMap.delete(pointNode.key);
        };
    }
    has(pointKey) {
        return this.pointKeyMap.has(pointKey);
    }
    get(pointKey) {
        return this.pointKeyMap.get(pointKey);
    }
}
class AStar {
    constructor(option) {
        this.openListQueue = new OpenListPriorityQueue();
        this.closeList = new Map();
        this.canSearch = true;
        option.step ?? (option.step = defaultSearchOption.step);
        option.routeType ?? (option.routeType = defaultSearchOption.routeType);
        this.start = option.start;
        this.end = option.end;
        this.step = option.step;
        this.routeType = option.routeType;
        this.blockArea = option.blockArea;
        this.boundaryArea = option.boundaryArea;
        const isEsxitInBlockArea = (() => {
            if (!this.blockArea) {
                return;
            }
            const points = [this.start, this.end];
            return this.blockArea.some(bbox => points.some(point => bbox.isContain(point)));
        })();
        if (isEsxitInBlockArea) {
            this.canSearch = false;
            return;
        }
    }
    _runOne(pointNode) {
        const { end, step } = this;
        let endNode;
        this.traverseAroundPoints(pointNode, (aroundPoint, isFound) => {
            const distance = aroundPoint.distance2(end);
            if (distance < step ** 2) {
                aroundPoint.parent = pointNode;
                if (distance === 0) {
                    endNode = aroundPoint;
                }
                else {
                    end.parent = aroundPoint;
                    endNode = end;
                }
                return true;
            }
            if (isFound) {
                this.foundPointNode(pointNode, aroundPoint);
            }
            else {
                this.notFoundPointNode(pointNode, aroundPoint);
            }
        });
        if (endNode) {
            return endNode;
        }
        this.openListQueue.delete(pointNode);
        this.closeList.set(pointNode.key, pointNode);
    }
    traverseAroundPoints(ps, cb) {
        const bbox = new BBox2Factory().extend2(ps).extend5(this.step).build();
        let arr;
        const diagonal = () => [
            [bbox.minX, bbox.minY],
            [bbox.minX, bbox.maxY],
            [bbox.maxX, bbox.maxY],
            [bbox.maxX, bbox.minY],
        ];
        const orthometric = () => [
            [bbox.minX, ps.y],
            [ps.x, bbox.minY],
            [bbox.maxX, ps.y],
            [ps.x, bbox.maxY],
        ];
        switch (this.routeType) {
            case exports.RouteType.orthometric:
                arr = orthometric();
                break;
            case exports.RouteType.diagonal:
                arr = diagonal();
                break;
            case exports.RouteType.all:
            default:
                arr = [...orthometric(), ...diagonal()];
        }
        arr.some(numArr => {
            const aroundNode = this.openListQueue.get(numArr.join('|'));
            const readlNode = aroundNode || new RoutePointNode(...numArr);
            if (!this.canReach(readlNode)) {
                return;
            }
            return cb(readlNode, !!aroundNode);
        });
    }
    search() {
        if (!this.canSearch) {
            return EMPTY_ARRAY;
        }
        const { openListQueue: queue } = this;
        this.start.updateH(this.end);
        queue.insert(this.start);
        const resArr = [];
        do {
            const minFQueueNodes = queue.poll();
            if (minFQueueNodes) {
                // render(minFQueueNodes.map(i => i.value))
                for (const queueNode of minFQueueNodes) {
                    const endRoutePointNode = this._runOne(queueNode.value);
                    if (endRoutePointNode) {
                        resArr.push(this.getResult(endRoutePointNode));
                        return resArr;
                    }
                }
            }
        } while (queue.size);
    }
    notFoundPointNode(currentNode, nextNode) {
        nextNode.parent = currentNode;
        nextNode.updateG();
        nextNode.updateH(this.end);
        this.openListQueue.insert(nextNode);
    }
    foundPointNode(currentNode, nextNode) {
        const oldG = nextNode.G;
        const newG = RoutePointNode.calcG(nextNode, currentNode);
        if (newG < oldG) {
            nextNode.parent = currentNode;
            nextNode.updateG(newG);
            this.openListQueue.insert(nextNode);
        }
    }
    getResult(point) {
        const trackPoints = [point];
        while (point.parent) {
            trackPoints.push(point = point.parent);
        }
        return trackPoints.reverse();
    }
    canReach(point) {
        if (this.closeList.has(point.key)) {
            return false;
        }
        if (this.blockArea && this.blockArea.some(bbox => bbox.isContain(point))) {
            return false;
        }
        if (this.boundaryArea && !this.boundaryArea.isContain(point)) {
            return false;
        }
        return true;
    }
}

exports.AStar = AStar;
exports.AbstractPriorityQueue = AbstractPriorityQueue;
exports.Angle = Angle;
exports.BBox2 = BBox2;
exports.BBox2Factory = BBox2Factory;
exports.Comparator = Comparator;
exports.DoublyLinkedList = DoublyLinkedList;
exports.DoublyLinkedListNode = DoublyLinkedListNode;
exports.EMPTY_ARRAY = EMPTY_ARRAY;
exports.RoutePointNode = RoutePointNode;
exports.Vector2 = Vector2;
exports.extend = extend;
exports.isUndef = isUndef;
