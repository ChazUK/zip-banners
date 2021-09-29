#!/usr/bin/env node

const { readdirSync, statSync, createWriteStream, mkdir } = require("fs");
const { join } = require("path");
const rimraf = require("rimraf");
const archiver = require("archiver");
const chalk = require("chalk");
const ora = require("ora");

const dest = "delivery";
const regex = /[\d]{1,4}x[\d]{1,4}/;

const dirs = (path) =>
  readdirSync(path)
    .filter((f) => statSync(join(path, f)).isDirectory())
    .filter((f) => f.match(regex));

const run = () => {
  console.log(chalk.yellow(`Zipping Banners`));
  del();
};

const del = () => {
  const spinner = ora(`Removing delivery folder`).start();
  rimraf(`./${dest}`, function () {
    spinner.succeed();
    findCreatives();
  });
};

const findCreatives = () => {
  const spinner = ora(`Finding Creatives`).start();
  const directories = dirs("./");

  if (directories.length > 0) {
    spinner.succeed(`Found ${directories.length} creatives`);
    createDir();
    directories.forEach((dir) => zipFolder(dir));
    return;
  }

  spinner.fail(`No creatives found`);

  console.log(
    chalk.yellow(
      `Make sure that your creative folder name contains the banner dimensions 000x000`
    )
  );
};

const createDir = (dir) => {
  const spinner = ora(`Creating delivery directory`).start();
  mkdir(join(dest), { recursive: true }, (err) => {
    if (err) {
      spinner.fail();
    } else {
      spinner.succeed();
    }
  });
};

const zipFolder = (dir) => {
  // const spinner = ora(`Creating zip for ${dir}.zip`).start();
  var output = createWriteStream(join(`./${dest}/${dir}.zip`), {
    recursive: true,
  });
  var archive = archiver("zip");

  output.on("close", function () {
    const size = archive.pointer() / 1024;
    ora(`Created zip for ${dir}.zip`).succeed();
    // spinner.succeed(`Created ./${dest}/${dir}.zip ${size.toFixed(2)}kb`);
  });

  archive.on("error", function (err) {
    // spinner.fail();
    throw err;
  });

  archive.pipe(output);
  archive.glob("**/*", {
    cwd: join(dir),
    ignore: [".*"],
  });
  //   archive.directory(join(dir), false);
  archive.finalize();
};

run();
