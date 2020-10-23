/* global require */
require([
  'libs/Abubu.js',
  'text!data/zebrafish_onecl.txt',
  'text!shaders/run_simulation.frag',
  'text!shaders/reduce_error_s1.frag',
  'text!shaders/reduce_error_s2.frag',
], function(
  Abubu,
  ActualData,
  RunSimulationShader,
  ReduceErrorS1Shader,
  ReduceErrorS2Shader,
) {
  'use strict';

  //
  // Get canvas information
  //

  var canvas_1 = document.getElementById('canvas_1');
  var particles_width = parseInt(canvas_1.getAttribute('width'));
  var particles_height = parseInt(canvas_1.getAttribute('height'));

  var num_particles = particles_width * particles_height;

  var bounds = {
    trmin: 25,
    trmax: 200,
    tsimin: 10,
    tsimax: 300,
    twpmin: 50,
    twpmax: 500,
    tdmin: 0.15,
    tdmax: 0.4,
    tvpmin: 1,
    tvpmax: 20,
    tv1mmin: 10,
    tv1mmax: 50,
    tv2mmin: 500,
    tv2mmax: 1500,
    twmmin: 5,
    twmmax: 100,
    tomin: 5,
    tomax: 50,
    xkmin: 1,
    xkmax: 15,
    ucsimin: 0.2,
    ucsimax: 0.9,
    ucmin: 0.1,
    ucmax: 0.25,
    uvmin: 0.005,
    uvmax: 0.05,
  };

  //
  // Set up data used to evaluate the each simulation run
  //

  var actual_data = ActualData.split('\n');
  var data_length = actual_data.length;
  var data_array = new Float32Array(data_length*4);

  // Pad out the extra pixel values. The data could be stored more densely by using the full pixel
  // value and by using a two-dimensional texture, but for now there is not enough to require that.
  var p = 0;
  for (var i = 0; i < data_length; ++i) {
    data_array[p++] = parseFloat(actual_data[i].trim());
    data_array[p++] = 0.0;
    data_array[p++] = 0.0;
    data_array[p++] = 0.0;
  }

  var data_texture = new Abubu.Float32Texture(data_length, 1, {
    pairable: true,
    data: data_array,
  });

  //
  // Environment for solver with default values
  //

  var env = {
    simulation: {
      dt: 0.02,
      period: 400.0,
      stim_start: 2.0,
      stim_end: 7.0,
      stim_mag: 0.1,
      num_beats: 1,
      v_init: 1.0,
      w_init: 1.0,
    },
  };

  //
  // Simulation running solver
  //

  // Textures to store the values for each particle. There are so many dimensions this needs to be
  // split into multiple textures.
  var particles_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var particles_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var particles_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var particles_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  // Texture to store the error value returned from one run of the simulation by the corresponding
  // particle
  var error_texture = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  // Solver for running a simulation once for each particle
  var run_simulations_solver = new Abubu.Solver({
    fragmentShader: RunSimulationShader,
    uniforms: {
      in_particles_1: {
        type: 't',
        value: particles_texture_1,
      },
      in_particles_2: {
        type: 't',
        value: particles_texture_2,
      },
      in_particles_3: {
        type: 't',
        value: particles_texture_3,
      },
      in_particles_4: {
        type: 't',
        value: particles_texture_4,
      },
      data_texture: {
        type: 't',
        value: data_texture,
      },
      dt: {
        type: 'f',
        value: env.simulation.dt,
      },
      period: {
        type: 'f',
        value: env.simulation.period,
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
    },
    targets: {
      error_texture: {
        location: 0,
        target: error_texture,
      },
    },
  });

  //
  // Solvers to find the global best simulation results
  //

  var reduced_error_1_texture = new Abubu.Float32Texture(particles_width, particles_height, {
    pairable: true,
  });

  var reduced_error_2_texture = new Abubu.Float32Texture(particles_width, particles_height, {
    pairable: true,
  });

  var reduce_error_1_solver = new Abubu.Solver({
    fragmentShader: ReduceErrorS1Shader,
    uniforms: {
      error_texture: {
        type: 't',
        value: error_texture,
      },
    },
    targets: {
      reduced_error_1: {
        location: 0,
        target: reduced_error_1_texture,
      },
    },
  });

  var reduce_error_2_solver = new Abubu.Solver({
    fragmentShader: ReduceErrorS2Shader,
    uniforms: {
      reduced_error_1: {
        type: 't',
        value: reduced_error_1_texture,
      },
    },
    targets: {
      reduced_error_2: {
        location: 0,
        target: reduced_error_2_texture,
      },
    },
  });

  //
  // Remaining work:
  // * Actually run the simulation and error solvers
  // * Particle updates and local best tracking
  //
});
