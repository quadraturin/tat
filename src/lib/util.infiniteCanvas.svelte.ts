import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";
import type { CanvasSound } from "./classes/CanvasSound.svelte";

/**
 * Infinite canvas.
 */
export class InfiniteCanvas {
  // Setup canvas properties.
  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  cellSize: number;

  // Setup internal vars.
  #scale = window.devicePixelRatio;
  #z = 1;
  #offsetX = 0;
  #offsetY = 0;
  #touchMode: "single" | "double" = "single";
  #prevTouch: [Touch | null, Touch | null] = [null, null];
  #velocityX = 0;
  #velocityY = 0;

  /**
   * Constructor for the Infinite Canvas.
   * @param cellSize Determines size of the grid.
   */
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    const canvas = document.getElementById("canvas");

    // Ensure that the canvas exists.
    if (canvas && canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
      this.#setupEvents(canvas);

      // Get the canvas context, check it exists, and draw to it.
      const context = canvas.getContext("2d");
      if (context) {
        this.context = context;
        this.#draw();
      } else {
        console.error(`<canvas> element is missing context 2d`);
      }
    } else {
      console.error(`<canvas> element with id="canvas" not found`);
    }
  }

  /**
   * Convert a "real" (window) pixel x coordinate to a "virtual" (canvas) one.
   * @param xReal The "real" x pixel coordinate to convert.
   * @returns The "virtual" x coordinate.
   */
  toWindowX(xReal: number): number {
    return (xReal + this.#offsetX) * this.#scale * this.#z;
  }

  /**
   * Convert a "real" (window) pixel y coordinate to a "virtual" (canvas) one.
   * @param yReal The "real" y pixel coordinate to convert.
   * @returns The "virtual" y coordinate.
   */
  toWindowY(yReal: number): number {
    return (yReal + this.#offsetY) * this.#scale * this.#z;
  }

  /**
   * Convert a "virtual" (canvas) pixel x coordinate to a "real" (window) one.
   * @param xVirtual The "virtual" x pixel coordinate to convert.
   * @returns The "real" x coordinate.
   */
  toWorldX(xVirtual: number): number {
    return xVirtual / (this.#scale * this.#z) - this.#offsetX;
  }

  /**
   * Convert a "virtual" (canvas) pixel y coordinate to a "real" (window) one.
   * @param xVirtual The "virtual" y pixel coordinate to convert.
   * @returns The "real" y coordinate.
   */
  toWorldY(yVirtual: number): number {
    return yVirtual / (this.#scale * this.#z) - this.#offsetY;
  }

  /**
   * Get the virtual height of the canvas.
   * @returns The height of the canvas.
   */
  virtualHeight(): number {
    return (this.canvas?.clientHeight ?? 0) / this.#scale;
  }

  /**
   * Get the virtual width of the canvas.
   * @returns The width of the canvas.
   */
  virtualWidth(): number {
    return (this.canvas?.clientWidth ?? 0) / this.#scale;
  }

  /**
   * Zoom in or out, optionally centered on a point, or reset zoom.
   * @param amount The multiplier amount to zoom by. Omit to reset zoom.
   * @param x The x position to center the zoom at.
   * @param y The y position to center the zoom at.
   */
  zoom(amount?: number, x?: number, y?: number): void {
    let preZoomX = 0;
    let preZoomY = 0;
    let postZoomX = 0;
    let postZoomY = 0;
    if (typeof amount != "undefined") {
      // default to 0
      if (typeof x == "undefined") x = 0;
      if (typeof y == "undefined") y = 0;

      // get mouse pos in world space
      preZoomX = this.toWorldX(x);
      preZoomY = this.toWorldY(y);
      this.#z*=amount;
      postZoomX = this.toWorldX(x);
      postZoomY = this.toWorldY(y);
      this.#offsetX -= preZoomX - postZoomX;
      this.#offsetY -= preZoomY - postZoomY;
    } else {
      this.#z = 1;
    }
    this.#draw();
  }

  /**
   * Pan from one x,y coordinate to another.
   * @param x1 X coordinate to pan from.
   * @param y1 Y coordinate to pan from.
   * @param x2 X coordinate to pan to.
   * @param y2 Y coordinate to pan to.
   */
  pan(x1: number, y1: number, x2: number, y2: number): void {
    this.#velocityX = x1 - x2;
    this.#velocityY = y1 - y2;
    this.offsetLeft((this.toWorldX(x1) - this.toWorldX(x2)));
    this.offsetUp((this.toWorldY(y1) - this.toWorldY(y2)));
  }

  /**
   * Pan inertia
   */

  panInertia() {
    if (Math.abs(this.#velocityX) > 0.1 && Math.abs(this.#velocityY) > 0.1 && !R.getPanning()) {
      this.#velocityX *= R.getFriction();
      this.#velocityY *= R.getFriction();
      this.offsetLeft(this.#velocityX);
      this.offsetUp(this.#velocityY);
      this.#draw();
      console.log(this.#velocityX);
    }
  }

  /**
   * Offset the canvas view from the left edge.
   * @param amount Distance to offset by.
   */
  offsetLeft(amount: number): void {
    this.#offsetX -= amount;
    this.#draw();
  }

  /**
   * Offset the canvas view from the right edge.
   * @param amount Distance to offset by.
   */
  offsetRight(amount: number): void {
    this.#offsetX += amount;
    this.#draw();
  }

  /**
   * Offset the canvas view from the top edge.
   * @param amount Distance to offset by.
   */
  offsetUp(amount: number): void {
    this.#offsetY -= amount;
    this.#draw();
  }

  /**
   * Offset the canvas view from the bottom edge.
   * @param amount Distance to offset by.
   */
  offsetDown(amount: number): void {
    this.#offsetY += amount;
    this.#draw();
  }

  /**
   * Redraw the canvas.
   */
  update(): void {
    this.#draw();
  }

  /**
   * Draw the canvas.
   */
  #draw(): void {
    if (this.canvas && this.context) {
      // Set canvas dimensions, accounting for screen pixel density.
      this.canvas.width = Math.floor((document.body.clientWidth - 2) * this.#scale);
      this.canvas.height = Math.floor((document.body.clientHeight - 2) * this.#scale);
      this.canvas.style.width = `${document.body.clientWidth - 2}px`;
      this.canvas.style.height = `${document.body.clientHeight - 2}px`;
      this.context.scale(this.#scale, this.#scale);

      // Clear the canvas.
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //console.log(this.#offsetX, this.#offsetY)

      // Bottom layer: draw the canvas grid.
      this.#drawGrid(true);

      // Next, draw test shapes. TODO: remove this.
      this.#drawTests();

      // Next, cycle through all images and draw them.
      for (let i = 0; i < R.getImages().length; i++) {
        this.#drawImage(R.getImages()[i]);
      }

      // Next, cycle through all audio emitters and draw them.
      for (let i = 0; i < R.getSounds().length; i++) {
        this.#drawEmitter(R.getSounds()[i]);
      }

      // Next, draw the audio listener.
      this.#drawListener(0, 0, 10);
    }
  }

  /**
   * Set up events.
   * @param canvas The canvas element to set up events for.
   */
  #setupEvents(canvas: HTMLCanvasElement): void {
    canvas.addEventListener("touchstart", (event) =>
      this.#onTouchStart(event.touches)
    );
    canvas.addEventListener("touchmove", (event) =>
      this.#onTouchMove(event.touches)
    );
    window.addEventListener("resize", () => this.#draw());
  }

  /**
   * Store touch information when a touch event occurs.
   * @param touches List of points being touched.
   */
  #onTouchStart(touches: TouchList): void {
    if (touches.length == 1) {
      this.#touchMode = "single";
    } else if (touches.length >= 2) {
      this.#touchMode = "double";
    }

    // Store the last touches
    this.#prevTouch[0] = touches[0];
    this.#prevTouch[1] = touches[1];

    this.#onTouchMove(touches);
  }

  /**
   * Pan and zoom based on touch events.
   * @param touches List of points being touched.
   */
  #onTouchMove(touches: TouchList): void {
    // Get first touch coordinates
    const touch0X = touches[0].pageX;
    const touch0Y = touches[0].pageY;

    const prevTouch0X = this.#prevTouch[0]!.pageX;
    const prevTouch0Y = this.#prevTouch[0]!.pageY;

    if (this.#touchMode === "single") {
      // Single touch (setup click event)
    } else if (this.#touchMode === "double") {
      // get second touch coordinates
      const touch1X = touches[1].pageX;
      const touch1Y = touches[1].pageY;

      const prevTouch1X = this.#prevTouch[1]!.pageX;
      const prevTouch1Y = this.#prevTouch[1]!.pageY;

      const scaleAmount = this.#zoom(
        [touch0X, touch0Y],
        [prevTouch0X, prevTouch0Y],
        [touch1X, touch1Y],
        [prevTouch1X, prevTouch1Y]
      );

      this.#pan(
        scaleAmount,
        [touch0X, touch0Y],
        [prevTouch0X, prevTouch0Y],
        [touch1X, touch1Y],
        [prevTouch1X, prevTouch1Y]
      );

      this.#draw();
    }

    this.#prevTouch[0] = touches[0];
    this.#prevTouch[1] = touches[1];
  }

  /**
   * Pan the canvas based on touch events.
   * @param scaleAmount Amount to scale the canvas.
   * @param param1 First start touch coordinates.
   * @param param2 First previous touch coordinates.
   * @param param3 Second start touch coordinates.
   * @param param4 Second previous touch coordinates.
   */
  #pan(
    scaleAmount: number,
    [touch0X, touch0Y]: [number, number],
    [prevTouch0X, prevTouch0Y]: [number, number],
    [touch1X, touch1Y]: [number, number],
    [prevTouch1X, prevTouch1Y]: [number, number]
  ): void {
    // get midpoints
    const midX = (touch0X + touch1X) / 2;
    const midY = (touch0Y + touch1Y) / 2;
    const prevMidX = (prevTouch0X + prevTouch1X) / 2;
    const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

    // Calculate how many pixels the midpoints have moved in the x and y direction
    const panX = midX - prevMidX;
    const panY = midY - prevMidY;

    // Scale this movement based on the zoom level
    this.#offsetX += panX / this.#scale;
    this.#offsetY += panY / this.#scale;

    // Get the relative position of the middle of the zoom.
    // 0, 0 would be top left.
    // 0, 1 would be top right etc.
    const zoomRatioX = midX / (this.canvas?.clientWidth ?? 1);
    const zoomRatioY = midY / (this.canvas?.clientHeight ?? 1);

    // calculate the amounts zoomed from each edge of the screen
    const unitsZoomedX = this.virtualWidth() * scaleAmount;
    const unitsZoomedY = this.virtualHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * zoomRatioX;
    const unitsAddTop = unitsZoomedY * zoomRatioY;

    this.#offsetX += unitsAddLeft;
    this.#offsetY += unitsAddTop;
  }

  /**
   * Zoom the canvas based on touch events.
   * @param param1 First start touch coordinates.
   * @param param2 First previous touch coordinates.
   * @param param3 Second start touch coordinates.
   * @param param4 Second previous touch coordinates.
   * @returns 
   */
  #zoom(
    [touch0X, touch0Y]: [number, number],
    [prevTouch0X, prevTouch0Y]: [number, number],
    [touch1X, touch1Y]: [number, number],
    [prevTouch1X, prevTouch1Y]: [number, number]
  ): number {
    const hypot = Math.sqrt(
      Math.pow(touch0X - touch1X, 2) + Math.pow(touch0Y - touch1Y, 2)
    );

    const prevHypot = Math.sqrt(
      Math.pow(prevTouch0X - prevTouch1X, 2) +
      Math.pow(prevTouch0Y - prevTouch1Y, 2)
    );

    const zoomAmount = hypot / prevHypot;
    this.zoom(zoomAmount);

    const scaleAmount = 1 - zoomAmount;
    return scaleAmount;
  }

  /**
   * Draw the grid on the canvas.
   * @param showNumbers Whether or not to display the grid numbers.
   */
  #drawGrid(showNumbers: boolean): void {
    if (this.canvas && this.context) {
      this.context.strokeStyle = "rgb(102, 148, 246)";
      this.context.lineWidth = 1;
      this.context.font = "10px monospace";
      this.context.beginPath();

      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      // draw vertical lines
      for (let x = this.#offsetX % this.cellSize * this.#scale * this.#z;
        x <= width;
        x += this.cellSize * this.#scale * this.#z) {
        const source = x;
        this.context.moveTo(source, 0);
        this.context.lineTo(source, height);
        if (showNumbers) {
          let num = this.toWorldX(source).toFixed(0);
          if (num == "-0") num = "0";
          this.context.fillText(`${num}`, source, height - 20);
        }
      }

      // draw horizontal lines
      for (let y = this.#offsetY % this.cellSize * this.#scale * this.#z;
        y <= height;
        y += this.cellSize * this.#scale * this.#z) {
        const destination = y;
        this.context.moveTo(0, destination);
        this.context.lineTo(width, destination);
        if (showNumbers) {
          let num = this.toWorldY(destination).toFixed(0);
          if (num == "-0") num = "0";
          this.context.fillText(`${num}`, 0, destination);
        }
      }
      this.context.stroke();
    }
  }

  /**
   * Draw test shapes on the canvas.
   */
  #drawTests(): void {
    if (this.canvas && this.context) {
      this.context.beginPath();
      this.context.strokeStyle = "rgb(246, 102, 186)";
      this.context.rect(
        25 * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        75 * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        100 * this.#scale * this.#z,
        150 * this.#scale * this.#z);
      this.context.stroke();

      this.context.beginPath();
      this.context.arc(
        150 * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        250 * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        25 * this.#scale * this.#z,
        0, 360);
      this.context.stroke();
    }
  }

  /**
   * Draw a rectangle on the canvas.
   * @param x X position of the upper left corner of the rectangle.
   * @param y Y position of the upper left corner of the rectangle.
   * @param width Width of the rectangle.
   * @param height Height of the rectangle.
   */
  #drawRect(x: number, y: number, width: number, height: number) {
    if (this.canvas && this.context) {
      this.context.beginPath();
      this.context.strokeStyle = "rgb(246, 102, 186)";
      this.context.rect(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        width * this.#scale * this.#z,
        height * this.#scale * this.#z);
      this.context.stroke();
    }
  }

  /**
   * Draw an audio emitter on the canvas.
   * @param x X position of the center of the emitter.
   * @param y Y position of the center of the emitter.
   * @param r Radius of the emitter.
   */
  #drawEmitter(emit:CanvasSound): void {
    if (this.canvas && this.context) {
      this.#drawCircle(emit.x, emit.y, emit.radius);
      this.#drawHandle(emit.x, emit.y, 4);
      this.#drawHandle(emit.x + emit.radius, emit.y, 4 );
    }
  }

  /**
   * Draw a circle on the canvas.
   * @param x X position of the center of the circle.
   * @param y Y position of the center of the circle.
   * @param r Radius of the circle.
   */
  #drawCircle(x: number, y: number, r: number): void {
    if (this.canvas && this.context) {
      this.context.beginPath();
      this.context.arc(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r * this.#scale * this.#z,
        0, 360);
      this.context.stroke();
    }
  }

  /**
   * Draw a draggable handle on the canvas.
   * @param x X position of the center of the handle.
   * @param y Y position of the center of the handle.
   * @param r Radius of the handle.
   */
  #drawHandle(x: number, y: number, r: number): void {
    if (this.canvas && this.context) {
      this.context.strokeStyle = "rgb(246, 102, 186)";
      this.context.fillStyle = "rgb(246, 102, 186)";
      this.context.beginPath();
      this.context.arc(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r,
        0, 360);
      this.context.fill();
      this.context.stroke();
    }
  }

  /**
   * Draw an audio listener on the canvas.
   * @param x X position of the center of the listener.
   * @param y Y position of the center of the listener.
   * @param r Radius of the listener.
   */
  #drawListener(x: number, y: number, r: number): void {
    if (this.canvas && this.context) {
      this.context.strokeStyle = "rgb(246, 102, 186)";
      this.context.fillStyle = "rgb(236, 170, 209)";
      this.context.beginPath();
      this.context.arc(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r,
        0, 360);
      this.context.fill();
      this.context.stroke();
    }
  }

  /**
   * Draw an image on the canvas.
   * @param img The CanvasImage to draw.
   */
  #drawImage(img: CanvasImage): void {
    if (this.canvas && this.context) {
      this.context.drawImage(
        img.image,
        this.toWindowX(img.x),
        this.toWindowY(img.y),
        img.width * this.#scale * this.#z,
        img.height * this.#scale * this.#z
      );
      this.#drawRect(img.x, img.y, img.width, img.height);
      this.#drawHandle(img.x, img.y, 4);
      this.#drawHandle(img.x, img.y + img.height, 4);
      this.#drawHandle(img.x + img.width, img.y, 4);
      this.#drawHandle(img.x + img.width, img.y + img.height, 4);
    }
  }
}
