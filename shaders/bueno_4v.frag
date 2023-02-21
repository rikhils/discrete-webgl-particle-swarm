#version 300 es

precision highp float;
precision highp int;

uniform sampler2D in_particles_1, in_particles_2;
uniform sampler2D data_texture;

layout (location = 0) out vec4 error_texture;

in vec2 cc;

// Simulation parameters
uniform float dt, period, stim_start, stim_end, stim_mag;
uniform int num_beats, pre_beats;
uniform float v_init, w_init;
uniform float align_thresh;
uniform float sample_interval;

#define thwinf thw
#define thvinf thvm
#define thso thw
#define thsi thso

float stim_f(const float t) {
    const float stim_scale = 0.4;
    const float stim_dur = 10.0;
    const float offset_1 = 7.0;
    const float offset_2 = offset_1 * 0.96;
    const float t_scale = 0.725;
    float a = (t/t_scale - offset_2);

    return -stim_scale * (t / t_scale - offset_1) / (1.0 + a*a*a*a);
}

void main() {
    // PSO derived parameters
    int num_period = int(ceil(period/dt));
    int total_beats = pre_beats + num_beats;
    float endtime = ceil(float(total_beats)*period);
    float pre_pace_endtime = ceil(float(pre_beats)*period);
    int pre_pace_steps = int(ceil(pre_pace_endtime/dt));
    int num_steps = int(ceil(endtime/dt));

    const float stim_dur = 10.0;

    ivec2 tex_size = textureSize(in_particles_1, 0);
    ivec2 idx = ivec2(floor(cc * 0.5 * vec2(tex_size)));

    vec4 particles_1 = texelFetch(in_particles_1, idx, 0);
    vec4 particles_2 = texelFetch(in_particles_1, idx + ivec2(tex_size.x/2, 0), 0);
    vec4 particles_3 = texelFetch(in_particles_1, idx + ivec2(0, tex_size.y/2), 0);
    vec4 particles_4 = texelFetch(in_particles_1, idx + ivec2(tex_size.x/2, tex_size.y/2), 0);

    vec4 particles_5 = texelFetch(in_particles_2, idx, 0);
    vec4 particles_6 = texelFetch(in_particles_2, idx + ivec2(tex_size.x/2, 0), 0);
    vec4 particles_7 = texelFetch(in_particles_2, idx + ivec2(0, tex_size.y/2), 0);
    // vec4 particles_8 = texelFetch(in_particles_2, idx + ivec2(tex_size.x/2, tex_size.y/2), 0);






/* 
################################################################################
## Begin 4v params
################################################################################
*/
    float thv   = particles_1.r;
    float tv1m  = particles_1.g;
    float tv2m  = particles_1.b;     
    float tvp   = particles_1.a;

    float uwm   = particles_2.r;
    float tso1  = particles_2.g;
    float kso   = particles_2.b;
    float ts1   = particles_2.r;


    float ts2   = particles_3.r;
    float ks    = particles_3.g;
    float tw1m  = particles_3.b;
    float tw2m  = particles_3.a;


    float tw1p  = particles_4.r;
    float tw2p  = tw1p;
    float tfi   = particles_4.g;
    float to1   = particles_4.b;
    float to2   = particles_4.a;



    float tso2  = particles_5.r;
    float uso   = particles_5.g;
    float us   = particles_5.b;
    float tsi1  = particles_5.a;
    float tsi2  = tsi1;


    float thw   = particles_6.r;
    float thvm  = particles_6.g;
    float tho   = particles_6.b;
    float kwm   = particles_6.a;

    float twinf     = particles_7.r;
    float winfstar  = particles_7.g;
    float uu        = particles_7.b;

    float kwp   = 5.7;
    float wcp   = 0.15;
    float ksi   = 97.8;
    float sc    = 0.007;


/* 
################################################################################
## End 4v params
################################################################################
*/


    // Initialize values for the simulation
    float uo = 0.0;
    float u = 0.0;
    float v = 1.0;
    float w = 1.0;
    float s = 0.0;


    float uNew;

    float dv;
    float dw;
    float ds;

    float tvm;
    float ts;
    float to;
    float twp;
    float twm;
    float tso;
    float tsi;
    float vinf;
    float winf;

    float xfi;
    float xso;
    float xsi;

    float compare_stride = round(sample_interval / dt);

    float error = 10000000000.0;

    int data_index = 0;

    int start_comp = 0;
    bool first_upstroke = false;
    float saved_value = -1.0;

    // Run the simulation with the current swarm parameters
    for (int step_count = 1; step_count <= num_steps; ++step_count) {
      
/* 
################################################################################
## Begin 4v update
################################################################################
*/

        tvm     = (u >= thvm) ? tv2m : tv1m;
        ts      = (u >= thw) ? ts2 : ts1;
        to      = (u >= tho) ? to2 : to1;

        twp     = tw1p + (tw2p - tw1p) * (1.0+tanh((w-wcp)*kwp))/2.0;
        twm     = tw1m + (tw2m - tw1m) * (1.0+tanh((u-uwm)*kwm))/2.0;
        tso     = tso1 + (tso2 - tso1) * (1.0+tanh((u-uso)*kso))/2.0;
        tsi     = tsi1 + (tsi2 - tsi1) * (1.0+tanh((s-sc)*ksi))/2.0;
        

        vinf    = (u >= thvinf) ? 0.0 : 1.0;
        winf    = (u >= thwinf) ? winfstar : (1.0-u/twinf);

        // Gate Evolution
        dv      = (u >= thv) ? (-(v/tvp)) : ((vinf-v)/tvm);
        dw      = (u >= thw) ? (-(w/twp)) : ((winf-w)/twm);
        ds      = ((1.0+tanh((u-us)*ks))/2.0-s)/ts;


        v       += dt * dv;
        w       += dt * dw;
        s       += dt * ds;

        // Currents
        xfi     = (u >= thv) ? -v*(u-thv)*(uu-u)/tfi : 0.0;
        xso     = (u >= thso) ? 1.0/tso : (u-uo)/to;
        xsi     = (u >= thsi) ? -w*s/tsi : 0.0;

        // u = u - dt*(xfi + xso + xsi - istim);






        // Apply stimulus
        float stim = 0.0;
        float stim_step = mod(float(step_count), period/dt);
        if (stim_step < stim_dur/dt) {
            stim = stim_f(stim_step * dt);
        }

        u = u - dt*(xfi + xso + xsi - stim);


/* 
################################################################################
## End 4v update
################################################################################
*/

        if (step_count > pre_pace_steps && !first_upstroke && u > align_thresh) {
            first_upstroke = true;
            start_comp = step_count;
            error = 0.0;
        }



        // Measure error
        if (first_upstroke && mod(float(step_count - start_comp), compare_stride) == 0.0) {
            float actual = texelFetch(data_texture, ivec2(data_index++, 0), 0).r;
            error += (u - actual)*(u - actual);
        }

        if (float((step_count - pre_pace_steps) - 1) / float((num_steps - pre_pace_steps) - 1) <= cc.x) {
            saved_value = u;
        }
    }

    error_texture = vec4(error, saved_value, 0, 1.0/period);
}
