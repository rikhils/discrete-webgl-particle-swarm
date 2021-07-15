/* global require */
require([
  'libs/Abubu.js',
  'scripts/graph',
  'scripts/interface',
  'scripts/pso',
], function(
  Abubu,
  Graph,
  PsoInterface,
  Pso,
) {
  'use strict';

  const particles_width = 32;
  const particles_height = 32;

  const pso = new Pso(particles_width, particles_height);
  const graph = new Graph();
  const pso_interface = new PsoInterface();

  pso_interface.displayBounds(Pso.getEnv());

  document.getElementById('reset_bounds').onclick = () => {
    pso_interface.displayBounds(Pso.getEnv());
  };

  const readUploadedFileAsText = (inputFile) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };

      temporaryFileReader.readAsText(inputFile);
    });
  };

  let raw_text = null;
  const handleUpload = async (event) => {
    const file = event.target.files[0];

    try {
      const fileContents = await readUploadedFileAsText(file);
      raw_text = fileContents;
      run_PSO();
    } catch (e) {
      alert(e.message);
    }
  };

  document.querySelector('input#my_file').addEventListener('change', handleUpload);
  document.querySelector('button#PSO_button').onclick = run_PSO;

  function run_PSO() {
    const start_time = Date.now();

    pso.setupEnv(pso_interface.getBounds());
    const [actual_data, data_array] = pso.readData(raw_text);
    const init_arrays = pso.initializeParticles();
    pso.initializeTextures(data_array, init_arrays);
    // Re-running the setup every time could be replaced by updating the uniforms each time
    pso.setupAllSolvers();

    for (let i = 0; i < 8; ++i) {
      console.log(pso.env.particles.best_error_value);
      pso.runOneIteration();
    }

    const bestArr = pso.getGlobalBests();
    pso_interface.displayResults(bestArr);
    pso_interface.displayError(pso.env.particles.best_error_value);
    pso.setupFinalSimulationSolver(bestArr);
    const simulation_data = pso.runFinalSimulationSolver();

    var align_index = simulation_data.findIndex(function(number)
    {
      return number > 0.15;
    });

    const plotting_sim_data = simulation_data.slice(align_index);


    const scale = [
      Math.min(...actual_data, ...plotting_sim_data),
      Math.max(...actual_data, ...plotting_sim_data),
    ];

    graph.clearGraph();
    graph.runGraph(actual_data, [1, 0, 0], scale);
    graph.runGraph(plotting_sim_data, [0, 0, 1], scale);

    pso_interface.setAxes(0, actual_data.length, scale[0], scale[1]);

  };
});
