import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";
import type { CanvasListener } from "./classes/CanvasListener.svelte";
import type { CanvasSound } from "./classes/CanvasSound.svelte";
import { debugWidgets } from "./settings.appSettings";
import { Vector2D } from "./util.vectors";

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
  #maxZ = 50;
  #minZ = 0.05;
  #offsetX = 0;
  #offsetY = 0;
  #touchMode: "single" | "double" = "single";
  #prevTouch: [Touch | null, Touch | null] = [null, null];
  #velocityX = 0;
  #velocityY = 0;

  #wrap = document.getElementById('themeWrapper');
  #backgroundColor = R.activeTheme.c0;
  #gridColor = R.activeTheme.c1;
  #widgetColor = $state(R.activeTheme.cA);
  #widgetSelectedColor = $state(R.activeTheme.cB);


  /**
   * Constructor for the Infinite Canvas.
   * @param cellSize Determines size of the grid.
   */
  constructor(cellSize = 240) {
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
        this.flyToPoint(0,0);
      } else {
        console.error(`<canvas> element is missing context 2d`);
      }
    } else {
      console.error(`<canvas> element with id="canvas" not found`);
    }
  }


  // ===== CANVAS -> WINDOW SPACE CONVERSIONS =====

  /** Convert a canvas x coordinate to a window one. 
   * @param cX The canvas x coord to convert. @returns The window x coord. */
  toWindowX(cX: number): number { return (cX + this.#offsetX) * this.#scale * this.#z; }

  /** Convert a canvas y coordinate to a canvas one. 
   * @param cY The canvas y coord to convert. @returns The window y coord. */
  toWindowY(cY: number): number { return (cY + this.#offsetY) * this.#scale * this.#z; }

  /** Convert a canvas pixel length to a window one. 
   * @param len The canvas length to convert. @returns The window length. */
  toWindowLength(len: number): number { return len / (this.#scale * this.#z); }


  // ===== WINDOW -> CANVAS SPACE CONVERSIONS =====
  
  /** Convert a window x coordinate to a canvas one.  
   * @param wX The window x  coord to convert. @returns The window x coord. */
  toWorldX(wX: number): number { return wX / (this.#scale * this.#z) - this.#offsetX; }

  /** Convert a window y coordinate to a canvas one. 
   * @param cY The canvas y coord to convert. @returns The window y coord. */
  toWorldY(cY: number): number { return cY / (this.#scale * this.#z) - this.#offsetY; }

  /** Convert a window pixel length to a canvas one. 
   * @param len The "virtual" length to convert. @returns The "real" length. */
  toWorldLength(len: number): number { return len / (this.#scale * this.#z); }


  // ===== CANVAS VIEWPORT =====

  /** Offset the canvas view from the left edge. @param amount Distance to offset by. */
  offsetLeft(amount: number): void {
    this.#offsetX -= amount;
    this.#draw();
  }

  /** Offset the canvas view from the right edge. @param amount Distance to offset by. */
  offsetRight(amount: number): void {
    this.#offsetX += amount;
    this.#draw();
  }

  /** Offset the canvas view from the top edge. @param amount Distance to offset by. */
  offsetUp(amount: number): void {
    this.#offsetY -= amount;
    this.#draw();
  }

  /** Offset the canvas view from the bottom edge. @param amount Distance to offset by. */
  offsetDown(amount: number): void {
    this.#offsetY += amount;
    this.#draw();
  }

  /** Get the virtual height of the canvas. @returns The height of the canvas. */
  virtualHeight():number { return (this.canvas?.clientHeight ?? 0) / this.#scale; }

  /** Get the virtual width of the canvas. @returns The width of the canvas. */
  virtualWidth(): number { return (this.canvas?.clientWidth ?? 0) / this.#scale; }

  /** Move the viewport to a point on the canvas.
   * @param x X coord of the destination. @param y Y coord of the destination. */
  flyToPoint(x:number, y:number) {
    this.#offsetX = (this.virtualWidth()/2) / this.#z - x;
    this.#offsetY = (this.virtualHeight()/2) / this.#z - y;
    this.#draw();
  }

  /** Get the current canvas location as X and Y offsets. @returns The X and Y offsets. */
  here(){ return({x:this.#offsetX, y:this.#offsetY}); }


  // ===== CANVAS ZOOMING =====

  /** Get the current zoom level. @returns The zoom level. */
  getZoom() { return this.#z; }

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
      if ((this.#z < this.#maxZ && this.#z > this.#minZ) ||
          (this.#z >= this.#maxZ && amount < 1) ||
          (this.#z <= this.#minZ && amount > 1)) {
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
      }
    } else {
      this.#z = 1;
    }
    if (this.#z > this.#maxZ) this.#z = this.#maxZ;
    if (this.#z < this.#minZ) this.#z = this.#minZ;
    this.#draw();
  }


  // ===== CANVAS PANNING =====

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
   * Give panning inertia so that when you release, the canvas doesn't immediately stop.
   */
  panInertia() {
    if (Math.abs(this.#velocityX) > 0.1 && Math.abs(this.#velocityY) > 0.1 && !R.getPanning()) {
      this.#velocityX *= R.getFriction();
      this.#velocityY *= R.getFriction();
      this.offsetLeft(this.#velocityX);
      this.offsetUp(this.#velocityY);
      this.#draw();
    }
  }


  // ===== CANVAS DRAWING =====

  /** Redraw the canvas. */
  update(): void {
    this.#draw();
  }

  /** Draw the canvas. */
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

      if (this.#wrap) {
        this.context.beginPath();
        this.context.fillStyle = this.#wrap.style.getPropertyValue("--c1");
        this.context.rect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fill();
        this.context.closePath();
      }

      // Bottom layer: draw the canvas grid.
      this.#drawGrid(true, false, true, 0.25, 0.1);
      this.#drawGrid(true, true, false, 0.5, 0.1);
      this.#drawGrid(false, true, true, 1, 0.1);

      // Next, draw test shapes. TODO: remove this.
      this.#drawTests();

      // Next, cycle through all images and draw them.
      for (let i = 0; i < R.getImages().length; i++) {
        this.#drawImage(R.getImages()[i]);
      }

      // Next, cycle through all audio emitters and draw them.
      for (let i = 0; i < R.getSounds().length; i++) {
        //this.#drawLocalSound(R.getSounds()[i]);
        this.#drawAreaSound(R.getSounds()[i]);
      }

      // Next, draw the audio listener.
      this.#drawListener(R.getListener(), R.getListenerRadius());
    }
  }


  /**
   * Draw the grid on the canvas.
   * @param showNumbers Whether or not to display the grid numbers.
   */
  #drawGrid(showNumbers: boolean, adaptive:boolean, fade:boolean, gridSize?:number, maxAlpha?:number): void {
    if (this.canvas && this.context) {
      this.context.globalAlpha = 0.2;
      if (this.#wrap) this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cC");
      this.context.lineWidth = 1;
      this.context.font = "10px monospace";
      this.context.beginPath();

      if (typeof gridSize == "undefined") gridSize = 1;
      if (typeof maxAlpha == "undefined") maxAlpha = 1;
      
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      let inc = this.cellSize * gridSize * this.#scale * this.#z;

      if (adaptive) {
        while (inc > this.cellSize * gridSize) {
          inc = inc / 2;
        }
        if (fade) {
          let a = 2*(1-inc/(this.cellSize*gridSize));
          let alpha = Math.pow(Math.E,(0 - (((a)**2)) / 0.04));
          this.context.globalAlpha = Math.min(maxAlpha, alpha);
        } else {
          this.context.globalAlpha = maxAlpha;
        }
      }

      // draw vertical lines
      for (let x = this.#offsetX % this.cellSize * this.#scale * this.#z - (this.cellSize * this.#scale * this.#z);
           x <= width;
           x += inc) {
        const source = x;
        this.context.moveTo(source, 0);
        this.context.lineTo(source, height);

        if (showNumbers && this.#z >= 0.2) {
          let num = this.toWorldX(source).toFixed(0);
          if (num == "-0") num = "0";
          this.context.fillText(`${num}`, source, height - 20);
        }
      }

      // draw horizontal lines
      for (let y = this.#offsetY % this.cellSize * this.#scale * this.#z - (this.cellSize * this.#scale * this.#z);
        y <= height;
        y += inc) {
        const destination = y;
        this.context.moveTo(0, destination);
        this.context.lineTo(width, destination);
        if (showNumbers && this.#z >= 0.2) {
          let num = this.toWorldY(destination).toFixed(0);
          if (num == "-0") num = "0";
          this.context.fillText(`${num}`, 0, destination);
        }
      }
      this.context.stroke();
      this.context.globalAlpha = 1;
    }
  }


  /**
   * Draw test shapes on the canvas.
   */
  #drawTests(): void {
    if (this.canvas && this.context) {
      this.#drawRect(-100,50,200,500,false);

      this.#drawCircle(45,80,100);

      this.#drawPoly([new Vector2D(-30,-50), new Vector2D(-45,90), new Vector2D(20,40), new Vector2D(12,-40), new Vector2D(5,-30)], false);
    }
  }


  /**
   * Draw a rectangle on the canvas.
   * @param x X position of the upper left corner of the rectangle.
   * @param y Y position of the upper left corner of the rectangle.
   * @param width Width of the rectangle.
   * @param height Height of the rectangle.
   */
  #drawRect(x: number, y: number, width: number, height: number, selected:boolean|null) {
    if (this.canvas && this.context) {
      this.context.beginPath();
      if (selected && this.#wrap) this.context.strokeStyle = this.#wrap.style.getPropertyValue("--c2");
      else if (this.#wrap) this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cB");
      this.context.rect(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        width * this.#scale * this.#z,
        height * this.#scale * this.#z);
      this.context.stroke();
    }
  }


  /**
   * Draw a polygon on the canvas.
   * @param coords List of coordinates forming the points of the polygon.
   * @param selected Whether or not the polygon is selected.
   */
  #drawPoly(coords:Vector2D[], selected:boolean|null) {
    if (this.canvas && this.context) {
      this.context.beginPath();
      if (selected && this.#wrap) this.context.strokeStyle = this.#wrap.style.getPropertyValue("--c2");
      else if (this.#wrap) this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cC");
      this.context.moveTo(
        coords[0].x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z, 
        coords[0].y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z);
      for (let i = 1; i < coords.length; i++){
        this.context.lineTo(
          coords[i].x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z, 
          coords[i].y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z);
      }
      this.context.closePath()
      this.context.stroke();
      //this.context.fill();
    }
  }


  /**
   * Draw a local audio emitter on the canvas.
   * @param x X position of the center of the emitter.
   * @param y Y position of the center of the emitter.
   * @param r Radius of the emitter.
   */
  #drawLocalSound(snd:CanvasSound): void {
    if (this.canvas && this.context) {
      this.#drawCircle(snd.x, snd.y, snd.radius);
      this.#drawHandle(snd.x, snd.y, 0.5, null);
      this.#drawHandle(
        snd.x + Math.cos(snd.localHandleAngle)*snd.radius, 
        snd.y + Math.sin(snd.localHandleAngle)*snd.radius, 
        R.getHandleSize(), 
        null);
    }
  }


  #drawAreaSound(snd:CanvasSound) {
    if (this.canvas && this.context) {
      // Draw the polygon.
      this.#drawPoly(snd.areaCoords, snd.selected);
      if (snd.editable) {
        // Draw the handles.
        for (let i=0; i<snd.areaCoords.length; i++) {
          const next = i + 1 == snd.areaCoords.length ? 0 : i + 1;
          this.#drawHandle(snd.areaCoords[i].x, snd.areaCoords[i].y, R.getHandleSize(), snd.selected);
          const midX = (snd.areaCoords[next].x + snd.areaCoords[i].x)/2;
          const midY = (snd.areaCoords[next].y + snd.areaCoords[i].y)/2;
          this.#drawHandle(midX, midY, R.getHandleSize(), snd.selected, false);
        }
      }
      if (debugWidgets) {
        // Draw the bounds.
        if (snd.areaBounds) {
          this.#drawCircle(snd.areaBounds[0].x,snd.areaBounds[0].y,1);
          this.#drawCircle(snd.areaBounds[1].x,snd.areaBounds[1].y,1);
          this.#drawCircle(snd.areaBounds[0].x,snd.areaBounds[1].y,1);
          this.#drawCircle(snd.areaBounds[1].x,snd.areaBounds[0].y,1);
        }
      }
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
   * @param selected If the object is selected.
   * @param fill If the handle should be drawn with a fill. Defaults to fill.
   */
  #drawHandle(x:number, y:number, r:number, selected:boolean|null, fill?:boolean): void {
    if (this.canvas && this.context) {
      if (selected && this.#wrap) { 
        this.context.strokeStyle = this.#wrap.style.getPropertyValue("--c2");;
        this.context.fillStyle = this.#wrap.style.getPropertyValue("--c2");;
      } else if (this.#wrap) { 
        this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cC");;
        this.context.fillStyle = this.#wrap.style.getPropertyValue("--cC");;
      }
      this.context.beginPath();
      this.context.arc(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r,
        0, 360);
      if(typeof fill == "undefined" || fill) this.context.fill();
      this.context.stroke();
    }
  }


  /**
   * Draw an audio listener on the canvas.
   * @param x X position of the center of the listener.
   * @param y Y position of the center of the listener.
   * @param r Radius of the listener.
   */
  #drawListener(l:CanvasListener, r: number): void {
    if (this.canvas && this.context) {
      if (this.#wrap) {
        this.context.strokeStyle = l.selected ? this.#wrap.style.getPropertyValue("--c2") : this.#wrap.style.getPropertyValue("--c4");
        this.context.fillStyle = l.selected ? this.#wrap.style.getPropertyValue("--c2") : this.#wrap.style.getPropertyValue("--c4");
      }
      this.context.beginPath();
      this.context.arc(
        l.x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        l.y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r,
        0, 360);
      if(l.editable) this.context.fill();
      this.context.stroke();
    }
  }


  /**
   * Draw an image on the canvas.
   * @param img The CanvasImage to draw.
   */
  #drawImage(img: CanvasImage): void {
    if (this.canvas && this.context) {
      let imgX = this.toWindowX(img.x);
      let imgY = this.toWindowY(img.y);
      let imgW = img.width * this.#scale * this.#z;
      let imgH = img.height * this.#scale * this.#z;
      this.context.save()
      if (img.width < 0) {
        this.context.scale(-1,1);
        imgX = -this.toWindowX(img.x + img.width);
      }
      if (img.height < 0) {
        this.context.scale(1,-1);
        imgY = -this.toWindowY(img.y + img.height);
      }
      this.context.drawImage(img.image, imgX, imgY, imgW, imgH);
      this.context.restore();
      if (img.editable) { 
        const handleSize = R.getHandleSize();
        this.#drawRect(img.x, img.y, img.width, img.height, img.selected);
        this.#drawHandle(img.x, img.y, handleSize, img.selected);
        this.#drawHandle(img.x + img.width, img.y, handleSize, img.selected);
        this.#drawHandle(img.x, img.y + img.height, handleSize, img.selected);
        this.#drawHandle(img.x + img.width, img.y + img.height, handleSize, img.selected);
      }
    }
  }


  // ===== CANVAS TOUCH CONTROLS =====

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
}
