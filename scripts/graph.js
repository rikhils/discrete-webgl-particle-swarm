/* global define */
define('scripts/graph', [
  'text!shaders/graph.vert',
  'text!shaders/graph.frag',
], function(
  GraphVertexShader,
  GraphFragmentShader,
) {
  'use strict';

  return class Graph {
    constructor() {
      this.canvas = document.getElementById('graph_canvas');
      this.gl = this.canvas.getContext('webgl2');
      this.gl.getExtension('EXT_color_buffer_float');
      this.gl.getExtension('OES_texture_float_linear');

      this.info = this.setupGraph();
    }

    /*
     * Attempt to compile a shader and return the result.
     */
    loadShader(type, source) {
      const gl = this.gl;

      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      // Alert if there are any compilation errors.
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    /*
     * Attempt to create a shader program from a vertex/fragment shader pair.
     */
    loadShaderProgram(vertexShaderSource, fragmentShaderSource) {
      const gl = this.gl;

      const vertexShader = this.loadShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      // Alert if there are any linker errors.
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return shaderProgram;
    }

    /*
     * Set up the persistent attributes graphing shader program. This method only needs to be called
     * once.
     */
    setupGraph() {
      const gl = this.gl;

      const info = {};

      const uniforms = ['color', 'num_points', 'min_val', 'max_val'];

      info.program = this.loadShaderProgram(GraphVertexShader, GraphFragmentShader);
      gl.useProgram(info.program);

      // The shader program tracks each uniform with a location, which is used to update the uniform
      // data.
      info.uniform_locations = uniforms.map(u => gl.getUniformLocation(info.program, u));
      // The uniforms must be set each time the program is run, but the process is the same.
      info.set_uniforms = (uniform_locations, uniform_values) => {
        gl.uniform3fv(uniform_locations[0], uniform_values['color']);
        gl.uniform1i(uniform_locations[1], uniform_values['num_points']);
        gl.uniform1f(uniform_locations[2], uniform_values['min_val']);
        gl.uniform1f(uniform_locations[3], uniform_values['max_val']);
      };

      return info;
    }

    /*
     * Load the data to be graphed into the vertex array.
     */
    useGraphVertexBuffer(program, graph_buffer) {
      const gl = this.gl;

      gl.bindBuffer(gl.ARRAY_BUFFER, graph_buffer);

      const vertex_loc = gl.getAttribLocation(program, 'position');

      gl.vertexAttribPointer(
        vertex_loc,
        2, // num components per point
        gl.FLOAT, // type
        false, // normalize
        0, // stride
        0, // offset
      );

      gl.enableVertexAttribArray(vertex_loc);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    /*
     * Convert the points to be graphed into an array with the following form
     *   [a, b, c, ...] -> [0,a, 1,b, 2,c, ...]
     * and extract other useful information
     */
    processGraphData(graph_points, color) {
      const gl = this.gl;

      const uniform_values = {};

      uniform_values.color = color;
      uniform_values.num_points = graph_points.length;
      uniform_values.min_val = Math.min(...graph_points);
      uniform_values.max_val = Math.max(...graph_points);

      const graph_array = new Float32Array(2 * uniform_values.num_points);
      for (let i = 0; i < uniform_values.num_points; ++i) {
        graph_array[2*i] = i;
        graph_array[2*i + 1] = graph_points[i];
      }

      const graph_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, graph_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, graph_array, gl.DYNAMIC_DRAW, 0);

      return { graph_buffer, uniform_values };
    }

    /*
     * Render the graphing shader program.
     */
    runGraph(graph_points, color) {
      const gl = this.gl;

      const { graph_buffer, uniform_values } = this.processGraphData(graph_points, color);

      // No need to resize the canvas or set the viewport

      const { program, uniform_locations, set_uniforms } = this.info;
      gl.useProgram(program);
      set_uniforms(uniform_locations, uniform_values);

      // Clear the canvas
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // This is purely 2D, so no need for depth test or face culling

      this.useGraphVertexBuffer(program, graph_buffer);

      gl.drawArrays(gl.LINE_STRIP, 0, graph_points.length);
    }
  };
});
