#version 300 es

precision highp int;
precision highp float;

uniform sampler2D original;

in vec2 cc;

layout (location = 0) out vec4 rounded;


#define in_0 original_vals.r
#define in_1 original_vals.g
#define in_2 original_vals.b
#define in_3 original_vals.a

#define fixed_mult 1000.0

void main() 
{
    // copy = texture(original, cc);
    original_vals = texture(original, cc);

    float fixed_0 = float(round(in_0 * fixed_mult))/fixed_mult;
    float fixed_1 = float(round(in_1 * fixed_mult))/fixed_mult;
    float fixed_2 = float(round(in_2 * fixed_mult))/fixed_mult;
    float fixed_3 = float(round(in_3 * fixed_mult))/fixed_mult;

    rounded = vec4(fixed_0,fixed_1,fixed_2,fixed_3);
}
