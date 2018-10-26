let gulp = require('gulp');
let imagemin = require('gulp-imagemin');
let imageminJpegRecompress = require('imagemin-jpeg-recompress');
let pngquant = require('imagemin-pngquant');
let cache = require('gulp-cache');
let spritesmith = require('gulp.spritesmith');
let resizer = require('gulp-images-resizer');
let cheerio = require('gulp-cheerio');
let entities = require('gulp-html-entities');
let clean = require('gulp-clean');


let padding = 30,
    width   = 50,
    height  = 50



// Images optimization and copy in /dist
gulp.task('images', function() {
    return gulp.src('app/img/*.*')
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

// Clearing /dist folder
gulp.task('cleand', function() {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
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

function pathHandler() {
    let attrs = this.attribs;
    let check = /\.(jpg|png|jpeg|gif|svg)/gi;
    let reg = /[^\/]*(\.jpg|\.jpeg|\.png|\.gif|\.svg|\.css|\.js)/gi;
    if (attrs.src) {

        if (~attrs.src.indexOf('.js')) {
            let clean = attrs.src.match(reg)[0];
            this.attribs.src = 'js/' + clean;
        } else if (~attrs.src.search(check)) {
            let clean = attrs.src.match(reg)[0];
            this.attribs.src = 'img/' + clean;
        } else {
            console.log('Ошибка в ' + attrs.src)
        }

    } else if (attrs.href) {
        if (~attrs.href.indexOf('.css')) {
            let clean = attrs.href.match(reg)[0];
            this.attribs.href = 'css/' + clean;
        } else {
            console.log('Ошибка в ' + attrs.href)
        }
    }
}

gulp.task('a', () => {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($) {
            $('a').each(function() {
                this.attribs.href = "";
            });
        }))
        .pipe(entities('decode'))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('form', () => {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($) {
            $('form').each(function() {
                this.attribs.action = "";
            });
        }))
        .pipe(entities('decode'))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('css', () => {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($) {
            $('link').each(function() {
                pathHandler.call(this);
            });
        }))
        .pipe(entities('decode'))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('script', () => {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($) {
            $('script').each(function() {
                pathHandler.call(this);
            });
        }))
        .pipe(entities('decode'))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('img', () => {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($) {
            $('img').each(function() {
                pathHandler.call(this);
            });
        }))
        .pipe(entities('decode'))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('links', () => {
    return gulp
        .src(['app/html/*.html'])
        .pipe(cheerio(function($) {
            $('img').each(function() {
                pathHandler.call(this);
            });
            $('script').each(function() {
                pathHandler.call(this);
            });
            $('link').each(function() {
                pathHandler.call(this);
            });
            $('a').each(function() {
                this.attribs.href = "";
            });
            $('form').each(function() {
                this.attribs.action = "";
            });
        }))
        .pipe(entities('decode'))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('all', ['a', 'img'], () => {
    console.log('Done');
})


// Each file will be run through cheerio and each corresponding `$` will be passed here.
// `file` is the gulp file object