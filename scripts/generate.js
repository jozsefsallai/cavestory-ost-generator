const fs = require('fs-extra');
const path = require('path');
const fc = require('filecompare');
const { remote } = require('electron');

const progressDiv = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const currentTask = document.querySelector('.current-task');
const percentage = document.querySelector('.percentage');

class OSTGenerator {
  constructor(opts) {
    this.gameLocation = opts.gameLocation;
    this.dict = opts.dict;
    this.dataPath = path.join(opts.gameLocation, 'data', 'base');
    this.appPath = remote.app.getAppPath();
    this.counter = 0;
    this.total = Object.keys(opts.dict).length;
  }

  async asyncForEach(arr, callback) {
    for (let i = 0; i < arr.length; i++) {
      await callback(arr[i], i, arr);
    }
  }

  changeProgress(progress, total, str = null) {
    const percent = Math.floor(progress * 100 / total);
    
    progressBar.style.width = `${percent}%`;
    percentage.innerHTML = percent;

    if (str) {
      currentTask.innerHTML = str;
    }
  }

  getName(key, type) {
    if (key === 'lastbtl') {
      return 'lastbtl.ogg';
    }

    return `${key}_${type}.ogg`;
  }

  isSame(src, dest) {
    return new Promise(resolve => {
      return fc(src, dest, check => resolve(check));
    });
  }

  async createBackup() {
    return new Promise(async (resolve, reject) => {
      this.changeProgress(0, 1, 'Creating backup...');
  
      if (fs.existsSync(path.join(this.dataPath, 'Ogg11_Backup'))) {
        console.log('Backup already exists, no need to recreate it!');
        this.changeProgress(1, 1);
        return resolve();
      }
  
      try {
        await fs.copy(path.join(this.dataPath, 'Ogg11'), path.join(this.dataPath, 'Ogg11_Backup'));
        this.changeProgress(1, 1);
        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  async handleRemasteredTrack(key) {
    this.changeProgress(this.counter, this.total, `Processing ${key}, target: remastered...`);

    return new Promise(async (resolve, reject) => {
      const originalIntro = path.join(this.dataPath, 'Ogg11_Backup', this.getName(key, 'intro'));
      const currentIntro = path.join(this.dataPath, 'Ogg11', this.getName(key, 'intro'));

      const isIntroSame = await this.isSame(originalIntro, currentIntro);

      if (isIntroSame) {
        return resolve();
      }

      const originalLoop = path.join(this.dataPath, 'Ogg11_Backup', this.getName(key, 'loop'));
      const currentLoop = path.join(this.dataPath, 'Ogg11', this.getName(key, 'loop'));

      const isLoopSame = await this.isSame(originalLoop, currentLoop);

      if (isLoopSame) {
        return resolve();
      }

      try {
        fs.copyFileSync(originalIntro, currentIntro);
        fs.copyFileSync(originalLoop, currentLoop);

        console.log(`${key}: copying`);

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  async handleOrganya(key) {
    this.changeProgress(this.counter, this.total, `Processing ${key}, target: organya...`);

    return new Promise(async (resolve, reject) => {
      const organyaIntro = path.join(this.appPath, 'data', 'org', this.getName(key, 'intro'));
      const currentIntro = path.join(this.dataPath, 'Ogg11', this.getName(key, 'intro'));

      const isIntroSame = await this.isSame(organyaIntro, currentIntro);

      if (isIntroSame) {
        return resolve();
      }

      const organyaLoop = path.join(this.appPath, 'data', 'org', this.getName(key, 'loop'));
      const currentLoop = path.join(this.dataPath, 'Ogg11', this.getName(key, 'loop'));

      const isLoopSame = await this.isSame(organyaLoop, currentLoop);

      if (isLoopSame) {
        return resolve();
      }

      try {
        fs.copyFileSync(organyaIntro, currentIntro);
        fs.copyFileSync(organyaLoop, currentLoop);

        console.log(`${key}: copying`);

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  async handlePlus(key) {
    this.changeProgress(this.counter, this.total, `Processing ${key}, target: new...`);

    return new Promise(async (resolve, reject) => {
      const plusLoop = path.join(this.dataPath, 'Ogg', `${key}.ogg`);
      const currentLoop = path.join(this.dataPath, 'Ogg11', this.getName(key, 'loop'));

      const isSame = await this.isSame(plusLoop, currentLoop);

      if (isSame) {
        return resolve();
      }

      try {
        const intro = path.join(this.appPath, 'data', 'org', 'intro.ogg');
        const targetIntro = path.join(this.dataPath, 'Ogg11', this.getName(key, 'intro'));

        fs.copyFileSync(intro, targetIntro);
        fs.copyFileSync(plusLoop, currentLoop);

        console.log(`${key}: copying`);

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  async processTracks() {
    const tracks = Object.keys(this.dict);

    await this.asyncForEach(tracks, async key => {
      this.counter++;

      try {
        switch (this.dict[key]) {
          case 0:
            await this.handleRemasteredTrack(key);
            break;
          case 1:
            await this.handleOrganya(key);
            break;
          case 2:
            await this.handlePlus(key);
            break;
        }
      } catch (err) {
        return err;
      }
    });
  }

  async start() {
    progressDiv.classList.add('visible');

    await this.createBackup();
    await this.processTracks();

    progressDiv.classList.remove('visible');
  }
};

module.exports = OSTGenerator;
