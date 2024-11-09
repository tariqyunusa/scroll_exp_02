export const fragment = `
varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
    vec4 tex = texture2D(uTexture, vUv);
    gl_FragColor = tex; 
}
`;
