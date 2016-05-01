module.exports = function(grunt) {
  'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
      options: {
        sourcemap: 'none',
        style: 'expanded'
      },
			dist: {
				files: {
          'dist/css/neutron.css' : 'app/sass/neutron.scss',
          'dist/css/neutron-mac.css' : 'app/sass/mac/mac.scss',
          'dist/css/neutron-linux.css' : 'app/sass/linux/linux.scss',
          'dist/css/neutron-windows.css' : 'app/sass/windows/windows.scss',
          'dist/css/neutron-walaa.css' : 'app/sass/neutron-walaa/walaa.scss'
				}
			}
		},
		watch: {
			css: {
				files: '**/*.scss',
				tasks: ['sass']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['watch']);
}
