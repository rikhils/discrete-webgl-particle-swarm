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

  pso_interface.displayEnv(Pso.getEnv());

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

    pso.setupEnv();
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
    pso.setupFinalSimulationSolver(bestArr);
    const simulation_data = pso.runFinalSimulationSolver();

    console.log(bestArr);
    console.log("Final best error: " + pso.env.particles.best_error_value);

    console.log("Elapsed time:\t" + (Date.now() - start_time)+ "ms.\n");

    const scale = [
      Math.min(...actual_data, ...simulation_data),
      Math.max(...actual_data, ...simulation_data),
    ];

    graph.clearGraph();
    graph.runGraph(actual_data, [1, 0, 0], scale);
    graph.runGraph(simulation_data, [0, 0, 1], scale);
  };
});
