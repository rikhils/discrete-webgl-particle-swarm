#!/usr/bin/env python3

import json
import math
import numpy as np
import matplotlib.pyplot as plt
# from matplotlib.animation import FuncAnimation, PillowWriter
import matplotlib;
import matplotlib.animation as animation



particles_w = 32;
particles_h = 32;


# particles_w = 16;
# particles_h = 16;

# particles_w = 8;
# particles_h = 8;

tex_w = particles_w * 2;
tex_h = particles_h * 2;

################################################################################
## Parameter set for Fenton-Karma
################################################################################
# num_params = 13;
# param_names = ['TR',
# 'TSI',
# 'TWP',
# 'TD',
# 'TVP',
# 'TV1M',
# 'TV2M',
# 'TWM',
# 'TO',
# 'XK',
# 'UCSI',
# 'UC',
# 'UV'];


################################################################################
## Parameter set for Bueno-Orovio
################################################################################
num_params = 27;
param_names = ['thv',
'tv1m',
'tv2m',
'tvp',
'uwm',
'tso1',
'kso',
'ts1',
'ts2',
'ks',
'tw1m',
'tw2m',
'tw1p',
'tfi',
'to1',
'to2',
'tso2',
'uso',
'us',
'tsi1',
'thw',
'thvm',
'tho',
'kwm',
'twinf',
'winfstar',
'uu'];


################################################################################
## Parameter set for Bueno-Orovio Brugada
################################################################################
# num_params = 39;
# param_names = ['tv1p',
# 'tv1m',
# 'tv2m',
# 'tw1p',
# 'tw2p',
# 'tw1m',
# 'tw2m',
# 'ts1',
# 'ts2',
# 'tfi',
# 'to1',
# 'to2',
# 'tso1',
# 'tso2',
# 'tsi1',
# 'tsi2',
# 'twinf',
# 'thv',
# 'thvm',
# 'thvinf',
# 'thw',
# 'thwinf',
# 'thso',
# 'thsi',
# 'tho',
# 'ths',
# 'kwp',
# 'kwm',
# 'ks',
# 'kso',
# 'ksi',
# 'uwm',
# 'us',
# 'uo',
# 'uu',
# 'uso',
# 'sc',
# 'wcp',
# 'winfstar'];

num_textures = math.ceil(num_params/16);

# with open("convergence_data_32itr.json") as infile:
# 	data = json.load(infile)

with open("convergence_data.json") as infile:
	data = json.load(infile)

with open("error_data.json") as infile:
	error = json.load(infile);

with open("velocity_data.json") as infile:
	vels = json.load(infile);

itr_keys = np.array([int(i) for i in data.keys()]);
final_itr = itr_keys.max();

tex_keys = np.array([int(i) for i in data['0'].keys()]);

param_keys = np.array([int(i) for i in data['0']['0'].keys() ]);


# Unnecessary
itr_keys.sort();
tex_keys.sort();
param_keys.sort();

iteration_data = [[None for i in range(num_textures)] for j in range(final_itr+1)];
iteration_error = [None for i in range(final_itr+1)];
iteration_vels = [[None for i in range(num_textures)] for j in range(final_itr+1)];

# After this I have all the textures from all the iterations indexable. Then I
# need to reshape, then I need to compose them into actual arrays.

# I can definitely collapse the list comprehension loops but not right now
for i in itr_keys:
	iteration_error[i] = np.array( [error[str(i)][str(k)] for k in param_keys ] );
	for j in range(num_textures):
		iteration_data[i][j] = np.array([ data[str(i)][str(j)][str(k)] for k in param_keys]);
		iteration_vels[i][j] = np.array([ vels[str(i)][str(j)][str(k)] for k in param_keys]);



# This is just always going to be 4 for rgba.
nchannels = 4;

