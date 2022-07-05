const keyBuffer = new ArrayBuffer(16);
const keyBufferAsFloat64 = new Float64Array(keyBuffer);
const keyBufferAsInt32 = new Int32Array(keyBuffer);

export class Vector2 {

  static readonly ORIGIN = new this(0, 0);

  private readonly _hashed: number;

  get hashCode() {
    return this._hashed;
  }

  constructor(public x: number, public y: number) {
    keyBufferAsFloat64[0] = x;
    keyBufferAsFloat64[1] = y;
    this._hashed = keyBufferAsInt32[0] ^ keyBufferAsInt32[1] ^ keyBufferAsInt32[2] ^ keyBufferAsInt32[3]
  }

  dot(vec: Vector2) {
    return this.x * vec.x + this.y * vec.y;
  }

  get length() {
    return Math.sqrt(this.dot(this))
  }

  sin() {
    return this.y / this.length;
  }

  cos() {
    return this.x / this.length
  }

  sub(vec: Vector2) {
    return new Vector2(this.x - vec.x, this.y - vec.y);
  }

  add(vec: Vector2) {
    return new Vector2(this.x + vec.x, this.y + vec.y);
  }

  scale(sx: number, sy: number) {
    return new Vector2(this.x * sx, this.y * sy);
  }

  angle(refPoint: Vector2) {
    return Math.atan2(this.y - refPoint.y, this.x - refPoint.x);
  }

  angleD(refPoint: Vector2) {
    return Angle.toDegree(this.angle(refPoint));
  }

  distance1(point: Vector2) {
    return Vector.hypot(point.x - this.x, point.y - this.y);
  }

  distance2(point: Vector2) {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    return dx * dx + dy * dy;
  }

  rotate(refPoint: Vector2, radian: number) {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const dx = this.x - refPoint.x;
    const dy = this.y - refPoint.y;
    const x = dx * cos + dy * -sin;
    const y = dx * sin + dy * cos;
    return refPoint.add(new Vector2(x, y));
  }

  rotateD(refPoint: Vector2, degree: number) {
    return this.rotate(refPoint, Angle.toRadian(degree));
  }

  equal(point: Vector2) {
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
    return `Vector2 [X="${this.x}", Y="${this.y}"]`
  }

}

class Vector {
  static hypot(x: number, y: number) {
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

export class Angle {
  static toDegree(radian: number) {
    return (radian * 180) / Math.PI;
  }

  static toRadian(degree: number) {
    return (degree / 180) * Math.PI
  }
}

export class BBox2 {
  constructor(
    public minX: number,
    public maxX: number,
    public minY: number,
    public maxY: number
  ) { }

  isContain(point: Vector2) {
    return this.isContainX(point.x) && this.isContainY(point.y)
  }

  isContainX(x: number) {
    return x >= this.minX && x <= this.maxX;
  }

  isContainY(y: number) {
    return y >= this.minY && y <= this.maxY;
  }
}

export class BBox2Factory {
  private minX!: number;
  private maxX!: number;
  private minY!: number;
  private maxY!: number;

  constructor() {
    this.init()
  }

  extend1(bbox: BBox2): BBox2Factory {
    this.minX = Math.min(this.minX, bbox.minX);
    this.maxY = Math.max(this.maxX, bbox.maxX);
    this.minY = Math.min(this.minY, bbox.minY);
    this.maxY = Math.max(this.maxX, bbox.maxY);
    return this;
  }

  extend2(point: Vector2) {
    this.minX = Math.min(this.minX, point.x);
    this.maxX = Math.max(this.maxX, point.x);
    this.minY = Math.min(this.minY, point.y);
    this.maxY = Math.max(this.maxY, point.y);
    return this;
  }

  extend3(points: Array<Vector2>) {
    for (let i = 0; i < points.length; i++) {
      this.extend2(points[i])
    }
    return this;
  }

  extend4(minX: number, maxX: number, minY: number, maxY: number) {
    this.minX = Math.min(this.minX, minX);
    this.maxX = Math.max(this.maxX, maxX);
    this.minY = Math.min(this.minY, minY);
    this.maxY = Math.max(this.maxY, maxY);
    return this;
  }

  extend5(space: number) {
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
    return new BBox2(this.minX, this.maxX, this.minY, this.maxY)
  }

}

export function isUndef(value: unknown): value is undefined | null {
  return value === void 0 || value === null;
}

export function extend<T>(obj1: T, obj2: T) {
  for (const key in obj1) {
    if (isUndef(obj1[key])) {
      obj1[key] = obj2[key];
    }
  }
  return obj1 as Required<T>;
}

export const EMPTY_ARRAY = Object.freeze(new Array()) as any[];