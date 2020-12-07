#version 300 es

precision highp float;
precision highp int;

uniform sampler2D positions_texture, velocities_texture;

layout (location = 0) out vec4 new_position;

in vec2 cc;

#define P0_POS positions.r
#define P1_POS positions.g
#define P2_POS positions.b
#define P3_POS positions.a

#define P0_VEL velocities.r
#define P1_VEL velocities.g
#define P2_VEL velocities.b
#define P3_VEL velocities.a

void main() {
    vec4 positions = texture(positions_texture, cc);
    vec4 velocities = texture(velocities_texture, cc);

    float new_p0 = P0_POS + P0_VEL;
    float new_p1 = P1_POS + P1_VEL;
    float new_p2 = P2_POS + P2_VEL;
    float new_p3 = P3_POS + P3_VEL;

    new_position = vec4(new_p0, new_p1, new_p2, new_p3);
}
