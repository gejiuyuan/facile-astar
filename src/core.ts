import { AbstractPriorityQueue, BBox2, BBox2Factory, Comparator, EMPTY_ARRAY, Vector2 } from "./utils";

const comparator = new Comparator((n1: RoutePointNode, n2: RoutePointNode) => n1.F - n2.F).lessOrEqualThan

export class RoutePointNode extends Vector2 {
  key!: string;

  parent: RoutePointNode | null = null;

  get F() {
    return this.G + this.H;
  };

  G: number = 0;

  H: number = 0;

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
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y)
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

class OpenListPriorityQueue extends AbstractPriorityQueue<RoutePointNode> {

  pointKeyMap = new Map<string, RoutePointNode>()

  constructor() {
    super(comparator)
  }

  _insert = (pointNode: RoutePointNode) => {
    this.pointKeyMap.set(pointNode.key, pointNode);
  }

  _poll = (pointNode: RoutePointNode) => {
    this.pointKeyMap.delete(pointNode.key);
  }

  has(pointKey: string) {
    return this.pointKeyMap.has(pointKey);
  }

  get(pointKey: string) {
    return this.pointKeyMap.get(pointKey)
  }
}

export class AStar implements SearchOption {

  private readonly openListQueue = new OpenListPriorityQueue();

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
    const { end, step } = this
    let endNode: RoutePointNode | undefined;
    this.traverseAroundPoints(pointNode, (aroundPoint, isFound) => {
      const distance = aroundPoint.distance2(end);
      if (distance < step ** 2) {
        aroundPoint.parent = pointNode;
        if (distance === 0) {
          endNode = aroundPoint;
        } else {
          end.parent = aroundPoint;
          endNode = end;
        }
        return true;
      }
      if (isFound) {
        this.foundPointNode(pointNode, aroundPoint)
      } else {
        this.notFoundPointNode(pointNode, aroundPoint);
      }
    })
    if (endNode) {
      return endNode;
    }
    this.openListQueue.delete(pointNode);
    this.closeList.set(pointNode.key, pointNode);

  }

  traverseAroundPoints(ps: RoutePointNode, cb: (aroundPoint: RoutePointNode, isFound: boolean) => boolean | undefined) {
    const bbox = new BBox2Factory().extend2(ps).extend5(this.step).build();

    let arr!: [number, number][];

    const diagonal = () => [
      [bbox.minX, bbox.minY],
      [bbox.minX, bbox.maxY],
      [bbox.maxX, bbox.maxY],
      [bbox.maxX, bbox.minY],
    ] as typeof arr;
    const orthometric = () => [
      [bbox.minX, ps.y],
      [ps.x, bbox.minY],
      [bbox.maxX, ps.y],
      [ps.x, bbox.maxY],
    ] as typeof arr;

    switch (this.routeType) {
      case RouteType.orthometric:
        arr = orthometric();
        break;
      case RouteType.diagonal:
        arr = diagonal();
        break;
      case RouteType.all:
      default:
        arr = [...orthometric(), ...diagonal()];
    }
    arr.some(numArr => {
      const aroundNode = this.openListQueue.get(numArr.join('|'));
      const readlNode = aroundNode || new RoutePointNode(...numArr)
      if (!this.canReach(readlNode)) {
        return
      }
      return cb(readlNode, !!aroundNode);
    })
  }

  search() {
    if (!this.canSearch) {
      return EMPTY_ARRAY
    }
    const { openListQueue: queue } = this;
    this.start.updateH(this.end);
    queue.insert(this.start);
    const resArr = []
    do {
      const minFQueueNodes = queue.poll();
      if (minFQueueNodes) {
        // render(minFQueueNodes.map(i => i.value))
        for (const queueNode of minFQueueNodes) {
          const endRoutePointNode = this._runOne(queueNode.value);
          if (endRoutePointNode) {
            resArr.push(this.getResult(endRoutePointNode))
            return resArr;
          }
        }
      }
    } while (queue.size);
  }

  private notFoundPointNode(currentNode: RoutePointNode, nextNode: RoutePointNode) {
    nextNode.parent = currentNode;
    nextNode.updateG();
    nextNode.updateH(this.end);
    this.openListQueue.insert(nextNode);
  }

  private foundPointNode(currentNode: RoutePointNode, nextNode: RoutePointNode) {
    const oldG = nextNode.G;
    const newG = RoutePointNode.calcG(nextNode, currentNode);
    if (newG < oldG) {
      nextNode.parent = currentNode;
      nextNode.updateG(newG);
      this.openListQueue.insert(nextNode);
    }
  }

  getResult(point: RoutePointNode) {
    const trackPoints: RoutePointNode[] = [point];
    while (point.parent) {
      trackPoints.push(point = point.parent);
    }
    return trackPoints.reverse();
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

let nodes: SVGElement[] = []
function render(newPoints: any[]) {
  const fragment = new DocumentFragment();
  nodes.forEach(elm => elm.remove());
  nodes.length = 0;
  newPoints.forEach(ps => {
    const elm: SVGCircleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    elm.setAttribute('r', '8');
    elm.setAttribute('cx', ps.x)
    elm.setAttribute('cy', ps.y)
    elm.style.fill = 'red';
    fragment.appendChild(elm)
  })
  nodes.push(...Array.from(fragment.children) as any)
  document.querySelector('svg')?.append(fragment)
}