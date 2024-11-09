export const fragment = `
varying vec2 vUv;
uniform vec3 color;

void main() {
    
    gl_FragColor = vec4(color, 1.0); 
}
`;
