declare class Vector2 {
    x: number;
    y: number;
    static readonly ORIGIN: Vector2;
    private readonly _hashed;
    get hashCode(): number;
    constructor(x: number, y: number);
    dot(vec: Vector2): number;
    get length(): number;
    sin(): number;
    cos(): number;
    sub(vec: Vector2): Vector2;
    add(vec: Vector2): Vector2;
    scale(sx: number, sy: number): Vector2;
    angle(refPoint: Vector2): number;
    angleD(refPoint: Vector2): number;
    distance1(point: Vector2): number;
    distance2(point: Vector2): number;
    rotate(refPoint: Vector2, radian: number): Vector2;
    rotateD(refPoint: Vector2, degree: number): Vector2;
    equal(point: Vector2): boolean;
    [Symbol.iterator](): Generator<number, void, unknown>;
    bbox(): BBox2;
    toString(): string;
}
declare class Angle {
    static toDegree(radian: number): number;
    static toRadian(degree: number): number;
}
declare class BBox2 {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    constructor(minX: number, maxX: number, minY: number, maxY: number);
    isContain(point: Vector2): boolean;
    isContainX(x: number): boolean;
    isContainY(y: number): boolean;
}
declare class BBox2Factory {
    private minX;
    private maxX;
    private minY;
    private maxY;
    constructor();
    extend1(bbox: BBox2): BBox2Factory;
    extend2(point: Vector2): this;
    extend3(points: Array<Vector2>): this;
    extend4(minX: number, maxX: number, minY: number, maxY: number): this;
    extend5(space: number): this;
    init(): void;
    valid(): boolean;
    build(): BBox2;
}
declare class DoublyLinkedListNode<T> {
    value: T;
    previous: DoublyLinkedListNode<T> | null;
    next: DoublyLinkedListNode<T> | null;
    constructor(value: T);
}
declare class DoublyLinkedList<T> {
    protected readonly map: Map<T, DoublyLinkedListNode<T>>;
    head: DoublyLinkedListNode<T> | null;
    tail: DoublyLinkedListNode<T> | null;
    get size(): number;
    constructor();
    insertBefore(node: DoublyLinkedListNode<T> | null, value: T): DoublyLinkedListNode<T>;
    insertAfter(node: DoublyLinkedListNode<T> | null, value: T): DoublyLinkedListNode<T>;
    shift(value: T): DoublyLinkedListNode<T>;
    push(value: T): DoublyLinkedListNode<T>;
    delete(node: DoublyLinkedListNode<T> | T): void;
    toArray(): DoublyLinkedListNode<T>[];
    fromArray(array: T[]): this;
    reverse(): this;
}
declare type Compute<T> = T extends Function ? T : {
    [k in keyof T]: T[k];
};
declare type Item<T> = T extends {
    [k in keyof T]: infer V;
} ? V : never;
declare abstract class AbstractPriorityQueue<T> extends DoublyLinkedList<T> {
    private readonly comparator;
    constructor(comparator: Item<Compute<Comparator<T>>>);
    insert(value: T): DoublyLinkedListNode<T>;
    poll(): DoublyLinkedListNode<T>[] | null;
    abstract _insert?: (value: T) => void;
    abstract _poll?: (value: T) => void;
}
declare class Comparator<T> {
    private readonly compareFunc;
    constructor(compareFunc: (o1: T, o2: T) => number);
    equal: (o1: T, o2: T) => boolean;
    lessThan: (o1: T, o2: T) => boolean;
    greaterThan: (o1: T, o2: T) => boolean;
    lessOrEqualThan: (o1: T, o2: T) => boolean;
}
declare function isUndef(value: unknown): value is undefined | null;
declare function extend<T>(obj1: T, obj2: T): Required<T>;
declare const EMPTY_ARRAY: any[];

declare class RoutePointNode extends Vector2 {
    key: string;
    parent: RoutePointNode | null;
    get F(): number;
    G: number;
    H: number;
    constructor(x: number, y: number);
    updateG(newG?: number): void;
    updateH(end: RoutePointNode): void;
    static calcG(node: RoutePointNode, mayBeParent: RoutePointNode): number;
    static calcH(start: RoutePointNode, end: RoutePointNode): number;
}
declare enum RouteType {
    all = "all",
    diagonal = "diagonal",
    orthometric = "orthometric"
}
declare type SearchOption = {
    start: RoutePointNode;
    end: RoutePointNode;
    step?: number;
    routeType?: RouteType;
    blockArea?: BBox2[];
    boundaryArea?: BBox2;
};
declare class AStar implements SearchOption {
    private readonly openListQueue;
    private readonly closeList;
    canSearch: boolean;
    start: SearchOption['start'];
    end: SearchOption['end'];
    step: Required<SearchOption>['step'];
    routeType: Required<SearchOption>['routeType'];
    blockArea?: SearchOption['blockArea'];
    boundaryArea?: SearchOption['boundaryArea'];
    constructor(option: SearchOption);
    private _runOne;
    traverseAroundPoints(ps: RoutePointNode, cb: (aroundPoint: RoutePointNode, isFound: boolean) => boolean | undefined): void;
    search(): any[] | undefined;
    private notFoundPointNode;
    private foundPointNode;
    getResult(point: RoutePointNode): RoutePointNode[];
    canReach(point: RoutePointNode): boolean;
}

export { AStar, AbstractPriorityQueue, Angle, BBox2, BBox2Factory, Comparator, Compute, DoublyLinkedList, DoublyLinkedListNode, EMPTY_ARRAY, Item, RoutePointNode, RouteType, SearchOption, Vector2, extend, isUndef };
