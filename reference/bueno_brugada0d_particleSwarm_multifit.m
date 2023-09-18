% Bueno Brugada model in 0d ring
a = load('AP_Row110_Col33.txt');
%plot(a)
% t = 0:length(a)-1;
offset=125;
% plot(t,a,t-offset,a)
% offset=195;
a = a(offset:end);
a=a(1:850);
% a = a(offset:offset+950);
plot(a)

%%
% this one was obtained using chifactor = 0.25
% min error =     0.68
% ts1 =   5.7217, ts2 =  89.8436, ks= 11.4261, us =   0.3225
% tsi1 =  14.2069, tsi2 =   2.8518, ksi= 16.9593, sc =   0.7856
% tso1 = 166.7292, tso2 =   2.2512, kso=  2.2801, uso =   0.4473
% tw1p =  54.1341, tw2p = 258.0502, tw1m=168.0619, tw2m =  35.1021
% kwp =   7.5548, kwm = 108.1307, wcp =  0.2521, uwm =   0.0888
% this one was obtained using chifactor = 0.05
% min error =     0.72
% ts1 =   7.6724, ts2 =  83.7753, ks=  9.1739, us =   0.3814
% tsi1 =  19.4353, tsi2 =   3.5514, ksi= 12.7790, sc =   0.7925
% tso1 = 168.0828, tso2 =   1.8604, kso=  2.0283, uso =   0.4829
% tw1p =  66.8495, tw2p = 254.9031, tw1m=141.9683, tw2m =  35.0783
% kwp =   6.9562, kwm = 106.5339, wcp =  0.2650, uwm =   0.1136
% + other params are 
% scalefactor = 2.2;
% tvp=1.4506*4; tv1m=60; tv2m=50; tfi=0.05; 
%to1 = 400; to2=33; tvinf = 0.13; twinf = 1;
% thv=0.13; thvm=0.006; thvinf=2; thw=0.13; thwinf = 0.12; 
% thso=0.2; thsi=0.13; tho=0.006; ths = 0.36; 
% uo=0; uu=1; winfstar=0.94;

% min error =     0.87
% ts1 =   9.9977, ts2 =  88.8937, ks=  8.7707, us =   0.3478
% tsi1 =  15.7082, tsi2 =   2.9668, ksi= 11.2899, sc =   0.7479
% tso1 = 196.9098, tso2 =   1.4949, kso=  1.9687, uso =   0.3216
% tw1p =  56.6580, tw2p = 281.4065, tw1m=352.1013, tw2m =  36.2655
% kwp =   6.2894, kwm = 108.9289, wcp =  0.2852, uwm =   0.0451
% min error =     0.82
% ts1 =   5.2662, ts2 =  80.5028, ks=  5.4450, us =   0.2876
% tsi1 =  15.7783, tsi2 =   2.7759, ksi= 30.7236, sc =   0.8278
% tso1 = 165.3519, tso2 =   1.6742, kso=  2.4620, uso =   0.4978
% tw1p =  53.4813, tw2p = 270.6578, tw1m= 91.9015, tw2m =  21.8029
% kwp =   6.7020, kwm = 108.4099, wcp =  0.2862, uwm =   0.0276
% min error =     0.87 (usinghigher to2=33)
% ts1 =  10.2608, ts2 =  87.6618, ks= 17.2458, us =   0.2940
% tsi1 =  14.6070, tsi2 =   2.5018, ksi= 27.8349, sc =   0.8054
% tso1 = 157.6950, tso2 =   2.3678, kso=  2.3684, uso =   0.4798
% tw1p =  55.7200, tw2p = 239.0254, tw1m=173.9045, tw2m =  35.8916
% kwp =   8.0309, kwm = 139.1446, wcp =  0.2323, uwm =   0.1089
% min error =     1.37
% ts1 =   7.0081, ts2 =  84.5000, ks= 18.0778, us =   0.3628
% tsi1 =  18.0860, tsi2 =   3.6118, ksi= 20.8462, sc =   0.8180
% tso1 = 173.0390, tso2 =   2.7320, kso=  2.1224, uso =   0.4432
% tw1p =  55.1799, tw2p = 279.2673, tw1m=199.1577, tw2m =  20.5008
% kwp =   5.9434, kwm = 102.9571, wcp =  0.2891, uwm =   0.0518
% min error =     1.67
% ts1 =   6.8824, ts2 =  83.1124, ks= 23.8594, us =   0.2789
% tsi1 =  14.1139, tsi2 =   3.1938, ksi= 46.4413, sc =   0.8302
% tso1 = 192.5750, tso2 =   1.8623, kso=  2.5246, uso =   0.4719
% tw1p =  40.0363, tw2p = 270.4187, tw1m=116.9592, tw2m =  23.8133
% kwp =   7.6272, kwm = 129.0851, wcp =  0.2404, uwm =   0.1080
% min error =     1.96
% ts1 =   8.5152, ts2 =  85.9900, ks=  9.1134, us =   0.2786
% tsi1 =  16.5199, tsi2 =   3.2295, ksi= 15.9336, sc =   0.7752
% tso1 = 191.1964, tso2 =   2.1413, kso=  2.8686, uso =   0.5491
% tw1p =  49.6165, tw2p = 254.2905, tw1m=380.4110, tw2m =  38.9449
% kwp =   8.3261, kwm = 120.7268, wcp =  0.2457, uwm =   0.0551

% This data appears to be 1ms resolution, 1000ms time
% offset to first upstroke is maybe 200ms-ish?
%a = load('AP_alternans_Row102_Col132.txt');
%a = load('AP_alternans_Row110_Col33.txt');
% one that Flavio likes
% a = load('AP_alternans_Row129_Col140.txt');
% a = (a-0.07);
% a = a/0.8;
% another that Flavio likes
a = load('AP_Row110_Col33.txt');
%a = (a-0.07);
a = a/0.83;
t = 0:length(a)-1;
offset=125;
a = a(offset:end);
%a = a(offset:offset+950);
a=a(1:850);
plot(a)
%offset=1000;
%plot(t,a,t-offset,a)

