close all
udata = importdata('ap220b_adjusted.dat');

unorm = udata/max(udata);
plot(unorm, 'LineWidth',3,'Color','red');
xlabel('Time (ms)','FontSize',28);
ylabel('Scaled Voltage','FontSize',18);


set(gca, 'units', 'normalized'); %Just making sure it's normalized
Tight = get(gca, 'TightInset');  %Gives you the bording spacing between plot box and any axis labels
                                 %[Left Bottom Right Top] spacing
NewPos = [Tight(1) Tight(2) 1-Tight(1)-Tight(3) 1-Tight(2)-Tight(4)]; %New plot position [X Y W H]
set(gca, 'Position', NewPos);
grid on
a = get(gca,'XTickLabel');
set(gca,'XTickLabel',a,'FontSize',18)
grid on
saveas(gca,'mask22.jpg');