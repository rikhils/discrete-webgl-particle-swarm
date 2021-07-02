/* global define */
define('scripts/interface', [
], function(
) {
  'use strict';

  return class PsoInterface {
    static paramList = ['tr', 'tsi', 'twp', 'td', 'tvp', 'tv1m', 'tv2m', 'twm', 'to', 'xk', 'ucsi', 'uc', 'uv'];

    constructor() {
      PsoInterface.paramList.forEach(param => {
        this[param + '_val'] = document.getElementById(param + '_val');
        this[param + '_min'] = document.getElementById(param + '_min');
        this[param + '_max'] = document.getElementById(param + '_max');
        this[param + '_fit'] = document.getElementById(param + '_fit');

        this[param + '_prev_min'] = -1;
        this[param + '_prev_max'] = -1;

        // This is so dumb...
        var outer_interface = this;
        this[param + '_fit'].addEventListener('change', function() {
            if(this.checked)
            {

              outer_interface[param + '_val'].removeAttribute('readonly');
              outer_interface[param + '_min'].removeAttribute('readonly');
              outer_interface[param + '_max'].removeAttribute('readonly');


              outer_interface[param + '_min'].value = outer_interface[param + '_prev_min'];
              outer_interface[param + '_max'].value = outer_interface[param + '_prev_max'];

            }
            else
            {
              outer_interface[param+'_prev_min'] = outer_interface[param + '_min'].value;
              outer_interface[param + '_min'].value = outer_interface[param + '_val'].value;

              outer_interface[param+'_prev_max'] = outer_interface[param + '_max'].value;
              outer_interface[param + '_max'].value = outer_interface[param + '_val'].value;

              outer_interface[param + '_val'].setAttribute('readonly', true);
              outer_interface[param + '_min'].setAttribute('readonly', true);
              outer_interface[param + '_max'].setAttribute('readonly', true);


            }

        });

      });

      this.fit_error = document.getElementById('fit_error');
      this.xmin = document.getElementById('xmin');
      this.xmax = document.getElementById('xmax');
      this.ymin = document.getElementById('ymin');
      this.ymax = document.getElementById('ymax');
    }

    displayBounds(env) {
      const bounds = env.bounds.flat(1);

      PsoInterface.paramList.forEach((param, idx) => {
        if(this[param + '_fit'].checked)
        {
          const [min, max] = bounds[idx];
          this[param + '_min'].value = min;
          this[param + '_max'].value = max;
        }
      });
    }

    displayResults(bestArr) {
      PsoInterface.paramList.forEach((param, idx) => {
        this[param + '_val'].value = bestArr[idx];
      });
    }

    displayError(error) {
      this.fit_error.innerHTML = error;
    }

    getBounds() {
      const bounds = [[], [], [], []];

      PsoInterface.paramList.forEach((param, idx) => {
        bounds[Math.floor(idx/4)].push([Number(this[param + '_min'].value), Number(this[param + '_max'].value)]);
      });

      // Fill out the remaining values
      for (let i = 0; i < 3; ++i) {
        bounds[3].push([0, 0]);
      }

      return bounds;
    }

    setAxes(xmin, xmax, ymin, ymax) {
      this.xmin.innerHTML = xmin;
      this.xmax.innerHTML = xmax;
      this.ymin.innerHTML = ymin;
      this.ymax.innerHTML = ymax;
    }
  };
});
