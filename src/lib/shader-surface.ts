/**
 * The scaffolding behind Scrim's silk: mount a full-bleed canvas, cap the
 * frame rate, stop when nobody is looking, read colour out of the live design
 * tokens rather than duplicating it, and treat every failure path as the CSS
 * underneath simply staying visible.
 *
 *   • Degradation. No WebGL, blocked context, failed compile, lost context —
 *     every one of them leaves the canvas at opacity 0 with whatever was
 *     rendered underneath intact. Nothing here is load-bearing for content.
 *   • Reduced motion. One frame drawn at a fixed time, with the pointer
 *     withdrawn. Callers whose state changes with scroll call `invalidate()`
 *     to redraw that still frame.
 *   • Cost. Paused off-screen and on a hidden tab, and a hard cap on shaded
 *     pixels so a 4K display does not quietly cost ten times a laptop.
 *   • The pointer. One window listener for every surface on the page.
 */

export type RGB = [number, number, number];

/** Values used if a token cannot be read back. Same numbers the tokens hold. */
const TOKEN_FALLBACK: Record<string, RGB> = {
  "--color-silk-950": [0.233, 0.112, 0.029],
  "--color-silk-900": [0.413, 0.217, 0.081],
  "--color-silk-800": [0.574, 0.311, 0.106],
  "--color-silk-600": [0.885, 0.545, 0.114],
  "--color-silk-400": [0.986, 0.707, 0.308],
  "--color-silk-300": [0.995, 0.773, 0.455],
};

/**
 * Reads design tokens back as sRGB in 0–1.
 *
 * The tokens are authored in oklch, which no shader uniform understands, so
 * the browser does the conversion: paint the token into a 1×1 2D canvas and
 * read the pixel back. A token that will not parse — or a privacy mode that
 * blocks canvas readback — falls through to the table above rather than
 * throwing, so the surface still draws in the right colours.
 */
export function readColorTokens(
  tokens: readonly string[],
  fallback: Record<string, RGB> = TOKEN_FALLBACK
): RGB[] {
  const out: RGB[] = tokens.map((t) => fallback[t] ?? [0, 0, 0]);
  try {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const ctx = probe.getContext("2d", { willReadFrequently: true });
    if (!ctx) return out;
    const styles = getComputedStyle(document.documentElement);
    tokens.forEach((name, i) => {
      const value = styles.getPropertyValue(name).trim();
      if (!value) return;
      /* fillStyle silently keeps its previous value on an unparseable
         colour, so set a sentinel first and treat "unchanged" as failure. */
      ctx.fillStyle = "#000000";
      ctx.fillStyle = value;
      if (ctx.fillStyle === "#000000") return;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      out[i] = [d[0] / 255, d[1] / 255, d[2] / 255];
    });
  } catch {
    /* Canvas readback blocked. Fallback table stands. */
  }
  return out;
}

/* ---------------------------------------------------------------------
   The shared pointer.

   Every surface wants the same two numbers, and none of them wants to pay
   for its own listener or its own layout read. The listener records client
   coordinates only; each surface converts them against the rect its own
   frame loop already measured, which stays correct inside sticky and
   transformed stages, where a stored offset would not.
   --------------------------------------------------------------------- */

let pointerX = 0;
let pointerY = 0;
let pointerLive = false;
let pointerUsers = 0;

const onPointerMove = (e: PointerEvent) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
  pointerLive = true;
};
/* A pointer that left the window is not hovering anything. Touch is included
   deliberately: a finger that lifted should let the field settle back. */
const onPointerGone = () => {
  pointerLive = false;
};

function retainPointer() {
  if (pointerUsers++ > 0) return;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerGone, { passive: true });
  window.addEventListener("pointercancel", onPointerGone, { passive: true });
  document.addEventListener("pointerleave", onPointerGone);
  window.addEventListener("blur", onPointerGone);
}

function releasePointer() {
  if (--pointerUsers > 0) return;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerdown", onPointerMove);
  window.removeEventListener("pointerup", onPointerGone);
  window.removeEventListener("pointercancel", onPointerGone);
  document.removeEventListener("pointerleave", onPointerGone);
  window.removeEventListener("blur", onPointerGone);
}

