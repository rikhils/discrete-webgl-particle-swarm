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

  const graph_canvas = document.getElementById('graph_canvas');
  const error_canvas = document.getElementById('error_canvas');

  let pso;
  const graph = new Graph(graph_canvas);
  const error_graph = new Graph(error_canvas);
  const pso_interface = new PsoInterface();

  pso_interface.displayBounds(Pso.getEnv());
  pso_interface.displayModelParameters();
  pso_interface.displayStimulusParameters();

  document.getElementById('reset_bounds').onclick = () => {
    pso_interface.displayBounds(Pso.getEnv());
  };

  pso_interface.add_button.onclick = () => pso_interface.addInput();
  pso_interface.remove_button.onclick = () => pso_interface.removeInput();
  pso_interface.fit_all_button.onclick = () => pso_interface.setFitCheckboxes(true);
  pso_interface.fit_none_button.onclick = () => pso_interface.setFitCheckboxes(false);
  pso_interface.plot_from_vals_button.onclick = () => {
    if (!pso) {
      alert('A fit must be created before modifying the parameters');
      return;
    }

    displayGraph(pso_interface.plotting_idx, pso_interface.get_current_values());
  };

  pso_interface.model_select.addEventListener('change', () => pso_interface.displayModelParameters());
  pso_interface.stim_biphasic_checkbox.addEventListener('change', () => pso_interface.displayStimulusParameters());

  pso_interface.save_params_button.onclick = () => pso_interface.saveParams();
  pso_interface.save_run_button.onclick = () => pso_interface.saveRunDetails();

  pso_interface.data_section.onclick = async (e) => {
    if (e.target.getAttribute('class') === 'plot-data-button') {
      const idx = Array.from(pso_interface.data_section.children).indexOf(e.target.parentElement);

      if (idx !== -1) {
        pso_interface.update_plot_idx(idx);
        if (pso && idx < pso.env.simulation.period.length) {
          displayGraph(idx);
        } else {
          displayDataGraph(idx).catch(err => alert(err));
        }
      }
    }
  };

  // Start with a single data file input
  pso_interface.addInput();

  const run_pso = async () => {
    const hyperparams = pso_interface.getHyperparams();
    pso = new Pso(hyperparams.particle_count);
    const input_data = await pso_interface.getAllInputData();

    const start_time = Date.now();

    pso.setupEnv(
      pso_interface.model_select.value,
      pso_interface.getBounds(),
      pso_interface.getStimulusParameters(),
      pso_interface.data_pre_beats.value,
      pso_interface.data_num_beats.value,
      pso_interface.data_sample_interval.value,
      hyperparams,
    );

    pso.readData(input_data, pso_interface.normalization.value);

    pso.initializeTextures();
    pso.setupAllSolvers();

    const best_error_list = [];
    runPsoIterations(0, hyperparams.iteration_count, best_error_list, start_time);
  };

  async function runPsoIterations(iter, iter_count, best_error_list, start_time) {
    pso_interface.updateStatusDisplay(iter, iter_count);

    if (iter < iter_count) {
      console.log(pso.env.particles.best_error_value);
      pso.runOneIteration();
      best_error_list.push(pso.env.particles.best_error_value);
      window.requestAnimationFrame(() => runPsoIterations(iter+1, iter_count, best_error_list, start_time));
    } else {
      finalizePso(start_time, best_error_list);
    }
  }

  async function finalizePso(start_time, best_error_list) {
    const bestArr = pso.env.particles.global_bests;
    pso_interface.displayResults(bestArr);
    pso_interface.displayError(pso.env.particles.best_error_value);

    error_graph.clearGraph();
    error_graph.runGraph(best_error_list, [0, 0, 0], best_error_list.length, [Math.min(...best_error_list), Math.max(...best_error_list)]);

    displayGraph(0);

    console.log("Execution time (ms):");
    console.log(Date.now() - start_time);
  }

  async function displayDataGraph(cl_idx) {
    const input_data = await pso_interface.getAllInputData();
    if (input_data[cl_idx].datatype !== 'trace') {
      return;
    }
    const raw_text = input_data[cl_idx].data;
    const actual_data = raw_text.split('\n').filter(x => !(x.trim() === ""));

    const scale = [Math.min(...actual_data), Math.max(...actual_data)];

    graph.clearGraph();
    graph.runGraph(actual_data, [0, 0, 0], actual_data.length, scale);
  }

  const apd_start_indices = (data, apd_thresh) => {
    let in_ap = false;
    const idxs = [];

    for (let i = 0; i < data.length; ++i) {
      if (!in_ap && data[i] > apd_thresh) {
        in_ap = true;
        idxs.push(i);
      } else if (in_ap && data[i] < apd_thresh) {
        in_ap = false;
      }
    }

    return idxs;
  };

  function displayGraph(cl_idx, current_values) {
    const simulation_data = current_values ?
      pso.runFinalSimulationSolver(cl_idx, current_values) :
      pso.runFinalSimulationSolver(cl_idx);

    const sim_length = (pso.env.simulation.period[cl_idx] * pso.env.simulation.num_beats) / pso.env.simulation.sample_interval;
    const plotting_sim_data = simulation_data.slice(-sim_length);

    let actual_data = [];
    let apd_starts = [];
    let apd_ends = [];
    let align_index = 0;

    if (pso.env.simulation.datatypes[cl_idx] === 'apds') {
      // apd_starts = apd_start_indices(plotting_sim_data, pso.env.simulation.apd_threshs[cl_idx]).map(x => x / pso.env.simulation.sample_interval);
      apd_starts = apd_start_indices(plotting_sim_data, pso.env.simulation.apd_threshs[cl_idx]);
      const apds = pso.env.simulation.trimmed_data[cl_idx];
      apd_ends = apd_starts.map((x, idx) => x + (apds[idx] || 0) / pso.env.simulation.sample_interval);
    } else {
      actual_data = pso.env.simulation.trimmed_data[cl_idx];
      const align_thresh = actual_data.find(x => x > 0.15);
      align_index = plotting_sim_data.findIndex(x => x > align_thresh);
    }

    const scale = [
      Math.min(...actual_data, ...plotting_sim_data),
      Math.max(...actual_data, ...plotting_sim_data),
    ];

    const interval = Number(pso_interface.data_sample_interval.value);

    graph.clearGraph();
    if (pso.env.simulation.datatypes[cl_idx] === 'apds') {
      for (let i = 0; i < apd_starts.length; ++i) {
        graph.runApdGraph(apd_starts[i], apd_ends[i], pso.env.simulation.apd_threshs[cl_idx], [0, 0, 0], sim_length, scale, 0);
      }
    } else {
      graph.runGraph(actual_data, [0, 0, 0], sim_length, scale, align_index);
    }
    graph.runGraph(plotting_sim_data, [1, 0, 0], sim_length, scale, 0);

    pso_interface.setAxes(0, sim_length * interval, scale[0], scale[1]);
  }

  document.querySelector('button#PSO_button').onclick = () => run_pso();
});