# Set up arrays containing the indices for the 4 block matrices in each
# texture so I can pull them out. block 1 is the first (top-left) quadrant,
# block two is top-right, three is bottom left, 4 is bottom-right.
block1_idx = [r*tex_w*nchannels + c*nchannels + channel for r in range(particles_h) for c in range(particles_w) for channel in range(nchannels)];
block2_idx = [idx + particles_w*nchannels for idx in block1_idx];
block3_idx = [idx + 2 * particles_w * particles_h*4 for idx in block1_idx];
block4_idx = [idx + particles_w * nchannels for idx in block3_idx];


iterations = [];
flat_vels = [];
error_blocks = [None for i in range(final_itr+1)];
data_blocks = [None for i in range(final_itr+1)];



# This big ugly loop pulls out and reshapes the data into two different
# formats for both error and data (parameter values)
for itr_idx, itr in enumerate(iteration_data):
	iterations.append([None for p in range(num_params)]);
	flat_vels.append([None for p in range(num_params)]);
	textures = [];
	error1 = iteration_error[itr_idx][block1_idx];
	error2 = iteration_error[itr_idx][block2_idx];
	error3 = iteration_error[itr_idx][block3_idx];
	error4 = iteration_error[itr_idx][block4_idx];
	error1 = error1.reshape([particles_h,particles_w,nchannels]);
	error2 = error2.reshape([particles_h,particles_w,nchannels]);
	error3 = error3.reshape([particles_h,particles_w,nchannels]);
	error4 = error4.reshape([particles_h,particles_w,nchannels]);
	error_blocks[itr_idx] = np.stack((error1,error2,error3,error4));
	tex_blocks = [None for i in range(num_textures)];
	vel_tex_blocks = [None for i in range(num_textures)];
	cur_vel_itr = iteration_vels[itr_idx];
	for tex_idx, tex in enumerate(itr):
		block1 = tex[block1_idx];
		block2 = tex[block2_idx];
		block3 = tex[block3_idx];
		block4 = tex[block4_idx];
		vblock1 = cur_vel_itr[tex_idx][block1_idx];
		vblock2 = cur_vel_itr[tex_idx][block2_idx];
		vblock3 = cur_vel_itr[tex_idx][block3_idx];
		vblock4 = cur_vel_itr[tex_idx][block4_idx];
		block1 = block1.reshape([particles_h,particles_w,nchannels]);
		block2 = block2.reshape([particles_h,particles_w,nchannels]);
		block3 = block3.reshape([particles_h,particles_w,nchannels]);
		block4 = block4.reshape([particles_h,particles_w,nchannels]);
		vblock1 = vblock1.reshape([particles_h,particles_w,nchannels]);
		vblock2 = vblock2.reshape([particles_h,particles_w,nchannels]);
		vblock3 = vblock3.reshape([particles_h,particles_w,nchannels]);
		vblock4 = vblock4.reshape([particles_h,particles_w,nchannels]);
		blocks = np.stack((block1,block2,block3,block4));
		vblocks = np.stack((vblock1,vblock2,vblock3,vblock4));
		tex_blocks[tex_idx] = blocks;
		p_offset = tex_idx*16;
		for block_idx, block in enumerate(blocks):
			for p_cur in range(nchannels):
				p_real = p_cur + block_idx * nchannels + p_offset;
				if(p_real >= num_params):
					break;
				iterations[itr_idx][p_cur + block_idx * nchannels + p_offset] = block[:,:,p_cur].ravel();
				flat_vels[itr_idx][p_cur + block_idx * nchannels + p_offset] = vblocks[block_idx][:,:,p_cur].ravel();
	data_blocks[itr_idx] = np.array(tex_blocks);



# I think the _blocks data structures are kinda unnecessary. I don't think the
# order gets mixed around in any way during the raveling, so index i in error
# or iterations should always correspond to paritcle i?

# iterations is now a flattened array with shape
# (num_iterations, num_params, num_particles).
iterations = np.array(iterations);
flat_vels = np.array(flat_vels);

# data_blocks contains the same information as iterations, but with a
# different, uglier shape that is still desirable for some things. The shape
# is:

# (num_iterations, num_textures, 4, particles_height, particles_width,4)

