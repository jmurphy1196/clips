import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }
    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File): Promise<string[]> {
    const data = await fetchFile(file);
    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach((sec) => {
      commands.push(
        //input
        '-i',
        file.name,
        //output options
        '-ss',
        `00:00:${sec <= 9 ? '0' + sec : sec}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=510:-1',
        //output
        `output_${sec}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach((sec) => {
      const screenshotFile = this.ffmpeg.FS('readFile', `output_${sec}.png`);
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });
      const screenshotURL = URL.createObjectURL(screenshotBlob);
      screenshots.push(screenshotURL);
    });

    return screenshots;
  }
  async blobFromURL(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  }
}
