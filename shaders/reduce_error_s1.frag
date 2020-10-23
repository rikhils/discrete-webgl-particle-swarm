#version 300 es

precision highp float;
precision highp int;

in vec2 cc;

uniform sampler2D error_texture;

#define BIG_FLOAT 1.0e+10

layout (location = 0) out vec4 reduced_error_1;

void main() {
    ivec2 tex_size = textureSize(error_texture, 0);
    vec4 error_texel;

    float min_error = BIG_FLOAT;
    vec2 min_index;

    int i = int(floor(cc.x*float(tex_size.x)));
    for (int j = 0; j < tex_size.y; ++j) {
        error_texel = texelFetch(error_texture, ivec2(i,j), 0);

        if (error_texel.r < min_error) {
            min_error = error_texel.r;
            min_index = vec2(float(i), float(j));
        }
    }

    reduced_error_1 = vec4(min_error, min_index.x, min_index.y, 0);
}
