#version 300 es

precision highp float;
precision highp int;

layout (location = 0) out vec4 simulation_texture;

in vec2 cc;

uniform float dt, period, stim_start, stim_end, stim_mag;
uniform int num_beats;
uniform float v_init, w_init;
uniform float align_thresh;
uniform float sample_interval;

uniform float TR_POS, TSI_POS, TWP_POS, TD_POS,
    TVP_POS, TV1M_POS, TV2M_POS, TWM_POS,
    TO_POS, XK_POS, UCSI_POS, UC_POS,
    UV_POS;


float stim_f(const float t)
{
    const float stim_scale = 0.4;
    const float stim_dur = 10.0;
    const float offset_1 = 7.0;
    const float offset_2 = offset_1 * 0.96;
    const float t_scale = 0.725;

    // return ( -stim_scale * ( t / t_scale - offset_1) / pow(1.0 + (t/t_scale - offset_2) , 4.0) );
    return ( -stim_scale * ( t / t_scale - offset_1) / (1.0 + pow((t/t_scale - offset_2) , 4.0) ) );
}

#define nx 10

void main() {
    // PSO derived parameters
    int num_period = int(ceil(period/dt));
    float endtime = ceil(float(num_beats)*period);
    int num_steps = int(ceil(endtime/dt));

    const float stim_dur = 10.0;

    float dx = 0.025;
    float D = 0.0011/(dx * dx);

    // Initialize values for the simulation
    float [nx] u, v, w, diff;
    for (int i = 0; i < nx; ++i) {
        u[i] = 0.0;
        v[i] = v_init;
        w[i] = w_init;
        diff[i] = 0.0;
    }

    float compare_stride = round(sample_interval / dt);

    float error = 0.0;

    int data_index = 0;

    int start_comp = 0;
    bool first_upstroke = false;
    float last_aligned_u = -1.0;

    if (cc.x == 0.0) {
        simulation_texture = vec4(u[nx/2], 0.0, 0.0, 0.0);
        return;
    }

    // Run the simulation with the current swarm parameters
    for (int step_count = 1; step_count <= num_steps; ++step_count) {
        for (int ix = 0; ix < nx; ++ix) {
            float p = u[ix] >= UC_POS ? 1.0 : 0.0;
            float q = u[ix] >= UV_POS ? 1.0 : 0.0;

            float dv =
                // p false
                (1.0 - p)*(1.0 - v[ix]) / (
                    // q false
                    (1.0 - q)*TV1M_POS
                    // q true
                    + q*TV2M_POS
                    )
                // p true
                - p*(v[ix]/TVP_POS);

            float dw =
                // p false
                (1.0-p)*(1.0-w[ix]) / TWM_POS
                // p true
                - p*(w[ix]/TWP_POS);

            v[ix] += dt*dv;
            w[ix] += dt*dw;

            float jfi =
                // p true
                p * -v[ix] * (u[ix] - UC_POS)*(1.0-u[ix])/TD_POS;

            float jso =
                // p false
                (1.0 - p)*u[ix] / TO_POS
                // p true
                + p/TR_POS;

            float jsi = -w[ix] * (1.0 + tanh(XK_POS * (u[ix]-UCSI_POS))) / (2.0 * TSI_POS);

            // Apply stimulus
            // float stim = 0.0;
            // if (mod(float(step_count), period/dt) > stim_start/dt && mod(float(step_count), period/dt) < stim_end/dt) {
            //     stim = stim_mag;
            // }

            float stim = 0.0;
            float stim_step = mod(float(step_count), period/dt);
            if(ix < 2 && stim_step < stim_dur/dt)
            {
                stim = stim_f(stim_step * dt);
            }

            diff[ix] = stim - jfi - jso - jsi;
            if (nx > 1) {
                diff[ix] -= D * 2.0 * u[ix];

                if (ix == 0) {
                    diff[ix] += D * 2.0 * u[ix+1];
                } else if (ix == nx) {
                    diff[ix] += D * 2.0 * u[ix-1];
                } else {
                    diff[ix] += D * (u[ix+1] + u[ix-1]);
                }
            }
        }

        for (int i = 0; i < nx; ++i) {
            u[i] += dt * diff[i];
        }

        if(!first_upstroke && u[nx/2] > align_thresh)
        {
            first_upstroke = true;
            start_comp = step_count;
            error = 0.0;

        }

        if (first_upstroke && mod(float(step_count - start_comp), compare_stride) == 0.0) {
            last_aligned_u = u[nx/2];
        }


        if (float(step_count - 1) / float(num_steps - 1) >= cc.x) {
            break;
        }
    }

    simulation_texture = vec4(last_aligned_u, 0, 0, 0);
    // simulation_texture = vec4(u, 0, 0, 0);
}
