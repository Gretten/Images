let gulp = require('gulp');
let imagemin = require('gulp-imagemin');
let imageminJpegRecompress = require('imagemin-jpeg-recompress');
let pngquant = require('imagemin-pngquant');
let cache = require('gulp-cache');
let spritesmith = require('gulp.spritesmith');
let resizer = require('gulp-images-resizer');
let cheerio = require('gulp-cheerio');

// **** Control panel **** //

let padding = 30,
    width = 50,
    height = 50

// **** ************* **** //


// Images optimization and copy in /dist
gulp.task('images', function() {
    return gulp.src('app/img/*')
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality: 'medium'
            }),
            imagemin.svgo(),
            imagemin.optipng({ optimizationLevel: 3 }),
            pngquant({ quality: '65-70', speed: 5 })
        ], {
            verbose: true
        })))
        .pipe(gulp.dest('dist/images'));
});

// Clearing the cache
gulp.task('clear', function(done) {
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
        .pipe(gulp.dest('dist/resized'));
});

gulp.task('links', function() {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($, file) {

            $('a').each(function() {
                this.attribs.href = "";
            });
            
            $('script').each(function() {
              let reg = /[^\/]*(\.js|\.css)/gi;
              let attr = this.attribs.src;
                if(attr && ~attr.indexOf('js')) {
                  let clean = attr.match(reg)[0];
                  this.attribs.src = 'js/' + clean;
                } else {
                  console.log('Неверный формат: ' + attr);
                }
            });

            $('link').each(function() {
              let reg = /[^\/]*(\.js|\.css)/gi;
              let attr = this.attribs.href;
                if(attr && ~attr.indexOf('css')) {
                  let clean = attr.match(reg)[0];
                  this.attribs.href = 'css/' + clean;
                } else {
                  console.log('Неверный формат: ' + attr);
                }
            });
        }))
        .pipe(gulp.dest('dist/html'));
});