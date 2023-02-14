% FHN model in 0d

% parameter values (guinea pig)
% alpha=0.0142;
% beta=1.0759;
% eps=0.0072;
% mu=0.5176;
% gamma=0.1906;
% theta=-0.06;
% delta=1;

alpha=0.014;
beta=1.076;
eps=0.007;
mu=0.518;
gamma=0.191;
theta=-0.06;
delta=1;

% this function should give stimulus value from time in ms
%stimscale = 0.35*180;
stimscale = 0.1*200;
stimdur = 2;
offset1 = 7;
offset2 = offset1*.96;
tscale = 0.725;
f = @(t) -stimscale*(t/tscale-offset1)./(1+(t/tscale-offset2).^4);



% % parameter values (rabbit)
% alpha=0.0258;
% beta=1.0682;
% eps=0.0139;
% mu=0.5151;
% gamma=0.2115;
% theta=-0.014;
% delta=1;

% initial values
% u = 0.25;
u = 0.0;
% v = 0.05;
v = 0.0;

% numerical parameters
dt = .1;
endtime = 3000;
nsteps=ceil(endtime/dt);
usave = zeros(nsteps+1,1);
vsave = zeros(nsteps+1,1);
dusave = zeros(nsteps+1,1);
dvsave = zeros(nsteps+1,1);
usave(1,1) = u;
vsave(1,1) = v;
t = 0:dt:endtime;

period = 320;
iperiod = round(period/dt);

for ntime=1:nsteps
    
     if(mod(ntime,iperiod)==0)
%           u=0.25;
     end

      istim=0;
     steps_since_new_cycle = mod(ntime,period/dt);
      if(steps_since_new_cycle<stimdur/dt)
          istim = f(steps_since_new_cycle*dt);
      end

%     du=mu*u.*(1-u).*(u-alpha)-u.*v;
    du=istim + mu*u.*(1-u).*(u-alpha)-u.*v;
    dv=eps*((beta-u).*(u-gamma)-delta*v-theta);
    
    u = u + dt*du;
    v = v + dt*dv;
    
    usave(ntime+1,1) = u;
    vsave(ntime+1,1) = v;
    dusave(ntime+1,1) = du;
    dvsave(ntime+1,1) = dv;
end

figure(3)
subplot(2,1,1)
plot(t,usave,'k',t,vsave,'r','linewidth',2)
legend('u','v'), legend boxoff
subplot(2,1,2)
plot(t,dusave,'k',t,dvsave,'r','linewidth',2)
legend('du','dv'), legend boxoff
xlabel('Time')

% %%
% figure(2)
% eps=0.1;
% %subplot(2,1,2)
% uu=-0.5:.01:1.2;
% hold off
% plot(usave,vsave,'r','linewidth',2)
% hold on
% % plot nullclines
% plot(uu,(a1/a4)*(a2-uu).*(uu-a3),'k','linewidth',1)
% plot(zeros(size(uu)),uu,'k','linewidth',1)
% plot(uu,a5*uu.*(beta-uu),'k--','linewidth',1)
% xlabel('u'),ylabel('v')
% % define a coarse grid (will also be axis limits here)
% umin=-0.2; umax = 1.2;
% vmin = -0.05; vmax = 0.25;
% axis ([umin umax vmin vmax])
% % now calculate the derivatives at each corase grid point 
% % and add to the plot a line originating at the grid point 
% % in the direction of the vector (du/dt , dv/dt)
% scale = 0.2;
% for u = umin: 0.025: umax;
%     for v = vmin: 0.01: vmax;
%         du=ctime*(a1*u.*(a2-u).*(u-a3)-a4*v.*u);
%         dv=ctime*eps*(a5*u.*(beta-u)-v);
%         plot([u u+scale*du], [v v+scale*dv],'b','linewidth',0.2)
%     end 
% end
% 
% hold off

%%
% a1=0.7;
% a2=1.05;
% a3=0.07;
% a4=1;
% a5=0.8;
% beta=1.07; % 1.07
% eps=0.01;
% ctime=1;
dudt = @(u,v) ctime*(a1*u.*(a2-u).*(u-a3)-a4*v.*u);
dvdt = @(u,v) ctime*eps*(a5*u.*(beta-u)-v);

% derivatives
%du/dt = a1*u*(a2*u-u^2-a2*a3+a3*u)-a4*u*v
%du/dt f(u,v) = a1*a2*u^2-a1*u^3-a1*a2*a3*u+a1*a3*u^2-a4*u*v
%dv/dt g(u,v) = eps*a5*beta*u-eps*a5*u^2-eps*v
% so the Jacobian analytical form is
%[ 2*a1*(a2+a3)*u - 3*a1*u^2 - a1*a2*a3 - a4*v     -a4*u]
%[ eps*a5*beta - 2*eps*a5*u                        -eps]
% at 0,0 get 
%[ -a1*a2*a3      0]
%[ eps*a5*beta -eps]
% so the eigenvalues should be -eps and -a1*a2*a3

umin=-0.2; umax=1.2;
vmin=-0.05; vmax=0.25;
u=umin:0.025*.5:umax;
v=vmin:0.01*.5:vmax;

[uu,vv]=ndgrid(u,v);
%[uu,vv]=ndgrid(u,v);
%[yy,xx]=ndgrid(x,y);
%[xx,yy]=ndgrid(y,x);

% figure(4),clf
% hold on
% include nullclines (if you know them)
% plot(u,(a1/a4)*(a2-u).*(u-a3),'r','linewidth',1)
% plot(zeros(size(v)),v,'r','linewidth',1)
% plot(u,a5*u.*(beta-u),'b','linewidth',1)
%hold on
% plot fixed point (if you know them)
%plot([-1],[0],'co','markersize',10)
% arrowscale = 4;
% quiver(uu,vv,dudt(uu,vv),dvdt(uu,vv),arrowscale,'linewidth',1,'color','k');
% grid on
% plot(usave(round(end/2):end),vsave(round(end/2):end),'g')
% add trajectories (you may need to calculate e.g. with forward Euler
% tmax=1000;
% [tout1,xout1]=ode45(@(t,x) [x(1)+exp(-x(2)); -x(2)],[0 tmax],[0.5; 2]);
% [tout2,xout2]=ode45(@(t,x) [x(1)+exp(-x(2)); -x(2)],[0 tmax],[-1; 1]);
% [tout3,xout3]=ode45(@(t,x) [x(1)+exp(-x(2)); -x(2)],[0 tmax],[-2; -2]);
% plot(xout1(:,1),xout1(:,2),'g',xout2(:,1),xout2(:,2),'g',xout3(:,1),xout3(:,2),'g')
% ylim([vmin vmax])
hold off