"use client";

import { useEffect, useRef, type RefObject } from "react";
import { mountShaderSurface } from "@/lib/shader-surface";

/*
  Where the tiebacks sit when the drape is fully drawn, as fractions of the
  frame: height from the floor, and distance in from each wing.
*/
const TIE_Y = 0.34;
const TIE_X = 0.075;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** How far open the cloth is at height y (0 floor .. 1 grid): the tieback lines pull from the tie, and the swag above follows. */
export function openAt(y: number, open: number) {
  return smooth(0, 1, open * 1.25 - Math.max(0, y - TIE_Y) * 0.35);
}

/**
 * The leading edge of the left half at height y, as a fraction of the frame's
 * width (0.5 closed). The right half mirrors it. Above the tie the cloth swags
 * up to meet its partner at the grid, which is what draws the arch; below the
 * tie it bells out a little on its way to the floor.
 */
export function edgeAt(y: number, open: number) {
  const s = Math.min(1, Math.max(0, (y - TIE_Y) / (1 - TIE_Y)));
  const drawn = y > TIE_Y ? TIE_X + (0.5 - TIE_X) * s ** 2.6 : TIE_X + 0.03 * smooth(TIE_Y, 0, y);
  return 0.5 + (drawn - 0.5) * openAt(y, open);
}

/**
 * The silk drape from the Iris catalogue — backlit silk in one amber ramp,
 * deep umber at the grid thinning to pale gold at the floor, folds parting
 * toward the pointer — hung as a pair of stage curtains.
 *
 * `u_open` draws the two halves back to their tiebacks. Each half's cloth is
 * remapped into the space it has left, so the folds bunch and deepen as it
 * gathers and fan out along the arch, and the opening between them is
 * transparent: whatever sits behind the drape shows through, with the shadow
 * the cloth throws on it.
 */
