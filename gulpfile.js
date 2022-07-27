const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function scss_compress() {
    return src('app/scss/style.scss')
        .pipe(scss({
            outputStyle: 'compressed'
        }).on('error', scss.logError))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function watch_scss() {
    watch(['app/js/**/*.js', '!app/js/script.min.js'], js_compress);
    watch(['app/scss/**/*.scss'], scss_compress);
    watch(['app/*.html']).on('change', browserSync.reload);
}

function browser_sync() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });
}

function clean_dist() {
    return del('dist');
}

function js_compress() {
    return src(['node_modules/jquery/dist/jquery.js',
            'app/js/*.js'
        ])
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function img_compress() {
    return src('app/images/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.mozjpeg({
                    quality: 70,
                    progressive: true
                }),
                imagemin.optipng({
                    optimizationLevel: 5
                }),
                imagemin.svgo({
                    plugins: [{
                            removeViewBox: true
                        },
                        {
                            cleanupIDs: false
                        }
                    ]
                })
            ]
        ))
        .pipe(dest('dist/images'));
}

function build() {
    img_compress();
    return src(['app/css/style.min.css',
            'app/css/reset.min.css',
            'app/js/script.min.js',
            'app/*.html',
            'app/fonts/**/*'
        ], {
            base: 'app'
        })
        .pipe(dest('dist'));
}


exports.watch = parallel(browser_sync, watch_scss);
exports.build = series(clean_dist, build);