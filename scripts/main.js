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

  let num_cyclelengths = 1;
  let plotting_cycleclength = 1;

  let raw_text_1 = null;
  let raw_text_2 = null;
  let raw_text_3 = null;

  let actual_data = [];
  let data_arrays = [];

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    try {
      const fileContents = await readUploadedFileAsText(file);
      raw_text_1 = fileContents;
      // run_PSO();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpload_2 = async (event) => {
    const file = event.target.files[0];

    try {
      const fileContents = await readUploadedFileAsText(file);
      raw_text_2 = fileContents;
      // run_PSO();
    } catch (e) {
      alert(e.message);
    }
  };


    const handleUpload_3 = async (event) => {
    const file = event.target.files[0];

    try {
      const fileContents = await readUploadedFileAsText(file);
      raw_text_3 = fileContents;
      // run_PSO();
    } catch (e) {
      alert(e.message);
    }
  };


  function outer_display()
  {
    pso_interface.display_all_params(pso_interface);
  }

  function numCL_change(e)
  {
    num_cyclelengths = parseInt(e.target.value);
    console.log(num_cyclelengths);
  }

function plotCL_change(e)
{
  plotting_cycleclength = parseInt(e.target.value);
  if(plotting_cycleclength <= num_cyclelengths)
  {
    displayGraph(plotting_cycleclength-1);
  }
}

  document.querySelector('input#my_file').addEventListener('change', handleUpload);
  document.querySelector('input#my_file_2').addEventListener('change', handleUpload_2);
  document.querySelector('input#my_file_3').addEventListener('change', handleUpload_3);
  document.querySelector('button#PSO_button').onclick = run_PSO;
  // document.querySelector('button#disp_params_button').onclick = pso_interface.display_all_params(pso_interface);
  document.querySelector('button#disp_params_button').onclick = outer_display;
  // document.querySelector('button#disp_params_button').onclick = function() {alert("hello")};
  document.querySelector('select#numCL_select').addEventListener('change',numCL_change);
  document.querySelector('select#plot_CL_select').addEventListener('change',plotCL_change);


  function run_PSO() {
    const start_time = Date.now();

    let cls = [];

    document.getElementById('plot_CL_select').selectedIndex = 0;

    switch(num_cyclelengths)
    {
      case 3:
        cls.push(pso_interface.data_cl_3.value);
      case 2:
        cls.unshift(pso_interface.data_cl_2.value);
      case 1:
        cls.unshift(pso_interface.data_cl_1.value);
        break;
    }

    // pso.setupEnv(pso_interface.getBounds(), pso_interface.data_cl.value, pso_interface.data_num_beats.value, pso_interface.data_sample_interval.value);
    pso.setupEnv(pso_interface.getBounds(), cls, pso_interface.data_pre_beats.value, pso_interface.data_num_beats.value, pso_interface.data_sample_interval.value);
    // const [actual_data, data_array] = pso.readData(raw_text, pso_interface.normalization.value);

    actual_data = [];
    data_arrays = [];


    let temp_actData = null;
    let temp_data_array = null;

    switch(num_cyclelengths)
    {
      case 3:
        [temp_actData, temp_data_array] = pso.readData(raw_text_3, pso_interface.normalization.value);
        actual_data.push(temp_actData);
        data_arrays.push(temp_data_array);
      case 2:
        [temp_actData, temp_data_array] = pso.readData(raw_text_2, pso_interface.normalization.value);
        actual_data.unshift(temp_actData);
        data_arrays.unshift(temp_data_array);
      case 1:
        [temp_actData, temp_data_array] = pso.readData(raw_text_1, pso_interface.normalization.value);
        actual_data.unshift(temp_actData);
        data_arrays.unshift(temp_data_array);
        break;
    }


    const init_arrays = pso.initializeParticles();
    pso.initializeTextures(data_arrays, init_arrays);
    // Re-running the setup every time could be replaced by updating the uniforms
    pso.setupAllSolvers();

    for (let i = 0; i < 32; ++i) {
      console.log(pso.env.particles.best_error_value);
      pso.runOneIteration();
    }

    const bestArr = pso.getGlobalBests();
    pso_interface.displayResults(bestArr);
    pso_interface.displayError(pso.env.particles.best_error_value);


    displayGraph(0, Number(pso_interface.data_sample_interval.value));

    console.log("Execution time (ms):");
    console.log(Date.now() - start_time);

    // const simulation_data = pso.runFinalSimulationSolver();

    // const align_index = simulation_data.findIndex(number => number > 0.15);
    // const plotting_sim_data = simulation_data.slice(align_index);

    // const scale = [
    //   Math.min(...actual_data, ...plotting_sim_data),
    //   Math.max(...actual_data, ...plotting_sim_data),
    // ];

    // const num_points = Math.max(actual_data.length, plotting_sim_data.length);

    // graph.clearGraph();
    // graph.runGraph(actual_data, [1, 0, 0], num_points, scale);
    // graph.runGraph(plotting_sim_data, [0, 0, 1], num_points, scale);

    // pso_interface.setAxes(0, num_points, scale[0], scale[1]);

  };



  function displayGraph(cl_idx, interval) {
    // const bestArr = pso.getGlobalBests();
    // pso_interface.displayResults(bestArr);
    // pso_interface.displayError(pso.env.particles.best_error_value);
    // pso.setupFinalSimulationSolver(bestArr);
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


});


