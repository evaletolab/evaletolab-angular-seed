
BRUNCH = ./node_modules/.bin/brunch


clean:
	rm -f build --production

syncprod:
	cp app/assets/robots.txt.prod build/robots.txt
	cd build && rsync -avu --delete -e 'ssh -p22' . evaleto@evaletolab.ch:www/cms.evaletolab.ch/

syncdev:
	cp app/assets/robots.txt.devel build/robots.txt
	cd build && rsync -avu --delete -e 'ssh -p22' . evaleto@evaletolab.ch:www/cms.evaletolab.ch/

devel:
	$(BRUNCH) build --production
	cp app/assets/robots.txt.devel build/robots.txt
	cd build && rsync -avu --delete -e 'ssh -p22' . evaleto@evaletolab.ch:www/cms.evaletolab.ch/

prod:
	$(BRUNCH) build --production
	cp app/assets/robots.txt.prod build/robots.txt
	cd build && rsync -avu --delete -e 'ssh -p22' . evaleto@evaletolab.ch:www/cms.evaletolab.ch/



.PHONY: docs clean publish
