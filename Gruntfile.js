module.exports = function(grunt) {

    grunt.initConfig({
      clean: {
        dev: {
          src: ['img/*.jpg'],
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
            cwd: 'img_src/',
            src: ['*.{gif,jpg,png}'],
            dest: 'img/'
          }]
        }
      }
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-responsive-images');
  
    grunt.registerTask('default', ['clean', 'responsive_images']);
  };
  