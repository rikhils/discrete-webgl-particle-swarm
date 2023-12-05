#version 300 es

precision highp float;
precision highp int;

uniform sampler2D in_particles_1;
uniform sampler2D data_texture;

layout (location = 0) out vec4 error_texture;

in vec2 cc;

// Simulation parameters
uniform float dt, period, stim_start, stim_end, stim_mag;
uniform int num_beats, pre_beats, data_type;
uniform float h_init;
uniform float align_thresh;
uniform float sample_interval;

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

    // TODO: replace with uniform
    const float APD_thresh = 0.15;


    ivec2 tex_size = textureSize(in_particles_1, 0);
    ivec2 idx = ivec2(floor(cc * 0.5 * vec2(tex_size)));

    ivec2 data_tex_size = textureSize(data_texture,0);
    int num_data_points = data_tex_size.x;

    vec4 particles_1 = texelFetch(in_particles_1, idx, 0);
    vec4 particles_2 = texelFetch(in_particles_1, idx + ivec2(tex_size.x/2, 0), 0);

    float tin = particles_1.r;
    float tout = particles_1.g;
    float tclose = particles_1.b;
    float topen = particles_1.a;
    float vgate = particles_2.r;

    float v = 0.0;
    float h = h_init;
    float jin, jout, stim, stim_step, dv, dh;

    float compare_stride = round(sample_interval / dt);

    // TODO: should really be doing error such that we can always start at
    // 0.0. I'll update the curve error part to allow this later.
    float error = (data_type == 1) ? 0.0 : 10000000000.0;

    int data_index = 0;

    int start_comp = 0;
    bool first_upstroke = false;
    float saved_value = -1.0;

    float APD_start, APD_end;

    bool activated = false;

    // Run the simulation with the current swarm parameters
    for (int step_count = 1; step_count <= num_steps; ++step_count) {
        jin = h * v * v * (1.0 - v) / tin;
        jout = -v / tout;

        stim = 0.0;
        stim_step = mod(float(step_count), period/dt);
        if (stim_step < stim_dur/dt) {
            stim = stim_f(stim_step * dt);
        }

        dv = stim + jin + jout;
        dh = v < vgate ? (1.0 - h)/topen : -h/tclose;

        float prev_v = v;
        v += dv * dt;
        h += dh * dt;

        if(step_count > pre_pace_steps)
        {   
            //APD only mode
            if(data_type == 1)
            {
                if(!activated && v > APD_thresh)
                {
                    activated = true;
                    float x0 = float(step_count-1)*dt;
                    float x1 = float(step_count)*dt;

                    float y0 = prev_v;
                    float y1 = v;

                    // Linear interpolation of actual crossing of threshold
                    APD_start = (x0*(y1 - APD_thresh) + x1*(APD_thresh - y0)) / (y1-y0);
                }
                else if(activated && v < APD_thresh)
                {
                    activated = false;

                    float x0 = float(step_count-1)*dt;
                    float x1 = float(step_count)*dt;

                    float y0 = prev_v;
                    float y1 = v;

                    // Linear interpolation of actual crossing of threshold
                    APD_end = (x0*(y1 - APD_thresh) + x1*(APD_thresh - y0)) / (y1-y0);
                    float sim_APD = APD_end - APD_start;
                    float target_APD = texelFetch(data_texture, ivec2(data_index++, 0), 0).r;
                    error += (target_APD - sim_APD) * (target_APD - sim_APD);
                }
            }
            // Curve error only mode
            else
            {
                if (!first_align_upstroke && v > align_thresh)
                {
                    first_align_upstroke = true;
                    start_comp = step_count;
                    error = 0.0;
                }   
                // Measure curve error
                if (first_align_upstroke && mod(float(step_count - start_comp), compare_stride) == 0.0) {
                    float actual = texelFetch(data_texture, ivec2(data_index++, 0), 0).r;
                    error += (v - actual)*(v - actual);
                }
            }
        }

        if (float((step_count - pre_pace_steps) - 1) / float((num_steps - pre_pace_steps) - 1) <= cc.x) {
            saved_value = v;
        }
    }

    // TODO: We're not actually doing RMSE and never have been. This shouldn't
    // affect execution at all because we're only ever using error in
    // relative terms of "better" or "worse" and switching to RMSE shouldn't
    // change that. I'm still not making the change at present, because I
    // want to minimize the amount of things we need to debug at a time.

    // If we had missing activations to 2:1 blocking, I'm just adding the
    // missing APDs as raw error, since this is a very bad solution
    if(data_type == 1)
    {
        // While there are still leftover target APDs we never matched in the
        // simulation, add them as raw error.
        for(; data_index < num_data_points; data_index++)
        {
            float missing_APD = texelFetch(data_texture, ivec2(data_index, 0), 0).r;
            error += missing_APD*missing_APD;
        }
    }

    error_texture = vec4(error, saved_value, 0, 1.0/period);
}
