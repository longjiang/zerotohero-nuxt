#!/usr/bin/env python
import nose
nose.run(['nosetests', '-s', '--with-coverage', '--cover-erase', '--cover-package=korean', '-d'])