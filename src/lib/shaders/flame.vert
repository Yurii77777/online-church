varying vec2 vUv;
varying float vLife;
uniform float uTime;

void main() {
  vUv = uv;

  vec3 pos = position;

  // Oscillation — sway the flame
  float sway = sin(uTime * 3.0 + pos.y * 4.0) * 0.04 * pos.y;
  pos.x += sway;
  pos.z += cos(uTime * 2.5 + pos.y * 3.0) * 0.02 * pos.y;

  // Taper toward top
  float taper = 1.0 - smoothstep(0.0, 1.0, pos.y * 0.8);
  pos.x *= taper;
  pos.z *= taper;

  vLife = pos.y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
