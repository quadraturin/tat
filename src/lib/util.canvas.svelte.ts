import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";
import type { CanvasListener } from "./classes/CanvasListener.svelte";
import type { CanvasSound } from "./classes/CanvasSound.svelte";
import { objectFillAlpha } from "./settings.appSettings";
import { Vector2D } from "./util.vectors";

enum ObjectType {
    Sound = "sound",
    Image = "image"
}

/** The infinite canvas. */
export class InfiniteCanvas {

    // Setup canvas properties.
    canvas: HTMLCanvasElement | null = null;
    context: CanvasRenderingContext2D | null = null;
    w_cellSize = 1000;

    // Setup internal vars.
    #scale = window.devicePixelRatio;
    #z = 1;
    #maxZ = 50;
    #minZ = 0.05;
    #w_offset = new Vector2D(0, 0);
    #touchMode: "single" | "double" = "single";
    #prevTouch: [Touch | null, Touch | null] = [null, null];
    #w_velocity = new Vector2D(0, 0);
    #wrap = document.getElementById('themeWrapper');
    #debugTextLn = 0;


    /**
     * Constructor for the Infinite Canvas.
     * @param w_cellSize The size of the largest grid.
     */
    constructor() {
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
                this.flyToPoint(0, 0);
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


    // ===== WORLD -> CANVAS SPACE CONVERSIONS =====

    /** Convert a world x coordinate to a canvas one. 
     * @param w_x The canvas x coord to convert. @returns The window x coord. */
    c_toX(w_x: number): number { return (w_x + this.#w_offset.x) * this.#scale * this.#z; }

    /** Convert a world y coordinate to a canvas one. 
     * @param w_y The canvas y coord to convert. @returns The window y coord. */
    c_toY(w_y: number): number { return (w_y + this.#w_offset.y) * this.#scale * this.#z; }

    /** Convert a world length to a canvas one. 
     * @param w_len The canvas length to convert. @returns The window length. */
    c_toLen(w_len: number): number { return w_len * this.#scale * this.#z; }


    // ===== CANVAS -> WORLD SPACE CONVERSIONS =====

    /** Convert a canvas x coordinate to a world one.  
     * @param c_x The window x  coord to convert. @returns The window x coord. */
    w_toX(c_x: number): number { return c_x / (this.#scale * this.#z) - this.#w_offset.x; }

    /** Convert a canvas y coordinate to a world one. 
     * @param c_y The canvas y coord to convert. @returns The window y coord. */
    w_toY(c_y: number): number { return c_y / (this.#scale * this.#z) - this.#w_offset.y; }

    /** Convert a canvas length to a world one. 
     * @param c_len The canvas length to convert. @returns The window length. */
    w_toLen(c_len: number): number { return c_len / (this.#scale * this.#z); }


    // ===== CANVAS VIRTUAL SIZE =====

    /** Get the virtual height of the canvas. @returns The height of the canvas. */
    c_canvasHeight(): number { return (this.canvas?.clientHeight ?? 0) / this.#scale; }

    /** Get the virtual width of the canvas. @returns The width of the canvas. */
    c_canvasWidth(): number { return (this.canvas?.clientWidth ?? 0) / this.#scale; }


    // ===== CANVAS LOCATIONS =====

    /** Move the viewport to a point on the canvas.
     * @param w_x X coord of the destination. @param w_y Y coord of the destination. */
    flyToPoint(w_x: number, w_y: number) {
        this.#w_offset.x = (this.c_canvasWidth() / 2) / this.#z - w_x;
        this.#w_offset.y = (this.c_canvasHeight() / 2) / this.#z - w_y;
        this.#draw();
    }

    /** Get the center point of the viewport in canvas space. @returns The X and Y of the center point. */
    c_viewportCenter() {
        return {
            x: (this.canvas?.clientWidth ?? 0) / 2,
            y: (this.canvas?.clientHeight ?? 0) / 2
        }
    }

    /** Get the center point of the viewport in world space. @returns The X and Y of the center point. */
    w_viewportCenter() {
        return {
            x: this.w_toX(0) + this.w_toLen(this.canvas?.clientWidth ?? 0) / 2,
            y: this.w_toY(0) + this.w_toLen(this.canvas?.clientHeight ?? 0) / 2
        }
    }


    // ####################################
    // ##### CANVAS VIEWPORT CONTROLS #####
    // ####################################


    // ===== CANVAS OFFSETS =====

    /** Get the camera offset. @returns The offset as a Vector2D. */
    w_getOffset() { return new Vector2D(this.#w_offset.x, this.#w_offset.y) }
    
    /** Set the camera offset. @param w_x The X offset. @param w_y The Y offset.  */
    setOffset(w_x:number, w_y:number) {
        this.#w_offset.x = w_x;
        this.#w_offset.y = w_y;
    }

    /** Offset the canvas view from the left edge. @param w_amt Distance to offset by. */
    offsetLeft(w_amt:number) {
        this.#w_offset.x -= w_amt;
        this.#draw();
    }

    /** Offset the canvas view from the right edge. @param w_amt Distance to offset by. */
    offsetRight(w_amt:number) {
        this.#w_offset.y += w_amt;
        this.#draw();
    }

    /** Offset the canvas view from the top edge. @param w_amt Distance to offset by. */
    offsetUp(w_amt:number) {
        this.#w_offset.y -= w_amt;
        this.#draw();
    }

    /** Offset the canvas view from the bottom edge. @param w_amt Distance to offset by. */
    offsetDown(w_amt:number) {
        this.#w_offset.y += w_amt;
        this.#draw();
    }


    // ===== CANVAS ZOOMING =====

    /** Get the current zoom level. @returns The zoom level. */
    getZoom() { return this.#z; }

    /** Set the current zoom level, clamped to min and max zoom. @param z The zoom level to set. */
    setZoom(z: number) {
        if (z > this.#maxZ) z = this.#maxZ;
        else if (z < this.#minZ) z = this.#minZ;
        this.#z = z;
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
            // Only zoom if current zoom is in bounds, or at max and decreasing, or at min and increasing
            if ((this.#z < this.#maxZ && this.#z > this.#minZ) ||
                (this.#z >= this.#maxZ && amount < 1) ||
                (this.#z <= this.#minZ && amount > 1)) {

                // If x and y are unspecified, set them to the viewport center.
                if (typeof x == "undefined") {
                    x = this.c_viewportCenter().x;
                    preZoomX = this.w_viewportCenter().x
                } else {
                    preZoomX = this.w_toX(x);
                }
                if (typeof y == "undefined") {
                    y = this.c_viewportCenter().y;
                    preZoomY = this.w_viewportCenter().y
                } else {
                    preZoomY = this.w_toY(y);
                }

                // Set the zoom level.
                this.#z *= amount;

                // Get the viewport offsets for the post-zoom locations.
                postZoomX = this.w_toX(x);
                postZoomY = this.w_toY(y);

                // Set the new viewport offsets.
                this.#w_offset.x -= preZoomX - postZoomX;
                this.#w_offset.y -= preZoomY - postZoomY;
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
     * @param c_x1 X coordinate to pan from.
     * @param c_y1 Y coordinate to pan from.
     * @param c_x2 X coordinate to pan to.
     * @param c_y2 Y coordinate to pan to.
     */
    pan(c_x1: number, c_y1: number, c_x2: number, c_y2: number): void {
        this.#w_velocity.x = this.w_toX(c_x1) - this.w_toX(c_x2);
        this.#w_velocity.y = this.w_toY(c_y1) - this.w_toY(c_y2);
        this.offsetLeft(this.#w_velocity.x);
        this.offsetUp(this.#w_velocity.y);
    }

    /**
     * Give panning inertia so that when you release, the canvas doesn't immediately stop.
     */
    panInertia() {
        if (this.#w_velocity.magnitude > 0.01 && !R.getPanning()) {
            this.#w_velocity.x *= R.getFriction();
            this.#w_velocity.y *= R.getFriction();
            this.offsetLeft(this.#w_velocity.x);
            this.offsetUp(this.#w_velocity.y);
            this.#draw();
        } else if (this.#w_velocity.magnitude <= 0.01) {
            this.#w_velocity.x = 0;
            this.#w_velocity.y = 0;
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

            // Account for 1px border around canvas.
            this.canvas.style.width = `${document.body.clientWidth - 2}px`;
            this.canvas.style.height = `${document.body.clientHeight - 2}px`;

            // Set scale.
            this.context.scale(this.#scale, this.#scale);

            // Clear the canvas.
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.#wrap) {
                // Layer 0: Draw the background color.
                this.context.beginPath();
                this.context.fillStyle = this.#wrap.style.getPropertyValue("--cnv-bg");
                this.context.rect(0, 0, this.canvas.width, this.canvas.height);
                this.context.fill();
                this.context.closePath();

                const c_width = this.canvas.clientWidth;
                const c_height = this.canvas.clientHeight;

                // Set up grid style
                this.context.strokeStyle = this.#wrap.style.getPropertyValue("--cnv-fg");
                this.context.fillStyle = this.#wrap.style.getPropertyValue("--cnv-fg");
                this.context.lineWidth = 1;
                this.context.font = "10px monospace";
                this.context.beginPath();

                // Layer 1: Draw the canvas grid (adapts to zoom).
                if (this.#z < 0.75)                 this.#drawGrid(true, this.context, c_width, c_height, 1, false);
                if (this.#z < 7.5 && this.#z > 0.1) this.#drawGrid(true, this.context, c_width, c_height, 0.1);
                if (this.#z < 75 && this.#z > 1)    this.#drawGrid(true, this.context, c_width, c_height, 0.01);
                if (this.#z > 10)                   this.#drawGrid(true, this.context, c_width, c_height, 0.001);
            }
            
            // Layer 2: Cycle through all images and draw them.
            if (!R.getImagesHidden()) {
                for (let i = R.getImages().length - 1; i >= 0; i--) {
                    this.#drawImage(R.getImages()[i]);
                }
            }

            // Layer 3: Cycle through all audio emitters and draw them.
            if (!R.getSoundsHidden()) {
                for (let i = R.getSounds().length - 1; i >= 0; i--) {
                    if (R.getSounds()[i].soundType == R.SoundType.Area) this.#drawAreaSound(R.getSounds()[i]);
                    else if (R.getSounds()[i].soundType == R.SoundType.Local) this.#drawLocalSound(R.getSounds()[i]);
                }
            }

            // Layer 4: Draw the audio listener.
            this.#drawListener(R.getListener(), R.getListenerRadius());

            // Layer 5: Draw debug info.
            if (R.getShowDebug()) {
                let velBar = "";
                for (let i=0; i<this.#w_velocity.magnitude; i++) { velBar += "|"; }
                this.#debugText(`debug ON. \`/~ or ctrl/cmd+0 to toggle on/off.`, this.context, "red");
                this.#debugText(`canvas zoom:             ${this.#z.toFixed(2)}`, this.context);

                this.#debugText(`canvas dimensions:       ${this.c_canvasHeight().toFixed(2)}, ${this.c_canvasWidth().toFixed(2)}`, this.context, "yellow");
                this.#debugText(`canvas viewport center:  ${this.c_viewportCenter().x.toFixed(2)}, ${this.c_viewportCenter().y.toFixed(2)}`, this.context, "yellow");

                this.#debugText(`world viewport center:   ${this.w_viewportCenter().x.toFixed(2)}, ${this.w_viewportCenter().y.toFixed(2)}`, this.context, "green");
                this.#debugText(`viewport offset:         ${this.#w_offset.x.toFixed(2)}, ${this.#w_offset.y.toFixed(2)}`, this.context, "green");
                this.#debugText(`velocity:                ${this.#w_velocity.magnitude.toFixed(2).padStart(5, "0")} ${velBar}`, this.context, "green");
                this.#debugTextLn = 0;
            }
        }
    }

    /** 
     * Write debug text to the canvas.
     * @param text: The text to write. 
     * @param ctx The canvas rendering context. 
     * @param color The text color. Default: white.
     */
    #debugText(text: string, ctx: CanvasRenderingContext2D, color?: string) {
        ctx.fillStyle = color ? color : "white";
        ctx.textAlign = "left";
        const left = 300;
        const top = 50 + this.#debugTextLn * 10;
        this.#debugTextLn++;
        ctx.fillText(text, left, top);
    }


    // ===== GRID DRAWING =====

    /**
     * Draw the grid on the canvas.
     * @param showNumbers Whether or not to display the grid numbers.
     * @param ctx The canvas context.
     * @param c_width The canvas width.
     * @param c_height The canvas height.
     * @param scaleFactor The scale. Used for drawing different grid sizes.
     * @param fade Whether or not to fade the grid as zoom level changes. Default: true.
     */
    #drawGrid(
        showNumbers: boolean,
        ctx: CanvasRenderingContext2D,
        c_width: number,
        c_height: number,
        scaleFactor: number = 1,
        fade: boolean = true) {

        // Increment size to draw grid lines
        let c_inc = this.w_cellSize * this.#scale * this.#z * scaleFactor;

        // Determine opacity
        let a = fade ? Math.min(1, Math.max(0, 1 - (this.w_cellSize * this.#scale - c_inc) / (c_inc * 100))) : 1;
        ctx.globalAlpha = a;

        // Draw vertical lines
        for (let c_x = this.#w_offset.x % this.w_cellSize * this.#scale * this.#z - (this.w_cellSize * this.#scale * this.#z);
            c_x <= c_width;
            c_x += c_inc) {
            const c_source = c_x;
            ctx.moveTo(c_source, 0);
            ctx.lineTo(c_source, c_height);

            if (showNumbers) {
                let num = this.w_toX(c_source).toFixed(0);
                if (num == "-0") num = "0";
                let c_bottomPadding = R.getIsHelpActive() ? 26 : 2;
                ctx.textAlign = "left";
                ctx.fillText(`${num}`, c_source + 2, c_height - c_bottomPadding);
            }
        }

        // draw horizontal lines
        for (let y = this.#w_offset.y % this.w_cellSize * this.#scale * this.#z - (this.w_cellSize * this.#scale * this.#z);
            y <= c_height;
            y += c_inc) {
            const destination = y;
            ctx.moveTo(0, destination);
            ctx.lineTo(c_width, destination);
            if (showNumbers) {
                let num = this.w_toY(destination).toFixed(0);
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
     * @param w_x X position of the center of the circle.
     * @param w_y Y position of the center of the circle.
     * @param w_r Radius of the circle.
     */
    #drawCircle(w_x: number, w_y: number, w_r: number, fill: boolean = false): void {
        if (this.canvas && this.context) {
            // Convert from world to canvas space for drawing.
            const c_x = this.c_toX(w_x);
            const c_y = this.c_toY(w_y);
            const c_r = this.c_toLen(w_r);

            // Draw the lines.
            this.context.beginPath();
            this.context.arc( c_x, c_y, c_r, 0, 360);
            this.context.stroke();

            // Draw the fill.
            if (fill) {
                this.context.globalAlpha = objectFillAlpha;
                this.context.fill();
                this.context.globalAlpha = 1;
            }
        }
    }


    /**
     * Draw a rectangle on the canvas.
     * @param w_x X position of the upper left corner of the rectangle.
     * @param w_y Y position of the upper left corner of the rectangle.
     * @param w_width Width of the rectangle.
     * @param w_height Height of the rectangle.
     */
    #drawRect(w_x: number, w_y: number, w_width: number, w_height: number, fill: boolean = false) {
        if (this.canvas && this.context) {
            // Convert from world to canvas space for drawing.
            const c_x = this.c_toX(w_x);// w_x * this.#scale * this.#z + this.#w_offsetX * this.#scale * this.#z;
            const c_y = this.c_toY(w_y);// * this.#scale * this.#z + this.#w_offsetY * this.#scale * this.#z;
            const c_width = this.c_toLen(w_width);
            const c_height = this.c_toLen(w_height);

            // Draw the lines.
            this.context.beginPath();
            this.context.rect(c_x, c_y, c_width, c_height);
            this.context.stroke();

            // Draw the fill.
            if (fill) {
                this.context.globalAlpha = objectFillAlpha;
                this.context.fill();
                this.context.globalAlpha = 1;
            }
        }
    }


    /**
     * Draw a polygon on the canvas.
     * @param w_coords List of coordinates forming the points of the polygon.
     * @param fill Whether or not the polygon is filled. Default: false.
     */
    #drawPoly(w_coords:Vector2D[], fill = false) {
        if (this.canvas && this.context) {

            // Convert coordinates to canvas space and draw the lines.
            this.context.beginPath();
            this.context.moveTo( this.c_toX(w_coords[0].x), this.c_toY(w_coords[0].y) );
            for (let i = 1; i < w_coords.length; i++) {
                this.context.lineTo( this.c_toX(w_coords[i].x), this.c_toY(w_coords[i].y) );
            }
            this.context.closePath()
            this.context.stroke();

            // Draw the fill.
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
     * @param w_x X position of the center of the handle.
     * @param w_y Y position of the center of the handle.
     * @param w_r Radius of the handle.
     * @param selected If the object is selected.
     * @param fill If the handle should be drawn with a fill. Defaults to true.
     */
    #drawHandle(w_x:number, w_y:number, w_r:number, fill = true) {
        if (this.canvas && this.context) {
            // Convert handle coords to canvas space and draw outline.
            this.context.beginPath();
            this.context.arc( this.c_toX(w_x), this.c_toY(w_y), w_r, 0, 360);
            this.context.stroke();
            // Draw fill
            if (typeof fill == "undefined" || fill) this.context.fill();
        }
    }

    /**
     * Draw the audio listener on the canvas.
     * @param w_l The canvas listener.
     * @param c_r The radius of the listener.
     */
    #drawListener(w_l: CanvasListener, c_r: number): void {
        if (this.canvas && this.context) {
            // Set colors by hover state.
            if (this.#wrap) {
                if (R.getHoveredCanvasObject() == w_l) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--lst-hov-b");
                    this.context.fillStyle = this.#wrap.style.getPropertyValue("--lst-hov-bg");
                } else {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--lst-b");
                    this.context.fillStyle = this.#wrap.style.getPropertyValue("--lst-bg");
                }
            }
            // Draw the listener.
            this.context.beginPath();
            this.context.arc(this.c_toX(w_l.x), this.c_toY(w_l.y), c_r, 0, 360);
            this.context.stroke();
            this.context.fill();
        }
    }

    /**
     * Draw a circular local audio emitter on the canvas.
     * @param w_snd The sound to draw.
     */
    #drawLocalSound(w_snd: CanvasSound): void {
        if (this.canvas && this.context) {
            // Set draw colors.
            this.#setDrawColor(ObjectType.Sound, w_snd.selected, w_snd.locked, w_snd == R.getHoveredCanvasObject() ? true : false);
            // Draw the circle.
            this.#drawCircle(w_snd.x, w_snd.y, w_snd.radius, true);
            // Draw the center point.
            this.#drawHandle(w_snd.x, w_snd.y, 0.5, w_snd.selected);

            // Check that the sound isn't locked.
            if (!w_snd.locked) {
                // Draw the name.
                this.context.textAlign = "center";
                this.context.fillText(w_snd.niceName, this.c_toX(w_snd.x), this.c_toY(w_snd.y) - 4);
                // Draw the edit handle.
                this.#drawHandle(
                    w_snd.x + Math.cos(w_snd.localHandleAngle) * w_snd.radius,
                    w_snd.y + Math.sin(w_snd.localHandleAngle) * w_snd.radius,
                    R.getHandleSize());
            }
            this.context.setLineDash([]);
        }
    }


    /**
     * Draw a polygonal area sound emitter.
     * @param w_snd The sound to draw.
     */
    #drawAreaSound(w_snd: CanvasSound) {
        if (this.canvas && this.context) {
            // Set draw colors.
            this.#setDrawColor(ObjectType.Sound, w_snd.selected, w_snd.locked, w_snd == R.getHoveredCanvasObject() ? true : false);
            // Draw the polygon.
            this.#drawPoly(w_snd.areaCoords, true);

            // Check that the sound isn't locked.
            if (!w_snd.locked) {
                // Draw the name.
                this.context.textAlign = "center";
                this.context.fillText(w_snd.niceName,
                    this.c_toX((w_snd.areaBounds[0].x + w_snd.areaBounds[1].x) / 2),
                    this.c_toY((w_snd.areaBounds[0].y + w_snd.areaBounds[1].y) / 2));
                // Draw the handles.
                for (let i = 0; i < w_snd.areaCoords.length; i++) {
                    const next = i + 1 == w_snd.areaCoords.length ? 0 : i + 1;
                    this.#drawHandle(w_snd.areaCoords[i].x, w_snd.areaCoords[i].y, R.getHandleSize());
                    const midX = (w_snd.areaCoords[next].x + w_snd.areaCoords[i].x) / 2;
                    const midY = (w_snd.areaCoords[next].y + w_snd.areaCoords[i].y) / 2;
                    this.#drawHandle(midX, midY, R.getHandleSize(), false);
                }
            }
            if (R.getShowDebug()) {
                // Draw the bounds.
                if (w_snd.areaBounds) {
                    this.#drawCircle(w_snd.areaBounds[0].x, w_snd.areaBounds[0].y, 1);
                    this.#drawCircle(w_snd.areaBounds[1].x, w_snd.areaBounds[1].y, 1);
                    this.#drawCircle(w_snd.areaBounds[0].x, w_snd.areaBounds[1].y, 1);
                    this.#drawCircle(w_snd.areaBounds[1].x, w_snd.areaBounds[0].y, 1);
                }
            }
            this.context.setLineDash([]);
        }
    }

    /**
     * Draw an image on the canvas.
     * @param w_img The CanvasImage to draw.
     */
    #drawImage(w_img: CanvasImage): void {
        if (this.canvas && this.context) {
            // Set up draw colors.
            this.#setDrawColor(ObjectType.Image, w_img.selected, w_img.locked, w_img == R.getHoveredCanvasObject() ? true : false);
            
            // Convert to canvas space for drawing.
            let c_x = this.c_toX(w_img.x);
            let c_y = this.c_toY(w_img.y);
            let c_w = w_img.width * this.#scale * this.#z;
            let c_h = w_img.height * this.#scale * this.#z;

            // Flip the context if the image is flipped.
            this.context.save()
            if (w_img.width < 0) {
                this.context.scale(-1, 1);
                c_x = -this.c_toX(w_img.x + w_img.width);
            }
            if (w_img.height < 0) {
                this.context.scale(1, -1);
                c_y = -this.c_toY(w_img.y + w_img.height);
            }
            // Set image opacity.
            this.context.globalAlpha = w_img.opacity * R.getMasterOpacity();
            // Draw the image.
            this.context.drawImage(w_img.image, c_x, c_y, c_w, c_h);
            // Reset context.
            this.context.restore();

            // Check if the image is locked.
            if (!w_img.locked) {
                // Draw the rectangle lines.
                this.#drawRect(w_img.x, w_img.y, w_img.width, w_img.height);

                // Draw the handles.
                const c_handleSize = R.getHandleSize();
                this.#drawHandle(w_img.x,               w_img.y,                c_handleSize);
                this.#drawHandle(w_img.x + w_img.width, w_img.y,                c_handleSize);
                this.#drawHandle(w_img.x,               w_img.y + w_img.height, c_handleSize);
                this.#drawHandle(w_img.x + w_img.width, w_img.y + w_img.height, c_handleSize);

                // Draw the text.
                this.context.textAlign = "left";
                this.context.fillText(
                    w_img.niceName,
                    w_img.width >= 0 ? 
                        this.c_toX(w_img.x) : 
                        this.c_toX(w_img.x + w_img.width),
                    w_img.height >= 0 ? 
                        this.c_toY(w_img.y) - R.getHandleSize() * 2 : 
                        this.c_toY(w_img.y + w_img.height) - R.getHandleSize() * 2);
            }
            if (R.getShowDebug()) {
                const x = this.c_toX(w_img.x);
                const y = this.c_toY(w_img.y);
                const w = this.c_toLen(w_img.width);
                const h = this.c_toLen(w_img.height);
                this.context.fillText(`NW: ${w_img.x.toFixed(2)}, ${w_img.y.toFixed(2)}`, x+10, y+10);
                this.context.fillText(`NE: ${(w_img.x+w_img.width).toFixed(2)}, ${w_img.y.toFixed(2)}`, x+w+10, y+10);
                this.context.fillText(`SW: ${w_img.x.toFixed(2)}, ${(w_img.y+w_img.height).toFixed(2)}`, x+10, y+h+10);
                this.context.fillText(`SE: ${(w_img.x+w_img.width).toFixed(2)}, ${(w_img.y+w_img.height).toFixed(2)}`, x+w+10, y+h+10);

                this.context.fillText(`width: ${w_img.width.toFixed(2)}, height: ${w_img.height.toFixed(2)}`, x+10, y+20);
            }
            this.context.setLineDash([]);
        }
    }

    #setDrawColor(objType: ObjectType, selected: boolean, locked: boolean, hovered: boolean) {
        if (this.#wrap && this.context) {
            if (objType == ObjectType.Image) {
                if (locked) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-img-lck-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-img-lck-bg");
                    this.context.setLineDash([3, 3]);
                } else if (selected) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-img-act-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-img-act-bg");
                } else if (hovered) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-img-hov-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-img-hov-bg");
                } else {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-img-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-img-bg");
                }
            }
            else if (objType == ObjectType.Sound) {
                if (locked) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-snd-lck-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-snd-lck-bg");
                    this.context.setLineDash([3, 3]);
                } else if (selected) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-snd-act-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-snd-act-bg");
                } else if (hovered) {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-snd-hov-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-snd-hov-bg");
                } else {
                    this.context.strokeStyle = this.#wrap.style.getPropertyValue("--obj-snd-b");
                    this.context.fillStyle   = this.#wrap.style.getPropertyValue("--obj-snd-bg");
                }
            }
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
        this.#w_offset.x += panX / this.#scale;
        this.#w_offset.y += panY / this.#scale;

        // Get the relative position of the middle of the zoom.
        // 0, 0 would be top left.
        // 0, 1 would be top right etc.
        const zoomRatioX = midX / (this.canvas?.clientWidth ?? 1);
        const zoomRatioY = midY / (this.canvas?.clientHeight ?? 1);

        // calculate the amounts zoomed from each edge of the screen
        const unitsZoomedX = this.c_canvasWidth() * scaleAmount;
        const unitsZoomedY = this.c_canvasHeight() * scaleAmount;

        const unitsAddLeft = unitsZoomedX * zoomRatioX;
        const unitsAddTop = unitsZoomedY * zoomRatioY;

        this.#w_offset.x += unitsAddLeft;
        this.#w_offset.y += unitsAddTop;
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
