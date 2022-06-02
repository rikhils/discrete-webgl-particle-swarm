/* global require */
require([
  'scripts/graph',
  'scripts/interface',
  'scripts/pso',
], function(
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

  pso_interface.add_button.onclick = () => pso_interface.addInput();
  pso_interface.remove_button.onclick = () => pso_interface.removeInput();

  // Start with a single data file input
  pso_interface.addInput();

  const outer_display = () => {
    pso_interface.display_all_params(pso_interface);
  };

  const run_pso = async () => {
    const input_data = await pso_interface.getAllInputData();

    const start_time = Date.now();

    pso.setupEnv(
      pso_interface.getBounds(),
      input_data,
      pso_interface.data_pre_beats.value,
      pso_interface.data_num_beats.value,
      pso_interface.data_sample_interval.value,
    );

    const init_arrays = pso.initializeParticles();
    const data_arrays = [];
    const trimmed_arrays = [];

    for (const [raw,] of input_data) {
      const [trimmed, complete] = pso.readData(raw, pso_interface.normalization.value);
      data_arrays.push(complete);
      trimmed_arrays.push(trimmed);
    }

    pso.initializeTextures(data_arrays, init_arrays);
    pso.setupAllSolvers();

    for (let i = 0; i < 32; ++i) {
      console.log(pso.env.particles.best_error_value);
      pso.runOneIteration();
    }

    const bestArr = pso.getGlobalBests();
    pso_interface.displayResults(bestArr);
    pso_interface.displayError(pso.env.particles.best_error_value);

    displayGraph(0, Number(pso_interface.data_sample_interval.value), trimmed_arrays);

    console.log("Execution time (ms):");
    console.log(Date.now() - start_time);
  };

  function displayGraph(cl_idx, interval, actual_data) {
    const simulation_data = pso.runFinalSimulationSolver(cl_idx);

    const align_index = simulation_data.findIndex(number => number > 0.15);
    const plotting_sim_data = simulation_data.slice(align_index);

    const scale = [
      Math.min(...actual_data[cl_idx], ...plotting_sim_data),
      Math.max(...actual_data[cl_idx], ...plotting_sim_data),
    ];

    const num_points = Math.max(actual_data[cl_idx].length, plotting_sim_data.length);

    graph.clearGraph();
    graph.runGraph(actual_data[cl_idx], [0, 0, 0], num_points, scale);
    graph.runGraph(plotting_sim_data, [1, 0, 0], num_points, scale);

    pso_interface.setAxes(0, num_points * interval, scale[0], scale[1]);
  }

  document.querySelector('button#PSO_button').onclick = run_pso;
  document.querySelector('button#disp_params_button').onclick = outer_display;
});
