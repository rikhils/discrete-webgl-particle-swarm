#version 300 es

precision highp float;
precision highp int;

uniform sampler2D in_particles_1, in_particles_2, in_particles_3;
uniform sampler2D data_texture;

layout (location = 0) out vec4 error_texture;

in vec2 cc;

// Simulation parameters
uniform float dt, period;
uniform int num_beats, pre_beats, data_type;
uniform float v_init, w_init;
uniform float align_thresh;
uniform float sample_interval, apd_thresh, weight;
uniform float stim_dur, stim_mag, stim_offset_1, stim_offset_2, stim_t_scale;
uniform bool stim_biphasic;

void main() {
    // PSO derived parameters
    int num_period = int(ceil(period/dt));
    int total_beats = pre_beats + num_beats;
    float endtime = ceil(float(total_beats)*period);
    float pre_pace_endtime = ceil(float(pre_beats)*period);
    int pre_pace_steps = int(ceil(pre_pace_endtime/dt));
    int num_steps = int(ceil(endtime/dt));

    ivec2 tex_size = textureSize(in_particles_1, 0);
    ivec2 idx = ivec2(floor(cc * 0.5 * vec2(tex_size)));

    vec4 particles_1 = texelFetch(in_particles_1, idx, 0);
    vec4 particles_2 = texelFetch(in_particles_1, idx + ivec2(tex_size.x/2, 0), 0);
    vec4 particles_3 = texelFetch(in_particles_1, idx + ivec2(0, tex_size.y/2), 0);
    vec4 particles_4 = texelFetch(in_particles_1, idx + ivec2(tex_size.x/2, tex_size.y/2), 0);

    vec4 particles_5 = texelFetch(in_particles_2, idx, 0);
    vec4 particles_6 = texelFetch(in_particles_2, idx + ivec2(tex_size.x/2, 0), 0);

    // TEST INITIAL CONDITIONS
    // float period = 500.0;
    float init_apd = period - 50.0;
    float init_l = 67.791;
    float init_b = 117.09;

    float target_apd = 226.2196678887523;

    // Initialize parameters
    float A_0 = particles_1.r;
    float D_0 = particles_1.g;
    float tau_0 = particles_1.b;
    float A_1 = particles_1.a;

    float D_1 = particles_2.r;
    float tau_1 = particles_2.g;
    float gamma = particles_2.b;
    float sigma = particles_2.a;

    float tau_q = particles_3.r;
    float alpha = particles_3.g;
    float beta = particles_3.b;
    float l_c = particles_3.a;

    float rho = particles_4.r;
    float tau_u = particles_4.g;
    float nu = particles_4.b;
    float c_0h = particles_4.a;

    float theta = particles_5.r;
    float eta = particles_5.g;
    float kappa = particles_5.b;
    float tau_c = particles_5.a;

    float epsilon = particles_6.r;
    float c_0c = particles_6.g;

    // Model Intermediate Variables
    float d_n;
    float c_n;
    float r_n1;
    float cp_n1;
    float a_n1;
    float l_n1;
    float b_n1;

    float q;
    float g;
    float term1;
    float term2;
    float f;
    float u;
    float h; 
    float c;

    float error = 0.0;

    // Create APD array
    float apd_array[50];

    // Set initial conditions
    float a_n = init_apd;
    float l_n = init_l;
    float b_n = init_b;

    //Iterate over beats
    for (int i = 0; i < num_beats; i++) {
        // Diastolic Interval
        d_n = period - a_n;

        // Diastolic Calcium
        c_n = b_n - l_n;

        // Restitution properties of SR Ca release
        q = 1.0 - (sigma * exp(-d_n / tau_q));

        //Dependence of SR Ca release on lead state of the Sr
        g = l_n * (1.0 - ((1.0 - alpha) / (1.0 + exp((l_n - l_c) / beta))));

        //Ca released from SR
        r_n1 = q * g;

        // Peak Cytoplasmic Ca
        cp_n1 = r_n1 + c_n;

        // Action Potential Duration Restitution
        term1 = A_0 * (1.0 - (1.0 / (1.0 + exp((d_n - D_0) / tau_0))));
        term2 = (A_1 * exp(-pow((d_n - D_1), 2.0) / tau_1));
        f = term1 + term2;

        // Next Beat Action Potential Duration
        a_n1 = (1.0 / (1.0 - (gamma * cp_n1))) * f;

        // Total Ca pumped into SR
        u = 1.0 - (rho * exp(-period / tau_u));
        
        // SR Ca uptake``
        h = nu * cp_n1 * (1.0 - (1.0 / (1.0 + exp((cp_n1 - c_0h) / theta))));

        // Total SR Ca load for next beat
        l_n1 = l_n - r_n1 + (u * h);

        // Steady State cytoplasmic Ca at cycle length T, accounting for Ca accumulation
        c = c_0c * (1.0 + (epsilon * exp(-period / tau_c)));

        // Total Cellular Ca 
        b_n1 = b_n + (eta * (a_n1 - a_n)) - (kappa * (c_n - c));

        // Set next beat initial conditions
        a_n = a_n1;
        l_n = l_n1;
        b_n = b_n1;

        // Store APD
        apd_array[i] = a_n1;
    }

    error = abs(apd_array[num_beats - 1] - target_apd);

    //write to texture
    error_texture = vec4(error, 0.0, 0.0, 1.0);
}