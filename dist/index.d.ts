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
    getAround(space: number, routeType: RouteType): RoutePointNode[];
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
    private openList;
    private closeList;
    canSearch: boolean;
    start: SearchOption['start'];
    end: SearchOption['end'];
    step: Required<SearchOption>['step'];
    routeType: Required<SearchOption>['routeType'];
    blockArea?: SearchOption['blockArea'];
    boundaryArea?: SearchOption['boundaryArea'];
    constructor(option: SearchOption);
    private _runOne;
    search(): any[] | undefined;
    getResult(point: RoutePointNode): RoutePointNode[];
    getMinFNodeInOpenList(): RoutePointNode;
    canReach(point: RoutePointNode): boolean;
}

export { AStar, Angle, BBox2, BBox2Factory, EMPTY_ARRAY, RoutePointNode, RouteType, SearchOption, Vector2, extend, isUndef };
