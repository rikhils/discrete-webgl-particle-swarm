bpc = 6; # Beats per period
# periods = [400,320,220];
# periods = [400,350,320];
periods = [500, 400, 320, 300, 280, 260, 240, 220, 200, 190, 180, 170, 160, 150, 140, 130, 120];
gracevAL = 2
thresh = 0.15;

def linterp(x0, y0, x1, y1, x):
	y = ( (y0*(x1 - x)) + (y1 * (x-x0)) )/(x1 - x0);
	# print("Interpolated " + str(y));
	return y;

APs = [];

p_idx = 0;

for CL in periods:

	idx_ap = 0;


	vals = [];

	CL_APs = [];

	with open ('ap' + str(periods[p_idx])+"b.dat","r") as apfile:
		for line in apfile:
			vals.append(float(line));

	minVal = min(vals);

	adjusted_vals = [x - minVal for x in vals];

	# if(CL == 500):
	# 	with open("ap500b_pushed.dat","w") as dumpfile:
	# 		for value in adjusted_vals:
	# 			dumpfile.write(str(value) + "\n");	

	maxVal = max(adjusted_vals);

	#normalized vals
	norm_vals = [x/maxVal for x in adjusted_vals];

	# if(CL == 500):
	# 	with open("ap500b_norma.dat","w") as dumpfile:
	# 		for value in norm_vals:
	# 			dumpfile.write(str(value) + "\n");


	#Skip possible partial first AP
	while(norm_vals[idx_ap] > thresh):
		idx_ap += 1;

	while(idx_ap < len(norm_vals)):
		# Go to next upstroke

		while( idx_ap < len(norm_vals) and norm_vals[idx_ap] < thresh):
			idx_ap += 1;

		if(idx_ap >= len(norm_vals)):
			# print("Messed upstroke in CL "+str(CL));
			break;


		# if (CL == 500):
		# 	print("upstroke at "+str(idx_ap));
		upstroke = linterp( norm_vals[idx_ap-1], idx_ap-1, norm_vals[idx_ap], idx_ap, thresh );


		# To downstroke
		while( idx_ap < len(norm_vals) and norm_vals[idx_ap] > thresh):
			idx_ap += 1;

		if(idx_ap >= len(norm_vals)):
			# print("Messed downstroke in CL "+str(CL));
			break;


		# if (CL == 500):
		# 	print("downstroke at "+str(idx_ap));
		downstroke = linterp( norm_vals[idx_ap-1], idx_ap-1, norm_vals[idx_ap], idx_ap, thresh );		

		CL_APs.append((CL, downstroke - upstroke ));
		# print(downstroke - upstroke);

	# print(CL_APs);

	if(len(CL_APs) < 2):
		print("Fucked");
		APs.append((CL,-1));
		APs.append((CL,-1));
		continue;
	else:
		APs.append(CL_APs[-2]);
		APs.append( CL_APs[-1]) ;
	p_idx += 1;

for i in range(0,len(APs),2):
	(CL1, AP1) = APs[i];
	(CL2, AP2) = APs[i+1];

	if(AP1 > AP2):
		print( str(CL1) +" "+str(AP1) );
		print( str(CL2) +" "+str(AP2) );
	else:
		print( str(CL2) +" "+str(AP2) );
		print( str(CL1) +" "+str(AP1) );		

# for (CL_, AP_) in APs:
# 	print(str(CL_) + " " + str(AP_));