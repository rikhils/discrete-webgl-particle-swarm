#version 300 es

precision highp float;
precision highp int;

layout (location = 0) out vec4 simulation_texture;

in vec2 cc;

uniform float dt, period, stim_start, stim_end, stim_mag;
uniform int num_beats;
uniform float v_init, w_init;
uniform float align_thresh;
uniform float sample_rate;

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

void main() {
    // PSO derived parameters
    int num_period = int(ceil(period/dt));
    float endtime = ceil(float(num_beats)*period);
    int num_steps = int(ceil(endtime/dt));

    const float stim_dur = 10.0;

    // Initialize values for the simulation
    float u = 0.0;
    float v = v_init;
    float w = w_init;

    float compare_stride = round(sample_rate / dt);

    float error = 0.0;

    int data_index = 0;

    int start_comp = 0;
    bool first_upstroke = false;
    float last_aligned_u = -1.0;

    if (cc.x == 0.0) {
        simulation_texture = vec4(u, 0, 0, 0);
        return;
    }

    // Run the simulation with the current swarm parameters
    for (int step_count = 1; step_count <= num_steps; ++step_count) {
        float p = u >= UC_POS ? 1.0 : 0.0;
        float q = u >= UV_POS ? 1.0 : 0.0;

        float dv =
            // p false
            (1.0 - p)*(1.0 - v) / (
                // q false
                (1.0 - q)*TV1M_POS
                // q true
                + q*TV2M_POS
                )
            // p true
            - p*(v/TVP_POS);

        float dw =
            // p false
            (1.0-p)*(1.0-w) / TWM_POS
            // p true
            - p*(w/TWP_POS);

        v += dt*dv;
        w += dt*dw;

        float jfi =
            // p true
            p * -v * (u - UC_POS)*(1.0-u)/TD_POS;

        float jso =
            // p false
            (1.0 - p)*u / TO_POS
            // p true
            + p/TR_POS;

        float jsi = -w * (1.0 + tanh(XK_POS * (u-UCSI_POS))) / (2.0 * TSI_POS);

        // Apply stimulus
        // float stim = 0.0;
        // if (mod(float(step_count), period/dt) > stim_start/dt && mod(float(step_count), period/dt) < stim_end/dt) {
        //     stim = stim_mag;
        // }

        float stim = 0.0;
        float stim_step = mod(float(step_count), period/dt);
        if(stim_step < (stim_dur/dt))
        {
            stim = stim_f(stim_step * dt);
        }


        u -= (jfi+jso+jsi-stim)*dt;

        if(!first_upstroke && u > align_thresh)
        {
            first_upstroke = true;
            start_comp = step_count;
            error = 0.0;

        }

        if (first_upstroke && mod(float(step_count - start_comp), compare_stride) == 0.0) {
            last_aligned_u = u;           
        }


        if (float(step_count - 1) / float(num_steps - 1) >= cc.x) {
            break;
        }
    }

    simulation_texture = vec4(last_aligned_u, 0, 0, 0);
    // simulation_texture = vec4(u, 0, 0, 0);
}