/* --------------------------------------------------------------------- */

export type Uniforms = Record<string, WebGLUniformLocation | null>;

export interface FrameState {
  /** Seconds since the surface started; the fixed still time when frozen. */
  time: number;
  /** The canvas rect, measured once for this frame. */
  rect: DOMRect;
  /** Drawing-buffer size in device pixels. */
  width: number;
  height: number;
  /** Device pixels per CSS pixel actually used. Line widths need this. */
  scale: number;
  /** The same eased x/y (0..1, y up) and 0..1 presence the shader reads as
   *  `u_pointer` — exposed here too for callers whose interaction needs to
   *  read the pointer on the CPU side (e.g. biasing a JS-side simulation),
   *  not just inside the fragment shader. */
  pointer: { x: number; y: number; presence: number };
}

export interface ShaderSurfaceOptions {
  fragment: string;
  /** Uniform name → design token. Read on mount and on context restore. */
  colors?: Record<string, string>;
  /** Uniform names the caller sets itself, resolved after link. */
  uniforms?: readonly string[];
  /** Set once, after link and after a context restore. */
  onInit?: (gl: WebGLRenderingContext, u: Uniforms, s: FrameState) => void;
  /** Set per frame. Called after the built-in uniforms, before the draw. */
  onFrame?: (gl: WebGLRenderingContext, u: Uniforms, s: FrameState) => void;
  /** Fired whenever a frame reaches the buffer after the surface was idle. */
  onPainted?: () => void;
  /**
   * Fired when the surface stops drawing — off-screen, hidden tab, or torn
   * down. A drawing buffer with preserveDrawingBuffer:false is undefined
   * once it has been composited and most browsers clear it, so a stopped
   * surface is a surface that is showing nothing. Callers that hide a
   * fallback while the shader is up MUST bring it back here, or the surface
   * goes blank the first time the visitor scrolls past it and comes back.
   */
  onIdle?: () => void;
  /** Fired when the surface stops being able to draw at all. */
  onLost?: () => void;
  /** Frame cap; a function is read every frame, so a surface can run faster only while it moves. */
  fps?: number | (() => number);
  /** The single frame a reduced-motion visitor gets. */
  stillTime?: number;
  /**
   * Read every frame. While it returns true the surface holds the frame it
   * was on (redrawn only if the canvas is resized) and its clock stops, so
   * it resumes from the same moment. For a visible pause control; reduced
   * motion is handled on its own and needs nothing here.
   */
  paused?: () => boolean;
  maxPixels?: number;
  dprCap?: number;
  /** How far outside the canvas the pointer still counts, as a fraction. */
  pointerPad?: number;
  /** Opaque surfaces are cheaper; translucent ones can sit over content. */
  alpha?: boolean;
  /** Margin at which the surface starts drawing before it scrolls in. */
  rootMargin?: string;
}

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/**
 * GLSL helpers prepended to every fragment shader: value noise and fbm for
 * the cloth, a contrast ceiling for copy that sits on it, and a dither.
 */