const FRAG = `
uniform vec2  u_res;
uniform float u_time;
uniform float u_scale;
uniform vec3  u_pointer;  /* x, y (0 bottom .. 1 top), presence 0..1 */

uniform vec3 u_deep;    /* --color-silk-950, the grid */
uniform vec3 u_umber;   /* --color-silk-800, upper-mid */
uniform vec3 u_gold;    /* --color-silk-600, lower-mid */
uniform vec3 u_pale;    /* --color-silk-300, the floor */

uniform vec4  u_readA;
uniform float u_guard;
uniform float u_open;

const float FOLDS   = 6.0;
const float THREADS = 22.0;
const float PI      = 3.14159265;
const float TIE_Y   = ${TIE_Y.toFixed(3)};
const float TIE_X   = ${TIE_X.toFixed(3)};

float openAt(float y) {
  return smoothstep(0.0, 1.0, clamp(u_open * 1.25 - max(0.0, y - TIE_Y) * 0.35, 0.0, 1.0));
}

float edgeAt(float y) {
  float s = clamp((y - TIE_Y) / (1.0 - TIE_Y), 0.0, 1.0);
  float drawn = y > TIE_Y ? TIE_X + (0.5 - TIE_X) * pow(s, 2.6)
                          : TIE_X + 0.03 * smoothstep(TIE_Y, 0.0, y);
  return mix(0.5, drawn, openAt(y));
}

void main() {
  vec2 res = u_res / u_scale;
  vec2 uv  = gl_FragCoord.xy / u_scale / res;          /* 0..1, y up */
  float aspect = res.x / res.y;

  bool  left = uv.x < 0.5;
  float d    = left ? uv.x : 1.0 - uv.x;               /* distance in from this half's wing */
  float e    = max(edgeAt(uv.y), 1e-3);
  float gapPx = (d - e) * res.x;                       /* > 0 in the opening */
  /* closed, the two halves are one sheet: no half-covered pixel down the
     middle, which on an odd-width canvas would let the page show through */
  float cover = u_open <= 0.0 ? 1.0 : clamp(0.5 - gapPx, 0.0, 1.0);

  /* the shadow the cloth throws on whatever is behind it */
  float shade = (1.0 - smoothstep(0.0, 0.055 * res.x, gapPx)) * 0.5 * clamp(u_open * 6.0, 0.0, 1.0);

  if (cover <= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, shade);
    return;
  }

  /* where this pixel sits in the cloth: 0 at the wing, 0.5 at the leading
     edge. Closed, that is just uv.x; drawn, the same cloth fits a narrower
     band, so every fold in it bunches up. */
  float m  = 0.5 * min(d / e, 1.0);
  float mx = left ? m : 1.0 - m;
  float squeeze = 0.5 / e;
  float bunch = smoothstep(1.2, 5.0, squeeze);

  vec2 P = (vec2(mx, uv.y) - 0.5) * vec2(aspect, 1.0);
  vec2 S = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 ptr = (u_pointer.xy - 0.5) * vec2(aspect, 1.0);
  vec2 toP = S - ptr;
  float dP = length(toP);
  float pull = u_pointer.z * exp(-dP * dP * 50.0);

  /* the touch parts the drapery: folds near the cursor bend toward it */
  vec2 wp = P - toP * pull * 1.1 / vec2(squeeze, 1.0);

  float warp  = fbm(vec2(wp.x * 1.4, wp.y * 0.8 + u_time * 0.02)) * 0.30;
  float phase = wp.x * FOLDS + warp + u_time * 0.035;

  /* the fine thread count blurs out as the cloth gathers, or it would alias */
  float fineW  = 0.28 / squeeze;
  float coarse = sin(phase * PI);
  float fine   = sin((wp.x * THREADS + warp * 1.6) * PI);
  float drape  = clamp(coarse * (1.0 - fineW) + fine * fineW, -1.0, 1.0);
  drape = sign(drape) * pow(abs(drape), 0.82);

  /* ---- the vertical gradient, warm at the grid, pale at the floor ---- */
  vec3 base = u_pale;
  base = mix(base, u_gold,  smoothstep(0.10, 0.52, uv.y));
  base = mix(base, u_umber, smoothstep(0.42, 0.80, uv.y));
  base = mix(base, u_deep,  smoothstep(0.70, 1.05, uv.y));

  /* gathered cloth folds deeper: darker valleys, nearly the same crests */
  float lo = mix(0.58, 0.32, bunch);
  float hi = mix(1.20, 1.10, bunch);
  vec3 col = base * (lo + (hi - lo) * (0.5 + 0.5 * drape));

  /* the hem: the cut edge turns away into shadow, and the roll just
     inside it catches the light */
  float hemPx = (e - d) * res.x;
  /* only once the halves part: hung closed, the drape reads as one sheet */
  col *= mix(1.0, mix(0.5, 1.0, smoothstep(0.0, 7.0, hemPx)), clamp(u_open * 8.0, 0.0, 1.0));
  col += base * 0.16 * exp(-pow((hemPx - 9.0) / 4.0, 2.0)) * clamp(u_open * 8.0, 0.0, 1.0);

  /* the touch: a soft warm bloom, and the nearest folds catch extra light */
  col += u_pale * pull * 0.42;
  col += base   * pull * (0.5 + 0.5 * drape) * 0.5;

  /* the tieback: a gold cord around the gathered cloth, and the pinch it makes */
  float tie = smoothstep(0.6, 0.95, u_open);
  float ty  = (uv.y - TIE_Y) * res.y;
  float cord = 1.0 - smoothstep(3.0, 4.6, abs(ty));
  float twist = 0.62 + 0.38 * sin(uv.x * res.x * 0.9 + ty * 1.6);
  col *= 1.0 - tie * 0.45 * exp(-pow((ty + 9.0) / 6.0, 2.0));
  col = mix(col, u_pale * twist, cord * tie);

  col = max(col, 0.0);

  /* ---- the reading guard: the copy printed on the closed drape ---- */
  vec2 rd = abs(uv - u_readA.xy) / max(u_readA.zw, vec2(0.02));
  float rm = mix(max(rd.x, rd.y), length(rd), 0.4);
  float band = 1.0 - smoothstep(0.72, 2.1, rm);
  col = mix(col, holdUnder(col, 0.07), band * u_guard);

  col += (bayer8(gl_FragCoord.xy) - 0.5) * (2.2 / 255.0);

  /* premultiplied: the cloth, and its shadow where it thins to nothing */
  float a = cover + (1.0 - cover) * shade;
  gl_FragColor = vec4(col * cover, a);
}
`;

