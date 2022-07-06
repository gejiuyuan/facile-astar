import { BBox2, BBox2Factory, EMPTY_ARRAY, extend, PriorityQueue, Vector2 } from "./utils";

class QueuePointNode {

  readonly node: RoutePointNode;

  readonly modCount: number;

  constructor(node: RoutePointNode) {
    this.node = node;
    this.modCount = node.modCount;
  }

  noChanged() {
    return this.modCount === this.node.modCount;
  }

  static comparator(n1: QueuePointNode, n2: QueuePointNode) {
    return n1.node.F - n2.node.F;
  }

}

export class RoutePointNode extends Vector2 {
  key!: string;

  parent: RoutePointNode | null = null;

  get F() {
    return this.G + this.H;
  };

  G: number = 0;

  H: number = 0;

  modCount: number = 0;

  constructor(x: number, y: number) {
    super(x, y);
    this.key = `${x}|${y}`;
  }

  updateG(newG?: number) {
    this.G = newG || RoutePointNode.calcG(this, this.parent!);
  }

  updateH(end: RoutePointNode) {
    this.H = RoutePointNode.calcH(this, end);
  }

  static calcG(node: RoutePointNode, mayBeParent: RoutePointNode) {
    return (node.x === mayBeParent.x || node.y === mayBeParent.y ? 10 : 14) + mayBeParent.G;
  }

  static calcH(start: RoutePointNode, end: RoutePointNode) {
    return (Math.abs(start.x - end.x) + Math.abs(start.y - end.y)) * 10;
  }

  getAround(space: number, routeType: RouteType) {
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
    ]

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

export enum RouteType {
  all = 'all',
  diagonal = 'diagonal',
  orthometric = 'orthometric'
}

export type SearchOption = {
  start: RoutePointNode;
  end: RoutePointNode;
  step?: number;
  routeType?: RouteType;
  blockArea?: BBox2[];
  boundaryArea?: BBox2;
}

const defaultSearchOption: Partial<SearchOption> = {
  step: 10,
  routeType: RouteType.all,
}

export class AStar implements SearchOption {

  private readonly queue = new PriorityQueue<QueuePointNode>(QueuePointNode.comparator);

  private readonly openList = new Map<string, RoutePointNode>();

  private readonly closeList = new Map<string, RoutePointNode>();

  canSearch = true;

  start!: SearchOption['start'];

  end!: SearchOption['end'];

  step!: Required<SearchOption>['step'];

  routeType!: Required<SearchOption>['routeType'];

  blockArea?: SearchOption['blockArea'];

  boundaryArea?: SearchOption['boundaryArea'];

  constructor(option: SearchOption) {

    option.step ??= defaultSearchOption.step!;
    option.routeType ??= defaultSearchOption.routeType;

    this.start = option.start;
    this.end = option.end;
    this.step = option.step;
    this.routeType = option.routeType!;
    this.blockArea = option.blockArea;
    this.boundaryArea = option.boundaryArea;

    const isEsxitInBlockArea = (() => {
      if (!this.blockArea) {
        return
      }
      const points = [this.start, this.end]
      return this.blockArea.some(bbox => points.some(point => bbox.isContain(point)))
    })();

    if (isEsxitInBlockArea) {
      this.canSearch = false;
      return;
    }

  }

  private _runOne(pointNode: RoutePointNode) {
    const { end, step, routeType, openList } = this
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
        this.notFoundPointNode(pointNode, pointDriving)
      } else {
        this.foundPointNode(pointNode, pointDriving);
      }
    }
    openList.delete(pointNode.key);
    this.closeList.set(pointNode.key, pointNode);
  }


  search() {
    if (!this.canSearch) {
      return EMPTY_ARRAY
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

  private notFoundPointNode(currentNode: RoutePointNode, nextNode: RoutePointNode) {
    nextNode.parent = currentNode;
    nextNode.updateG();
    nextNode.updateH(this.end);
    nextNode.modCount++;
    this.openList.set(nextNode.key, nextNode);
    this.queue.add(new QueuePointNode(nextNode));
  }

  private foundPointNode(currentNode: RoutePointNode, nextNode: RoutePointNode) {
    const oldG = nextNode.G;
    const newG = RoutePointNode.calcG(nextNode, currentNode);
    if (newG < oldG) {
      nextNode.parent = currentNode;
      nextNode.updateG(newG);
      nextNode.modCount++;
      this.queue.add(new QueuePointNode(nextNode));
    }
  }

  getResult(point: RoutePointNode) {
    const trackPoints: RoutePointNode[] = [point];
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
      } else if (node.noChanged()) {
        return node.node;
      }
    }
  }

  canReach(point: RoutePointNode) {
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