#version 300 es

precision highp float;
precision highp int;

in vec2 position;

void main() {
    gl_Position = vec4(position, 0.1, 1.0);
}
