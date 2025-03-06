import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";

export class InfiniteCanvas {
    canvas: HTMLCanvasElement | null = null;
    context: CanvasRenderingContext2D | null = null;
    cellSize: number;
  
    #scale = window.devicePixelRatio; 
    #z = 1;
    #offsetX = 0;
    #offsetY = 0;
  
    #touchMode: "single" | "double" = "single";
    #prevTouch: [Touch | null, Touch | null] = [null, null];
  
    constructor(cellSize = 100) {
      this.cellSize = cellSize;
  
      const canvas = document.getElementById("canvas");
      if (canvas && canvas instanceof HTMLCanvasElement) {
        this.canvas = canvas;
        this.#setupEvents(canvas);
  
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
  
    toVirtualX(xReal: number): number {
      return (xReal + this.#offsetX) * this.#scale * this.#z;
    }
    toVirtualY(yReal: number): number {
      return (yReal + this.#offsetY) * this.#scale * this.#z;
    }
    toRealX(xVirtual: number): number {
      return xVirtual / (this.#scale * this.#z) - this.#offsetX;
    }
    toRealY(yVirtual: number): number {
      return yVirtual / (this.#scale * this.#z) - this.#offsetY;
    }
  
    virtualHeight(): number {
      return (this.canvas?.clientHeight ?? 0) / this.#scale;
    }
  
    virtualWidth(): number {
      return (this.canvas?.clientWidth ?? 0) / this.#scale;
    }
  
    zoom(amount?: number): void {
      if (amount) this.#z *= amount;
      else this.#z = 1;
      this.#draw();
    }

    pan(x1:number, y1:number, x2:number, y2:number):void {
      this.offsetLeft((this.toRealX(x1) - this.toRealX(x2)));
      this.offsetUp((this.toRealY(y1) - this.toRealY(y2)));
    }
  
    offsetLeft(amount: number): void {
      this.#offsetX -= amount;
      this.#draw();
    }
  
    offsetRight(amount: number): void {
      this.#offsetX += amount;
      this.#draw();
    }
  
    offsetUp(amount: number): void {
      this.#offsetY -= amount;
      this.#draw();
    }
  
    offsetDown(amount: number): void {
      this.#offsetY += amount;
      this.#draw();
    }

    update():void {
      this.#draw();
    }

    #draw(): void {
      if (this.canvas && this.context) {
        this.canvas.width  = Math.floor((document.body.clientWidth-2) * this.#scale);
        this.canvas.height = Math.floor((document.body.clientHeight-2) * this.#scale);
        this.canvas.style.width  = `${document.body.clientWidth-2}px`;
        this.canvas.style.height = `${document.body.clientHeight-2}px`;

        this.context.scale(this.#scale, this.#scale);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.#drawGrid();
        this.#drawBox();

        for (let i=0; i<R.getImages().length; i++){
          this.#drawImage(R.getImages()[i]);
        }
      }
    }

    #setupEvents(canvas: HTMLCanvasElement): void {
      canvas.addEventListener("touchstart", (event) =>
        this.#onTouchStart(event.touches)
      );
  
      canvas.addEventListener("touchmove", (event) =>
        this.#onTouchMove(event.touches)
      );
  
      window.addEventListener("resize", () => this.#draw());
    }
  
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
  
    #drawGrid(): void {
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
          this.context.fillText(`${this.toRealX(source).toFixed(0)}`, source, height-20);
        }
        
        // draw horizontal lines
        for (let y = this.#offsetY % this.cellSize * this.#scale * this.#z; 
            y <= height; 
            y += this.cellSize * this.#scale * this.#z) {
          const destination = y;
          this.context.moveTo(0, destination);
          this.context.lineTo(width, destination);
          this.context.fillText(`${this.toRealY(destination).toFixed(0)}`, 0, destination);
        }
        this.context.stroke();
      }
    }

    #drawBox(): void {
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
          0,360);
        this.context.stroke();
      }
    }

    #drawCircle(x:number, y:number, r:number):void{}
    #drawImage(img:CanvasImage):void {
      R.getCanvas().context?.drawImage(
        img.image, 
        this.toVirtualX(img.x), 
        this.toVirtualY(img.y), 
        img.width * this.#scale * this.#z, 
        img.height * this.#scale * this.#z
      );
    }
  }
  