usave0 = a;
% particle params
% nparticles = 30;
% trmin = 25;         trmax = 200;

% epi parameter values
% tvp=1.4506;
% tv1m=60;
% tv2m=1150;
% tw1p=200;
% tw2p=200;
% tw1m=60;
% tw2m=15;
% ts1=2.7342;
% ts2=16;
% tfi=0.11;
% to1=400;
% to2=6;
% tso1=30.0181;
% tso2=0.9957;
% tsi1=1.8875;
% tsi2=1.8875;
% tvinf = 0.006; % what is this?
% %twinf=0.07; % this is not in the table
% twinf = 1;
% thv=0.3;
% thvm=0.006;
% thvinf=0.006;
% thw=0.13;
% thwinf=0.13;
% thso=0.13;
% thsi=0.13;
% tho=0.006;
% ths=0.13;
% kwp=5.7; % n/a for epi
% kwm=65;
% ks=2.0994;
% kso=2.0458;
% ksi=97.8; % n/a for epi
% uwm=0.03;
% us=0.9087;
% uo=0;
% uu=1.55;
% uso=0.65;
% sc=0.007; % n/a for epi
% wcp=0.15; % n/a for epi
% winfstar=0.94;

% Brugada model 1 parameter values
% tvp=1.4506;
% tv1m=60;
% tv2m=100;
% tw1p=25;
% tw2p=125;
% tw1p=25;
% tw2p=125;
% tw1m=60;
% tw2m=15;
% tfi=0.04;
% to1=400;
% to2=6;
% tso1=30.0181;
% tso2=0.9957;
% tsi1=7.5476;
% tsi2=1.8875;
% tvinf = 0.13; % what is this?
scalefactor = 2.2;
tvp=1.4506*4;
tv1m=60;
tv2m=50; %tv2m=100;1
tfi=0.05; %tfi=0.04;
to1 = 400;%to1 = 8.85; %to1=400*scalefactor*2.5;
to2=33; %to2 = 8.85; %to2=6*scalefactor*2.5;
tvinf = 0.13; % what is this?
%twinf=0.07; % this is not in the table
twinf = 1;
thv=0.13;
thvm=0.006;
thvinf=2;
thw=0.13;
thwinf = 0.12; %thwinf=0.13;
thso=0.2;%thso = 0.2564; %thso=0.13;
thsi=0.13;
tho=0.006;
ths = 0.36; %ths=0.13;
uo=0;
uu=1;%uu = 0.6; % uu=1.0;
winfstar=0.94;
% ts1=2.7342;
% ts2=35;
% ks=5.8;
% us=0.35;
% tso1=30.0181*scalefactor;
% tso2=0.9957*scalefactor;
% kso=2.0458;
% uso=0.65;
% tw1p=25*scalefactor;
% tw2p=125*scalefactor;
% tw1m=60*scalefactor;
% tw2m=15*scalefactor;
% kwp=5.7; % n/a for epi
% kwm=65;
% wcp=0.15; % n/a for epi
% uwm=0.03;
% tsi1=7.5476*scalefactor;
% tsi2=1.8875*scalefactor;
% ksi=97.8; % n/a for epi
% sc=0.7175; % n/a for epi

% particle params
nparticles = 500;
ts1min = 5;         ts1max = 12; %8
ts2min = 70;        ts2max = 90; %9
ksmin = 5;          ksmax = 25;  %-11
usmin = 0.25;       usmax = 0.4; %-7
tsi1min = 10;       tsi1max = 20; %15
tsi2min = 2;        tsi2max = 5; %16
ksimin = 10;         ksimax = 70; %-9
scmin = 0.6;        scmax = 0.9; %-3
tso1min = 150;      tso1max = 200; %13
tso2min = 1;        tso2max = 3; %14
ksomin = 1.5;       ksomax = 4; %-10
usomin = 0.3;       usomax = 0.65; %-4
tw1pmin = 40;       tw1pmax = 80; %4
tw2pmin = 230;      tw2pmax = 300; %5
tw1mmin = 10;       tw1mmax = 500; %6
tw2mmin = 20;       tw2mmax = 40; %7
kwpmin = 5;         kwpmax = 10; %-13
kwmmin = 100;       kwmmax = 150; %-12
wcpmin = 0.2;       wcpmax = 0.3; %-2
uwmmin = 0.02;      uwmmax = 0.12; %-8

% initialize particles
ts1_particle = ts1min+(ts1max-ts1min)*rand(1,nparticles);
ts2_particle = ts2min+(ts2max-ts2min)*rand(1,nparticles);
ks_particle  = ksmin+(ksmax-ksmin)*rand(1,nparticles);
us_particle  = usmin+(usmax-usmin)*rand(1,nparticles);
tsi1_particle = tsi1min+(tsi1max-tsi1min)*rand(1,nparticles);
tsi2_particle = tsi2min+(tsi2max-tsi2min)*rand(1,nparticles);
ksi_particle  = ksimin+(ksimax-ksimin)*rand(1,nparticles);
sc_particle  = scmin+(scmax-scmin)*rand(1,nparticles);
tso1_particle = tso1min+(tso1max-tso1min)*rand(1,nparticles);
tso2_particle = tso2min+(tso2max-tso2min)*rand(1,nparticles);
kso_particle  = ksomin+(ksomax-ksomin)*rand(1,nparticles);
uso_particle  = usomin+(usomax-usomin)*rand(1,nparticles);
tw1p_particle = tw1pmin+(tw1pmax-tw1pmin)*rand(1,nparticles);
tw2p_particle = tw2pmin+(tw2pmax-tw2pmin)*rand(1,nparticles);
tw1m_particle = tw1mmin+(tw1mmax-tw1mmin)*rand(1,nparticles);
tw2m_particle = tw2mmin+(tw2mmax-tw2mmin)*rand(1,nparticles);
kwp_particle = kwpmin+(kwpmax-kwpmin)*rand(1,nparticles);
kwm_particle = kwmmin+(kwmmax-kwmmin)*rand(1,nparticles);
wcp_particle = wcpmin+(wcpmax-wcpmin)*rand(1,nparticles);
uwm_particle = uwmmin+(uwmmax-uwmmin)*rand(1,nparticles);

