let gulp = require('gulp');
let imagemin = require('gulp-imagemin'); 
let imageminJpegRecompress = require('imagemin-jpeg-recompress');
let pngquant = require('imagemin-pngquant');
let cache = require('gulp-cache');
let spritesmith = require('gulp.spritesmith');
let resizer = require('gulp-images-resizer');

// **** Control panel **** //
let padding = 30,
    width = 50,
    height = 50
// **** ************* **** //

// Images optimization and copy in /dist
gulp.task('images', function() {
  return gulp.src('app/img/*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imageminJpegRecompress({
        loops: 5,
        min: 65,
        max: 70,
        quality:'medium'
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: '65-70', speed: 5})
    ],{
      verbose: true
    })))
    .pipe(gulp.dest('dist/images'));
});

// Clearing the cache
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

  // Options: https://github.com/twolfson/gulp.spritesmith
  gulp.task('sprite', () => {
    let spriteData =
      gulp.src('app/img/sprites/*.*') 
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        padding: padding,
        algorithm: 'binary-tree',
    }));
    spriteData.img.pipe(gulp.dest('dist/sprite'));
    spriteData.css.pipe(gulp.dest('dist/sprite'));
  })
  
  gulp.task('resize', function() {
      return gulp.src('app/img/resize/*.*')
          .pipe(resizer({
              width: width,
              height: height
          }))
      .pipe(gulp.dest('dest/resized'));
  });