# Where num_textures is how many textures we need to hold all the
# parameters for each particle (ceil(num_params / 16)), and the 4s represent
# the 4 submatrices of each texure and the number of channels per pixel,
# respectively.
data_blocks = np.array(data_blocks);

# Error blocks has the same shape as data_blocks, except without the index for
# num_textures, since we'll only ever have the one texture for error
# (at present time, anyway). Channel 0 is the one that holds the error values.

# Also, I'm realizing that this is delayed by 1 compared to the data. I.E.
# after running one PSO iteration, the error is the error value of
# the *previous* iterations' particles' positions. We'll need to add one more
# error step to get the error for the final values!
error_blocks = np.array(error_blocks);

# This is the flattened error. shape is (num_iterations, num_particles).
flat_error = np.stack( [error_blocks[i,0,:,:,0].ravel() for i in range(final_itr+1)] ); 


n_itr = len(iterations);

plot_particle = 0;



# plot_param = -2;
# plot_param_2 = -3;
param_name_1 = "thvm";
param_name_2 = "tho";
# param_name_1 = param_names[3];
# param_name_2 = param_names[4];
plot_param = param_names.index(param_name_1);
plot_param_2 = param_names.index(param_name_2);


fig, ax = plt.subplots(nrows=1,ncols=1);
vplot = ax.violinplot(iterations[0][plot_param],showmeans=True);
ax.set_title("Iteration 0");



err_color = np.exp(-1 * flat_error);
# cmapf = plt.cm.plasma;
cmapf = plt.cm.magma;
normf = matplotlib.colors.Normalize(vmin=0,vmax=1);
scatplot, ax_s = plt.subplots(nrows=1,ncols=1);
# minx = math.floor(iterations[0][plot_param].min());
# maxx = math.ceil(iterations[0][plot_param].max());
# miny = math.floor(iterations[0][plot_param_2].min());
# maxy = math.ceil(iterations[0][plot_param_2].max());
minx = iterations[0][plot_param].min();
maxx = iterations[0][plot_param].max();
miny = iterations[0][plot_param_2].min();
maxy = iterations[0][plot_param_2].max();
splot = ax_s.scatter(iterations[0][plot_param],iterations[0][plot_param_2],c=err_color[0],cmap=cmapf,norm=normf);
# splot = ax_s.scatter(iterations[0][plot_param],iterations[0][plot_param_2]);
ax_s.set_title("Iteration %d"%(0));
ax_s.set_xlabel("%s"%(param_names[plot_param]));
ax_s.set_ylabel("%s"%(param_names[plot_param_2]));
ax_s.set_xlim(minx,maxx);
ax_s.set_ylim(miny,maxy);



comp_1 = 0;
comp_2 = 2;


# fig2, ax2 = plt.subplots(nrows = 1, ncols=2);
# p_plot1 = ax2[0].scatter(iterations[0][comp_1],iterations[0][comp_2],c=flat_error[0],cmap=cmapf,norm=normf);
# ax2[0].set_xlabel("%s"%(param_names[comp_1]));
# ax2[0].set_ylabel("%s"%(param_names[comp_2]));
# ax2[0].set_title("First iteration");

# p_plot2 = ax2[1].scatter(iterations[-1][comp_1],iterations[-1][comp_2]);
# ax2[1].set_xlabel("%s"%(param_names[comp_1]));
# ax2[1].set_ylabel("%s"%(param_names[comp_2]));
# ax2[1].set_title("Last iteration");

err_from = 0;
fig_error, ax_e = plt.subplots(nrows=1,ncols=1);
error_plot = ax_e.plot(np.arange(err_from,n_itr),flat_error.mean(axis=1)[err_from:]);
ax_e.set_xlabel("Iteration");
ax_e.set_ylabel("RMSE");
ax_e.set_title("Mean error");




# p_plot3, ax3 = plt.subplots(nrows = 1, ncols = 1);
# ax3.plot(np.arange(0,len(iterations)), iterations[:,plot_param,16]);
# ax3.set_title("Param %s evolution"%(param_names[plot_param]));
# ax3.set_xlabel("iteration");

