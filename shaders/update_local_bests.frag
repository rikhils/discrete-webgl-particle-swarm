#version 300 es

precision highp float;
precision highp int;

uniform sampler2D local_bests_texture, local_bests_error_texture, cur_vals_texture, cur_error_texture;

layout (location = 0) out vec4 new_local_best;
layout (location = 1) out vec4 new_local_best_error;

in vec2 cc;

#define D0_BEST_VAL local_bests.r
#define D1_BEST_VAL local_bests.g
#define D2_BEST_VAL local_bests.b
#define D3_BEST_VAL local_bests.a

#define D0_CUR_VAL cur_vals.r
#define D1_CUR_VAL cur_vals.g
#define D2_CUR_VAL cur_vals.b
#define D3_CUR_VAL cur_vals.a



#define REAL_CUR_ERR_VAL cur_error_v.r
#define REAL_LOCAL_ERR_VAL local_best_error_v.r


void main() {
    vec4 local_bests	= texture(local_bests_texture, cc);
    vec4 cur_error_v	= texture(cur_error_texture, cc);
    vec4 local_best_error_v	= texture(local_bests_error_texture, cc);
    vec4 cur_vals		= texture(cur_vals_texture, cc);

    
    float cur_error = REAL_CUR_ERR_VAL;
    float local_best_error = REAL_LOCAL_ERR_VAL;


    if(cur_error < local_best_error)
    {
    	new_local_best			= vec4(D0_CUR_VAL, D1_CUR_VAL, D2_CUR_VAL, D3_CUR_VAL);
    	new_local_best_error	= vec4(cur_error);
    }
    else
    {
    	new_local_best			= vec4(D0_BEST_VAL, D1_BEST_VAL, D2_BEST_VAL, D3_BEST_VAL);
    	new_local_best_error	= vec4(local_best_error);
    }
}
