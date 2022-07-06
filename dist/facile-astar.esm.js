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
class PriorityQueue {
    constructor(comparator) {
        this.comparator = comparator;
        this.binaryHeap = new Array();
        this.count = 0;
    }
    size() {
        return this.count;
    }
    add(item) {
        if (this.count > 0) {
            this.siftUp(this.count, item);
        }
        else {
            this.binaryHeap[0] = item;
        }
        this.count++;
    }
    remove(item) {
        let index = this.binaryHeap.indexOf(item);
        if (index > -1) {
            this.binaryHeap.splice(index, 1);
            this.count--;
        }
        if (this.count < 0) {
            this.count = 0;
        }
    }
    poll() {
        while (true) {
            if (this.count > 0) {
                this.count--;
                const result = this.binaryHeap[0];
                if (this.count > 0) {
                    this.siftDown(0, this.binaryHeap[this.count]);
                }
                return result;
            }
            else {
                return null;
            }
        }
    }
    siftUp(index, item) {
        while (index > 0) {
            const parentIndex = (index - 1) >>> 1;
            const parent = this.binaryHeap[parentIndex];
            if (this.comparator(item, parent) > 0) {
                break;
            }
            this.binaryHeap[index] = parent;
            index = parentIndex;
        }
        this.binaryHeap[index] = item;
    }
    siftDown(index, item) {
        const half = this.count >>> 1;
        while (index < half) {
            let leftChildIndex = (index << 1) + 1;
            let leftChildNode = this.binaryHeap[leftChildIndex];
            const rightChildIndex = leftChildIndex + 1;
            if (rightChildIndex < this.count) {
                const rightChildNode = this.binaryHeap[rightChildIndex];
                if (this.comparator(leftChildNode, rightChildNode) > 0) {
                    leftChildIndex = rightChildIndex;
                    leftChildNode = rightChildNode;
                }
            }
            if (this.comparator(item, leftChildNode) <= 0) {
                break;
            }
            this.binaryHeap[index] = leftChildNode;
            index = leftChildIndex;
        }
        this.binaryHeap[index] = item;
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

class QueuePointNode {
    constructor(node) {
        this.node = node;
        this.modCount = node.modCount;
    }
    noChanged() {
        return this.modCount === this.node.modCount;
    }
    static comparator(n1, n2) {
        return n1.node.F - n2.node.F;
    }
}
class RoutePointNode extends Vector2 {
    constructor(x, y) {
        super(x, y);
        this.parent = null;
        this.G = 0;
        this.H = 0;
        this.modCount = 0;
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
        return (Math.abs(start.x - end.x) + Math.abs(start.y - end.y)) * 10;
    }
    getAround(space, routeType) {
        const bbox = new BBox2Factory().extend2(this).extend5(space).build();
        const diagonal = () => [
            new RoutePointNode(bbox.minX, bbox.minY),
            new RoutePointNode(bbox.minX, bbox.maxY),
            new RoutePointNode(bbox.maxX, bbox.maxY),
            new RoutePointNode(bbox.maxX, bbox.minY),
        ];
        const orthometric = () => [
            new RoutePointNode(bbox.minX, this.y),
            new RoutePointNode(this.x, bbox.minY),
            new RoutePointNode(bbox.maxX, this.y),
            new RoutePointNode(this.x, bbox.maxY),
        ];
        switch (routeType) {
            case RouteType.orthometric:
                return orthometric();
            case RouteType.diagonal:
                return diagonal();
            case RouteType.all:
            default:
                return [...orthometric(), ...diagonal()];
        }
    }
}
var RouteType;
(function (RouteType) {
    RouteType["all"] = "all";
    RouteType["diagonal"] = "diagonal";
    RouteType["orthometric"] = "orthometric";
})(RouteType || (RouteType = {}));
const defaultSearchOption = {
    step: 10,
    routeType: RouteType.all,
};
class AStar {
    constructor(option) {
        this.queue = new PriorityQueue(QueuePointNode.comparator);
        this.openList = new Map();
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
        const { end, step, routeType, openList } = this;
        const aroundPoints = pointNode.getAround(step, routeType).filter(node => this.canReach(node));
        for (let i = 0; i < aroundPoints.length; i++) {
            const pointDriving = aroundPoints[i];
            const distance = pointDriving.distance2(end);
            if (distance < step ** 2) {
                pointDriving.parent = pointNode;
                if (distance === 0) {
                    return pointDriving;
                }
                end.parent = pointDriving;
                return end;
            }
            if (!openList.has(pointDriving.key)) {
                this.notFoundPointNode(pointNode, pointDriving);
            }
            else {
                this.foundPointNode(pointNode, pointDriving);
            }
        }
        openList.delete(pointNode.key);
        this.closeList.set(pointNode.key, pointNode);
    }
    search() {
        if (!this.canSearch) {
            return EMPTY_ARRAY;
        }
        const { openList, queue } = this;
        openList.set(this.start.key, this.start);
        queue.add(new QueuePointNode(this.start));
        do {
            const minFNode = this.getMinFNodeInOpenList();
            if (minFNode) {
                const endRoutePointNode = this._runOne(minFNode);
                if (endRoutePointNode) {
                    return this.getResult(endRoutePointNode);
                }
            }
        } while (openList.size);
    }
    notFoundPointNode(currentNode, nextNode) {
        nextNode.parent = currentNode;
        nextNode.updateG();
        nextNode.updateH(this.end);
        nextNode.modCount++;
        this.openList.set(nextNode.key, nextNode);
        this.queue.add(new QueuePointNode(nextNode));
    }
    foundPointNode(currentNode, nextNode) {
        const oldG = nextNode.G;
        const newG = RoutePointNode.calcG(nextNode, currentNode);
        if (newG < oldG) {
            nextNode.parent = currentNode;
            nextNode.updateG(newG);
            nextNode.modCount++;
            this.queue.add(new QueuePointNode(nextNode));
        }
    }
    getResult(point) {
        const trackPoints = [point];
        while (point.parent) {
            trackPoints.push(point = point.parent);
        }
        return trackPoints.reverse();
    }
    getMinFNodeInOpenList() {
        while (true) {
            const node = this.queue.poll();
            if (node === null) {
                return null;
            }
            else if (node.noChanged()) {
                return node.node;
            }
        }
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

export { AStar, Angle, BBox2, BBox2Factory, EMPTY_ARRAY, PriorityQueue, RoutePointNode, RouteType, Vector2, extend, isUndef };