p_plot4, ax4 = plt.subplots(nrows=2,ncols=1);
ax4[0].plot(iterations[:,plot_param,plot_particle]);
ax4[0].set_title("Particle %d %s values"%(plot_particle,param_names[plot_param]));
ax4[0].set_ylabel(param_names[plot_param]);
ax4[1].plot(flat_error[:,plot_particle]);
ax4[1].set_title("Particle %d error"%(plot_particle));
ax4[1].set_xlabel("iteration");
ax4[1].set_ylabel("curve error");

pstart = 0;
pend = 32; # Need one after what I want because inclusive / exclusive
bigplotm, bigax = plt.subplots(nrows=4,ncols=7);
for pidx, param_name in enumerate(param_names):
	prow = pidx // 7;
	pcol = pidx % 7;
	bigax[prow][pcol].plot(iterations[pstart:pend,pidx,plot_particle]);
	bigax[prow][pcol].set_ylabel(param_name);
	bigax[prow][pcol].fill_between(range(3,15),iterations[pstart:pend,pidx,plot_particle].min(),iterations[pstart:pend,pidx,plot_particle].max(),alpha=0.2);
bigax[-1][-1].plot(flat_error[pstart:pend,plot_particle]);
bigax[-1][-1].set_ylabel("err");
bigax[-1][-1].fill_between(range(3,15),0,flat_error[pstart:pend,plot_particle].max(),alpha=0.2);


# plt.show();

def animate(i):
	ax.clear();
	ax.violinplot(iterations[i][plot_param],showmeans=True);
	ax.set_title("%s Iteration: %d"%(param_names[plot_param],i));
	ax.hlines(y=iterations[i][plot_param][plot_particle], xmin=0.9, xmax=1.1, linewidth=2, color='r');
	ax.set_ylim(minx,maxx);
	# ax.hlines(y=data_blocks[i,0,0,0,0,plot_param], xmin=0.9, xmax=1.1, linewidth=2, color='k');

# quiver_vels = np.stack()

def anim_scatter(i):
	ax_s.clear();
	# ax_s.scatter(iterations[i][plot_param],iterations[i][plot_param_2],c=err_color[i],cmap=cmapf,norm=normf);
	ax_s.scatter(iterations[i][plot_param],iterations[i][plot_param_2],c=err_color[i],cmap=cmapf,norm=normf,edgecolors="black");
	# ax_s.quiver(iterations[i][plot_param],iterations[i][plot_param_2],flat_vels[i][plot_param],flat_vels[i][plot_param_2],width=0.0025);
	# ax_s.scatter(iterations[i][plot_param],iterations[i][plot_param_2]);
	ax_s.set_title("Iteration %d"%(i));
	ax_s.set_xlabel("%s"%(param_names[plot_param]));
	ax_s.set_ylabel("%s"%(param_names[plot_param_2]));
	# ax_s.plot(iterations[i][plot_param][plot_particle],iterations[i][plot_param_2][plot_particle],'kx',markersize=16,markeredgewidth=2);
	# ax_s.plot(iterations[i][plot_param][plot_particle],iterations[i][plot_param_2][plot_particle],'wo',markersize=16,markerfacecolor="None",markeredgewidth=2);
	ax_s.set_xlim(minx,maxx);
	ax_s.set_ylim(miny,maxy);



anim_scatter(0);
animate(0);
v_ani = animation.FuncAnimation(fig, animate, np.arange(0, n_itr), interval=200, blit=False);
v_scatter = animation.FuncAnimation(scatplot,anim_scatter,np.arange(0,n_itr),interval=200,blit=False);
plt.show();
# v_ani.save("TestAnimation.mp4");
# v_scatter.save("TestScatterAnimation_1.mp4");
# v_ani = animation.FuncAnimation(fig, animate, np.arange(1, 200), fargs=(data,), interval=50, blit=False);
