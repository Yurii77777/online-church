varying vec2 vUv;
varying float vLife;
uniform float uTime;

void main() {
  // Distance from center
  float d = length(vUv - vec2(0.5));

  // Flame color gradient: white core → yellow → orange → transparent
  vec3 coreColor = vec3(1.0, 0.95, 0.8);
  vec3 midColor = vec3(1.0, 0.7, 0.1);
  vec3 outerColor = vec3(1.0, 0.3, 0.0);

  float t = smoothstep(0.0, 0.5, d);
  vec3 color = mix(coreColor, midColor, t);
  color = mix(color, outerColor, smoothstep(0.3, 0.6, d));

  // Alpha: fade at edges and top
  float alpha = 1.0 - smoothstep(0.2, 0.5, d);
  alpha *= 1.0 - smoothstep(0.5, 1.0, vUv.y);

  // Flicker
  float flicker = 0.9 + 0.1 * sin(uTime * 8.0 + vUv.y * 6.0);
  alpha *= flicker;

  gl_FragColor = vec4(color, alpha * 0.85);
}
