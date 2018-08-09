module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      dev: {
        src: ['dist/*'],
      }
    },
    copy: {
      dev: {
        files: [
          { expand: true, cwd: 'app/', src: ['sw.js'], dest: 'dist/'},
          { expand: true, cwd: 'app/', src: ['css/*'], dest: 'dist/' },
          { expand: true, cwd: 'app/', src: ['js/*'], dest: 'dist/'},
          { expand: true, cwd: 'app/', src: ['img/fixed/*'], dest: 'dist/' }
        ]
      }
    },
    'string-replace': {
      dist: {
        files: [{
          expand: true, cwd: 'app/', src: ['*.html'], dest: 'dist/'
        }],
        options: {
          replacements: [{
            pattern: '<API_KEY_HERE>',
            replacement: '<%= grunt.file.read("GM_API_KEY") %>'
          }]
        }
      }
    },
    responsive_images: {
      dev: {
        options: {
          engine: 'gm',
          sizes: [
            {
              width: 300,
              quality: 40
            },
            {
              width: 400,
              quality: 40
            },
            {
              width: 600,
              quality: 40,
              suffix: '_2x'
            },
            {
              width: 800,
              quality: 40,
              suffix: '_2x'
            }
          ]
        },
        files: [{
          expand: true,
          cwd: 'app/img/',
          src: ['*.{gif,jpg,png}'],
          dest: 'dist/img/'
        }]
      }
    }
  });
    
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-responsive-images');
  
  grunt.registerTask('quick', ['copy', 'string-replace']);

  grunt.registerTask('default', ['clean', 'copy', 'string-replace', 'responsive_images']);
};
  