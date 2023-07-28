import "./style.stylus";
import { Bodies, Composite, Engine, Render, Runner, Sleeping } from "matter-js";

const engine = Engine.create({
    // positionIterations: 10,
    // velocityIterations: 10,
  }),
  width = innerHeight * 0.6,
  height = innerHeight,
  n = 15,
  h = width / 2 - n,
  render = Render.create({
    engine,
    canvas: document.querySelector("canvas")!,
    options: {
      width,
      height,
      wireframes: false,
      background: "black",
    },
  }),
  runner = Runner.create({
    delta: 500 / 60,
    isFixed: true,
  });

const s1 = Bodies.trapezoid(
    width / 2 - (2 / 3) * h - n,
    height / 2,
    height,
    h,
    1,
    {
      isStatic: true,
      angle: Math.PI / 2,
      render: { fillStyle: "white" },
    }
  ),
  s2 = Bodies.trapezoid(width / 2 + (2 / 3) * h + n, height / 2, height, h, 1, {
    isStatic: true,
    angle: -Math.PI / 2,
    render: { fillStyle: "white" },
  }),
  r1 = Bodies.rectangle(width / 2, 0, width, n + 1, { isStatic: true }),
  r2 = Bodies.rectangle(width / 2, height, width, n + 1, { isStatic: true }),
  circles = new Array(400).fill(0).map((_) =>
    Bodies.circle(width / 2, n * 2, n * 0.6, {
      slop: 0,
      render: {
        fillStyle: "white",
      },
      isSleeping: true,
    })
  );

Composite.add(engine.world, [s1, s2, r1, r2, ...circles]);

Render.run(render);

Runner.run(runner, engine);

function requestInterval(callback: () => boolean, milliseconds: number) {
  const interval = Math.floor((6 * milliseconds) / 100);
  let count = 0;
  function tick() {
    if (count++ >= interval) {
      count = 0;
      if (!callback()) return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

(() => {
  let i = 0;
  requestInterval(() => {
    Sleeping.set(circles[i++], false);
    return i <= circles.length - 1;
  }, 50);
})();

(() => {
  let lx = 0,
    ly = 0,
    lz = 0;
  const alpha = 0.8;

  requestInterval(() => {
    addEventListener(
      "devicemotion",
      (ev) => {
        const { x, y, z } = ev.accelerationIncludingGravity ?? {};
        if (x && y && z) {
          lx = alpha * x + (1 - alpha) * lx;
          ly = alpha * y + (1 - alpha) * ly;
          lz = alpha * z + (1 - alpha) * lz;
          engine.gravity = { x: -lx, y: Math.min(ly, lz), scale: 0.001 };
        }
      },
      { once: true }
    );
    return true;
  }, 50);
})();
