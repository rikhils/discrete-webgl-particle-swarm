/* global define */
define('scripts/pso', [
  'libs/Abubu.js',
  // 'text!shaders/run_simulation.frag',
  // 'text!shaders/run_final_simulation.frag',
  'text!shaders/run_simulation_0d.frag',
  'text!shaders/run_final_simulation_0d.frag',
  'text!shaders/reduce_error_s1.frag',
  'text!shaders/reduce_error_s2.frag',
  'text!shaders/update_velocities.frag',
  'text!shaders/update_particles.frag',
  'text!shaders/update_local_bests.frag',
], function(
  Abubu,
  RunSimulationShader,
  RunFinalSimulationShader,
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
    }

    static getEnv() {
      return {
        simulation: {
          dt: 0.02,
          period: [400.0],
          stim_start: 2.0,
          stim_end: 7.0,
          stim_mag: 0.1,
          num_beats: 1,
          v_init: 1.0,
          w_init: 1.0,
          align_thresh: [],
          sample_rate: 1.0,
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

    setupEnv(bounds, cls, num_beats, sample_rate) {
      this.env = Pso.getEnv();
      const env = this.env;

      if (bounds) {
        env.bounds = bounds;
      }

      // if (Number(cl)) {
      //   env.simulation.period = Number(cl);
      // }

        if(Number(cls[0]))
        {
          env.simulation.period = [];
        }

      for (var i = 0; i < cls.length; i++) {
        if(Number(cls[i]))
        {
          env.simulation.period.push(Number(cls[i]));
        }
      }

      if (Number(num_beats)) {
        env.simulation.num_beats = Number(num_beats);
      }

      if(Number(sample_rate))
      {
        env.simulation.sample_rate = Number(sample_rate);
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

    readData(raw_text, normalize) {
      const split_data = raw_text.split('\n');
      const actual_data = split_data.filter(x => !(x.trim() === ""));

      const normalization = Number(normalize) || 1;

      let full_parsed_data = actual_data.map(x => parseFloat(x.trim()));
      let maxVal = Math.max(...full_parsed_data);
      let full_normalized_data = full_parsed_data.map(x => (x * (normalization / maxVal)));

      var first_compare_index = full_normalized_data.findIndex(number => number > 0.15);

      const left_trimmed_data = full_normalized_data.slice(first_compare_index);

      const data_length = left_trimmed_data.length;
      const data_array = new Float32Array(data_length*4);

      // Pad out the extra pixel values. The data could be stored more densely by using the full pixel
      // value and by using a two-dimensional texture, but for now there is not enough to require that.
      let p = 0;
      for (let i = 0; i < data_length; ++i) {
        data_array[p++] = left_trimmed_data[i];
        data_array[p++] = 0.0;
        data_array[p++] = 0.0;
        data_array[p++] = 0.0;
      }

      const delta = 0.001;

      this.env.simulation.align_thresh.unshift(left_trimmed_data[0]-delta);

      return [left_trimmed_data, data_array];
    }

    initializeParticles() {
      const num_particles = this.num_particles;
      const init_array_1 = new Float32Array(num_particles * 4);
      const init_array_2 = new Float32Array(num_particles * 4);
      const init_array_3 = new Float32Array(num_particles * 4);
      const init_array_4 = new Float32Array(num_particles * 4);

      const random_init = (i, j) => {
        const [min, max] = this.env.bounds[i][j];
        return Math.random() * (max - min) + min;
      };

      let p = 0;
      for (let i = 0; i < num_particles; ++i) {
        init_array_1[p] = random_init(0, 0);
        init_array_2[p] = random_init(1, 0);
        init_array_3[p] = random_init(2, 0);
        init_array_4[p++] = random_init(3, 0);

        init_array_1[p] = random_init(0, 1);
        init_array_2[p] = random_init(1, 1);
        init_array_3[p] = random_init(2, 1);
        init_array_4[p++] = 0;

        init_array_1[p] = random_init(0, 2);
        init_array_2[p] = random_init(1, 2);
        init_array_3[p] = random_init(2, 2);
        init_array_4[p++] = 0;

        init_array_1[p] = random_init(0, 3);
        init_array_2[p] = random_init(1, 3);
        init_array_3[p] = random_init(2, 3);
        init_array_4[p++] = 0;
      }

      return [init_array_1, init_array_2, init_array_3, init_array_4];
    }

    initializeTextures(data_arrays, init_arrays) {
      const particles_width = this.particles_width;
      const particles_height = this.particles_height;
      // const data_length = data_array.length / 4;
      const [init_array_1, init_array_2, init_array_3, init_array_4] = init_arrays;
      const { num_beats, period, sample_rate } = this.env.simulation;
      // const simulation_length = Math.ceil(Math.ceil(num_beats * period) / sample_rate);

      let simulation_lengths = [];
      this.simulation_textures = [];
      this.data_textures = [];

      this.error_textures = [];

      console.log("Period length is "+period.length);
      for (var i = 0; i < period.length; i++) {
        simulation_lengths.push(Math.ceil(Math.ceil(num_beats * period[i]) / sample_rate));
        this.simulation_textures.push(
            new Abubu.Float32Texture(simulation_lengths[i], 1, {
        pariable: true,
             })
          );

        this.data_textures.push(
            new Abubu.Float32Texture(data_arrays[i].length/4, 1, {
                    pairable: true,
                    data: data_arrays[i],
                  })
          );

        this.error_textures.push(
            new Abubu.Float32Texture(particles_width, particles_height, {
              pariable: true,
            })
          );
      }

      // this.simulation_texture = new Abubu.Float32Texture(simulation_length, 1, {
      //   pariable: true,
      // });

      // The recorded data used to evaluate the correctness of simulation runs
      // this.data_texture = new Abubu.Float32Texture(data_length, 1, {
      //   pairable: true,
      //   data: data_array,
      // });

      // These textures record the position (or particle values), velocity, and global best of each
      // particle

      this.particles_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
        data: init_array_1,
      });
      this.particles_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
        data: init_array_2,
      });
      this.particles_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
        data: init_array_3,
      });
      this.particles_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
        data: init_array_4,
      });

      this.velocities_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.velocities_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.velocities_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.velocities_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });

      this.bests_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.bests_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.bests_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.bests_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });

      // The out textures are used to get the values from updates

      this.particles_out_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.particles_out_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.particles_out_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.particles_out_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });

      this.velocities_out_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.velocities_out_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.velocities_out_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.velocities_out_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });

      this.bests_out_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.bests_out_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.bests_out_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });
      this.bests_out_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });

      // The error textures are used to reduce the error quantities of each particles from each
      // simulation run down to a global best.
      const local_error_init = new Float32Array(particles_width * particles_height * 4);
      for (let i = 0; i < particles_width * particles_height * 4; i += 4)
      {
        local_error_init[i] = 100000.0;
      }

      this.local_bests_error_texture = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
        data: local_error_init,
      });

      this.local_bests_error_texture_out = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });


      this.error_texture = new Abubu.Float32Texture(particles_width, particles_height, {
        pariable: true,
      });


      this.reduced_error_1_texture = new Abubu.Float32Texture(particles_width, particles_height, {
        pairable: true,
      });

      this.reduced_error_2_texture = new Abubu.Float32Texture(particles_width, particles_height, {
        pairable: true,
      });

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

      env.velocity_update.ftinymtState = new Abubu.Uint32Texture(particles_width, particles_height, {
        data: env.velocity_update.istate,
        pairable : true,
      });

      env.velocity_update.stinymtState = new Abubu.Uint32Texture(particles_width, particles_height, {
        data: env.velocity_update.istate,
        pairable: true,
      });

      // mat state for each point of the generator .............................
      env.velocity_update.tinymtMat = new Abubu.Uint32Texture(particles_width, particles_height, {
        data: env.velocity_update.imat,
        pairable: true,
      });
    }

    setupRunSimulationSolvers() {
      const env = this.env;

      const numCLs = env.simulation.period.length;

      this.run_simulations_solvers = [];


      for (var i = 0; i < numCLs; i++)
      {
        this.run_simulations_solvers.push(new Abubu.Solver({
        fragmentShader: RunSimulationShader,
        uniforms: {
          in_particles_1: {
            type: 't',
            value: this.particles_texture_1,
          },
          in_particles_2: {
            type: 't',
            value: this.particles_texture_2,
          },
          in_particles_3: {
            type: 't',
            value: this.particles_texture_3,
          },
          in_particles_4: {
            type: 't',
            value: this.particles_texture_4,
          },
          data_texture: {
            type: 't',
            value: this.data_textures[i],
          },
          dt: {
            type: 'f',
            value: env.simulation.dt,
          },
          period: {
            type: 'f',
            value: env.simulation.period[i],
          },
          stim_start: {
            type: 'f',
            value: env.simulation.stim_start,
          },
          stim_end: {
            type: 'f',
            value: env.simulation.stim_end,
          },
          stim_mag: {
            type: 'f',
            value: env.simulation.stim_mag,
          },
          num_beats: {
            type: 'i',
            value: env.simulation.num_beats,
          },
          v_init: {
            type: 'f',
            value: env.simulation.v_init,
          },
          w_init: {
            type: 'f',
            value: env.simulation.w_init,
          },
          align_thresh: {
            type: 'f',
            value: env.simulation.align_thresh[i],
          },
          sample_rate: {
            type: 'f',
            value: env.simulation.sample_rate,
          },
        },
        targets: {
          error_texture: {
            location: 0,
            target: this.error_textures[i],
          },
        },
      }));
      }
    }

    setupReduceErrorSolvers() {
      this.reduce_error_1_solver = new Abubu.Solver({
        fragmentShader: ReduceErrorS1Shader,
        uniforms: {
          error_texture: {
            type: 't',
            value: this.error_texture,
          },
        },
        targets: {
          reduced_error_1: {
            location: 0,
            target: this.reduced_error_1_texture,
          },
        },
      });

      this.reduce_error_2_solver = new Abubu.Solver({
        fragmentShader: ReduceErrorS2Shader,
        uniforms: {
          reduced_error_1: {
            type: 't',
            value: this.reduced_error_1_texture,
          },
        },
        targets: {
          reduced_error_2: {
            location: 0,
            target: this.reduced_error_2_texture,
          },
        },
      });
    }

    setupLocalBestUpdateSolvers() {
      // For why this should be an arrow function, read:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#no_separate_this
      const makeUpdateLocalBestsSolver = (lbt, cvt, new_lbt) => {
        return new Abubu.Solver({
          fragmentShader: UpdateLocalBestsShader,
          uniforms:{
            local_bests_texture: {
              type: 't',
              value: lbt,
            },
            local_bests_error_texture: {
              type: 't',
              value: this.local_bests_error_texture,
            },
            cur_vals_texture: {
              type: 't',
              value: cvt
            },
            cur_error_texture: {
              type: 't',
              value: this.error_texture,
            },
          },
          targets: {
            new_local_best: {
              location: 0,
              target: new_lbt,
            },
            new_local_best_error: {
              location: 1,
              target: this.local_bests_error_texture_out,
            },
          },
        });
      };

      this.local_best_update_1_solver = makeUpdateLocalBestsSolver(this.bests_texture_1, this.particles_texture_1, this.bests_out_texture_1);
      this.local_best_update_2_solver = makeUpdateLocalBestsSolver(this.bests_texture_2, this.particles_texture_2, this.bests_out_texture_2);
      this.local_best_update_3_solver = makeUpdateLocalBestsSolver(this.bests_texture_3, this.particles_texture_3, this.bests_out_texture_3);
      this.local_best_update_4_solver = makeUpdateLocalBestsSolver(this.bests_texture_4, this.particles_texture_4, this.bests_out_texture_4);
    }

    setupVelocityUpdateSolvers() {
      const env = this.env;

      const makeVelocityUpdateSolver = (pt, vt, bt, vto, num) => {
        return new Abubu.Solver({
          fragmentShader: UpdateVelocitiesShader,
          uniforms: {
            positions_texture: {
              type: 't',
              value: pt,
            },
            velocities_texture: {
              type: 't',
              value: vt,
            },
            bests_texture: {
              type: 't',
              value: bt,
            },
            itinymtState: {
              type: 't',
              value: env.velocity_update.ftinymtState,
            },
            itinymtMat: {
              type: 't',
              value: env.velocity_update.tinymtMat,
            },
            chi: {
              type: 'v4',
              value: env.particles.chi[num],
            },
            phi_local: {
              type: 'f',
              value: env.particles.phi_local,
            },
            phi_global: {
              type: 'f',
              value: env.particles.phi_global,
            },
            global_best: {
              type: 'v4',
              value: env.particles.global_bests[num],
            },
            omega: {
              type: 'f',
              value: env.particles.omega,
            },
          },
          targets: {
            new_velocity: {
              location: 0,
              target: vto,
            },
            otinymtState: {
              location: 1,
              target: env.velocity_update.stinymtState,
            },
          },
        });
      };

      this.velocity_1_solver = makeVelocityUpdateSolver(this.particles_texture_1, this.velocities_texture_1, this.bests_texture_1, this.velocities_out_texture_1, 0);
      this.velocity_2_solver = makeVelocityUpdateSolver(this.particles_texture_2, this.velocities_texture_2, this.bests_texture_2, this.velocities_out_texture_2, 1);
      this.velocity_3_solver = makeVelocityUpdateSolver(this.particles_texture_3, this.velocities_texture_3, this.bests_texture_3, this.velocities_out_texture_3, 2);
      this.velocity_4_solver = makeVelocityUpdateSolver(this.particles_texture_4, this.velocities_texture_4, this.bests_texture_4, this.velocities_out_texture_4, 3);
    }

    setupPositionUpdateSolvers() {
      const env = this.env;

      const makeParticleUpdateSolver = (pt, vt, pto, num) => {
        return new Abubu.Solver({
          fragmentShader: UpdateParticlesShader,
          uniforms: {
            positions_texture: {
              type: 't',
              value: pt,
            },
            velocities_texture: {
              type: 't',
              value: vt,
            },
            itinymtState: {
              type: 't',
              value: env.velocity_update.ftinymtState,
            },
            itinymtMat: {
              type: 't',
              value: env.velocity_update.tinymtMat,
            },
            lower_bounds: {
              type: 'v4',
              value: env.particles.lower_bounds[num],
            },
            upper_bounds: {
              type: 'v4',
              value: env.particles.upper_bounds[num],
            },
            learning_rate: {
              type: 'f',
              value: env.particles.learning_rate,
            },
          },
          targets: {
            new_position: {
              location: 0,
              target: pto,
            },
            otinymtState: {
              location: 1,
              target: env.velocity_update.stinymtState,
            },
          },
        });
      };

      this.position_1_solver = makeParticleUpdateSolver(this.particles_texture_1, this.velocities_texture_1, this.particles_out_texture_1, 0);
      this.position_2_solver = makeParticleUpdateSolver(this.particles_texture_2, this.velocities_texture_2, this.particles_out_texture_2, 1);
      this.position_3_solver = makeParticleUpdateSolver(this.particles_texture_3, this.velocities_texture_3, this.particles_out_texture_3, 2);
      this.position_4_solver = makeParticleUpdateSolver(this.particles_texture_4, this.velocities_texture_4, this.particles_out_texture_4, 3);
    }

    setupCopySolvers() {
      this.tinymt_copy = new Abubu.Copy(this.env.velocity_update.stinymtState, this.env.velocity_update.ftinymtState);

      this.local_bests_1_copy = new Abubu.Copy(this.bests_out_texture_1, this.bests_texture_1);
      this.local_bests_2_copy = new Abubu.Copy(this.bests_out_texture_2, this.bests_texture_2);
      this.local_bests_3_copy = new Abubu.Copy(this.bests_out_texture_3, this.bests_texture_3);
      this.local_bests_4_copy = new Abubu.Copy(this.bests_out_texture_4, this.bests_texture_4);

      this.local_error_copy = new Abubu.Copy(this.local_bests_error_texture_out, this.local_bests_error_texture);

      this.positions_1_copy = new Abubu.Copy(this.particles_out_texture_1, this.particles_texture_1);
      this.positions_2_copy = new Abubu.Copy(this.particles_out_texture_2, this.particles_texture_2);
      this.positions_3_copy = new Abubu.Copy(this.particles_out_texture_3, this.particles_texture_3);
      this.positions_4_copy = new Abubu.Copy(this.particles_out_texture_4, this.particles_texture_4);

      this.velocities_1_copy = new Abubu.Copy(this.velocities_out_texture_1, this.velocities_texture_1);
      this.velocities_2_copy = new Abubu.Copy(this.velocities_out_texture_2, this.velocities_texture_2);
      this.velocities_3_copy = new Abubu.Copy(this.velocities_out_texture_3, this.velocities_texture_3);
      this.velocities_4_copy = new Abubu.Copy(this.velocities_out_texture_4, this.velocities_texture_4);
    }

    setupAllSolvers() {
      this.setupRunSimulationSolvers();
      this.setupReduceErrorSolvers();
      this.setupLocalBestUpdateSolvers();
      this.setupVelocityUpdateSolvers();
      this.setupPositionUpdateSolvers();
      this.setupCopySolvers();
    }

    updateGlobalBest() {
      const env = this.env;

      const [best_error, best_x_index, best_y_index] = this.reduced_error_2_texture.value.slice(-4, -1);

      if (best_error < env.particles.best_error_value) {
        const best_particle_index = 4 * (best_y_index * this.particles_width + best_x_index);

        env.particles.global_bests[0] = this.particles_texture_1.value.slice(best_particle_index, best_particle_index + 4);
        env.particles.global_bests[1] = this.particles_texture_2.value.slice(best_particle_index, best_particle_index + 4);
        env.particles.global_bests[2] = this.particles_texture_3.value.slice(best_particle_index, best_particle_index + 4);
        env.particles.global_bests[3] = this.particles_texture_4.value.slice(best_particle_index, best_particle_index + 4);

        env.particles.best_error_value = best_error;
      }
    }

    runOneIteration() {
      const env = this.env;

      console.log(env.simulation.align_thresh);

      let total_error_array = new Float32Array(this.particles_width * this.particles_height * 4);
      for (let i = 0; i < this.particles_width * this.particles_height * 4; i += 4)
      {
        total_error_array[i] = 0.0;
      }

      // this.run_simulations_solver.render();

      // console.log(env.simulation.period.length);
      // console.log(this.run_simulations_solvers);
      for (let i = 0; i < env.simulation.period.length; i++) {

          console.log("Running solver...");
          this.run_simulations_solvers[i].render();
          console.log("Solver finished.");
          console.log(this.error_textures[i]);

          for(let j = 0; j < this.particles_width * this.particles_height *4; j += 4)
          {
            total_error_array[j] += this.error_textures[i].value[j]  / (env.simulation.period[i] / 10.0);
          }

      }

      let total_error_texture = new Abubu.Float32Texture(this.particles_width, this.particles_height, {
        pariable: true,
        data: total_error_array,
      });

      let total_error_copy = new Abubu.Copy(total_error_texture, this.error_texture);
      total_error_copy.render();



      this.reduce_error_1_solver.render();
      this.reduce_error_2_solver.render();

      this.updateGlobalBest();

      this.local_best_update_1_solver.render();
      this.local_best_update_2_solver.render();
      this.local_best_update_3_solver.render();
      this.local_best_update_4_solver.render();

      this.local_bests_1_copy.render();
      this.local_bests_2_copy.render();
      this.local_bests_3_copy.render();
      this.local_bests_4_copy.render();

      this.local_error_copy.render();

      this.velocity_1_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;
      this.velocity_2_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;
      this.velocity_3_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;
      this.velocity_4_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;

      this.velocities_1_copy.render();
      this.velocities_2_copy.render();
      this.velocities_3_copy.render();
      this.velocities_4_copy.render();

      this.position_1_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;
      this.position_2_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;
      this.position_3_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;
      this.position_4_solver.render();
      env.velocity_update.ftinymtState.data = env.velocity_update.stinymtState.value;

      this.positions_1_copy.render();
      this.positions_2_copy.render();
      this.positions_3_copy.render();
      this.positions_4_copy.render();
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

    setupFinalSimulationSolvers(bestArr) {
      const env = this.env;

      this.run_final_simulation_solvers = [];

      for (var i = 0; i < env.simulation.period.length; i++) {
        
        this.run_final_simulation_solvers.push(

            new Abubu.Solver({
                fragmentShader: RunFinalSimulationShader,
                uniforms: {
                  dt: {
                    type: 'f',
                    value: env.simulation.dt,
                  },
                  period: {
                    type: 'f',
                    value: env.simulation.period[i],
                  },
                  stim_start: {
                    type: 'f',
                    value: env.simulation.stim_start,
                  },
                  stim_end: {
                    type: 'f',
                    value: env.simulation.stim_end,
                  },
                  stim_mag: {
                    type: 'f',
                    value: env.simulation.stim_mag,
                  },
                  num_beats: {
                    type: 'i',
                    value: env.simulation.num_beats,
                  },
                  v_init: {
                    type: 'f',
                    value: env.simulation.v_init,
                  },
                  w_init: {
                    type: 'f',
                    value: env.simulation.w_init,
                  },
                  align_thresh: {
                    type: 'f',
                    value: env.simulation.align_thresh[i],
                  },
                  sample_rate: {
                    type: 'f',
                    value: env.simulation.sample_rate,
                  },
                  TR_POS: {
                    type: 'f',
                    value: bestArr[0],
                  },
                  TSI_POS: {
                    type: 'f',
                    value: bestArr[1],
                  },
                  TWP_POS: {
                    type: 'f',
                    value: bestArr[2],
                  },
                  TD_POS: {
                    type: 'f',
                    value: bestArr[3],
                  },
                  TVP_POS: {
                    type: 'f',
                    value: bestArr[4],
                  },
                  TV1M_POS: {
                    type: 'f',
                    value: bestArr[5],
                  },
                  TV2M_POS: {
                    type: 'f',
                    value: bestArr[6],
                  },
                  TWM_POS: {
                    type: 'f',
                    value: bestArr[7],
                  },
                  TO_POS: {
                    type: 'f',
                    value: bestArr[8],
                  },
                  XK_POS: {
                    type: 'f',
                    value: bestArr[9],
                  },
                  UCSI_POS: {
                    type: 'f',
                    value: bestArr[10],
                  },
                  UC_POS: {
                    type: 'f',
                    value: bestArr[11],
                  },
                  UV_POS: {
                    type: 'f',
                    value: bestArr[12],
                  },
                },
                targets: {
                  simulation_texture: {
                    location: 0,
                    target: this.simulation_textures[i],
                  },
                },
              })

          );

      }


      // this.run_final_simulation_solver = ;
    }

    runFinalSimulationSolver(cl_idx) {
      this.run_final_simulation_solvers[cl_idx].render();
      const texture_array = this.simulation_textures[cl_idx].value;
      const simultation_length = texture_array.length / 4;

      const simulation_data = new Float32Array(simultation_length);
      for (let i = 0; i < simultation_length; ++i) {
        simulation_data[i] = texture_array[4*i];
      }

      return simulation_data;
    }
  };
});
