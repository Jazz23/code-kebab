"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK_STORAGE_KEY = "code-kebab:webgl-fallback-until";
const FALLBACK_TTL_MS = 1000 * 60 * 60 * 24;
const FRAME_PROBE_COUNT = 24;
const SLOW_AVERAGE_FRAME_MS = 30;
const SLOW_FRAME_MS = 90;
const TARGET_FRAME_MS = 1000 / 30;
const SOFTWARE_RENDERER_PATTERNS = [
  "swiftshader",
  "llvmpipe",
  "software",
  "microsoft basic",
  "mesa offscreen",
];

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;

#define TAU 6.28318530718

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = mat2(1.62, 1.18, -1.18, 1.62) * p + 8.4;
    a *= 0.5;
  }
  return v;
}

float lineSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;
  vec2 mouse = (u_mouse - 0.5) * vec2(0.18, -0.12);
  float t = u_time;

  vec3 ink = vec3(0.04, 0.05, 0.055);
  vec3 smoke = vec3(0.11, 0.12, 0.13);
  vec3 deep = vec3(0.025, 0.03, 0.035);
  vec3 col = mix(ink, deep, smoothstep(-0.35, 0.9, p.y));
  col = mix(col, smoke, 0.18 + 0.12 * sin(p.x * 2.4 - p.y * 1.5));

  float n1 = fbm(p * 1.55 + vec2(t * 0.035, -t * 0.018) + mouse);
  float n2 = fbm(p * 2.45 + vec2(-t * 0.028, t * 0.025) - mouse * 0.6);
  float ribbonA = smoothstep(0.56, 0.92, n1 + p.y * 0.28);
  float ribbonB = smoothstep(0.6, 0.96, n2 - p.y * 0.16);
  vec3 green = vec3(0.13, 0.76, 0.41);
  vec3 tomato = vec3(0.88, 0.19, 0.18);
  vec3 amber = vec3(1.0, 0.54, 0.12);
  vec3 parchment = vec3(0.95, 0.9, 0.82);

  col += amber * ribbonA * 0.14;
  col += tomato * ribbonB * 0.11;
  col += green * pow(max(ribbonA - ribbonB, 0.0), 1.6) * 0.1;

  float nodeGlow = 0.0;
  float edgeGlow = 0.0;
  for (int i = 0; i < 20; i++) {
    float fi = float(i);
    vec2 base = vec2(hash(vec2(fi, 2.0)), hash(vec2(fi, 8.0)));
    vec2 q = (base - 0.5) * vec2(u_res.x / u_res.y, 1.0);
    q += vec2(
      sin(t * (0.16 + hash(base) * 0.22) + fi) * 0.08,
      cos(t * (0.13 + hash(base + 1.7) * 0.2) + fi * 1.4) * 0.06
    );

    float d = length(p - q);
    float pulse = 0.72 + 0.28 * sin(t * 1.8 + fi * 0.9);
    nodeGlow += exp(-d * 70.0) * pulse;
    nodeGlow += exp(-d * d * 6800.0) * 1.6;

    vec2 r = vec2(hash(vec2(fi + 4.0, 5.0)), hash(vec2(fi + 9.0, 1.0)));
    r = (r - 0.5) * vec2(u_res.x / u_res.y, 1.0);
    r += vec2(sin(t * 0.18 + fi * 0.7) * 0.05, cos(t * 0.16 + fi) * 0.05);
    float e = lineSegment(p, q, r);
    edgeGlow += exp(-e * 95.0) * 0.025;
  }

  vec3 networkColor = mix(amber, green, 0.42 + 0.22 * sin(t * 0.5));
  col += networkColor * edgeGlow;
  col += mix(amber, tomato, 0.45 + 0.35 * sin(t * 0.35)) * nodeGlow * 0.06;

  float ring = abs(length(p - mouse * 0.45) - (0.34 + sin(t * 0.45) * 0.025));
  col += amber * exp(-ring * 70.0) * 0.03;
  float ring2 = abs(length(p + mouse * 0.25) - (0.58 + cos(t * 0.32) * 0.035));
  col += green * exp(-ring2 * 60.0) * 0.024;

  float stars = 0.0;
  for (int s = 0; s < 3; s++) {
    float fs = float(s);
    vec2 suv = uv * (180.0 + fs * 130.0);
    vec2 id = floor(suv);
    vec2 gv = fract(suv) - 0.5;
    float h = hash(id + fs * 71.0);
    float sparkle = smoothstep(0.025, 0.0, length(gv)) * step(0.985, h);
    stars += sparkle * (0.45 + 0.55 * sin(t * (1.0 + h * 2.0) + h * TAU));
  }
  col += parchment * stars * smoothstep(-0.2, 0.6, p.y);

  float grain = hash(gl_FragCoord.xy + fract(t * 19.0) * 170.0) - 0.5;
  float vignette = smoothstep(1.25, 0.18, length((uv - 0.5) * vec2(1.18, 1.0)));
  col *= 0.72 + vignette * 0.55;
  col += grain * 0.018;

  gl_FragColor = vec4(col, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vert = createShader(gl, gl.VERTEX_SHADER, VERT);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function hasTemporaryFallback() {
  try {
    const fallbackUntil = Number(localStorage.getItem(FALLBACK_STORAGE_KEY));
    if (!Number.isFinite(fallbackUntil)) return false;
    if (fallbackUntil <= Date.now()) {
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function rememberTemporaryFallback() {
  try {
    localStorage.setItem(
      FALLBACK_STORAGE_KEY,
      String(Date.now() + FALLBACK_TTL_MS),
    );
  } catch {
    // Storage can be unavailable in private contexts; the in-session fallback still applies.
  }
}

function shouldPreferStaticBackground() {
  if (hasTemporaryFallback()) return true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) return true;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };

  if (nav.connection?.saveData) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return true;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true;

  return false;
}

function isSoftwareRenderer(gl: WebGLRenderingContext) {
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (!debugInfo) return false;

  const renderer = String(
    gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "",
  ).toLowerCase();

  return SOFTWARE_RENDERER_PATTERNS.some((pattern) =>
    renderer.includes(pattern),
  );
}

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    if (shouldPreferStaticBackground()) {
      setIsStatic(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "default",
      stencil: false,
    });
    if (!gl) {
      setIsStatic(true);
      return;
    }

    if (isSoftwareRenderer(gl)) {
      rememberTemporaryFallback();
      setIsStatic(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const program = createProgram(gl);
    if (!program) {
      window.removeEventListener("resize", resize);
      setIsStatic(true);
      return;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      window.removeEventListener("resize", resize);
      setIsStatic(true);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const activateProgram = WebGLRenderingContext.prototype.useProgram.bind(gl);
    const mouse = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };

    const handleMouse = (event: MouseEvent) => {
      mouse.x = event.clientX / width;
      mouse.y = 1 - event.clientY / height;
    };
    window.addEventListener("mousemove", handleMouse);

    let frame = 0;
    let shouldRender = true;
    let lastDraw = 0;
    let lastFrameTime = performance.now();
    let slowFrameCount = 0;
    let sampledFrames = 0;
    let totalFrameTime = 0;
    const start = performance.now();
    const detach = () => {
      shouldRender = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
    const switchToStatic = () => {
      rememberTemporaryFallback();
      detach();
      setIsStatic(true);
    };
    const render = (now: number) => {
      if (!shouldRender) return;

      const frameTime = now - lastFrameTime;
      lastFrameTime = now;
      if (sampledFrames < FRAME_PROBE_COUNT) {
        sampledFrames += 1;
        totalFrameTime += frameTime;
        if (frameTime > SLOW_FRAME_MS) slowFrameCount += 1;

        const averageFrameTime = totalFrameTime / sampledFrames;
        if (
          sampledFrames >= 8 &&
          (averageFrameTime > SLOW_AVERAGE_FRAME_MS || slowFrameCount >= 2)
        ) {
          switchToStatic();
          return;
        }
      }

      if (now - lastDraw < TARGET_FRAME_MS) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastDraw = now;

      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.035;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.035;

      activateProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, smoothMouse.x, smoothMouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      detach();
    };
  }, []);

  if (isStatic) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-screen w-screen pointer-events-none"
    />
  );
}
