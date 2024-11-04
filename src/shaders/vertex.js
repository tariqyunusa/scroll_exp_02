export const vertex = `
  varying vec2 vUv;
  uniform float progress;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Apply progress to position.y for vertical movement
    pos.xy += progress;

    // Transform position with model, view, and projection matrices
    vec3 vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
  }
`;
