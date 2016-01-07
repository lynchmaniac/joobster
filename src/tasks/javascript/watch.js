"use strict";
const Task = require("./task");
const logger = require("../../logger");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const _ = require("lodash");
const watch = require('gulp-watch');
const FileHelper = require("../../helpers/file-helper");
const foreach = require('gulp-foreach');


module.exports = class WatchJs extends Task {

  constructor(option) {
    super(option);
    this.name = Task.watchPrefixe + this.name;
    this.taskDepends = [];
    
    this.defaultOption.srcFilter = FileHelper.concatDirectory([this.defaultOption.base, this.defaultOption.dir, this.defaultOption.fileFilter]);
    this.defaultOption.mapSrcFolder = this.defaultOption.outdirMap;

  }

  task(gulp) {
    return () => {
      logger.debug("Activation de watch JavaScript pour transpilation avec Babel");
      logger.debug(this.defaultOption.srcFilter);
      logger.debug(this.defaultOption.base);
      
      let gulpResult = gulp.src(this.defaultOption.srcFilter, {
            base: this.defaultOption.base
      });

      gulpResult = gulpResult.pipe(watch(this.defaultOption.srcFilter, {base: this.defaultOption.base},
        (watchEvent) => {
          logger.debug("File ", watchEvent.path, " state ", watchEvent.event || "init");
        }));
      gulpResult = gulpResult.pipe(foreach((stream, file) => {
        // Activation de la génération des sources maps
        stream = stream.pipe(sourcemaps.init());
        // Activation de la transpilation JavaScript
        stream = stream.pipe(babel(this.defaultOption.compile));
        stream = stream.pipe(sourcemaps.write(this.defaultOption.mapSrcFolder));
        stream = stream.pipe(gulp.dest(this.defaultOption.outdir));
        return stream;
      }));
      gulpResult.on("error", function (err) {
        logger.error("Erreur '", err.name, "' dans le fichier '", err.fileName, "' ligne <", (err.loc && err.loc.line) || "unknow"  , "> colonne <", (err.loc && err.loc.column) || "unknow" , ">.");
        logger.info("Erreur : ", err);
      });
    };
  }
};