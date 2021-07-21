% Fenton-Karma 3-variable model in 0d
set(0,'defaultlinelinewidth',2)
set(0,'defaultaxesfontsize',14)

% parameter values
tvp=3.33;
tv1m=19.6;
tv2m=1250.;
twp=870.0;
twm=41.0;
td=0.25;
to=12.5;
tr=33.33;
tsi=29.0;
xk=10.0;
ucsi=0.85;
uc=0.13;
uv=0.04;

% Guinea Pig parameter set from FentonKarma98
% tvp=10;
% tv1m=40;
% tv2m=333;
% twp=1000;
% twm=65;
% td=1/8.7;
% to=12.5;    % same as for BR
% tr=25;
% tsi=22;
% xk=10;      % same as for BR
% ucsi=0.85;  % same as for BR
% uc=0.13;    % same as for BR
% uv=0.025;

% stimulation period and strength
%period=320.0;
%period=500.0;
period=340.;
%stimmag=0.66;
%stimmag=0.148*2;
% this function should give stimulus value from time in ms
%stimscale = 0.35*180;
stimscale = 0.4;
stimdur = 10;
offset1 = 7;
offset2 = offset1*.96;
tscale = 0.725;
f = @(t) -stimscale*(t/tscale-offset1)./(1+(t/tscale-offset2).^4);

% initial values 
u=0.0;
v=0.95;
w=0.95;
%  v=1;
%  w=1;
% v=0.95;
% w=0.7;

% numerical parameters
dt = 0.02; % size of time step in ms
nbeats=20;
endtime=nbeats*period;
%endtime = 5000; % length of simulation in ms
nsteps=ceil(endtime/dt);

% vectors for saving data to plot
usave = zeros(nsteps+1,1);
vsave = zeros(nsteps+1,1);
wsave = zeros(nsteps+1,1);
usave(1,1) = u;
vsave(1,1) = v;
wsave(1,1) = w;

jfisave = zeros(nsteps+1,1);
jsisave = zeros(nsteps+1,1);
jsosave = zeros(nsteps+1,1);
jfisave(1,1) = 0;
jsisave(1,1) = 0;
jsosave(1,1) = 0;
t = 0:nsteps;
t=t*dt;

for ntime=1:nsteps
    
    p=0; % heaviside functions
    q=0;
    if(u>=uc)
        p=1;
    end
    if(u>=uv)
        q=1.;
    end
    dv=(1.-p)*(1.-v)/((1.-q)*tv1m+tv2m*q) - p*v/tvp;
    dw=(1.-p)*(1.-w)/twm - p*w/twp;
    v=v+dt*dv; % solving/updating v and w
    w=w+dt*dw;
    jfi=-v*p*(u-uc)*(1.-u)/td;
    jso=u*(1.-p)/to+p/tr;
    jsi=-w*(1.+tanh(xk*(u-ucsi)))/(2.*tsi);
    
    % stimulus
    istim=0;
    steps_since_new_cycle = mod(ntime,period/dt);
    if(steps_since_new_cycle<stimdur/dt)
        istim = f(steps_since_new_cycle*dt);
    end
    
    u=u - (jfi+jso+jsi-istim)*dt; % updating/integrating u
    
    usave(ntime+1,1) = u;
    vsave(ntime+1,1) = v;
    wsave(ntime+1,1) = w;
    
    jfisave(ntime+1,1) = jfi;
    jsisave(ntime+1,1) = jsi;
    jsosave(ntime+1,1) = jso;
    
end

figure(1)
subplot(3,1,1)
plot(t,usave,'k','linewidth',2),ylim([0 1.2])
legend('u'),legend boxoff

subplot(3,1,2)
plot(t,vsave,'r',t,wsave,'b','linewidth',2)
legend('v','w'),legend boxoff

subplot(3,1,3)
plot(t,jfisave,'r',t,jsisave,'g',t,jsosave,'b','linewidth',2)
xlabel('Time (ms)')
legend('J_{fi}','J_{si}','J_{so}'),legend boxoff

