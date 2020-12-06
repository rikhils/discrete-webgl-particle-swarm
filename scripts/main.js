/* global require */
require([
  'libs/Abubu.js',
  'text!data/zebrafish_onecl.txt',
  'text!shaders/run_simulation.frag',
  'text!shaders/reduce_error_s1.frag',
  'text!shaders/reduce_error_s2.frag',
  'text!shaders/update_velocities.frag',
  'text!shaders/update_particles.frag',
], function(
  Abubu,
  ActualData,
  RunSimulationShader,
  ReduceErrorS1Shader,
  ReduceErrorS2Shader,
  UpdateVelocitiesShader,
  UpdateParticlesShader,
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

  //
  // Textures
  //

  // The recorded data used to evaluate the correctness of simulation runs

  var data_texture = new Abubu.Float32Texture(data_length, 1, {
    pairable: true,
    data: data_array,
  });

  // These textures record the position (or particle values), velocity, and global best of each
  // particle



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

  var velocities_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var velocities_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var velocities_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var velocities_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  var bests_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var bests_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var bests_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var bests_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  // The out textures are used to get the values from updates

  var particles_out_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var particles_out_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var particles_out_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var particles_out_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  var velocities_out_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var velocities_out_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var velocities_out_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var velocities_out_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  var bests_out_texture_1 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var bests_out_texture_2 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var bests_out_texture_3 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });
  var bests_out_texture_4 = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  // The error textures are used to reduce the error quantities of each particles from each
  // simulation run down to a global best.

  var error_texture = new Abubu.Float32Texture(particles_width, particles_height, {
    pariable: true,
  });

  var reduced_error_1_texture = new Abubu.Float32Texture(particles_width, particles_height, {
    pairable: true,
  });

  var reduced_error_2_texture = new Abubu.Float32Texture(particles_width, particles_height, {
    pairable: true,
  });

  //
  // Environment for solver with default values
  //

  // TODO: Make sure to set the correct values
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
    particles: {
      omega: 0.0,
      r_local: 0.0,
      r_global: 0.0,
      phi_local: 0.0,
      phi_global: 0.0,
      global_bests: [
        [0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
      ],
      learning_rate: 0.0,
    },
    velocity_update: {

    },
  };

// These should probably be in env?
env.velocity_update.istate  = new Uint32Array(particles_width*particles_height*4);
env.velocity_update.imat    = new Uint32Array(particles_width*particles_height*4);

var p=0;
var seed = 0;
var tm = new Abubu.TinyMT({vmat:0});

for(var j=0 ; j<particles_height ; j++){
    for(var i=0 ; i<particles_width ; i++){
        //  mat1            mat2            seed 
        tm.mat[0] = i ;     tm.mat[1] = j ; tm.mat[3] = seed ;
        tm.init() ;

        for(var k=0 ; k<4 ; k++){
            env.velocity_update.istate[p] = tm.state[k] ;  
            env.velocity_update.imat[p] = tm.mat[k] ;  
            p++ ;
        }
    }
}

// console.log(istate);

// These should *definitely* live in env

env.velocity_update.ftinymtState = new Abubu.Uint32Texture( particles_width, particles_height,
        {data : env.velocity_update.istate ,pair : true } ) ;
env.velocity_update.stinymtState = new Abubu.Uint32Texture( particles_width, particles_height,
        {data : env.velocity_update.istate ,pair : true } ) ;

// mat state for each point of the generator .............................
env.velocity_update.tinymtMat = new Abubu.Uint32Texture( particles_width, particles_height ,
        {data : env.velocity_update.imat } ) ;

// console.log(env.velocity_update.ftinymtState);


  //
  // Simulation running solver
  //

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
  // Solvers to update the velocities
  //

  function makeVelocityUpdateSolver(pt, vt, bt, vto, num) {
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
        omega: {
          type: 'f',
          value: env.particles.omega,
        },
        r_local: {
          type: 'f',
          value: env.particles.r_local,
        },
        r_global: {
          type: 'f',
          value: env.particles.r_global,
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
  }

  var velocity_1_solver = makeVelocityUpdateSolver(particles_texture_1, velocities_texture_1, bests_texture_1, velocities_out_texture_1, 0);
  var velocity_2_solver = makeVelocityUpdateSolver(particles_texture_2, velocities_texture_2, bests_texture_2, velocities_out_texture_2, 1);
  var velocity_3_solver = makeVelocityUpdateSolver(particles_texture_3, velocities_texture_3, bests_texture_3, velocities_out_texture_3, 2);
  var velocity_4_solver = makeVelocityUpdateSolver(particles_texture_4, velocities_texture_4, bests_texture_4, velocities_out_texture_4, 3);

  //
  // Solvers to update the positions
  //

  function makeParticleUpdateSolver(pt, vt, pto) {
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
      },
    });
  }

  var position_1_solver = makeParticleUpdateSolver(particles_texture_1, velocities_texture_1, particles_out_texture_1);
  var position_2_solver = makeParticleUpdateSolver(particles_texture_2, velocities_texture_2, particles_out_texture_2);
  var position_3_solver = makeParticleUpdateSolver(particles_texture_3, velocities_texture_3, particles_out_texture_3);
  var position_4_solver = makeParticleUpdateSolver(particles_texture_4, velocities_texture_4, particles_out_texture_4);

  //
  // Remaining work:
  // * Solvers to update local best and local best error
  // * Actually run the solvers
  //
});
