/* global define */
define('scripts/pso', [
  'libs/Abubu.js',
  'scripts/gl_helper',
  'text!shaders/copy.frag',
  'text!shaders/copy_uint_texture.frag',
  'text!shaders/default.vert',
  'text!shaders/run_simulation_0d.frag',
  'text!shaders/reduce_error_s1.frag',
  'text!shaders/reduce_error_s2.frag',
  'text!shaders/update_velocities.frag',
  'text!shaders/update_particles.frag',
  'text!shaders/update_local_bests.frag',
], function(
  Abubu,
  GlHelper,
  CopyShader,
  CopyUintShader,
  DefaultVertexShader,
  RunSimulationShader,
  ReduceErrorS1Shader,
  ReduceErrorS2Shader,
  UpdateVelocitiesShader,
  UpdateParticlesShader,
  UpdateLocalBestsShader,
) {
  'use strict';

  return class Pso {
    constructor(particles_width, particles_height) {
      this.particles_width = particles_width;
      this.particles_height = particles_height;
      this.num_particles = particles_width * particles_height;

      const canvas = document.createElement('canvas');
      canvas.width = this.particles_width;
      canvas.height = this.particles_height;

      this.gl_helper = new GlHelper(canvas);
    }

    static getEnv() {
      return {
        simulation: {
          dt: 0.02,
          period: [],
          stim_start: 2.0,
          stim_end: 7.0,
          stim_mag: 0.1,
          num_beats: 1,
          pre_beats: 4,
          v_init: 1.0,
          w_init: 1.0,
          align_thresh: [],
          trimmed_data: [],
          data_arrays: [],
          sample_interval: 1.0,
        },
        particles: {
          phi_local: 2.05,
          phi_global: 2.05,
          global_bests: [
            [0.0, 0.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 0.0],
          ],
          best_error_value: 1e10,
          chi: [],
          lower_bounds:[],
          upper_bounds:[],
          learning_rate: 0.1,
          omega: 0.05,
        },
        bounds: [
          [[25, 200], [10, 300], [50, 500], [0.15, 0.4]],
          [[1, 20], [10, 50], [500, 1500], [5, 100]],
          [[5, 50], [1, 15], [0.2, 0.9], [0.1, 0.25]],
          [[0.005, 0.05], [0, 0], [0, 0], [0, 0]],
        ],
        velocity_update: {},
      };
    }

    setupEnv(bounds, input_cls, pre_beats, num_beats, sample_interval) {
      this.env = Pso.getEnv();
      const env = this.env;

      if (bounds) {
        env.bounds = bounds;
      }

      env.simulation.period = input_cls;

      if (Number(num_beats)) {
        env.simulation.num_beats = Number(num_beats);
      }

      if (Number(pre_beats)) {
        env.simulation.pre_beats = Number(pre_beats);
      }

      if(Number(sample_interval)) {
        env.simulation.sample_interval = Number(sample_interval);
      }

      const phi = env.particles.phi_global + env.particles.phi_local;
      const chi = 0.05 * 2 / (phi - 2 + Math.sqrt(phi * (phi - 4)));

      for (let i = 0; i < 4; ++i) {
        env.particles.chi.push(env.bounds[i].map(([min, max]) => chi * (max - min)/2));
      }

      for (let i = 0; i < 4; ++i) {
        const addArr_low = [];
        const addArr_up = [];

        for (let j = 0; j < 4; ++j) {
          addArr_low.push(env.bounds[i][j][0]);
          addArr_up.push(env.bounds[i][j][1]);
        }

        env.particles.lower_bounds.push(addArr_low);
        env.particles.upper_bounds.push(addArr_up);
      }
    }

    readData(raw_input_data, normalize) {
      const trimmed_data = [];
      const data_arrays = [];
      const align_thresh = [];

      const normalization = Number(normalize) || 1;
      const delta = 0.001;

      for (let i = 0; i < raw_input_data.length; ++i) {
        const raw_text = raw_input_data[i];

        const split_data = raw_text.split('\n');
        const actual_data = split_data.filter(x => !(x.trim() === ""));

        let full_parsed_data = actual_data.map(x => parseFloat(x.trim()));
        let maxVal = Math.max(...full_parsed_data);
        let full_normalized_data = full_parsed_data.map(x => (x * (normalization / maxVal)));

        var first_compare_index = full_normalized_data.findIndex(number => number > 0.15);

        const left_trimmed_data = full_normalized_data.slice(first_compare_index);

        // Pad out the extra pixel values. The data could be stored more densely by using the full pixel
        // value and by using a two-dimensional texture, but for now there is not enough to require that.
        const data_length = left_trimmed_data.length;
        const data_array = new Float32Array(4 * data_length);
        for (let j = 0; j < data_length; ++j) {
          data_array[4*j] = left_trimmed_data[j];
        }

        trimmed_data.push(left_trimmed_data);
        data_arrays.push(data_array);
        align_thresh.push(left_trimmed_data[0] - delta);
      }

      this.env.simulation.data_arrays = data_arrays;
      this.env.simulation.trimmed_data = trimmed_data;
      this.env.simulation.align_thresh = align_thresh;
    }

    initializeParticles() {
      const asize = 4 * this.num_particles;
      const init_array_1 = new Float32Array(asize);
      const init_array_2 = new Float32Array(asize);
      const init_array_3 = new Float32Array(asize);
      const init_array_4 = new Float32Array(asize);

      const random_init = (i, j) => {
        const [min, max] = this.env.bounds[i][j];
        return Math.random() * (max - min) + min;
      };

      let p = 0;
      for (let i = 0; i < asize; i += 4) {
        init_array_1[i] = random_init(0, 0);
        init_array_2[i] = random_init(1, 0);
        init_array_3[i] = random_init(2, 0);
        init_array_4[i] = random_init(3, 0);

        init_array_1[i+1] = random_init(0, 1);
        init_array_2[i+1] = random_init(1, 1);
        init_array_3[i+1] = random_init(2, 1);

        init_array_1[i+2] = random_init(0, 2);
        init_array_2[i+2] = random_init(1, 2);
        init_array_3[i+2] = random_init(2, 2);

        init_array_1[i+3] = random_init(0, 3);
        init_array_2[i+3] = random_init(1, 3);
        init_array_3[i+3] = random_init(2, 3);
      }

      return [init_array_1, init_array_2, init_array_3, init_array_4];
    }

    initializeTextures() {
      const gl_helper = this.gl_helper;
      const particles_width = this.particles_width;
      const particles_height = this.particles_height;
      const { num_beats, period, sample_interval } = this.env.simulation;

      const data_arrays = this.env.simulation.data_arrays;
      const [init_array_1, init_array_2, init_array_3, init_array_4] = this.initializeParticles();
      const zero_array = new Float32Array(particles_width*particles_height*4);

      this.simulation_lengths = [];
      this.data_textures = [];

      console.log("Period length is "+period.length);
      for (var i = 0; i < period.length; i++) {
        this.simulation_lengths.push(Math.ceil(Math.ceil(num_beats * period[i]) / sample_interval));
        this.data_textures.push(gl_helper.loadFloatTexture(data_arrays[i].length/4, 1, data_arrays[i]));
      }

      this.particles_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, init_array_1);
      this.particles_texture_2 = gl_helper.loadFloatTexture(particles_width, particles_height, init_array_2);
      this.particles_texture_3 = gl_helper.loadFloatTexture(particles_width, particles_height, init_array_3);
      this.particles_texture_4 = gl_helper.loadFloatTexture(particles_width, particles_height, init_array_4);

      this.velocities_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);
      this.velocities_texture_2 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);
      this.velocities_texture_3 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);
      this.velocities_texture_4 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);

      this.bests_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);
      this.bests_texture_2 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);
      this.bests_texture_3 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);
      this.bests_texture_4 = gl_helper.loadFloatTexture(particles_width, particles_height, zero_array);

      this.particles_out_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.particles_out_texture_2 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.particles_out_texture_3 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.particles_out_texture_4 = gl_helper.loadFloatTexture(particles_width, particles_height, null);

      this.velocities_out_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.velocities_out_texture_2 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.velocities_out_texture_3 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.velocities_out_texture_4 = gl_helper.loadFloatTexture(particles_width, particles_height, null);

      this.bests_out_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.bests_out_texture_2 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.bests_out_texture_3 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.bests_out_texture_4 = gl_helper.loadFloatTexture(particles_width, particles_height, null);

      // The error textures are used to reduce the error quantities of each particles from each
      // simulation run down to a global best.
      const local_error_init = new Float32Array(particles_width * particles_height * 4);
      for (let i = 0; i < particles_width * particles_height * 4; i += 4) {
        local_error_init[i] = 100000.0;
      }

      this.local_bests_error_texture = gl_helper.loadFloatTexture(particles_width, particles_height, local_error_init);
      this.local_bests_error_texture_out = gl_helper.loadFloatTexture(particles_width, particles_height, null);

      this.error_texture = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.simulation_texture = gl_helper.loadFloatTexture(Math.max(...this.simulation_lengths), 1, null);

      this.error_sum_texture_0 = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.error_sum_texture_1 = gl_helper.loadFloatTexture(particles_width, particles_height, null);

      this.reduced_error_1_texture = gl_helper.loadFloatTexture(particles_width, particles_height, null);
      this.reduced_error_2_texture = gl_helper.loadFloatTexture(particles_width, particles_height, null);

      const env = this.env;

      env.velocity_update.istate  = new Uint32Array(particles_width*particles_height*4);
      env.velocity_update.imat    = new Uint32Array(particles_width*particles_height*4);

      let p = 0;
      const seed = Date.now();
      const tm = new Abubu.TinyMT({vmat:0});
      for (let j = 0; j < particles_height; ++j) {
        for (let i = 0; i < particles_width; ++i) {
          //  mat1            mat2            seed
          tm.mat[0] = i ;     tm.mat[1] = j ; tm.mat[3] = seed ;
          tm.init() ;

          for (let k = 0; k < 4; ++k) {
            env.velocity_update.istate[p] = tm.state[k] ;
            env.velocity_update.imat[p] = tm.mat[k] ;
            p++;
          }
        }
      }

      env.velocity_update.ftinymtState = gl_helper.loadUintTexture(particles_width, particles_height, env.velocity_update.istate);
      env.velocity_update.stinymtState = gl_helper.loadUintTexture(particles_width, particles_height, env.velocity_update.istate);
      // mat state for each point of the generator .............................
      env.velocity_update.tinymtMat = gl_helper.loadUintTexture(particles_width, particles_height, env.velocity_update.imat);
    }

    getDefaultShaderMap() {
      const makeUpdateLocalBestsSolver = (num) => {
        return {
          vert: DefaultVertexShader,
          frag: UpdateLocalBestsShader,
          uniforms: [
            ['local_bests_texture', 'tex', () => this['bests_texture_' + num]],
            ['local_bests_error_texture', 'tex', () => this.local_bests_error_texture],
            ['cur_vals_texture', 'tex', () => this['particles_texture_' + num]],
            ['cur_error_texture', 'tex', () => this.error_texture],
          ],
          out: [this['bests_out_texture_' + num], this.local_bests_error_texture_out],
          run: this.gl_helper.runProgram,
        };
      };

      const makeVelocityUpdateSolver = (num) => {
        return {
          vert: DefaultVertexShader,
          frag: UpdateVelocitiesShader,
          uniforms: [
            ['positions_texture', 'tex', () => this['particles_texture_' + num]],
            ['velocities_texture', 'tex', () => this['velocities_texture_' + num]],
            ['bests_texture', 'tex', () => this['bests_texture_' + num]],
            ['itinymtState', 'tex', () => this.env.velocity_update.ftinymtState],
            ['itinymtMat', 'tex', () => this.env.velocity_update.itinymtMat],
            ['chi', '4fv', () => this.env.particles.chi[num-1]],
            ['phi_local', '1f', () => this.env.particles.phi_local],
            ['phi_global', '1f', () => this.env.particles.phi_global],
            ['global_best', '4fv', () => this.env.particles.global_bests[num-1]],
            ['omega', '1f', () => this.env.particles.omega],
          ],
          out: [this['velocities_out_texture_' + num], this.env.velocity_update.stinymtState],
          run: this.gl_helper.runProgram,
        };
      };

      const makeParticleUpdateSolver = (num) => {
        return {
          vert: DefaultVertexShader,
          frag: UpdateParticlesShader,
          uniforms: [
            ['positions_texture', 'tex', () => this['particles_texture_' + num]],
            ['velocities_texture', 'tex', () => this['velocities_texture_' + num]],
            ['itinymtState', 'tex', () => this.env.velocity_update.ftinymtState],
            ['itinymtMat', 'tex', () => this.env.velocity_update.itinymtMat],
            ['lower_bounds', '4fv', () => this.env.particles.lower_bounds[num-1]],
            ['upper_bounds', '4fv', () => this.env.particles.upper_bounds[num-1]],
            ['learning_rate', '1f', () => this.env.particles.learning_rate],
          ],
          out: [this['particles_out_texture_' + num], this.env.velocity_update.stinymtState],
          run: this.gl_helper.runProgram,
        };
      };

      const makeCopySolver = (original, copy) => {
        return {
          vert: DefaultVertexShader,
          frag: CopyShader,
          uniforms: [
            ['original', 'tex', () => this[original]],
          ],
          out: [this[copy]],
          run: this.gl_helper.runProgram,
        };
      };

      return {
        run_simulation: {
          vert: DefaultVertexShader,
          frag: RunSimulationShader,
          uniforms: [
            ['in_particles_1', 'tex', () => this.particles_texture_1],
            ['in_particles_2', 'tex', () => this.particles_texture_2],
            ['in_particles_3', 'tex', () => this.particles_texture_3],
            ['in_particles_4', 'tex', () => this.particles_texture_4],
            ['data_texture', 'tex', (cl_idx) => this.data_textures[cl_idx]],
            ['dt', '1f', () => this.env.simulation.dt],
            ['period', '1f', (cl_idx) => this.env.simulation.period[cl_idx]],
            ['stim_start', '1f', () => this.env.simulation.stim_start],
            ['stim_end', '1f', () => this.env.simulation.stim_end],
            ['stim_mag', '1f', () => this.env.simulation.stim_mag],
            ['num_beats', '1i', () => this.env.simulation.num_beats],
            ['v_init', '1f', () => this.env.simulation.v_init],
            ['w_init', '1f', () => this.env.simulation.w_init],
            ['align_thresh', '1f', (cl_idx) => this.env.simulation.align_thresh[cl_idx]],
            ['sample_interval', '1f', () => this.env.simulation.sample_interval],
          ],
          out: [this.error_texture],
          run: this.gl_helper.runSimulation,
        },

        run_final_simulation: {
          vert: DefaultVertexShader,
          frag: RunSimulationShader,
          uniforms: [
            ['in_particles_1', 'tex', () => this.final_particles_texture_1],
            ['in_particles_2', 'tex', () => this.final_particles_texture_2],
            ['in_particles_3', 'tex', () => this.final_particles_texture_3],
            ['in_particles_4', 'tex', () => this.final_particles_texture_4],
            ['data_texture', 'tex', (cl_idx) => this.data_textures[cl_idx]],
            ['dt', '1f', () => this.env.simulation.dt],
            ['period', '1f', (cl_idx) => this.env.simulation.period[cl_idx]],
            ['stim_start', '1f', () => this.env.simulation.stim_start],
            ['stim_end', '1f', () => this.env.simulation.stim_end],
            ['stim_mag', '1f', () => this.env.simulation.stim_mag],
            ['num_beats', '1i', () => this.env.simulation.num_beats],
            ['v_init', '1f', () => this.env.simulation.v_init],
            ['w_init', '1f', () => this.env.simulation.w_init],
            ['align_thresh', '1f', (cl_idx) => this.env.simulation.align_thresh[cl_idx]],
            ['sample_interval', '1f', () => this.env.simulation.sample_interval],
          ],
          out: [this.simulation_texture],
          run: this.gl_helper.runFinal,
        },

        reduce_error_1: {
          vert: DefaultVertexShader,
          frag: ReduceErrorS1Shader,
          uniforms: [
            ['error_texture', 'tex', () => this.error_texture],
          ],
          out: [this.reduced_error_1_texture],
          run: this.gl_helper.runProgram,
        },

        reduce_error_2: {
          vert: DefaultVertexShader,
          frag: ReduceErrorS2Shader,
          uniforms: [
            ['reduced_error_1', 'tex', () => this.reduced_error_1_texture],
          ],
          out: [this.reduced_error_2_texture],
          run: this.gl_helper.runProgram,
        },

        tinymt_copy: {
          vert: DefaultVertexShader,
          frag: CopyUintShader,
          uniforms: [
            ['original', 'tex', () => this.env.velocity_update.stinymtState],
          ],
          out: [this.env.velocity_update.ftinymtState],
          run: this.gl_helper.runProgram,
        },

        local_best_update_1: makeUpdateLocalBestsSolver(1),
        local_best_update_2: makeUpdateLocalBestsSolver(2),
        local_best_update_3: makeUpdateLocalBestsSolver(3),
        local_best_update_4: makeUpdateLocalBestsSolver(4),

        velocity_1: makeVelocityUpdateSolver(1),
        velocity_2: makeVelocityUpdateSolver(2),
        velocity_3: makeVelocityUpdateSolver(3),
        velocity_4: makeVelocityUpdateSolver(4),

        position_1: makeParticleUpdateSolver(1),
        position_2: makeParticleUpdateSolver(2),
        position_3: makeParticleUpdateSolver(3),
        position_4: makeParticleUpdateSolver(4),

        local_bests_1_copy: makeCopySolver('bests_out_texture_1', 'bests_texture_1'),
        local_bests_2_copy: makeCopySolver('bests_out_texture_2', 'bests_texture_2'),
        local_bests_3_copy: makeCopySolver('bests_out_texture_3', 'bests_texture_3'),
        local_bests_4_copy: makeCopySolver('bests_out_texture_4', 'bests_texture_4'),

        local_error_copy: makeCopySolver('local_bests_error_texture_out', 'local_bests_error_texture'),

        positions_1_copy: makeCopySolver('particles_out_texture_1', 'particles_texture_1'),
        positions_2_copy: makeCopySolver('particles_out_texture_2', 'particles_texture_2'),
        positions_3_copy: makeCopySolver('particles_out_texture_3', 'particles_texture_3'),
        positions_4_copy: makeCopySolver('particles_out_texture_4', 'particles_texture_4'),

        velocities_1_copy: makeCopySolver('velocities_out_texture_1', 'velocities_texture_1'),
        velocities_2_copy: makeCopySolver('velocities_out_texture_2', 'velocities_texture_2'),
        velocities_3_copy: makeCopySolver('velocities_out_texture_3', 'velocities_texture_3'),
        velocities_4_copy: makeCopySolver('velocities_out_texture_4', 'velocities_texture_4'),
      };
    }

    setupAllSolvers() {
      const shader_map = this.getDefaultShaderMap();
      const program_map = {};

      this.gl_helper.initDefaultVertexBuffer();

      for (let key in shader_map) {
        program_map[key] = this.gl_helper.setupDefault(shader_map[key], this);
      }

      this.program_map = program_map;
    }

    updateGlobalBest() {
      const env = this.env;

      const texture_array = new Float32Array(this.particles_width*this.particles_height*4);
      this.gl_helper.getFloatTextureArray(this.reduced_error_2_texture, this.particles_width, this.particles_height, texture_array);

      const [best_error, best_x_index, best_y_index] = texture_array.slice(-4, -1);

      if (best_error < env.particles.best_error_value) {
        const best_particle_index = 4 * (best_y_index * this.particles_width + best_x_index);

        for (let i = 0; i < 4; ++i) {
          this.gl_helper.getFloatTextureArray(this['particles_texture_' + (i+1)], this.particles_width, this.particles_height, texture_array);
          env.particles.global_bests[i] = texture_array.slice(best_particle_index, best_particle_index + 4);
        }

        env.particles.best_error_value = best_error;
      }
    }

    runOneIteration() {
      const program_map = this.program_map;

      for (let i = 0; i < this.env.simulation.period.length; ++i) {
        program_map.run_simulation(i, i === 0);
      }

      program_map.reduce_error_1();
      program_map.reduce_error_2();

      this.updateGlobalBest();

      program_map.local_best_update_1();
      program_map.local_best_update_2();
      program_map.local_best_update_3();
      program_map.local_best_update_4();

      program_map.local_bests_1_copy();
      program_map.local_bests_2_copy();
      program_map.local_bests_3_copy();
      program_map.local_bests_4_copy();

      program_map.local_error_copy();

      program_map.velocity_1();
      program_map.tinymt_copy();
      program_map.velocity_2();
      program_map.tinymt_copy();
      program_map.velocity_3();
      program_map.tinymt_copy();
      program_map.velocity_4();
      program_map.tinymt_copy();

      program_map.velocities_1_copy();
      program_map.velocities_2_copy();
      program_map.velocities_3_copy();
      program_map.velocities_4_copy();

      program_map.position_1();
      program_map.tinymt_copy();
      program_map.position_2();
      program_map.tinymt_copy();
      program_map.position_3();
      program_map.tinymt_copy();
      program_map.position_4();
      program_map.tinymt_copy();

      program_map.positions_1_copy();
      program_map.positions_2_copy();
      program_map.positions_3_copy();
      program_map.positions_4_copy();
    }

    getGlobalBests() {
      const bestArr = [];

      for (let i = 0; i < 4; ++i) {
        for (let j= 0; j < 4; ++j) {
          bestArr.push(this.env.particles.global_bests[i][j]);
        }
      }

      return bestArr;
    }

    setPositionsToGlobalBest(cl_idx) {
      const texsize = this.simulation_lengths[cl_idx]*4;

      for (let i = 0; i < 4; ++i) {
        const particles_array = new Float32Array(texsize);

        for (let j = 0; j < texsize; j += 4) {
          for (let k = 0; k < 4; ++k) {
            particles_array[j+k] = this.env.particles.global_bests[i][k];
          }
        }

        this["final_particles_texture_" + (i+1)] = this.gl_helper.loadFloatTexture(this.simulation_lengths[cl_idx], 1, particles_array);
      }
    }

    runFinalSimulationSolver(cl_idx) {
      const simsize = this.simulation_lengths[cl_idx];
      const texsize = simsize*4;

      this.setPositionsToGlobalBest(cl_idx);
      this.program_map.run_final_simulation(cl_idx, simsize);

      const texture_array = new Float32Array(texsize);
      this.gl_helper.getFloatTextureArray(this.simulation_texture, simsize, 1, texture_array);

      const simulation_data = new Float32Array(simsize);
      for (let i = 0; i < simsize; ++i) {
        simulation_data[i] = texture_array[4*i+1];
      }

      return simulation_data;
    }
  };
});
