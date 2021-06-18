#version 300 es

precision highp float;
precision highp int;

uniform int num_points;
uniform float min_val, max_val;

in vec2 position;

void main() {
    // Position along x-axis of graph
    float pos_x = 1.98 * position.x / float(num_points - 1) - 0.99;
    // Position along y-axis of graph
    float pos_y = 1.98 * (position.y - min_val) / (max_val - min_val) - 0.99;

    gl_Position = vec4(pos_x, pos_y, 0.0, 1.0);
}
