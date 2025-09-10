import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";
import type { CanvasListener } from "./classes/CanvasListener.svelte";
import type { CanvasSound } from "./classes/CanvasSound.svelte";
import { debugWidgets, objectFillAlpha } from "./settings.appSettings";
import { lerp } from "./util.lerp";
import { Vector2D } from "./util.vectors";

/** The infinite canvas. */
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


  /**
   * Constructor for the Infinite Canvas.
   * @param cellSize Determines size of the grid.
   */
  constructor(cellSize = 1000) {
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


  // ########################################
  // ##### COORDINATE SPACE CONVERSIONS #####
  // ########################################


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


  // ===== CANVAS VIRTUAL SIZE =====

  /** Get the virtual height of the canvas. @returns The height of the canvas. */
  virtualHeight():number { return (this.canvas?.clientHeight ?? 0) / this.#scale; }

  /** Get the virtual width of the canvas. @returns The width of the canvas. */
  virtualWidth(): number { return (this.canvas?.clientWidth ?? 0) / this.#scale; }


  // ===== CANVAS LOCATIONS =====

  /** Move the viewport to a point on the canvas.
   * @param x X coord of the destination. @param y Y coord of the destination. */
  flyToPoint(x:number, y:number) {
    this.#offsetX = (this.virtualWidth()/2) / this.#z - x;
    this.#offsetY = (this.virtualHeight()/2) / this.#z - y;
    this.#draw();
  }

  /** Get the current canvas location as X and Y offsets. @returns The X and Y offsets. */
  here(){ return({x:this.#offsetX, y:this.#offsetY}); }


  /** Get the center point of the viewport in world space. @returns The X and Y of the center point. */
  viewportCenter(){
    return {
      x: (this.canvas?.clientWidth ?? 0)/2,
      y: (this.canvas?.clientHeight ?? 0)/2
    }
  }

  /** Get the center point of the viewport in world space. @returns The X and Y of the center point. */
  viewportCenterInWorldSpace(){
    return {
      x: this.toWorldX(0) + this.toWorldLength(this.canvas?.clientWidth ?? 0)/2,
      y: this.toWorldY(0) + this.toWorldLength(this.canvas?.clientHeight ?? 0)/2
    }
  }
/*
  viewportToWorld(){
    return {
      x: this.toWorldX(0),
      y: this.toWorldY(0),
      x2: this.toWorldX()
  }
*/
  // ####################################
  // ##### CANVAS VIEWPORT CONTROLS #####
  // ####################################


  // ===== CANVAS OFFSETS =====

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


  // ===== CANVAS ZOOMING =====

  /** Get the current zoom level. @returns The zoom level. */
  getZoom() { return this.#z; }

  /**
   * Zoom in or out, optionally centered on a point, or reset zoom.
   * @param amount The multiplier amount to zoom by. Omit to reset zoom.
   * @param x The x position to center the zoom at.
   * @param y The y position to center the zoom at.
   */
  zoom(amount?: number, x?:number, y?:number): void {
    let preZoomX = 0;
    let preZoomY = 0;
    let postZoomX = 0;
    let postZoomY = 0;

    if (typeof amount != "undefined") {
      // Only zoom if current zoom is in bounds, or at max and decreasing, or at min and increasing
      if ((this.#z < this.#maxZ && this.#z > this.#minZ) ||
          (this.#z >= this.#maxZ && amount < 1) ||
          (this.#z <= this.#minZ && amount > 1)) {

        // If x and y are unspecified, set them to the viewport center.
        if (typeof x == "undefined") { 
          x = this.viewportCenter().x;
          preZoomX = this.viewportCenterInWorldSpace().x 
        } else { 
          preZoomX = this.toWorldX(x);
        }
        if (typeof y == "undefined") { 
          y = this.viewportCenter().y;
          preZoomY = this.viewportCenterInWorldSpace().y 
        } else {
          preZoomY = this.toWorldY(y);
        }

        // Set the zoom level.
        this.#z*=amount;

        // Get the viewport offsets for the post-zoom locations.
        postZoomX = this.toWorldX(x);
        postZoomY = this.toWorldY(y);
        
        // Set the new viewport offsets.
        this.#offsetX -= preZoomX - postZoomX;
        this.#offsetY -= preZoomY - postZoomY;
      }
    } else {
      // If no zoom is specified, reset zoom to 1.
      this.#z = 1;
    }
    // Clamp zoom between min and max values.
    if (this.#z > this.#maxZ) this.#z = this.#maxZ;
    if (this.#z < this.#minZ) this.#z = this.#minZ;

    // Redraw the canvas.
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


  // ###########################
  // ##### CANVAS DRAWING ######
  // ###########################


  // ===== MAIN DRAW FUNCTIONS =====

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
        this.context.fillStyle = this.#wrap.style.getPropertyValue("--c8");
        this.context.rect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fill();
        this.context.closePath();

        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // Grid styles
        this.context.strokeStyle = this.#wrap.style.getPropertyValue("--c9");
        this.context.fillStyle = this.#wrap.style.getPropertyValue("--c9");
        this.context.lineWidth = 1;
        this.context.font = "10px monospace";
        this.context.beginPath();
        
        //this.context.fillText(`${this.#z}`, 100, 100);

        // Bottom layer: draw the canvas grid.
        if (this.#z < 0.75)                 this.#drawGrid(false, this.context, width, height, 1, false);
        if (this.#z < 7.5 && this.#z > 0.1) this.#drawGrid(false, this.context, width, height, 0.1);
        if (this.#z < 75 && this.#z > 1)    this.#drawGrid(false, this.context, width, height, 0.01);
        if (this.#z > 10)                   this.#drawGrid(false, this.context, width, height, 0.001);
      }
      // Next, draw test shapes. TODO: remove this.
      //this.#drawTests();
      //this.#drawCircle(this.viewportCenterInWorldSpace().x, this.viewportCenterInWorldSpace().y, 5, true);

      // Next, cycle through all images and draw them.
      if (!R.getImagesHidden()) {
        for (let i = R.getImages().length - 1; i >= 0; i--) {
          this.#drawImage(R.getImages()[i]);
        }
      }

      // Next, cycle through all audio emitters and draw them.
      if (!R.getSoundsHidden()) {
        for (let i = R.getSounds().length - 1; i>=0; i--) {
          if (R.getSounds()[i].soundType == R.SoundType.Area) this.#drawAreaSound(R.getSounds()[i]);
          else if (R.getSounds()[i].soundType == R.SoundType.Local) this.#drawLocalSound(R.getSounds()[i]);
        }
      }

      // Next, draw the audio listener.
      this.#drawListener(R.getListener(), R.getListenerRadius());
    }
  }


  // ===== GRID DRAWING =====

  /**
   * Draw the grid on the canvas.
   * @param showNumbers Whether or not to display the grid numbers.
   */
  #drawGrid(showNumbers:boolean, 
            ctx:CanvasRenderingContext2D, 
            width:number, 
            height:number,
            scaleFactor:number = 1, 
            fade:boolean = true): void {

      // Increment size (world space) to draw grid lines
      let inc = this.cellSize * this.#scale * this.#z * scaleFactor;

      // Determine opacity
      let a = fade ? Math.min(1, Math.max(0, 1 - (this.cellSize * this.#scale - inc)/(inc*100))) : 1;
      ctx.globalAlpha = a;
      
      // Draw vertical lines
      for (let x = this.#offsetX % this.cellSize * this.#scale * this.#z - (this.cellSize * this.#scale * this.#z);
           x <= width;
           x += inc) {
        const source = x;
        ctx.moveTo(source, 0);
        ctx.lineTo(source, height);

        if (showNumbers) {
          let num = this.toWorldX(source).toFixed(0);
          if (num == "-0") num = "0";
          let bottomPadding = R.getIsHelpActive() ? 26 : 2;
          ctx.textAlign = "left";
          ctx.fillText(`${num}`, source + 2, height - bottomPadding);
        }
      }

      // draw horizontal lines
      for (let y = this.#offsetY % this.cellSize * this.#scale * this.#z - (this.cellSize * this.#scale * this.#z);
        y <= height;
        y += inc) {
        const destination = y;
        ctx.moveTo(0, destination);
        ctx.lineTo(width, destination);
        if (showNumbers) {
          let num = this.toWorldY(destination).toFixed(0);
          if (num == "-0") num = "0";
          ctx.fillText(`${num}`, 2, destination - 2);
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
  }


  // ###############################
  // ##### BASIC SHAPE DRAWING #####
  // ###############################


  /**
   * Draw a circle on the canvas.
   * @param x X position of the center of the circle.
   * @param y Y position of the center of the circle.
   * @param r Radius of the circle.
   */
  #drawCircle(x: number, y: number, r: number, fill:boolean=false): void {
    if (this.canvas && this.context) {
      this.context.beginPath();
      this.context.arc(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r * this.#scale * this.#z,
        0, 360);
      this.context.stroke();
      if (fill) {
        this.context.globalAlpha = objectFillAlpha;
        this.context.fill();
        this.context.globalAlpha = 1;
      }
    }
  }


  /**
   * Draw a rectangle on the canvas.
   * @param x X position of the upper left corner of the rectangle.
   * @param y Y position of the upper left corner of the rectangle.
   * @param width Width of the rectangle.
   * @param height Height of the rectangle.
   */
  #drawRect(x: number, y: number, width: number, height: number, fill:boolean=false) {
    if (this.canvas && this.context) {
      this.context.beginPath();
      this.context.rect(
        x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        width * this.#scale * this.#z,
        height * this.#scale * this.#z);
      this.context.stroke();
      if (fill) {
        this.context.globalAlpha = objectFillAlpha;
        this.context.fill();
        this.context.globalAlpha = 1;
      }
    }
  }


  /**
   * Draw a polygon on the canvas.
   * @param coords List of coordinates forming the points of the polygon.
   * @param selected Whether or not the polygon is selected.
   */
  #drawPoly(coords:Vector2D[], fill:boolean=false) {
    if (this.canvas && this.context) {
      this.context.beginPath();
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
      if (fill) {
        this.context.globalAlpha = objectFillAlpha;
        this.context.fill("evenodd");
        this.context.globalAlpha = 1;
      }
    }
  }


  // ===== CANVAS OBJECT DRAWING =====

  /**
   * Draw a draggable handle on the canvas.
   * @param x X position of the center of the handle.
   * @param y Y position of the center of the handle.
   * @param r Radius of the handle.
   * @param selected If the object is selected.
   * @param fill If the handle should be drawn with a fill. Defaults to true.
   */
  #drawHandle(x:number, y:number, r:number, fill:boolean=true): void {
    if (this.canvas && this.context) {
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
   * Draw the audio listener on the canvas.
   * @param x X position of the center of the listener.
   * @param y Y position of the center of the listener.
   * @param r Radius of the listener.
   */
  #drawListener(l:CanvasListener, r: number): void {
    if (this.canvas && this.context) {
      if (this.#wrap) {
        this.context.strokeStyle = this.#wrap.style.getPropertyValue("--c9");
        this.context.fillStyle = this.#wrap.style.getPropertyValue("--cA");
      }
      this.context.beginPath();
      this.context.arc(
        l.x * this.#scale * this.#z + this.#offsetX * this.#scale * this.#z,
        l.y * this.#scale * this.#z + this.#offsetY * this.#scale * this.#z,
        r,
        0, 360);
      if(!l.locked) this.context.fill();
      this.context.stroke();
    }
  }

  /**
   * Draw a circular local audio emitter on the canvas.
   * @param x X position of the center of the emitter.
   * @param y Y position of the center of the emitter.
   * @param r Radius of the emitter.
   */
  #drawLocalSound(snd:CanvasSound): void {
    if (this.canvas && this.context) {
      this.#setDrawColor(snd.selected, snd.locked, snd == R.getHoveredCanvasObject() ? true : false);
      // Draw the circle.
      this.#drawCircle(snd.x, snd.y, snd.radius, true);
      // Draw the center point.
      this.#drawHandle(snd.x, snd.y, 0.5, snd.selected);
      if (!snd.locked) {
        // Draw the name.
        this.context.textAlign = "center";
        this.context.fillText(snd.niceName, this.toWindowX(snd.x), this.toWindowY(snd.y)-4);
        // Draw the edit handle.
        this.#drawHandle(
          snd.x + Math.cos(snd.localHandleAngle)*snd.radius, 
          snd.y + Math.sin(snd.localHandleAngle)*snd.radius, 
          R.getHandleSize());
      }
      this.context.setLineDash([]);
    }
  }


  /**
   * Draw a polygonal area sound emitter.
   * @param snd The sound.
   */
  #drawAreaSound(snd:CanvasSound) {
    if (this.canvas && this.context) {
      this.#setDrawColor(snd.selected, snd.locked, snd == R.getHoveredCanvasObject() ? true : false);
      // Draw the polygon.
      this.#drawPoly(snd.areaCoords, true);
      if (!snd.locked) {
        // Draw the name.
        this.context.textAlign = "center";
        this.context.fillText(snd.niceName, 
          this.toWindowX((snd.areaBounds[0].x + snd.areaBounds[1].x) / 2), 
          this.toWindowY((snd.areaBounds[0].y + snd.areaBounds[1].y) / 2));
        // Draw the handles.
        for (let i=0; i<snd.areaCoords.length; i++) {
          const next = i + 1 == snd.areaCoords.length ? 0 : i + 1;
          this.#drawHandle(snd.areaCoords[i].x, snd.areaCoords[i].y, R.getHandleSize());
          const midX = (snd.areaCoords[next].x + snd.areaCoords[i].x)/2;
          const midY = (snd.areaCoords[next].y + snd.areaCoords[i].y)/2;
          this.#drawHandle(midX, midY, R.getHandleSize(), false);
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
      this.context.setLineDash([]);
    }
  }

  /**
   * Draw an image on the canvas.
   * @param img The CanvasImage to draw.
   */
  #drawImage(img: CanvasImage): void {
    if (this.canvas && this.context) {
      this.#setDrawColor(img.selected, img.locked, img == R.getHoveredCanvasObject() ? true : false);
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
      this.context.globalAlpha = img.opacity * R.getMasterOpacity();
      this.context.drawImage(img.image, imgX, imgY, imgW, imgH);
      this.context.globalAlpha = 1;
      this.context.restore();
      if (!img.locked) { 
        const handleSize = R.getHandleSize();
        this.#drawRect(img.x, img.y, img.width, img.height);
        this.#drawHandle(img.x, img.y, handleSize);
        this.#drawHandle(img.x + img.width, img.y, handleSize);
        this.#drawHandle(img.x, img.y + img.height, handleSize);
        this.#drawHandle(img.x + img.width, img.y + img.height, handleSize);
        this.context.textAlign = "left";
        this.context.fillText(img.niceName, 
          this.toWindowX(img.x), 
          this.toWindowY(img.y) - R.getHandleSize()*2);
      }
      this.context.setLineDash([]);
    }
  }

  #setDrawColor(selected:boolean, locked:boolean, hovered:boolean) {
    if (this.#wrap && this.context)
    if (locked) {
      this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cD");
      this.context.fillStyle = this.#wrap.style.getPropertyValue("--cD");
      this.context.setLineDash([3,3]);
    } else if (selected || hovered) {
      this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cC");
      this.context.fillStyle = this.#wrap.style.getPropertyValue("--cC");
    } else {
      this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cB");
      this.context.fillStyle = this.#wrap.style.getPropertyValue("--cB");
    }
  }


  // #################################
  // ##### CANVAS TOUCH CONTROLS #####
  // #################################


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
