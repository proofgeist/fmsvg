const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const pd = require("pretty-data").pd;

const pathIn = process.argv[2];

const shapes = ["path", "rect", "ellipse", "polygon", "circle"];
const fixElement = icon => {
  icon("title").remove();
  icon("desc").remove();
  icon("defs").remove();
  for (let shape of shapes) {
    let element = icon(shape);
    element.attribs = {};
    element.addClass("fm_fill").attr("fill", "#ccc");
    return icon;
  }
};

let files;
const isFolder = fs.lstatSync(pathIn).isDirectory();
const isFile = fs.lstatSync(pathIn).isFile();
if (isFolder) {
  const fileNames = fs
    .readdirSync(pathIn)
    .toString()
    .split(",");

  files = fileNames.map(name => {
    return pathIn + name;
  });
} else if (isFile) {
  files = pathIn;
}

files.forEach(filePath => {
  const newFilePath = path.parse(filePath);

  if (newFilePath.ext !== ".svg") {
    return;
  }

  const svg = fs.readFileSync(filePath).toString();
  let parsedSVG = cheerio.load(svg);

  parsedSVG = fixElement(parsedSVG);

  //rip out svg from body
  parsedSVG = parsedSVG("body").html();

  // remove garbage and comments
  parsedSVG = pd.xmlmin(parsedSVG);
  //reformat
  parsedSVG = pd.xml(parsedSVG);

  const newFolder = path.resolve(newFilePath.dir, "../fm-icons");

  if (!fs.existsSync(newFolder)) {
    fs.mkdirSync(newFolder);
  }
  const pathOut = path.resolve(newFolder, newFilePath.base);

  fs.writeFileSync(pathOut, parsedSVG);
});
