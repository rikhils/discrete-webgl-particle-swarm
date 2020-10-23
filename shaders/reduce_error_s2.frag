#version 300 es

precision highp float;
precision highp int;

in vec2 cc;

uniform sampler2D reduced_error_1;

#define BIG_FLOAT 1.0e+10

layout (location = 0) out vec4 reduced_error_2;

void main() {
    ivec2 tex_size = textureSize(reduced_error_1, 0);
    vec4 error_texel;

    float min_error = BIG_FLOAT;
    vec2 min_index;

    for (int i = 0; i < tex_size.x; ++i) {
        error_texel = texelFetch(reduced_error_1, ivec2(i,0), 0);

        if (error_texel.r < min_error) {
            min_error = error_texel.r;
            min_index = vec2(error_texel.g, error_texel.b);
        }
    }

    reduced_error_2 = vec4(min_error, min_index.x, min_index.y, 0);
}