export interface DrapeProps {
  /** 0 closed .. 1 drawn back to the tiebacks. Read every frame. */
  openRef: RefObject<number>;
  /** Receives a function that redraws the still frame, for reduced motion. */
  invalidateRef?: RefObject<(() => void) | null>;
  /** While true, the drape holds its frame and stops shading (it has flown out of sight). */
  pausedRef?: RefObject<boolean>;
  /** The block the reading guard keeps readable while the drape is closed. */
  guardSelector?: string | null;
  className?: string;
}

export function Drape({ openRef, invalidateRef, pausedRef, guardSelector = null, className }: DrapeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const guardOn = guardSelector != null;
    let guardEl: Element | null | undefined;
    let lastOpen = -1;
    let lastTop = NaN;
    let movedAt = 0;

    const surface = mountShaderSurface(canvas, {
      fragment: FRAG,
      colors: {
        u_deep: "--color-silk-950",
        u_umber: "--color-silk-800",
        u_gold: "--color-silk-600",
        u_pale: "--color-silk-300",
      },
      uniforms: ["u_readA", "u_guard", "u_open"],
      alpha: true,
      paused: () => pausedRef?.current ?? false,
      /* Full rate while the curtain is moving (drawing back, or travelling across the screen), so it tracks the scroll; half rate while it only breathes. */
      fps: () => (performance.now() - movedAt < 400 ? 60 : 30),
      onInit: (gl, u) => {
        if (u.u_readA) gl.uniform4f(u.u_readA, 0.5, 0.5, 0.3, 0.2);
      },
      onFrame: (gl, u, s) => {
        const o = openRef.current ?? 0;
        if (o !== lastOpen || s.rect.top !== lastTop) {
          lastOpen = o;
          lastTop = s.rect.top;
          movedAt = performance.now();
        }
        gl.uniform1f(u.u_open, o);
        if (!u.u_readA || !u.u_guard) return;
        let guard = 0;
        if (guardOn) {
          if (guardEl === undefined) guardEl = document.querySelector(guardSelector as string);
          const { rect } = s;
          if (guardEl && rect.width > 0 && rect.height > 0) {
            const r = guardEl.getBoundingClientRect();
            const cx = (r.left + r.width / 2 - rect.left) / rect.width;
            const cy = 1 - (r.top + r.height / 2 - rect.top) / rect.height;
            const hw = (r.width / 2 + rect.width * 0.05) / rect.width;
            const hh = (r.height / 2 + rect.height * 0.07) / rect.height;
            gl.uniform4f(u.u_readA, cx, cy, hw, hh);
            guard = Math.max(0, 1 - o * 4);
          }
        }
        gl.uniform1f(u.u_guard, guard);
      },
      onPainted: () => wrap.setAttribute("data-shader", "on"),
      onLost: () => wrap.removeAttribute("data-shader"),
      maxPixels: 2_000_000,
      dprCap: 1.5,
    });

    if (invalidateRef) invalidateRef.current = surface.invalidate;
    return () => {
      if (invalidateRef) invalidateRef.current = null;
      surface();
    };
  }, [openRef, invalidateRef, pausedRef, guardSelector]);

  return (
    <div ref={wrapRef} className={`group/drape pointer-events-none absolute inset-0 overflow-hidden${className ? ` ${className}` : ""}`} aria-hidden="true">
      {/* No WebGL: two flat halves that still draw back with the scroll (--open, set by the scene). */}
      <div className="drape-floor absolute inset-y-0 left-0 transition-opacity duration-500 group-data-[shader=on]/drape:opacity-0" style={{ width: "calc(50% + 1px - var(--open, 0) * 42.5%)" }} />
      <div className="drape-floor absolute inset-y-0 right-0 transition-opacity duration-500 group-data-[shader=on]/drape:opacity-0" style={{ width: "calc(50% - var(--open, 0) * 42.5%)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 group-data-[shader=on]/drape:opacity-100" />
    </div>
  );
}
