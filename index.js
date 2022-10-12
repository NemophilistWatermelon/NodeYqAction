const fetch = require("axios");
const cheerio = require("cheerio");

class Request {
  constructor(headers) {
    this.headers = headers;
  }

  get(url, cb) {
    fetch({
      url,
      headers: this.headers,
    }).then((data) => {
      cb(data);
    });
  }
}

class ReadAndWriteFile {
  constructor() {
    this.fs = require("fs");
    this.filePath = require("path");
  }

  writeFile(data, fileName) {
    this.fs.writeFileSync(fileName, data, "utf-8");
  }

  isHasFile(fileName) {
    let path = this.filePath.resolve(fileName);
    console.log(path);
    return this.fs.existsSync(path);
  }

  readfile(fileName) {
    return this.fs.readFileSync(this.filePath.resolve(fileName), "utf-8");
  }
}

class GetNowDate {
  constructor() {
    this.date = new Date();
  }
  pinZero(num) {
    return num < 10 ? 0 + num : num;
  }
  nowFormatDate() {
    const year = this.pinZero(this.date.getFullYear());
    const month = this.pinZero(this.date.getMonth() + 1);
    const day = this.pinZero(this.date.getDate());
    return `${this.pinZero(year)}-${this.pinZero(month)}-${this.pinZero(day)}`;
  }
}

class LoadHtmlAndFenXi {
  constructor() {
    this.timeService = new GetNowDate();
    this.fileService = new ReadAndWriteFile();
  }
  loadSecondHtml(html, url) {
    let data = cheerio.load(html);
    const result = data("#content p").text();
    const orginText = data("#source").text();
    const fetchTime = new Date().toLocaleString();
    console.log("run");
    const strData = {
      result: result,
      dataOrgin: orginText,
      fetchTime,
      url,
    };
    this.fileService.writeFile(JSON.stringify(strData, null, 2), "result.json");
  }

  loadHtml(html) {
    let data = cheerio.load(html);
    let urlbox = data(".list-box ul");
    let children = urlbox.children();
    let arr = Array.from(children);
    let $ = cheerio.load(arr[0]);
    const result = $("li a").attr("href");
    this.findService(result);
  }

  findService(url) {
    this.requestService = new GetYiQing();
    console.log(url);
    this.requestService.fetchSecondFileHtml(url);
  }

  getData() {}
}

class GetYiQing {
  constructor() {
    const headers = {
      "User-Agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36`,
    };

    this.fileService = new ReadAndWriteFile();

    this.request = new Request(headers);

    this.dateService = new GetNowDate();

    this.loadHtmlService = new LoadHtmlAndFenXi();
  }

  fetchSecond(data, url) {
    const htmlFileName = "second.html";
    this.fileService.writeFile(data.data, htmlFileName);
    this.loadHtmlService.loadSecondHtml(
      this.fileService.readfile(htmlFileName),
      url
    );
  }

  fetchSecondFileHtml(url) {
    let that = this;
    this.request.get(url, (data) => {
      that.fetchSecond(data, url);
    });
  }

  fetchResultAndWrite(data) {
    const fileName = "henanProvice.html";
    this.fileService.writeFile(data.data, fileName);
    this.loadHtmlService.loadHtml(this.fileService.readfile(fileName));
  }
  fetch_index_provice() {
    const url = "https://www.henan.gov.cn/zt/2020zt/xxgzbdfyyqqk/yqtb/";
    let that = this;
    this.request.get(url, (data) => {
      that.fetchResultAndWrite(data);
    });
  }

  init() {
    console.log("服务运行。。。。");
    this.fetch_index_provice();
  }
}

new GetYiQing().init();