const PRELUDE = `
precision highp float;

/* Value noise and a four-octave fbm. Cheaper than gradient noise, and the
   difference is invisible once it is this soft. */
float vhash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(vhash(i), vhash(i + vec2(1.0, 0.0)), u.x),
             mix(vhash(i + vec2(0.0, 1.0)), vhash(i + vec2(1.0, 1.0)), u.x),
             u.y) * 2.0 - 1.0;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.02; a *= 0.5; }
  return v;
}

/* The contrast ceiling. WCAG contrast is a ratio of relative luminances, so
   a colour is safe under light text if its luminance stays under a bound —
   the hue is free. This scales a colour down to that bound, in linear light,
   keeping hue and saturation, and only if it was over. */
vec3 holdUnder(vec3 col, float ymax) {
  float y = dot(pow(max(col, 0.0), vec3(2.2)), vec3(0.2126, 0.7152, 0.0722));
  return y > ymax ? col * pow(ymax / max(y, 1e-5), 1.0 / 2.2) : col;
}

/* Ordered dither. On a ground this dark an eight-bit buffer bands visibly
   across a soft gradient; this is what stops that. */
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * Mounts a shader on a canvas. Returns the teardown.
 *
 * Returns a no-op teardown — never throws — if the surface cannot run, so a
 * caller never has to branch on whether WebGL exists.
 *
 * The context itself is created lazily, the first time the canvas comes
 * within `rootMargin` of the viewport, so only what is actually on screen
 * ever holds one of the browser's limited WebGL contexts.
 */
/** The teardown, plus a way to redraw the still frame when the caller's own state changes. */
export type Surface = (() => void) & { invalidate: () => void };

export function mountShaderSurface(
  canvas: HTMLCanvasElement,
  options: ShaderSurfaceOptions
): Surface {
  const {
    fragment,
    colors = {},
    uniforms = [],
    onInit,
    onFrame,
    onPainted,
    onIdle,
    onLost,
    fps = 30,
    stillTime = 12.5,
    paused,
    maxPixels = 1_400_000,
    dprCap = 1.5,
    pointerPad = 0.3,
    alpha = false,
    rootMargin = "160px",
  } = options;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isStill = () => motionQuery.matches;

  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let u: Uniforms = {};
  let colorNames: string[] = [];
  let started = false;
  let pointerRetained = false;

  const applyColors = () => {
    if (!gl) return;
    const values = readColorTokens(colorNames.map((n) => colors[n]));
    colorNames.forEach((name, i) => gl!.uniform3fv(u[name], values[i]));
  };

  /* Creates the context and compiles/links the program. Idempotent —
     `started` latches on the first call, so a surface that turns out to
     have no usable WebGL doesn't retry every time it re-enters view. */
  const setup = (): boolean => {
    if (started) return gl != null;
    started = true;

    gl = (canvas.getContext("webgl", {
      alpha,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, PRELUDE + fragment);
    if (!vs || !fs) {
      gl = null;
      return false;
    }

    program = gl.createProgram();
    if (!program) {
      gl = null;
      return false;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl = null;
      program = null;
      return false;
    }
    gl.useProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (alpha) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    /* One oversized triangle rather than two — same coverage, no seam down
       the diagonal, one fewer vertex to transform. */
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const attr = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    u = {
      u_res: gl.getUniformLocation(program, "u_res"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_pointer: gl.getUniformLocation(program, "u_pointer"),
      u_scale: gl.getUniformLocation(program, "u_scale"),
    };
    for (const name of [...Object.keys(colors), ...uniforms]) {
      u[name] = gl.getUniformLocation(program, name);
    }

    colorNames = Object.keys(colors);
    applyColors();

    retainPointer();
    pointerRetained = true;

    return true;
  };

  let width = 0;
  let height = 0;
  let scale = 1;
  let rect = canvas.getBoundingClientRect();

  /* Eased, not snapped. The lag is the difference between light that
     follows the cursor and light that is stuck to it. */
  let px = 0.5;
  let py = 0.5;
  let presence = 0;

  const measure = () => {
    if (!gl) return false;
    rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    let s = Math.min(window.devicePixelRatio || 1, dprCap);
    const area = rect.width * rect.height * s * s;
    if (area > maxPixels) s *= Math.sqrt(maxPixels / area);
    scale = s;
    const w = Math.max(1, Math.round(rect.width * s));
    const h = Math.max(1, Math.round(rect.height * s));
    if (w !== width || h !== height) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.u_res, w, h);
    }
    gl.uniform1f(u.u_scale, s);
    return true;
  };

  const trackPointer = (frozen: boolean) => {
    if (frozen) {
      presence = 0;
      return;
    }
    let targetPresence = 0;
    if (pointerLive) {
      const x = (pointerX - rect.left) / rect.width;
      const y = 1 - (pointerY - rect.top) / rect.height;
      const near =
        x > -pointerPad &&
        x < 1 + pointerPad &&
        y > -pointerPad &&
        y < 1 + pointerPad;
      if (near) {
        targetPresence = 1;
        /* The position keeps following even as presence fades, so light
           that is on its way out does not also jump. */
        px += (x - px) * 0.16;
        py += (y - py) * 0.16;
      }
    }
    presence += (targetPresence - presence) * 0.09;
  };

  let raf = 0;
  let start = 0;
  let last = 0;
  /* Corrected by the IntersectionObserver's first callback, which fires
     shortly after `io.observe()` below — nothing here assumes visibility
     ahead of that, since assuming true is exactly what used to make every
     mounted surface create a context regardless of whether it was ever
     on screen. */
  let visible = false;
  let painted = false;
  let dead = false;

  const state = (time: number): FrameState => ({
    time,
    rect,
    width,
    height,
    scale,
    pointer: { x: px, y: py, presence },
  });

  const draw = (time: number) => {
    if (!gl) return;
    gl.uniform1f(u.u_time, time);
    gl.uniform3f(u.u_pointer, px, py, presence);
    onFrame?.(gl, u, state(time));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!painted) {
      painted = true;
      onPainted?.();
    }
  };

  const init = () => {
    if (!measure()) return;
    onInit?.(gl!, u, state(stillTime));
  };

  const drawStill = () => {
    if (!measure()) return;
    trackPointer(true);
    draw(stillTime);
  };

  /* When the pause began, so the clock can skip the time spent paused. */
  let pausedAt = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (paused?.()) {
      if (!pausedAt) pausedAt = now;
      const w = width;
      const h = height;
      if (measure() && (width !== w || height !== h)) draw((pausedAt - start) / 1000);
      return;
    }
    if (pausedAt) {
      start += now - pausedAt;
      pausedAt = 0;
    }
    if (now - last < 1000 / (typeof fps === "function" ? fps() : fps)) return;
    last = now;
    if (!measure()) return;
    trackPointer(false);
    draw((now - start) / 1000);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    /* Whatever is in the buffer stops being trustworthy the moment we stop
       drawing into it, so `painted` is cleared as well: onPainted then
       fires again on the next real frame, and a caller can cross back and
       forth between the shader and its fallback as many times as the
       visitor scrolls. */
    if (painted) {
      painted = false;
      onIdle?.();
    }
  };

  const play = () => {
    if (dead || !visible || document.hidden) return;
    if (!started) {
      if (!setup()) return; // no WebGL at all — nothing to play
      init();
    }
    if (isStill()) {
      stop();
      drawStill();
      return;
    }
    if (raf) return;
    start = performance.now() - stillTime * 1000;
    pausedAt = 0;
    last = 0;
    /* Draw one frame synchronously before yielding. A surface that was
       parked off-screen and scrolled back into view then shows a real frame
       in the same compositor tick it reappears, rather than whatever the
       drawing buffer held (a stale or cleared frame) until the first rAF
       lands ~16ms later. */
    if (measure()) {
      trackPointer(false);
      draw((performance.now() - start) / 1000);
      last = performance.now();
    }
    raf = requestAnimationFrame(frame);
  };

  /* Off-screen is the common case: there is no reason to shade pixels
     nobody is looking at. */
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else stop();
    },
    { rootMargin }
  );
  io.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : play());
  document.addEventListener("visibilitychange", onVisibility);

  const ro = new ResizeObserver(() => {
    if (isStill()) drawStill();
  });
  ro.observe(canvas);

  /* The OS setting can change mid-visit; a visitor who asks for stillness
     while watching gets stillness. */
  const restart = () => {
    stop();
    play();
  };
  motionQuery.addEventListener("change", restart);

  /* A lost context is not an error state; it is the cue for whatever is
     underneath to come back. */
  const onContextLost = (e: Event) => {
    e.preventDefault();
    dead = true;
    stop();
    painted = false;
    onLost?.();
  };
  const onContextRestored = () => {
    dead = false;
    applyColors();
    width = height = 0;
    init();
    play();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  /* No eager `play()` here — the IntersectionObserver above fires its first
     callback shortly after `observe()`, and that's what actually starts
     things (or doesn't, if the canvas is nowhere near the viewport). */

  const teardown = () => {
    stop();
    io.disconnect();
    ro.disconnect();
    motionQuery.removeEventListener("change", restart);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    if (pointerRetained) releasePointer();
    onLost?.();
    if (gl) {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  };

  /* Animated surfaces pick up new state on their next frame anyway; a still
     one has to be told. */
  const invalidate = () => {
    if (visible && !dead && gl && isStill()) drawStill();
  };

  return Object.assign(teardown, { invalidate });
}

