#version 300 es

precision highp float;
precision highp int;
precision highp isampler2D ;
precision highp usampler2D ;

uniform usampler2D  src_texture;

layout (location = 0) out uvec4 dest_texture;

in vec2 cc;

#define IN_VAL_0 input_vals.r
#define IN_VAL_1 input_vals.g
#define IN_VAL_2 input_vals.b
#define IN_VAL_3 input_vals.a


void main()
{
	uvec4 input_vals = texture(src_texture, cc);

	dest_texture = uvec4(IN_VAL_0, IN_VAL_1, IN_VAL_2, IN_VAL_3);
	// dest_texture = uvec4(input_vals);
}
