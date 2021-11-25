#version 300 es

precision highp float;
precision highp int;

in vec2 cc;

uniform sampler2D add_texture_1, add_texture_2;

layout (location = 0) out vec4 summed_texture;

#define A1_R_VAL add1.r
#define A1_G_VAL add1.g
#define A1_B_VAL add1.b
#define A1_A_VAL add1.a

#define A2_R_VAL add2.r
#define A2_G_VAL add2.g
#define A2_B_VAL add2.b
#define A2_A_VAL add2.a

void main() {

    vec4 add1 = texture(add_texture_1, cc);
    vec4 add2 = texture(add_texture_2, cc);

    float newR = A1_R_VAL + A2_R_VAL;

    float newG = A1_G_VAL + A2_G_VAL;

    float newB = A1_B_VAL + A2_B_VAL;

    float newA = A1_A_VAL + A2_A_VAL;


    summed_texture = vec4(newR, newG, newB, newA);
    // summed_texture = vec4(A1_R_VAL + A2_R_VAL, A1_G_VAL + A2_G_VAL, A1_B_VAL + A2_B_VAL, A1_A_VAL + A2_A_VAL);
    // summed_texture = vec4(16.0, 16.0, 16.0, 16.0);

}
