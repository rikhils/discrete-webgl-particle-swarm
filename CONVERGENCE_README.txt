This is not exactly a good pipeline. Will try to clean up later!

Right now this works as follows:

1.
	Run PSO on the convergence branch

2.	
	Open the javacript console with f12 or ctrl+shift+i

3.
	At the end of the output should be "Parameter values each iteration:"
	and "Particle error each iteration:", each followed by an object
	dumped to console. Right-click the object after the "values" line and
	select "Copy object". Then paste that to a text file and save it
	as "convergence_data.json" in the same directory as convergence.py

4.
	Right-click -> copy object on the "error" object and paste it into a text
	file. Save that file as "error_data.json" in the same directory.

5.
	In convergence.py make sure things are set up for what you want. Right now
	that's done by just commenting / uncommenting blocks of code for
	parameter lists and such. Should be obvious, it's not a very long code.

	When I have a spare moment I'll make that slightly more pythonic and just
	make a simple flag you can change.

6.
	Same thing as 5 but for what's being plotted. Right now I'm leaving it as
	just the animated violin plot. Again, will make this cleaner in the
	next couple days.

7.
	Run convergence.py


Speaking of cleaning up, I think it might also make sense to integrate this
stuff into the main branch, just gated by some "Debug" flag which is off by
default. Once we're finishing the main PSO paper (and moving on to
the 'population PSO' thing and hopefully a second paper), we'll likely want
access to all this data again.