% initialize directions (not sure what to set these to!
vinit_scale = 0.00005;
ts1_v = vinit_scale*rand(1,nparticles);
ts2_v = vinit_scale*rand(1,nparticles);
ks_v = vinit_scale*rand(1,nparticles);
us_v = vinit_scale*rand(1,nparticles);
tsi1_v = vinit_scale*rand(1,nparticles);
tsi2_v = vinit_scale*rand(1,nparticles);
ksi_v = vinit_scale*rand(1,nparticles);
sc_v = vinit_scale*rand(1,nparticles);
tso1_v = vinit_scale*rand(1,nparticles);
tso2_v = vinit_scale*rand(1,nparticles);
kso_v = vinit_scale*rand(1,nparticles);
uso_v = vinit_scale*rand(1,nparticles);
tw1p_v = vinit_scale*rand(1,nparticles);
tw2p_v = vinit_scale*rand(1,nparticles);
tw1m_v = vinit_scale*rand(1,nparticles);
tw2m_v = vinit_scale*rand(1,nparticles);
kwp_v = vinit_scale*rand(1,nparticles);
kwm_v = vinit_scale*rand(1,nparticles);
wcp_v = vinit_scale*rand(1,nparticles);
uwm_v = vinit_scale*rand(1,nparticles);

% set up best storage for each particle
ts1_best = ts1_particle;
ts2_best = ts2_particle;
ks_best = ks_particle;
us_best = us_particle;
tsi1_best = tsi1_particle;
tsi2_best = tsi2_particle;
ksi_best = ksi_particle;
sc_best = sc_particle;
tso1_best = tso1_particle;
tso2_best = tso2_particle;
kso_best = kso_particle;
uso_best = uso_particle;
tw1p_best = tw1p_particle;
tw2p_best = tw2p_particle;
tw1m_best = tw1m_particle;
tw2m_best = tw2m_particle;
kwp_best = kwp_particle;
kwm_best = kwm_particle;
wcp_best = wcp_particle;
uwm_best = uwm_particle;
dist_best = 100000*ones(size(ts1_particle));

% numerical parameters
dt = 0.05;
%endtime=2000-offset;
endtime = 850;
nsteps=ceil(endtime/dt);
outputevery=1;
iout = round(outputevery/dt);
nout=ceil(endtime/outputevery);
kout=0; 

%initial values
v0=1;
w0=1;
s0=0.;

% initial values 
u=0;
v=v0;
w=w0;
s=s0;

% start a wave by initializing part of the u array to 1
%u=1;

% output
usave=zeros(nout+1,1);
vsave=zeros(nout+1,1);
wsave=zeros(nout+1,1);
ssave=zeros(nout+1,1);
usave(1,1)=u;
vsave(1,1)=v;
wsave(1,1)=w;
ssave(1,1)=s;
xfisave=zeros(nout+1,1);
xsosave=zeros(nout+1,1);
xsisave=zeros(nout+1,1);
xfisave(1,1)=0;
xsosave(1,1)=0;
xsisave(1,1)=0;
t = dt:dt:endtime;
tout = 0:outputevery:endtime;
uglobal=zeros(nout,1);
vglobal=zeros(nout,1);
wglobal=zeros(nout,1);
sglobal=zeros(nout,1);
xfiglobal=zeros(nout,1);
xsiglobal=zeros(nout,1);
xsoglobal=zeros(nout,1);

period = 1000;

% first, solve the model
particle_iterations = 100
best_error = zeros(particle_iterations,1);

debug=0;

for k=1:particle_iterations

    % initial values for state variables
    u=zeros(1,nparticles);  
    v=v0*ones(1,nparticles);
    w=w0*ones(1,nparticles);
    s=s0*ones(1,nparticles);
    nsave=length(usave0);
    usave = zeros(nsave,nparticles);
    vsave = usave; wsave=usave; ssave=usave;
    xfisave=usave; xsisave=usave; xsosave=usave;
    tsave = (1:nsave)';
    ktime=0;

    % initial values
%     u=0;
%     v=1;
%     w=1.;
%     s=0;
    
    for ntime=1:nsteps
        
        istim=0;
        % note: could lengthen stimulus period e.g. 7
        if(mod(ntime,round(period/dt))<round(1/dt))
            istim=0.2;
        end
        
        % Step functions
        hthv = (u >= thv);
        hthw = (u >= thw);
        hthso = (u >= thso);
        hthsi = (u >= thsi);
        hthvm = (u >= thvm);
        htho = (u >= tho);
        hthvinf = (u >= thvinf);
        hthwinf = (u >= thwinf);
        hths = (u >= ths);
        
        % Multi-part terms
        tvm = (1-hthvm).*tv1m + hthvm.*tv2m;
        ts  = (1-hths).*ts1_particle + hths.*ts2_particle;
        to  = (1-htho).*to1 + htho.*to2;
        twp = tw1p_particle + (tw2p_particle-tw1p_particle).*(1+tanh((w-wcp_particle).*kwp_particle))/2;
        twm = tw1m_particle + (tw2m_particle-tw1m_particle).*(1+tanh((u-uwm_particle).*kwm_particle))/2;
        tso = tso1_particle + (tso2_particle-tso1_particle).*(1+tanh((u-uso_particle).*kso_particle))/2;
        tsi = tsi1_particle + (tsi2_particle-tsi1_particle).*(1+tanh((s-sc_particle).*ksi_particle))/2;
        vinf = 1-hthvinf;
        winf = (1-hthwinf).*(1-u/twinf) + hthwinf.*winfstar;

        % Gate evolution
        dv = (1-hthv).*(vinf-v)./tvm - hthv.*v./tvp;
        dw = (1-hthw).*(winf-w)./twm - hthw.*w./twp;
        ds = ((1+tanh((u-us_particle).*ks_particle))/2-s)./ts;
        v = v + dt*dv;
        w = w + dt*dw;
        s = s + dt*ds;
        
        % Currents
        xfi = -v.*hthv.*(u-thv).*(uu-u)./tfi;
        xso = (u-uo).*(1-hthso)./to + hthso./tso;
        xsi = -hthsi.*w.*s./tsi;
        
        % update u using forward Euler
        u = u - dt*(xfi + xso + xsi - istim);
        
        % save to save-array every iout time steps
        if(mod(ntime,round(1/dt))==0)
            ktime=ktime+1;
            usave(ktime,:) = u;
            vsave(ktime,:) = v;
            wsave(ktime,:) = w;
            ssave(ktime,:) = s;
            xfisave(ktime,:) = xfi;
            xsisave(ktime,:) = xsi;
            xsosave(ktime,:) = xso;            
        end
%         if(mod(ntime,iout)==0)
%             kout=kout+1;
%             usave(kout+1,1) = u;
%             vsave(kout+1,1) = v;
%             wsave(kout+1,1) = w;
%             ssave(kout+1,1) = s;
%         end
        
    end

    figure(1),subplot(2,1,1)
    plot(tsave,usave0,'k',tsave,usave,'r','linewidth',2),ylim([-0.1 1.6])
    xlabel('Time'),title(['iteration = ' num2str(k)])
    drawnow
%    q=input('press any key to continue')

    % second, measure distance as SSE for each particle
    dist=min(100000,sum((usave0-usave).^2));
%     if(debug)
%         fprintf('dist = %8.4f\n',dist);
%     end

    % third, identify local_best and global_best
    % compare each particle's current and best distance
    % if current distance is smaller, replace best params and best distance
    % then, after updating all the local bests, 
    % find index of smallest local best to identify global best
    prev_dist_best = dist_best;
    dist_best=(dist<dist_best).*dist+(dist>=dist_best).*dist_best;
     if(debug)
        fprintf('dist_best = %8.4f\n',dist_best);
     end
    % look for any problems
    change = prev_dist_best - dist_best;
    uhoh = find(change<0);
    if(~isempty(uhoh))
        fprintf('help! there is a problem in iteration %d\n',k)
    end

    figure(1),subplot(2,1,2)
    plot(prev_dist_best,'ko'),hold on, plot(dist_best,'ro'),hold off
    
    ts1_temp=(dist<prev_dist_best).*ts1_particle+(dist>=prev_dist_best).*ts1_best;
    ts2_temp=(dist<prev_dist_best).*ts2_particle+(dist>=prev_dist_best).*ts2_best;
    ks_temp=(dist<prev_dist_best).*ks_particle+(dist>=prev_dist_best).*ks_best;
    us_temp=(dist<prev_dist_best).*us_particle+(dist>=prev_dist_best).*us_best;
    tsi1_temp=(dist<prev_dist_best).*tsi1_particle+(dist>=prev_dist_best).*tsi1_best;
    tsi2_temp=(dist<prev_dist_best).*tsi2_particle+(dist>=prev_dist_best).*tsi2_best;
    ksi_temp=(dist<prev_dist_best).*ksi_particle+(dist>=prev_dist_best).*ksi_best;
    sc_temp=(dist<prev_dist_best).*sc_particle+(dist>=prev_dist_best).*sc_best;
    tso1_temp=(dist<prev_dist_best).*tso1_particle+(dist>=prev_dist_best).*tso1_best;
    tso2_temp=(dist<prev_dist_best).*tso2_particle+(dist>=prev_dist_best).*tso2_best;
    kso_temp=(dist<prev_dist_best).*kso_particle+(dist>=prev_dist_best).*kso_best;
    uso_temp=(dist<prev_dist_best).*uso_particle+(dist>=prev_dist_best).*uso_best;
    tw1p_temp=(dist<prev_dist_best).*tw1p_particle+(dist>=prev_dist_best).*tw1p_best;
    tw2p_temp=(dist<prev_dist_best).*tw2p_particle+(dist>=prev_dist_best).*tw2p_best;
    tw1m_temp=(dist<prev_dist_best).*tw1m_particle+(dist>=prev_dist_best).*tw1m_best;
    tw2m_temp=(dist<prev_dist_best).*tw2m_particle+(dist>=prev_dist_best).*tw2m_best;
    kwp_temp=(dist<prev_dist_best).*kwp_particle+(dist>=prev_dist_best).*kwp_best;
    kwm_temp=(dist<prev_dist_best).*kwm_particle+(dist>=prev_dist_best).*kwm_best;
    wcp_temp=(dist<prev_dist_best).*wcp_particle+(dist>=prev_dist_best).*wcp_best;
    uwm_temp=(dist<prev_dist_best).*uwm_particle+(dist>=prev_dist_best).*uwm_best;
    
    ts1_best=ts1_temp;
    ts2_best=ts2_temp;
    ks_best=ks_temp;
    us_best=us_temp;
    tsi1_best=tsi1_temp;
    tsi2_best=tsi2_temp;
    ksi_best=ksi_temp;
    sc_best=sc_temp;
    tso1_best=tso1_temp;
    tso2_best=tso2_temp;
    kso_best=kso_temp;
    uso_best=uso_temp;
    tw1p_best=tw1p_temp;
    tw2p_best=tw2p_temp;
    tw1m_best=tw1m_temp;
    tw2m_best=tw2m_temp;
    kwp_best=kwp_temp;
    kwm_best=kwm_temp;
    wcp_best=wcp_temp;
    uwm_best=uwm_temp;

%     if(debug)
%         [tr_best; tsi_best; twp_best; td_best; tvp_best; tv1m_best; tv2m_best; twm_best; to_best; xk_best; ucsi_best; uc_best; uv_best]
%     end
    [dist_global,ind_global]=min(dist_best(:));
    if(debug)
        fprintf('dist_global = %8.4f, ind_global = %d\n',dist_global, ind_global);
    end
    if(k>1)
        if(best_error(k-1)<dist_best(ind_global))
            fprintf('there is a problem in iteration %d\n',k)
            fprintf(' prev min dist = %f8.2\n',best_error(k-1))
            fprintf(' new min dist = %f8.2\n',dist_best(ind_global))
            fprintf(' dist_global = %f8.2\n',dist_global)
        end
    end
    ts1_global=ts1_best(ind_global);
    ts2_global=ts2_best(ind_global);
    ks_global=ks_best(ind_global);
    us_global=us_best(ind_global);
    tsi1_global=tsi1_best(ind_global);
    tsi2_global=tsi2_best(ind_global);
    ksi_global=ksi_best(ind_global);
    sc_global=sc_best(ind_global);
    tso1_global=tso1_best(ind_global);
    tso2_global=tso2_best(ind_global);
    kso_global=kso_best(ind_global);
    uso_global=uso_best(ind_global);
    tw1p_global=tw1p_best(ind_global);
    tw2p_global=tw2p_best(ind_global);
    tw1m_global=tw1m_best(ind_global);
    tw2m_global=tw2m_best(ind_global);
    kwp_global=kwp_best(ind_global);
    kwm_global=kwm_best(ind_global);
    wcp_global=wcp_best(ind_global);
    uwm_global=uwm_best(ind_global);

    % only update if the best changed on this iteration
%    u_global = usave(:,1);
    if(min(dist(:))<min(prev_dist_best(:)))
        u_global = usave(:,ind_global);
        v_global = vsave(:,ind_global);
        w_global = wsave(:,ind_global);
        s_global = ssave(:,ind_global);
        xfi_global = xfisave(:,ind_global);
        xsi_global = xsisave(:,ind_global);
        xso_global = xsosave(:,ind_global);
    end
    best_error(k)=dist_best(ind_global);
%    fprintf('iteration %d, min error = %8.2f\n',k,dist_global); 
%     fprintf('  tr=%8.3f tsi=%8.3f twp=%8.3f td=%8.3f\n',tr_global,tsi_global,twp_global,td_global);
%     fprintf('  tvp=%8.3f tv1m=%8.3f tv2m=%8.3f\n',tvp_global,tv1m_global,tv2m_global);
%     fprintf('  twm=%8.3f to=%8.3f xk=%8.3f\n',twm_global,to_global,xk_global);
%     fprintf('  ucsi=%8.3f uc=%8.3f uv=%8.3f\n',ucsi_global,uc_global,uv_global);

%     if(debug)
%         [tr_global; tsi_global; twp_global; td_global; tvp_global; tv1m_global; tv2m_global; twm_global; to_global; xk_global; ucsi_global; uc_global; uv_global]
%     end

    % fourth, update each particle
    phi_local=2.05; phi_global=2.05; phi=phi_local+phi_global;
%    chifactor = 0.05;
    chifactor = 0.25;
    chi = chifactor * 2/(phi-2+sqrt(phi*(phi-4)));
    chi_ts1 = chi*(ts1max+ts1min)/2;
    chi_ts2 = chi*(ts2max+ts2min)/2;
    chi_ks = chi*(ksmax+ksmin)/2;
    chi_us = chi*(usmax+usmin)/2;
    chi_tsi1 = chi*(tsi1max+tsi1min)/2;
    chi_tsi2 = chi*(tsi2max+tsi2min)/2;
    chi_ksi = chi*(ksimax+ksimin)/2;
    chi_sc = chi*(scmax+scmin)/2;
    chi_tso1 = chi*(tso1max+tso1min)/2;
    chi_tso2 = chi*(tso2max+tso2min)/2;
    chi_kso = chi*(ksomax+ksomin)/2;
    chi_uso = chi*(usomax+usomin)/2;
    chi_tw1p = chi*(tw1pmax+tw1pmin)/2;
    chi_tw2p = chi*(tw2pmax+tw2pmin)/2;
    chi_tw1m = chi*(tw1mmax+tw1mmin)/2;
    chi_tw2m = chi*(tw2mmax+tw2mmin)/2;
    chi_kwp = chi*(kwpmax+kwpmin)/2;
    chi_kwm = chi*(kwmmax+kwmmin)/2;
    chi_wcp = chi*(wcpmax+wcpmin)/2;
    chi_uwm = chi*(uwmmax+uwmmin)/2;
    ts1_v = chi_ts1 * (ts1_v + phi_local*rand(size(ts1_particle)) .* (ts1_best-ts1_particle) ...
        + phi_global*rand(size(ts1_particle)) .* (ts1_global-ts1_particle));
    ts2_v = chi_ts2 * (ts2_v + phi_local*rand(size(ts2_particle)) .* (ts2_best-ts2_particle) ...
        + phi_global*rand(size(ts2_particle)) .* (ts2_global-ts2_particle));
    ks_v = chi_ks * (ks_v + phi_local*rand(size(ks_particle)) .* (ks_best-ks_particle) ...
        + phi_global*rand(size(ks_particle)) .* (ks_global-ks_particle));
    us_v = chi_us * (us_v + phi_local*rand(size(us_particle)) .* (us_best-us_particle) ...
        + phi_global*rand(size(us_particle)) .* (us_global-us_particle));
    tsi1_v = chi_tsi1 * (tsi1_v + phi_local*rand(size(tsi1_particle)) .* (tsi1_best-tsi1_particle) ...
        + phi_global*rand(size(tsi1_particle)) .* (tsi1_global-tsi1_particle));
    tsi2_v = chi_tsi2 * (tsi2_v + phi_local*rand(size(tsi2_particle)) .* (tsi2_best-tsi2_particle) ...
        + phi_global*rand(size(tsi2_particle)) .* (tsi2_global-tsi2_particle));
    ksi_v = chi_ksi * (ksi_v + phi_local*rand(size(ksi_particle)) .* (ksi_best-ksi_particle) ...
        + phi_global*rand(size(ksi_particle)) .* (ksi_global-ksi_particle));
    sc_v = chi_sc * (sc_v + phi_local*rand(size(sc_particle)) .* (sc_best-sc_particle) ...
        + phi_global*rand(size(sc_particle)) .* (sc_global-sc_particle));
    tso1_v = chi_tso1 * (tso1_v + phi_local*rand(size(tso1_particle)) .* (tso1_best-tso1_particle) ...
        + phi_global*rand(size(tso1_particle)) .* (tso1_global-tso1_particle));
    tso2_v = chi_tso2 * (tso2_v + phi_local*rand(size(tso2_particle)) .* (tso2_best-tso2_particle) ...
        + phi_global*rand(size(tso2_particle)) .* (tso2_global-tso2_particle));
    kso_v = chi_kso * (kso_v + phi_local*rand(size(kso_particle)) .* (kso_best-kso_particle) ...
        + phi_global*rand(size(kso_particle)) .* (kso_global-kso_particle));
    uso_v = chi_uso * (uso_v + phi_local*rand(size(uso_particle)) .* (uso_best-uso_particle) ...
        + phi_global*rand(size(uso_particle)) .* (uso_global-uso_particle));
    tw1p_v = chi_tw1p * (tw1p_v + phi_local*rand(size(tw1p_particle)) .* (tw1p_best-tw1p_particle) ...
        + phi_global*rand(size(tw1p_particle)) .* (tw1p_global-tw1p_particle));
    tw2p_v = chi_tw2p * (tw2p_v + phi_local*rand(size(tw2p_particle)) .* (tw2p_best-tw2p_particle) ...
        + phi_global*rand(size(tw2p_particle)) .* (tw2p_global-tw2p_particle));
    tw1m_v = chi_tw1m * (tw1m_v + phi_local*rand(size(tw1m_particle)) .* (tw1m_best-tw1m_particle) ...
        + phi_global*rand(size(tw1m_particle)) .* (tw1m_global-tw1m_particle));
    tw2m_v = chi_tw2m * (tw2m_v + phi_local*rand(size(tw2m_particle)) .* (tw2m_best-tw2m_particle) ...
        + phi_global*rand(size(tw2m_particle)) .* (tw2m_global-tw2m_particle));
    kwp_v = chi_kwp * (kwp_v + phi_local*rand(size(kwp_particle)) .* (kwp_best-kwp_particle) ...
        + phi_global*rand(size(kwp_particle)) .* (kwp_global-kwp_particle));
    kwm_v = chi_kwm * (kwm_v + phi_local*rand(size(kwm_particle)) .* (kwm_best-kwm_particle) ...
        + phi_global*rand(size(kwm_particle)) .* (kwm_global-kwm_particle));
    wcp_v = chi_wcp * (wcp_v + phi_local*rand(size(wcp_particle)) .* (wcp_best-wcp_particle) ...
        + phi_global*rand(size(wcp_particle)) .* (wcp_global-wcp_particle));
    uwm_v = chi_uwm * (uwm_v + phi_local*rand(size(uwm_particle)) .* (uwm_best-uwm_particle) ...
        + phi_global*rand(size(uwm_particle)) .* (uwm_global-uwm_particle));
    
    ts1_particle = ts1_particle + ts1_v;
    ts2_particle = ts2_particle + ts2_v;
    ks_particle = ks_particle + ks_v;
    us_particle = us_particle + us_v;
    tsi1_particle = tsi1_particle + tsi1_v;
    tsi2_particle = tsi2_particle + tsi2_v;
    ksi_particle = ksi_particle + ksi_v;
    sc_particle = sc_particle + sc_v;
    tso1_particle = tso1_particle + tso1_v;
    tso2_particle = tso2_particle + tso2_v;
    kso_particle = kso_particle + kso_v;
    uso_particle = uso_particle + uso_v;
    tw1p_particle = tw1p_particle + tw1p_v;
    tw2p_particle = tw2p_particle + tw2p_v;
    tw1m_particle = tw1m_particle + tw1m_v;
    tw2m_particle = tw2m_particle + tw2m_v;
    kwp_particle = kwp_particle + kwp_v;
    kwm_particle = kwm_particle + kwm_v;
    wcp_particle = wcp_particle + wcp_v;
    uwm_particle = uwm_particle + uwm_v;
    
%     if(debug)
%         [tr_particle; tsi_particle; twp_particle; td_particle; tvp_particle; tv1m_particle; tv2m_particle; twm_particle; to_particle; xk_particle; ucsi_particle; uc_particle; uv_particle]
%     end

% check for any updated param being out of bounds
    ts1_particle = (ts1_particle<ts1max).*ts1_particle + (ts1_particle>=ts1max).*(ts1min+0.75*(ts1max-ts1min)*rand(1,nparticles));
    ts1_particle = (ts1_particle>ts1min).*ts1_particle + (ts1_particle<=ts1min).*(ts1min+0.25*(ts1max-ts1min)+0.75*(ts1max-ts1min)*rand(1,nparticles));
    ts2_particle = (ts2_particle<ts2max).*ts2_particle + (ts2_particle>=ts2max).*(ts2min+0.75*(ts2max-ts2min)*rand(1,nparticles));
    ts2_particle = (ts2_particle>ts2min).*ts2_particle + (ts2_particle<=ts2min).*(ts2min+0.25*(ts2max-ts2min)+0.75*(ts2max-ts2min)*rand(1,nparticles));
    ks_particle = (ks_particle<ksmax).*ks_particle + (ks_particle>=ksmax).*(ksmin+0.75*(ksmax-ksmin)*rand(1,nparticles));
    ks_particle = (ks_particle>ksmin).*ks_particle + (ks_particle<=ksmin).*(ksmin+0.25*(ksmax-ksmin)+0.75*(ksmax-ksmin)*rand(1,nparticles));
    us_particle = (us_particle<usmax).*us_particle + (us_particle>=usmax).*(usmin+0.75*(usmax-usmin)*rand(1,nparticles));
    us_particle = (us_particle>usmin).*us_particle + (us_particle<=usmin).*(usmin+0.25*(usmax-usmin)+0.75*(usmax-usmin)*rand(1,nparticles));
    tsi1_particle = (tsi1_particle<tsi1max).*tsi1_particle + (tsi1_particle>=tsi1max).*(tsi1min+0.75*(tsi1max-tsi1min)*rand(1,nparticles));
    tsi1_particle = (tsi1_particle>tsi1min).*tsi1_particle + (tsi1_particle<=tsi1min).*(tsi1min+0.25*(tsi1max-tsi1min)+0.75*(tsi1max-tsi1min)*rand(1,nparticles));
    tsi2_particle = (tsi2_particle<tsi2max).*tsi2_particle + (tsi2_particle>=tsi2max).*(tsi2min+0.75*(tsi2max-tsi2min)*rand(1,nparticles));
    tsi2_particle = (tsi2_particle>tsi2min).*tsi2_particle + (tsi2_particle<=tsi2min).*(tsi2min+0.25*(tsi2max-tsi2min)+0.75*(tsi2max-tsi2min)*rand(1,nparticles));
    ksi_particle = (ksi_particle<ksimax).*ksi_particle + (ksi_particle>=ksimax).*(ksimin+0.75*(ksimax-ksimin)*rand(1,nparticles));
    ksi_particle = (ksi_particle>ksimin).*ksi_particle + (ksi_particle<=ksimin).*(ksimin+0.25*(ksimax-ksimin)+0.75*(ksimax-ksimin)*rand(1,nparticles));
    sc_particle = (sc_particle<scmax).*sc_particle + (sc_particle>=scmax).*(scmin+0.75*(scmax-scmin)*rand(1,nparticles));
    sc_particle = (sc_particle>scmin).*sc_particle + (sc_particle<=scmin).*(scmin+0.25*(scmax-scmin)+0.75*(scmax-scmin)*rand(1,nparticles));
    tso1_particle = (tso1_particle<tso1max).*tso1_particle + (tso1_particle>=tso1max).*(tso1min+0.75*(tso1max-tso1min)*rand(1,nparticles));
    tso1_particle = (tso1_particle>tso1min).*tso1_particle + (tso1_particle<=tso1min).*(tso1min+0.25*(tso1max-tso1min)+0.75*(tso1max-tso1min)*rand(1,nparticles));
    tso2_particle = (tso2_particle<tso2max).*tso2_particle + (tso2_particle>=tso2max).*(tso2min+0.75*(tso2max-tso2min)*rand(1,nparticles));
    tso2_particle = (tso2_particle>tso2min).*tso2_particle + (tso2_particle<=tso2min).*(tso2min+0.25*(tso2max-tso2min)+0.75*(tso2max-tso2min)*rand(1,nparticles));
    kso_particle = (kso_particle<ksomax).*kso_particle + (kso_particle>=ksomax).*(ksomin+0.75*(ksomax-ksomin)*rand(1,nparticles));
    kso_particle = (kso_particle>ksomin).*kso_particle + (kso_particle<=ksomin).*(ksomin+0.25*(ksomax-ksomin)+0.75*(ksomax-ksomin)*rand(1,nparticles));
    uso_particle = (uso_particle<usomax).*uso_particle + (uso_particle>=usomax).*(usomin+0.75*(usomax-usomin)*rand(1,nparticles));
    uso_particle = (uso_particle>usomin).*uso_particle + (uso_particle<=usomin).*(usomin+0.25*(usomax-usomin)+0.75*(usomax-usomin)*rand(1,nparticles));
    tw1p_particle = (tw1p_particle<tw1pmax).*tw1p_particle + (tw1p_particle>=tw1pmax).*(tw1pmin+0.75*(tw1pmax-tw1pmin)*rand(1,nparticles));
    tw1p_particle = (tw1p_particle>tw1pmin).*tw1p_particle + (tw1p_particle<=tw1pmin).*(tw1pmin+0.25*(tw1pmax-tw1pmin)+0.75*(tw1pmax-tw1pmin)*rand(1,nparticles));
    tw2p_particle = (tw2p_particle<tw2pmax).*tw2p_particle + (tw2p_particle>=tw2pmax).*(tw2pmin+0.75*(tw2pmax-tw2pmin)*rand(1,nparticles));
    tw2p_particle = (tw2p_particle>tw2pmin).*tw2p_particle + (tw2p_particle<=tw2pmin).*(tw2pmin+0.25*(tw2pmax-tw2pmin)+0.75*(tw2pmax-tw2pmin)*rand(1,nparticles));
    tw1m_particle = (tw1m_particle<tw1mmax).*tw1m_particle + (tw1m_particle>=tw1mmax).*(tw1mmin+0.75*(tw1mmax-tw1mmin)*rand(1,nparticles));
    tw1m_particle = (tw1m_particle>tw1mmin).*tw1m_particle + (tw1m_particle<=tw1mmin).*(tw1mmin+0.25*(tw1mmax-tw1mmin)+0.75*(tw1mmax-tw1mmin)*rand(1,nparticles));
    tw2m_particle = (tw2m_particle<tw2mmax).*tw2m_particle + (tw2m_particle>=tw2mmax).*(tw2mmin+0.75*(tw2mmax-tw2mmin)*rand(1,nparticles));
    tw2m_particle = (tw2m_particle>tw2mmin).*tw2m_particle + (tw2m_particle<=tw2mmin).*(tw2mmin+0.25*(tw2mmax-tw2mmin)+0.75*(tw2mmax-tw2mmin)*rand(1,nparticles));
    kwp_particle = (kwp_particle<kwpmax).*kwp_particle + (kwp_particle>=kwpmax).*(kwpmin+0.75*(kwpmax-kwpmin)*rand(1,nparticles));
    kwp_particle = (kwp_particle>kwpmin).*kwp_particle + (kwp_particle<=kwpmin).*(kwpmin+0.25*(kwpmax-kwpmin)+0.75*(kwpmax-kwpmin)*rand(1,nparticles));
    kwm_particle = (kwm_particle<kwmmax).*kwm_particle + (kwm_particle>=kwmmax).*(kwmmin+0.75*(kwmmax-kwmmin)*rand(1,nparticles));
    kwm_particle = (kwm_particle>kwmmin).*kwm_particle + (kwm_particle<=kwmmin).*(kwmmin+0.25*(kwmmax-kwmmin)+0.75*(kwmmax-kwmmin)*rand(1,nparticles));
    wcp_particle = (wcp_particle<wcpmax).*wcp_particle + (wcp_particle>=wcpmax).*(wcpmin+0.75*(wcpmax-wcpmin)*rand(1,nparticles));
    wcp_particle = (wcp_particle>wcpmin).*wcp_particle + (wcp_particle<=wcpmin).*(wcpmin+0.25*(wcpmax-wcpmin)+0.75*(wcpmax-wcpmin)*rand(1,nparticles));
    uwm_particle = (uwm_particle<uwmmax).*uwm_particle + (uwm_particle>=uwmmax).*(uwmmin+0.75*(uwmmax-uwmmin)*rand(1,nparticles));
    uwm_particle = (uwm_particle>uwmmin).*uwm_particle + (uwm_particle<=uwmmin).*(uwmmin+0.25*(uwmmax-uwmmin)+0.75*(uwmmax-uwmmin)*rand(1,nparticles));
    
%     if(debug)
%         [tr_particle; tsi_particle; twp_particle; td_particle; tvp_particle; tv1m_particle; tv2m_particle; twm_particle; to_particle; xk_particle; ucsi_particle; uc_particle; uv_particle]
%     end
    
%     figure(2)
%     subplot(3,1,1)
%     plot(a_particle,'ro'),hold on,plot(amax*ones(size(a_particle)),'k'),plot(amin*ones(size(a_particle)),'k'),hold off
%     subplot(3,1,2)
%     plot(b_particle,'ro'),hold on,plot(bmax*ones(size(b_particle)),'k'),plot(bmin*ones(size(b_particle)),'k'),hold off
%     subplot(3,1,3)
%     plot(eps_particle,'ro'),hold on,plot(epsmax*ones(size(eps_particle)),'k'),plot(epsmin*ones(size(eps_particle)),'k'),hold off

end

fprintf('min error = %8.2f\n',dist_global); 

% space-time plot
figure(2)
plot(usave)
%pcolor(tout,xx,usave'),shading interp,xlabel('Time (ms)','fontsize',16),ylabel('Space (cm)','fontsize',16)

fprintf('ts1 = %8.4f, ts2 = %8.4f, ks=%8.4f, us = %8.4f\n',ts1_global, ts2_global, ks_global,us_global)
fprintf('tsi1 = %8.4f, tsi2 = %8.4f, ksi=%8.4f, sc = %8.4f\n',tsi1_global, tsi2_global, ksi_global,sc_global)
fprintf('tso1 = %8.4f, tso2 = %8.4f, kso=%8.4f, uso = %8.4f\n',tso1_global, tso2_global, kso_global,uso_global)
fprintf('tw1p = %8.4f, tw2p = %8.4f, tw1m=%8.4f, tw2m = %8.4f\n',tw1p_global, tw2p_global, tw1m_global, tw2m_global)
fprintf('kwp = %8.4f, kwm = %8.4f, wcp =%8.4f, uwm = %8.4f\n',kwp_global, kwm_global, wcp_global, uwm_global)

figure(3)
%global_error_check = sum((usave0-u_global).^2);
subplot(2,1,1)
plot(tsave,usave0,'k',tsave,u_global,'r','linewidth',2),ylim([-0.1 1.6])
%plot(tsave,usave0,'k',tsave,u_global,'b',tsave,usave1,'r','linewidth',2),ylim([-0.1 1.6])
xlabel('Time'),title(['iteration = ' num2str(k)])

subplot(2,1,2)
plot(best_error,'ko')
xlabel('Iteration'),ylabel('Error')

% space-time plot
figure(4)
subplot(3,1,1)
plot(tsave,u_global,'linewidth',2)
subplot(3,1,2)
plot(tsave,v_global,'b',tsave,w_global,'r',tsave,s_global,'c','linewidth',2)
legend('v','w','s'),legend boxoff
subplot(3,1,3)
plot(tsave,xfi_global,'c',tsave,xsi_global,'r',tsave,xso_global,'b','linewidth',2)
legend('xfi','xsi','xso'),legend boxoff

