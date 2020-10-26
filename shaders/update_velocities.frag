#version 300 es

precision highp float;
precision highp int;

uniform sampler2D positions_texture, velocities_texture, bests_texture;

layout (location = 0) out vec4 new_velocity;

in vec2 cc;

uniform float omega, r_local, r_global, phi_local, phi_global;
uniform vec4 global_best;

#define P0_POS positions.r
#define P1_POS positions.g
#define P2_POS positions.b
#define P3_POS positions.a

#define P0_VEL velocities.r
#define P1_VEL velocities.g
#define P2_VEL velocities.b
#define P3_VEL velocities.a

#define P0_BEST bests.r
#define P1_BEST bests.g
#define P2_BEST bests.b
#define P3_BEST bests.a

#define P0_GLOBAL_BEST global_best.r
#define P1_GLOBAL_BEST global_best.g
#define P2_GLOBAL_BEST global_best.b
#define P3_GLOBAL_BEST global_best.a

void main() {
    vec4 positions = texture(positions_texture, cc);
    vec4 velocities = texture(velocities_texture, cc);
    vec4 bests = texture(bests_texture, cc);

    float new_p0 = omega * P0_VEL
        + phi_local * r_local * (P0_BEST - P0_POS)
        + phi_global * r_global * (P0_GLOBAL_BEST - P0_POS);

    float new_p1 = omega * P1_VEL
        + phi_local * r_local * (P1_BEST - P1_POS)
        + phi_global * r_global * (P1_GLOBAL_BEST - P1_POS);

    float new_p2 = omega * P2_VEL
        + phi_local * r_local * (P2_BEST - P2_POS)
        + phi_global * r_global * (P2_GLOBAL_BEST - P2_POS);

    float new_p3 = omega * P3_VEL
        + phi_local * r_local * (P3_BEST - P3_POS)
        + phi_global * r_global * (P3_GLOBAL_BEST - P3_POS);

    new_velocity = vec4(new_p0, new_p1, new_p2, new_p3);
}
